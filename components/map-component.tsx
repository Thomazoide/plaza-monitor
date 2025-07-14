"use client"

import { useEffect, useRef, useState } from "react"
import { Loader } from "@googlemaps/js-api-loader"
import { greenAreas } from "@/data/green-areas"
import { MapPin, Search, X } from "lucide-react"
import type { Vehiculo, Equipo } from "@/types/escuadras-types"
import type { TrackingData } from "@/types/tracking-types"
import { useTracking } from "@/context/tracking-context"

declare global {
  interface Window {
    google: any
  }
}

interface MapComponentProps {
  vehiculos: Vehiculo[]
  escuadras: Equipo[]
}

export default function MapComponent({ vehiculos, escuadras }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const infoWindowRef = useRef<any>(null)
  const [apiKey, setApiKey] = useState<string>("")
  const mapInstanceRef = useRef<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAreaList, setShowAreaList] = useState(false)
  const [filteredAreas, setFilteredAreas] = useState(greenAreas)

  const vehicleMarkersRef = useRef<Record<number, any>>({})
  const { vehicleTrackings } = useTracking()

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const res = await fetch("/api/get-map-key")
        const { apiKey: fetchedApiKey } = (await res.json()) as { apiKey?: string }
        if (!fetchedApiKey) throw new Error("API key not found")
        setApiKey(fetchedApiKey)
      } catch (err) {
        console.error("Error fetching API key:", err)
        setMapError("Could not get Google Maps API key")
      }
    }
    fetchApiKey()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredAreas(greenAreas)
    } else {
      const filtered = greenAreas.filter((area) => area.name.toLowerCase().includes(searchTerm.toLowerCase()))
      setFilteredAreas(filtered)
    }
  }, [searchTerm])

  function getVehicleIcon(trackingData: TrackingData, vehicle: Vehiculo): any {
    if (!window.google) return null

    // Si no hay tracking data o no está online, mostrar como desconectado
    if (!trackingData.isOnline) {
      return {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: "#70757A",
        fillOpacity: 0.8,
        strokeWeight: 1,
        strokeColor: "#ffffff",
      }
    }

    // Si no se está moviendo, mostrar como detenido
    if (trackingData.currentPosition.status !== "moving") {
      return {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: "#FBBC04",
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: "#ffffff",
      }
    }

    // Si se está moviendo, mostrar como activo con dirección
    return {
      path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 5,
      rotation: trackingData.currentPosition.heading,
      fillColor: "#1A73E8",
      fillOpacity: 1,
      strokeWeight: 1,
      strokeColor: "#ffffff",
    }
  }

  useEffect(() => {
    if (!mapRef.current || !apiKey) return

    const loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["places", "drawing", "geometry"],
    })

    loader
      .load()
      .then((google) => {
        const mapInstance = new google.maps.Map(mapRef.current!, {
          center: { lat: -33.6119, lng: -70.5758 },
          zoom: 13,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        })
        mapInstanceRef.current = mapInstance
        infoWindowRef.current = new google.maps.InfoWindow()

        greenAreas.forEach((area) => {
          const now = new Date()
          const timeDiff = now.getTime() - area.lastVisited.getTime()
          const daysDiff = timeDiff / (1000 * 3600 * 24)
          const fillColor = daysDiff < 1 ? "#22c55e" : daysDiff < 3 ? "#f97316" : "#ef4444"
          const statusText =
            daysDiff < 1
              ? "Visitado recientemente"
              : daysDiff < 3
                ? "Visitado hace más de 24 horas y menos de 3 días"
                : "Visitado hace más de 3 días"

          const polygon = new google.maps.Polygon({
            paths: area.coordinates,
            strokeColor: fillColor,
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: fillColor,
            fillOpacity: 0.35,
            map: mapInstance,
            zIndex: 1,
          })

          polygon.addListener("mouseover", (e: any) => {
            if (infoWindowRef.current && e.latLng) {
              infoWindowRef.current.setContent(
                `<div style="padding: 8px; max-width: 250px;">
                   <h3 style="font-weight: bold; margin-bottom: 5px;">${area.name}</h3>
                   <p style="margin-bottom: 5px;">${area.info}</p>
                   <p style="font-style: italic; margin-bottom: 5px;">${statusText}</p>
                   <p style="font-size: 0.8rem;">Última visita: ${area.lastVisited.toLocaleDateString()}</p>
                 </div>`,
              )
              infoWindowRef.current.setPosition(e.latLng)
              infoWindowRef.current.open(mapInstance)
            }
          })
          polygon.addListener("mouseout", () => infoWindowRef.current?.close())
          polygon.addListener("click", () => centerMapOnArea(area))
        })

        setIsMapReady(true)
      })
      .catch((error) => {
        console.error("Error loading Google Maps:", error)
        setMapError(`Error al cargar Google Maps: ${error.message}`)
      })

    return () => {
      infoWindowRef.current?.close()
    }
  }, [apiKey])

  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current) return
    const map = mapInstanceRef.current

    Object.keys(vehicleTrackings).forEach((vehicleIdStr) => {
      const vehicleId = Number.parseInt(vehicleIdStr, 10)
      const trackingData = vehicleTrackings[vehicleId]
      const vehicle = Array.isArray(vehiculos) ? vehiculos.find((v) => v.id === vehicleId) : null
      let marker = vehicleMarkersRef.current[vehicleId]

      // Solo mostrar vehículos que tienen tracking data y están asignados a un equipo
      if (trackingData && vehicle && vehicle.equipoID) {
        const position = {
          lat: trackingData.currentPosition.lat,
          lng: trackingData.currentPosition.lng,
        }
        const icon = getVehicleIcon(trackingData, vehicle)

        if (marker) {
          marker.setPosition(position)
          marker.setIcon(icon)
        } else {
          marker = new window.google.maps.Marker({
            position,
            map,
            icon,
            title: `Vehículo: ${vehicle.patente}`,
            zIndex: 2,
          })

          marker.addListener("click", () => {
            if (infoWindowRef.current && map) {
              const equipoAsignado = escuadras.find((esc) => esc.vehiculo?.id === vehicle.id)
              infoWindowRef.current.setContent(
                `<div style="padding: 8px; max-width: 250px;">
                   <h4 style="font-weight: bold; margin-bottom: 5px;">Vehículo: ${vehicle.patente}</h4>
                   <p>Marca: ${vehicle.marca} ${vehicle.modelo}</p>
                   <p>Velocidad: ${trackingData.currentPosition.speed.toFixed(1)} km/h</p>
                   <p>Estado: ${trackingData.currentPosition.status === "moving" ? "En movimiento" : "Detenido"}</p>
                   ${equipoAsignado ? `<p>Equipo: ${equipoAsignado.nombre}</p>` : ""}
                   <p style="font-size: 0.8rem;">Última act.: ${new Date(trackingData.lastUpdate).toISOString()}</p>
                 </div>`,
              )
              infoWindowRef.current.open(map, marker)
            }
          })
          vehicleMarkersRef.current[vehicleId] = marker
        }
      } else if (marker) {
        marker.setMap(null)
        vehicleMarkersRef.current[vehicleId] = null
      }
    })
  }, [isMapReady, vehicleTrackings, vehiculos, escuadras])

  const centerMapOnArea = (area: (typeof greenAreas)[0]) => {
    if (!mapInstanceRef.current || !window.google) return
    const bounds = new window.google.maps.LatLngBounds()
    area.coordinates.forEach((coord) => bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng)))
    mapInstanceRef.current.fitBounds(bounds)
    mapInstanceRef.current.setZoom(Math.min(18, mapInstanceRef.current.getZoom() || 15))
    setShowAreaList(false)
  }

  const showAllAreas = () => {
    if (!mapInstanceRef.current || !window.google) return
    const bounds = new window.google.maps.LatLngBounds()
    greenAreas.forEach((area) =>
      area.coordinates.forEach((coord) => bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng))),
    )
    mapInstanceRef.current.fitBounds(bounds)
    setShowAreaList(false)
  }

  const getAreaButtonColor = (area: (typeof greenAreas)[0]) => {
    const now = new Date()
    const timeDiff = now.getTime() - area.lastVisited.getTime()
    const daysDiff = timeDiff / (1000 * 3600 * 24)
    if (daysDiff < 1) return "bg-green-100 text-green-800 hover:bg-green-200 border-green-300"
    if (daysDiff < 3) return "bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-300"
    return "bg-red-100 text-red-800 hover:bg-red-200 border-red-300"
  }

  return (
    <div className="relative w-full">
      {mapError && (
        <div className="absolute top-0 left-0 right-0 bg-red-100 text-red-700 p-2 z-[1000] text-center">{mapError}</div>
      )}
      <div className="absolute top-4 left-4 z-[100] flex flex-col gap-2 max-w-xs">
        <div className="bg-white rounded-lg shadow-lg p-2 flex items-center">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar área..."
              className="w-full pl-8 pr-2 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowAreaList(true)}
            />
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            {searchTerm && (
              <button
                className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            className="ml-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md flex items-center justify-center"
            onClick={() => setShowAreaList(!showAreaList)}
            title={showAreaList ? "Ocultar lista" : "Mostrar lista"}
          >
            <MapPin className="h-5 w-5" />
          </button>
        </div>
        {showAreaList && (
          <div className="bg-white rounded-lg shadow-lg p-2 max-h-[300px] overflow-y-auto">
            <div className="mb-2">
              <button
                className="w-full text-left p-2 rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-300 flex items-center"
                onClick={showAllAreas}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Ver todas las áreas
              </button>
            </div>
            <div className="space-y-1">
              {filteredAreas.length > 0 ? (
                filteredAreas.map((area) => (
                  <button
                    key={area.id}
                    className={`w-full text-left p-2 rounded-md ${getAreaButtonColor(
                      area,
                    )} border flex items-center justify-between`}
                    onClick={() => centerMapOnArea(area)}
                  >
                    <span className="truncate">{area.name}</span>
                    <span className="text-xs ml-1 whitespace-nowrap">
                      {new Date(area.lastVisited).toLocaleDateString("es-CL", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                  </button>
                ))
              ) : (
                <div className="text-center text-gray-500 py-2">No se encontraron áreas</div>
              )}
            </div>
          </div>
        )}
      </div>
      <div
        ref={mapRef}
        className="w-full h-[500px] bg-gray-100"
        style={{ visibility: isMapReady ? "visible" : "hidden" }}
      ></div>
      {!isMapReady && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div
              className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
              role="status"
            >
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Cargando...
              </span>
            </div>
            <p className="mt-2">Cargando mapa...</p>
          </div>
        </div>
      )}
    </div>
  )
}
