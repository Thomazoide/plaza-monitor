"use client"

import { useEffect, useRef, useState } from "react"
import { Loader } from "@googlemaps/js-api-loader"
import type { Vehiculo, Equipo } from "@/types/escuadras-types"
import { fetchVehiculos } from "@/data/escuadras-data"
import { formatTime } from "@/utils/format"

declare global {
  interface Window {
    google: any
  }
}

interface DatabaseVehiclesMapProps {
  vehiculos: Vehiculo[]
  equipos: Equipo[]
  onVehiculosUpdate: (vehiculos: Vehiculo[]) => void
}

export default function DatabaseVehiclesMap({ vehiculos, equipos, onVehiculosUpdate }: DatabaseVehiclesMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const infoWindowRef = useRef<any>(null)
  const [apiKey, setApiKey] = useState<string>("")
  const mapInstanceRef = useRef<any>(null)
  const vehicleMarkersRef = useRef<Record<number, any>>({})
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())

  // Fetch API key
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

  // Update vehicles every 5 seconds
  useEffect(() => {
    const updateVehicles = async () => {
      try {
        const updatedVehiculos = await fetchVehiculos()
        onVehiculosUpdate(updatedVehiculos)
        setLastUpdate(new Date())
      } catch (error) {
        console.error("Error updating vehicles:", error)
      }
    }

    // Update immediately
    updateVehicles()

    // Set up interval for every 5 seconds
    const interval = setInterval(updateVehicles, 5000)

    return () => clearInterval(interval)
  }, [onVehiculosUpdate])

  // Initialize map
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
          center: { lat: -33.6119, lng: -70.5758 }, // Santiago, Chile center
          zoom: 12,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        })
        mapInstanceRef.current = mapInstance
        infoWindowRef.current = new google.maps.InfoWindow()
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

  // Function to get vehicle icon based on status
  function getVehicleIcon(vehicle: Vehiculo): any {
    if (!window.google) return null

    // Check if vehicle has location data
    if (!vehicle.latitud || !vehicle.longitud) {
      return {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 6,
        fillColor: "#9CA3AF",
        fillOpacity: 0.8,
        strokeWeight: 1,
        strokeColor: "#ffffff",
      }
    }

    // Check if vehicle is moving (speed > 0)
    if (vehicle.velocidad > 0) {
      return {
        path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        scale: 5,
        rotation: vehicle.heading || 0,
        fillColor: "#10B981",
        fillOpacity: 1,
        strokeWeight: 1,
        strokeColor: "#ffffff",
      }
    }

    // Vehicle is stopped
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      scale: 7,
      fillColor: "#F59E0B",
      fillOpacity: 1,
      strokeWeight: 1,
      strokeColor: "#ffffff",
    }
  }

  // Update vehicle markers
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current) return
    const map = mapInstanceRef.current

    // Clear existing markers for vehicles that no longer exist
    Object.keys(vehicleMarkersRef.current).forEach((vehicleIdStr) => {
      const vehicleId = Number.parseInt(vehicleIdStr, 10)
      if (!vehiculos.find((v) => v.id === vehicleId)) {
        const marker = vehicleMarkersRef.current[vehicleId]
        if (marker) {
          marker.setMap(null)
          delete vehicleMarkersRef.current[vehicleId]
        }
      }
    })

    // Update or create markers for current vehicles
    vehiculos.forEach((vehicle) => {
      // Only show vehicles with location data
      if (!vehicle.latitud || !vehicle.longitud) return

      const position = {
        lat: vehicle.latitud,
        lng: vehicle.longitud,
      }
      const icon = getVehicleIcon(vehicle)
      let marker = vehicleMarkersRef.current[vehicle.id]

      if (marker) {
        // Update existing marker
        marker.setPosition(position)
        marker.setIcon(icon)
      } else {
        // Create new marker
        marker = new window.google.maps.Marker({
          position,
          map,
          icon,
          title: `Vehículo: ${vehicle.patente}`,
          zIndex: 2,
        })

        marker.addListener("click", () => {
          if (infoWindowRef.current && map) {
            const equipoAsignado = equipos.find((equipo) => equipo.vehiculo?.id === vehicle.id)
            const statusText = vehicle.velocidad > 0 ? "En movimiento" : "Detenido"
            const locationText = vehicle.latitud && vehicle.longitud 
              ? `Lat: ${vehicle.latitud.toFixed(6)}, Lng: ${vehicle.longitud.toFixed(6)}`
              : "Sin ubicación"

            infoWindowRef.current.setContent(
              `<div style="padding: 8px; max-width: 280px;">
                 <h4 style="font-weight: bold; margin-bottom: 8px; color: #1f2937;">Vehículo: ${vehicle.patente}</h4>
                 <div style="margin-bottom: 4px;"><strong>Marca:</strong> ${vehicle.marca} ${vehicle.modelo}</div>
                 <div style="margin-bottom: 4px;"><strong>Velocidad:</strong> ${vehicle.velocidad ? vehicle.velocidad.toFixed(1) : 0} km/h</div>
                 <div style="margin-bottom: 4px;"><strong>Estado:</strong> <span style="color: ${vehicle.velocidad > 0 ? '#10B981' : '#F59E0B'};">${statusText}</span></div>
                 ${equipoAsignado ? `<div style="margin-bottom: 4px;"><strong>Equipo:</strong> ${equipoAsignado.nombre}</div>` : ""}
                 <div style="margin-bottom: 4px;"><strong>Ubicación:</strong> ${locationText}</div>
                 ${vehicle.timestamp ? `<div style="font-size: 0.8rem; color: #6B7280;">Última act.: ${formatTime(vehicle.timestamp)}</div>` : ""}
               </div>`,
            )
            infoWindowRef.current.open(map, marker)
          }
        })

        vehicleMarkersRef.current[vehicle.id] = marker
      }
    })
  }, [isMapReady, vehiculos, equipos])

  // Auto-fit map to show all vehicles
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || vehiculos.length === 0) return

    const vehiclesWithLocation = vehiculos.filter(v => v.latitud && v.longitud)
    if (vehiclesWithLocation.length === 0) return

    const bounds = new window.google.maps.LatLngBounds()
    vehiclesWithLocation.forEach((vehicle) => {
      if (vehicle.latitud && vehicle.longitud) {
        bounds.extend(new window.google.maps.LatLng(vehicle.latitud, vehicle.longitud))
      }
    })

    mapInstanceRef.current.fitBounds(bounds)
    
    // Don't zoom in too much for single vehicle
    if (vehiclesWithLocation.length === 1) {
      const listener = window.google.maps.event.addListener(mapInstanceRef.current, 'bounds_changed', () => {
        if (mapInstanceRef.current.getZoom() > 16) {
          mapInstanceRef.current.setZoom(16)
        }
        window.google.maps.event.removeListener(listener)
      })
    }
  }, [isMapReady, vehiculos])

  const vehiclesWithLocation = vehiculos.filter(v => v.latitud && v.longitud)

  return (
    <div className="relative w-full">
      {mapError && (
        <div className="absolute top-0 left-0 right-0 bg-red-100 text-red-700 p-2 z-[1000] text-center">
          {mapError}
        </div>
      )}
      
      {/* Vehicle stats header */}
      <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-blue-600">Total Vehículos</div>
          <div className="text-2xl font-bold text-blue-900">{vehiculos.length}</div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-green-600">Con Ubicación</div>
          <div className="text-2xl font-bold text-green-900">{vehiclesWithLocation.length}</div>
        </div>
        <div className="bg-yellow-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-yellow-600">En Movimiento</div>
          <div className="text-2xl font-bold text-yellow-900">
            {vehiclesWithLocation.filter(v => v.velocidad > 0).length}
          </div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="text-sm font-medium text-gray-600">Última Actualización</div>
          <div className="text-sm font-bold text-gray-900">{formatTime(lastUpdate)}</div>
        </div>
      </div>

      {/* Map */}
      <div
        ref={mapRef}
        className="w-full h-[500px] bg-gray-100 rounded-lg"
        style={{ visibility: isMapReady ? "visible" : "hidden" }}
      />
      
      {!isMapReady && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div
              className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
              role="status"
            >
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Cargando...
              </span>
            </div>
            <p className="mt-2 text-gray-600">Cargando mapa de vehículos...</p>
          </div>
        </div>
      )}

      {vehiclesWithLocation.length === 0 && isMapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
          <div className="text-center">
            <div className="text-gray-500 text-lg mb-2">No hay vehículos con ubicación disponible</div>
            <div className="text-gray-400 text-sm">Los vehículos aparecerán aquí cuando tengan datos de GPS</div>
          </div>
        </div>
      )}
    </div>
  )
}
