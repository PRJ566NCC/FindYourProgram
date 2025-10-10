// src/app/api/recommend/route.js

import { NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/mongodb";
import Groq from 'groq-sdk';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

let programDataCache = null;

function loadProgramData() {
  if (programDataCache) {
    return programDataCache;
  }
  try {
    const filePath = path.join(process.cwd(), 'data', 'programs.xlsx');
    
    // 1. Use Node's 'fs' module to read the file into a buffer
    const fileBuffer = fs.readFileSync(filePath);

    // 2. Use XLSX.read() to parse the buffer, instead of XLSX.readFile()
    const workbook = XLSX.read(fileBuffer, { type: 'buffer' });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const jsonData = XLSX.utils.sheet_to_json(worksheet); 
    
    programDataCache = jsonData;
    console.log("Excel data loaded and cached successfully using fs.");
    return programDataCache;

  } catch (error) {
    console.error("Error reading or parsing Excel file with fs:", error);
    throw new Error("Could not load program data.");
  }
}

//ensures your route runs in a full Node.js environment
export const runtime = 'nodejs';

export async function POST(req) {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not set.");
    }

    const userPreferences = await req.json();

    // 1. load and cache Excel data
    const allPrograms = loadProgramData();

    // 2. excel data filtering
    const relevantPrograms = allPrograms.filter(program => {
      let isMatch = true;
      if (userPreferences.field && program.areaOfStudy && !program.areaOfStudy.toLowerCase().includes(userPreferences.field.toLowerCase())) {
        isMatch = false;
      }
      if (userPreferences.location && program.location && !program.location.toLowerCase().includes(userPreferences.location.toLowerCase())) {
        isMatch = false;
      }
      // TODO: additional filtering for tuition, duration, etc.
      return isMatch;
    }).slice(0, 20);

    if (relevantPrograms.length === 0) {
      return NextResponse.json({ message: "No matching programs found in the local file to analyze." }, { status: 404 });
    }

    // 3. send to Groq LLM for ranking and explanation
    const prompt = `
      You are an expert university academic advisor. Based on the user's preferences and a pre-filtered list of programs, recommend the top 3. 
      For each chosen item, return a single field  "matchPercentage" as an integer 0–100 (percentage fit). Higher is better.

      User Preferences: ${JSON.stringify(userPreferences, null, 2)}
      Pre-filtered Program List: ${JSON.stringify(relevantPrograms.map(p => ({ programName: p.programName, universityName: p.universityName, description: p.description })), null, 2)}

      IMPORTANT: Your response must be ONLY a valid JSON array of objects, inside a single root object with a key named "recommendations". Do not include any markdown.
      The JSON format must be:
      {
        "recommendations": [
          { "programName": "...", "universityName": "...", "matchPercentage": 0}
        ]
      }
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const llmResponse = chatCompletion.choices[0]?.message?.content;
    console.log('Groq raw reply:', llmResponse);
    const parsedResponse = JSON.parse(llmResponse);

    if (!parsedResponse.recommendations) {
        throw new Error("AI response format is incorrect.");
    }

    const { db } = await connectToDatabase();
    const recommendations = parsedResponse.recommendations
    .map(r => ({
      programName: r.programName,
      universityName: r.universityName,
      matchPercentage:  r.matchPercentage,
    }))
    .sort((a, b) => b.matchPercentage - a.matchPercentage)
    .slice(0, 3);

    // Insert into MongoDB
    await db.collection("searchResults").insertOne({
      createdAt: new Date(),
      preferences: userPreferences,
      recommendations,
    });
        

    return NextResponse.json(parsedResponse.recommendations, { status: 200 });

  } catch (error) {
    console.error("API Error in /api/recommend:", error);
    return NextResponse.json({ message: error.message || "An error occurred." }, { status: 500 });
  }
}