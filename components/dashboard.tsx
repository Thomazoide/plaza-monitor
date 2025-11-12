"use client"

import { useEffect, useMemo, useState } from "react"

import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock,
  Loader2,
  MapPin,
  RefreshCcw,
  Truck,
  Users,
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getSuperForms, getWorkOrders } from "@/data/work-orders-data"
import { fetchGreenAreas } from "@/data/zonas-data"
import { getEquipos, getSupervisores, getVehiculos } from "@/data/escuadras-data"
import type { WorkOrder } from "@/types/workOrder-types"
import type { Equipo, Supervisor, Vehiculo } from "@/types/escuadras-types"
import type { GreenArea } from "@/types/map-types"
import type { SuperForm } from "@/types/super-form-types"

const dateTimeFormatter = new Intl.DateTimeFormat("es-CL", {
  dateStyle: "short",
  timeStyle: "short",
})

const dateFormatter = new Intl.DateTimeFormat("es-CL", {
  dateStyle: "short",
})

const toDate = (value: Date | string | null | undefined): Date | null => {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }
  if (typeof value === "string") {
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? null : parsed
  }
  return null
}

const formatDateTime = (value: Date | string | null | undefined): string => {
  const date = toDate(value)
  return date ? dateTimeFormatter.format(date) : "Sin registro"
}

const formatDate = (value: Date | string | null | undefined): string => {
  const date = toDate(value)
  return date ? dateFormatter.format(date) : "Sin registro"
}

const getDaysSince = (value: Date | string | null | undefined): number | null => {
  const date = toDate(value)
  if (!date) return null
  const diff = Date.now() - date.getTime()
  return diff < 0 ? 0 : Math.floor(diff / 86400000)
}

const hasValidCoordinates = (lat?: number | null, lng?: number | null): boolean =>
  typeof lat === "number" && typeof lng === "number" && Number.isFinite(lat) && Number.isFinite(lng)

