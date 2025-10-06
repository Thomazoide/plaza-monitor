"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Clock, Gauge, Activity } from "lucide-react"
import { getEquipos } from "@/data/escuadras-data"
import { useTracking } from "@/context/tracking-context"
import type { Equipo } from "@/types/escuadras-types"


const formatTime = (dateValue: Date | string | number): string => {
  try {
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue)
    return date.toLocaleTimeString('es-CL', {
      timeZone: 'America/Santiago',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  } catch (error) {
    console.error('Error formatting time:', error)
    return 'N/A'
  }
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export function VehicleTrackingMap({ currentEquipo }: { currentEquipo?: Equipo }) {
  const [map, setMap] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])
  const [markersRef, setMarkersRef] = useState<Map<number, any>>(new Map())
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(null)
  const [apiKey, setApiKey] = useState<string>("")
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null)
  const [autoFollow, setAutoFollow] = useState<boolean>(false)
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [loading, setLoading] = useState(true)
  const { vehicleTrackings, isConnected } = useTracking()

  // Cargar equipos del backend
  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        setLoading(true)
        const equiposData = await getEquipos()
        setEquipos(equiposData)
      } catch (error) {
        console.error('Error loading equipos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEquipos()
  }, [])

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
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry&callback=initMap`
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  }, [apiKey])

  // Rastrear las actualizaciones del vehículo en tiempo real
  useEffect(() => {
    // Buscar el primer vehículo disponible en los equipos
    const firstVehicleId = equipos.find(e => e.vehiculo)?.vehiculo?.id
    if (firstVehicleId && vehicleTrackings[firstVehicleId]) {
      setLastUpdateTime(vehicleTrackings[firstVehicleId].lastUpdate)
    }
  }, [vehicleTrackings, equipos])

  // Actualizar marcadores cuando cambien los datos de tracking
  useEffect(() => {
    if (!map || !window.google || loading) return

    const equiposToShow = currentEquipo ? [currentEquipo] : equipos

    // Función para animar el marcador suavemente
    const animateMarker = (marker: any, newLat: number, newLng: number, newHeading: number) => {
      const startPosition = marker.getPosition()
      const startHeading = marker.getIcon().rotation || 0
      
      // Calcular la diferencia angular más corta para la rotación
      let headingDiff = newHeading - startHeading
      if (headingDiff > 180) headingDiff -= 360
      if (headingDiff < -180) headingDiff += 360
      
      const startTime = Date.now()
      const duration = 1000 // 1 segundo de animación
      
      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Interpolación lineal para la posición
        const lat = startPosition.lat() + (newLat - startPosition.lat()) * progress
        const lng = startPosition.lng() + (newLng - startPosition.lng()) * progress
        const heading = startHeading + headingDiff * progress
        
        // Actualizar posición y rotación
        marker.setPosition({ lat, lng })
        const icon = marker.getIcon()
        marker.setIcon({
          ...icon,
          rotation: heading
        })
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      
      requestAnimationFrame(animate)
    }

    // Crear o actualizar marcadores para cada vehículo
    equiposToShow.forEach((equipo) => {
      if (equipo.vehiculo && vehicleTrackings[equipo.vehiculo.id]) {
        const tracking = vehicleTrackings[equipo.vehiculo.id]
        const position = tracking.currentPosition
        const vehicleId = equipo.vehiculo.id
        
        // Si el marcador ya existe, solo actualizar su posición
        if (markersRef.has(vehicleId)) {
          const existingMarker = markersRef.get(vehicleId)
          
          // Animar el marcador a la nueva posición
          animateMarker(existingMarker, position.lat, position.lng, position.heading)
          
          // Actualizar el círculo de pulsación para todos los vehículos
          if (existingMarker.pulseCircle) {
            existingMarker.pulseCircle.setCenter({ lat: position.lat, lng: position.lng })
          }
          
          // Actualizar el info window si está abierto
          const infoWindow = existingMarker.infoWindow
          if (infoWindow) {
            infoWindow.setContent(`
              <div class="p-2">
                <h3 class="font-semibold">${equipo.nombre}</h3>
                <p class="text-sm text-gray-600">${equipo.vehiculo.marca} ${equipo.vehiculo.modelo}</p>
                <p class="text-sm"><strong>Patente:</strong> ${equipo.vehiculo.patente}</p>
                <p class="text-sm"><strong>Velocidad:</strong> ${position.speed.toFixed(1)} km/h</p>
                <p class="text-sm"><strong>Estado:</strong> ${position.status === "moving" ? "En movimiento" : "Detenido"}</p>
                <p class="text-xs text-gray-500">Última actualización: ${formatTime(tracking.lastUpdate)}</p>
                <p class="text-xs text-blue-600 font-medium">� Seguimiento GPS</p>
              </div>
            `)
          }
        } else {
          // Crear nuevo marcador
          const marker = new window.google.maps.Marker({
            position: { lat: position.lat, lng: position.lng },
            map: map,
            title: `${equipo.nombre} - ${equipo.vehiculo.patente}`,
            icon: {
              path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 6,
              fillColor: "#3b82f6",
              fillOpacity: 0.8,
              strokeColor: "#ffffff",
              strokeWeight: 2,
              rotation: position.heading,
            },
          })

          // Agregar efecto de pulsación para vehículos con tracking activo
          const pulseCircle = new window.google.maps.Circle({
            center: { lat: position.lat, lng: position.lng },
            radius: 80, // Radio en metros
            strokeColor: "#3b82f6",
            strokeOpacity: 0.6,
            strokeWeight: 2,
            fillColor: "#3b82f6",
            fillOpacity: 0.1,
            map: map,
          })
          
          // Asociar el círculo de pulsación al marcador
          marker.pulseCircle = pulseCircle

          // Info window
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div class="p-2">
                <h3 class="font-semibold">${equipo.nombre}</h3>
                <p class="text-sm text-gray-600">${equipo.vehiculo.marca} ${equipo.vehiculo.modelo}</p>
                <p class="text-sm"><strong>Patente:</strong> ${equipo.vehiculo.patente}</p>
                <p class="text-sm"><strong>Velocidad:</strong> ${position.speed.toFixed(1)} km/h</p>
                <p class="text-sm"><strong>Estado:</strong> ${position.status === "moving" ? "En movimiento" : "Detenido"}</p>
                <p class="text-xs text-gray-500">Última actualización: ${formatTime(tracking.lastUpdate)}</p>
                <p class="text-xs text-blue-600 font-medium">� Seguimiento GPS</p>
              </div>
            `,
          })

          // Asociar el info window al marcador
          marker.infoWindow = infoWindow

          marker.addListener("click", () => {
            infoWindow.open(map, marker)
            setSelectedVehicle(vehicleId)
          })

          // Guardar referencia del marcador
          markersRef.set(vehicleId, marker)
        }
      }
    })

    // Limpiar marcadores de vehículos que ya no tienen tracking
    const vehiclesWithTracking = new Set(
      equiposToShow
        .filter(e => e.vehiculo && vehicleTrackings[e.vehiculo.id])
        .map(e => e.vehiculo!.id)
    )
    
    markersRef.forEach((marker, vehicleId) => {
      if (!vehiclesWithTracking.has(vehicleId)) {
        marker.setMap(null)
        // Limpiar el círculo de pulsación si existe
        if (marker.pulseCircle) {
          marker.pulseCircle.setMap(null)
        }
        markersRef.delete(vehicleId)
      }
    })

    // Actualizar el estado de markers para compatibilidad
    setMarkers(Array.from(markersRef.values()))
  }, [map, vehicleTrackings, markersRef, currentEquipo, equipos, loading])

  // Seguir automáticamente al vehículo en tiempo real
  useEffect(() => {
    if (!map || !selectedVehicle || !vehicleTrackings[selectedVehicle]) return

    const realTimeVehicle = vehicleTrackings[selectedVehicle]
    const position = realTimeVehicle.currentPosition

    // Solo seguir si el vehículo está en movimiento, es el vehículo seleccionado y el seguimiento automático está activado
    if (position.status === "moving" && autoFollow) {
      const currentCenter = map.getCenter()
      const vehiclePosition = { lat: position.lat, lng: position.lng }
      
      // Calcular la distancia entre el centro actual y la posición del vehículo
      const distance = window.google.maps.geometry.spherical.computeDistanceBetween(
        new window.google.maps.LatLng(currentCenter.lat(), currentCenter.lng()),
        new window.google.maps.LatLng(vehiclePosition.lat, vehiclePosition.lng)
      )
      
      // Si el vehículo está muy lejos del centro (más de 500 metros), recentrar
      if (distance > 500) {
        map.panTo(vehiclePosition)
      }
    }
  }, [map, vehicleTrackings, selectedVehicle, autoFollow])

  // Seleccionar automáticamente el vehículo del equipo actual
  useEffect(() => {
    if (currentEquipo?.vehiculo && vehicleTrackings[currentEquipo.vehiculo.id]) {
      setSelectedVehicle(currentEquipo.vehiculo.id)
      
      // Centrar el mapa en el vehículo del equipo actual
      if (map) {
        const tracking = vehicleTrackings[currentEquipo.vehiculo.id]
        const position = tracking.currentPosition
        map.setCenter({ lat: position.lat, lng: position.lng })
        map.setZoom(15) // Zoom más cercano para el equipo específico
      }
    }
  }, [currentEquipo, vehicleTrackings, map])

  // Cleanup de marcadores cuando el componente se desmonte
  useEffect(() => {
    return () => {
      // Limpiar todos los marcadores al desmontar
      markersRef.forEach((marker) => {
        marker.setMap(null)
        // Limpiar el círculo de pulsación si existe
        if (marker.pulseCircle) {
          marker.pulseCircle.setMap(null)
        }
      })
      markersRef.clear()
    }
  }, [markersRef])

  const selectedTracking = selectedVehicle ? vehicleTrackings[selectedVehicle] : null
  const selectedEquipo = selectedVehicle ? equipos.find((e: Equipo) => e.vehiculo?.id === selectedVehicle) : null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Cargando datos...</p>
        </div>
      </div>
    )
  }

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
              {lastUpdateTime && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Última actualización: {formatTime(lastUpdateTime)}
                </Badge>
              )}
              {selectedVehicle && (
                <Button
                  variant={autoFollow ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAutoFollow(!autoFollow)}
                  className="flex items-center gap-1"
                >
                  <Navigation className="h-3 w-3" />
                  {autoFollow ? "Siguiendo" : "Seguir vehículo"}
                </Button>
              )}
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
            <CardTitle className="text-lg">
              {currentEquipo ? `${currentEquipo.nombre}` : "Vehículos Activos"}
            </CardTitle>
            {currentEquipo && (
              <CardDescription>
                Seguimiento del vehículo {currentEquipo.vehiculo?.patente || "sin asignar"}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {(currentEquipo ? [currentEquipo] : equipos)
              .filter((e: Equipo) => e.vehiculo && vehicleTrackings[e.vehiculo.id])
              .map((equipo: Equipo) => {
                const tracking = vehicleTrackings[equipo.vehiculo!.id]
                const isActive = !!tracking

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
                        {isActive && (
                          <Badge variant="default" className="text-xs">
                            GPS
                          </Badge>
                        )}
                        <Badge variant={tracking.isOnline ? "default" : "secondary"} className="text-xs">
                          {tracking.isOnline ? "Online" : "Offline"}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {equipo.vehiculo!.patente} • {tracking.currentPosition.speed.toFixed(1)} km/h
                      {isActive && (
                        <span className="text-green-600 font-medium ml-2">
                          • Activo
                        </span>
                      )}
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
                    <p className="text-xs text-muted-foreground">{formatTime(selectedTracking.lastUpdate)}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-sm font-medium mb-2">Estado del vehículo</p>
                <Badge variant={selectedTracking.currentPosition.status === "moving" ? "default" : "secondary"}>
                  {selectedTracking.currentPosition.status === "moving" ? "En movimiento" : "Detenido"}
                </Badge>
                <Badge variant="default" className="ml-2">
                  <Activity className="h-3 w-3 mr-1" />
                  GPS Activo
                </Badge>
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
