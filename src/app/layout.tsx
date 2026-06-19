import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import SocialFloating from "./components/SocialFloating";

export const metadata: Metadata = {
  title: "Guerreros de Cristo | Jóvenes Cristianos",
  description: "Más que un grupo, una familia: jóvenes en excelencia y servicio que te acompañan a descubrir, fortalecer y vivir tu fe en Dios.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Poppins:wght@300;400;600;700;900&family=Montserrat:wght@400;600;700;800;900&family=Orbitron:wght@400;700;900&family=Righteous&family=Inter:wght@300;400;600;700&family=Playfair+Display:wght@400;700;900&family=Raleway:wght@300;400;600;700;800&family=Roboto:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body>
        <Navbar />
        {children}
        <SocialFloating />
      </body>
    </html>
  );
}
