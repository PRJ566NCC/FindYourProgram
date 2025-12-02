import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    const sponsorships = await db
      .collection("sponsorships")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(sponsorships);
  } catch (err) {
    console.error(err);
    return new NextResponse("Failed to load sponsorships.", { status: 500 });
  }
}
