import type { Trabajador, Supervisor, Vehiculo, Zona } from "./escuadras-types"

export interface Beacon {
  id: number
  mac: string
  bateria: number
  empleado?: Trabajador
  supervisor?: Supervisor
  vehiculo?: Vehiculo
  zona?: Zona
}

export type BeaconAssignmentType = "empleado" | "supervisor" | "vehiculo" | "zona"

export interface CreateBeaconRequest {
  mac: string
  bateria: number
}

export interface AssignBeaconRequest {
  beaconId: number
  assignmentType: BeaconAssignmentType
  assignmentId: number
}
