import { NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/mongodb";

export const runtime = 'nodejs';

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Program ID is required." },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();

    // Decode the ID (it might be URL-encoded)
    const decodedId = decodeURIComponent(id);

    // search by program id or name
    const program = await db.collection("programs").findOne({
      $or: [
        { programId: id },
        { programId: decodedId },
        { programName: decodedId },
        { programName: { $regex: new RegExp(`^${decodedId}$`, 'i') } }
      ]
    }, {
      sort: { createdAt: -1 }
    });

    if (!program) {
      return NextResponse.json(
        { message: "Program not found." },
        { status: 404 }
      );
    }

    const { _id, userId, searchPreferences, createdAt, ...programData } = program;

    return NextResponse.json(programData, { status: 200 });
    
  } catch (error) {
    console.error("API Error in /api/programs/[id]:", error);
    return NextResponse.json(
      { message: error.message || "An error occurred." },
      { status: 500 }
    );
  }
}