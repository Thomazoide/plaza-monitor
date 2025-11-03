import type { WorkOrder, WorkOrderType } from "@/types/workOrder-types"
import type { ResponsePayload } from "@/types/response-types"
import { SuperForm } from "@/types/super-form-types"

// Helper to get backend base URL from our API route
const getBackendEndpoint = async (): Promise<string> => {
  try {
    const response = await fetch("/api/get-backend-endpoint")
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const { endpoint } = (await response.json()) as { endpoint?: string }
    if (!endpoint) throw new Error("Endpoint no definido")
    return endpoint
  } catch (err) {
    console.error("Error obteniendo endpoint backend:", err)
    return process.env.NEXT_PUBLIC_BACKEND_ENDPOINT || "http://localhost:8888"
  }
}

export async function getSuperForms(): Promise<SuperForm[]> {
  const endpoint = await getBackendEndpoint();
  const resp = await fetch(`${endpoint}/super-form`);
  if(!resp.ok) {
    console.error("error");
    return [];
  }
  const json = (await resp.json()) as ResponsePayload<SuperForm[]>;
  if(json.error) {
    console.log("error: ", json.message);
  }
  const data = json.data || [];
  if(Array.isArray(data)) return data;
  return data!;
}

export async function getWorkOrders(): Promise<WorkOrder[]> {
  try {
    const endpoint = await getBackendEndpoint()
    const resp = await fetch(`${endpoint}/ordenes`, { cache: "no-store" })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const json = (await resp.json()) as ResponsePayload<WorkOrder[]>

    if (json.error) {
      console.error("Backend error al obtener órdenes:", json.message)
      return []
    }

    // data podría venir directo, o anidado: { data: { ordenes: [] } }
    const data = json.data
    if (Array.isArray(data)) return normalizeOrders(data)
    if (data && Array.isArray((data as any).ordenes)) return normalizeOrders((data as any).ordenes)

    // Algunas APIs pueden devolver el array de primer nivel
    if (Array.isArray((json as unknown) as any)) return normalizeOrders((json as any))

    console.warn("Respuesta de órdenes no reconocida", json)
    return []
  } catch (e) {
    console.error("getWorkOrders error:", e)
    return []
  }
}

export interface CreateWorkOrderPayload {
  descripcion: string
  tipo: WorkOrderType
  equipoID: number | null
  zonaID: number | null
  lat: number | null
  lng: number | null
  reference: string | null
}

export async function createWorkOrder(payload: CreateWorkOrderPayload): Promise<WorkOrder | null> {
  try {
    const endpoint = await getBackendEndpoint()
    const body = {
      ...payload,
      zonaId: payload.zonaID,
      lat: payload.lat,
      lng: payload.lng,
      reference: payload.reference,
    }
    const resp = await fetch(`${endpoint}/ordenes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const json = (await resp.json()) as ResponsePayload<WorkOrder>

    if (json.error) {
      console.error("Backend error al crear orden:", json.message)
      return null
    }

    // data puede venir directo o anidado
    if (json.data && !Array.isArray(json.data)) return json.data
    if ((json as any)?.data?.orden) return (json as any).data.orden as WorkOrder

    // Algunas APIs devuelven el objeto creado de primer nivel
    if ((json as any)?.orden) return (json as any).orden as WorkOrder

    console.warn("Respuesta de creación no reconocida", json)
    return null
  } catch (e) {
    console.error("createWorkOrder error:", e)
    return null
  }
}

export interface UpdateWorkOrderPayload extends CreateWorkOrderPayload {
  id: number
}

export async function updateWorkOrder(payload: UpdateWorkOrderPayload): Promise<WorkOrder | null> {
  try {
    const endpoint = await getBackendEndpoint()
    const body = {
      ...payload,
      zonaId: payload.zonaID,
      lat: payload.lat,
      lng: payload.lng,
      reference: payload.reference,
    }
    const resp = await fetch(`${endpoint}/ordenes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const json = (await resp.json()) as ResponsePayload<WorkOrder>

    if (json.error) {
      console.error("Backend error al actualizar orden:", json.message)
      return null
    }

    if (json.data && !Array.isArray(json.data)) return normalizeOrders([json.data])[0]
    if ((json as any)?.data?.orden) return normalizeOrders([(json as any).data.orden])[0]
    if ((json as any)?.orden) return normalizeOrders([(json as any).orden])[0]

    console.warn("Respuesta de actualización no reconocida", json)
    return null
  } catch (e) {
    console.error("updateWorkOrder error:", e)
    return null
  }
}

export async function deleteWorkOrder(id: number): Promise<boolean> {
  try {
    const endpoint = await getBackendEndpoint()
    const resp = await fetch(`${endpoint}/ordenes/${id}`, {
      method: "DELETE",
    })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const json = (await resp.json()) as ResponsePayload<unknown>
    if (json.error) {
      console.error("Backend error al eliminar orden:", json.message)
      return false
    }
    return true
  } catch (e) {
    console.error("deleteWorkOrder error:", e)
    return false
  }
}

function normalizeOrders(arr: WorkOrder[]): WorkOrder[] {
  return arr.map((order) => {
    const anyOrder = order as any
    const zonaID = typeof anyOrder.zonaID === "number" ? anyOrder.zonaID : typeof anyOrder.zonaId === "number" ? anyOrder.zonaId : null
    return {
      ...anyOrder,
      zonaID,
      zona: anyOrder.zona ?? null,
      lat: (() => {
        if (typeof anyOrder.lat === "number") return anyOrder.lat
        if (typeof anyOrder.lat === "string") {
          const parsed = Number(anyOrder.lat)
          return Number.isFinite(parsed) ? parsed : null
        }
        return null
      })(),
      lng: (() => {
        if (typeof anyOrder.lng === "number") return anyOrder.lng
        if (typeof anyOrder.lng === "string") {
          const parsed = Number(anyOrder.lng)
          return Number.isFinite(parsed) ? parsed : null
        }
        return null
      })(),
      reference: (() => {
        if (typeof anyOrder.reference === "string") return anyOrder.reference
        if (anyOrder.reference == null) return null
        const str = String(anyOrder.reference)
        return str.trim() ? str : null
      })(),
      // Aseguramos que las fechas sean objetos Date cuando vengan como string
      creada_en: anyOrder.creada_en ? new Date(anyOrder.creada_en) : new Date(),
      completada_en: anyOrder.completada_en ? new Date(anyOrder.completada_en) : null,
    } as WorkOrder
  })
}
