import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";

const JWT_SECRET = process.env.JWT_SECRET || "";

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
  const id = getIdentity(req);
  if (!id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { newPassword, confirmPassword } = await req.json();

  if (!newPassword || !confirmPassword) {
    return NextResponse.json({ message: "Both password fields are required" }, { status: 400 });
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ message: "Password must be at least 6 characters long." }, { status: 400 });
  }
  if (newPassword !== confirmPassword) {
    return NextResponse.json({ message: "Passwords do not match." }, { status: 400 });
  }

  const { db } = await connectToDatabase();
  const users = db.collection("users");

  const user = id.userId
    ? await users.findOne({ _id: new ObjectId(id.userId) })
    : await users.findOne({ username: id.username });
  if (!user) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const hash = await bcrypt.hash(newPassword, 10);
  await users.updateOne({ _id: user._id }, { $set: { passwordHash: hash } });

  return NextResponse.json({ message: "Password updated" }, { status: 200 });
}
