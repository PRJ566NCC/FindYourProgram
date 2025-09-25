import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import bcrypt from "bcryptjs";

/**
 * POST /api/register
 *
 * Handles new user registration with validation, duplicate checks,
 * and secure password hashing. Uses explicit duplicate detection for
 * better UX (409 Conflict), while relying on MongoDB unique indexes
 * for race-safety against concurrent requests.
 */
export async function POST(req) {
  try {
    // --- Parse and sanitize input ---
    const body = await req.json();
    const username = (body.username || "").trim();
    const name = (body.name || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    // --- Basic validation ---
    if (!username || username.length < 3) {
      return NextResponse.json({ message: "Invalid username." }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ message: "Full name required." }, { status: 400 });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ message: "Invalid email." }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ message: "Password too short." }, { status: 400 });
    }

    // --- DB setup ---
    const { db } = await connectToDatabase();
    const users = db.collection("users");

    // --- Duplicate checks (clear error messages for UX) ---
    const existing = await users.findOne({
      $or: [{ email }, { username }]
    });

    if (existing) {
      if (existing.email === email) {
        return NextResponse.json({ message: "Email already in use." }, { status: 409 });
      }
      if (existing.username === username) {
        return NextResponse.json({ message: "Username already taken." }, { status: 409 });
      }
    }

    // --- Hash password ---
    const passwordHash = await bcrypt.hash(password, 14);

    // --- Build user document ---
    const newUser = {
      username,
      name,
      email,
      passwordHash,
      createdAt: new Date(),
      favorites: [],
      searchHistory: [],
      ratings: [],
      reports: []
    };

    // --- Insert new user ---
    // At this point, we've already checked duplicates.
    // If two requests still slip in concurrently, a unique index on email/username
    // will enforce safety (the second will error).
    const result = await users.insertOne(newUser);

    return NextResponse.json(
      { message: "Registration successful", userId: result.insertedId },
      { status: 201 }
    );

  } catch (err) {
    // Handle duplicate key error from MongoDB (E11000) gracefully
    if (err.code === 11000) {
      if (err.keyPattern?.email) {
        return NextResponse.json({ message: "Email already in use." }, { status: 409 });
      }
      if (err.keyPattern?.username) {
        return NextResponse.json({ message: "Username already taken." }, { status: 409 });
      }
    }

    console.error("Register error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// Explicitly specify runtime for Next.js Edge / Node.js environments
export const runtime = "nodejs";
