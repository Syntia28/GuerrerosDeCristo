"use client";

import { useState } from "react";
import { FaFacebookF, FaTiktok, FaYoutube, FaWhatsapp } from "react-icons/fa";
import "./SocialFloating.css";

export default function SocialFloating() {
  const [showIcons, setShowIcons] = useState(false);

  return (
    <div className="social-floating">
      <button onClick={() => setShowIcons(!showIcons)} className="toggle-btn">
        Redes
      </button>
      <div className={`icons-container ${showIcons ? "show" : "hide"}`}>
        <a href="https://wa.me/51999999999" target="_blank" rel="noopener noreferrer">
          <FaWhatsapp />
        </a>
        <a href="https://www.facebook.com/GuerrerosDeCristo" target="_blank" rel="noopener noreferrer">
          <FaFacebookF />
        </a>
        <a href="https://www.tiktok.com/@guerreros.dc" target="_blank" rel="noopener noreferrer">
          <FaTiktok />
        </a>
        <a href="https://www.youtube.com/@GuerrerosDeCristo" target="_blank" rel="noopener noreferrer">
          <FaYoutube />
        </a>
      </div>
    </div>
  );
}
