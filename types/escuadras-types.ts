export interface Trabajador {
  id: number
  nombre: string
  apellido: string
  rut: string
  telefono: string
  email: string
  fechaIngreso: Date
  activo: boolean
  escuadraId?: number
}

export interface Supervisor {
  id: number
  nombre: string
  apellido: string
  rut: string
  telefono: string
  email: string
  fechaIngreso: Date
  activo: boolean
  experiencia: number // años de experiencia
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
  año: number
  tipo: "camioneta" | "camion" | "furgon"
  estado: "disponible" | "en_uso" | "mantenimiento"
  combustible: number // porcentaje
}

export interface Escuadra {
  id: number
  nombre: string
  supervisor: Supervisor
  trabajadores: Trabajador[]
  zona: Zona
  vehiculo: Vehiculo
  fechaCreacion: Date
  activa: boolean
  descripcion?: string
}

export interface CreateEscuadraData {
  nombre: string
  supervisorId: number
  zonaId: number
  vehiculoId: number
  trabajadorIds: number[]
  descripcion?: string
}
