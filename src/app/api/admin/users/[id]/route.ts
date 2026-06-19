import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken, hashPassword } from "@/lib/auth";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "ID de integrante inválido." }, { status: 400 });
    }

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

    const { name, username, role, password } = await req.json();

    // Find user
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: "El integrante no existe." }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role === "ADMIN" ? "ADMIN" : "MEMBER";

    if (username !== undefined && username.trim() !== "") {
      const trimmedUsername = username.trim().toLowerCase();
      if (trimmedUsername !== user.username) {
        // Check uniqueness
        const existingUser = await db.user.findUnique({
          where: { username: trimmedUsername }
        });
        if (existingUser) {
          return NextResponse.json({ error: "El nombre de usuario ya está registrado por otro integrante." }, { status: 400 });
        }
        updateData.username = trimmedUsername;
      }
    }

    if (password !== undefined && password.trim() !== "") {
      updateData.passwordHash = await hashPassword(password);
    }

    // Update user
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        username: true,
        role: true
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: any) {
    console.error("PUT admin user API error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al actualizar el integrante." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "ID de integrante inválido." }, { status: 400 });
    }

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

    // Prevent admin from deleting themselves
    if (payload.id === userId) {
      return NextResponse.json(
        { error: "No puedes eliminar tu propia cuenta de administrador." },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: "El integrante no existe." }, { status: 404 });
    }

    // Run transaction:
    // 1. Delete/Free all tickets registered by this user to avoid FK constraint errors.
    // 2. Delete the user.
    await db.$transaction([
      db.ticket.deleteMany({
        where: { soldById: userId }
      }),
      db.user.delete({
        where: { id: userId }
      })
    ]);

    return NextResponse.json({ success: true, message: "Integrante y sus boletos asociados eliminados con éxito." });
  } catch (error: any) {
    console.error("DELETE admin user API error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al eliminar el integrante." },
      { status: 500 }
    );
  }
}
