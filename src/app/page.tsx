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

export default function Home() {
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
        /* ── RESET & BASE ─────────────────────────────────────────────── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --gold:       #F5BE27;
          --gold-light: #FFD966;
          --gold-dim:   rgba(245,190,39,0.15);
          --gold-border:rgba(245,190,39,0.2);
          
          /* Paleta de Fondos de Sección */
          --ink:        #0a0a0a;
          --ink-2:      #121212;
          --surface:    #1a1a1a;
          --white:      #ffffff;
          --white-2:    #f8f9fa;
          --white-surface: #ffffff;
          
          /* Tipografía y opacidades base (Modificables por sección) */
          --font-display: 'Bebas Neue', 'Anton', 'Impact', system-ui, sans-serif;
          --font-body:    'Inter', 'Segoe UI', system-ui, sans-serif;
          --radius:     12px;
          --radius-lg:  20px;
        }
        html { scroll-behavior: smooth; }
        body { background: var(--ink); color: var(--white); font-family: var(--font-body); }
        img  { display: block; max-width: 100%; }

        /* ── VARIACIONES DE SECCIÓN (FONDOS Y TEXTOS) ─────────────────── */
        .bg-dark {
          background-color: var(--ink);
          color: var(--white);
        }
        .bg-dark .gc-title { color: var(--white); }
        .bg-dark .gc-subtitle { color: rgba(255,255,255,0.6); }
        .bg-dark .eyebrow { color: var(--gold); }
        .bg-dark .eyebrow::before, .bg-dark .eyebrow::after { background: var(--gold); }

        .bg-yellow {
          background-color: var(--gold);
          color: #111111;
        }
        .bg-yellow .gc-title { color: #000000; }
        .bg-yellow .gc-subtitle { color: rgba(0,0,0,0.7); }
        .bg-yellow .eyebrow { color: #000000; }
        .bg-yellow .eyebrow::before, .bg-yellow .eyebrow::after { background: #000000; }
        .bg-yellow .gc-rule { background: #000000; }

        .bg-white {
          background-color: var(--white-2);
          color: #222222;
        }
        .bg-white .gc-title { color: #111111; }
        .bg-white .gc-subtitle { color: #555555; }
        .bg-white .eyebrow { color: #b28504; }
        .bg-white .eyebrow::before, .bg-white .eyebrow::after { background: #b28504; }
        .bg-white .gc-rule { background: var(--gold); }

        /* ── TYPOGRAPHY ───────────────────────────────────────────────── */
        .display { font-family: var(--font-display); line-height: 0.92; letter-spacing: 0.02em; }
        .eyebrow {
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.22em;
          display: inline-flex; align-items: center; gap: 8px;
        }

        /* ── LAYOUT ───────────────────────────────────────────────────── */
        .gc-container {
          max-width: 1200px; margin: 0 auto; padding: 0 2rem;
        }
        .gc-section { padding: 100px 0; }

        /* ── SECTION TITLES ───────────────────────────────────────────── */
        .gc-title {
          font-family: var(--font-display); font-size: clamp(36px, 5vw, 60px);
          line-height: 1; margin: 12px 0 16px;
        }
        .gc-subtitle {
          font-size: 15px; line-height: 1.7; max-width: 520px;
        }
        .gc-title-block { margin-bottom: 64px; }

        /* ── GOLD LINE DIVIDER ────────────────────────────────────────── */
        .gc-rule {
          width: 48px; height: 2px; background: var(--gold); margin: 16px 0 0;
          border-radius: 2px;
        }

        /* ── BUTTONS ──────────────────────────────────────────────────── */
        .gc-btn {
          display: inline-flex; align-items: center; justify-content: center;
          gap: 8px; border: none; cursor: pointer; font-family: var(--font-body);
          font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em;
          text-decoration: none; transition: all 0.2s ease; white-space: nowrap;
          border-radius: 40px;
        }
        .gc-btn-lg { height: 52px; padding: 0 28px; font-size: 11px; }
        .gc-btn-md { height: 44px; padding: 0 22px; font-size: 11px; }
        .gc-btn-gold { background: #111111; color: var(--gold); }
        .bg-dark .gc-btn-gold { background: var(--gold); color: var(--ink); }
        .bg-white .gc-btn-gold { background: #111111; color: var(--gold); }
        .gc-btn-gold:hover { opacity: 0.9; transform: translateY(-1px); }
        .gc-btn-gold:active { transform: scale(0.97); }
        
        .gc-btn-outline {
          background: transparent;
          border: 1px solid currentColor;
          color: inherit;
        }
        .gc-btn-outline:hover {
          background: rgba(0,0,0,0.05);
        }
        .bg-dark .gc-btn-outline {
          border: 1px solid rgba(255,255,255,0.2);
          color: var(--white);
        }
        .bg-dark .gc-btn-outline:hover {
          border-color: var(--gold); color: var(--gold);
          background: var(--gold-dim);
        }
        .gc-btn-green { background: #16a34a; color: white; }
        .gc-btn-green:hover { background: #15803d; }

        /* ── CARDS POR SECCIÓN ────────────────────────────────────────── */
        /* Tarjetas adaptativas según el fondo de la sección */
        .bg-dark .gc-card, .bg-dark .tickets-card, .bg-dark .servicio-card, .bg-dark .testimonio-card, .bg-dark .contacto-card, .bg-dark .nosotros-stat {
          background: var(--surface);
          border: 1px solid rgba(255,255,255,0.06);
          color: var(--white);
        }
        .bg-yellow .gc-card, .bg-yellow .tickets-card, .bg-yellow .servicio-card, .bg-yellow .testimonio-card, .bg-yellow .contacto-card, .bg-yellow .nosotros-stat {
          background: #ffffff;
          border: 1px solid rgba(0,0,0,0.06);
          color: #111111;
        }
        .bg-white .gc-card, .bg-white .tickets-card, .bg-white .servicio-card, .bg-white .testimonio-card, .bg-white .contacto-card, .bg-white .nosotros-stat {
          background: var(--white-surface);
          border: 1px solid rgba(0,0,0,0.06);
          color: #222222;
        }
        
        .servicio-card h3, .testimonio-card .testimonio-author, .contacto-card p { color: inherit; }
        .bg-white .servicio-card h3, .bg-white .contacto-card p { color: #111111; }
        .bg-yellow .servicio-card h3, .bg-yellow .contacto-card p { color: #000000; }

        /* ════════════════════════════════════════════════════════════════
           HERO (Siempre Oscuro por el Video y Contraste de Capas)
        Target de Ajustes Específicos
        ════════════════════════════════════════════════════════════════ */
        .hero {
          position: relative; min-height: 100svh;
          display: flex; align-items: center;
          overflow: hidden;
        }
        .hero-video-bg {
          position: absolute; inset: 0; width: 100%; height: 100%;
          object-fit: cover; z-index: 0;
        }
        .hero-overlay {
          position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(
            135deg,
            rgba(10,10,10,0.94) 0%,
            rgba(10,10,10,0.75) 60%,
            rgba(10,10,10,0.60) 100%
          );
        }
        .hero-content {
          position: relative; z-index: 2;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 64px; align-items: center;
          padding-top: 100px; padding-bottom: 100px;
        }
        .hero-heading {
          font-family: var(--font-display);
          font-size: clamp(52px, 8vw, 110px);
          line-height: 0.9; color: var(--white);
          margin: 14px 0 24px;
        }
        .hero-heading span { color: var(--gold); }
        .hero-body {
          font-size: 15px; color: rgba(255,255,255,0.7); line-height: 1.75;
          max-width: 460px; margin-bottom: 36px;
        }
        .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
        .hero-right { position: relative; }
        .hero-video-frame {
          position: relative; border-radius: var(--radius-lg);
          overflow: hidden; aspect-ratio: 9/14;
          border: 1px solid var(--gold-border);
          box-shadow: 0 0 80px rgba(245,190,39,0.08);
        }
        .hero-video-frame video {
          width: 100%; height: 100%; object-fit: cover; display: block;
        }
        .hero-video-frame::after {
          content: '';
          position: absolute; top: -1px; left: -1px;
          width: 48px; height: 48px;
          border-top: 2px solid var(--gold);
          border-left: 2px solid var(--gold);
          border-radius: var(--radius-lg) 0 0 0;
          pointer-events: none;
        }
        .hero-group-img-wrap {
          width: 100%; margin: 28px 0 32px;
          border-radius: var(--radius-lg); overflow: hidden;
          border: 1px solid var(--gold-border);
          position: relative;
        }
        .hero-group-img-wrap img {
          width: 100%; height: 220px; object-fit: cover; object-position: center top;
          display: block;
        }
        .hero-stats {
          display: flex; gap: 32px; margin-top: 0;
          padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1);
        }
        .hero-stat-num {
          font-family: var(--font-display); font-size: 36px; color: var(--gold); line-height: 1;
        }
        .hero-stat-label {
          font-size: 10px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.1em; color: rgba(255,255,255,0.5); margin-top: 4px;
        }

        /* ════════════════════════════════════════════════════════════════
           TICKETS SECTION
        ════════════════════════════════════════════════════════════════ */
        .tickets-section {
          padding: 100px 0;
        }
        .tickets-inner {
          max-width: 680px; margin: 0 auto; padding: 0 2rem;
        }
        .tickets-card {
          border-radius: var(--radius-lg);
          padding: 48px;
        }
        .tickets-card-header { text-align: center; margin-bottom: 36px; }
        .tickets-form {
          display: flex; gap: 12px; margin-bottom: 24px;
        }
        .tickets-input-wrap { position: relative; flex: 1; }
        .tickets-input-icon {
          position: absolute; left: 16px; top: 50%; transform: translateY(-50%);
          color: #777777; font-size: 14px; pointer-events: none;
        }
        .tickets-input {
          width: 100%; height: 48px; padding: 0 16px 0 44px;
          background: rgba(0,0,0,0.04);
          border: 1px solid rgba(0,0,0,0.1);
          border-radius: 40px; color: inherit; font-size: 14px;
          font-family: var(--font-body); outline: none;
          transition: border-color 0.2s ease;
        }
        .bg-dark .tickets-input {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
        }
        .tickets-input:focus { border-color: var(--gold); }

        .tickets-error {
          padding: 14px 18px; background: rgba(239,68,68,0.08);
          border: 1px solid rgba(239,68,68,0.2); border-radius: var(--radius);
          color: #dc2626; font-size: 13px; margin-bottom: 20px;
          display: flex; align-items: center; gap: 8px;
        }
        .bg-dark .tickets-error { color: #fca5a5; }
        .ticket-result { animation: fadeUp 0.3s ease; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ticket-sold {
          background: rgba(0,0,0,0.03); border: 1px solid rgba(0,0,0,0.08);
          border-radius: var(--radius); overflow: hidden;
        }
        .bg-dark .ticket-sold { background: #111; border: 1px solid var(--gold-border); }
        .ticket-sold-header {
          padding: 20px 24px; border-bottom: 1px solid rgba(0,0,0,0.06);
          display: flex; justify-content: space-between; align-items: center;
        }
        .bg-dark .ticket-sold-header { border-bottom-color: rgba(255,255,255,0.06); }
        .ticket-num {
          font-family: var(--font-display); font-size: 28px; color: var(--gold);
        }
        .ticket-label { font-size: 11px; opacity: 0.6; margin-top: 2px; }
        .badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 12px; border-radius: 30px; font-size: 10px;
          font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
          border: 1px solid;
        }
        .badge-green {
          background: rgba(16,185,129,0.1); color: #059669; border-color: rgba(16,185,129,0.25);
        }
        .bg-dark .badge-green { color: #34d399; }
        .badge-amber {
          background: rgba(245,158,11,0.1); color: #d97706; border-color: rgba(245,158,11,0.25);
        }
        .bg-dark .badge-amber { color: #fbbf24; }
        .ticket-sold-body { padding: 20px 24px; }
        .ticket-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .ticket-field-label {
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.1em; opacity: 0.5; margin-bottom: 4px;
        }
        .ticket-field-value { font-size: 15px; font-weight: 700; }
        .ticket-field-sub { font-size: 12px; color: #b28504; margin-top: 2px; }
        .bg-dark .ticket-field-sub { color: var(--gold); }
        .ticket-sold-footer {
          padding: 14px 24px; border-top: 1px solid rgba(0,0,0,0.05);
          display: flex; justify-content: space-between; align-items: center;
          font-size: 12px;
        }
        .bg-dark .ticket-sold-footer { border-top-color: rgba(255,255,255,0.05); }
        
        .ticket-available {
          text-align: center; padding: 36px 24px;
          background: rgba(16,185,129,0.04);
          border: 1px solid rgba(16,185,129,0.15);
          border-radius: var(--radius);
        }
        .ticket-available-icon {
          font-size: 40px; color: #10b981; margin-bottom: 16px;
        }
        .ticket-available h4 {
          font-size: 18px; font-weight: 700; color: #10b981; margin-bottom: 8px;
        }
        .ticket-available p {
          font-size: 13px; opacity: 0.7; margin-bottom: 20px; line-height: 1.6;
        }

        /* ════════════════════════════════════════════════════════════════
           NOSOTROS
        ════════════════════════════════════════════════════════════════ */
        .nosotros-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center;
        }
        .nosotros-img-wrap {
          position: relative; border-radius: var(--radius-lg); overflow: hidden;
          aspect-ratio: 4/5;
        }
        .nosotros-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .nosotros-img-wrap::before {
          content: ''; position: absolute; bottom: -12px; right: -12px;
          width: 80px; height: 80px;
          border-bottom: 2px solid var(--gold); border-right: 2px solid var(--gold);
          border-radius: 0 0 var(--radius) 0; z-index: 1; pointer-events: none;
        }
        .nosotros-body { font-size: 15px; line-height: 1.8; opacity: 0.9; }
        .nosotros-body p + p { margin-top: 16px; }
        .nosotros-stats-row {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1px; margin-top: 48px;
          background: rgba(0,0,0,0.08); border-radius: var(--radius);
          overflow: hidden;
        }
        .bg-dark .nosotros-stats-row { background: rgba(255,255,255,0.06); }
        .nosotros-stat {
          padding: 24px 20px; text-align: center;
        }
        .nosotros-stat-num {
          font-family: var(--font-display); font-size: 40px; line-height: 1;
          color: #b28504;
        }
        .bg-dark .nosotros-stat-num { color: var(--gold); }
        .bg-yellow .nosotros-stat-num { color: #111; }
        .nosotros-stat-label {
          font-size: 10px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.1em; opacity: 0.5; margin-top: 6px;
        }

        /* ── SERVICIOS ────────────────────────────────────────────────── */
        .servicios-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
        }
        .servicio-card {
          overflow: hidden;
          transition: border-color 0.3s ease, transform 0.3s ease;
          display: flex; flex-direction: column;
          border-radius: var(--radius-lg);
        }
        .servicio-card:hover {
          border-color: var(--gold);
          transform: translateY(-4px);
        }
        .servicio-img-wrap { aspect-ratio: 16/9; overflow: hidden; position: relative; }
        .servicio-img-wrap img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.5s ease;
        }
        .servicio-card:hover .servicio-img-wrap img { transform: scale(1.04); }
        .servicio-body { padding: 28px; flex: 1; display: flex; flex-direction: column; }
        .servicio-icon-wrap {
          width: 44px; height: 44px; background: var(--gold-dim);
          border: 1px solid var(--gold-border); border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          color: #b28504; font-size: 18px; margin-bottom: 16px;
          flex-shrink: 0;
        }
        .bg-dark .servicio-icon-wrap { color: var(--gold); }
        .servicio-card h3 {
          font-size: 18px; font-weight: 800; margin-bottom: 10px;
        }
        .servicio-card p {
          font-size: 13px; opacity: 0.7; line-height: 1.7; margin-bottom: 20px;
        }
        .servicio-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: auto; }
        .servicio-tag {
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.06em; padding: 4px 10px; border-radius: 20px;
          background: rgba(0,0,0,0.04); color: inherit; opacity: 0.8;
          border: 1px solid rgba(0,0,0,0.06);
        }
        .bg-dark .servicio-tag {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
        }

        /* ── CAMPAMENTOS ──────────────────────────────────────────────── */
        .campamento-card {
          display: grid; grid-template-columns: 1fr 1fr; gap: 64px;
          align-items: center;
        }
        .campamento-img-wrap {
          border-radius: var(--radius-lg); overflow: hidden; aspect-ratio: 4/3;
          position: relative;
        }
        .campamento-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .campamento-img-wrap::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(10,10,10,0.5) 0%, transparent 50%);
        }
        .campamento-date-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 16px; border-radius: 30px;
          background: var(--gold-dim); border: 1px solid var(--gold-border);
          color: #b28504; font-size: 12px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 24px;
        }
        .bg-dark .campamento-date-badge { color: var(--gold); }
        .bg-yellow .campamento-date-badge { color: #111; border-color: rgba(0,0,0,0.1); background: rgba(0,0,0,0.05); }
        .campamento-title {
          font-family: var(--font-display); font-size: clamp(48px, 6vw, 72px);
          line-height: 0.9; margin-bottom: 8px;
        }
        .campamento-tagline {
          font-size: 13px; color: #b28504; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 20px;
        }
        .bg-dark .campamento-tagline { color: var(--gold); }
        .bg-yellow .campamento-tagline { color: #000; }
        .campamento-desc {
          font-size: 15px; opacity: 0.8; line-height: 1.75; margin-bottom: 32px;
        }
        .campamento-features-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 36px;
        }
        .campamento-feature {
          display: flex; align-items: center; gap: 10px;
          font-size: 12px; font-weight: 600; opacity: 0.9;
          text-transform: uppercase; letter-spacing: 0.06em;
        }

        /* ── GALERÍA ──────────────────────────────────────────────────── */
        .galeria-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: auto auto;
          gap: 12px;
        }
        .galeria-item {
          position: relative; overflow: hidden; border-radius: var(--radius);
          background-size: cover; background-position: center; aspect-ratio: 1;
          cursor: pointer;
        }
        .galeria-item:nth-child(1) { grid-column: span 2; grid-row: span 2; aspect-ratio: auto; }
        .galeria-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(10,10,10,0.85) 0%, transparent 60%);
          display: flex; align-items: flex-end; padding: 20px;
          opacity: 0; transition: opacity 0.3s ease;
        }
        .galeria-item:hover .galeria-overlay { opacity: 1; }
        .galeria-overlay p {
          font-size: 13px; font-weight: 700; color: white;
          text-transform: uppercase; letter-spacing: 0.08em;
        }

        /* ── TESTIMONIOS ──────────────────────────────────────────────── */
        .testimonios-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;
        }
        .testimonio-card {
          border-radius: var(--radius-lg); padding: 32px;
          display: flex; flex-direction: column; gap: 16px;
          transition: border-color 0.3s ease;
        }
        .testimonio-card:hover { border-color: var(--gold); }
        .testimonio-stars { color: var(--gold); font-size: 13px; letter-spacing: 2px; }
        .bg-yellow .testimonio-stars { color: #b28504; }
        .testimonio-quote {
          font-size: 15px; opacity: 0.85; line-height: 1.75; flex: 1;
          font-style: italic;
        }
        .testimonio-author {
          font-size: 12px; font-weight: 700; opacity: 0.6;
          text-transform: uppercase; letter-spacing: 0.1em;
          border-top: 1px solid rgba(0,0,0,0.06);
          padding-top: 16px;
        }
        .bg-dark .testimonio-author { border-top-color: rgba(255,255,255,0.07); }

        /* ── CONTACTO ─────────────────────────────────────────────────── */
        .contacto-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
        }
        .contacto-card {
          border-radius: var(--radius); padding: 24px 20px;
          text-align: center; transition: border-color 0.3s ease, transform 0.3s ease;
        }
        .contacto-card:hover { border-color: var(--gold); transform: translateY(-2px); }
        .contacto-card-icon {
          width: 48px; height: 48px; border-radius: 12px;
          background: var(--gold-dim); border: 1px solid var(--gold-border);
          display: flex; align-items: center; justify-content: center;
          color: #b28504; font-size: 20px; margin: 0 auto 16px;
        }
        .bg-dark .contacto-card-icon { color: var(--gold); }
        .contacto-card h4 {
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.12em; opacity: 0.5; margin-bottom: 6px;
        }

        /* ── FOOTER ───────────────────────────────────────────────────── */
        .gc-footer {
          background: #050505; border-top: 1px solid rgba(255,255,255,0.06);
          padding: 64px 0 32px; color: var(--white);
        }
        .footer-grid {
          display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 64px;
          margin-bottom: 48px;
        }
        .footer-brand-name {
          font-family: var(--font-display); font-size: 28px; color: white;
          margin: 12px 0 12px;
        }
        .footer-brand-name span { color: var(--gold); }
        .footer-brand-desc { font-size: 13px; color: rgba(255,255,255,0.5); line-height: 1.7; }
        .footer-col-title {
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.15em; color: rgba(255,255,255,0.4); margin-bottom: 20px;
        }
        .footer-links { list-style: none; display: flex; flex-direction: column; gap: 10px; }
        .footer-links a {
          font-size: 13px; color: rgba(255,255,255,0.7); text-decoration: none;
          transition: color 0.2s ease;
        }
        .footer-links a:hover { color: var(--gold); }
        .footer-socials { display: flex; gap: 10px; }
        .footer-social {
          width: 40px; height: 40px; border-radius: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          color: rgba(255,255,255,0.7); font-size: 15px; text-decoration: none;
          transition: all 0.2s ease;
        }
        .footer-social:hover { background: var(--gold-dim); border-color: var(--gold-border); color: var(--gold); }
        .footer-bottom {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 24px; text-align: center;
          font-size: 12px; color: rgba(255,255,255,0.4);
        }
        .footer-bottom span { color: var(--gold); }

        /* ── RESPONSIVE ───────────────────────────────────────────────── */
        @media (max-width: 1024px) {
          .hero-content        { grid-template-columns: 1fr; gap: 40px; }
          .hero-right          { display: none; }
          .hero-group-img-wrap img { height: 180px; }
          .nosotros-grid       { grid-template-columns: 1fr; }
          .nosotros-img-wrap   { aspect-ratio: 16/9; }
          .servicios-grid      { grid-template-columns: 1fr 1fr; }
          .campamento-card     { grid-template-columns: 1fr; gap: 40px; }
          .galeria-grid        { grid-template-columns: repeat(2, 1fr); }
          .galeria-item:nth-child(1) { grid-column: span 2; }
          .testimonios-grid    { grid-template-columns: 1fr; }
          .contacto-grid       { grid-template-columns: repeat(2, 1fr); }
          .footer-grid         { grid-template-columns: 1fr; gap: 40px; }
        }
        @media (max-width: 640px) {
          .gc-section          { padding: 64px 0; }
          .servicios-grid      { grid-template-columns: 1fr; }
          .tickets-card        { padding: 28px 20px; }
          .tickets-form        { flex-direction: column; }
          .contacto-grid       { grid-template-columns: repeat(2, 1fr); }
          .hero-stats          { gap: 20px; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { transition: none !important; animation: none !important; }
        }
      `}</style>

      <main>

        {/* 1. HERO (Siempre Oscuro para legibilidad de capas de video) */}
        <section id="inicio" className="hero bg-dark">
          <video className="hero-video-bg" autoPlay muted playsInline loop preload="auto" suppressHydrationWarning>
            <source src="/video/fondo.mp4" type="video/mp4" />
          </video>
          <div className="hero-overlay" />

          <div className="gc-container hero-content">
            <div className="hero-left">
              <span className="eyebrow">Cajamarca, Perú</span>
              <h1 className="hero-heading">
                GUERREROS<br /><span>DE CRISTO</span>
              </h1>
              <p className="hero-body">
                Más que un grupo, una familia: jóvenes en excelencia y servicio
                que te acompañan a descubrir, fortalecer y vivir tu fe en Dios.
              </p>
              <div className="hero-group-img-wrap">
                <img src="/imagenes/guerrerostodos.jpg" alt="Equipo Guerreros de Cristo" />
              </div>
              <div className="hero-actions">
                <button
                  className="gc-btn gc-btn-gold gc-btn-lg"
                  onClick={() => document.getElementById("servicios")?.scrollIntoView({ behavior: "smooth" })}
                >
                  <i className="fas fa-compass" />
                  Nuestros Servicios
                </button>
                <a
                  className="gc-btn gc-btn-outline gc-btn-lg"
                  href="https://wa.me/+51993790722"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-whatsapp" />
                  WhatsApp
                </a>
              </div>

              <div className="hero-stats">
                <div>
                  <div className="hero-stat-num">2+</div>
                  <div className="hero-stat-label">Años activos</div>
                </div>
                <div>
                  <div className="hero-stat-num">500+</div>
                  <div className="hero-stat-label">Eventos</div>
                </div>
                <div>
                  <div className="hero-stat-num">100%</div>
                  <div className="hero-stat-label">Compromiso</div>
                </div>
              </div>
            </div>

            <div className="hero-right">
              <div className="hero-video-frame">
                <video autoPlay muted playsInline loop preload="auto" suppressHydrationWarning>
                  <source src="/video/GUERREROS01.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </section>

        {/* 2. CONSULTA DE BOLETOS (Sección con fondo Amarillo/Oro) */}
        <section id="rifas" className="tickets-section bg-yellow">
          <div className="tickets-inner">
            <div className="tickets-card">
              <div className="tickets-card-header">
                <span className="eyebrow">Rifas</span>
                <h2 className="gc-title" style={{ fontSize: "clamp(28px,4vw,40px)", marginTop: 12 }}>
                  Consulta tu Boleto
                </h2>
                <p className="gc-subtitle" style={{ fontSize: 14, marginTop: 10 }}>
                  Ingresa el número de tu boleto para verificar su estado, quién lo compró y qué integrante lo registró.
                </p>
              </div>

              <form onSubmit={handleSearch} className="tickets-form">
                <div className="tickets-input-wrap">
                  <i className="fas fa-hashtag tickets-input-icon" />
                  <input
                    type="number"
                    placeholder="Ej. 7, 14, 25…"
                    value={ticketNumber}
                    onChange={(e) => setTicketNumber(e.target.value)}
                    className="tickets-input"
                    required
                  />
                </div>
                <button type="submit" disabled={searching} className="gc-btn gc-btn-gold gc-btn-md" style={{ minWidth: 140 }}>
                  {searching
                    ? <><i className="fas fa-spinner fa-spin" /> Buscando…</>
                    : <><i className="fas fa-search" /> Consultar</>
                  }
                </button>
              </form>

              {searchError && (
                <div className="tickets-error">
                  <i className="fas fa-exclamation-circle" />
                  {searchError}
                </div>
              )}

              {hasSearched && (
                <div className="ticket-result">
                  {ticket ? (
                    <div className="ticket-sold">
                      <div className="ticket-sold-header">
                        <div>
                          <div className="ticket-num">Boleto Nº {ticket.number}</div>
                          <div className="ticket-label">Rifa Pro Fondos · Guerreros de Cristo</div>
                        </div>
                        <span className={`badge ${ticket.paid ? "badge-green" : "badge-amber"}`}>
                          <i className={`fas ${ticket.paid ? "fa-check-circle" : "fa-clock"}`} />
                          {ticket.paid ? "Pagado" : "Pendiente"}
                        </span>
                      </div>
                      <div className="ticket-sold-body">
                        <div className="ticket-grid">
                          <div>
                            <div className="ticket-field-label">Comprado por</div>
                            <div className="ticket-field-value">{ticket.clientName}</div>
                            <div className="ticket-field-sub">{maskPhone(ticket.clientPhone)}</div>
                          </div>
                          <div>
                            <div className="ticket-field-label">Precio</div>
                            <div className="ticket-field-value">S/. {ticket.price.toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                      <div className="ticket-sold-footer">
                        <span>Registrado por <strong style={{ color: "inherit" }}>{ticket.soldBy?.name ?? "—"}</strong></span>
                        <span style={{ fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>Vendido</span>
                      </div>
                    </div>
                  ) : (
                    <div className="ticket-available">
                      <div className="ticket-available-icon"><i className="fas fa-check-circle" /></div>
                      <h4>¡El boleto Nº {ticketNumber} está disponible!</h4>
                      <p>Este número aún no fue comprado. Contáctanos para adquirirlo.</p>
                      <a
                        href={`https://wa.me/+51993790722?text=Quiero%20comprar%20el%20boleto%20número%20${ticketNumber}%20para%20la%20rifa`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="gc-btn gc-btn-green gc-btn-md"
                      >
                        <i className="fab fa-whatsapp" /> Comprar este boleto
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 3. NOSOTROS (Sección con fondo Blanco) */}
        <section id="nosotros" className="gc-section bg-white">
          <div className="gc-container">
            <div className="nosotros-grid">
              <div className="nosotros-img-wrap">
                <img src="/imagenes/grupo.jpg" alt="Equipo Guerreros de Cristo" />
              </div>

              <div>
                <span className="eyebrow">Quiénes somos</span>
                <h2 className="gc-title" style={{ marginTop: 12 }}>Una familia<br />de jóvenes<br />cristianos</h2>
                <div className="gc-rule" style={{ marginBottom: 28 }} />
                <div className="nosotros-body">
                  <p>
                    Somos un grupo de jóvenes comprometidos con los valores de la fe, el servicio y la
                    excelencia. Con <strong>más de 2 años de trayectoria</strong>, hemos marcado la diferencia en
                    Cajamarca a través de servicios profesionales y un compromiso genuino con la calidad.
                  </p>
                  <p>
                    Nuestra misión es servir con integridad, demostrando que la fe y la profesionalidad
                    van de la mano, y crear momentos memorables para cada persona que confía en nosotros.
                  </p>
                </div>

                <div className="nosotros-stats-row">
                  <div className="nosotros-stat">
                    <div className="nosotros-stat-num">2</div>
                    <div className="nosotros-stat-label">Años</div>
                  </div>
                  <div className="nosotros-stat">
                    <div className="nosotros-stat-num">500+</div>
                    <div className="nosotros-stat-label">Eventos</div>
                  </div>
                  <div className="nosotros-stat">
                    <div className="nosotros-stat-num">100%</div>
                    <div className="nosotros-stat-label">Satisfacción</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. SERVICIOS (Sección con fondo Negro) */}
        <section id="servicios" className="gc-section bg-dark">
          <div className="gc-container">
            <div className="gc-title-block">
              <span className="eyebrow">Lo que hacemos</span>
              <h2 className="gc-title" style={{ marginTop: 12 }}>Nuestros Servicios</h2>
              <div className="gc-rule" />
            </div>

            <div className="servicios-grid">
              {/* ESCOLTA */}
              <div className="servicio-card">
                <div className="servicio-img-wrap">
                  <img src="/imagenes/escolta.jpg" alt="Escolta de Honor" />
                </div>
                <div className="servicio-body">
                  <div className="servicio-icon-wrap"><i className="fas fa-users" /></div>
                  <h3>Escolta de Honor</h3>
                  <p>Cadetes profesionales para tus eventos especiales: elegancia, puntualidad y solemnidad garantizada.</p>
                  <div className="servicio-tags">
                    <span className="servicio-tag">Matrimonios</span>
                    <span className="servicio-tag">Quince años</span>
                    <span className="servicio-tag">Cumpleaños</span>
                    <span className="servicio-tag">Corporativos</span>
                  </div>
                </div>
              </div>

              {/* TRANSMISIONES */}
              <div className="servicio-card">
                <div className="servicio-img-wrap">
                  <img src="/imagenes/productora.jpg" alt="Transmisiones en Vivo" />
                </div>
                <div className="servicio-body">
                  <div className="servicio-icon-wrap"><i className="fas fa-video" /></div>
                  <h3>Transmisiones en Vivo</h3>
                  <p>Cobertura profesional en tiempo real de tus celebraciones religiosas y eventos especiales.</p>
                  <div className="servicio-tags">
                    <span className="servicio-tag">Celebraciones</span>
                    <span className="servicio-tag">Servicios religiosos</span>
                    <span className="servicio-tag">Multiplataforma</span>
                    <span className="servicio-tag">Calidad 4K</span>
                  </div>
                </div>
              </div>

              {/* PRODUCTORA */}
              <div className="servicio-card">
                <div className="servicio-img-wrap">
                  <img src="/imagenes/filmacion.jpg" alt="Productora Audiovisual" />
                </div>
                <div className="servicio-body">
                  <div className="servicio-icon-wrap"><i className="fas fa-film" /></div>
                  <h3>Productora Audiovisual</h3>
                  <p>Videoclips, ediciones profesionales y contenido audiovisual de alta calidad para tu marca o ministerio.</p>
                  <div className="servicio-tags">
                    <span className="servicio-tag">Videoclips</span>
                    <span className="servicio-tag">Edición</span>
                    <span className="servicio-tag">Motion Graphics</span>
                    <span className="servicio-tag">Contenido digital</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. CAMPAMENTOS (Sección con fondo Amarillo/Oro) */}
        <section id="campamentos" className="gc-section bg-yellow">
          <div className="gc-container">
            <div className="gc-title-block">
              <span className="eyebrow">Retiros espirituales</span>
              <h2 className="gc-title" style={{ marginTop: 12 }}>Campamentos</h2>
              <p className="gc-subtitle" style={{ marginTop: 12 }}>
                Experiencias transformadoras para jóvenes que buscan fortalecer su fe y comunidad.
              </p>
              <div className="gc-rule" />
            </div>

            <div className="campamento-card">
              <div className="campamento-img-wrap">
                <img src="/imagenes/roar.jpeg" alt="Campamento ROAR" />
              </div>
              <div>
                <div className="campamento-date-badge">
                  <i className="fas fa-calendar-alt" />
                  2 — 5 de Abril 2026
                </div>
                <div className="campamento-title">ROAR</div>
                <div className="campamento-tagline">El León Vuelve a Rugir</div>
                <p className="campamento-desc">
                  Un campamento transformador lleno de juegos, testimonios y momentos inolvidables.
                  Prepárate para una experiencia espiritual donde el león volverá a rugir en tu corazón.
                </p>
                <div className="campamento-features-grid">
                  {[
                    { icon: "fa-gamepad", label: "Juegos Interactivos" },
                    { icon: "fa-heart", label: "Testimonios" },
                    { icon: "fa-pray", label: "Actividades Espirituales" },
                    { icon: "fa-users", label: "Convivencia" },
                  ].map((f) => (
                    <div key={f.label} className="campamento-feature">
                      <i className={`fas ${f.icon}`} style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#111", fontSize: 13, flexShrink: 0 }} />
                      {f.label}
                    </div>
                  ))}
                </div>
                <a
                  href="https://wa.me/51993790722?text=Quiero%20más%20información%20sobre%20el%20campamento"
                  className="gc-btn gc-btn-gold gc-btn-lg"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  <i className="fab fa-whatsapp" />
                  Más información
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 6. GALERÍA (Sección con fondo Blanco) */}
        <section id="galeria" className="gc-section bg-white">
          <div className="gc-container">
            <div className="gc-title-block">
              <span className="eyebrow">Momentos</span>
              <h2 className="gc-title" style={{ marginTop: 12 }}>Galería</h2>
              <div className="gc-rule" />
            </div>
            <div className="galeria-grid">
              {[
                { img: "/imagenes/escolta1.jpg", label: "Escolta de Honor" },
                { img: "/imagenes/jl.jpg", label: "Transmisión en Vivo" },
                { img: "/imagenes/boda.jpg", label: "Matrimonios" },
                { img: "/imagenes/videoclip.jpg", label: "Videoclip" },
                { img: "/imagenes/eventoEespecial.jpg", label: "Obras de Caridad" },
                { img: "/imagenes/15.jpg", label: "Quince Años" },
                { img: "/imagenes/productora1.jpg", label: "Producción" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="galeria-item"
                  style={{ backgroundImage: `url('${item.img}')` }}
                >
                  <div className="galeria-overlay">
                    <p>{item.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. TESTIMONIOS (Sección con fondo Negro) */}
        <section className="gc-section bg-dark">
          <div className="gc-container">
            <div className="gc-title-block">
              <span className="eyebrow">Nuestros clientes</span>
              <h2 className="gc-title" style={{ marginTop: 12 }}>Testimonios</h2>
              <div className="gc-rule" />
            </div>
            <div className="testimonios-grid">
              {[
                {
                  quote: "Excelente servicio de escolta para nuestro matrimonio. Profesionales, puntuales y muy atentos. Recomendamos ampliamente a Guerreros de Cristo.",
                  author: "Andrea & Carlos",
                },
                {
                  quote: "Las transmisiones en vivo de la iglesia son de primera calidad. El equipo técnico es muy profesional y se nota el compromiso con el trabajo.",
                  author: "Pastor Juan",
                },
                {
                  quote: "El videoclip que hicieron fue espectacular. Edición, música, concepto: todo perfecto. Definitivamente volveremos a trabajar con ellos.",
                  author: "Marco Rodríguez",
                },
              ].map((t) => (
                <div key={t.author} className="testimonio-card">
                  <div className="testimonio-stars">{"★★★★★"}</div>
                  <p className="testimonio-quote">{t.quote}</p>
                  <div className="testimonio-author">{t.author}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8. CONTACTO (Sección con fondo Blanco) */}
        <section id="contacto" className="gc-section bg-white">
          <div className="gc-container">
            <div className="gc-title-block">
              <span className="eyebrow">Estamos para ti</span>
              <h2 className="gc-title" style={{ marginTop: 12 }}>Contáctanos</h2>
              <div className="gc-rule" />
            </div>
            <div className="contacto-grid">
              {[
                { icon: "fa-phone", label: "Teléfono", value: "+51 993 790 722" },
                { icon: "fa-whatsapp fab", label: "WhatsApp", value: "+51 993 790 722" },
                { icon: "fa-facebook-f fab", label: "Facebook", value: "Guerreros de Cristo" },
                { icon: "fa-tiktok fab", label: "TikTok", value: "Guerreros.dc" },
                { icon: "fa-youtube fab", label: "YouTube", value: "GC" },
                { icon: "fa-map-marker-alt", label: "Ubicación", value: "Baños del Inka, Cajamarca" },
                { icon: "fa-clock", label: "Horario", value: "Lun–Sáb  9am–6pm" },
              ].map((c) => (
                <div key={c.label} className="contacto-card">
                  <div className="contacto-card-icon">
                    <i className={`${c.icon.includes("fab") ? "fab" : "fas"} ${c.icon.replace(" fab", "")}`} />
                  </div>
                  <h4>{c.label}</h4>
                  <p>{c.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOOTER (Fondo siempre Oscuro Profundo para cierre de página) */}
        <footer className="gc-footer">
          <div className="gc-container">
            <div className="footer-grid">
              <div>
                <span className="eyebrow">Desde Cajamarca</span>
                <div className="footer-brand-name">GUERREROS <span>DE CRISTO</span></div>
                <p className="footer-brand-desc">
                  Jóvenes cristianos comprometidos con la fe, la excelencia y el servicio a la comunidad.
                </p>
              </div>
              <div>
                <div className="footer-col-title">Navegación</div>
                <ul className="footer-links">
                  <li><Link href="#inicio">Inicio</Link></li>
                  <li><Link href="#nosotros">Nosotros</Link></li>
                  <li><Link href="#servicios">Servicios</Link></li>
                  <li><Link href="#campamentos">Campamentos</Link></li>
                  <li><Link href="#galeria">Galería</Link></li>
                  <li><Link href="#contacto">Contacto</Link></li>
                </ul>
              </div>
              <div>
                <div className="footer-col-title">Síguenos</div>
                <div className="footer-socials">
                  <a href="https://www.facebook.com/profile.php?id=61565715748077" target="_blank" rel="noopener noreferrer" className="footer-social">
                    <i className="fab fa-facebook-f" />
                  </a>
                  <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social">
                    <i className="fab fa-instagram" />
                  </a>
                  <a href="https://www.youtube.com/@gcproducciones-f4e" target="_blank" rel="noopener noreferrer" className="footer-social">
                    <i className="fab fa-youtube" />
                  </a>
                  <a href="https://www.tiktok.com/@guerreros.dc?_r=1&_t=ZS-97KbIyu3xbt" target="_blank" rel="noopener noreferrer" className="footer-social">
                    <i className="fab fa-tiktok" />
                  </a>
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <p>© 2025 <span>Guerreros de Cristo</span>. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>

      </main>
    </>
  );
}