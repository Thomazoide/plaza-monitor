import type { Dispositivo, GatewayDevice, BeaconDevice } from "@/types/dispositivos-types"
import { greenAreas } from "./green-areas" // Para asignar a plazas

// Mock data para equipos y vehículos (datos de ejemplo)
const mockEquipos = [
  { id: 1, nombre: "Equipo Alpha" },
  { id: 2, nombre: "Equipo Beta" },
  { id: 3, nombre: "Equipo Gamma" }
]

const mockVehiculos = [
  { id: 1, patente: "ABC-123", marca: "Toyota", modelo: "Hilux" },
  { id: 2, patente: "DEF-456", marca: "Ford", modelo: "Ranger" },
  { id: 3, patente: "GHI-789", marca: "Chevrolet", modelo: "S10" }
]

export const dispositivosData: Dispositivo[] = [
  {
    id: "GW-001",
    nombre: "Gateway Principal Plaza de Armas",
    tipo: "gateway",
    estado: "activo",
    fechaAgregado: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 días atrás
    ultimaConexion: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hora atrás
    ipAddress: "192.168.1.10",
    versionFirmware: "1.2.3",
    greenAreaId: greenAreas[0]?.id.toString(), // Asignado a la primera plaza de ejemplo
    greenArea: greenAreas[0],
  } as GatewayDevice,
  {
    id: "GW-002",
    nombre: "Gateway Parque Juan Pablo II",
    tipo: "gateway",
    estado: "inactivo",
    fechaAgregado: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    ultimaConexion: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25 horas atrás
    ipAddress: "192.168.1.11",
    versionFirmware: "1.2.1",
    greenAreaId: greenAreas[1]?.id.toString(),
    greenArea: greenAreas[1],
  } as GatewayDevice,
  {
    id: "GW-003",
    nombre: "Gateway Bodega Central",
    tipo: "gateway",
    estado: "sin asignar",
    fechaAgregado: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    ipAddress: "192.168.1.12",
    versionFirmware: "1.3.0",
  } as GatewayDevice,
  {
    id: "BCN-001",
    nombre: "Beacon Supervisor Pérez",
    tipo: "beacon",
    estado: "activo",
    fechaAgregado: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    ultimaConexion: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutos atrás
    nivelBateria: 85,
    txPower: -12,
    equipoId: mockEquipos[0]?.id.toString(), // Asignado al primer equipo
    equipo: mockEquipos[0],
  } as BeaconDevice,
  {
    id: "BCN-002",
    nombre: "Beacon Camioneta Hilux",
    tipo: "beacon",
    estado: "activo",
    fechaAgregado: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    ultimaConexion: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    nivelBateria: 60,
    txPower: -10,
    vehiculoId: mockVehiculos[0]?.id.toString(), // Asignado al primer vehículo
    vehiculo: mockVehiculos[0],
  } as BeaconDevice,
  {
    id: "BCN-003",
    nombre: "Beacon Herramientas Eq. Beta",
    tipo: "beacon",
    estado: "mantenimiento",
    fechaAgregado: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    nivelBateria: 15,
    txPower: -20,
    equipoId: mockEquipos[1]?.id.toString(),
    equipo: mockEquipos[1],
  } as BeaconDevice,
  {
    id: "BCN-004",
    nombre: "Beacon Repuesto",
    tipo: "beacon",
    estado: "sin asignar",
    fechaAgregado: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    nivelBateria: 100,
  } as BeaconDevice,
  {
    id: "BCN-005",
    nombre: "Beacon Equipo Alpha / Vehículo Ford Ranger",
    tipo: "beacon",
    estado: "activo",
    fechaAgregado: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    ultimaConexion: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    nivelBateria: 77,
    txPower: -15,
    equipoId: mockEquipos[0]?.id.toString(),
    equipo: mockEquipos[0],
    vehiculoId: mockVehiculos[1]?.id.toString(),
    vehiculo: mockVehiculos[1],
  } as BeaconDevice,
]
