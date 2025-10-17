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

export async function GET(request, { params }) {
  const userId = getUserIdFromRequest(request);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { db } = await connectToDatabase();
  const doc = await db.collection("searchResults").findOne({
    _id: new ObjectId(params.id),
    userId: new ObjectId(userId),
  });

  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(doc);
}
