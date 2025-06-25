export interface VehiclePosition {
  id: number
  vehiculoId: number
  lat: number
  lng: number
  timestamp: Date
  speed: number // km/h
  heading: number // grados (0-360)
  status: "moving" | "stopped" | "idle"
}

export interface VehicleRoute {
  vehiculoId: number
  positions: VehiclePosition[]
  startTime: Date
  endTime?: Date
  totalDistance: number // metros
  averageSpeed: number // km/h
}

export interface TrackingData {
  currentPosition: VehiclePosition
  route: VehiclePosition[]
  isOnline: boolean
  lastUpdate: Date
  batteryLevel?: number
  fuelLevel?: number
}
