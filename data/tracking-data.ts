import type { VehiclePosition, TrackingData } from "@/types/tracking-types"

// Simulación de datos de tracking en tiempo real
export const generateVehicleTracking = (vehiculoId: number): TrackingData => {
  const basePositions = [
    { lat: -33.609284, lng: -70.575925 }, // Plaza de Puente Alto
    { lat: -33.6105, lng: -70.5762 },
    { lat: -33.612, lng: -70.577 },
    { lat: -33.6135, lng: -70.5785 },
    { lat: -33.615, lng: -70.58 },
    { lat: -33.6165, lng: -70.5815 },
    { lat: -33.618, lng: -70.583 },
    { lat: -33.6195, lng: -70.5845 },
    { lat: -33.621, lng: -70.586 },
    { lat: -33.622, lng: -70.5875 },
  ]

  const now = new Date()
  const route: VehiclePosition[] = []

  // Generar historial de posiciones (últimas 2 horas)
  for (let i = 0; i < basePositions.length; i++) {
    const timestamp = new Date(now.getTime() - (basePositions.length - i) * 12 * 60 * 1000) // cada 12 minutos
    const position = basePositions[i]

    // Añadir algo de variación aleatoria
    const lat = position.lat + (Math.random() - 0.5) * 0.001
    const lng = position.lng + (Math.random() - 0.5) * 0.001

    route.push({
      id: i + 1,
      vehiculoId,
      lat,
      lng,
      timestamp,
      speed: Math.random() * 40 + 10, // 10-50 km/h
      heading: Math.random() * 360,
      status: Math.random() > 0.8 ? "stopped" : Math.random() > 0.9 ? "idle" : "moving",
    })
  }

  // Posición actual (la más reciente)
  const currentPosition = route[route.length - 1]

  return {
    currentPosition,
    route,
    isOnline: Math.random() > 0.1, // 90% probabilidad de estar online
    lastUpdate: now,
    batteryLevel: Math.floor(Math.random() * 40) + 60, // 60-100%
    fuelLevel: Math.floor(Math.random() * 50) + 50, // 50-100%
  }
}

// Simular actualizaciones en tiempo real
export const updateVehiclePosition = (currentTracking: TrackingData): TrackingData => {
  const lastPosition = currentTracking.currentPosition

  // Generar nueva posición cerca de la actual
  const newLat = lastPosition.lat + (Math.random() - 0.5) * 0.0005
  const newLng = lastPosition.lng + (Math.random() - 0.5) * 0.0005

  const newPosition: VehiclePosition = {
    id: lastPosition.id + 1,
    vehiculoId: lastPosition.vehiculoId,
    lat: newLat,
    lng: newLng,
    timestamp: new Date(),
    speed: Math.max(0, lastPosition.speed + (Math.random() - 0.5) * 10),
    heading: (lastPosition.heading + (Math.random() - 0.5) * 30) % 360,
    status: Math.random() > 0.8 ? "stopped" : Math.random() > 0.9 ? "idle" : "moving",
  }

  // Mantener solo las últimas 50 posiciones para el historial
  const updatedRoute = [...currentTracking.route, newPosition].slice(-50)

  return {
    ...currentTracking,
    currentPosition: newPosition,
    route: updatedRoute,
    lastUpdate: new Date(),
    batteryLevel: Math.max(0, (currentTracking.batteryLevel || 80) - Math.random() * 0.5),
    fuelLevel: Math.max(0, (currentTracking.fuelLevel || 75) - Math.random() * 0.2),
  }
}
