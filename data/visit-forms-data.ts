import type { VisitFormType } from "@/types/visitForms-types"

// Función para obtener el endpoint del backend (reutiliza patrón existente)
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
    return process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || 'http://localhost:8888'
  }
}

// Respuesta estándar del backend
interface StandardResponse<T> {
  message: string
  data?: T
  error: boolean
}

export const fetchVisitFormsByZona = async (zonaId: number): Promise<VisitFormType[]> => {
  try {
    const endpoint = await getBackendEndpoint()
    const response = await fetch(`${endpoint}/formularios/zona/${zonaId}`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = (await response.json()) as StandardResponse<VisitFormType[]>

    if (result.error) {
      console.error('Backend error fetching visit forms:', result.message)
      return []
    }

    if (Array.isArray(result.data)) {
      return result.data
    }

    console.warn('Unexpected response format for visit forms:', result)
    return []
  } catch (error) {
    console.error('Error fetching visit forms:', error)
    return []
  }
}

// Formularios no vinculados a ninguna zona registrada
export const fetchVisitFormsUnassigned = async (): Promise<VisitFormType[]> => {
  try {
    const endpoint = await getBackendEndpoint()
    // Endpoint esperado en backend para formularios sin zona
    const response = await fetch(`${endpoint}/formularios/sin-zona`)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const result = (await response.json()) as StandardResponse<VisitFormType[]>

    if (result.error) {
      console.error('Backend error fetching unassigned visit forms:', result.message)
      return []
    }

    if (Array.isArray(result.data)) {
      return result.data
    }

    console.warn('Unexpected response format for unassigned visit forms:', result)
    return []
  } catch (error) {
    console.error('Error fetching unassigned visit forms:', error)
    return []
  }
}