"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, ClipboardList, CheckCircle2, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { WorkOrder, WorkOrderType } from "@/types/workOrder-types"
import { getWorkOrders, createWorkOrder, type CreateWorkOrderPayload, updateWorkOrder } from "@/data/work-orders-data"
import { getEquipos } from "@/data/escuadras-data"
import { getZonas } from "@/data/zonas-data"
import type { Equipo, Zona } from "@/types/escuadras-types"

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

  // Form state
  const [descripcion, setDescripcion] = useState("")
  const [tipo, setTipo] = useState<WorkOrderType>("Areas verdes")
  const [equipoId, setEquipoId] = useState<number | "">("")
  const [zonaId, setZonaId] = useState<number | "">("")

  // Aux data
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [zonas, setZonas] = useState<Zona[]>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const [ord, eqs, zs] = await Promise.all([getWorkOrders(), getEquipos(), getZonas()])
        if (!mounted) return
        setOrders(ord)
        setEquipos(eqs)
        setZonas(zs)
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

  const resetForm = () => {
    setDescripcion("")
    setTipo("Areas verdes")
    setEquipoId("")
    setZonaId("")
  }

  const onCreate = async () => {
    const payload: CreateWorkOrderPayload = {
      descripcion: descripcion.trim(),
      tipo,
      equipoID: equipoId === "" ? null : Number(equipoId),
      zonaId: zonaId === "" ? null : Number(zonaId),
    }

    if (!payload.descripcion) return

    const created = await createWorkOrder(payload)
    if (created) {
      setOrders((prev) => [created, ...prev])
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
    setZonaId(typeof anyOrder.zonaId === "number" ? anyOrder.zonaId : "")
    setDetailsOpen(true)
  }

  const onUpdate = async () => {
    if (!selected) return
    const payload = {
      id: selected.id,
      descripcion: descripcion.trim(),
      tipo,
      equipoID: equipoId === "" ? null : Number(equipoId),
      zonaId: zonaId === "" ? null : Number(zonaId),
    }
    if (!payload.descripcion) return
    const updated = await updateWorkOrder(payload)
    if (updated) {
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)))
      setSelected(updated)
      // mantener abierto el detalle
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
                  if (typeof anyOrder.zonaId === "number") {
                    return zonasMap.get(anyOrder.zonaId)?.nombre ?? null
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
                          {zonaName && <span className="ml-3">Zona: {zonaName}</span>}
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
        <DialogContent className="sm:max-w-[720px]">
          <DialogHeader>
            <DialogTitle>Detalle de Orden #{selected?.id}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="grid gap-4">
              <div className="text-sm text-gray-600">
                <div>Estado: {selected.completada ? "Completada" : "Pendiente"}</div>
                <div>Tipo: {selected.tipo}</div>
                <div>Creada: {new Date(selected.creada_en).toLocaleString("es-CL")}</div>
                {selected.completada && selected.completada_en && (
                  <div>Completada: {new Date(selected.completada_en).toLocaleString("es-CL")}</div>
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
                      value={zonaId}
                      onChange={(e) => setZonaId(e.target.value ? Number(e.target.value) : "")}
                    >
                      <option value="">Sin zona</option>
                      {zonas.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.nombre}
                        </option>
                      ))}
                    </select>
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
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={open} onOpenChange={(v) => (setOpen(v), v || resetForm())}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Nueva Orden de Trabajo</DialogTitle>
          </DialogHeader>
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
                value={zonaId}
                onChange={(e) => setZonaId(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">Sin zona</option>
                {zonas.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.nombre}
                  </option>
                ))}
              </select>
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
