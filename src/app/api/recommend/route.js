import { NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/mongodb";
import Groq from 'groq-sdk';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const runtime = 'nodejs';

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

    const prompt = `
      You are an expert university academic advisor. Based on the user's preferences and a pre-filtered list of programs, recommend the top 3 in Ontario.
      For each chosen item, return "matchPercentage" (integer 0–100) and "facultyName" as well as the latitude and longitude of the location of the university/college.
      User Preferences: ${JSON.stringify(userPreferences, null, 2)}
      Pre-filtered List: ${JSON.stringify(relevantPrograms.map(p => ({
        programName: p.programName,
        universityName: p.universityName,
        description: p.description,
      })), null, 2)}
      Respond only with JSON in this format:
      { "recommendations": [ { "programName": "", "universityName": "", "matchPercentage": 0, "facultyName": "", "latitude": 0.0, "longitude": 0.0 } ] }
      You are an expert university academic advisor in Ontario, Canada.
      
      A student has provided these preferences. Recommend the top 3 REAL degree or diploma programs that match ALL of these criteria:
      
      Student Profile:
      - International Student: ${userPreferences.international || 'Not specified'}
      - Current Education Level: ${userPreferences.education || 'Not specified'}
      - Desired Degree Type: ${userPreferences.degree || 'Not specified'}
      - Field of Study: ${userPreferences.field || 'Not specified'}
      - Preferred Program: ${userPreferences.program || 'Not specified'}
      ${userPreferences.hasSecondary === "Yes" ? `- Secondary Program Interest: ${userPreferences.secondaryProgram}` : ""}
      ${userPreferences.hasBudget === "Yes" ? `- Maximum Tuition Budget: $${userPreferences.maxTuition} CAD per year` : ""}
      ${userPreferences.hasLocation === "Yes" ? `- Preferred Location: ${userPreferences.location}` : ""}
      ${userPreferences.hasLiving === "Yes" ? `- Living Expense Budget: $${userPreferences.livingBudget} CAD per year` : ""}
      ${userPreferences.priorities && userPreferences.priorities.length > 0 ? `- Priorities: ${userPreferences.priorities.join(", ")}` : ""}
      ${userPreferences.subjects && userPreferences.subjects.length > 0 ? `- Strong Subjects: ${userPreferences.subjects.join(", ")}` : ""}
      
      IMPORTANT REQUIREMENTS:
      - Only recommend programs that ACTUALLY EXIST at real Ontario universities
      - Include COMPLETE and ACCURATE details for each program
      - Find the OFFICIAL university logo image URL from the university's website
      - Programs must match the student's criteria
      - Provide realistic information based on your knowledge
      
      Respond ONLY with valid JSON in this exact format with ALL fields filled:
      {
        "recommendations": [
          {
            "programName": "exact official program name (e.g., B.Comm. in Accounting & Finance(Honours))",
            "universityName": "exact university name (e.g., Toronto Metropolitan University)",
            "universityLogoUrl": "direct URL to university's official logo image (e.g., https://www.torontomu.ca/content/dam/identity/logos/tmu-logo.png)",
            "universityColor": "primary brand color hex code (e.g., #004C9B)",
            "universityAccentColor": "secondary/accent color hex code (e.g., #FFD700)",
            "facultyName": "faculty or school name",
            "location": "city, Ontario",
            "degreeType": "Bachelor's/First professional degree or Diploma or Certificate",
            "areaOfStudy": "area of study (e.g., Accounting, Computer Science)",
            "language": "English or French",
            "lengthOfStudy": "duration (e.g., 4 years, 2 years)",
            "coopAvailability": "Yes or No",
            "remoteLearning": "Yes or No",
            "estimatedTuition": "approximate annual tuition in CAD (e.g., $8,000 - $12,000)",
            "description": "2-3 sentences explaining why this program matches the student's profile",
            "prerequisites": "admission requirements (e.g., Ontario Secondary School Diploma, specific courses)",
            "websiteLink": "official university program page URL",
            "matchPercentage": 95
          }
        ]
      }
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 3000,
      response_format: { type: "json_object" },
    });

    const llmResponse = chatCompletion.choices[0]?.message?.content;
    const parsedResponse = JSON.parse(llmResponse);

    if (!parsedResponse.recommendations || !Array.isArray(parsedResponse.recommendations)) {
      throw new Error("AI response format is incorrect.");
    }

    const { db } = await connectToDatabase();

    const recommendations = parsedResponse.recommendations
      .sort((a, b) => b.matchPercentage - a.matchPercentage)
      .slice(0, 3)
      .map(rec => ({
        ...rec,
        programId: encodeURIComponent(rec.programName)
      }));

    const uid = getUserIdFromRequest(req);

    const programInserts = recommendations.map(rec => ({
      ...rec,
      createdAt: new Date(),
      searchPreferences: userPreferences,
      ...(uid ? { userId: new ObjectId(uid) } : {})
    }));

    await db.collection("programs").insertMany(programInserts);

    await db.collection("searchResults").insertOne({
      createdAt: new Date(),
      preferences: userPreferences,
      recommendations,
      ...(uid ? { userId: new ObjectId(uid) } : {}),
    });

    return NextResponse.json(recommendations, { status: 200 });
    
  } catch (error) {
    console.error("API Error in /api/recommend:", error);
    return NextResponse.json({ 
      message: error.message || "An error occurred.",
      error: error.toString()
    }, { status: 500 });
  }
}