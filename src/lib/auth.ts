import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
const COOKIE = "oa_admin";
function secret() {
  const value = process.env.ADMIN_SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("ADMIN_SESSION_SECRET minimal 32 karakter.");
  return new TextEncoder().encode(value);
}
export async function createAdminSession() {
  const token = await new SignJWT({ role: "admin" }).setProtectedHeader({ alg: "HS256" })
    .setIssuedAt().setExpirationTime("8h").sign(secret());
  cookies().set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 8*60*60 });
}
export async function isAdmin() {
  try {
    const token = cookies().get(COOKIE)?.value;
    if (!token) return false;
    const { payload } = await jwtVerify(token, secret());
    return payload.role === "admin";
  } catch { return false; }
}
export function clearAdminSession() {
  cookies().set(COOKIE, "", { httpOnly:true, secure:process.env.NODE_ENV==="production", sameSite:"strict", path:"/", maxAge:0 });
}
