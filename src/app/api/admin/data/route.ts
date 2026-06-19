import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyToken } from "@/lib/auth";

export async function GET() {
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

    // 1. Fetch all users with their tickets to compute stats
    const usersRaw = await db.user.findMany({
      include: {
        tickets: true
      },
      orderBy: { name: "asc" }
    });

    const users = usersRaw.map((u) => {
      const totalSold = u.tickets.length;
      const totalMoney = u.tickets.reduce((sum, t) => sum + t.price, 0);
      const paidMoney = u.tickets.filter((t) => t.paid).reduce((sum, t) => sum + t.price, 0);
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
    });

    // 3. Compute global statistics
    const totalSold = tickets.length;
    const totalMoney = tickets.reduce((sum, t) => sum + t.price, 0);
    const paidMoney = tickets.filter((t) => t.paid).reduce((sum, t) => sum + t.price, 0);
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
  } catch (error: any) {
    console.error("GET admin data API error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor al obtener datos administrativos." },
      { status: 500 }
    );
  }
}
