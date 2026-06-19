import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

type TicketSimple = { price: number; paid: boolean };
type UserWithTickets = {
  id: number;
  name: string;
  username: string;
  role: string;
  createdAt: Date;
  tickets: TicketSimple[];
};
type TicketWithSoldBy = TicketSimple & { soldBy?: { id: number; name: string; username: string } };

export async function GET() {
  try {
    // During builds (or when DATABASE_URL is not configured in the deployment),
    // avoid initializing the database to prevent build-time failures.
    if (!process.env.DATABASE_URL) {
      console.warn("DATABASE_URL not set — returning empty admin data during build.");
      const stats = {
        totalSold: 0,
        totalMoney: 0,
        paidMoney: 0,
        pendingMoney: 0,
        totalUsers: 0
      };
      return NextResponse.json({ success: true, stats, users: [], tickets: [] });
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

    // 1. Fetch all users with their tickets to compute stats
    const usersRaw = await db.user.findMany({
      include: {
        tickets: true
      },
      orderBy: { name: "asc" }
    }) as UserWithTickets[];

    const users = usersRaw.map((u: UserWithTickets) => {
      const totalSold = u.tickets.length;
      const totalMoney = u.tickets.reduce((sum: number, t: TicketSimple) => sum + t.price, 0);
      const paidMoney = u.tickets.filter((t: TicketSimple) => t.paid).reduce((sum: number, t: TicketSimple) => sum + t.price, 0);
      const pendingMoney = totalMoney - paidMoney;

      return {
        id: u.id,
        name: u.name,
        username: u.username,
        role: u.role,
        createdAt: u.createdAt,
        stats: {
          totalSold,
          totalMoney,
          paidMoney,
          pendingMoney
        }
      };
    });

    // 2. Fetch all tickets
    const tickets = await db.ticket.findMany({
      include: {
        soldBy: {
          select: { id: true, name: true, username: true }
        }
      },
      orderBy: { number: "asc" }
    }) as TicketWithSoldBy[];

    // 3. Compute global statistics
    const totalSold = tickets.length;
    const totalMoney = tickets.reduce((sum: number, t: TicketWithSoldBy) => sum + t.price, 0);
    const paidMoney = tickets.filter((t: TicketWithSoldBy) => t.paid).reduce((sum: number, t: TicketWithSoldBy) => sum + t.price, 0);
    const pendingMoney = totalMoney - paidMoney;
    const totalUsers = users.length;

    const stats = {
      totalSold,
      totalMoney,
      paidMoney,
      pendingMoney,
      totalUsers
    };

    return NextResponse.json({
      success: true,
      stats,
      users,
      tickets
    });
  } catch (error: unknown) {
    console.error("GET admin data API error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al obtener datos administrativos." },
      { status: 500 }
    );
  }
}
