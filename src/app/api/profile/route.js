import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";

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

export async function GET(req) {
  const id = getIdentity(req);
  if (!id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { db } = await connectToDatabase();
  const users = db.collection("users");
  const user = id.userId
    ? await users.findOne({ _id: new ObjectId(id.userId) })
    : await users.findOne({ username: id.username });
  if (!user) return NextResponse.json({ message: "Not found" }, { status: 404 });

  return NextResponse.json({
    user: {
      id: user._id.toString(),
      username: user.username || "",
      name: user.name || "",
      email: user.email || "",
    },
  });
}

export async function PUT(req) {
  const id = getIdentity(req);
  if (!id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { name, email, username } = await req.json();
  const updates = {};
  if (typeof name === "string") updates.name = name.trim();
  if (typeof email === "string") updates.email = email.trim();
  if (typeof username === "string") updates.username = username.trim();
  if (updates.email && !/\S+@\S+\.\S+/.test(updates.email)) {
    return NextResponse.json({ message: "Invalid email" }, { status: 400 });
  }

  const { db } = await connectToDatabase();
  const users = db.collection("users");

  const current = id.userId
    ? await users.findOne({ _id: new ObjectId(id.userId) })
    : await users.findOne({ username: id.username });
  if (!current) return NextResponse.json({ message: "Not found" }, { status: 404 });

  if (updates.username && updates.username !== current.username) {
    const clash = await users.findOne({ username: updates.username });
    if (clash) return NextResponse.json({ message: "Username already taken" }, { status: 409 });
  }

  await users.updateOne({ _id: current._id }, { $set: updates });
  return NextResponse.json({ message: "Profile updated" }, { status: 200 });
}

export async function DELETE(req) {
  const id = getIdentity(req);
  if (!id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { confirmUsername } = await req.json();
  if (!confirmUsername) return NextResponse.json({ message: "Confirmation required" }, { status: 400 });

  const { db } = await connectToDatabase();
  const users = db.collection("users");
  const user = id.userId
    ? await users.findOne({ _id: new ObjectId(id.userId) })
    : await users.findOne({ username: id.username });
  if (!user) return NextResponse.json({ message: "Not found" }, { status: 404 });

  if (user.username !== confirmUsername.trim()) {
    return NextResponse.json({ message: "Username does not match" }, { status: 400 });
  }

  await users.deleteOne({ _id: user._id });

  const res = NextResponse.json({ message: "Account deleted" }, { status: 200 });
  res.cookies.set("auth_token", "", { httpOnly: true, path: "/", expires: new Date(0) });
  return res;
}

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

