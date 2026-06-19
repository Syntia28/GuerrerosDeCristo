"use client";

import { useState } from "react";
import Link from "next/link";

type Tab = "login" | "register";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<Tab>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setError("");
    setSuccess("");
    setName("");
    setUsername("");
    setPassword("");
    setShowPassword(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrPhone: username, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess("Sesión iniciada con éxito. Redirigiendo...");
        setTimeout(() => { window.location.href = "/dashboard/member"; }, 1000);
      } else {
        setError(data.error || "Usuario o contraseña incorrectos.");
      }
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess("Registro exitoso. Iniciando sesión...");
        setTimeout(() => { window.location.href = "/dashboard/member"; }, 1000);
      } else {
        setError(data.error || "Ocurrió un error al registrarse.");
      }
    } catch {
      setError("Error de red. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        /* ── BASE ─────────────────────────────────────────────────────── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --gold:        #F5BE27;
          --gold-hover:  #e6a800;
          --gold-dim:    rgba(245,190,39,0.12);
          --gold-glow:   rgba(245,190,39,0.25);
          --gold-border: rgba(245,190,39,0.25);
          --ink:         #080808;
          --surface:     #111111;
          --surface-2:   #1a1a1a;
          --border:      rgba(255,255,255,0.08);
          --border-2:    rgba(255,255,255,0.05);
          --white:       #ffffff;
          --muted:       rgba(255,255,255,0.38);
          --muted-2:     rgba(255,255,255,0.6);
          --red:         rgba(239,68,68,1);
          --red-bg:      rgba(239,68,68,0.08);
          --red-border:  rgba(239,68,68,0.2);
          --green:       rgba(52,211,153,1);
          --green-bg:    rgba(52,211,153,0.08);
          --green-border:rgba(52,211,153,0.2);
          --font: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
          --font-display: 'Bebas Neue', 'Anton', 'Impact', system-ui, sans-serif;
          --radius: 14px;
        }
        html, body { height: 100%; }
        body { font-family: var(--font); background: var(--ink); color: var(--white); }

        /* ── PAGE WRAPPER ─────────────────────────────────────────────── */
        .auth-page {
          min-height: 100svh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
          position: relative;
          overflow: hidden;
          background: var(--ink);
        }

        /* Ambient glow blobs */
        .auth-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(100px);
          pointer-events: none;
          opacity: 0.6;
        }
        .auth-blob-1 {
          width: 400px; height: 400px;
          background: rgba(245,190,39,0.07);
          top: -80px; left: -80px;
        }
        .auth-blob-2 {
          width: 300px; height: 300px;
          background: rgba(245,190,39,0.05);
          bottom: -60px; right: -60px;
        }
        .auth-blob-3 {
          width: 200px; height: 200px;
          background: rgba(100,60,180,0.06);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
        }

        /* ── CARD ─────────────────────────────────────────────────────── */
        .auth-card {
          position: relative; z-index: 10;
          width: 100%; max-width: 440px;
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 24px;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.03),
            0 32px 80px rgba(0,0,0,0.6),
            0 0 60px rgba(245,190,39,0.04);
        }

        /* gold top bar */
        .auth-card-topbar {
          height: 3px;
          background: linear-gradient(90deg, transparent 0%, var(--gold) 40%, var(--gold-hover) 60%, transparent 100%);
        }

        /* ── HEADER ───────────────────────────────────────────────────── */
        .auth-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 36px 40px 28px;
          text-align: center;
          border-bottom: 1px solid var(--border-2);
        }
        .auth-logo-ring {
          width: 80px; height: 80px;
          border-radius: 20px;
          background: var(--gold-dim);
          border: 1px solid var(--gold-border);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 20px;
          position: relative;
        }
        .auth-logo-ring::after {
          content: '';
          position: absolute; inset: -4px;
          border-radius: 24px;
          border: 1px solid rgba(245,190,39,0.1);
          pointer-events: none;
        }
        .auth-logo-ring img {
          width: 52px; height: 52px;
          object-fit: contain;
          display: block;
        }
        .auth-title {
          font-family: var(--font-display);
          font-size: 26px;
          color: var(--gold);
          letter-spacing: 0.12em;
          line-height: 1;
          margin-bottom: 6px;
        }
        .auth-subtitle {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          color: var(--muted);
        }

        /* ── TABS ─────────────────────────────────────────────────────── */
        .auth-tabs {
          display: flex;
          margin: 0;
          border-bottom: 1px solid var(--border);
        }
        .auth-tab {
          flex: 1;
          padding: 16px 12px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          text-align: center;
          background: transparent;
          border: none;
          cursor: pointer;
          color: var(--muted);
          position: relative;
          transition: color 0.2s ease;
          outline: none;
        }
        .auth-tab::after {
          content: '';
          position: absolute;
          bottom: -1px; left: 20%; right: 20%;
          height: 2px;
          background: var(--gold);
          border-radius: 2px;
          transform: scaleX(0);
          transition: transform 0.25s ease;
        }
        .auth-tab.active {
          color: var(--gold);
        }
        .auth-tab.active::after {
          transform: scaleX(1);
        }
        .auth-tab:hover:not(.active) { color: var(--muted-2); }

        /* ── FORM BODY ────────────────────────────────────────────────── */
        .auth-body {
          padding: 32px 40px 40px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        /* ── ALERTS ───────────────────────────────────────────────────── */
        .auth-alert {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 14px 16px;
          border-radius: 12px;
          font-size: 13px; font-weight: 500;
          line-height: 1.5;
          animation: alertIn 0.2s ease;
        }
        @keyframes alertIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .auth-alert svg { flex-shrink: 0; width: 18px; height: 18px; margin-top: 1px; }
        .auth-alert-error  { background: var(--red-bg);   border: 1px solid var(--red-border);   color: #fca5a5; }
        .auth-alert-success{ background: var(--green-bg); border: 1px solid var(--green-border); color: #6ee7b7; }

        /* ── FIELD ────────────────────────────────────────────────────── */
        .auth-field { display: flex; flex-direction: column; gap: 8px; }
        .auth-label {
          font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.14em;
          color: var(--muted-2);
          display: flex; align-items: center; gap: 6px;
        }
        .auth-label svg { width: 12px; height: 12px; opacity: 0.7; }
        .auth-input-wrap { position: relative; }
        .auth-input {
          width: 100%;
          height: 48px;
          padding: 0 16px;
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--white);
          font-size: 14px;
          font-family: var(--font);
          outline: none;
          transition: border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
          -webkit-appearance: none;
        }
        .auth-input::placeholder { color: var(--muted); }
        .auth-input:focus {
          border-color: var(--gold-border);
          background: rgba(245,190,39,0.04);
          box-shadow: 0 0 0 3px rgba(245,190,39,0.08);
        }
        .auth-input-with-toggle { padding-right: 48px; }

        /* toggle eye button */
        .auth-eye {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: transparent; border: none; cursor: pointer; padding: 4px;
          color: var(--muted); transition: color 0.2s ease; outline: none;
          display: flex; align-items: center; justify-content: center;
        }
        .auth-eye:hover { color: var(--white); }
        .auth-eye svg { width: 18px; height: 18px; }

        /* ── SUBMIT BUTTON ────────────────────────────────────────────── */
        .auth-submit {
          width: 100%;
          height: 52px;
          background: var(--gold);
          color: #0a0a0a;
          border: none;
          border-radius: 12px;
          font-size: 11.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: background 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
          box-shadow: 0 4px 24px var(--gold-glow);
          margin-top: 4px;
          outline: none;
          font-family: var(--font);
        }
        .auth-submit:hover:not(:disabled) {
          background: var(--gold-hover);
          box-shadow: 0 6px 32px rgba(245,190,39,0.4);
          transform: translateY(-1px);
        }
        .auth-submit:active:not(:disabled) { transform: scale(0.98); }
        .auth-submit:disabled { opacity: 0.5; cursor: not-allowed; }

        /* spinner */
        .auth-spinner {
          width: 20px; height: 20px;
          border: 2px solid rgba(0,0,0,0.3);
          border-top-color: #0a0a0a;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── DIVIDER ──────────────────────────────────────────────────── */
        .auth-divider {
          display: flex; align-items: center; gap: 12px;
          font-size: 10px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.12em; color: var(--muted);
        }
        .auth-divider::before, .auth-divider::after {
          content: ''; flex: 1; height: 1px; background: var(--border);
        }

        /* ── FOOTER LINK ──────────────────────────────────────────────── */
        .auth-footer-link {
          text-align: center;
          font-size: 12px; color: var(--muted);
        }
        .auth-footer-link a {
          color: var(--gold); font-weight: 600; text-decoration: none;
          transition: color 0.2s ease;
        }
        .auth-footer-link a:hover { color: var(--gold-hover); text-decoration: underline; }

        /* ── FIELD GROUP DIVIDER ──────────────────────────────────────── */
        .auth-fields-group {
          display: flex; flex-direction: column; gap: 16px;
        }

        /* ── RESPONSIVE ───────────────────────────────────────────────── */
        @media (max-width: 480px) {
          .auth-header { padding: 28px 24px 22px; }
          .auth-body   { padding: 24px 24px 32px; gap: 16px; }
          .auth-logo-ring { width: 68px; height: 68px; border-radius: 16px; }
          .auth-logo-ring img { width: 44px; height: 44px; }
          .auth-title  { font-size: 22px; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { transition: none !important; animation: none !important; }
        }
      `}</style>

      <div className="auth-page">
        {/* Ambient blobs */}
        <div className="auth-blob auth-blob-1" />
        <div className="auth-blob auth-blob-2" />
        <div className="auth-blob auth-blob-3" />

        <div className="auth-card">
          {/* Gold top bar */}
          <div className="auth-card-topbar" />

          {/* ── HEADER ── */}
          <div className="auth-header">
            <Link href="/" style={{ display: "block", marginBottom: 0 }}>
              <div className="auth-logo-ring">
                <img src="/imagenes/logo.png" alt="Logo Guerreros de Cristo" />
              </div>
            </Link>
            <div className="auth-title">INTEGRANTES GC</div>
            <div className="auth-subtitle">Control de Rifas y Ventas</div>
          </div>

          {/* ── TABS ── */}
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab${activeTab === "login" ? " active" : ""}`}
              onClick={() => handleTabChange("login")}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              className={`auth-tab${activeTab === "register" ? " active" : ""}`}
              onClick={() => handleTabChange("register")}
            >
              Registrarse
            </button>
          </div>

          {/* ── BODY ── */}
          <div className="auth-body">

            {/* Alerts */}
            {error && (
              <div className="auth-alert auth-alert-error">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="auth-alert auth-alert-success">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{success}</span>
              </div>
            )}

            {/* ── LOGIN FORM ── */}
            {activeTab === "login" && (
              <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div className="auth-fields-group">
                  {/* Usuario */}
                  <div className="auth-field">
                    <label className="auth-label">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Usuario de Integrante
                    </label>
                    <div className="auth-input-wrap">
                      <input
                        type="text"
                        placeholder="Ingresa tu usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="auth-input"
                        autoComplete="username"
                        required
                      />
                    </div>
                  </div>

                  {/* Contraseña */}
                  <div className="auth-field">
                    <label className="auth-label">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Contraseña
                    </label>
                    <div className="auth-input-wrap">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Ingresa tu contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="auth-input auth-input-with-toggle"
                        autoComplete="current-password"
                        required
                      />
                      <button type="button" className="auth-eye" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? (
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                          </svg>
                        ) : (
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="auth-submit">
                  {loading ? (
                    <div className="auth-spinner" />
                  ) : (
                    <>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                          d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />
                      </svg>
                      Iniciar Sesión
                    </>
                  )}
                </button>

                <div className="auth-footer-link">
                  ¿No tienes cuenta?{" "}
                  <a href="#" onClick={(e) => { e.preventDefault(); handleTabChange("register"); }}>
                    Regístrate aquí
                  </a>
                </div>
              </form>
            )}

            {/* ── REGISTER FORM ── */}
            {activeTab === "register" && (
              <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div className="auth-fields-group">
                  {/* Nombre */}
                  <div className="auth-field">
                    <label className="auth-label">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Nombre Completo
                    </label>
                    <div className="auth-input-wrap">
                      <input
                        type="text"
                        placeholder="Ej. Juan Pérez"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="auth-input"
                        autoComplete="name"
                        required
                      />
                    </div>
                  </div>

                  {/* Username */}
                  <div className="auth-field">
                    <label className="auth-label">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Nombre de Usuario
                    </label>
                    <div className="auth-input-wrap">
                      <input
                        type="text"
                        placeholder="Ej. jperez"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="auth-input"
                        autoComplete="username"
                        required
                      />
                    </div>
                  </div>

                  {/* Contraseña */}
                  <div className="auth-field">
                    <label className="auth-label">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Contraseña
                    </label>
                    <div className="auth-input-wrap">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Crea tu contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="auth-input auth-input-with-toggle"
                        autoComplete="new-password"
                        required
                      />
                      <button type="button" className="auth-eye" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? (
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                          </svg>
                        ) : (
                          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="auth-submit">
                  {loading ? (
                    <div className="auth-spinner" />
                  ) : (
                    <>
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
                          d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      Registrarse como Integrante
                    </>
                  )}
                </button>

                <div className="auth-footer-link">
                  ¿Ya tienes cuenta?{" "}
                  <a href="#" onClick={(e) => { e.preventDefault(); handleTabChange("login"); }}>
                    Inicia sesión aquí
                  </a>
                </div>
              </form>
            )}

            {/* Back to home */}
            <div className="auth-divider">Inicio</div>
            <div className="auth-footer-link">
              <Link href="/" style={{ color: "var(--muted)", fontSize: 12, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver al sitio principal
              </Link>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}