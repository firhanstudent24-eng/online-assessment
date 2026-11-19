
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = req.cookies.get("oa_admin")?.value;
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!token || !secret || secret.length < 32) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secret)
    );

    if (payload.role !== "admin") {
      throw new Error("Unauthorized");
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
