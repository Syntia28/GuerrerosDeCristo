"use client";

import { useState } from "react";
import Link from "next/link";

interface Camp {
  id: string;
  title: string;
  tagline: string;
  date: string;
  description: string;
  features: { icon: string; label: string }[];
  images: string[];
}

export default function CampamentosPage() {
  // Array of camps data
  const camps: Camp[] = [
    {
      id: "roar",
      title: "Campamento ROAR",
      tagline: "El León Vuelve a Rugir",
      date: "2 — 5 de Abril 2026",
      description: "Un campamento transformador lleno de juegos interactivos, testimonios profundos y momentos de oración inolvidables. Diseñado para jóvenes que quieren despertar su liderazgo espiritual y renovar su fe con fuerza y valentía.",
      features: [
        { icon: "fa-gamepad", label: "Juegos Interactivos" },
        { icon: "fa-heart", label: "Testimonios" },
        { icon: "fa-pray", label: "Actividades Espirituales" },
        { icon: "fa-users", label: "Convivencia" },
      ],
      images: [
        "/imagenes/roar.jpeg",
        "/imagenes/roar.jpg",
        "/imagenes/roar2.jpg"
      ]
    },

  ];

  // State to track active main image for each camp
  const [activeImages, setActiveImages] = useState<Record<string, string>>({
    roar: "/imagenes/roar.jpeg",
    road: "/imagenes/roadjub.jpg",
    jl: "/imagenes/jl.jpg"
  });

  const handleThumbnailClick = (campId: string, imageSrc: string) => {
    setActiveImages((prev) => ({
      ...prev,
      [campId]: imageSrc
    }));
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

        .camps-container {
          min-height: 100svh;
          background: linear-gradient(135deg, #0d0d0d 0%, #030303 100%);
          color: var(--white);
          font-family: var(--font-body);
          padding-top: 100px;
          padding-bottom: 80px;
        }

        .camps-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .camps-header {
          text-align: center;
          margin-bottom: 60px;
          border-bottom: 1px solid rgba(245, 190, 39, 0.12);
          padding-bottom: 32px;
          position: relative;
        }
        
        .btn-back-home {
          position: absolute;
          left: 0;
          top: 0;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          transition: color 0.2s ease;
        }
        .btn-back-home:hover {
          color: var(--gold);
        }

        @media (max-width: 1024px) {
          .btn-back-home {
            position: relative;
            margin-bottom: 24px;
            display: inline-block;
            text-align: left;
          }
        }

        .camps-eyebrow {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.25em;
          color: var(--gold);
          display: block;
          margin-bottom: 12px;
        }

        .camps-main-title {
          font-family: var(--font-display);
          font-size: clamp(40px, 6vw, 72px);
          line-height: 0.95;
          color: var(--white);
          margin-bottom: 16px;
        }
        .camps-main-title span {
          color: var(--gold);
        }

        .camps-main-desc {
          font-size: 16px;
          color: rgba(255, 255, 255, 0.6);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* ── CAMP CARDS ── */
        .camp-cards-list {
          display: flex;
          flex-direction: column;
          gap: 60px;
        }

        .camp-card-item {
          background: var(--surface);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-lg);
          padding: 40px;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 48px;
          align-items: center;
          transition: border-color 0.3s ease;
        }
        .camp-card-item:hover {
          border-color: var(--gold-border);
        }

        @media (max-width: 900px) {
          .camp-card-item {
            grid-template-columns: 1fr;
            padding: 24px;
            gap: 28px;
          }
        }

        /* CARD IMAGE GALLERY SIDE */
        .camp-gallery-side {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .camp-main-image-wrap {
          border-radius: var(--radius);
          overflow: hidden;
          aspect-ratio: 4/3;
          border: 1px solid rgba(255, 255, 255, 0.08);
          position: relative;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }
        .camp-main-image-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .camp-card-item:hover .camp-main-image-wrap img {
          transform: scale(1.02);
        }

        .camp-thumbnails-row {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .camp-thumbnail-btn {
          width: 80px;
          height: 60px;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid transparent;
          background: none;
          padding: 0;
          cursor: pointer;
          flex-shrink: 0;
          transition: border-color 0.2s ease, transform 0.2s ease;
        }
        .camp-thumbnail-btn:hover {
          transform: translateY(-2px);
        }
        .camp-thumbnail-btn.active {
          border-color: var(--gold);
          transform: translateY(-2px);
          box-shadow: 0 0 10px rgba(245, 190, 39, 0.3);
        }
        .camp-thumbnail-btn img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* CARD INFO SIDE */
        .camp-info-side {
          display: flex;
          flex-direction: column;
        }

        .camp-date-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 30px;
          background: var(--gold-dim);
          border: 1px solid var(--gold-border);
          color: var(--gold);
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          align-self: start;
          margin-bottom: 20px;
        }

        .camp-title {
          font-family: var(--font-display);
          font-size: clamp(32px, 4vw, 48px);
          color: var(--white);
          line-height: 1;
          margin-bottom: 4px;
        }

        .camp-tagline {
          font-size: 13px;
          color: var(--gold);
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          margin-bottom: 18px;
        }

        .camp-desc-text {
          font-size: 14.5px;
          color: rgba(255, 255, 255, 0.7);
          line-height: 1.7;
          margin-bottom: 24px;
        }

        /* Features */
        .camp-features-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 28px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding-top: 20px;
        }
        @media (max-width: 480px) {
          .camp-features-grid {
            grid-template-columns: 1fr;
          }
        }

        .camp-feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12.5px;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.85);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .camp-feature-icon {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gold);
          font-size: 14px;
          flex-shrink: 0;
        }

        .btn-camp-cta {
          height: 48px;
          background: var(--gold);
          color: var(--ink);
          font-weight: 800;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          border-radius: 40px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background-color 0.2s ease, transform 0.15s ease;
          box-shadow: 0 4px 20px rgba(245, 190, 39, 0.2);
        }
        .btn-camp-cta:hover {
          background: var(--gold-hover);
        }
        .btn-camp-cta:active {
          transform: scale(0.97);
        }
      `}</style>

      <div className="camps-container">
        <div className="camps-wrapper">

          {/* HEADER */}
          <header className="camps-header">
            <Link href="/" className="btn-back-home">
              <i className="fas fa-arrow-left"></i> Volver al Inicio
            </Link>
            <span className="camps-eyebrow">Retiros y Convivencias</span>
            <h1 className="camps-main-title">NUESTROS <span>CAMPAMENTOS</span></h1>
            <p className="camps-main-desc">
              Espacios de desconexión y encuentro íntimo con Dios. Revive los mejores momentos de nuestros últimos retiros espirituales y prepárate para los próximos eventos.
            </p>
          </header>

          {/* LISTA DE CAMPAMENTOS */}
          <div className="camp-cards-list">
            {camps.map((camp) => {
              const currentImage = activeImages[camp.id];

              return (
                <div key={camp.id} className="camp-card-item">

                  {/* LADO DE LA GALERÍA */}
                  <div className="camp-gallery-side">
                    <div className="camp-main-image-wrap">
                      <img src={currentImage} alt={camp.title} />
                    </div>

                    <div className="camp-thumbnails-row">
                      {camp.images.map((img) => (
                        <button
                          key={img}
                          type="button"
                          onClick={() => handleThumbnailClick(camp.id, img)}
                          className={`camp-thumbnail-btn ${currentImage === img ? "active" : ""}`}
                        >
                          <img src={img} alt="Miniatura" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* LADO DE LA INFORMACIÓN */}
                  <div className="camp-info-side">
                    <div className="camp-date-tag">
                      <i className="fas fa-calendar-alt"></i>
                      {camp.date}
                    </div>
                    <h2 className="camp-title">{camp.title}</h2>
                    <span className="camp-tagline">{camp.tagline}</span>
                    <p className="camp-desc-text">{camp.description}</p>

                    <div className="camp-features-grid">
                      {camp.features.map((feat) => (
                        <div key={feat.label} className="camp-feature-item">
                          <div className="camp-feature-icon">
                            <i className={`fas ${feat.icon}`}></i>
                          </div>
                          <span>{feat.label}</span>
                        </div>
                      ))}
                    </div>


                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </div>
    </>
  );
}
