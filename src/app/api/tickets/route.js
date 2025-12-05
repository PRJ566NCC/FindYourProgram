import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyToken } from "../auth/verifyToken";

export const runtime = "nodejs";

export async function GET(req) {
  try {
    const user = await verifyToken(req);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { db } = await connectToDatabase();

    const docs = await db
      .collection("contactTickets")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const tickets = docs.map((t) => ({
      _id: String(t._id),
      type: t.type || "other",
      status: t.status || "open",
      name: t.name || t.details?.name || "",
      email: t.email || t.details?.email || "",
      summary: t.summary || t.details?.summary || "",
      createdAt: t.createdAt || null,
      updatedAt: t.updatedAt || null,
    }));

    return NextResponse.json({ tickets });
  } catch (err) {
    console.error("GET /api/tickets error:", err);
    return NextResponse.json({ message: "Failed to load tickets" }, { status: 500 });
  }
}
