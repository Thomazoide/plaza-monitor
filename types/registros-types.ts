export interface Registro {
  id: number
  fecha: string // e.g., "08-09-2025"
  id_zona: number
  hora_llegada: string // e.g., "12:13"
  hora_salida: string // e.g., "12:41"
  supervisor_id: number
}

export interface PlazaCoordinate {
  lat: number
  lng: number
}

export interface Plaza {
  id: number
  name: string
  coordinates: PlazaCoordinate[]
  lastVisited: string | null
  info: string | null
  beaconID: number | null
}
