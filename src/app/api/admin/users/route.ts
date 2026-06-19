import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken, hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Permiso denegado. Se requiere rol de administrador." },
        { status: 403 }
      );
    }

    const { name, username, password, role } = await req.json();

    if (!name || !username || !password) {
      return NextResponse.json(
        { error: "Todos los campos (nombre completo, usuario y contraseña) son requeridos." },
        { status: 400 }
      );
    }

    const trimmedUsername = username.trim().toLowerCase();

    // Check if username already exists
    const existingUser = await db.user.findUnique({
      where: { username: trimmedUsername }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El nombre de usuario ya está registrado." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const userRole = role === "ADMIN" ? "ADMIN" : "MEMBER";

    const user = await db.user.create({
      data: {
        name,
        username: trimmedUsername,
        passwordHash,
        role: userRole
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role
      }
    });
  } catch (error: any) {
    console.error("POST admin users API error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al registrar el integrante." },
      { status: 500 }
    );
  }
}
