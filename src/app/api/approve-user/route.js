import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

export async function GET(req) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) {
      return new NextResponse("Invalid or missing token", { status: 400 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return new NextResponse("Approval link expired or invalid", { status: 400 });
    }

    const userId = decoded.userId;
    const { db } = await connectToDatabase();

    const users = db.collection("users");

    const user = await users.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    if (user.isApproved) {
      return new NextResponse("User is already approved.", { status: 200 });
    }

    await users.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { isApproved: true, isAdmin: true} }
    );


    // Optional: notify the user
    // sendEmail(user.email, "Your account has been approved");

    return new NextResponse(
      `
      <html>
        <body style="font-family: Arial; padding: 40px;">
          <h2>User Approved Successfully</h2>
          <p>The employee account has been approved.</p>
          <p>You may close this window.</p>
        </body>
      </html>
      `,
      {
        headers: { "Content-Type": "text/html" },
      }
    );
  } catch (err) {
    console.error("Approval error:", err);
    return new NextResponse("Server error", { status: 500 });
  }
}

export const runtime = "nodejs";
