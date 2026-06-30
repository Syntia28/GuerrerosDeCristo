import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken, hashPassword } from "@/lib/auth";

// PUT: actualizar datos del integrante (incluye estado)
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

    const { name, username, role, password, estado } = await req.json();

    // Buscar integrante
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "El integrante no existe." }, { status: 404 });
    }

    // Preparar datos de actualización
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role === "ADMIN" ? "ADMIN" : "MEMBER";
    if (estado !== undefined && ["pendiente", "aprobado", "rechazado"].includes(estado)) {
      updateData.estado = estado;
    }

    if (username !== undefined && username.trim() !== "") {
      const trimmedUsername = username.trim().toLowerCase();
      if (trimmedUsername !== user.username) {
        const existingUser = await db.user.findUnique({ where: { username: trimmedUsername } });
        if (existingUser) {
          return NextResponse.json(
            { error: "El nombre de usuario ya está registrado por otro integrante." },
            { status: 400 }
          );
        }
        updateData.username = trimmedUsername;
      }
    }

    if (password !== undefined && password.trim() !== "") {
      updateData.passwordHash = await hashPassword(password);
    }

    // Actualizar integrante
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, name: true, username: true, role: true, estado: true },
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

// DELETE: eliminar integrante (solo usuarios, no clientes ni tickets)
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

    if (payload.id === userId) {
      return NextResponse.json(
        { error: "No puedes eliminar tu propia cuenta de administrador." },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "El integrante no existe." }, { status: 404 });
    }

    // Eliminar integrante
    await db.user.delete({ where: { id: userId } });

    return NextResponse.json({
      success: true,
      message: "Integrante eliminado con éxito.",
    });
  } catch (error: any) {
    console.error("DELETE admin user API error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al eliminar el integrante." },
      { status: 500 }
    );
  }
}
