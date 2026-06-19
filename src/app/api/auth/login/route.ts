import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyPassword, createToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { usernameOrPhone, password } = await req.json();

    if (!usernameOrPhone || !password) {
      return NextResponse.json(
        { error: "Usuario y contraseña son requeridos." },
        { status: 400 }
      );
    }

    // Find Member (User)
    const user = await db.user.findUnique({
      where: { username: usernameOrPhone }
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos." },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos." },
        { status: 401 }
      );
    }

    const token = await createToken({
      id: user.id,
      role: user.role, // MEMBER or ADMIN
      name: user.name,
      usernameOrPhone: user.username
    });

    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/"
    });

    return NextResponse.json({
      success: true,
      user: { id: user.id, name: user.name, role: user.role }
    });
  } catch (error: any) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
