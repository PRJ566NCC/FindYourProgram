import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7d";

export async function POST(req) {
  try {
    if (!JWT_SECRET) {
      return NextResponse.json({ message: "Server misconfigured" }, { status: 500 });
    }

    const body = await req.json();
    const username = (body.username || "").trim();
    const password = body.password || "";

    if (!username) {
      return NextResponse.json({ message: "Username is required." }, { status: 400 });
    }
    if (!password) {
      return NextResponse.json({ message: "Password is required." }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const users = db.collection("users");

    const user = await users.findOne({ username });

    if (!user) {
      return NextResponse.json({ message: "Invalid username or password." }, { status: 401 });
    }

    // 🔒 NEW SAFEGUARD — Block login for pending accounts
    if (!user.isApproved) {
      return NextResponse.json(
        { message: "Your account is pending approval by an administrator." },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid username or password." }, { status: 401 });
    }

    const tokenPayload = {
      userId: user._id.toString(),
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin || false,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    const response = NextResponse.json({ message: "Login successful" }, { status: 200 });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Login error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export const runtime = "nodejs";
