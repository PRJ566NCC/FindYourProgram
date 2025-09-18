// app/api/login/route.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Use an environment variable for the secret key
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key";
const JWT_EXPIRES_IN = "7d"; // Token lifespan

export async function POST(req) {
  try {
    const body = await req.json();
    const username = (body.username || "").trim();
    const password = body.password || "";

    // Validate input
    if (!username) {
      return NextResponse.json({ message: "Username is required." }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ message: "Password is required." }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    // Find user by username
    const user = await db.collection("users").findOne({ username });
    if (!user) {
      return NextResponse.json({ message: "Invalid username or password." }, { status: 401 });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid username or password." }, { status: 401 });
    }

    // Generate JWT payload
    const tokenPayload = {
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
    };

    // Sign token
    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    // Store JWT in HttpOnly cookie
    const response = NextResponse.json({ message: "Login successful" }, { status: 200 });

    response.cookies.set("auth_token", token, {
      httpOnly: true, // Cannot be accessed from JS
      secure: process.env.NODE_ENV === "production", // Only HTTPS in prod
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
