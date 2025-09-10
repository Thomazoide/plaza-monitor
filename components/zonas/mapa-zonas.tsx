"use client"

import { useEffect, useRef, useState } from "react"
import { Loader } from "@googlemaps/js-api-loader"
import type { Zona } from "@/types/escuadras-types"
import { Button } from "@/components/ui/button"
import { Shapes } from "lucide-react"
declare global {
  interface Window {
    google: any
  }
}

interface MapaZonasProps {
  zonas: Zona[]
  onPolygonComplete: (coords: { lat: number; lng: number }[]) => void
  selectedZonaId?: number | null
  center: { lat: number; lng: number }
  zoom: number
}

export function MapaZonas({ zonas, onPolygonComplete, selectedZonaId, center, zoom }: MapaZonasProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const [apiKey, setApiKey] = useState<string>("")
  const drawingManagerRef = useRef<any>(null)
  const mapInstanceRef = useRef<any>(null)
  const polygonsRef = useRef<any[]>([])

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
      libraries: ["drawing", "geometry"],
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

  const drawingManager = new google.maps.drawing.DrawingManager({
          drawingMode: null, // No activo por defecto
          drawingControl: true,
          drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_CENTER,
            drawingModes: [google.maps.drawing.OverlayType.POLYGON],
          },
          polygonOptions: {
            fillColor: "#4285F4",
            fillOpacity: 0.3,
            strokeWeight: 2,
            strokeColor: "#4285F4",
            clickable: false,
            editable: false, // Podría ser true si se quiere editar la forma después
            zIndex: 1,
          },
        })
        drawingManager.setMap(mapInstance)
        drawingManagerRef.current = drawingManager

  google.maps.event.addListener(drawingManager, "polygoncomplete", (polygon: any) => {
          const path = polygon.getPath()
          const coords: { lat: number; lng: number }[] = []
          for (let i = 0; i < path.getLength(); i++) {
            const latLng = path.getAt(i)
            coords.push({ lat: latLng.lat(), lng: latLng.lng() })
          }
          onPolygonComplete(coords)
          polygon.setMap(null) // Eliminar el polígono temporal del DrawingManager
          drawingManager.setDrawingMode(null) // Salir del modo dibujo
        })

        setIsMapReady(true)
      })
      .catch((error) => {
        console.error("Error loading Google Maps:", error)
        setMapError(`Error al cargar Google Maps: ${error.message}`)
      })

    return () => {
      // Limpiar listeners y objetos de Google Maps si es necesario
      if (drawingManagerRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(drawingManagerRef.current)
      }
    }
  }, [apiKey, onPolygonComplete]) // No incluir center/zoom aquí para evitar reinicializaciones frecuentes

  // Efecto para actualizar el centro y zoom del mapa cuando cambian las props
  useEffect(() => {
    if (mapInstanceRef.current && center && zoom) {
      mapInstanceRef.current.setCenter(center)
      mapInstanceRef.current.setZoom(zoom)
    }
  }, [center, zoom])

  // Efecto para dibujar/actualizar polígonos de zonas
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || !window.google) return

    // Limpiar polígonos anteriores
    polygonsRef.current.forEach((p) => p.setMap(null))
    polygonsRef.current = []

    zonas.forEach((zona) => {
      if (zona.coordenadas && zona.coordenadas.length > 0) {
        const isSelected = zona.id === selectedZonaId
        const polygon = new window.google.maps.Polygon({
          paths: zona.coordenadas,
          strokeColor: isSelected ? "#FF0000" : zona.activa ? "#008000" : "#808080",
          strokeOpacity: 0.8,
          strokeWeight: isSelected ? 3 : 2,
          fillColor: isSelected ? "#FF0000" : zona.activa ? "#008000" : "#808080",
          fillOpacity: 0.25,
          map: mapInstanceRef.current,
          zIndex: isSelected ? 2 : 1,
        })
        // Podrías añadir un listener de click aquí si quieres seleccionar zonas desde el mapa
        // polygon.addListener('click', () => onZonaSelect(zona.id));
        polygonsRef.current.push(polygon)
      }
    })
  }, [isMapReady, zonas, selectedZonaId])

  const activateDrawingMode = () => {
    if (drawingManagerRef.current && window.google) {
      drawingManagerRef.current.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON)
    }
  }

  return (
    <div className="relative">
      {mapError && <div className="bg-red-100 text-red-700 p-2 mb-2 rounded">{mapError}</div>}
      <div className="absolute top-16 left-2 z-10">
        {" "}
        {/* Ajustado para que no choque con drawing controls */}
        <Button onClick={activateDrawingMode} variant="outline" size="sm" className="bg-white">
          <Shapes size={16} className="mr-2" />
          Dibujar Nueva Zona
        </Button>
      </div>
      <div
        ref={mapRef}
        className="w-full h-[500px] bg-gray-100 rounded-md"
        style={{ visibility: isMapReady ? "visible" : "hidden" }}
      ></div>
      {!isMapReady && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-md">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-2">Cargando mapa...</p>
          </div>
        </div>
      )}
    </div>
  )
}
