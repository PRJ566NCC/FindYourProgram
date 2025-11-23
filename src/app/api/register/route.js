import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const body = await req.json();
    const username = (body.username || "").trim();
    const name = (body.name || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    // VALIDATION
    if (!username || username.length < 3)
      return NextResponse.json({ message: "Invalid username." }, { status: 400 });

    if (!name)
      return NextResponse.json({ message: "Full name required." }, { status: 400 });

    if (!/\S+@\S+\.\S+/.test(email))
      return NextResponse.json({ message: "Invalid email." }, { status: 400 });

    if (!password || password.length < 6)
      return NextResponse.json({ message: "Password too short." }, { status: 400 });

    const { db } = await connectToDatabase();
    const users = db.collection("users");

    // CHECK DUPLICATES
    const existing = await users.findOne({
      $or: [{ email }, { username }],
    });

    if (existing) {
      if (existing.email === email)
        return NextResponse.json({ message: "Email already in use." }, { status: 409 });

      if (existing.username === username)
        return NextResponse.json({ message: "Username already taken." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 14);

    // INTERNAL EMAIL → REQUIRE ADMIN APPROVAL
    if (email.endsWith("@findyourprogram.ca")) {
      const pendingUser = {
        username,
        name,
        email,
        passwordHash,
        createdAt: new Date(),
        isApproved: false,
        isAdmin: false,
      };

      await users.insertOne(pendingUser);

      // SEND EMAIL TO ADMIN
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.ADMIN_EMAIL,
          pass: process.env.ADMIN_EMAIL_PASSWORD,
        },
      });

      const approvalToken = jwt.sign(
        { userId: pendingUser._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: "3d" } // admin has 3 days to approve
      );

      const approvalUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/approve-user?token=${approvalToken}`;

      await transporter.sendMail({
        from: `"FindYourProgram System" <${process.env.ADMIN_EMAIL}>`,
        to: process.env.ADMIN_EMAIL,
        subject: "New Internal Account Request",
        html: `
          <p>A new user has registered and requires approval:</p>
          <p><strong>${username}</strong> (${email})</p>

          <p>Click below to approve:</p>
          <p><a href="${approvalUrl}" target="_blank">Approve User</a></p>

          <p>This link expires in 3 days.</p>
        `,
      });


      return NextResponse.json(
        {
          message:
            "Your request has been submitted for approval. An administrator will activate your account shortly.",
        },
        { status: 202 }
      );
    }

    // NORMAL EMAIL → AUTO APPROVED
    const newUser = {
      username,
      name,
      email,
      passwordHash,
      createdAt: new Date(),
      isApproved: true,
      isAdmin: false,
    };

    const result = await users.insertOne(newUser);

    return NextResponse.json(
      { message: "Registration successful!", userId: result.insertedId },
      { status: 201 }
    );

  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export const runtime = "nodejs";
