"use client";

import { useEffect, useState } from "react";

interface Order {
  id: number;
  clientName: string;
  clientPhone: string;
  quantity: number;
  totalPrice: number;
  receiptImage: string;
  status: string;
  createdAt: string;
}

export default function OrdenesAdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [zoomImage, setZoomImage] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/orders?status=PENDIENTE");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleAction = async (id: number, action: "approve" | "reject") => {
    if (action === "reject" && !confirm("¿Seguro que quieres rechazar este pedido?")) return;
    setProcessingId(id);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Ocurrió un error.");
        return;
      }
      if (action === "approve") {
        alert(`Boletos asignados: ${data.ticketNumbers.join(", ")}`);
      }
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch {
      alert("Error de conexión.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
      <style>{`
        .ord-container { min-height: 100svh; background: #0a0a0a; color: #fff; padding: 100px 24px 60px; font-family: 'Inter', system-ui, sans-serif; }
        .ord-wrapper { max-width: 900px; margin: 0 auto; }
        .ord-title { font-size: 28px; font-weight: 800; margin-bottom: 8px; }
        .ord-subtitle { color: rgba(255,255,255,0.5); font-size: 14px; margin-bottom: 32px; }
        .ord-empty { text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.4); }
        .ord-card {
          background: #121212; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px;
          padding: 20px; margin-bottom: 16px; display: flex; gap: 20px;
        }
        .ord-receipt { width: 110px; height: 110px; border-radius: 10px; object-fit: cover; cursor: zoom-in; flex-shrink: 0; }
        .ord-info { flex: 1; }
        .ord-name { font-weight: 700; font-size: 16px; }
        .ord-meta { font-size: 13px; color: rgba(255,255,255,0.5); margin-top: 4px; }
        .ord-price { color: #F5BE27; font-weight: 800; font-size: 18px; margin-top: 8px; }
        .ord-actions { display: flex; gap: 8px; margin-top: 12px; }
        .btn-approve, .btn-reject {
          border: none; border-radius: 30px; padding: 8px 18px; font-size: 12px; font-weight: 700;
          text-transform: uppercase; cursor: pointer;
        }
        .btn-approve { background: #16a34a; color: #fff; }
        .btn-reject { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.3); }
        .btn-approve:disabled, .btn-reject:disabled { opacity: 0.5; cursor: not-allowed; }
        .zoom-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 100;
          display: flex; align-items: center; justify-content: center; cursor: zoom-out; padding: 20px;
        }
        .zoom-overlay img { max-width: 100%; max-height: 100%; border-radius: 12px; }
      `}</style>

      <div className="ord-container">
        <div className="ord-wrapper">
          <h1 className="ord-title">Pedidos de Rifa Pendientes</h1>
          <p className="ord-subtitle">Revisa el comprobante y aprueba o rechaza cada pedido.</p>

          {loading && <p>Cargando...</p>}
          {!loading && orders.length === 0 && (
            <div className="ord-empty">No hay pedidos pendientes por revisar. 🎉</div>
          )}

          {orders.map((order) => (
            <div key={order.id} className="ord-card">
              <img
                src={order.receiptImage}
                alt="Comprobante"
                className="ord-receipt"
                onClick={() => setZoomImage(order.receiptImage)}
              />
              <div className="ord-info">
                <div className="ord-name">{order.clientName}</div>
                <div className="ord-meta">{order.clientPhone} · {order.quantity} boleto(s)</div>
                <div className="ord-meta">Pedido #{order.id} · {new Date(order.createdAt).toLocaleString("es-PE")}</div>
                <div className="ord-price">S/ {order.totalPrice.toFixed(2)}</div>
                <div className="ord-actions">
                  <button
                    className="btn-approve"
                    disabled={processingId === order.id}
                    onClick={() => handleAction(order.id, "approve")}
                  >
                    Aprobar
                  </button>
                  <button
                    className="btn-reject"
                    disabled={processingId === order.id}
                    onClick={() => handleAction(order.id, "reject")}
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {zoomImage && (
        <div className="zoom-overlay" onClick={() => setZoomImage(null)}>
          <img src={zoomImage} alt="Comprobante ampliado" />
        </div>
      )}
    </>
  );
}
