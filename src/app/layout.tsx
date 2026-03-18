import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AURA - Image Resize Engine",
  description: "Optimiza tus imágenes en múltiples formatos con IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <div className="min-h-screen bg-[#0a0a0a] relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
          {children}
        </div>
      </body>
    </html>
  );
}
