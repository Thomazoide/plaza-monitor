"use client"

import { useEffect, useRef, useState } from "react"
import { Loader } from "@googlemaps/js-api-loader"
import { generateVehicleTracking, updateVehiclePosition } from "@/data/tracking-data"
import type { TrackingData } from "@/types/tracking-types"
import type { Vehiculo } from "@/types/escuadras-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Navigation, Battery, Fuel, Clock, MapPin, Activity, Pause, Play, RotateCcw } from "lucide-react"

declare global {
  interface Window {
    google: typeof globalThis.google
  }
}

interface VehicleTrackingMapProps {
  vehiculo: Vehiculo
}

export function VehicleTrackingMap({ vehiculo }: VehicleTrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null)
  const [isTracking, setIsTracking] = useState(true)
  const [apiKey, setApiKey] = useState<string>("")

  const mapInstanceRef = useRef<any | null>(null)
  const vehicleMarkerRef = useRef<any | null>(null)
  const routePolylineRef = useRef<any | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Obtener la API key
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch("/api/get-map-key")
        const data = await response.json()
        if (data.apiKey) {
          setApiKey(data.apiKey)
        } else {
          setMapError("No se pudo obtener la clave de API de Google Maps")
        }
      } catch (error) {
        console.error("Error al obtener la clave de API:", error)
        setMapError("Error al obtener la clave de API de Google Maps")
      }
    }

    fetchApiKey()
  }, [])

  // Inicializar datos de tracking
  useEffect(() => {
    const initialTracking = generateVehicleTracking(vehiculo.id)
    setTrackingData(initialTracking)
  }, [vehiculo.id])

  // Inicializar mapa
  useEffect(() => {
    if (!mapRef.current || !apiKey || !trackingData) return

    const loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["places", "geometry"],
    })

    loader
      .load()
      .then((google) => {
        const mapInstance = new google.maps.Map(mapRef.current!, {
          center: {
            lat: trackingData.currentPosition.lat,
            lng: trackingData.currentPosition.lng,
          },
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        })

        mapInstanceRef.current = mapInstance

        // Crear marcador del vehículo
        const vehicleMarker = new google.maps.Marker({
          position: {
            lat: trackingData.currentPosition.lat,
            lng: trackingData.currentPosition.lng,
          },
          map: mapInstance,
          title: `${vehiculo.marca} ${vehiculo.modelo} (${vehiculo.patente})`,
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: getStatusColor(trackingData.currentPosition.status),
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
            rotation: trackingData.currentPosition.heading,
          },
        })

        vehicleMarkerRef.current = vehicleMarker

        // Crear polyline para la ruta
        const routePolyline = new google.maps.Polyline({
          path: trackingData.route.map((pos) => ({ lat: pos.lat, lng: pos.lng })),
          geodesic: true,
          strokeColor: "#2563eb",
          strokeOpacity: 0.8,
          strokeWeight: 3,
          map: mapInstance,
        })

        routePolylineRef.current = routePolyline

        // Info window para el vehículo
        const infoWindow = new google.maps.InfoWindow({
          content: getVehicleInfoContent(trackingData.currentPosition, vehiculo),
        })

        vehicleMarker.addListener("click", () => {
          infoWindow.open(mapInstance, vehicleMarker)
        })

        setIsMapReady(true)
      })
      .catch((error) => {
        console.error("Error loading Google Maps:", error)
        setMapError(`Error al cargar Google Maps: ${error.message}`)
      })

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [apiKey, trackingData, vehiculo])

  // Actualización en tiempo real
  useEffect(() => {
    if (!isTracking || !trackingData) return

    intervalRef.current = setInterval(() => {
      setTrackingData((prevData) => {
        if (!prevData) return null
        return updateVehiclePosition(prevData)
      })
    }, 5000) // Actualizar cada 5 segundos

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isTracking, trackingData])

  // Actualizar marcador y ruta cuando cambian los datos
  useEffect(() => {
    if (!trackingData || !vehicleMarkerRef.current || !routePolylineRef.current || !mapInstanceRef.current) return

    // Actualizar posición del marcador
    const newPosition = {
      lat: trackingData.currentPosition.lat,
      lng: trackingData.currentPosition.lng,
    }

    vehicleMarkerRef.current.setPosition(newPosition)
    vehicleMarkerRef.current.setIcon({
      path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 6,
      fillColor: getStatusColor(trackingData.currentPosition.status),
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2,
      rotation: trackingData.currentPosition.heading,
    })

    // Actualizar ruta
    routePolylineRef.current.setPath(trackingData.route.map((pos) => ({ lat: pos.lat, lng: pos.lng })))

    // Centrar mapa en la nueva posición
    mapInstanceRef.current.panTo(newPosition)
  }, [trackingData])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "moving":
        return "#22c55e"
      case "stopped":
        return "#ef4444"
      case "idle":
        return "#f59e0b"
      default:
        return "#6b7280"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "moving":
        return "En movimiento"
      case "stopped":
        return "Detenido"
      case "idle":
        return "En espera"
      default:
        return "Desconocido"
    }
  }

  const getVehicleInfoContent = (position: any, vehiculo: Vehiculo) => {
    return `
      <div style="padding: 8px; max-width: 250px;">
        <h3 style="font-weight: bold; margin-bottom: 5px;">${vehiculo.marca} ${vehiculo.modelo}</h3>
        <p style="margin-bottom: 3px;"><strong>Patente:</strong> ${vehiculo.patente}</p>
        <p style="margin-bottom: 3px;"><strong>Velocidad:</strong> ${position.speed.toFixed(1)} km/h</p>
        <p style="margin-bottom: 3px;"><strong>Estado:</strong> ${getStatusText(position.status)}</p>
        <p style="font-size: 0.8rem; color: #666;">Última actualización: ${position.timestamp.toLocaleTimeString()}</p>
      </div>
    `
  }

  const handleToggleTracking = () => {
    setIsTracking(!isTracking)
  }

  const handleResetView = () => {
    if (mapInstanceRef.current && trackingData) {
      mapInstanceRef.current.setCenter({
        lat: trackingData.currentPosition.lat,
        lng: trackingData.currentPosition.lng,
      })
      mapInstanceRef.current.setZoom(15)
    }
  }

  if (!trackingData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2">Cargando datos de tracking...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Panel de información */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Estado</p>
                <Badge
                  className={`mt-1 ${
                    trackingData.currentPosition.status === "moving"
                      ? "bg-green-100 text-green-800"
                      : trackingData.currentPosition.status === "stopped"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {getStatusText(trackingData.currentPosition.status)}
                </Badge>
              </div>
              <Activity className={`h-6 w-6 ${trackingData.isOnline ? "text-green-500" : "text-red-500"}`} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Velocidad</p>
                <p className="text-lg font-bold">{trackingData.currentPosition.speed.toFixed(1)} km/h</p>
              </div>
              <Navigation className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Batería</p>
                <p className="text-lg font-bold">{trackingData.batteryLevel?.toFixed(0) || "N/A"}%</p>
              </div>
              <Battery
                className={`h-6 w-6 ${(trackingData.batteryLevel || 0) > 20 ? "text-green-500" : "text-red-500"}`}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Combustible</p>
                <p className="text-lg font-bold">{trackingData.fuelLevel?.toFixed(0) || "N/A"}%</p>
              </div>
              <Fuel className={`h-6 w-6 ${(trackingData.fuelLevel || 0) > 30 ? "text-green-500" : "text-red-500"}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            Última actualización: {trackingData.lastUpdate.toLocaleTimeString()}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleToggleTracking} className="flex items-center gap-1">
            {isTracking ? <Pause size={14} /> : <Play size={14} />}
            {isTracking ? "Pausar" : "Reanudar"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleResetView} className="flex items-center gap-1">
            <RotateCcw size={14} />
            Centrar
          </Button>
        </div>
      </div>

      {/* Mapa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Seguimiento en Tiempo Real - {vehiculo.marca} {vehiculo.modelo} ({vehiculo.patente})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {mapError && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{mapError}</div>}

          <div className="relative">
            <div
              ref={mapRef}
              className="w-full h-[500px] bg-gray-100 rounded-md"
              style={{ visibility: isMapReady ? "visible" : "hidden" }}
            />

            {(!isMapReady || !apiKey) && !mapError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-md">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
                  <p className="mt-2">Cargando mapa...</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Información del Vehículo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Marca:</span>
              <span>{vehiculo.marca}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Modelo:</span>
              <span>{vehiculo.modelo}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Año:</span>
              <span>{vehiculo.año}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Tipo:</span>
              <span className="capitalize">{vehiculo.tipo}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Posición Actual</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="font-medium">Latitud:</span>
              <span className="font-mono text-sm">{trackingData.currentPosition.lat.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Longitud:</span>
              <span className="font-mono text-sm">{trackingData.currentPosition.lng.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Rumbo:</span>
              <span>{trackingData.currentPosition.heading.toFixed(0)}°</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Conexión:</span>
              <Badge className={trackingData.isOnline ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {trackingData.isOnline ? "En línea" : "Desconectado"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
