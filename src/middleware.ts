import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "guerreros-de-cristo-super-secret-key-12345"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect member dashboard
  if (pathname.startsWith("/dashboard/member")) {
    const token = request.cookies.get("session")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const role = payload.role as string;

      if (role !== "MEMBER" && role !== "ADMIN") {
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
    } catch (err) {
      // Invalid token, delete session and redirect
      const response = NextResponse.redirect(new URL("/auth/login", request.url));
      response.cookies.delete("session");
      return response;
    }
  }

  // Protect admin dashboard
  if (pathname.startsWith("/dashboard/admin")) {
    const token = request.cookies.get("session")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const role = payload.role as string;

      if (role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard/member", request.url));
      }
    } catch (err) {
      // Invalid token, delete session and redirect
      const response = NextResponse.redirect(new URL("/auth/login", request.url));
      response.cookies.delete("session");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/member/:path*", "/dashboard/admin/:path*"]
};
