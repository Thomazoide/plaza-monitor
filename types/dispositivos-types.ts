import type { GreenArea } from "./map-types" // Usaremos GreenArea para las plazas
import type { Escuadra, Vehiculo } from "./escuadras-types"

export type DeviceType = "gateway" | "beacon"
export type DeviceStatus = "activo" | "inactivo" | "mantenimiento" | "sin asignar"

export interface BaseDevice {
  id: string // Identificador único del dispositivo físico (e.g., MAC, Serial)
  nombre: string
  tipo: DeviceType
  estado: DeviceStatus
  fechaAgregado: string // ISO date string
  ultimaConexion?: string // ISO date string
}

export interface GatewayDevice extends BaseDevice {
  tipo: "gateway"
  greenAreaId?: string // ID de la GreenArea (plaza) asignada
  greenArea?: GreenArea // Objeto GreenArea completo
  ipAddress?: string
  versionFirmware?: string
}

export interface BeaconDevice extends BaseDevice {
  tipo: "beacon"
  escuadraId?: string // ID de la escuadra asignada
  escuadra?: Escuadra // Objeto Escuadra completo
  vehiculoId?: string // ID del vehículo asignado
  vehiculo?: Vehiculo // Objeto Vehiculo completo
  nivelBateria?: number // Porcentaje 0-100
  txPower?: number // Potencia de transmisión en dBm
}

export type Dispositivo = GatewayDevice | BeaconDevice

// Para los formularios de asignación
export interface AsignarGatewayPlazaProps {
  gateway: GatewayDevice
  plazas: GreenArea[] // Cambiado de zonas a plazas (GreenArea)
  onAssign: (gatewayId: string, plazaId: string | null) => void
  onCancel: () => void
}

export interface AsignarBeaconProps {
  beacon: BeaconDevice
  escuadras: Escuadra[]
  vehiculos: Vehiculo[]
  onAssign: (beaconId: string, escuadraId: string | null, vehiculoId: string | null) => void
  onCancel: () => void
}
