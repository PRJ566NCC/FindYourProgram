import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req) {
  try {
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    return NextResponse.json(
      { authenticated: true, user: decoded },
      { status: 200 }
    );
  } catch (err) {
    console.error("JWT verification failed:", err);
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}
