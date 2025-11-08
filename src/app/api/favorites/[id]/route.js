import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

const getUserId = (req) => req.headers.get("x-user-id") || "guest";


export const runtime = "nodejs";

export async function GET(req, ctx) {
  try {
    const { db } = await connectToDatabase();
    const userId = getUserId(req);

    const { id } = await ctx.params;
    // Use the raw ID which should be in the correct encoded format (e.g., Bachelor%20of...)
    const programId = id; 

    const hit = await db.collection("favorites").findOne({ userId, programId });
    return NextResponse.json({ isFav: !!hit }, { status: 200 });
  } catch (e) {
    console.error("GET /api/favorites/[id] error:", e);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function DELETE(req, ctx) {
  try {
    const { db } = await connectToDatabase();
    const userId = getUserId(req);

    const { id } = await ctx.params;
    // Use the raw 'id'. Next.js should resolve the outer encoding, 
    // leaving the single-encoded string that matches the DB.
    const programId = id;

    const result = await db.collection("favorites").deleteOne({ userId, programId });
    
    if (result.deletedCount === 0) {
        console.warn(`DELETE failed: Program ID used in query: "${programId}". This must exactly match the MongoDB value (e.g., Bachelor%20of...).`);
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e) {
    console.error("DELETE /api/favorites/[id] error:", e);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}