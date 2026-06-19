import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const ticketId = parseInt(id);

    if (isNaN(ticketId)) {
      return NextResponse.json({ error: "ID de boleto inválido." }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || (payload.role !== "MEMBER" && payload.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Permiso denegado." },
        { status: 403 }
      );
    }

    const { paid, clientName, clientPhone, price, soldById } = await req.json();

    // Find ticket
    const ticket = await db.ticket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      return NextResponse.json({ error: "El boleto no existe." }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      paid: paid !== undefined ? !!paid : ticket.paid,
      clientName: clientName !== undefined ? clientName : ticket.clientName,
      clientPhone: clientPhone !== undefined ? clientPhone : ticket.clientPhone,
      price: price !== undefined ? parseFloat(price) : ticket.price
    };

    // Only allow admin to reassign seller
    if (soldById !== undefined && payload.role === "ADMIN") {
      updateData.soldById = parseInt(soldById);
    }

    // Update ticket data
    const updatedTicket = await db.ticket.update({
      where: { id: ticketId },
      data: updateData
    });

    return NextResponse.json({ success: true, ticket: updatedTicket });
  } catch (error: any) {
    console.error("PUT ticket API error:", error);
    return NextResponse.json(
      { error: "Error al actualizar el boleto." },
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
    const ticketId = parseInt(id);

    if (isNaN(ticketId)) {
      return NextResponse.json({ error: "ID de boleto inválido." }, { status: 400 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || (payload.role !== "MEMBER" && payload.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Permiso denegado." },
        { status: 403 }
      );
    }

    // Find ticket
    const ticket = await db.ticket.findUnique({
      where: { id: ticketId }
    });

    if (!ticket) {
      return NextResponse.json({ error: "El boleto no existe." }, { status: 404 });
    }

    // Delete ticket
    await db.ticket.delete({
      where: { id: ticketId }
    });

    return NextResponse.json({ success: true, message: "Venta cancelada con éxito." });
  } catch (error: any) {
    console.error("DELETE ticket API error:", error);
    return NextResponse.json(
      { error: "Error al cancelar la venta del boleto." },
      { status: 500 }
    );
  }
}
