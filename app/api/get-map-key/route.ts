import { NextResponse } from "next/server"

export async function GET() {
  // Obtener la API key desde la variable de entorno
  const apiKey = process.env.GOOGLE_API_KEY

  if (!apiKey) {
    return NextResponse.json({ error: "API key no encontrada en las variables de entorno" }, { status: 500 })
  }

  // Devolver la API key
  return NextResponse.json({ apiKey })
}
