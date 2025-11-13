import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")
    const language = searchParams.get("language") || "es"

    if (!lat || !lng) {
      return NextResponse.json(
        { status: "INVALID_REQUEST", error_message: "Missing lat/lng parameters" },
        { status: 400 },
      )
    }

    const latNum = Number(lat)
    const lngNum = Number(lng)
    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      return NextResponse.json(
        { status: "INVALID_REQUEST", error_message: "lat/lng must be numeric" },
        { status: 400 },
      )
    }

    const apiKey = process.env.GOOGLE_API_KEY
    if (!apiKey) {
      // Emular respuesta de Google cuando falta API key
      return NextResponse.json(
        { status: "REQUEST_DENIED", error_message: "Google API key not configured on server" },
        { status: 500 },
      )
    }

    const params = new URLSearchParams({
      latlng: `${latNum},${lngNum}`,
      key: apiKey,
      language,
    })

    const resp = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`)
    const contentType = resp.headers.get("content-type") || ""
    if (!resp.ok || !contentType.includes("application/json")) {
      return NextResponse.json(
        { status: "UNKNOWN_ERROR", error_message: `Upstream error ${resp.status}` },
        { status: 502 },
      )
    }

    const data = await resp.json()
    // Passthrough de la estructura de Google
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json(
      { status: "UNKNOWN_ERROR", error_message: error?.message || "Unexpected error" },
      { status: 500 },
    )
  }
}
