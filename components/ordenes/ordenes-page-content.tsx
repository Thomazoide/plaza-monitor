"use client"

import { useEffect, useMemo, useState } from "react"
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
  const [superForms, setSuperForms] = useState<SuperForm[]>([])
  const [creatingFromSuperForm, setCreatingFromSuperForm] = useState<SuperForm | null>(null)

  // Aux data
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [zonas, setZonas] = useState<Zona[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
  const [ord, eqs, zs, sf] = await Promise.all([getWorkOrders(), getEquipos(), getZonas(), getSuperForms()])
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

  const resetForm = () => {
    setDescripcion("")
    setTipo("Areas verdes")
    setEquipoId("")
    setSelectedZonaId("")
    setLat("")
    setLng("")
    setCreatingFromSuperForm(null)
  }

  const onCreate = async () => {
    const payload: CreateWorkOrderPayload = {
      descripcion: descripcion.trim(),
      tipo,
      equipoID: equipoId === "" ? null : Number(equipoId),
      zonaID: selectedZonaId === "" ? null : Number(selectedZonaId),
      lat: parseCoordinate(lat),
      lng: parseCoordinate(lng),
    }

    if (!payload.descripcion) return

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
    setDetailsOpen(true)
  }

  const onUpdate = async () => {
    if (!selected) return
    const payload = {
      id: selected.id,
      descripcion: descripcion.trim(),
      tipo,
      equipoID: equipoId === "" ? null : Number(equipoId),
      zonaID: selectedZonaId === "" ? null : Number(selectedZonaId),
      lat: parseCoordinate(lat),
      lng: parseCoordinate(lng),
    }
    if (!payload.descripcion) return
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
    }
  }, [detailsOpen])

  const handleCreateFromSuperForm = (form: SuperForm) => {
    setDescripcion(form.description?.trim() || `Orden generada desde formulario #${form.id}`)
    setTipo("Areas verdes")
    setEquipoId("")
    setSelectedZonaId("")
    setLat(form.lat != null ? form.lat.toString() : "")
    setLng(form.lng != null ? form.lng.toString() : "")
    setCreatingFromSuperForm(form)
    setOpen(true)
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
              {availableSuperForms.map((form) => (
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
                    </div>
                  </div>
                  <Button size="sm" onClick={() => handleCreateFromSuperForm(form)}>
                    Crear orden desde este formulario
                  </Button>
                </div>
              ))}
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
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-amber-600" />
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
            <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
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
