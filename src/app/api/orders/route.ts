import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/session";

const PRECIO_BOLETO = 5.0;
const MAX_BOLETOS_POR_PEDIDO = 50;

// POST /api/orders → un cliente crea un nuevo pedido (queda PENDIENTE)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { clientName, clientPhone, quantity, receiptImage } = body;

    if (!clientName || typeof clientName !== "string" || !clientName.trim()) {
      return NextResponse.json({ error: "El nombre es obligatorio." }, { status: 400 });
    }
    if (!clientPhone || typeof clientPhone !== "string" || !clientPhone.trim()) {
      return NextResponse.json({ error: "El teléfono es obligatorio." }, { status: 400 });
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_BOLETOS_POR_PEDIDO) {
      return NextResponse.json(
        { error: `La cantidad debe ser entre 1 y ${MAX_BOLETOS_POR_PEDIDO}.` },
        { status: 400 }
      );
    }
    if (!receiptImage || typeof receiptImage !== "string" || !receiptImage.startsWith("data:image")) {
      return NextResponse.json({ error: "Debes adjuntar el comprobante de pago." }, { status: 400 });
    }
    // Límite básico de tamaño (~5MB en base64) para no llenar la base de datos
    if (receiptImage.length > 7_000_000) {
      return NextResponse.json({ error: "La imagen es muy pesada, intenta con una más liviana." }, { status: 400 });
    }

    const order = await db.ticketOrder.create({
      data: {
        clientName: clientName.trim(),
        clientPhone: clientPhone.trim(),
        quantity,
        totalPrice: quantity * PRECIO_BOLETO,
        receiptImage,
        status: "PENDIENTE",
      },
    });

    return NextResponse.json({ order: { id: order.id, status: order.status } }, { status: 201 });
  } catch (err) {
    console.error("Error creando pedido de rifa:", err);
    return NextResponse.json({ error: "Ocurrió un error al procesar tu pedido." }, { status: 500 });
  }
}

// GET /api/orders?status=PENDIENTE → solo ADMIN, lista pedidos para revisar
export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const status = req.nextUrl.searchParams.get("status") || "PENDIENTE";

  const orders = await db.ticketOrder.findMany({
    where: { status },
    orderBy: { createdAt: "asc" },
    include: { reviewedBy: { select: { name: true } } },
  });

  return NextResponse.json({ orders });
}
