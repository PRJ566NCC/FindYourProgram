// src/app/api/me/route.js
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export const runtime = "nodejs";           // 在 Node 运行时执行（允许原生依赖）
export const dynamic = "force-dynamic";    // 避免被静态化缓存

const JWT_SECRET = process.env.JWT_SECRET;

export async function GET(req) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    if (!JWT_SECRET) {
      console.error("JWT_SECRET is missing");
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    // 验证并解码 JWT
    const decoded = jwt.verify(token, JWT_SECRET);
    const username = decoded?.username?.trim?.();
    if (!username) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
    }

    // 关键：运行时再加载 DB 工具，避免 Turbopack 在构建期评估 mongodb
    const { connectToDatabase } = await import("@/lib/mongodb_rt");

    const { db } = await connectToDatabase();
    const userFromDb = await db.collection("users").findOne(
      { username },
      { projection: { password: 0, confirmPassword: 0, passwordHash: 0 } } // 不返回敏感字段
    );

    if (!userFromDb) {
      console.error(`User '${username}' not found in database.`);
      return NextResponse.json({ authenticated: false, user: null }, { status: 404 });
    }

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: userFromDb._id.toString(),
          username: userFromDb.username,
          email: userFromDb.email,
          name: userFromDb.name,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("JWT verification or DB error:", err);
    return NextResponse.json({ authenticated: false, user: null }, { status: 200 });
  }
}
