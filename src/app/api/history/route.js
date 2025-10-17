import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

function getUserIdFromRequest(request) {
  try {
    const cookie = request.headers.get("cookie") || "";
    const m = cookie.match(/(?:^|;)\s*auth_token=([^;]+)/);
    if (!m) return null;
    const token = decodeURIComponent(m[1]);
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const id = payload?.userId || payload?.sub || payload?.id || null;
    return id && ObjectId.isValid(id) ? id : null;
  } catch {
    return null;
  }
}

export async function GET(request) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { db } = await connectToDatabase();
  const docs = await db.collection("searchResults")
    .find({ userId: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .toArray();

  const items = docs.map(d => ({
    _id: String(d._id),
    createdAt: d.createdAt,
    preferences: d.preferences,
    recommendationsCount: d.recommendations?.length || 0,
  }));

  return NextResponse.json({ items });
}
