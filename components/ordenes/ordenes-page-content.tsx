"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Plus, ClipboardList, CheckCircle2, Clock, Trash2, MapPin, RefreshCcw, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { WorkOrder, WorkOrderType } from "@/types/workOrder-types"
import { getWorkOrders, createWorkOrder, type CreateWorkOrderPayload, updateWorkOrder, deleteWorkOrder, getSuperForms } from "@/data/work-orders-data"
import { getEquipos } from "@/data/escuadras-data"
import { getZonas } from "@/data/zonas-data"
import type { Equipo, Zona } from "@/types/escuadras-types"
import type { SuperForm } from "@/types/super-form-types"

const WORK_ORDER_TYPES: WorkOrderType[] = [
  "Areas verdes",
  "Emergencias",
  "Obras publicas",
]

type SuperFormReferenceState = {
  value: string | null
  loading: boolean
  error: string | null
}

export function OrdenesDeTrabajoPageContent() {
  const [orders, setOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selected, setSelected] = useState<WorkOrder | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [refreshingSuperForms, setRefreshingSuperForms] = useState(false)

  // Form state
  const [descripcion, setDescripcion] = useState("")
  const [tipo, setTipo] = useState<WorkOrderType>("Areas verdes")
  const [equipoId, setEquipoId] = useState<number | "">("")
  const [selectedZonaId, setSelectedZonaId] = useState<number | "">("")
  const [lat, setLat] = useState<string>("")
  const [lng, setLng] = useState<string>("")
  const [reference, setReference] = useState<string>("")
  const [isFetchingReference, setIsFetchingReference] = useState(false)
  const [referenceError, setReferenceError] = useState<string | null>(null)
  const [superForms, setSuperForms] = useState<SuperForm[]>([])
  const [creatingFromSuperForm, setCreatingFromSuperForm] = useState<SuperForm | null>(null)
  const [superFormReferences, setSuperFormReferences] = useState<Record<number, SuperFormReferenceState>>({})
  const superFormReferencesRef = useRef<Record<number, SuperFormReferenceState>>({})
  const updateSuperFormReferences = useCallback(
    (updater: (prev: Record<number, SuperFormReferenceState>) => Record<number, SuperFormReferenceState>) => {
      setSuperFormReferences((prev) => {
        const next = updater(prev)
        superFormReferencesRef.current = next
        return next
      })
    },
    [],
  )

  // Geocoding se realiza vía API interna para no exponer la API key

  // Aux data
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [zonas, setZonas] = useState<Zona[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const [ord, eqs, zs, sf] = await Promise.all([
          getWorkOrders(),
          getEquipos(),
          getZonas(),
          getSuperForms(),
        ])
        if (!mounted) return
        setOrders(ord)
        setEquipos(eqs)
        setZonas(zs)
        setSuperForms(sf)
      } catch (e) {
        console.error("Error cargando órdenes/equipos/zonas:", e)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  const equiposMap = useMemo(() => new Map(equipos.map((e) => [e.id, e])), [equipos])
  const zonasMap = useMemo(() => new Map(zonas.map((z) => [z.id, z])), [zonas])
  const availableSuperForms = useMemo(() => superForms.filter((form) => form.workOrderID == null), [superForms])

  const refreshSuperForms = async () => {
    if (refreshingSuperForms) return
    setRefreshingSuperForms(true)
    try {
      const latest = await getSuperForms()
      setSuperForms(latest)
    } catch (error) {
      console.error("Error recargando super formularios:", error)
    } finally {
      setRefreshingSuperForms(false)
    }
  }

  const parseCoordinate = (value: string): number | null => {
    if (value === "") return null
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  const formatCoordinate = (value: number | string | null | undefined): string => {
    if (value === null || value === undefined || value === "") return "-"
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed.toFixed(6) : "-"
  }

  const requestReferenceFromGoogle = useCallback(
    async (latNum: number, lngNum: number): Promise<string> => {
      const params = new URLSearchParams({ lat: String(latNum), lng: String(lngNum), language: "es" })
      const response = await fetch(`/api/geocode?${params.toString()}`)
      if (!response.ok) throw new Error(`Geocode HTTP ${response.status}`)
      const data = (await response.json()) as {
        status?: string
        results?: Array<{
          formatted_address?: string
          address_components?: Array<{
            long_name?: string
            short_name?: string
            types?: string[]
          }>
          types?: string[]
        }>
        error_message?: string
      }

      if (data.status !== "OK" || !Array.isArray(data.results) || data.results.length === 0) {
        throw new Error(data.error_message || "Google Maps no devolvió resultados para estas coordenadas.")
      }

      const scoreResult = (result: { types?: string[] }) => {
        const types = result.types ?? []
        if (types.includes("street_address")) return 3
        if (types.includes("route")) return 2
        if (types.includes("intersection")) return 1
        return 0
      }

      const sorted = [...data.results].sort((a, b) => scoreResult(b) - scoreResult(a))
      const best = sorted[0]
      if (!best) return ""

      const components = Array.isArray(best.address_components) ? best.address_components : []
      const routeComp = components.find((component) => component.types?.includes("route"))
      const streetNumber = components.find((component) => component.types?.includes("street_number"))
      const neighborhood = components.find((component) =>
        component.types?.includes("sublocality_level_1") || component.types?.includes("locality"),
      )

      const parts: string[] = []
      if (routeComp?.long_name) {
        const base = streetNumber?.long_name ? `${routeComp.long_name} ${streetNumber.long_name}` : routeComp.long_name
        parts.push(base)
      }
      if (neighborhood?.long_name) {
        parts.push(neighborhood.long_name)
      }

      if (parts.length === 0 && typeof best.formatted_address === "string") {
        parts.push(best.formatted_address)
      }

      return parts.join(", ").trim()
    },
    [],
  )

  const fetchReferenceForCoordinates = useCallback(
    async (latValue: string, lngValue: string, superFormId?: number): Promise<string | null> => {
      if (isFetchingReference) return reference || null

      const latNum = parseCoordinate(latValue)
      const lngNum = parseCoordinate(lngValue)

      if (latNum == null || lngNum == null) {
        setReferenceError("Necesitas coordenadas válidas para obtener una referencia de ubicación.")
        if (superFormId != null) {
          updateSuperFormReferences((prev) => ({
            ...prev,
            [superFormId]: {
              value: prev[superFormId]?.value ?? null,
              loading: false,
              error: "Coordenadas no válidas para obtener referencia.",
            },
          }))
        }
        return null
      }

      setIsFetchingReference(true)
      setReferenceError(null)
      if (superFormId != null) {
        updateSuperFormReferences((prev) => ({
          ...prev,
          [superFormId]: {
            value: prev[superFormId]?.value ?? null,
            loading: true,
            error: null,
          },
        }))
      }

      try {
        const result = await requestReferenceFromGoogle(latNum, lngNum)
        const cleanReference = result.trim()
        setReference(cleanReference)
        if (!cleanReference) {
          const message = "No se encontró una referencia legible para estas coordenadas."
          setReferenceError(message)
          if (superFormId != null) {
            updateSuperFormReferences((prev) => ({
              ...prev,
              [superFormId]: { value: null, loading: false, error: message },
            }))
          }
        } else if (superFormId != null) {
          updateSuperFormReferences((prev) => ({
            ...prev,
            [superFormId]: { value: cleanReference, loading: false, error: null },
          }))
        }
        return cleanReference || null
      } catch (error) {
        console.error("Error obteniendo referencia de Google Maps:", error)
        const message = error instanceof Error ? error.message : "No se pudo obtener la referencia."
        setReferenceError(message)
        if (superFormId != null) {
          updateSuperFormReferences((prev) => ({
            ...prev,
            [superFormId]: { value: null, loading: false, error: message },
          }))
        }
        return null
      } finally {
        setIsFetchingReference(false)
      }
    },
    [isFetchingReference, reference, requestReferenceFromGoogle, updateSuperFormReferences],
  )

  const ensureReferenceForSuperForm = useCallback(
    async (form: SuperForm): Promise<string | null> => {
      if (form.lat == null || form.lng == null) return null

      const existing = superFormReferencesRef.current[form.id]
      if (existing?.value && !existing.loading) return existing.value
      if (existing?.loading) return existing.value ?? null

      updateSuperFormReferences((prev) => ({
        ...prev,
        [form.id]: {
          value: existing?.value ?? null,
          loading: true,
          error: null,
        },
      }))

      try {
        const result = await requestReferenceFromGoogle(form.lat, form.lng)
        const cleanReference = result.trim()
        updateSuperFormReferences((prev) => ({
          ...prev,
          [form.id]: {
            value: cleanReference || null,
            loading: false,
            error: cleanReference ? null : "No se encontró una referencia legible para estas coordenadas.",
          },
        }))
        return cleanReference || null
      } catch (error) {
        console.error("Error obteniendo referencia para SuperForm:", error)
        const message = error instanceof Error ? error.message : "No se pudo obtener la referencia."
        updateSuperFormReferences((prev) => ({
          ...prev,
          [form.id]: { value: null, loading: false, error: message },
        }))
        return null
      }
    },
    [requestReferenceFromGoogle, updateSuperFormReferences],
  )

  useEffect(() => {
    updateSuperFormReferences((prev) => {
      if (superForms.length === 0) return {}
      const next: Record<number, SuperFormReferenceState> = {}
      for (const form of superForms) {
        const current = prev[form.id]
        next[form.id] = current ?? { value: null, loading: false, error: null }
      }
      return next
    })

    superForms.forEach((form) => {
      if (form.lat != null && form.lng != null) {
        void ensureReferenceForSuperForm(form)
      }
    })
  }, [ensureReferenceForSuperForm, superForms, updateSuperFormReferences])

  const resetForm = () => {
    setDescripcion("")
    setTipo("Areas verdes")
    setEquipoId("")
    setSelectedZonaId("")
    setLat("")
    setLng("")
    setReference("")
    setReferenceError(null)
    setIsFetchingReference(false)
    setCreatingFromSuperForm(null)
  }

  const onCreate = async () => {
    const cleanDescription = descripcion.trim()
    if (!cleanDescription) return

    const parsedLat = parseCoordinate(lat)
    const parsedLng = parseCoordinate(lng)

    let referenceValue = reference.trim()

    if (!referenceValue && parsedLat != null && parsedLng != null) {
      try {
        const autoReference = await requestReferenceFromGoogle(parsedLat, parsedLng)
        if (autoReference) {
          referenceValue = autoReference
          setReference(autoReference)
          setReferenceError(null)
          if (creatingFromSuperForm) {
            const cleanAuto = autoReference.trim()
            updateSuperFormReferences((prev) => ({
              ...prev,
              [creatingFromSuperForm.id]: {
                value: cleanAuto || null,
                loading: false,
                error: cleanAuto ? null : "No se encontró una referencia legible para estas coordenadas.",
              },
            }))
          }
        }
      } catch (error) {
        console.warn("No se pudo obtener referencia automática al crear la orden:", error)
        if (creatingFromSuperForm) {
          const message = error instanceof Error ? error.message : "No se pudo obtener la referencia."
          updateSuperFormReferences((prev) => ({
            ...prev,
            [creatingFromSuperForm.id]: { value: null, loading: false, error: message },
          }))
        }
      }
    }

    const payload: CreateWorkOrderPayload = {
      descripcion: cleanDescription,
      tipo,
      equipoID: equipoId === "" ? null : Number(equipoId),
      zonaID: selectedZonaId === "" ? null : Number(selectedZonaId),
      lat: parsedLat,
      lng: parsedLng,
      reference: referenceValue ? referenceValue : null,
      superFormID: creatingFromSuperForm ? creatingFromSuperForm.id : null,
    }

    if (creatingFromSuperForm) {
      const value = referenceValue ? referenceValue : null
      updateSuperFormReferences((prev) => ({
        ...prev,
        [creatingFromSuperForm.id]: {
          value,
          loading: false,
          error: value ? null : prev[creatingFromSuperForm.id]?.error ?? null,
        },
      }))
    }

    const created = await createWorkOrder(payload)
    if (created) {
      setOrders((prev) => [created, ...prev])
      if (creatingFromSuperForm) {
        setSuperForms((prev) => prev.filter((form) => form.id !== creatingFromSuperForm.id))
      }
      setOpen(false)
      resetForm()
    }
  }

  const openDetails = (o: WorkOrder) => {
    setSelected(o)
    // precargar form de edición con los datos de la orden
    setDescripcion(o.descripcion)
    setTipo(o.tipo)
    setEquipoId(o.equipoID ?? "")
    const anyOrder: any = o as any
    const zonaIdFromOrder =
      typeof anyOrder.zonaID === "number"
        ? anyOrder.zonaID
        : typeof anyOrder.zonaId === "number"
          ? anyOrder.zonaId
          : ""
    setSelectedZonaId(zonaIdFromOrder)
    setLat(typeof o.lat === "number" ? o.lat.toString() : "")
    setLng(typeof o.lng === "number" ? o.lng.toString() : "")
    setReference(o.reference ?? "")
    setReferenceError(null)
    setIsFetchingReference(false)
    setDetailsOpen(true)
  }

  const onUpdate = async () => {
    if (!selected) return
    const cleanDescription = descripcion.trim()
    if (!cleanDescription) return

    const parsedLat = parseCoordinate(lat)
    const parsedLng = parseCoordinate(lng)

    let referenceValue = reference.trim()

    if (!referenceValue && parsedLat != null && parsedLng != null) {
      try {
        const autoReference = await requestReferenceFromGoogle(parsedLat, parsedLng)
        if (autoReference) {
          referenceValue = autoReference
          setReference(autoReference)
          setReferenceError(null)
        }
      } catch (error) {
        console.warn("No se pudo obtener referencia automática al actualizar la orden:", error)
      }
    }

    const payload = {
      id: selected.id,
      descripcion: cleanDescription,
      tipo,
      equipoID: equipoId === "" ? null : Number(equipoId),
      zonaID: selectedZonaId === "" ? null : Number(selectedZonaId),
      lat: parsedLat,
      lng: parsedLng,
      reference: referenceValue ? referenceValue : null,
      superFormID: (() => {
        const anySel: any = selected as any
        if (typeof anySel.superFormID === "number") return anySel.superFormID
        if (typeof anySel.superFormId === "number") return anySel.superFormId
        return null
      })(),
    }
    const updated = await updateWorkOrder(payload)
    if (updated) {
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
      setSelected(updated)
      // mantener abierto el detalle
    }
  }

  const onDelete = async () => {
    if (!selected || isDeleting) return
    const confirmed = window.confirm(`¿Eliminar la orden #${selected.id}? Esta acción no se puede deshacer.`)
    if (!confirmed) return
    setIsDeleting(true)
    const success = await deleteWorkOrder(selected.id)
    if (success) {
      setOrders((prev) => prev.filter((o) => o.id !== selected.id))
      setDetailsOpen(false)
      setSelected(null)
    }
    setIsDeleting(false)
  }

  useEffect(() => {
    if (!detailsOpen) {
      setSelected(null)
      setIsDeleting(false)
      setSelectedZonaId("")
      setLat("")
      setLng("")
      setReference("")
      setReferenceError(null)
      setIsFetchingReference(false)
    }
  }, [detailsOpen])

  const handleCreateFromSuperForm = (form: SuperForm) => {
    setDescripcion(form.description?.trim() || `Orden generada desde formulario #${form.id}`)
    setTipo("Areas verdes")
    setEquipoId("")
    setSelectedZonaId("")
    const latValue = form.lat != null ? form.lat.toString() : ""
    const lngValue = form.lng != null ? form.lng.toString() : ""
    setLat(latValue)
    setLng(lngValue)
    const cachedReference = superFormReferencesRef.current[form.id]?.value ?? ""
    setReference(cachedReference || "")
    setReferenceError(null)
    setIsFetchingReference(false)
    setCreatingFromSuperForm(form)
    setOpen(true)
    if (!cachedReference && latValue && lngValue) {
      void fetchReferenceForCoordinates(latValue, lngValue, form.id)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Órdenes de Trabajo</h1>
          <p className="text-gray-600 mt-1">Revisa y crea órdenes para equipos y zonas específicas.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" /> Nueva Orden
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Formularios prioritarios
            </CardTitle>
            <CardDescription>Genera una orden de trabajo basada en un Super Form.</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="inline-flex items-center gap-2"
            onClick={refreshSuperForms}
            disabled={refreshingSuperForms}
          >
            {refreshingSuperForms ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            Actualizar
          </Button>
        </CardHeader>
        <CardContent>
          {availableSuperForms.length === 0 ? (
            <p className="text-sm text-gray-500">No hay super formularios disponibles.</p>
          ) : (
            <div className="space-y-3">
              {availableSuperForms.map((form) => {
                const referenceInfo = superFormReferences[form.id]
                const isLoadingReference = referenceInfo?.loading ?? (form.lat != null && form.lng != null && referenceInfo == null)
                return (
                  <div
                    key={form.id}
                    className="border rounded-md p-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      {form.pictureUrl ? (
                        <div className="flex-shrink-0">
                          <img
                            src={form.pictureUrl}
                            alt={`Foto formulario ${form.id}`}
                            className="h-16 w-24 rounded-md object-cover border"
                            loading="lazy"
                          />
                        </div>
                      ) : null}
                      <div>
                        <p className="font-medium">Formulario #{form.id}</p>
                        {form.description && <p className="text-sm text-gray-600">{form.description}</p>}
                        <p className="text-xs text-gray-500">Lat: {formatCoordinate(form.lat)} • Lng: {formatCoordinate(form.lng)}</p>
                        {form.lat != null && form.lng != null ? (
                          <p className="text-xs text-gray-500">
                            {isLoadingReference
                              ? "Buscando referencia cercana…"
                              : referenceInfo?.value
                                ? `Referencia: ${referenceInfo.value}`
                                : referenceInfo?.error
                                  ? `Referencia: ${referenceInfo.error}`
                                  : "Referencia no disponible."}
                          </p>
                        ) : (
                          <p className="text-xs text-gray-500">Sin coordenadas para referencia.</p>
                        )}
                      </div>
                    </div>
                    <Button size="sm" onClick={() => handleCreateFromSuperForm(form)}>
                      Crear orden desde este formulario
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList size={18} /> Listado
          </CardTitle>
          <CardDescription>Órdenes existentes en el sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-gray-500">Cargando órdenes…</p>
          ) : orders.length === 0 ? (
            <div className="text-sm text-gray-600">No hay órdenes de trabajo aún.</div>
          ) : (
            <ul className="space-y-3">
              {orders.map((o) => {
                const equipo = o.equipo || (o.equipoID ? equiposMap.get(o.equipoID) || null : null)
                const zonaName = ((): string | null => {
                  const anyOrder: any = o as any
                  const zonaIdValue =
                    typeof anyOrder.zonaID === "number"
                      ? anyOrder.zonaID
                      : typeof anyOrder.zonaId === "number"
                        ? anyOrder.zonaId
                        : null
                  if (typeof zonaIdValue === "number") {
                    return zonasMap.get(zonaIdValue)?.nombre ?? null
                  }
                  if (anyOrder.zona && typeof anyOrder.zona?.nombre === "string") return anyOrder.zona.nombre
                  return null
                })()
                return (
                  <li key={o.id} className="border rounded-lg p-4 hover:bg-gray-50 transition" onClick={() => openDetails(o)} role="button">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            {o.completada ? (
                              <CheckCircle2 className="h-4 w-4 text-[#015293]" />
                            ) : (
                              <Clock className="h-4 w-4 text-[#f2a700]" />
                            )}
                            <span>{o.completada ? "Completada" : "Pendiente"}</span>
                          </span>
                          <span>•</span>
                          <span>{o.tipo}</span>
                          <span>•</span>
                          <span>#{o.id}</span>
                        </div>
                        <p className="mt-1 font-medium">{o.descripcion}</p>
                        <div className="mt-1 text-sm text-gray-600">
                          <span>Creada: {new Date(o.creada_en).toLocaleString("es-CL")}</span>
                          {equipo ? (
                            <span className="ml-3">Equipo: {equipo.nombre}</span>
                          ) : (
                            <span className="ml-3 text-gray-500">Sin equipo asignado</span>
                          )}
                          {zonaName ? (
                            <span className="ml-3">Zona: {zonaName}</span>
                          ) : o.lat != null && o.lng != null ? (
                            <span className="ml-3">Coordenadas: {formatCoordinate(o.lat)} / {formatCoordinate(o.lng)}</span>
                          ) : null}
                        </div>
                        {o.reference ? (
                          <p className="mt-1 text-xs text-gray-500">Referencia: {o.reference}</p>
                        ) : null}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Detalle de Orden */}
      <Dialog open={detailsOpen} onOpenChange={(v) => setDetailsOpen(v)}>
        <DialogContent className="sm:max-w-[720px] max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>Detalle de Orden #{selected?.id}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="mt-4 flex-1 overflow-y-auto pr-1">
              <div className="grid gap-4 pb-2 pr-1">
              <div className="text-sm text-gray-600">
                <div>Estado: {selected.completada ? "Completada" : "Pendiente"}</div>
                <div>Tipo: {selected.tipo}</div>
                <div>Creada: {new Date(selected.creada_en).toLocaleString("es-CL")}</div>
                {selected.completada && selected.completada_en && (
                  <div>Completada: {new Date(selected.completada_en).toLocaleString("es-CL")}</div>
                )}
                {(selected.lat != null || selected.lng != null) && (
                  <div>Coordenadas: {formatCoordinate(selected.lat)} / {formatCoordinate(selected.lng)}</div>
                )}
                {selected.reference ? <div>Referencia: {selected.reference}</div> : null}
              </div>

              {/* Equipo asignado */}
              <div className="border rounded-md p-3">
                <h3 className="font-semibold mb-2">Equipo asignado</h3>
                {(() => {
                  const equipo = selected.equipo || (selected.equipoID ? equiposMap.get(selected.equipoID) || null : null)
                  if (!equipo) return <div className="text-sm text-gray-500">Sin equipo asignado</div>
                  return (
                    <div className="text-sm">
                      <div className="font-medium">{equipo.nombre}</div>
                      {equipo.supervisor && <div>Supervisor: {equipo.supervisor.fullName}</div>}
                      {equipo.vehiculo && <div>Vehículo: {equipo.vehiculo.patente}</div>}
                    </div>
                  )
                })()}
              </div>

              {/* Si no está completada -> edición */}
              {!selected.completada ? (
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-descripcion">Descripción</Label>
                    <Textarea id="edit-descripcion" rows={3} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-tipo">Tipo</Label>
                    <select
                      id="edit-tipo"
                      className="border rounded-md h-9 px-3 text-sm bg-white"
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value as any)}
                    >
                      {WORK_ORDER_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-equipo">Equipo</Label>
                    <select
                      id="edit-equipo"
                      className="border rounded-md h-9 px-3 text-sm bg-white"
                      value={equipoId}
                      onChange={(e) => setEquipoId(e.target.value ? Number(e.target.value) : "")}
                    >
                      <option value="">Sin equipo</option>
                      {equipos.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-zona">Zona</Label>
                    <select
                      id="edit-zona"
                      className="border rounded-md h-9 px-3 text-sm bg-white"
                      value={selectedZonaId}
                      onChange={(e) => setSelectedZonaId(e.target.value ? Number(e.target.value) : "")}
                    >
                      <option value="">Sin zona</option>
                      {zonas.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-lat">Latitud (opcional)</Label>
                      <input
                        id="edit-lat"
                        type="number"
                        step="any"
                        className="border rounded-md h-9 px-3 text-sm bg-white"
                        value={lat}
                        onChange={(e) => setLat(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-lng">Longitud (opcional)</Label>
                      <input
                        id="edit-lng"
                        type="number"
                        step="any"
                        className="border rounded-md h-9 px-3 text-sm bg-white"
                        value={lng}
                        onChange={(e) => setLng(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-reference">Referencia de ubicación (opcional)</Label>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <input
                        id="edit-reference"
                        type="text"
                        className="border rounded-md h-9 px-3 text-sm bg-white flex-1"
                        value={reference}
                        onChange={(e) => {
                          setReference(e.target.value)
                          setReferenceError(null)
                        }}
                        placeholder="Ej. Avenida Siempre Viva 742"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="inline-flex items-center gap-2"
                        onClick={() => void fetchReferenceForCoordinates(lat, lng)}
                        disabled={
                          isFetchingReference || lat.trim() === "" || lng.trim() === ""
                        }
                      >
                        {isFetchingReference ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                        Obtener referencia
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Guardaremos este texto en el campo <code>reference</code> de la orden para identificar la dirección.
                    </p>
                    {referenceError ? <p className="text-xs text-red-500">{referenceError}</p> : null}
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={onUpdate} disabled={!descripcion.trim()}>Guardar cambios</Button>
                  </div>
                </div>
              ) : (
                // Si está completada -> mostrar formulario de visita
                <div className="grid gap-2">
                  <h3 className="font-semibold">Formulario de Visita</h3>
                  {selected.visitForm ? (
                    <div className="text-sm grid gap-1">
                      <div>Fecha: {new Date(selected.visitForm.fecha).toLocaleString("es-CL")}</div>
                      <div>Zona ID: {selected.visitForm.zona_id}</div>
                      <div>Supervisor: {selected.visitForm.supervisor?.fullName ?? selected.visitForm.supervisor_id}</div>
                      <div>Comentarios: {selected.visitForm.comentarios || "(sin comentarios)"}</div>
                      <div>Requiere corte césped: {selected.visitForm.requiere_corte_cesped ? "Sí" : "No"}</div>
                      <div>Gente acampando: {selected.visitForm.hay_gente_acampando ? "Sí" : "No"}</div>
                      <div>Mobiliario dañado: {selected.visitForm.mobiliaro_danado ? "Sí" : "No"}</div>
                      <div>Nivel de basura: {selected.visitForm.nivel_de_basura}</div>
                      {selected.visitForm.foto && (
                        <div className="mt-2">
                          <img src={selected.visitForm.foto} alt="Foto visita" className="max-h-56 rounded" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No hay formulario de visita asociado.</div>
                  )}
                </div>
              )}
              <div className="flex justify-end pt-2">
                <Button variant="destructive" onClick={onDelete} disabled={isDeleting}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDeleting ? "Eliminando..." : "Eliminar orden"}
                </Button>
              </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={(v) => (setOpen(v), v || resetForm())}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Nueva Orden de Trabajo</DialogTitle>
          </DialogHeader>
          {creatingFromSuperForm && (
            <div className="mb-4 rounded-md border border-[#015293]/30 bg-[#f2a700]/10 p-3 text-sm text-[#015293]">
              Creando orden a partir del Super Form #{creatingFromSuperForm.id}. Puedes ajustar la descripción, asignar equipo u otros campos antes de guardar.
            </div>
          )}
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea id="descripcion" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tipo">Tipo</Label>
              <select
                id="tipo"
                className="border rounded-md h-9 px-3 text-sm bg-white"
                value={tipo}
                onChange={(e) => setTipo(e.target.value as WorkOrderType)}
              >
                {WORK_ORDER_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="equipo">Asignar a Equipo (opcional)</Label>
              <select
                id="equipo"
                className="border rounded-md h-9 px-3 text-sm bg-white"
                value={equipoId}
                onChange={(e) => setEquipoId(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">Sin equipo</option>
                {equipos.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="zona">Zona específica (opcional)</Label>
              <select
                id="zona"
                className="border rounded-md h-9 px-3 text-sm bg-white"
                value={selectedZonaId}
                onChange={(e) => setSelectedZonaId(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">Sin zona</option>
                {zonas.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="lat">Latitud (opcional)</Label>
                <input
                  id="lat"
                  type="number"
                  step="any"
                  className="border rounded-md h-9 px-3 text-sm bg-white"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lng">Longitud (opcional)</Label>
                <input
                  id="lng"
                  type="number"
                  step="any"
                  className="border rounded-md h-9 px-3 text-sm bg-white"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="reference">Referencia de ubicación (opcional)</Label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  id="reference"
                  type="text"
                  className="border rounded-md h-9 px-3 text-sm bg-white flex-1"
                  value={reference}
                  onChange={(e) => {
                    setReference(e.target.value)
                    setReferenceError(null)
                  }}
                  placeholder="Ej. Avenida Siempre Viva 742"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="inline-flex items-center gap-2"
                  onClick={() => void fetchReferenceForCoordinates(lat, lng, creatingFromSuperForm?.id)}
                  disabled={
                    isFetchingReference || lat.trim() === "" || lng.trim() === ""
                  }
                >
                  {isFetchingReference ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                  Obtener referencia
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Usaremos este texto como referencia de calle al enviar la orden al backend.
              </p>
              {referenceError ? <p className="text-xs text-red-500">{referenceError}</p> : null}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => (setOpen(false), resetForm())}>
              Cancelar
            </Button>
            <Button onClick={onCreate} disabled={!descripcion.trim()}>
              Crear Orden
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
