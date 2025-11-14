import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json();

    const type = body?.type;
    const details = body?.details || {};

    if (type !== "bug" && type !== "payment") {
      return NextResponse.json(
        { message: "Invalid contact type." },
        { status: 400 }
      );
    }

    const name = details.name?.trim();
    const email = details.email?.trim();
    const summary =
      (details.summary || details.shortSummary || "").trim();

    if (!name || !email || !summary) {
      return NextResponse.json(
        { message: "Missing required fields." },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const now = new Date();

    const doc = {
      type,           // "bug" or "payment"
      status: "open", // ticket status
      name,
      email,
      summary,
      details,        // single subdocument holding all fields
      createdAt: now,
      updatedAt: now,
    };

    await db.collection("contactTickets").insertOne(doc);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error("Error in /api/contact:", err);
    return NextResponse.json(
      { message: "Failed to save contact ticket." },
      { status: 500 }
    );
  }
}
