import type { Beacon, CreateBeaconRequest } from "@/types/beacon-types"

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
    return process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || 'https://jtfb87sn-8888.brs.devtunnels.ms'
  }
}

// Función para obtener beacons del backend
export const getBeacons = async (): Promise<Beacon[]> => {
  try {
    const endpoint = await getBackendEndpoint()
    const response = await fetch(`${endpoint}/beacons`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json()
    
    // Handle standard response format: {message: string, data?: T, error: boolean}
    if (result.error) {
      console.error('Backend error for beacons:', result.message)
      return []
    }
    
    if (result.data) {
      // Si data es un array, devolverlo directamente
      if (Array.isArray(result.data)) {
        return result.data
      }
      // Si data es un objeto con una propiedad que contiene el array
      if (result.data.beacons && Array.isArray(result.data.beacons)) {
        return result.data.beacons
      }
      // Si data es un solo objeto beacon, convertirlo a array
      if (result.data.id || result.data.deviceId) {
        return [result.data]
      }
    }
    
    console.warn('Backend response for beacons does not contain expected data:', result)
    return []
  } catch (error) {
    console.error('Error fetching beacons:', error)
    return []
  }
}

// Función para obtener un beacon específico por ID
export const getBeaconById = async (beaconId: number): Promise<Beacon | null> => {
  try {
    const endpoint = await getBackendEndpoint()
    const response = await fetch(`${endpoint}/beacons/${beaconId}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = await response.json()
    
    // Handle standard response format: {message: string, data?: T, error: boolean}
    if (result.error) {
      console.error('Backend error for beacon:', result.message)
      return null
    }
    
    if (result.data) {
      return result.data
    }
    
    console.warn('Beacon not found or invalid response format:', result)
    return null
  } catch (error) {
    console.error('Error fetching beacon:', error)
    return null
  }
}

// Función para crear un nuevo beacon
export const createBeacon = async (beaconData: CreateBeaconRequest): Promise<Beacon | null> => {
  try {
    const endpoint = await getBackendEndpoint()
    const response = await fetch(`${endpoint}/beacons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(beaconData),
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    
    // Handle standard response format: {message: string, data?: T, error: boolean}
    if (result.error) {
      console.error('Backend error creating beacon:', result.message)
      return null
    }
    
    if (result.data) {
      return result.data
    }
    
    console.warn('Unexpected response format for beacon creation:', result)
    return null
  } catch (error) {
    console.error('Error creating beacon:', error)
    return null
  }
}

// Función para eliminar un beacon
export const deleteBeacon = async (beaconId: number): Promise<boolean> => {
  try {
    const endpoint = await getBackendEndpoint()
    const response = await fetch(`${endpoint}/beacons/${beaconId}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      return false
    }
    
    const result = await response.json()
    
    // Handle standard response format: {message: string, data?: T, error: boolean}
    return !result.error
  } catch (error) {
    console.error('Error deleting beacon:', error)
    return false
  }
}

// Función para actualizar un beacon
export const updateBeacon = async (beaconId: number, beaconData: Partial<CreateBeaconRequest>): Promise<Beacon | null> => {
  try {
    const endpoint = await getBackendEndpoint()
    const response = await fetch(`${endpoint}/beacons/${beaconId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(beaconData),
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    
    // Handle standard response format: {message: string, data?: T, error: boolean}
    if (result.error) {
      console.error('Backend error updating beacon:', result.message)
      return null
    }
    
    if (result.data) {
      return result.data
    }
    
    console.warn('Unexpected response format for beacon update:', result)
    return null
  } catch (error) {
    console.error('Error updating beacon:', error)
    return null
  }
}
