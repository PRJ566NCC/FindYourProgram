// app/api/ratings/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";

// GET: Fetch rating for a specific program
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const programName = searchParams.get("programName");
    const universityName = searchParams.get("universityName");
    const location = searchParams.get("location");

    if (!programName || !universityName || !location) {
      return NextResponse.json({ message: "Missing parameters" }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const ratingDoc = await db.collection("ratings").findOne({
      programName,
      universityName,
      location,
    });

    return NextResponse.json({ rating: ratingDoc?.rating || 0 }, { status: 200 });
  } catch (err) {
    console.error("GET /api/ratings error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// POST: Save or update a rating
export async function POST(req) {
  try {
    const body = await req.json();
    const { programName, universityName, location, rating } = body;

    if (!programName || !universityName || !location || !rating) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    await db.collection("ratings").updateOne(
      { programName, universityName, location },
      { $set: { rating } },
      { upsert: true }
    );

    return NextResponse.json({ message: "Rating saved successfully" }, { status: 200 });
  } catch (err) {
    console.error("POST /api/ratings error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export const runtime = "nodejs";
