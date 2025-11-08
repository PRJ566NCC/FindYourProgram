import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";

const getUserId = (req) => req.headers.get("x-user-id") || "guest";


export async function GET(req) {
  try {
    const { db } = await connectToDatabase();
    const userId = getUserId(req);

    const items = await db.collection("favorites")
      .find({ userId })
      .project({ _id: 0 })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ items }, { status: 200 });
  } catch (e) {
    console.error("GET /api/favorites error:", e);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    if (!body?.programId)
      return NextResponse.json({ message: "programId required" }, { status: 400 });

    const { db } = await connectToDatabase();
    const userId = getUserId(req);

    // limit 10
    const count = await db.collection("favorites").countDocuments({ userId });
    if (count >= 10) {
      return NextResponse.json({ message: "Favorites limit reached (10)." }, { status: 403 });
    }


    const pid = body.programId; 

    // Find program snapshot
    const program = await db.collection("programs").findOne({
      $or: [
        { programId: pid },
        { programName: pid },
        // Use the raw encoded PID for the regex
        { programName: { $regex: new RegExp(`^${pid}$`, "i") } }, 
      ],
    }, { sort: { createdAt: -1 } });

    if (!program)
      return NextResponse.json({ message: "Program not found." }, { status: 404 });

    const programId = program.programId || pid;

    await db.collection("favorites").updateOne(
      { userId, programId },
      {
        $setOnInsert: {
          userId,
          programId, // This is the single-encoded ID that will be stored
          snapshot: {
            programId,
            programName: program.programName,
            universityName: program.universityName,
            facultyName: program.facultyName,
            location: program.location,
            matchPercentage: program.matchPercentage,
          },
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e) {
    console.error("POST /api/favorites error:", e);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}