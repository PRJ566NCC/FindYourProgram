import jwt from "jsonwebtoken";

export async function verifyToken(req) {
  try {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) return null;

    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return null;
  }
}
