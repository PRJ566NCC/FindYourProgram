// app/api/register/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    const body = await req.json();
    const username = (body.username || "").trim();
    const name = (body.name || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    if (!username || username.length < 3) return NextResponse.json({ message: "Invalid username." }, { status: 400 });
    if (!name) return NextResponse.json({ message: "Full name required." }, { status: 400 });
    if (!/\S+@\S+\.\S+/.test(email)) return NextResponse.json({ message: "Invalid email." }, { status: 400 });
    if (!password || password.length < 6) return NextResponse.json({ message: "Password too short." }, { status: 400 });

    const { db } = await connectToDatabase();

    const existing = await db.collection("users").findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return NextResponse.json({ message: "User already exists." }, { status: 409 });
    }
    
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = {
      username,
      name,
      email,
      passwordHash,
      createdAt: new Date(),

      favorites: [],
      searchHistory: [],
      ratings: [],
      donations: [],
      sponsorships: [],
      reports: []
    };

    const result = await db.collection("users").insertOne(newUser);

    return NextResponse.json({ message: "Registration successful", userId: result.insertedId }, { status: 201 });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
