import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Script from "next/script"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mapa de Áreas Verdes - Puente Alto",
  description: "Visualización de áreas verdes con estado de visita",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        {/* Añadir el script de Google Maps para asegurar que los tipos estén disponibles */}
        <Script
          src="https://maps.googleapis.com/maps/api/js?key=TU_CLAVE_API&libraries=places,drawing,geometry&loading=async"
          strategy="beforeInteractive"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
