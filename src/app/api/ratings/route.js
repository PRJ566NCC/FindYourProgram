// app/api/ratings/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";

// --- POST: add new rating ---
export async function POST(req) {
  try {
    const body = await req.json();
    const { programName, universityName, location, rating } = body;

    if (!programName || !universityName || !rating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // ✅ Store new rating
    await db.collection("ratings").insertOne({
      programName,
      universityName,
      location,
      rating,
      createdAt: new Date(),
    });

    // ✅ Recalculate average
    const ratings = await db
      .collection("ratings")
      .find({ programName, universityName, location })
      .toArray();

    const avgRating =
      ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length;

    return NextResponse.json({
      success: true,
      averageRating: avgRating,
      totalRatings: ratings.length,
    });
  } catch (err) {
    console.error("Error in POST /api/ratings:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// --- GET: fetch average rating ---
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const programName = searchParams.get("programName");
    const universityName = searchParams.get("universityName");
    const location = searchParams.get("location");

    if (!programName || !universityName) {
      return NextResponse.json(
        { error: "Missing required query parameters" },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    const ratings = await db
      .collection("ratings")
      .find({ programName, universityName, location })
      .toArray();

    if (ratings.length === 0) {
      return NextResponse.json({ rating: 0, count: 0 });
    }

    const avgRating =
      ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length;

    return NextResponse.json({
      rating: avgRating,
      count: ratings.length,
    });
  } catch (err) {
    console.error("Error in GET /api/ratings:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export const runtime = "nodejs";
