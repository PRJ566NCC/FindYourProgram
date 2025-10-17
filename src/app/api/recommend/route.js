import { NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/mongodb";
import Groq from 'groq-sdk';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

let programDataCache = null;

function loadProgramData() {
  if (programDataCache) return programDataCache;
  try {
    const filePath = path.join(process.cwd(), 'data', 'programs.xlsx');
    const fileBuffer = fs.readFileSync(filePath);
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

// ensures this route runs in a Node.js environment
export const runtime = 'nodejs';

/** Extract userId from auth_token cookie */
function getUserIdFromRequest(request) {
  try {
    const cookie = request.headers.get("cookie") || "";
    const match = cookie.match(/(?:^|;)\s*auth_token=([^;]+)/);
    if (!match) return null;
    const token = decodeURIComponent(match[1]);
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const id = payload?.userId || payload?.sub || payload?.id || null;
    return id && ObjectId.isValid(id) ? id : null;
  } catch {
    return null;
  }
}

export async function POST(req) {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not set.");
    }

    const userPreferences = await req.json();
    const allPrograms = loadProgramData();

    const relevantPrograms = allPrograms.filter(program => {
      let isMatch = true;
      if (userPreferences.field && program.areaOfStudy &&
          !program.areaOfStudy.toLowerCase().includes(userPreferences.field.toLowerCase())) {
        isMatch = false;
      }
      if (userPreferences.location && program.location &&
          !program.location.toLowerCase().includes(userPreferences.location.toLowerCase())) {
        isMatch = false;
      }
      return isMatch;
    }).slice(0, 20);

    if (relevantPrograms.length === 0) {
      return NextResponse.json({ message: "No matching programs found in the local file to analyze." }, { status: 404 });
    }

    const prompt = `
      You are an expert university academic advisor. Based on the user's preferences and a pre-filtered list of programs, recommend the top 3 in Ontario.
      For each chosen item, return "matchPercentage" (integer 0–100) and "facultyName".
      User Preferences: ${JSON.stringify(userPreferences, null, 2)}
      Pre-filtered List: ${JSON.stringify(relevantPrograms.map(p => ({
        programName: p.programName,
        universityName: p.universityName,
        description: p.description,
      })), null, 2)}
      Respond only with JSON in this format:
      { "recommendations": [ { "programName": "", "universityName": "", "matchPercentage": 0, "facultyName": "" } ] }
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const llmResponse = chatCompletion.choices[0]?.message?.content;
    const parsedResponse = JSON.parse(llmResponse);

    if (!parsedResponse.recommendations) {
      throw new Error("AI response format is incorrect.");
    }

    const { db } = await connectToDatabase();

    // ⬇️ Minimal change: include facultyName
    const recommendations = parsedResponse.recommendations
      .map(r => ({
        programName: r.programName,
        universityName: r.universityName,
        matchPercentage: r.matchPercentage,
        facultyName: r.facultyName, // <-- store faculty
      }))
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 3);

    // Attach userId when available
    const uid = getUserIdFromRequest(req);

    await db.collection("searchResults").insertOne({
      createdAt: new Date(),
      preferences: userPreferences,
      recommendations,
      ...(uid ? { userId: new ObjectId(uid) } : {}),
    });

    // Keep response shape identical (array of recommendations)
    return NextResponse.json(parsedResponse.recommendations, { status: 200 });
  } catch (error) {
    console.error("API Error in /api/recommend:", error);
    return NextResponse.json({ message: error.message || "An error occurred." }, { status: 500 });
  }
}
