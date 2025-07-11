"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Clock, Gauge, Activity } from "lucide-react"
import { equipos } from "@/data/escuadras-data"
import { useTracking } from "@/context/tracking-context"

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export function VehicleTrackingMap() {
  const [map, setMap] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null)
  const [apiKey, setApiKey] = useState<string>("")
  const { vehicleTrackings, isConnected } = useTracking()

  // Obtener la clave de API
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch("/api/get-map-key")
        const data = await response.json()
        setApiKey(data.apiKey)
      } catch (error) {
        console.error("Error fetching API key:", error)
      }
    }
    fetchApiKey()
  }, [])

  // Inicializar el mapa
  useEffect(() => {
    if (!apiKey) return

    const initializeMap = () => {
      if (window.google && window.google.maps) {
        const mapInstance = new window.google.maps.Map(document.getElementById("tracking-map"), {
          center: { lat: -33.5059767, lng: -70.7538867 }, // Coordenadas del vehículo real
          zoom: 13,
          mapTypeId: "roadmap",
        })
        setMap(mapInstance)
      }
    }

    if (window.google) {
      initializeMap()
    } else {
      window.initMap = initializeMap
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  }, [apiKey])

  // Actualizar marcadores cuando cambien los datos de tracking
  useEffect(() => {
    if (!map || !window.google) return

    // Limpiar marcadores existentes
    markers.forEach((marker) => marker.setMap(null))
    const newMarkers: any[] = []

    // Crear marcadores para cada vehículo con tracking
    equipos.forEach((equipo) => {
      if (equipo.vehiculo && vehicleTrackings[equipo.vehiculo.id]) {
        const tracking = vehicleTrackings[equipo.vehiculo.id]
        const position = tracking.currentPosition

        const marker = new window.google.maps.Marker({
          position: { lat: position.lat, lng: position.lng },
          map: map,
          title: `${equipo.nombre} - ${equipo.vehiculo.patente}`,
          icon: {
            path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: equipo.vehiculo.id === 1 ? "#ef4444" : "#3b82f6", // Rojo para vehículo real, azul para simulados
            fillOpacity: 0.8,
            strokeColor: "#ffffff",
            strokeWeight: 2,
            rotation: position.heading,
          },
        })

        // Info window
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h3 class="font-semibold">${equipo.nombre}</h3>
              <p class="text-sm text-gray-600">${equipo.vehiculo.marca} ${equipo.vehiculo.modelo}</p>
              <p class="text-sm"><strong>Patente:</strong> ${equipo.vehiculo.patente}</p>
              <p class="text-sm"><strong>Velocidad:</strong> ${position.speed.toFixed(1)} km/h</p>
              <p class="text-sm"><strong>Estado:</strong> ${position.status === "moving" ? "En movimiento" : "Detenido"}</p>
              <p class="text-xs text-gray-500">Última actualización: ${tracking.lastUpdate.toLocaleTimeString()}</p>
              ${equipo.vehiculo.id === 1 ? '<p class="text-xs text-red-600 font-medium">🔴 Seguimiento en tiempo real</p>' : ""}
            </div>
          `,
        })

        marker.addListener("click", () => {
          infoWindow.open(map, marker)
          setSelectedVehicle(equipo.vehiculo!.id)
        })

        newMarkers.push(marker)
      }
    })

    setMarkers(newMarkers)
  }, [map, vehicleTrackings])

  const selectedTracking = selectedVehicle ? vehicleTrackings[selectedVehicle] : null
  const selectedEquipo = selectedVehicle ? equipos.find((e) => e.vehiculo?.id === selectedVehicle) : null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Mapa de Seguimiento</CardTitle>
                <CardDescription>Ubicación en tiempo real de los vehículos</CardDescription>
              </div>
              <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                {isConnected ? "Conectado" : "Desconectado"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div id="tracking-map" className="w-full h-[500px] rounded-b-lg" />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Vehículos Activos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {equipos
              .filter((e) => e.vehiculo && vehicleTrackings[e.vehiculo.id])
              .map((equipo) => {
                const tracking = vehicleTrackings[equipo.vehiculo!.id]
                const isRealTime = equipo.vehiculo!.id === 1

                return (
                  <div
                    key={equipo.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedVehicle === equipo.vehiculo!.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedVehicle(equipo.vehiculo!.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{equipo.nombre}</span>
                      <div className="flex items-center gap-1">
                        {isRealTime && (
                          <Badge variant="destructive" className="text-xs">
                            LIVE
                          </Badge>
                        )}
                        <Badge variant={tracking.isOnline ? "default" : "secondary"} className="text-xs">
                          {tracking.isOnline ? "Online" : "Offline"}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {equipo.vehiculo!.patente} • {tracking.currentPosition.speed.toFixed(1)} km/h
                    </p>
                  </div>
                )
              })}
          </CardContent>
        </Card>

        {selectedTracking && selectedEquipo && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Vehículo</CardTitle>
              <CardDescription>{selectedEquipo.nombre}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Ubicación</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedTracking.currentPosition.lat.toFixed(6)},{" "}
                      {selectedTracking.currentPosition.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Velocidad</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedTracking.currentPosition.speed.toFixed(1)} km/h
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Dirección</p>
                    <p className="text-xs text-muted-foreground">{selectedTracking.currentPosition.heading}°</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Última actualización</p>
                    <p className="text-xs text-muted-foreground">{selectedTracking.lastUpdate.toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-sm font-medium mb-2">Estado del vehículo</p>
                <Badge variant={selectedTracking.currentPosition.status === "moving" ? "default" : "secondary"}>
                  {selectedTracking.currentPosition.status === "moving" ? "En movimiento" : "Detenido"}
                </Badge>
                {selectedEquipo.vehiculo!.id === 1 && (
                  <Badge variant="destructive" className="ml-2">
                    <Activity className="h-3 w-3 mr-1" />
                    Tiempo real
                  </Badge>
                )}
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  if (map) {
                    map.setCenter({
                      lat: selectedTracking.currentPosition.lat,
                      lng: selectedTracking.currentPosition.lng,
                    })
                    map.setZoom(16)
                  }
                }}
              >
                Centrar en mapa
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default VehicleTrackingMap
