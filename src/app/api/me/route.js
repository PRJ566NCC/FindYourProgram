import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/lib/mongodb";

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req) {
  try {
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // if token is available, connect to db
    const { db } = await connectToDatabase();
    
    // find the user using decoded.username
    const userFromDb = await db.collection("users").findOne(
      { username: decoded.username },
      { projection: { password: 0, confirmPassword: 0, passwordHash: 0 } } //neglect the pwd.
    );

    if (!userFromDb) {
      // no user exist in db, return ERROR
      console.error(`User '${decoded.username}' not found in database.`);
      return NextResponse.json({ authenticated: false, user: null }, { status: 404 });
    }

    // return the shape AuthProvider expects
    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: userFromDb._id.toString(),
          username: userFromDb.username,
          email: userFromDb.email,
          name: userFromDb.name,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("JWT verification failed:", err);
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }
}

export const dynamic = "force-dynamic";
