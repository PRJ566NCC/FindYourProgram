export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { verifyToken } from "../auth/verifyToken";
import clientPromise from "@/lib/mongodb";
import { convertToCSV } from "@/lib/exportUtils";

export async function GET(req) {
  try {
    const user = await verifyToken(req);
    if (!user)
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const format = searchParams.get("format") || "json";

    const client = await clientPromise;
    const db = client.db("FindYourProgram");

    const favorites = await db
      .collection("favorites")
      .find({ userId: user.userId })
      .toArray();

    const history = await db
      .collection("history")
      .find({ userId: user.userId })
      .toArray();

    const contacts = await db
      .collection("contactus")
      .find({ userId: user.userId })
      .toArray();

    const result = {
      userId: user.userId,
      downloadedAt: new Date(),
      favorites,
      searchHistory: history,
      contactTickets: contacts,
    };

    if (format === "csv") {
      const csv = convertToCSV(result);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="export.csv"`,
        },
      });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("EXPORT ERROR:", err);
    return NextResponse.json(
      { message: "Failed to export", error: err.message },
      { status: 500 }
    );
  }
}
