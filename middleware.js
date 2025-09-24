// middleware.js
// Runtime: Edge (default). Uses `jose` for JWT verification (Edge-compatible).
// Dependency: `npm i jose`

import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

/** Paths that require authentication */
const PROTECTED_PATHS = ["/profile"];

/** Encoded JWT secret for Edge-safe verification */
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "");

/** Verify JWT using `jose` (throws if invalid/expired) */
async function verifyJWT(token) {
  await jwtVerify(token, SECRET);
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Skip if path is not protected
  const requiresAuth = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!requiresAuth) return NextResponse.next();

  // Read auth cookie
  const token = req.cookies.get("auth_token")?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Validate token (invalid/expired → redirect to /login)
  try {
    await verifyJWT(token);
    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }
}

/** Apply middleware only to protected page routes */
export const config = {
  matcher: ["/profile/:path*"],
};
