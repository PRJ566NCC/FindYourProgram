import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyToken } from "../../auth/verifyToken";

export const runtime = "nodejs";

export async function GET(req, { params }) {
  try {
    const user = await verifyToken(req);
    if (!user || !user.isAdmin) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: "Invalid id" }, { status: 400 });
    }

    const { db } = await connectToDatabase();

    const ticketDoc = await db
      .collection("contactTickets")
      .findOne({ _id: new ObjectId(id) });

    if (!ticketDoc) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const updatesDocs = await db
      .collection("ticketUpdates")
      .find({ ticketId: id })
      .sort({ createdAt: 1 })
      .toArray();

    const ticket = {
      _id: String(ticketDoc._id),
      type: ticketDoc.type || "other",
      status: ticketDoc.status || "open",
      name: ticketDoc.name || ticketDoc.details?.name || "",
      email: ticketDoc.email || ticketDoc.details?.email || "",
      summary: ticketDoc.summary || ticketDoc.details?.summary || "",
      details: ticketDoc.details || {},
      createdAt: ticketDoc.createdAt || null,
      updatedAt: ticketDoc.updatedAt || null,
    };

    const updates = updatesDocs.map((u) => ({
      _id: String(u._id),
      ticketId: u.ticketId,
      kind: u.kind || "note",
      message: u.message || "",
      fromStatus: u.fromStatus || null,
      toStatus: u.toStatus || null,
      createdAt: u.createdAt || null,
      authorName: u.authorName || "",
      authorEmail: u.authorEmail || "",
    }));

    return NextResponse.json({ ticket, updates });
  } catch (err) {
    console.error("GET /api/tickets/[id] error:", err);
    return NextResponse.json({ message: "Failed to load ticket" }, { status: 500 });
  }
}
