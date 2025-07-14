export interface Trabajador {
  id: number
  nombre: string
  apellido: string
  rut: string
  telefono: string
  email: string
  fechaIngreso: Date
  activo: boolean
  equipoId?: number
}

export interface Supervisor {
  id: number
  fullName: string
  rut: string
  email: string
  celular: string
  equipoID?: number
}

export interface Zona {
  id: number
  nombre: string
  descripcion: string
  coordenadas: { lat: number; lng: number }[]
  activa: boolean
}

export interface Vehiculo {
  id: number
  patente: string
  marca: string
  modelo: string
  latitud?: number
  longitud?: number
  altitud?: number
  velocidad: number
  heading: number
  timestamp?: Date
  equipoID?: number
  beaconID?: number
}

export interface Equipo {
  id: number
  nombre: string
  supervisorID: number
  supervisor: Supervisor
  empleados?: Trabajador[]
  vehiculoID: number
  vehiculo: Vehiculo
  fechaCreacion?: Date
  activa?: boolean
  descripcion?: string
}

export interface CreateEquipoData {
  // Cambiado de CreateEscuadraData
  nombre: string
  supervisorId: number
  zonaId: number
  vehiculoId: number
  trabajadorIds: number[]
  descripcion?: string
}
