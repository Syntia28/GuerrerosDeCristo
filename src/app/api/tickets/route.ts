import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const numParam = searchParams.get("number");

    // Case 1: Public lookup by ticket number (from homepage search bar)
    if (numParam) {
      const ticketNum = parseInt(numParam);
      if (isNaN(ticketNum)) {
        return NextResponse.json({ error: "Número de boleto inválido." }, { status: 400 });
      }

      const ticket = await db.ticket.findUnique({
        where: { number: ticketNum },
        include: {
          soldBy: {
            select: { name: true }
          }
        }
      });
      return NextResponse.json({ ticket });
    }

    // Case 2: Dashboard query (requires session authentication)
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      // If no token, return only a list of sold numbers so the selector knows which are occupied
      const soldTickets = await db.ticket.findMany({
        select: { number: true }
      }) as { number: number }[];
      return NextResponse.json({ soldNumbers: soldTickets.map((t: { number: number }) => t.number) });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    // If member/admin logged in, return all tickets with seller info
    const tickets = await db.ticket.findMany({
      include: {
        soldBy: {
          select: { name: true }
        }
      },
      orderBy: { number: "asc" }
    });

    return NextResponse.json({ tickets });
  } catch (error: unknown) {
    console.error("GET tickets API error:", error);
    return NextResponse.json(
      { error: "Error al obtener los boletos de rifa." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autorizado." }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || (payload.role !== "MEMBER" && payload.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Permiso denegado. Solo los integrantes pueden registrar ventas." },
        { status: 403 }
      );
    }

    const { number, clientName, clientPhone, price, paid } = await req.json();

    if (!number || !clientName || !clientPhone || !price) {
      return NextResponse.json(
        { error: "Todos los campos (número, nombre cliente, teléfono cliente, precio) son requeridos." },
        { status: 400 }
      );
    }

    const ticketNum = parseInt(number);
    if (isNaN(ticketNum) || ticketNum <= 0) {
      return NextResponse.json(
        { error: "El número de boleto debe ser un entero positivo." },
        { status: 400 }
      );
    }

    // Check if the ticket number is already sold
    const existingTicket = await db.ticket.findUnique({
      where: { number: ticketNum }
    });

    if (existingTicket) {
      return NextResponse.json(
        { error: `El boleto número ${ticketNum} ya está vendido.` },
        { status: 400 }
      );
    }

    // Create the ticket sale
    const ticket = await db.ticket.create({
      data: {
        number: ticketNum,
        clientName,
        clientPhone,
        price: parseFloat(price),
        paid: !!paid,
        soldById: payload.id
      }
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error: unknown) {
    console.error("POST ticket API error:", error);
    return NextResponse.json(
      { error: "Error al registrar la venta del boleto." },
      { status: 500 }
    );
  }
}
