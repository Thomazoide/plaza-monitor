import { NextResponse } from "next/server"

export async function GET() {
  // 1️⃣  Buscamos primero la clave privada del servidor
  const apiKey = process.env.GOOGLE_API_KEY

  // Si existe la clave privada la devolvemos; de lo contrario devolvemos null.
  return NextResponse.json({ apiKey: apiKey ?? null })
}
