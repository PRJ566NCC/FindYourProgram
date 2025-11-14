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

// Main campus coordinates for precise map pinning (Ontario public universities)
const UNIVERSITY_COORDS = {
  // Toronto area
  "University of Toronto": { latitude: 43.6629, longitude: -79.3957 }, // St. George
  "Toronto Metropolitan University": { latitude: 43.6577, longitude: -79.3788 }, // TMU (Ryerson)
  "Ryerson University": { latitude: 43.6577, longitude: -79.3788 }, // safety alias
  "York University": { latitude: 43.7735, longitude: -79.5019 }, // Keele campus
  "OCAD University": { latitude: 43.6536, longitude: -79.3925 },

  // Waterloo / Guelph / Hamilton
  "University of Waterloo": { latitude: 43.4723, longitude: -80.5449 },
  "Wilfrid Laurier University": { latitude: 43.4733, longitude: -80.5264 },
  "University of Guelph": { latitude: 43.5314, longitude: -80.2264 },
  "McMaster University": { latitude: 43.2609, longitude: -79.9192 },

  // Ottawa region
  "Carleton University": { latitude: 45.3876, longitude: -75.6960 },
  "University of Ottawa": { latitude: 45.4231, longitude: -75.6831 },

  // London / Windsor / Niagara
  "Western University": { latitude: 43.009953, longitude: -81.273613 },
  "University of Windsor": { latitude: 42.3040, longitude: -83.0660 },
  "Brock University": { latitude: 43.1180, longitude: -79.2477 },

  // Northern & smaller universities
  "Lakehead University": { latitude: 48.4225, longitude: -89.2610 }, // Thunder Bay
  "Laurentian University": { latitude: 46.4740, longitude: -80.9730 }, // Sudbury
  "Algoma University": { latitude: 46.5289, longitude: -84.3346 }, // Sault Ste. Marie
  "Nipissing University": { latitude: 46.3430, longitude: -79.4936 }, // North Bay

  // Central / other Ontario
  "Trent University": { latitude: 44.3622, longitude: -78.2926 }, // Peterborough
  "Ontario Tech University": { latitude: 43.94024, longitude: -78.88835 }, // Oshawa
};

export async function POST(req) {
  try {
    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not set.");
    }

    const userPreferences = await req.json();

    const prompt = `
      You are an expert university academic advisor in Ontario, Canada.
      
      A student has provided these preferences. Recommend the top 3 REAL degree or diploma programs that match ALL of these criteria:
      
      Student Profile:
      - International Student: ${userPreferences.international || 'Not specified'}
      - Current Education Level: ${userPreferences.education || 'Not specified'}
      - Desired Degree Type: ${userPreferences.degree || 'Not specified'}
      - Field of Study: ${userPreferences.field || 'Not specified'}
      - Preferred Program: ${userPreferences.program || 'Not specified'}
      ${userPreferences.hasSecondary === "Yes" ? `- Secondary Program Interest: ${userPreferences.secondaryProgram}` : ""}
      ${userPreferences.hasBudget === "Yes" ? `- Maximum Tuition Budget: $${userPreferences.maxTuition} CAD per year` : "- Maximum Tuition Budget: Not specified"}
      ${userPreferences.hasLocation === "Yes" ? `- Preferred Location: ${userPreferences.location}` : "- Preferred Location: Not specified"}
      ${userPreferences.hasLiving === "Yes" ? `- Living Expense Budget: $${userPreferences.livingBudget} CAD per year` : "- Living Expense Budget: Not specified"}
      ${userPreferences.priorities && userPreferences.priorities.length > 0 ? `- Priorities: ${userPreferences.priorities.join(", ")}` : ""}
      ${userPreferences.subjects && userPreferences.subjects.length > 0 ? `- Strong Subjects: ${userPreferences.subjects.join(", ")}` : ""}

      *** CRITICAL RULES ***
      1. **University Only**: Recommend ONLY universities (e.g., U of T, Waterloo, Western, McMaster, etc.). STRICTLY EXCLUDE any Colleges.
      2. **Name Correction**: If you select "Ryerson University", you MUST output the universityName as "Toronto Metropolitan University".
      3. **Real Data**: Ensure the program names, faculties, and CITIES are actual and correct.
      4. **Location Priority**: Treat the Preferred Location as a strong filter. If a specific city is given (e.g., "Toronto"), the top recommendations must be in that city; only include nearby regions (e.g., GTA) if there are not enough exact matches, and they must have a clearly lower matchPercentage. If the preference is a region (e.g., "GTA"), do not recommend universities clearly outside that region unless they are clearly marked with a lower matchPercentage.
      5. **Budget Sensitivity**: Use the tuition and living expense budgets as strong constraints. Estimate tuition differently for domestic and international students. If a tuition or living budget is specified, programs that fit within those budgets should receive higher matchPercentage than those that exceed them. If no tuition or living budget is specified, assume the student has a high budget and you may recommend more expensive, highly ranked universities, as long as they fit the other preferences.
      6. **Inflation Adjustment to 2025**: Assume your tuition and cost-of-living knowledge is current to about 2023; increase these amounts by a reasonable inflation factor to approximate 2025 prices (for example, 5–10% higher depending on the program and location), especially for international tuition and major cities like Toronto.
      7. **Use All Inputs**: Every preference passed above (international status, education level, degree type, field, program interests, budgets, location, priorities, subjects) must directly influence which programs you choose and the matchPercentage you assign. Location and budgets should be treated as very important, alongside the fit between field/degree and the student's stated interests.
      8. **University Quality**: All else being equal, prioritize stronger and better-known universities and programs (for example, Waterloo for Computer Science, York University Schulich for Business programs, and other highly reputable Ontario universities and faculties) while still respecting the student's location and budget constraints.
      
      IMPORTANT REQUIREMENTS:
      - Only recommend programs that ACTUALLY EXIST at real Ontario universities
      - Include COMPLETE and ACCURATE details for each program
      - Find the OFFICIAL university logo image URL from the university's website
      - Programs must strongly match the student's location, budget, and academic criteria; if a program exceeds a budget or is outside the preferred location, its matchPercentage must be noticeably lower and this must be explained in the description
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
            "estimatedTuition": "approximate annual tuition in CAD for this specific student type (domestic vs international), adjusted to estimated 2025 prices (e.g., $9,000 - $13,000)",
            "description": "2-3 sentences explaining why this program matches the student's profile, including how well it fits their location and budget preferences",
            "prerequisites": "admission requirements (e.g., Ontario Secondary School Diploma, specific courses)",
            "websiteLink": "official university home page URL",
            "matchPercentage": 95,
            "latitude": 0.0, 
            "longitude": 0.0
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

    // Override latitude/longitude for known universities to precise main-campus coordinates
    const withFixedCoords = parsedResponse.recommendations.map((rec) => {
      const key = rec.universityName?.trim();
      const coords = key && UNIVERSITY_COORDS[key];
      if (coords) {
        return {
          ...rec,
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
      }
      return rec;
    });

    const recommendations = withFixedCoords
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
