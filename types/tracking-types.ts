export interface VehiclePosition {
  vehiculoId: number
  lat: number
  lng: number
  timestamp: Date
  speed: number // km/h
  heading: number // grados (0-360)
  status: "moving" | "stopped" | "idle"
}

export interface TrackingData {
  currentPosition: VehiclePosition
  route: VehiclePosition[]
  isOnline: boolean
  lastUpdate: Date
  batteryLevel?: number
  fuelLevel?: number
}

// Respuesta del socket (sin id y status)
export interface SocketPositionResponse {
  vehiculoId: number
  lat: number
  lng: number
  timestamp: string
  speed: number
  heading: number
}

// Respuesta del API de vehículos
export interface VehicleApiResponse {
  message: string
  data: {
    id: number
    patente: string
    marca: string
    modelo: string
    latitud: number
    longitud: number
    altitud: number
    velocidad: number
    heading: number
    timestamp: string
    equipoID: number | null
    beaconID: number | null
  }
  error: boolean
}
