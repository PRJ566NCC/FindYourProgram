import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

/**
 * Returns up to two random, distinct sponsorships where:
 *  - status is "succeeded"
 *  - expiresAt is in the future (active within 4-month window)
 * Responds with [] when none match.
 */
export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const now = new Date();

    const sponsors = await db
      .collection("sponsorships")
      .aggregate([
        { $match: { status: "succeeded", expiresAt: { $gte: now } } },
        {
          $project: {
            uniName: 1,
            programName: 1,
            departmentName: 1,
            expiresAt: 1,
          },
        },
        { $sample: { size: 2 } }, // 0, 1, or 2 random documents
      ])
      .toArray();

    return NextResponse.json({
      sponsors: sponsors.map((s) => ({ ...s, _id: String(s._id) })),
    });
  } catch (err) {
    console.error(err);
    return new NextResponse("Failed to load sponsors.", { status: 500 });
  }
}
