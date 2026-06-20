import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const numParam = searchParams.get("number") || searchParams.get("query");

    // Case 1: Public lookup by ticket number or client name
    if (numParam) {
      const cleanParam = numParam.trim();
      const ticketNum = parseInt(cleanParam);

      // If it's a numeric search query
      if (!isNaN(ticketNum) && /^\d+$/.test(cleanParam)) {
        const ticket = await db.ticket.findUnique({
          where: { number: ticketNum },
          include: {
            soldBy: {
              select: { name: true }
            }
          }
        });
        return NextResponse.json({ ticket });
      } else {
        // If it's a name search query
        const tickets = await db.ticket.findMany({
          where: {
            clientName: {
              contains: cleanParam
            }
          },
          include: {
            soldBy: {
              select: { name: true }
            }
          },
          orderBy: { number: "asc" }
        });
        return NextResponse.json({ tickets });
      }
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

    const { number, numbers, clientName, clientPhone, price, paid } = await req.json();

    if (!clientName || !clientPhone || price === undefined) {
      return NextResponse.json(
        { error: "Todos los campos (nombre cliente, teléfono cliente, precio) son requeridos." },
        { status: 400 }
      );
    }

    // Extract ticket numbers
    let ticketNums: number[] = [];
    if (Array.isArray(numbers)) {
      ticketNums = numbers.map((n: any) => parseInt(n)).filter((n: number) => !isNaN(n) && n > 0);
    } else if (number) {
      const parsed = parseInt(number);
      if (!isNaN(parsed) && parsed > 0) {
        ticketNums = [parsed];
      }
    }

    if (ticketNums.length === 0) {
      return NextResponse.json(
        { error: "Se requiere al menos un número de boleto válido." },
        { status: 400 }
      );
    }

    // Check if any of the ticket numbers are already sold
    const existingTickets = await db.ticket.findMany({
      where: {
        number: { in: ticketNums }
      }
    });

    if (existingTickets.length > 0) {
      const soldNums = existingTickets.map((t: { number: number }) => t.number).join(", ");
      return NextResponse.json(
        { error: `Los siguientes boletos ya están vendidos: ${soldNums}` },
        { status: 400 }
      );
    }

    // Create the ticket sales in a transaction
    const createdTickets = await db.$transaction(
      ticketNums.map((num) =>
        db.ticket.create({
          data: {
            number: num,
            clientName,
            clientPhone,
            price: 5.0,
            paid: !!paid,
            soldById: payload.id
          }
        })
      )
    );

    return NextResponse.json({
      success: true,
      tickets: createdTickets,
      ticket: createdTickets[0] // for backwards compatibility
    });
  } catch (error: unknown) {
    console.error("POST ticket API error:", error);
    return NextResponse.json(
      { error: "Error al registrar la venta de los boletos." },
      { status: 500 }
    );
  }
}
