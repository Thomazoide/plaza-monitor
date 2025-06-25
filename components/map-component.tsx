"use client"

import { useEffect, useRef, useState } from "react"
import { Loader } from "@googlemaps/js-api-loader"
import type { google as GoogleMapsApi } from "@googlemaps/js-api-loader" // Renombrado para evitar conflicto
import { greenAreas } from "@/data/green-areas"
import { MapPin, Search, X } from "lucide-react"
import type { Vehiculo, Escuadra } from "@/types/escuadras-types" // Importar tipos
import type { TrackingData } from "@/types/tracking-types"
import { generateVehicleTracking, updateVehiclePosition } from "@/data/tracking-data"

// Declarar el tipo para el objeto google global
declare global {
  interface Window {
    google: typeof GoogleMapsApi
  }
}

interface MapComponentProps {
  vehiculos: Vehiculo[]
  escuadras: Escuadra[]
}

export default function MapComponent({ vehiculos, escuadras }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const infoWindowRef = useRef<GoogleMapsApi.maps.InfoWindow | null>(null)
  const [apiKey, setApiKey] = useState<string>("")
  const mapInstanceRef = useRef<GoogleMapsApi.maps.Map | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAreaList, setShowAreaList] = useState(false)
  const [filteredAreas, setFilteredAreas] = useState(greenAreas)

  const [vehicleTrackings, setVehicleTrackings] = useState<Record<number, TrackingData>>({})
  const vehicleMarkersRef = useRef<Record<number, GoogleMapsApi.maps.Marker | null>>({})

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const res = await fetch("/api/get-map-key")
        const contentType = res.headers.get("content-type") ?? ""
        if (!res.ok || !contentType.includes("application/json")) {
          throw new Error(`Status ${res.status}`)
        }
        const { apiKey: fetchedApiKey } = (await res.json()) as {
          apiKey?: string
        }
        if (!fetchedApiKey) {
          throw new Error("Respuesta sin apiKey")
        }
        setApiKey(fetchedApiKey)
      } catch (err) {
        console.error("Error al obtener la clave de API:", err)
        setMapError("No se pudo obtener la clave de API de Google Maps")
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

  function getVehicleIcon(trackingData: TrackingData, vehicle: Vehiculo): GoogleMapsApi.maps.Icon | null {
    if (!window.google) return null

    if (vehicle.estado !== "en_uso" || !trackingData.isOnline) {
      return {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: "#70757A", // Gris
        fillOpacity: 0.8,
        strokeWeight: 1,
        strokeColor: "#ffffff",
      }
    }

    if (trackingData.currentPosition.status !== "moving") {
      return {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 7,
        fillColor: "#FBBC04", // Amarillo
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: "#ffffff",
      }
    }

    return {
      path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 5,
      rotation: trackingData.currentPosition.heading,
      fillColor: "#1A73E8", // Azul
      fillOpacity: 1,
      strokeWeight: 1,
      strokeColor: "#ffffff",
    }
  }

  // Efecto para cargar el mapa y las áreas verdes
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

          polygon.addListener("mouseover", (e: GoogleMapsApi.maps.PolyMouseEvent) => {
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

        const centerControlDiv = document.createElement("div")
        const centerControl = createCenterControl(mapInstance)
        centerControlDiv.appendChild(centerControl)
        mapInstance.controls[google.maps.ControlPosition.TOP_RIGHT].push(centerControlDiv)
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

  // Efecto para inicializar tracking y marcadores de vehículos
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || vehiculos.length === 0) return
    const map = mapInstanceRef.current

    const initialTrackings: Record<number, TrackingData> = {}
    const currentMarkers = vehicleMarkersRef.current

    vehiculos.forEach((v) => {
      if (v.estado === "en_uso") {
        const trackingData = vehicleTrackings[v.id] || generateVehicleTracking(v.id)
        initialTrackings[v.id] = trackingData

        if (window.google && map) {
          if (currentMarkers[v.id]) {
            // Si ya existe, solo actualiza
            currentMarkers[v.id]?.setPosition({
              lat: trackingData.currentPosition.lat,
              lng: trackingData.currentPosition.lng,
            })
            currentMarkers[v.id]?.setIcon(getVehicleIcon(trackingData, v))
          } else {
            // Si no existe, créalo
            const marker = new window.google.maps.Marker({
              position: {
                lat: trackingData.currentPosition.lat,
                lng: trackingData.currentPosition.lng,
              },
              map: map,
              icon: getVehicleIcon(trackingData, v),
              title: `Vehículo: ${v.patente}`,
              zIndex: 2, // Para que estén sobre los polígonos
            })

            marker.addListener("click", () => {
              if (infoWindowRef.current && map) {
                const escuadraAsignada = escuadras.find((esc) => esc.vehiculo?.id === v.id)
                infoWindowRef.current.setContent(
                  `<div style="padding: 8px; max-width: 250px;">
                     <h4 style="font-weight: bold; margin-bottom: 5px;">Vehículo: ${v.patente}</h4>
                     <p>Marca: ${v.marca} ${v.modelo} (${v.año})</p>
                     <p>Velocidad: ${trackingData.currentPosition.speed.toFixed(1)} km/h</p>
                     <p>Estado: ${trackingData.currentPosition.status}</p>
                     ${escuadraAsignada ? `<p>Escuadra: ${escuadraAsignada.nombre}</p>` : ""}
                     <p style="font-size: 0.8rem;">Última act.: ${trackingData.lastUpdate.toLocaleTimeString()}</p>
                   </div>`,
                )
                infoWindowRef.current.open(map, marker)
              }
            })
            currentMarkers[v.id] = marker
          }
        }
      } else {
        // Si no está en uso, asegúrate de que no haya marcador
        if (currentMarkers[v.id]) {
          currentMarkers[v.id]?.setMap(null)
          currentMarkers[v.id] = null
        }
      }
    })
    setVehicleTrackings(initialTrackings)
    vehicleMarkersRef.current = currentMarkers
  }, [isMapReady, vehiculos, escuadras]) // Depender de escuadras también

  // Efecto para el intervalo de actualización de vehículos
  useEffect(() => {
    if (!isMapReady || vehiculos.length === 0) return

    const intervalId = setInterval(() => {
      setVehicleTrackings((prevTrackings) => {
        const newTrackings = { ...prevTrackings }
        vehiculos.forEach((v) => {
          if (v.estado === "en_uso" && prevTrackings[v.id]) {
            const updatedTracking = updateVehiclePosition(prevTrackings[v.id])
            newTrackings[v.id] = updatedTracking
          }
        })
        return newTrackings
      })
    }, 5000) // Actualizar cada 5 segundos

    return () => clearInterval(intervalId)
  }, [isMapReady, vehiculos])

  // Efecto para actualizar los marcadores cuando vehicleTrackings cambia
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current) return
    const map = mapInstanceRef.current

    Object.keys(vehicleTrackings).forEach((vehicleIdStr) => {
      const vehicleId = Number.parseInt(vehicleIdStr, 10)
      const trackingData = vehicleTrackings[vehicleId]
      const vehicle = vehiculos.find((v) => v.id === vehicleId)

      if (trackingData && vehicle) {
        const marker = vehicleMarkersRef.current[vehicleId]
        if (vehicle.estado === "en_uso") {
          if (marker && window.google) {
            marker.setPosition({
              lat: trackingData.currentPosition.lat,
              lng: trackingData.currentPosition.lng,
            })
            marker.setIcon(getVehicleIcon(trackingData, vehicle))

            if (
              infoWindowRef.current &&
              infoWindowRef.current.getMap() && // Check if InfoWindow is open
              (infoWindowRef.current.getAnchor() === marker || // Check if anchored to this marker (Google Maps API v3 style)
                (infoWindowRef.current as any).anchor === marker) // Check anchor for newer API versions if applicable
            ) {
              const escuadraAsignada = escuadras.find((esc) => esc.vehiculo?.id === vehicle.id)
              infoWindowRef.current.setContent(
                `<div style="padding: 8px; max-width: 250px;">
                   <h4 style="font-weight: bold; margin-bottom: 5px;">Vehículo: ${vehicle.patente}</h4>
                   <p>Marca: ${vehicle.marca} ${vehicle.modelo} (${vehicle.año})</p>
                   <p>Velocidad: ${trackingData.currentPosition.speed.toFixed(1)} km/h</p>
                   <p>Estado: ${trackingData.currentPosition.status}</p>
                   ${escuadraAsignada ? `<p>Escuadra: ${escuadraAsignada.nombre}</p>` : ""}
                   <p style="font-size: 0.8rem;">Última act.: ${trackingData.lastUpdate.toLocaleTimeString()}</p>
                 </div>`,
              )
            }
          } else if (!marker && window.google && map && vehicle.estado === "en_uso") {
            // Crear marcador si no existe y debe estar
            const newMarker = new window.google.maps.Marker({
              position: { lat: trackingData.currentPosition.lat, lng: trackingData.currentPosition.lng },
              map: map,
              icon: getVehicleIcon(trackingData, vehicle),
              title: `Vehículo: ${vehicle.patente}`,
              zIndex: 2,
            })
            newMarker.addListener("click", () => {
              /* ... Lógica del InfoWindow ... */
            })
            vehicleMarkersRef.current[vehicleId] = newMarker
          }
        } else {
          // Vehículo no está en uso, remover marcador
          if (marker) {
            marker.setMap(null)
            vehicleMarkersRef.current[vehicleId] = null
          }
        }
      }
    })
  }, [vehicleTrackings, isMapReady, vehiculos, escuadras])

  function createCenterControl(map: GoogleMapsApi.maps.Map) {
    const controlButton = document.createElement("button")
    Object.assign(controlButton.style, {
      backgroundColor: "#fff",
      border: "2px solid #ccc",
      borderRadius: "3px",
      boxShadow: "0 2px 6px rgba(0,0,0,.3)",
      color: "rgb(25,25,25)",
      cursor: "pointer",
      fontFamily: "Roboto,Arial,sans-serif",
      fontSize: "16px",
      lineHeight: "38px",
      margin: "8px",
      padding: "0 5px",
      textAlign: "center",
    })
    controlButton.textContent = "Ver todas las áreas"
    controlButton.title = "Haz clic para ver todas las áreas verdes"
    controlButton.type = "button"
    controlButton.addEventListener("click", () => showAllAreas())
    return controlButton
  }

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
      {(!isMapReady || !apiKey) && !mapError && (
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
