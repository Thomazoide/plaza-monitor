import type { Equipo, Vehiculo, Trabajador, Supervisor } from "@/types/escuadras-types"

// Supervisores
export const supervisores: Supervisor[] = [
  {
    id: 1,
    nombre: "Carlos",
    apellido: "Mendoza",
    rut: "12345678-9",
    telefono: "+56912345678",
    email: "carlos.mendoza@empresa.com",
    fechaIngreso: new Date("2020-01-15"),
    estado: "activo",
  },
  {
    id: 2,
    nombre: "Ana",
    apellido: "Rodriguez",
    rut: "98765432-1",
    telefono: "+56987654321",
    email: "ana.rodriguez@empresa.com",
    fechaIngreso: new Date("2019-03-20"),
    estado: "activo",
  },
  {
    id: 3,
    nombre: "Miguel",
    apellido: "Torres",
    rut: "11223344-5",
    telefono: "+56911223344",
    email: "miguel.torres@empresa.com",
    fechaIngreso: new Date("2021-07-10"),
    estado: "activo",
  },
  {
    id: 4,
    nombre: "Laura",
    apellido: "García Morales",
    rut: "15678234-K",
    telefono: "+56915678234",
    email: "laura.garcia@empresa.com",
    fechaIngreso: new Date("2020-11-05"),
    estado: "activo",
  },
]

// Trabajadores
export const trabajadores: Trabajador[] = [
  {
    id: 1,
    nombre: "Juan",
    apellido: "Pérez",
    rut: "11111111-1",
    telefono: "+56911111111",
    email: "juan.perez@empresa.com",
    fechaIngreso: new Date("2021-01-15"),
    estado: "activo",
    equipoId: 1,
  },
  {
    id: 2,
    nombre: "María",
    apellido: "González",
    rut: "22222222-2",
    telefono: "+56922222222",
    email: "maria.gonzalez@empresa.com",
    fechaIngreso: new Date("2021-02-20"),
    estado: "activo",
    equipoId: 1,
  },
  {
    id: 3,
    nombre: "Pedro",
    apellido: "Silva",
    rut: "33333333-3",
    telefono: "+56933333333",
    email: "pedro.silva@empresa.com",
    fechaIngreso: new Date("2021-03-10"),
    estado: "activo",
    equipoId: 2,
  },
  {
    id: 4,
    nombre: "Carmen",
    apellido: "López",
    rut: "44444444-4",
    telefono: "+56944444444",
    email: "carmen.lopez@empresa.com",
    fechaIngreso: new Date("2021-04-05"),
    estado: "activo",
    equipoId: 2,
  },
  {
    id: 5,
    nombre: "Roberto",
    apellido: "Martínez",
    rut: "55555555-5",
    telefono: "+56955555555",
    email: "roberto.martinez@empresa.com",
    fechaIngreso: new Date("2021-05-12"),
    estado: "activo",
    equipoId: 3,
  },
  {
    id: 6,
    nombre: "Javier",
    apellido: "Rojas Sánchez",
    rut: "16789345-2",
    telefono: "+56916789345",
    email: "javier.rojas@empresa.com",
    fechaIngreso: new Date("2021-08-15"),
    estado: "activo",
    equipoId: 4,
  },
]

// Vehículos
export const vehiculos: Vehiculo[] = [
  {
    id: 1,
    patente: "ABCD-12",
    marca: "Nissan",
    modelo: "Versa",
    año: 2020,
    tipo: "sedan",
    estado: "en_uso",
  },
  {
    id: 2,
    patente: "EFGH-34",
    marca: "Toyota",
    modelo: "Hilux",
    año: 2021,
    tipo: "pickup",
    estado: "en_uso",
  },
  {
    id: 3,
    patente: "IJKL-56",
    marca: "Ford",
    modelo: "Ranger",
    año: 2019,
    tipo: "pickup",
    estado: "en_uso",
  },
  {
    id: 4,
    patente: "MNOP-78",
    marca: "Chevrolet",
    modelo: "D-Max",
    año: 2022,
    tipo: "pickup",
    estado: "disponible",
  },
]

// Equipos (anteriormente escuadras)
export const equipos: Equipo[] = [
  {
    id: 1,
    nombre: "Equipo Alpha",
    supervisor: supervisores[0],
    zona: "Zona Norte",
    vehiculo: vehiculos[1], // Toyota Hilux
    estado: "activo",
    fechaCreacion: new Date("2021-01-01"),
  },
  {
    id: 2,
    nombre: "Equipo Beta",
    supervisor: supervisores[1],
    zona: "Zona Sur",
    vehiculo: vehiculos[2], // Ford Ranger
    estado: "activo",
    fechaCreacion: new Date("2021-02-01"),
  },
  {
    id: 3,
    nombre: "Equipo Gamma",
    supervisor: supervisores[2],
    zona: "Zona Centro",
    vehiculo: undefined, // Sin vehículo asignado
    estado: "activo",
    fechaCreacion: new Date("2021-03-01"),
  },
  {
    id: 4,
    nombre: "Equipo Lambda",
    supervisor: supervisores[3], // Laura García Morales
    zona: "Zona Oeste",
    vehiculo: vehiculos[0], // Nissan Versa (ID 1) - Vehículo con seguimiento real
    estado: "activo",
    fechaCreacion: new Date("2021-04-01"),
  },
]

// Mantener compatibilidad con el nombre anterior
export const escuadras = equipos
