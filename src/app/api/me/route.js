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

    const { db } = await connectToDatabase();
    
    const userFromDb = await db.collection("users").findOne(
      { username: decoded.username },
      { projection: { passwordHash: 0 } } // exclude password hash only
    );

    if (!userFromDb) {
      console.error(`User '${decoded.username}' not found in database.`);
      return NextResponse.json({ authenticated: false, user: null }, { status: 404 });
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: userFromDb._id.toString(),
          username: userFromDb.username,
          email: userFromDb.email,
          name: userFromDb.name,
          isAdmin: userFromDb.isAdmin || false,       
          isApproved: userFromDb.isApproved || false, 
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