export default function Dashboard(): JSX.Element {
  const [orders, setOrders] = useState<WorkOrder[]>([])
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [supervisores, setSupervisores] = useState<Supervisor[]>([])
  const [greenAreas, setGreenAreas] = useState<GreenArea[]>([])
  const [superForms, setSuperForms] = useState<SuperForm[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    let cancelled = false

    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        const results = await Promise.allSettled([
          getWorkOrders(),
          getEquipos(),
          getVehiculos(),
          getSupervisores(),
          fetchGreenAreas(),
          getSuperForms(),
        ])

        if (cancelled) return

        const loadErrors: string[] = []

        const [ordersResult, equiposResult, vehiculosResult, supervisoresResult, areasResult, superFormsResult] = results

        if (ordersResult.status === "fulfilled") {
          setOrders(ordersResult.value)
        } else {
          console.error("Error cargando órdenes:", ordersResult.reason)
          loadErrors.push("órdenes")
        }

        if (equiposResult.status === "fulfilled") {
          setEquipos(equiposResult.value)
        } else {
          console.error("Error cargando equipos:", equiposResult.reason)
          loadErrors.push("equipos")
        }

        if (vehiculosResult.status === "fulfilled") {
          setVehiculos(vehiculosResult.value)
        } else {
          console.error("Error cargando vehículos:", vehiculosResult.reason)
          loadErrors.push("vehículos")
        }

        if (supervisoresResult.status === "fulfilled") {
          setSupervisores(supervisoresResult.value)
        } else {
          console.error("Error cargando supervisores:", supervisoresResult.reason)
          loadErrors.push("supervisores")
        }

        if (areasResult.status === "fulfilled") {
          setGreenAreas(areasResult.value)
        } else {
          console.error("Error cargando plazas:", areasResult.reason)
          loadErrors.push("plazas")
        }

        if (superFormsResult.status === "fulfilled") {
          setSuperForms(superFormsResult.value)
        } else {
          console.error("Error cargando super formularios:", superFormsResult.reason)
          loadErrors.push("super formularios")
        }

        if (loadErrors.length > 0) {
          const unique = Array.from(new Set(loadErrors))
          setError(`No se pudieron cargar ${unique.join(", ")}.`)
        }

        if (results.some((result) => result.status === "fulfilled")) {
          setLastUpdated(new Date())
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error inesperado en dashboard:", err)
          setError("No se pudieron cargar los datos del dashboard.")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [refreshToken])

  const handleRefresh = () => setRefreshToken((prev) => prev + 1)

  const orderStats = useMemo(() => {
    const total = orders.length
    const completed = orders.filter((order) => order.completada).length
    const pending = total - completed
    const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100)
    return { total, completed, pending, completionRate }
  }, [orders])

  const teamStats = useMemo(() => {
    const total = equipos.length
    const supervisorCount = supervisores.length
    const withVehicle = equipos.filter((equipo) => equipo.vehiculoID != null || equipo.vehiculo != null).length
    return { total, supervisorCount, withVehicle }
  }, [equipos, supervisores])

  const vehicleStats = useMemo(() => {
    const total = vehiculos.length
    let withLocation = 0
    let unassigned = 0

    for (const vehiculo of vehiculos) {
      if (hasValidCoordinates(vehiculo.latitud, vehiculo.longitud)) {
        withLocation += 1
      }
      if (vehiculo.equipoID == null) {
        unassigned += 1
      }
    }

    return { total, withLocation, unassigned }
  }, [vehiculos])

  const areaStats = useMemo(() => {
    const total = greenAreas.length
    let visitedWeek = 0
    let withoutRecentVisit = 0
    let pendingOrders = 0

    for (const area of greenAreas) {
      const days = getDaysSince(area.lastVisited)
      if (days !== null && days <= 7) {
        visitedWeek += 1
      }
      if (days === null || days > 7) {
        withoutRecentVisit += 1
      }
      if (area.workOrders?.some((order) => !order.completada)) {
        pendingOrders += 1
      }
    }

    return { total, visitedWeek, withoutRecentVisit, pendingOrders }
  }, [greenAreas])

  const superFormStats = useMemo(() => {
    const total = superForms.length
    const pending = superForms.filter((form) => form.workOrderID == null).length
    const withCoordinates = superForms.filter((form) => hasValidCoordinates(form.lat, form.lng)).length
    return { total, pending, withCoordinates }
  }, [superForms])

  const latestOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => {
        const aTime = toDate(a.creada_en)?.getTime() ?? 0
        const bTime = toDate(b.creada_en)?.getTime() ?? 0
        return bTime - aTime
      })
      .slice(0, 5)
  }, [orders])

  const attentionAreas = useMemo(() => {
    return greenAreas
      .map((area) => {
        const days = getDaysSince(area.lastVisited)
        const hasPending = area.workOrders?.some((order) => !order.completada) ?? false
        const needsVisit = days === null || days > 7
        return { area, days, hasPending, needsVisit }
      })
      .filter((entry) => entry.hasPending || entry.needsVisit)
      .sort((a, b) => (b.days ?? 999) - (a.days ?? 999))
      .slice(0, 5)
  }, [greenAreas])

  const pendingSuperForms = useMemo(() => {
    return superForms
      .filter((form) => form.workOrderID == null)
      .sort((a, b) => b.id - a.id)
      .slice(0, 5)
  }, [superForms])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-sm text-black/60">
          <Loader2 className="h-6 w-6 animate-spin text-[#015293]" />
          Cargando datos del dashboard...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-2xl font-semibold text-[#015293]">Resumen operativo</CardTitle>
            <p className="text-sm text-black/60">Indicadores construidos con datos del backend.</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-black/70">
            {lastUpdated ? <span>Actualizado: {formatDateTime(lastUpdated)}</span> : null}
            <button
              type="button"
              onClick={handleRefresh}
              className="inline-flex items-center gap-1 rounded-md border border-[#015293] px-3 py-1.5 text-xs font-semibold text-[#015293] transition-colors hover:bg-[#015293] hover:text-white"
            >
              <RefreshCcw className="h-4 w-4" /> Recargar
            </button>
          </div>
        </CardHeader>
        {error ? (
          <CardContent>
            <div className="flex items-center gap-2 rounded-md border border-[#f2a700]/40 bg-[#f2a700]/10 px-3 py-2 text-sm text-[#015293]">
              <AlertTriangle className="h-4 w-4 text-[#f2a700]" />
              <span>{error}</span>
            </div>
          </CardContent>
        ) : null}
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
  <Card className="border-[#015293]/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-[#015293]">Órdenes de trabajo</CardTitle>
            <ClipboardList className="h-5 w-5 text-[#015293]" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[#015293]">{orderStats.total}</p>
            <p className="mt-2 text-sm text-black/70">
              <span className="font-semibold text-[#015293]">{orderStats.completed}</span> completadas · {" "}
              <span className="font-semibold text-[#f2a700]">{orderStats.pending}</span> pendientes
            </p>
            <p className="mt-1 text-xs text-black/50">Tasa de cierre {orderStats.completionRate}%</p>
          </CardContent>
        </Card>

  <Card className="border-[#015293]/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-[#015293]">Equipos</CardTitle>
            <Users className="h-5 w-5 text-[#f2a700]" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[#015293]">{teamStats.total}</p>
            <p className="mt-2 text-sm text-black/70">
              {teamStats.supervisorCount} supervisores · {teamStats.withVehicle} equipos con vehículo
            </p>
          </CardContent>
        </Card>

  <Card className="border-[#015293]/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-[#015293]">Vehículos</CardTitle>
            <Truck className="h-5 w-5 text-[#015293]" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[#015293]">{vehicleStats.total}</p>
            <p className="mt-2 text-sm text-black/70">
              {vehicleStats.withLocation} con ubicación · {vehicleStats.unassigned} sin equipo asignado
            </p>
          </CardContent>
        </Card>

  <Card className="border-[#015293]/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-[#015293]">Áreas verdes</CardTitle>
            <MapPin className="h-5 w-5 text-[#f2a700]" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[#015293]">{areaStats.total}</p>
            <p className="mt-2 text-sm text-black/70">
              {areaStats.visitedWeek} visitadas últ. 7 días · {areaStats.pendingOrders} con órdenes abiertas
            </p>
            <p className="mt-1 text-xs text-black/50">{areaStats.withoutRecentVisit} sin visita reciente</p>
          </CardContent>
        </Card>

  <Card className="border-[#015293]/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-[#015293]">Super formularios</CardTitle>
            <ClipboardList className="h-5 w-5 text-[#015293]" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-[#015293]">{superFormStats.total}</p>
            <p className="mt-2 text-sm text-black/70">
              {superFormStats.pending} pendientes de orden · {superFormStats.withCoordinates} con coordenadas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
  <Card className="h-full border-[#015293]/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#015293]">
              <ClipboardList className="h-5 w-5 text-[#015293]" /> Últimas órdenes creadas
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {latestOrders.length === 0 ? (
              <p className="text-sm text-black/60">No hay órdenes registradas.</p>
            ) : (
              <ul className="space-y-3">
                {latestOrders.map((order) => {
                  const equipoName = order.equipo?.nombre ?? (order.equipoID != null ? `Equipo #${order.equipoID}` : null)
                  const zonaName = order.zona?.nombre ?? (order.zonaID != null ? `Zona #${order.zonaID}` : null)
                  return (
                    <li key={order.id} className="rounded-md border border-[#015293]/15 bg-white px-3 py-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#015293]">#{order.id}</span>
                          <Badge
                            variant="outline"
                            className={
                              order.completada
                                ? "border-transparent bg-[#015293] text-white"
                                : "border border-[#015293] bg-[#f2a700] text-black"
                            }
                          >
                            {order.completada ? "Completada" : "Pendiente"}
                          </Badge>
                        </div>
                        <span className="text-xs text-black/50">{formatDateTime(order.creada_en)}</span>
                      </div>
                      <p className="mt-1 break-words text-sm text-black/70">{order.descripcion}</p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-black/60">
                        <span>Tipo: {order.tipo}</span>
                        {equipoName ? <span>Equipo: {equipoName}</span> : null}
                        {zonaName ? <span>Zona: {zonaName}</span> : null}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>

  <Card className="h-full border-[#015293]/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#015293]">
              <ClipboardList className="h-5 w-5 text-[#f2a700]" /> Super formularios sin orden
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {pendingSuperForms.length === 0 ? (
              <p className="text-sm text-black/60">Todo asignado, no hay formularios pendientes.</p>
            ) : (
              <ul className="space-y-3">
                {pendingSuperForms.map((form) => {
                  const hasCoords = hasValidCoordinates(form.lat, form.lng)
                  return (
                    <li key={form.id} className="flex items-start justify-between rounded-md border border-[#015293]/15 bg-white px-3 py-2">
                      <div className="pr-4">
                        <p className="text-sm font-semibold text-[#015293]">Formulario #{form.id}</p>
                        {form.description ? (
                          <p className="mt-1 break-words text-xs text-black/60">{form.description}</p>
                        ) : null}
                        <p className="mt-1 text-xs text-black/50">
                          {hasCoords ? `Lat ${form.lat.toFixed(5)}, Lng ${form.lng.toFixed(5)}` : "Sin coordenadas"}
                        </p>
                      </div>
                      <Badge variant="outline" className="border-transparent bg-[#f2a700] text-black">
                        Pendiente
                      </Badge>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

  <Card className="border-[#015293]/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#015293]">
            <MapPin className="h-5 w-5 text-[#f2a700]" /> Áreas que requieren atención
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {attentionAreas.length === 0 ? (
            <p className="text-sm text-black/60">Todas las áreas están al día y sin trabajos pendientes.</p>
          ) : (
            <ul className="space-y-3">
              {attentionAreas.map(({ area, days, hasPending, needsVisit }) => (
                <li key={area.id} className="rounded-md border border-[#015293]/15 bg-white px-3 py-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-[#015293]">{area.name}</p>
                    <Badge
                      variant="outline"
                      className={
                        hasPending
                          ? "border-transparent bg-[#f2a700] text-black"
                          : needsVisit
                            ? "border border-[#015293] text-[#015293]"
                            : "border-transparent bg-[#015293] text-white"
                      }
                    >
                      {days === null ? "Sin registro" : days === 0 ? "Hoy" : `${days} días`}
                    </Badge>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-black/60">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> Última visita: {formatDate(area.lastVisited)}
                    </span>
                    {hasPending ? (
                      <span className="inline-flex items-center gap-1 text-black">
                        <AlertTriangle className="h-3.5 w-3.5 text-[#f2a700]" /> Órdenes abiertas
                      </span>
                    ) : null}
                    {area.workOrders && area.workOrders.length > 0 ? (
                      <span>{area.workOrders.length} orden(es) asociadas</span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

  <Card className="border-[#015293]/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#015293]">
            <Users className="h-5 w-5 text-[#015293]" /> Supervisores registrados
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {supervisores.length === 0 ? (
            <p className="text-sm text-black/60">No se encontraron supervisores en el backend.</p>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {supervisores.map((supervisor) => (
                <li key={supervisor.id} className="rounded-md border border-[#015293]/15 bg-white px-3 py-2">
                  <p className="text-sm font-semibold text-[#015293]">{supervisor.fullName}</p>
                  <p className="text-xs text-black/60">{supervisor.email}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-black/50">
                    <span>{supervisor.celular || "Sin contacto"}</span>
                    {supervisor.equipoID != null ? (
                      <span className="inline-flex items-center gap-1 text-[#015293]">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#f2a700]" /> Equipo #{supervisor.equipoID}
                      </span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
