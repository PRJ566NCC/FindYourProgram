export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendMail } from "@/lib/mailer";

async function getDb() {
  const { MongoClient } = await import("mongodb");
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "FindYourProgram";
  const client = await new MongoClient(uri).connect();
  const db = client.db(dbName);
  return { client, db };
}

export async function POST(req) {
  let client, db;
  try {
    const { email: raw } = await req.json();
    const email = (raw || "").trim().toLowerCase();
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ message: "Invalid email." }, { status: 400 });
    }

    ({ client, db } = await getDb());
    const users = db.collection("users");
    const user = await users.findOne({ email });

    // Always return ok (don’t reveal whether the email exists)
    const ok = NextResponse.json({ ok: true });
    if (!user) return ok;

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await users.updateOne(
      { _id: user._id },
      { $set: { passwordResetCodeHash: codeHash, passwordResetExpires: expiresAt } }
    );

    // Build reset URL
    const base = (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000").replace(/\/+$/, "");
    const resetUrl = `${base}/reset-password?email=${encodeURIComponent(email)}`;

    await sendMail({
      to: email,
      subject: "Reset your FindYourProgram password",
      text: [
        `Your verification code: ${code}`,
        `Open the reset page: ${resetUrl}`,
        `(Valid 15 minutes)`,
      ].join("\n"),
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6">
          <h2 style="margin:0 0 12px">Reset your password</h2>
          <p>Your verification code:</p>
          <div style="font-size:24px;font-weight:700;letter-spacing:3px">${code}</div>
          <p style="margin:16px 0">Valid for <b>15 minutes</b>.</p>
          <p style="margin:16px 0">Open the reset page:</p>
          <p style="margin:0 0 20px">
            <a href="${resetUrl}" style="
              display:inline-block;
              padding:10px 16px;
              background:#6b70d6;
              color:#fff !important;
              text-decoration:none;
              border-radius:6px;
              font-weight:600;
            ">Reset Password</a>
          </p>
          <p style="color:#666;font-size:12px;margin-top:12px">
            If the button doesn’t work, copy and paste this link into your browser:<br />
            <a href="${resetUrl}">${resetUrl}</a>
          </p>
        </div>
      `,
    });

    return ok;
  } catch (err) {
    console.error("forgot error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  } finally {
    if (client) await client.close();
  }
}
