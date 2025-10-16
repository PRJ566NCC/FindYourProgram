export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendMail } from "@/lib/mailer";

export async function POST(req) {
  const { connectToDatabase } = await import("@/lib/mongodb_rt");
  try {
    const { email: raw } = await req.json();
    const email = (raw || "").trim().toLowerCase();
    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ message: "Invalid email." }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const users = db.collection("users");
    const user = await users.findOne({ email });

    // 防枚举：不存在也返回 ok；存在才发信+入库
    const ok = NextResponse.json({ ok: true });
    if (!user) return ok;

    // 6 位验证码（15 分钟）
    const code = (Math.floor(100000 + Math.random() * 900000)).toString();
    const codeHash = crypto.createHash("sha256").update(code).digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await users.updateOne(
      { _id: user._id },
      { $set: { passwordResetCodeHash: codeHash, passwordResetExpires: expiresAt } }
    );

    const base = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const resetUrl = `${base}/reset-password?email=${encodeURIComponent(email)}`;

    await sendMail({
      to: email,
      subject: "Reset your FindYourProgram password",
      text: `Your verification code: ${code}\nOpen: ${resetUrl}\n(Valid 15 minutes)`,
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif">
          <h2>Reset your password</h2>
          <p>Your verification code:</p>
          <div style="font-size:24px;font-weight:700;letter-spacing:3px">${code}</div>
          <p>Valid for <b>15 minutes</b>.</p>
          <p>Open the reset page: <a href="${resetUrl}">${resetUrl}</a></p>
        </div>`,
    });

    return ok;
  } catch (err) {
    console.error("forgot error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
