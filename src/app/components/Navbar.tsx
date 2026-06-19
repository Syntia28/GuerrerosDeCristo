"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";

interface User {
  name: string;
  role: string;
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
        else setUser(null);
      })
      .catch(() => setUser(null));
  }, []);

  const handleLogout = () => {
    startTransition(async () => {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setUser(null);
        window.location.href = "/";
      }
    });
  };

  const navLinks = [
    { name: "Inicio", href: "/#inicio" },
    { name: "Nosotros", href: "/#nosotros" },
    { name: "Servicios", href: "/#servicios" },
    { name: "Campamentos", href: "/campamentos" },
    { name: "Galería", href: "/#galeria" },
    { name: "Contacto", href: "/#contacto" },
    { name: "Rifas", href: "/rifa" },
  ];

  return (
    <>
      {/* ─── ESTILOS GLOBALES (inyectados una sola vez) ──────────────── */}
      <style>{`
        .gc-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          width: 100%;
          background: rgba(10, 10, 10, 0.97);
          border-bottom: 1px solid rgba(245, 190, 39, 0.12);
          -webkit-backdrop-filter: blur(8px);
          backdrop-filter: blur(8px);
          font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
        }

        /* ── INNER ── */
        .gc-nav-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 2rem;
          height: 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
        }

        /* ── LOGO ── */
        .gc-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none !important;
          flex-shrink: 0;
          user-select: none;
        }
        .gc-logo-icon {
          position: relative;
          width: 42px;
          height: 42px;
          background: #F5BE27;
          border-radius: 10px;
          flex-shrink: 0;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .gc-logo-text {
          display: flex;
          flex-direction: column;
          line-height: 1;
        }
        .gc-logo-main {
          font-size: 15px;
          font-weight: 800;
          color: #ffffff;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }
        .gc-logo-sub {
          font-size: 9px;
          font-weight: 700;
          color: #F5BE27;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          margin-top: 3px;
        }

        /* ── NAV LINKS ── */
        .gc-links {
          display: flex;
          align-items: center;
          gap: 2px;
          list-style: none;
          margin: 0;
          padding: 5px 8px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 40px;
        }
        .gc-links li {
          margin: 0;
          padding: 0;
        }
        .gc-links li a {
          display: flex;
          align-items: center;
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.55);
          text-decoration: none !important;
          padding: 7px 13px;
          border-radius: 30px;
          transition: color 0.2s ease, background 0.2s ease;
          white-space: nowrap;
        }
        .gc-links li a:hover {
          color: #F5BE27;
          background: rgba(245, 190, 39, 0.1);
        }

        /* ── RIGHT ACTIONS ── */
        .gc-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .gc-btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          height: 38px;
          padding: 0 18px;
          border-radius: 30px;
          border: 1px solid rgba(245, 190, 39, 0.35);
          color: #F5BE27;
          background: transparent;
          font-size: 10.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          text-decoration: none !important;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease;
          white-space: nowrap;
        }
        .gc-btn-ghost:hover {
          background: rgba(245, 190, 39, 0.08);
          border-color: rgba(245, 190, 39, 0.6);
        }

        .gc-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          height: 38px;
          padding: 0 20px;
          border-radius: 30px;
          background: #F5BE27;
          color: #111111 !important;
          font-size: 10.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          text-decoration: none !important;
          cursor: pointer;
          border: none;
          transition: background 0.2s ease, transform 0.15s ease;
          white-space: nowrap;
        }
        .gc-btn-primary:hover {
          background: #ffd15e;
          transform: translateY(-1px);
        }
        .gc-btn-primary:active {
          transform: scale(0.97);
        }

        .gc-btn-icon {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: color 0.2s ease, border-color 0.2s ease, background 0.2s ease;
          flex-shrink: 0;
          outline: none;
        }
        .gc-btn-icon:hover {
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.3);
          background: rgba(239, 68, 68, 0.06);
        }
        .gc-btn-icon:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .gc-divider {
          width: 1px;
          height: 20px;
          background: rgba(245, 190, 39, 0.2);
          flex-shrink: 0;
        }

        /* ── HAMBURGER ── */
        .gc-hamburger {
          display: none;
          flex-direction: column;
          gap: 5px;
          width: 40px;
          height: 40px;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 50%;
          cursor: pointer;
          flex-shrink: 0;
          outline: none;
        }
        .gc-hamburger-bar {
          display: block;
          width: 16px;
          height: 1.5px;
          background: #F5BE27;
          border-radius: 2px;
          transition: all 0.3s ease;
        }
        .gc-hamburger-bar.open-1 { transform: rotate(45deg) translate(4.5px, 4.5px); }
        .gc-hamburger-bar.open-2 { opacity: 0; transform: scaleX(0); }
        .gc-hamburger-bar.open-3 { transform: rotate(-45deg) translate(4.5px, -4.5px); }

        /* ── MOBILE MENU ── */
        .gc-mobile {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: max-height 0.35s ease, opacity 0.25s ease, padding 0.3s ease;
          border-top: 1px solid transparent;
          background: rgba(10, 10, 10, 0.99);
        }
        .gc-mobile.open {
          max-height: 600px;
          opacity: 1;
          padding: 1.25rem 1.5rem 1.75rem;
          border-top-color: rgba(245, 190, 39, 0.1);
        }
        .gc-mobile-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .gc-mobile-list li a {
          display: block;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none !important;
          padding: 11px 16px;
          border-radius: 10px;
          transition: color 0.2s ease, background 0.2s ease;
        }
        .gc-mobile-list li a:hover {
          color: #F5BE27;
          background: rgba(245, 190, 39, 0.07);
        }
        .gc-mobile-actions {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 12px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }
        .gc-mobile-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 44px;
          border-radius: 30px;
          background: #F5BE27;
          color: #111 !important;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          text-decoration: none !important;
          border: none;
          cursor: pointer;
          width: 100%;
          transition: background 0.2s ease;
        }
        .gc-mobile-primary:hover { background: #ffd15e; }
        .gc-mobile-ghost {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 44px;
          border-radius: 30px;
          border: 1px solid rgba(245, 190, 39, 0.35);
          color: #F5BE27 !important;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          text-decoration: none !important;
          background: transparent;
          transition: background 0.2s ease;
        }
        .gc-mobile-ghost:hover { background: rgba(245,190,39,0.08); }
        .gc-mobile-logout {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 44px;
          border-radius: 30px;
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          background: rgba(239, 68, 68, 0.04);
          width: 100%;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .gc-mobile-logout:hover { background: rgba(239,68,68,0.1); }
        .gc-mobile-logout:disabled { opacity: 0.4; cursor: not-allowed; }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) {
          .gc-links  { display: none !important; }
          .gc-actions { display: none !important; }
          .gc-hamburger { display: flex !important; }
        }
        @media (min-width: 1025px) {
          .gc-hamburger { display: none !important; }
          .gc-mobile { display: none !important; }
        }

        /* ── REDUCED MOTION ── */
        @media (prefers-reduced-motion: reduce) {
          .gc-hamburger-bar,
          .gc-mobile,
          .gc-btn-primary,
          .gc-links li a,
          .gc-btn-ghost,
          .gc-btn-icon { transition: none !important; }
        }
      `}</style>

      {/* ─── NAVBAR ──────────────────────────────────────────────────── */}
      <nav className="gc-nav">
        <div className="gc-nav-inner">

          {/* LOGO */}
          <Link href="/" className="gc-logo">
            <div className="gc-logo-icon">
              <Image
                src="/imagenes/logo.png"
                alt="Logo Guerreros de Cristo"
                fill
                className="object-contain"
                sizes="42px"
                priority
              />
            </div>
            <div className="gc-logo-text">
              <span className="gc-logo-main">Guerreros</span>
              <span className="gc-logo-sub">de Cristo</span>
            </div>
          </Link>

          {/* LINKS DESKTOP */}
          <ul className="gc-links">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.href}>{link.name}</Link>
              </li>
            ))}
          </ul>

          {/* ACCIONES DESKTOP */}
          <div className="gc-actions">
            {user ? (
              <>
                {user.role === "ADMIN" && (
                  <Link href="/dashboard/admin" className="gc-btn-ghost">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    Admin
                  </Link>
                )}
                <div className="gc-divider" />
                <Link href="/dashboard/member" className="gc-btn-primary">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Mi Panel
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={isPending}
                  className="gc-btn-icon"
                  title="Cerrar Sesión"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </>
            ) : (
              <Link href="/auth/login" className="gc-btn-primary">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Ingresar
              </Link>
            )}
          </div>

          {/* HAMBURGER MÓVIL */}
          <button
            className="gc-hamburger"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isOpen}
          >
            <span className={`gc-hamburger-bar${isOpen ? " open-1" : ""}`} />
            <span className={`gc-hamburger-bar${isOpen ? " open-2" : ""}`} />
            <span className={`gc-hamburger-bar${isOpen ? " open-3" : ""}`} />
          </button>
        </div>

        {/* MENÚ MÓVIL */}
        <div className={`gc-mobile${isOpen ? " open" : ""}`}>
          <ul className="gc-mobile-list">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.href} onClick={() => setIsOpen(false)}>
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>

          <div className="gc-mobile-actions">
            {user ? (
              <>
                {user.role === "ADMIN" && (
                  <Link
                    href="/dashboard/admin"
                    className="gc-mobile-ghost"
                    onClick={() => setIsOpen(false)}
                  >
                    Panel Admin
                  </Link>
                )}
                <Link
                  href="/dashboard/member"
                  className="gc-mobile-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Mi Panel
                </Link>
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  disabled={isPending}
                  className="gc-mobile-logout"
                >
                  {isPending ? "Cerrando..." : "Cerrar Sesión"}
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="gc-mobile-primary"
                onClick={() => setIsOpen(false)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Ingresar al Sistema
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}