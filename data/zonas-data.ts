import type { GreenArea } from "@/types/map-types"
import type { Zona } from "@/types/escuadras-types"

const getBackendEndpoint = async (): Promise<string> => {
  const response = await fetch("/api/get-backend-endpoint")
  if (!response.ok) throw new Error("No se pudo obtener el endpoint del backend")
  const { endpoint } = (await response.json()) as { endpoint?: string }
  if (!endpoint) throw new Error("backendURL no definido")
  return endpoint
}

export async function fetchGreenAreas(): Promise<GreenArea[]> {
  try {
    const endpoint = await getBackendEndpoint()
    const resp = await fetch(`${endpoint}/plazas`, { cache: "no-store" })
    if (!resp.ok) throw new Error(`Error ${resp.status}`)
    const result = await resp.json()
    console.log('plazas result:', result)

    // Extraer arreglo desde distintas formas de respuesta
    let arr: any[] = []
    if (Array.isArray(result)) {
      arr = result
    } else if (result?.error) {
      console.error('Backend error al obtener plazas:', result?.message)
      arr = []
    } else if (Array.isArray(result?.data)) {
      arr = result.data
    } else if (Array.isArray(result?.plazas)) {
      arr = result.plazas
    } else if (Array.isArray(result?.data?.plazas)) {
      arr = result.data.plazas
    } else {
      console.warn('Respuesta de plazas no reconocida, usando []')
    }

    // Normalizar a GreenArea[] y convertir fechas
    return arr.map((item) => ({
      id: item.id,
      name: item.name,
      coordinates: Array.isArray(item.coordinates) ? item.coordinates : [],
      info: item.info ?? "",
      beaconId: item.beaconId ?? null,
      lastVisited: item.lastVisited ? new Date(item.lastVisited) : null,
      beacon: item.beacon ?? null,
      formularios: item.formularios ?? [],
      workOrders: item.workOrders ?? [],
    }))
  } catch (e) {
    console.error("fetchGreenAreas error:", e)
    return []
  }
}

// Compatibilidad: algunas pantallas usan Zona de escuadras-types
export async function getZonas(): Promise<Zona[]> {
  const areas = await fetchGreenAreas()
  return areas.map((a) => ({
    id: a.id,
    nombre: a.name,
    descripcion: a.info,
    coordenadas: a.coordinates,
    activa: true,
  }))
}