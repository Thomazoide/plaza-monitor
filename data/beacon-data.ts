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
    const data = await response.json()
    
    // Handle different response formats
    if (Array.isArray(data)) {
      return data
    } else if (data && Array.isArray(data.data)) {
      return data.data
    } else if (data && Array.isArray(data.beacons)) {
      return data.beacons
    } else {
      console.warn('Backend response for beacons is not in expected format:', data)
      return []
    }
  } catch (error) {
    console.error('Error fetching beacons:', error)
    return []
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
    
    const data = await response.json()
    return data
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
    
    return response.ok
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
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error updating beacon:', error)
    return null
  }
}
