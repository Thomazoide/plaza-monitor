import type { Registro, Plaza } from "@/types/registros-types"
import type { Supervisor } from "@/types/escuadras-types"

const getBackendEndpoint = async (): Promise<string> => {
  try {
    const response = await fetch("/api/get-backend-endpoint")
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const data = await response.json()
    return data.endpoint
  } catch (error) {
    console.error("Error fetching backend endpoint:", error)
    return process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "http://localhost:8888"
  }
}

export const getSupervisoresForRegistros = async (): Promise<Supervisor[]> => {
  try {
    const endpoint = await getBackendEndpoint()
    const res = await fetch(`${endpoint}/supervisores`)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const json = await res.json()
    if (json?.error) return []
    if (Array.isArray(json?.data)) return json.data
    if (Array.isArray(json?.supervisores)) return json.supervisores
    if (Array.isArray(json?.data?.supervisores)) return json.data.supervisores
    return []
  } catch (e) {
    console.error("Error fetching supervisores:", e)
    return []
  }
}

export const getRegistrosBySupervisor = async (supervisorId: number): Promise<Registro[]> => {
  if (!supervisorId) return []
  try {
    const endpoint = await getBackendEndpoint()
    const res = await fetch(`${endpoint}/registros/${supervisorId}`)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const json = await res.json()
    if (json?.error) return []
    if (Array.isArray(json?.data)) return json.data as Registro[]
    return []
  } catch (e) {
    console.error("Error fetching registros:", e)
    return []
  }
}

export const getPlazaById = async (id: number): Promise<Plaza | null> => {
  try {
    const endpoint = await getBackendEndpoint()
    const res = await fetch(`${endpoint}/plazas/${id}`)
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
    const json = await res.json()
    if (json?.error) return null
    if (json?.data) return json.data as Plaza
    return null
  } catch (e) {
    console.error("Error fetching plaza:", e)
    return null
  }
}
