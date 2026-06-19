import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { hashPassword, createToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { name, username, password } = await req.json();

    if (!name || !username || !password) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios." },
        { status: 400 }
      );
    }

    // Check if username already exists in User table
    const existingUser = await db.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este nombre de usuario ya está registrado por otro integrante." },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create User (Integrante)
    const user = await db.user.create({
      data: {
        name,
        username,
        passwordHash,
        role: "MEMBER"
      }
    });

    // Automatically log the member in after registration
    const token = await createToken({
      id: user.id,
      role: user.role,
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
    console.error("Register API error:", error);
    return NextResponse.json(
      { error: `Error al registrar el nuevo integrante: ${error?.message || error}` },
      { status: 500 }
    );
  }
}
