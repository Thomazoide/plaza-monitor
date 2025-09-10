"use client"

import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react"
import type { Equipo } from "@/types/escuadras-types"
import type { TrackingData } from "@/types/tracking-types"

// Helper function to safely format date
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
    initEquipoMap: () => void
  }
}

interface EquipoTrackingMapProps {
  equipo: Equipo
  onTrackingUpdate?: (info: { lastUpdate: Date; timestamp: Date; lat: number; lng: number }) => void
}

export interface EquipoTrackingMapRef {
  center: () => void
}

export const EquipoTrackingMap = forwardRef<EquipoTrackingMapRef, EquipoTrackingMapProps>(({ equipo, onTrackingUpdate }, ref) => {
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [apiKey, setApiKey] = useState<string>("")
  const [autoFollow] = useState<boolean>(true)
  const [vehicleTrackingData, setVehicleTrackingData] = useState<TrackingData | null>(null)

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

  // Obtener datos de tracking del backend (cada 5s)
  useEffect(() => {
    if (!equipo.vehiculo) return
    let interval: NodeJS.Timeout | null = null

    const fetchTrackingData = async () => {
      try {
        const endpointResp = await fetch("/api/get-backend-endpoint")
        if (!endpointResp.ok) throw new Error("No se pudo obtener BACKEND_ENDPOINT")
        const { endpoint } = await endpointResp.json()

        const res = await fetch(`${endpoint}/vehiculos/${equipo.vehiculo!.id}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (json?.error || !json?.data) return
        const v = json.data
        const position: TrackingData["currentPosition"] = {
          vehiculoId: v.id,
          lat: v.latitud ?? -33.5059767,
          lng: v.longitud ?? -70.7538867,
          speed: v.velocidad ?? 0,
          heading: v.heading ?? 0,
          timestamp: v.timestamp ? new Date(v.timestamp) : new Date(),
          status: ((v.velocidad ?? 0) > 1 ? "moving" : "stopped"),
        }
        let nextState: TrackingData
        setVehicleTrackingData((prev) => {
          const built: TrackingData = {
            currentPosition: position,
            route: prev ? [...prev.route, position].slice(-100) : [position],
            isOnline: true,
            lastUpdate: new Date(),
            batteryLevel: 85,
          }
          try {
            onTrackingUpdate?.({
              lastUpdate: built.lastUpdate,
              timestamp: built.currentPosition.timestamp,
              lat: built.currentPosition.lat,
              lng: built.currentPosition.lng,
            })
          } catch {}
          return built
        })
      } catch (e) {
        console.error("Error tracking fetch:", e)
      }
    }

    fetchTrackingData()
    interval = setInterval(fetchTrackingData, 5000)
    return () => { if (interval) clearInterval(interval) }
  }, [equipo.vehiculo])

  // Usar los datos del vehículo directamente si están disponibles
  useEffect(() => {
    if (!equipo.vehiculo || !equipo.vehiculo.latitud || !equipo.vehiculo.longitud) return

    const trackingData: TrackingData = {
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
    try {
      onTrackingUpdate?.({
        lastUpdate: trackingData.lastUpdate,
        timestamp: trackingData.currentPosition.timestamp,
        lat: trackingData.currentPosition.lat,
        lng: trackingData.currentPosition.lng,
      })
    } catch {}
  }, [equipo.vehiculo])

  // Usar vehicleTrackingData si está disponible, sino usar la prop vehicleTracking
  const currentVehicleTracking = vehicleTrackingData

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

  // Seguimiento automático: mantener el mapa centrado en todo momento si autoFollow está activo
  if (autoFollow) {
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

  const centerMap = () => {
    if (map && currentVehicleTracking) {
      map.panTo({
        lat: currentVehicleTracking.currentPosition.lat,
        lng: currentVehicleTracking.currentPosition.lng,
      })
      map.setZoom(16)
    }
  }

  useImperativeHandle(ref, () => ({ center: centerMap }), [map, currentVehicleTracking])

  return (
    <div id="equipo-tracking-map" className="w-full h-full rounded-lg" />
  )
})
