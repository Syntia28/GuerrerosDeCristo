"use client";

import { useState } from "react";
import Link from "next/link";

const PRECIO_BOLETO = 5.0;
const WHATSAPP_SOPORTE = "51993790722";

export default function ComprarBoletoPage() {
  const [step, setStep] = useState(1);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptFileName, setReceiptFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState<number | null>(null);

  const total = (quantity * PRECIO_BOLETO).toFixed(2);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5_000_000) {
      setError("La imagen es muy pesada (máx. 5MB).");
      return;
    }
    setError("");
    setReceiptFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setReceiptImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const goToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) {
      setError("Completa tu nombre y teléfono.");
      return;
    }
    setError("");
    setStep(2);
  };

  const submitOrder = async () => {
    if (!receiptImage) {
      setError("Adjunta tu comprobante de pago.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientName, clientPhone, quantity, receiptImage }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ocurrió un error.");
        setSubmitting(false);
        return;
      }
      setOrderId(data.order.id);
      setStep(3);
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <style>{`
        .comprar-container {
          min-height: 100svh;
          background: linear-gradient(135deg, #0f0f0f 0%, #050505 100%);
          color: #fff;
          font-family: 'Inter', system-ui, sans-serif;
          padding: 100px 20px 60px;
        }
        .comprar-wrapper { max-width: 560px; margin: 0 auto; }
        .btn-back {
          display: inline-flex; align-items: center; gap: 8px;
          color: rgba(255,255,255,0.6); text-decoration: none;
          font-size: 14px; font-weight: 600; margin-bottom: 24px;
        }
        .btn-back:hover { color: #F5BE27; }
        .progress-bar { display: flex; gap: 6px; margin-bottom: 32px; }
        .progress-seg { flex: 1; height: 4px; border-radius: 4px; background: rgba(255,255,255,0.1); }
        .progress-seg.active { background: #F5BE27; }
        .step-label { font-size: 12px; color: rgba(255,255,255,0.5); margin-bottom: 24px; }
        .card {
          background: #121212; border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px; padding: 32px;
        }
        .field { margin-bottom: 20px; }
        .field label { display: block; font-size: 12px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; color: rgba(255,255,255,0.6); margin-bottom: 8px; }
        .field input {
          width: 100%; height: 48px; padding: 0 16px; border-radius: 12px;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          color: #fff; font-size: 15px; outline: none;
        }
        .field input:focus { border-color: #F5BE27; }
        .btn-gold {
          width: 100%; height: 52px; border-radius: 30px; border: none;
          background: #F5BE27; color: #111; font-weight: 800; font-size: 13px;
          text-transform: uppercase; letter-spacing: 0.08em; cursor: pointer;
        }
        .btn-gold:hover { background: #ffd15e; }
        .btn-gold:disabled { opacity: 0.5; cursor: not-allowed; }
        .qty-row {
          display: flex; align-items: center; justify-content: space-between;
          background: rgba(255,255,255,0.04); border-radius: 14px; padding: 16px 20px; margin-bottom: 24px;
        }
        .qty-controls { display: flex; align-items: center; gap: 16px; }
        .qty-btn {
          width: 36px; height: 36px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.15);
          background: transparent; color: #F5BE27; font-size: 18px; cursor: pointer;
        }
        .qty-num { font-size: 22px; font-weight: 800; min-width: 24px; text-align: center; }
        .total-row { text-align: right; }
        .total-label { font-size: 11px; color: rgba(255,255,255,0.5); }
        .total-val { font-size: 24px; font-weight: 800; color: #F5BE27; }
        .yape-card {
          background: linear-gradient(135deg, #F5BE27, #e6a800); border-radius: 16px;
          padding: 24px; color: #111; margin-bottom: 24px;
        }
        .yape-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.7; }
        .yape-number { font-size: 28px; font-weight: 900; margin: 4px 0; }
        .upload-box {
          border: 2px dashed rgba(255,255,255,0.2); border-radius: 14px;
          padding: 28px; text-align: center; cursor: pointer; margin-bottom: 16px;
        }
        .upload-box:hover { border-color: #F5BE27; }
        .upload-box input { display: none; }
        .error-msg {
          background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3);
          color: #fca5a5; padding: 12px 16px; border-radius: 10px; font-size: 13px; margin-bottom: 16px;
        }
        .confirm-icon { font-size: 56px; text-align: center; margin-bottom: 16px; }
        .confirm-title { font-size: 24px; font-weight: 800; text-align: center; margin-bottom: 12px; }
        .confirm-text { font-size: 14px; color: rgba(255,255,255,0.7); text-align: center; line-height: 1.7; margin-bottom: 24px; }
        .whatsapp-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%; height: 48px; border-radius: 30px; background: #25D366; color: #fff;
          text-decoration: none; font-weight: 700; font-size: 13px;
        }
      `}</style>

      <div className="comprar-container">
        <div className="comprar-wrapper">
          <Link href="/rifa" className="btn-back">← Volver</Link>

          <div className="progress-bar">
            <div className={`progress-seg ${step >= 1 ? "active" : ""}`} />
            <div className={`progress-seg ${step >= 2 ? "active" : ""}`} />
            <div className={`progress-seg ${step >= 3 ? "active" : ""}`} />
          </div>
          <div className="step-label">Paso {step} de 3</div>

          {error && <div className="error-msg">{error}</div>}

          {step === 1 && (
            <form className="card" onSubmit={goToStep2}>
              <div className="field">
                <label>Nombre completo</label>
                <input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Ej: Carlos Mendoza" required />
              </div>
              <div className="field">
                <label>WhatsApp (9 dígitos)</label>
                <input value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="9XX XXX XXX" required />
              </div>
              <button type="submit" className="btn-gold">Continuar →</button>
            </form>
          )}

          {step === 2 && (
            <div className="card">
              <div className="qty-row">
                <div>
                  <div className="total-label">¿Cuántos boletos quieres?</div>
                  <div className="qty-controls" style={{ marginTop: 8 }}>
                    <button type="button" className="qty-btn" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>−</button>
                    <span className="qty-num">{quantity}</span>
                    <button type="button" className="qty-btn" onClick={() => setQuantity((q) => Math.min(50, q + 1))}>+</button>
                  </div>
                </div>
                <div className="total-row">
                  <div className="total-label">Total a pagar</div>
                  <div className="total-val">S/ {total}</div>
                </div>
              </div>

              <div className="yape-card">
                <div className="yape-label">Paga con Yape</div>
                <div className="yape-number">993 790 722</div>
                <div style={{ fontSize: 13 }}>Guerreros de Cristo</div>
              </div>

              <div className="field">
                <label>Comprobante de pago</label>
                <label className="upload-box">
                  <input type="file" accept="image/*" onChange={handleFileChange} />
                  {receiptImage ? (
                    <span>✅ {receiptFileName}</span>
                  ) : (
                    <span>📤 Toca para subir tu captura de Yape</span>
                  )}
                </label>
              </div>

              <button className="btn-gold" disabled={submitting} onClick={submitOrder}>
                {submitting ? "Enviando..." : "Enviar Pedido"}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="card">
              <div className="confirm-icon">🎉</div>
              <div className="confirm-title">¡Pedido recibido!</div>
              <p className="confirm-text">
                Tu pedido #{orderId} está en revisión. Un integrante del equipo validará tu comprobante
                y te confirmaremos por WhatsApp en cuanto tus boletos estén asignados.
              </p>
              <a
                href={`https://wa.me/${WHATSAPP_SOPORTE}?text=Hola,%20acabo%20de%20enviar%20el%20pedido%20%23${orderId}%20de%20la%20rifa`}
                target="_blank"
                rel="noopener noreferrer"
                className="whatsapp-btn"
              >
                Avisar por WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
