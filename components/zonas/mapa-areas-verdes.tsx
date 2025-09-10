"use client"

import { useEffect, useRef, useState } from "react"
import { Loader } from "@googlemaps/js-api-loader"
import type { GreenArea } from "@/types/map-types"

declare global {
  interface Window {
    google: any
  }
}

interface MapaAreasVerdesProps {
  areasVerdes: GreenArea[]
  selectedAreaId?: number | null
  center: { lat: number; lng: number }
  zoom: number
  onAreaClick: (area: GreenArea) => void
}

export function MapaAreasVerdes({ areasVerdes, selectedAreaId, center, zoom, onAreaClick }: MapaAreasVerdesProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const [apiKey, setApiKey] = useState<string>("")
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const polygonsRef = useRef<google.maps.Polygon[]>([])
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const res = await fetch("/api/get-map-key")
        const contentType = res.headers.get("content-type") ?? ""
        if (!res.ok || !contentType.includes("application/json")) {
          throw new Error(`Status ${res.status}`)
        }
        const { apiKey } = (await res.json()) as { apiKey?: string }
        if (!apiKey) {
          throw new Error("Respuesta sin apiKey")
        }
        setApiKey(apiKey)
      } catch (err) {
        console.error("Error al obtener la clave de API:", err)
        setMapError("No se pudo obtener la clave de API de Google Maps")
      }
    }
    fetchApiKey()
  }, [])

  useEffect(() => {
    if (!mapRef.current || !apiKey) return

    const loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["geometry"],
    })

    loader
      .load()
      .then((google) => {
        const mapInstance = new google.maps.Map(mapRef.current!, {
          center: center,
          zoom: zoom,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          streetViewControl: false,
          fullscreenControl: false,
        })
        mapInstanceRef.current = mapInstance

        const infoWindow = new google.maps.InfoWindow()
        infoWindowRef.current = infoWindow

        setIsMapReady(true)
      })
      .catch((err) => {
        console.error("Error al cargar Google Maps:", err)
        setMapError("Error al cargar el mapa. Verifica la clave de API.")
      })
  }, [apiKey, center, zoom])

  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current) return

    // Limpiar polígonos existentes
    polygonsRef.current.forEach((polygon) => polygon.setMap(null))
    polygonsRef.current = []

    // Crear polígonos para cada área verde
    areasVerdes.forEach((area) => {
      const polygon = new google.maps.Polygon({
        paths: area.coordinates,
        fillColor: "#22c55e", // Verde
        fillOpacity: 0.4,
        strokeColor: "#16a34a", // Verde más oscuro
        strokeOpacity: 0.8,
        strokeWeight: 2,
        clickable: true,
      })

      // Resaltar área seleccionada
      if (selectedAreaId === area.id) {
        polygon.setOptions({
          fillColor: "#3b82f6", // Azul
          strokeColor: "#1d4ed8", // Azul más oscuro
          strokeWeight: 3,
          fillOpacity: 0.6,
        })
      }

      polygon.setMap(mapInstanceRef.current)
      polygonsRef.current.push(polygon)

      // Agregar listener para clicks
      polygon.addListener("click", (event: google.maps.MapMouseEvent) => {
        if (event.latLng && infoWindowRef.current) {
          const daysSinceVisit = Math.floor((Date.now() - area.lastVisited.getTime()) / (1000 * 60 * 60 * 24))
          const visitStatus = daysSinceVisit <= 7 ? "Visitada recientemente" : 
                             daysSinceVisit <= 30 ? "Estado normal" : "Requiere atención"
          
          infoWindowRef.current.setContent(`
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 8px 0; color: #16a34a; font-weight: bold;">${area.name}</h3>
              <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">${area.info}</p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                Estado: ${visitStatus}
              </p>
              <p style="margin: 4px 0 0 0; color: #9ca3af; font-size: 12px;">
                Última visita: ${daysSinceVisit === 0 ? "Hoy" : daysSinceVisit === 1 ? "Hace 1 día" : `Hace ${daysSinceVisit} días`}
              </p>
            </div>
          `)
          infoWindowRef.current.setPosition(event.latLng)
          infoWindowRef.current.open(mapInstanceRef.current)
        }
        onAreaClick(area)
      })
    })
  }, [areasVerdes, selectedAreaId, isMapReady, onAreaClick])

  // Actualizar centro y zoom cuando cambien
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(center)
      mapInstanceRef.current.setZoom(zoom)
    }
  }, [center, zoom])

  if (mapError) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-2">Error al cargar el mapa</p>
          <p className="text-sm text-gray-600">{mapError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full h-96 rounded-lg border" />
      {!isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Cargando mapa...</p>
          </div>
        </div>
      )}
    </div>
  )
}
