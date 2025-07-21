import type { Equipo, Vehiculo, Trabajador, Supervisor } from "@/types/escuadras-types"

// Función para obtener el endpoint del backend
const getBackendEndpoint = async (): Promise<string> => {
  try {
    const response = await fetch("/api/get-backend-endpoint")
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.endpoint
  } catch (error) {
    console.error('Error fetching backend endpoint:', error)
    // Fallback al endpoint por defecto
    return process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || 'http://localhost:8888'
  }
}

// Función para obtener supervisores del backend
export const fetchSupervisores = async (): Promise<Supervisor[]> => {
  try {
    const endpoint = await getBackendEndpoint()
    const response = await fetch(`${endpoint}/supervisores`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json()
    
    // Handle standard response format: {message: string, data?: T, error: boolean}
    if (result.error) {
      console.error('Backend error for supervisores:', result.message)
      return []
    }
    
    if (result.data) {
      // Si data es un array, devolverlo directamente
      if (Array.isArray(result.data)) {
        return result.data
      }
      // Si data es un objeto con una propiedad que contiene el array
      if (result.data.supervisores && Array.isArray(result.data.supervisores)) {
        return result.data.supervisores
      }
    }
    
    console.warn('Backend response for supervisores does not contain expected data:', result)
    return []
  } catch (error) {
    console.error('Error fetching supervisores:', error)
    return []
  }
}

// Función para obtener vehículos del backend
export const fetchVehiculos = async (): Promise<Vehiculo[]> => {
  try {
    const endpoint = await getBackendEndpoint()
    const response = await fetch(`${endpoint}/vehiculos`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json()
    
    // Handle standard response format: {message: string, data?: T, error: boolean}
    if (result.error) {
      console.error('Backend error for vehiculos:', result.message)
      return []
    }
    
    if (result.data) {
      // Si data es un array, devolverlo directamente
      if (Array.isArray(result.data)) {
        return result.data
      }
      // Si data es un objeto con una propiedad que contiene el array
      if (result.data.vehiculos && Array.isArray(result.data.vehiculos)) {
        return result.data.vehiculos
      }
    }
    
    console.warn('Backend response for vehiculos does not contain expected data:', result)
    return []
  } catch (error) {
    console.error('Error fetching vehiculos:', error)
    return []
  }
}

// Función para obtener equipos del backend
export const fetchEquipos = async (): Promise<Equipo[]> => {
  try {
    const endpoint = await getBackendEndpoint()
    const response = await fetch(`${endpoint}/equipos`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json()
    
    // Handle standard response format: {message: string, data?: T, error: boolean}
    if (result.error) {
      console.error('Backend error for equipos:', result.message)
      return []
    }
    
    if (result.data) {
      // Si data es un array, devolverlo directamente
      if (Array.isArray(result.data)) {
        return result.data
      }
      // Si data es un objeto con una propiedad que contiene el array
      if (result.data.equipos && Array.isArray(result.data.equipos)) {
        return result.data.equipos
      }
    }
    
    console.warn('Backend response for equipos does not contain expected data:', result)
    return []
  } catch (error) {
    console.error('Error fetching equipos:', error)
    return []
  }
}

// Trabajadores inventados (mock data)
export const trabajadores: Trabajador[] = [
  {
    id: 1,
    nombre: "Juan",
    apellido: "Pérez",
    rut: "11111111-1",
    telefono: "+56911111111",
    email: "juan.perez@empresa.com",
    fechaIngreso: new Date("2021-01-15"),
    activo: true,
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
    activo: true,
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
    activo: true,
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
    activo: true,
    equipoId: 2,
  },
]

// Funciones para obtener datos combinados
export const getSupervisores = async (): Promise<Supervisor[]> => {
  return await fetchSupervisores()
}

export const getVehiculos = async (): Promise<Vehiculo[]> => {
  return await fetchVehiculos()
}

export const getEquipos = async (): Promise<Equipo[]> => {
  return await fetchEquipos()
}

export const getTrabajadores = (): Trabajador[] => {
  return trabajadores
}

// Función para obtener un equipo específico por ID
export const getEquipoById = async (id: number): Promise<Equipo | null> => {
  const equipos = await getEquipos()
  return equipos.find(equipo => equipo.id === id) || null
}

// Función para obtener tracking data de un vehículo específico
export const getVehicleTrackingData = async (vehiculoId: number): Promise<any> => {
  const vehiculos = await getVehiculos()
  const vehiculo = vehiculos.find(v => v.id === vehiculoId)
  
  if (!vehiculo) {
    return null
  }

  // Convertir los datos del vehículo al formato esperado por el componente de tracking
  return {
    currentPosition: {
      vehiculoId: vehiculo.id,
      lat: vehiculo.latitud ?? -33.5059767,
      lng: vehiculo.longitud ?? -70.7538867,
      speed: vehiculo.velocidad ?? 0,
      heading: vehiculo.heading ?? 0,
      timestamp: vehiculo.timestamp ?? new Date(),
      status: vehiculo.velocidad > 5 ? "moving" : "stopped"
    },
    route: [], // Historial de posiciones (por ahora vacío)
    isOnline: true,
    lastUpdate: vehiculo.timestamp ?? new Date(),
    batteryLevel: 85 // Mock data
  }
}
