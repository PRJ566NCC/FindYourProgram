import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    const donations = await db
      .collection("donations")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(donations);
  } catch (err) {
    console.error(err);
    return new NextResponse("Failed to load donations.", { status: 500 });
  }
}
