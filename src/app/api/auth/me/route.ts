import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: payload.id,
        name: payload.name,
        role: payload.role,
        usernameOrPhone: payload.usernameOrPhone
      }
    });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
