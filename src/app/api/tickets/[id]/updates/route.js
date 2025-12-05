import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyToken } from "../../../auth/verifyToken";

export const runtime = "nodejs";

export async function POST(req, { params }) {
  try {
    const user = await verifyToken(req);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const message = (body.message || "").trim();

    if (!message) {
      return NextResponse.json({ message: "Message required" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const now = new Date();

    const doc = {
      ticketId: id,
      kind: "note",
      message,
      fromStatus: null,
      toStatus: null,
      createdAt: now,
      authorName: user.username || "",
      authorEmail: user.email || "",
    };

    const resInsert = await db.collection("ticketUpdates").insertOne(doc);

    const update = {
      _id: String(resInsert.insertedId),
      ticketId: id,
      kind: "note",
      message,
      fromStatus: null,
      toStatus: null,
      createdAt: now,
      authorName: doc.authorName,
      authorEmail: doc.authorEmail,
    };

    return NextResponse.json({ update }, { status: 201 });
  } catch (err) {
    console.error("POST /api/tickets/[id]/updates error:", err);
    return NextResponse.json({ message: "Failed to add update" }, { status: 500 });
  }
}
