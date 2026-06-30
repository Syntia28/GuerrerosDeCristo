import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// PUT: actualizar estado del usuario (aprobar o rechazar)
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { estado } = await req.json();

    if (!estado || !["aprobado", "rechazado"].includes(estado)) {
      return NextResponse.json(
        { error: "Estado inválido. Usa 'aprobado' o 'rechazado'." },
        { status: 400 }
      );
    }

    const user = await db.user.update({
      where: { id: Number(params.id) },
      data: { estado },
    });

    return NextResponse.json({
      success: true,
      message: `Usuario ${user.name} actualizado a estado: ${estado}`,
      user,
    });
  } catch (error: any) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}

// GET: obtener información de un usuario específico
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await db.user.findUnique({
      where: { id: Number(params.id) },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error("Error al obtener usuario:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 }
    );
  }
}
