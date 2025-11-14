import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

function getIdentity(req) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token || !JWT_SECRET) return null;
  try {
    const d = jwt.verify(token, JWT_SECRET);
    return { userId: d.userId || d.sub, username: d.username || null };
  } catch {
    return null;
  }
}

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

    const identity = getIdentity(req);
    if (!identity?.userId) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { db } = await connectToDatabase();

    const existing = await db.collection("ratings").findOne({
      programName,
      universityName,
      location,
      userId: identity.userId,
    });

    if (existing) {
      return NextResponse.json(
        { error: "You have already rated this program." },
        { status: 400 }
      );
    }

    await db.collection("ratings").insertOne({
      programName,
      universityName,
      location,
      rating,
      userId: identity.userId,
      username: identity.username || null,
      createdAt: new Date(),
    });

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
      return NextResponse.json({
        rating: 0,
        count: 0,
        userHasRated: false,
        userRating: null,
      });
    }

    const avgRating =
      ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length;

    const identity = getIdentity(req);
    let userHasRated = false;
    let userRating = null;

    if (identity?.userId) {
      const userRatingDoc = ratings.find(
        (r) => r.userId === identity.userId
      );
      if (userRatingDoc) {
        userHasRated = true;
        userRating = userRatingDoc.rating || null;
      }
    }

    return NextResponse.json({
      rating: avgRating,
      count: ratings.length,
      userHasRated,
      userRating,
    });
  } catch (err) {
    console.error("Error in GET /api/ratings:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export const runtime = "nodejs";
