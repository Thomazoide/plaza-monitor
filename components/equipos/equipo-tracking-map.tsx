"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Clock, Gauge, Activity } from "lucide-react"
import type { Equipo } from "@/types/escuadras-types"
import type { TrackingData } from "@/types/tracking-types"
import { getVehicleTrackingData } from "@/data/escuadras-data"

// Helper function to safely format date
const formatTime = (dateValue: Date | string | number): string => {
  try {
    const date = dateValue instanceof Date ? dateValue : new Date(dateValue)
    return date.toLocaleTimeString()
  } catch (error) {
    console.error('Error formatting time:', error)
    return 'N/A'
  }
}

declare global {
  interface Window {
    google: any
    initEquipoMap: () => void
  }
}

interface EquipoTrackingMapProps {
  equipo: Equipo
  vehicleTracking: TrackingData | null
  isConnected: boolean
}

export function EquipoTrackingMap({ equipo, vehicleTracking, isConnected }: EquipoTrackingMapProps) {
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [apiKey, setApiKey] = useState<string>("")
  const [autoFollow, setAutoFollow] = useState<boolean>(true)
  const [vehicleTrackingData, setVehicleTrackingData] = useState<TrackingData | null>(vehicleTracking)

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
        const initialCenter = { lat: -33.5059767, lng: -70.7538867 } // Centro fijo inicial

        const mapInstance = new window.google.maps.Map(document.getElementById("equipo-tracking-map"), {
          center: initialCenter,
          zoom: 15,
          mapTypeId: "roadmap",
        })
        setMap(mapInstance)
        console.log("Mapa inicializado una sola vez")
      }
    }

    if (window.google) {
      initializeMap()
    } else {
      window.initEquipoMap = initializeMap
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry&callback=initEquipoMap`
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  }, [apiKey]) // Solo apiKey en las dependencias, NO vehicleTracking

  // Obtener datos de tracking del backend
  useEffect(() => {
    const fetchTrackingData = async () => {
      if (!equipo.vehiculo) return

      try {
        const trackingData = await getVehicleTrackingData(equipo.vehiculo.id)
        if (trackingData) {
          setVehicleTrackingData(trackingData)
        }
      } catch (error) {
        console.error("Error fetching tracking data:", error)
      }
    }

    fetchTrackingData()
    // Actualizar cada 10 segundos
    const interval = setInterval(fetchTrackingData, 10000)

    return () => clearInterval(interval)
  }, [equipo.vehiculo])

  // Usar los datos del vehículo directamente si están disponibles
  useEffect(() => {
    if (!equipo.vehiculo || !equipo.vehiculo.latitud || !equipo.vehiculo.longitud) return

    const trackingData = {
      currentPosition: {
        vehiculoId: equipo.vehiculo.id,
        lat: equipo.vehiculo.latitud,
        lng: equipo.vehiculo.longitud,
        speed: equipo.vehiculo.velocidad,
        heading: equipo.vehiculo.heading,
        timestamp: equipo.vehiculo.timestamp || new Date(),
        status: (equipo.vehiculo.velocidad > 5 ? "moving" : "stopped") as "moving" | "stopped" | "idle"
      },
      route: [],
      isOnline: true,
      lastUpdate: equipo.vehiculo.timestamp || new Date(),
      batteryLevel: 85
    }

    setVehicleTrackingData(trackingData)
  }, [equipo.vehiculo])

  // Usar vehicleTrackingData si está disponible, sino usar la prop vehicleTracking
  const currentVehicleTracking = vehicleTrackingData || vehicleTracking

  // Centrar el mapa cuando se obtienen los primeros datos de tracking (solo una vez)
  useEffect(() => {
    if (map && currentVehicleTracking && !marker) {
      // Solo centra si no hay marcador aún (primera vez)
      const position = currentVehicleTracking.currentPosition
      map.setCenter({ lat: position.lat, lng: position.lng })
      console.log("Mapa centrado en primera carga de datos:", position.lat, position.lng)
    }
  }, [map, currentVehicleTracking, marker])

  // Función para animar el marcador suavemente
  const animateMarker = (marker: any, newLat: number, newLng: number, newHeading: number) => {
    if (!marker || !window.google) return
    
    const currentPosition = marker.getPosition()
    if (!currentPosition) {
      // Si no hay posición actual, solo establecer la nueva
      marker.setPosition(new window.google.maps.LatLng(newLat, newLng))
      
      // Actualizar círculos también
      if (marker.userLocationCircle) {
        marker.userLocationCircle.setCenter({ lat: newLat, lng: newLng })
      }
      if (marker.pulseCircle) {
        marker.pulseCircle.setCenter({ lat: newLat, lng: newLng })
      }
      return
    }
    
    const startLat = currentPosition.lat()
    const startLng = currentPosition.lng()
    
    const startTime = Date.now()
    const duration = 1000 // 1 segundo de animación
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Interpolación lineal para la posición
      const lat = startLat + (newLat - startLat) * progress
      const lng = startLng + (newLng - startLng) * progress
      
      // Actualizar posición del marcador
      marker.setPosition(new window.google.maps.LatLng(lat, lng))
      
      // Actualizar círculos
      if (marker.userLocationCircle) {
        marker.userLocationCircle.setCenter({ lat, lng })
      }
      if (marker.pulseCircle) {
        marker.pulseCircle.setCenter({ lat, lng })
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }

  // Actualizar o crear marcador cuando cambien los datos de tracking
  useEffect(() => {
    if (!map || !window.google || !currentVehicleTracking || !equipo.vehiculo) {
      console.log("Skipping marker update - missing dependencies:", {
        map: !!map,
        google: !!window.google,
        vehicleTracking: !!currentVehicleTracking,
        vehiculo: !!equipo.vehiculo
      })
      return
    }

    const position = currentVehicleTracking.currentPosition
    console.log("Updating marker with position:", position)

    if (marker) {
      console.log("Updating existing marker")
      // Actualizar posición del marcador existente
      animateMarker(marker, position.lat, position.lng, position.heading)
      
      // Actualizar info window
      const infoWindow = marker.infoWindow
      if (infoWindow) {
        infoWindow.setContent(`
          <div class="p-3">
            <h3 class="font-semibold text-lg">${equipo.nombre}</h3>
            <p class="text-sm text-gray-600">${equipo.vehiculo.marca} ${equipo.vehiculo.modelo}</p>
            <p class="text-sm"><strong>Patente:</strong> ${equipo.vehiculo.patente}</p>
            <p class="text-sm"><strong>Velocidad:</strong> ${position.speed.toFixed(1)} km/h</p>
            <p class="text-sm"><strong>Estado:</strong> ${position.status === "moving" ? "En movimiento" : "Detenido"}</p>
            <p class="text-xs text-gray-500">Última actualización: ${formatTime(currentVehicleTracking.lastUpdate)}</p>
            <p class="text-xs text-red-600 font-medium">🔴 Seguimiento en tiempo real</p>
          </div>
        `)
      }
    } else {
      console.log("Creating new marker")
      console.log("Position for marker:", position)
      console.log("Map instance:", map)
      
      // Crear nuevo marcador estándar
      const newMarker = new window.google.maps.Marker({
        position: { lat: position.lat, lng: position.lng },
        map: map,
        title: `${equipo.nombre} - ${equipo.vehiculo.patente}`,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#4285F4',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
        visible: true,
      })

      // Crear círculo exterior (como el de ubicación de usuario)
      const userLocationCircle = new window.google.maps.Circle({
        center: { lat: position.lat, lng: position.lng },
        radius: 50,
        strokeColor: '#4285F4',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#4285F4',
        fillOpacity: 0.2,
        map: map,
      })

      // Verificar si el marcador se creó correctamente
      if (!newMarker) {
        console.error("Error creando marcador")
        return
      }

      console.log("Marcador creado, verificando propiedades:")
      console.log("- Posición:", newMarker.getPosition())
      console.log("- Visible:", newMarker.getVisible())
      console.log("- Mapa:", newMarker.getMap())
      console.log("- Título:", newMarker.getTitle())
      
      // Centrar el mapa en la posición del marcador
      map.setCenter({ lat: position.lat, lng: position.lng })
      console.log("Mapa centrado en:", position.lat, position.lng)
      
      // Crear círculo de pulsación (más sutil)
      const pulseCircle = new window.google.maps.Circle({
        center: { lat: position.lat, lng: position.lng },
        radius: 80,
        strokeColor: "#4285F4",
        strokeOpacity: 0.6,
        strokeWeight: 1,
        fillColor: "#4285F4",
        fillOpacity: 0.1,
        map: map,
      })

      console.log("Círculo de usuario creado:", userLocationCircle)
      console.log("Círculo de pulsación creado:", pulseCircle)

      // Info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="p-3">
            <h3 class="font-semibold text-lg">${equipo.nombre}</h3>
            <p class="text-sm text-gray-600">${equipo.vehiculo.marca} ${equipo.vehiculo.modelo}</p>
            <p class="text-sm"><strong>Patente:</strong> ${equipo.vehiculo.patente}</p>
            <p class="text-sm"><strong>Velocidad:</strong> ${position.speed.toFixed(1)} km/h</p>
            <p class="text-sm"><strong>Estado:</strong> ${position.status === "moving" ? "En movimiento" : "Detenido"}</p>
            <p class="text-xs text-gray-500">Última actualización: ${formatTime(currentVehicleTracking.lastUpdate)}</p>
            <p class="text-xs text-red-600 font-medium">🔴 Seguimiento en tiempo real</p>
          </div>
        `,
      })

      newMarker.addListener("click", () => {
        console.log("Marcador clickeado")
        infoWindow.open(map, newMarker)
      })

      // Asociar referencias
      newMarker.infoWindow = infoWindow
      newMarker.pulseCircle = pulseCircle
      newMarker.userLocationCircle = userLocationCircle

      setMarker(newMarker)

      console.log("Nuevo marcador guardado en estado")
      
      // Verificar después de un momento
      setTimeout(() => {
        console.log("Verificación después de 1 segundo:")
        console.log("- Marcador visible:", newMarker.getVisible())
        console.log("- Marcador en mapa:", newMarker.getMap() === map)
        console.log("- Bounds del mapa:", map.getBounds())
        console.log("- Centro del mapa:", map.getCenter())
        console.log("- Zoom del mapa:", map.getZoom())
      }, 1000)
    }

    // Seguimiento automático solo si está habilitado y el vehículo se está moviendo
    if (autoFollow && position.status === "moving") {
      console.log("Auto-following vehicle")
      // Usar panTo en lugar de setCenter para un movimiento más suave
      map.panTo({ lat: position.lat, lng: position.lng })
      
      // Actualizar círculos
      if (marker && marker.userLocationCircle) {
        marker.userLocationCircle.setCenter({ lat: position.lat, lng: position.lng })
      }
      if (marker && marker.pulseCircle) {
        marker.pulseCircle.setCenter({ lat: position.lat, lng: position.lng })
      }
    } else if (marker) {
      // Solo actualizar los círculos sin mover el mapa
      if (marker.userLocationCircle) {
        marker.userLocationCircle.setCenter({ lat: position.lat, lng: position.lng })
      }
      if (marker.pulseCircle) {
        marker.pulseCircle.setCenter({ lat: position.lat, lng: position.lng })
      }
    }
  }, [map, currentVehicleTracking, equipo, marker, autoFollow])

  // Cleanup
  useEffect(() => {
    return () => {
      console.log("Cleaning up marker and map resources")
      if (marker) {
        if (marker.infoWindow) {
          marker.infoWindow.close()
        }
        if (marker.pulseCircle) {
          marker.pulseCircle.setMap(null)
        }
        if (marker.userLocationCircle) {
          marker.userLocationCircle.setMap(null)
        }
        marker.setMap(null)
      }
    }
  }, [marker])

  // Cleanup cuando el componente se desmonta
  useEffect(() => {
    return () => {
      console.log("Component unmounting - cleaning up all resources")
      if (marker) {
        if (marker.infoWindow) {
          marker.infoWindow.close()
        }
        if (marker.pulseCircle) {
          marker.pulseCircle.setMap(null)
        }
        if (marker.userLocationCircle) {
          marker.userLocationCircle.setMap(null)
        }
        marker.setMap(null)
      }
    }
  }, [])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Seguimiento - {equipo.nombre}</CardTitle>
                <CardDescription>
                  {equipo.vehiculo ? `Vehículo ${equipo.vehiculo.patente}` : "Sin vehículo asignado"}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
                  <Activity className="h-3 w-3" />
                  {isConnected ? "Conectado" : "Desconectado"}
                </Badge>
                {currentVehicleTracking && (
                  <Badge variant="destructive" className="flex items-center gap-1 animate-pulse">
                    <Activity className="h-3 w-3" />
                    LIVE
                  </Badge>
                )}
                <Button
                  variant={autoFollow ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const newAutoFollow = !autoFollow
                    setAutoFollow(newAutoFollow)
                    console.log("Auto-follow cambiado a:", newAutoFollow)
                    
                    // Si se activa el seguimiento y hay datos, centrar inmediatamente
                    if (newAutoFollow && currentVehicleTracking && map) {
                      map.panTo({ 
                        lat: currentVehicleTracking.currentPosition.lat, 
                        lng: currentVehicleTracking.currentPosition.lng 
                      })
                    }
                  }}
                  className="flex items-center gap-1"
                >
                  <Navigation className="h-3 w-3" />
                  {autoFollow ? "Siguiendo" : "Seguir"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (map && window.google) {
                      console.log("Creando marcador de prueba...")
                      const testMarker = new window.google.maps.Marker({
                        position: { lat: -33.5059767, lng: -70.7538867 },
                        map: map,
                        title: "Marcador de prueba",
                        visible: true,
                      })
                      console.log("Marcador de prueba creado:", testMarker)
                      map.setCenter({ lat: -33.5059767, lng: -70.7538867 })
                      map.setZoom(15)
                    }
                  }}
                >
                  Test Marker
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    console.log("=== ESTADO DEL MAPA ===")
                    console.log("Map:", map)
                    console.log("Marker:", marker)
                    console.log("VehicleTracking:", currentVehicleTracking)
                    console.log("Google Maps loaded:", !!window.google)
                    if (map) {
                      console.log("Map center:", map.getCenter())
                      console.log("Map zoom:", map.getZoom())
                      console.log("Map bounds:", map.getBounds())
                    }
                    if (marker) {
                      console.log("Marker position:", marker.getPosition())
                      console.log("Marker visible:", marker.getVisible())
                      console.log("Marker map:", marker.getMap())
                    }
                  }}
                >
                  Debug
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div id="equipo-tracking-map" className="w-full h-[500px] rounded-b-lg" />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {currentVehicleTracking && equipo.vehiculo && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Vehículo</CardTitle>
              <CardDescription>{equipo.nombre}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Ubicación</p>
                    <p className="text-xs text-muted-foreground">
                      {currentVehicleTracking.currentPosition.lat.toFixed(6)},{" "}
                      {currentVehicleTracking.currentPosition.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Velocidad</p>
                    <p className="text-xs text-muted-foreground">
                      {currentVehicleTracking.currentPosition.speed.toFixed(1)} km/h
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Dirección</p>
                    <p className="text-xs text-muted-foreground">{currentVehicleTracking.currentPosition.heading}°</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Última actualización</p>
                    <p className="text-xs text-muted-foreground">{formatTime(currentVehicleTracking.lastUpdate)}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-sm font-medium mb-2">Estado del vehículo</p>
                <div className="flex items-center gap-2">
                  <Badge variant={currentVehicleTracking.currentPosition.status === "moving" ? "default" : "secondary"}>
                    {currentVehicleTracking.currentPosition.status === "moving" ? "En movimiento" : "Detenido"}
                  </Badge>
                  <Badge variant="destructive">
                    <Activity className="h-3 w-3 mr-1" />
                    Tiempo real
                  </Badge>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  if (map && currentVehicleTracking) {
                    map.setCenter({
                      lat: currentVehicleTracking.currentPosition.lat,
                      lng: currentVehicleTracking.currentPosition.lng,
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

        {!currentVehicleTracking && (
          <Card>
            <CardContent className="p-8 text-center">
              <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Esperando datos...</h3>
              <p className="text-gray-500">Conectando al seguimiento en tiempo real</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
