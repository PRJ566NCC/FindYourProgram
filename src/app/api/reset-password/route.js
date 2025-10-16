export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { connectToDatabase } = await import("@/lib/mongodb_rt");
  try {
    const { email: raw, code, newPassword } = await req.json();
    const email = (raw || "").trim().toLowerCase();

    if (!/\S+@\S+\.\S+/.test(email))           return NextResponse.json({ message: "Invalid email." }, { status: 400 });
    if (!code || code.length < 4)              return NextResponse.json({ message: "Invalid code." }, { status: 400 });
    if (!newPassword || newPassword.length<8)  return NextResponse.json({ message: "Password must be at least 8 characters." }, { status: 400 });

    const { db } = await connectToDatabase();
    const users = db.collection("users");
    const user = await users.findOne({ email });
    if (!user || !user.passwordResetCodeHash || !user.passwordResetExpires) {
      return NextResponse.json({ message: "Invalid or expired code." }, { status: 400 });
    }
    if (new Date(user.passwordResetExpires) < new Date()) {
      return NextResponse.json({ message: "Code expired." }, { status: 400 });
    }

    const codeHash = crypto.createHash("sha256").update(code).digest("hex");
    if (codeHash !== user.passwordResetCodeHash) {
      return NextResponse.json({ message: "Invalid code." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await users.updateOne(
      { _id: user._id },
      { $set: { passwordHash }, $unset: { passwordResetCodeHash: "", passwordResetExpires: "" } }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("reset-password error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
