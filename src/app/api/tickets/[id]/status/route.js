import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/mongodb";
import { verifyToken } from "../../../auth/verifyToken";

export const runtime = "nodejs";

const ALLOWED = ["open", "in-progress", "closed"];

export async function PATCH(req, { params }) {
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
    const nextStatus = (body.status || "").trim();

    if (!ALLOWED.includes(nextStatus)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const tickets = db.collection("contactTickets");

    const ticket = await tickets.findOne({ _id: new ObjectId(id) });
    if (!ticket) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const currentStatus = ticket.status || "open";
    if (currentStatus === nextStatus) {
      return NextResponse.json({
        status: currentStatus,
        updatedAt: ticket.updatedAt || ticket.createdAt || new Date(),
      });
    }

    const now = new Date();

    await tickets.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: nextStatus, updatedAt: now } }
    );

    const updates = db.collection("ticketUpdates");
    const updateDoc = {
      ticketId: id,
      kind: "status",
      fromStatus: currentStatus,
      toStatus: nextStatus,
      message: "",
      createdAt: now,
      authorName: user.username || "",
      authorEmail: user.email || "",
    };

    const insertRes = await updates.insertOne(updateDoc);

    const update = {
      _id: String(insertRes.insertedId),
      ticketId: id,
      kind: "status",
      fromStatus: currentStatus,
      toStatus: nextStatus,
      message: "",
      createdAt: now,
      authorName: updateDoc.authorName,
      authorEmail: updateDoc.authorEmail,
    };

    return NextResponse.json({ status: nextStatus, updatedAt: now, update });
  } catch (err) {
    console.error("PATCH /api/tickets/[id]/status error:", err);
    return NextResponse.json({ message: "Failed to update status" }, { status: 500 });
  }
}
