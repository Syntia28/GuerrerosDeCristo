"use client";

import { useState } from "react";
import Link from "next/link";

interface Ticket {
  id: number;
  number: number;
  clientName: string;
  clientPhone: string;
  paid: boolean;
  price: number;
  soldBy?: { name: string };
}

const maskPhone = (phone: string) => {
  if (phone.length <= 6) return phone;
  return `${phone.substring(0, 3)}***${phone.substring(phone.length - 3)}`;
};

export default function RifaPage() {
  const [ticketNumber, setTicketNumber] = useState("");
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketNumber.trim()) return;
    setSearching(true);
    setSearchError("");
    setTicket(null);
    setHasSearched(false);
    try {
      const res = await fetch(`/api/tickets?number=${encodeURIComponent(ticketNumber.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setTicket(data.ticket);
        setHasSearched(true);
      } else {
        const errorData = await res.json();
        setSearchError(errorData.error || "Ocurrió un error al buscar el boleto.");
      }
    } catch {
      setSearchError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <>
      <style>{`
        :root {
          --gold:       #F5BE27;
          --gold-hover:  #e6a800;
          --gold-dim:   rgba(245,190,39,0.15);
          --gold-border:rgba(245,190,39,0.25);
          --ink:        #0a0a0a;
          --surface:    #121212;
          --surface-light: #1c1c1c;
          --white:      #ffffff;
          --font-display: 'Bebas Neue', 'Anton', 'Impact', system-ui, sans-serif;
          --font-body:    'Inter', 'Segoe UI', system-ui, sans-serif;
          --radius:     12px;
          --radius-lg:  20px;
        }

        .rifa-container {
          min-height: 100svh;
          background: linear-gradient(135deg, #0f0f0f 0%, #050505 100%);
          color: var(--white);
          font-family: var(--font-body);
          padding-top: 100px;
          padding-bottom: 60px;
        }

        .rifa-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 48px;
          align-items: start;
        }

        @media (max-width: 1024px) {
          .rifa-wrapper {
            grid-template-columns: 1fr;
            gap: 40px;
          }
        }

        /* ── VOLVER LINK ── */
        .btn-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 24px;
          transition: color 0.2s ease;
        }
        .btn-back:hover {
          color: var(--gold);
        }

        /* ── INFO CARD (LEFT) ── */
        .rifa-info-card {
          background: var(--surface);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-lg);
          padding: 40px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
          position: relative;
          overflow: hidden;
        }
        .rifa-info-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--gold), var(--gold-hover));
        }

        .rifa-eyebrow {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.22em;
          color: var(--gold);
          display: block;
          margin-bottom: 12px;
        }

        .rifa-title {
          font-family: var(--font-display);
          font-size: clamp(36px, 5vw, 64px);
          line-height: 0.95;
          color: var(--white);
          margin-bottom: 16px;
        }
        .rifa-title span {
          color: var(--gold);
        }

        .rifa-desc {
          font-size: 15px;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.7;
          margin-bottom: 32px;
        }

        /* ── PREMIOS GRID ── */
        .premios-section-title {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .premios-section-title::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(255, 255, 255, 0.08);
        }

        .premios-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 36px;
        }

        .premio-item {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: var(--radius);
          padding: 18px 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          transition: transform 0.2s ease, border-color 0.2s ease;
        }
        .premio-item:hover {
          transform: translateX(4px);
          border-color: var(--gold-border);
          background: rgba(245, 190, 39, 0.02);
        }

        .premio-num {
          font-family: var(--font-display);
          font-size: 28px;
          color: var(--gold);
          width: 36px;
          flex-shrink: 0;
        }

        .premio-icon {
          font-size: 24px;
          color: var(--gold);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          background: var(--gold-dim);
          border-radius: 10px;
          border: 1px solid var(--gold-border);
          flex-shrink: 0;
        }

        .premio-name {
          font-size: 18px;
          font-weight: 700;
          color: var(--white);
        }

        /* ── BADGES ROW ── */
        .info-badges-row {
          display: grid;
          grid-template-columns: 1fr 1.2fr;
          gap: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 28px;
        }
        @media (max-width: 640px) {
          .info-badges-row {
            grid-template-columns: 1fr;
          }
        }

        .info-badge-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: var(--radius);
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
        }
        .info-badge-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 6px;
        }
        .info-badge-val {
          font-size: 20px;
          font-weight: 800;
          color: var(--gold);
        }

        /* ── LOOKUP CARD (RIGHT) ── */
        .lookup-card {
          background: var(--surface);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-lg);
          padding: 40px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
        }

        .lookup-title {
          font-family: var(--font-display);
          font-size: 32px;
          line-height: 1.1;
          color: var(--white);
          margin-bottom: 8px;
        }

        .lookup-subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.5);
          line-height: 1.5;
          margin-bottom: 28px;
        }

        .lookup-form {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }
        @media (max-width: 640px) {
          .lookup-form {
            flex-direction: column;
          }
        }

        .input-wrap {
          position: relative;
          flex: 1;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255, 255, 255, 0.4);
          font-size: 14px;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          height: 48px;
          padding: 0 16px 0 44px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 40px;
          color: var(--white);
          font-size: 14px;
          outline: none;
          font-family: var(--font-body);
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .search-input:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(245, 190, 39, 0.1);
        }

        .btn-search {
          height: 48px;
          padding: 0 28px;
          background: var(--gold);
          color: var(--ink);
          font-weight: 700;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border: none;
          border-radius: 40px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background-color 0.2s ease, transform 0.15s ease;
        }
        .btn-search:hover {
          background: var(--gold-hover);
        }
        .btn-search:active {
          transform: scale(0.97);
        }
        .btn-search:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-comprar-whatsapp {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          height: 48px;
          background: #25D366;
          color: #ffffff !important;
          border: none;
          border-radius: 40px;
          font-family: var(--font-body);
          font-size: 13.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          text-decoration: none !important;
          cursor: pointer;
          transition: background-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
          margin-bottom: 24px;
          box-shadow: 0 4px 14px rgba(37, 211, 102, 0.2);
        }
        .btn-comprar-whatsapp:hover {
          background: #20ba5a;
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(37, 211, 102, 0.35);
        }
        .btn-comprar-whatsapp:active {
          transform: scale(0.98);
        }

        .error-message {
          padding: 14px 18px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: var(--radius);
          color: #fca5a5;
          font-size: 13px;
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          animation: fadeUp 0.3s ease;
        }

        .ticket-result-card {
          animation: fadeUp 0.3s ease;
        }

        .ticket-sold-box {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--gold-border);
          border-radius: var(--radius);
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .ticket-sold-header {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .ticket-num-display {
          font-family: var(--font-display);
          font-size: 28px;
          color: var(--gold);
        }
        .ticket-num-sub {
          font-size: 11px;
          opacity: 0.5;
          margin-top: 2px;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 30px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          border: 1px solid;
        }
        .status-badge-paid {
          background: rgba(16, 185, 129, 0.1);
          color: #34d399;
          border-color: rgba(16, 185, 129, 0.25);
        }
        .status-badge-pending {
          background: rgba(245, 158, 11, 0.1);
          color: #fbbf24;
          border-color: rgba(245, 158, 11, 0.25);
        }

        .ticket-sold-body {
          padding: 20px 24px;
        }

        .ticket-details-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .detail-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          opacity: 0.5;
          margin-bottom: 4px;
        }
        .detail-val {
          font-size: 15px;
          font-weight: 700;
          color: var(--white);
        }
        .detail-sub {
          font-size: 12px;
          color: var(--gold);
          margin-top: 2px;
        }

        .ticket-sold-footer {
          padding: 14px 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          background: rgba(0, 0, 0, 0.15);
        }
        .ticket-sold-footer span {
          opacity: 0.7;
        }
        .ticket-sold-footer strong {
          color: var(--gold);
        }

        /* Available status view */
        .ticket-available-box {
          text-align: center;
          padding: 40px 24px;
          background: rgba(16, 185, 129, 0.02);
          border: 1px solid rgba(16, 185, 129, 0.15);
          border-radius: var(--radius);
        }

        .available-icon {
          font-size: 40px;
          color: #10b981;
          margin-bottom: 16px;
        }

        .available-title {
          font-size: 18px;
          font-weight: 700;
          color: #10b981;
          margin-bottom: 8px;
        }

        .available-text {
          font-size: 13px;
          opacity: 0.7;
          line-height: 1.6;
          margin-bottom: 20px;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="rifa-container">
        <div className="rifa-wrapper">
          
          {/* COLUMNA IZQUIERDA: DETALLES DE LA RIFA */}
          <div>
            <Link href="/" className="btn-back">
              <i className="fas fa-arrow-left"></i> Volver al Inicio
            </Link>

            <div className="rifa-info-card">
              <span className="rifa-eyebrow">Evento Especial</span>
              <h1 className="rifa-title">
                GRAN RIFA<br /><span>PRO-FONDOS</span>
              </h1>
              <p className="rifa-desc">
                Apoya a los jóvenes de <strong>Guerreros de Cristo</strong> en sus actividades y campamentos participando de esta gran rifa. ¡Tú puedes ganar uno de nuestros increíbles premios y ayudarnos a seguir sirviendo con excelencia!
              </p>

              <span className="premios-section-title">
                <i className="fas fa-trophy text-[#F5BE27]"></i> Premios del Sorteo
              </span>

              <div className="premios-list">
                <div className="premio-item">
                  <span className="premio-num">01</span>
                  <div className="premio-icon"><i className="fas fa-snowflake"></i></div>
                  <span className="premio-name">Refrigeradora</span>
                </div>
                <div className="premio-item">
                  <span className="premio-num">02</span>
                  <div className="premio-icon"><i className="fas fa-fire"></i></div>
                  <span className="premio-name">Cocina</span>
                </div>
                <div className="premio-item">
                  <span className="premio-num">03</span>
                  <div className="premio-icon"><i className="fas fa-blender"></i></div>
                  <span className="premio-name">Licuadora</span>
                </div>
                <div className="premio-item">
                  <span className="premio-num">++</span>
                  <div className="premio-icon"><i className="fas fa-gift"></i></div>
                  <span className="premio-name">¡Y muchos premios más!</span>
                </div>
              </div>

              <a
                href="https://wa.me/51993790722?text=Hola,%20quiero%20comprar%20un%20boleto%20para%20la%20rifa"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-comprar-whatsapp"
              >
                <i className="fab fa-whatsapp" style={{ fontSize: 18 }}></i>
                Quiero Comprar
              </a>

              <div className="info-badges-row">
                <div className="info-badge-card">
                  <span className="info-badge-label">Valor del Boleto</span>
                  <span className="info-badge-val">S/. 5.00</span>
                </div>
                <div className="info-badge-card">
                  <span className="info-badge-label">Fecha del Sorteo</span>
                  <span className="info-badge-val">30 de Julio · 8:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: CONSULTADOR DE BOLETOS */}
          <div className="lookup-card">
            <h2 className="lookup-title">Consulta tu Boleto</h2>
            <p className="lookup-subtitle">
              Ingresa el número de tu boleto para verificar su estado de compra, los datos de registro y qué integrante lo vendió.
            </p>

            <form onSubmit={handleSearch} className="lookup-form">
              <div className="input-wrap">
                <i className="fas fa-hashtag input-icon"></i>
                <input
                  type="number"
                  placeholder="Ej: 7, 14, 25..."
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value)}
                  className="search-input"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={searching}
                className="btn-search"
              >
                {searching ? (
                  <><i className="fas fa-spinner fa-spin"></i> Buscando...</>
                ) : (
                  <><i className="fas fa-search"></i> Consultar</>
                )}
              </button>
            </form>

            {searchError && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                <span>{searchError}</span>
              </div>
            )}

            {hasSearched && (
              <div className="ticket-result-card">
                {ticket ? (
                  <div className="ticket-sold-box">
                    <div className="ticket-sold-header">
                      <div>
                        <div className="ticket-num-display">Boleto Nº {ticket.number}</div>
                        <div className="ticket-num-sub">Rifa Pro Fondos · Guerreros de Cristo</div>
                      </div>
                      <span className={`status-badge ${ticket.paid ? "status-badge-paid" : "status-badge-pending"}`}>
                        <i className={`fas ${ticket.paid ? "fa-check-circle" : "fa-clock"}`}></i>
                        {ticket.paid ? "Pagado" : "Pendiente"}
                      </span>
                    </div>

                    <div className="ticket-sold-body">
                      <div className="ticket-details-grid">
                        <div>
                          <span className="detail-label">Comprado por</span>
                          <span className="detail-val">{ticket.clientName}</span>
                          <span className="detail-sub">{maskPhone(ticket.clientPhone)}</span>
                        </div>
                        <div>
                          <span className="detail-label">Precio</span>
                          <span className="detail-val">S/. {ticket.price.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="ticket-sold-footer">
                      <span>Registrado por: <strong>{ticket.soldBy?.name ?? "—"}</strong></span>
                      <strong className="text-[11px] uppercase tracking-wider text-emerald-400">Vendido</strong>
                    </div>
                  </div>
                ) : (
                  <div className="ticket-available-box">
                    <i className="fas fa-check-circle available-icon"></i>
                    <h3 className="available-title">Boleto Disponible</h3>
                    <p className="available-text">
                      Este número de boleto aún no ha sido registrado. Si deseas adquirirlo, por favor ponte en contacto con alguno de nuestros integrantes autorizados.
                    </p>
                    <a
                      href={`https://wa.me/51993790722?text=Hola,%20quiero%20comprar%20el%20boleto%20Nº%20${ticketNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-search bg-[#25D366] hover:bg-[#20ba5a] text-white"
                      style={{ height: 40, fontSize: 11, border: "none" }}
                    >
                      <i className="fab fa-whatsapp"></i> Quiero Comprar
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
