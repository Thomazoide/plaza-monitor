"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
// Tabs not used currently
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getSupervisoresForRegistros, getRegistrosBySupervisor, getPlazaById } from "@/data/registros-data"
import type { Supervisor } from "@/types/escuadras-types"
import type { Registro, Plaza } from "@/types/registros-types"
import { MapPin, UserCheck, RefreshCcw } from "lucide-react"

export function RegistrosPageContent() {
  const [loading, setLoading] = useState(true)
  const [supervisores, setSupervisores] = useState<Supervisor[]>([])
  const [query, setQuery] = useState("")
  const [selectedSupervisor, setSelectedSupervisor] = useState<Supervisor | null>(null)
  const [registros, setRegistros] = useState<Registro[]>([])
  const [plazasCache, setPlazasCache] = useState<Record<number, Plaza>>({})
  const [isLoadingRegistros, setIsLoadingRegistros] = useState(false)
  const [filterMode, setFilterMode] = useState<"all" | "single" | "range">("all")
  const [singleDate, setSingleDate] = useState("")
  const [rangeStart, setRangeStart] = useState("")
  const [rangeEnd, setRangeEnd] = useState("")

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const list = await getSupervisoresForRegistros()
      setSupervisores(list)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return supervisores
    return supervisores.filter((s) =>
      `${s.fullName} ${s.rut} ${s.email}`.toLowerCase().includes(q)
    )
  }, [query, supervisores])

  const loadRegistros = async (sup: Supervisor) => {
    setSelectedSupervisor(sup)
    setIsLoadingRegistros(true)
    setFilterMode("all")
    setSingleDate("")
    setRangeStart("")
    setRangeEnd("")
    const regs = await getRegistrosBySupervisor(sup.id)
    setRegistros(regs)
    // Pre-cargar plazas para los registros mostrados
    const uniqueZonaIds = Array.from(new Set(regs.map(r => r.id_zona)))
    const updates: Record<number, Plaza> = {}
    await Promise.all(uniqueZonaIds.map(async (id) => {
      if (!plazasCache[id]) {
        const p = await getPlazaById(id)
        if (p) updates[id] = p
      }
    }))
    if (Object.keys(updates).length) {
      setPlazasCache(prev => ({ ...prev, ...updates }))
    }
    setIsLoadingRegistros(false)
  }

  const getPlazaName = (id: number) => plazasCache[id]?.name || `#${id}`

  const filteredRegistros = useMemo(() => {
    if (filterMode === "all") return registros

    const toDateOnly = (value: string) => {
      if (!value) return null
      const parsed = new Date(value)
      return Number.isNaN(parsed.getTime()) ? null : parsed
    }

    const parseRegistroDate = (value: string) => {
      if (!value) return null
      const normalized = value.includes("T") ? value : `${value}T00:00:00`
      const parsed = new Date(normalized)
      if (!Number.isNaN(parsed.getTime())) return parsed
      const fallback = new Date(value)
      return Number.isNaN(fallback.getTime()) ? null : fallback
    }

    if (filterMode === "single") {
      const target = toDateOnly(singleDate)
      if (!target) return registros
      const targetY = target.getFullYear()
      const targetM = target.getMonth()
      const targetD = target.getDate()
      return registros.filter((r) => {
        const d = parseRegistroDate(r.fecha)
        if (!d) return false
        return d.getFullYear() === targetY && d.getMonth() === targetM && d.getDate() === targetD
      })
    }

    const start = toDateOnly(rangeStart)
    const end = toDateOnly(rangeEnd)
    if (!start && !end) return registros
    const endWithTime = end ? new Date(end.getTime() + 24 * 60 * 60 * 1000 - 1) : null

    return registros.filter((r) => {
      const d = parseRegistroDate(r.fecha)
      if (!d) return false
      if (start && d < start) return false
      if (endWithTime && d > endWithTime) return false
      return true
    })
  }, [filterMode, singleDate, rangeStart, rangeEnd, registros])

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Registros</h1>
          <p className="text-gray-600">Consulta registros por supervisor y zona.</p>
        </div>
        <Button
          variant="outline"
          onClick={() => selectedSupervisor && loadRegistros(selectedSupervisor)}
          disabled={!selectedSupervisor || isLoadingRegistros}
        >
          <RefreshCcw className="h-4 w-4 mr-2" />
          Recargar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><UserCheck className="h-5 w-5" /> Supervisores</CardTitle>
            <CardDescription>Selecciona un supervisor para ver sus registros.</CardDescription>
            <Input placeholder="Buscar supervisor..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[480px] pr-2">
              {loading ? (
                <div className="text-sm text-gray-500">Cargando supervisores...</div>
              ) : (
                <div className="space-y-2">
                  {filtered.map((s) => (
                    <Button key={s.id} variant={selectedSupervisor?.id === s.id ? "default" : "outline"} className="w-full justify-start" onClick={() => loadRegistros(s)}>
                      {s.fullName}
                    </Button>
                  ))}
                  {filtered.length === 0 && (
                    <div className="text-sm text-gray-500">Sin resultados</div>
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Registros {selectedSupervisor ? `de ${selectedSupervisor.fullName}` : ""}</CardTitle>
            <CardDescription>
              {selectedSupervisor ? "Listado de visitas realizadas por el supervisor." : "Selecciona un supervisor para ver sus registros."}
            </CardDescription>
            {selectedSupervisor && (
              <div className="mt-4 space-y-4">
                <div className="grid gap-3 md:grid-cols-[200px_1fr]">
                  <div className="space-y-1">
                    <Label>Modo de filtro</Label>
                    <Select value={filterMode} onValueChange={(v) => setFilterMode(v as typeof filterMode)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un modo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="single">Por fecha</SelectItem>
                        <SelectItem value="range">Rango de fechas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {filterMode === "single" && (
                      <div className="space-y-1">
                        <Label htmlFor="filter-date">Fecha</Label>
                        <Input
                          id="filter-date"
                          type="date"
                          value={singleDate}
                          onChange={(e) => setSingleDate(e.target.value)}
                        />
                      </div>
                    )}
                    {filterMode === "range" && (
                      <>
                        <div className="space-y-1">
                          <Label htmlFor="filter-from">Desde</Label>
                          <Input
                            id="filter-from"
                            type="date"
                            value={rangeStart}
                            onChange={(e) => setRangeStart(e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="filter-to">Hasta</Label>
                          <Input
                            id="filter-to"
                            type="date"
                            value={rangeEnd}
                            min={rangeStart || undefined}
                            onChange={(e) => setRangeEnd(e.target.value)}
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
                {(filterMode === "single" && singleDate) ||
                (filterMode === "range" && (rangeStart || rangeEnd)) ? (
                  <Button
                    variant="ghost"
                    className="w-fit px-2"
                    onClick={() => {
                      setFilterMode("all")
                      setSingleDate("")
                      setRangeStart("")
                      setRangeEnd("")
                    }}
                  >
                    Limpiar filtro
                  </Button>
                ) : null}
              </div>
            )}
          </CardHeader>
          <CardContent>
            {isLoadingRegistros ? (
              <div className="text-sm text-gray-500">Cargando registros...</div>
            ) : selectedSupervisor ? (
              filteredRegistros.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Zona</TableHead>
                        <TableHead>Hora llegada</TableHead>
                        <TableHead>Hora salida</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRegistros.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell>{r.fecha}</TableCell>
                          <TableCell className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            {getPlazaName(r.id_zona)}
                          </TableCell>
                          <TableCell>{r.hora_llegada}</TableCell>
                          <TableCell>{r.hora_salida}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-sm text-gray-500">No hay registros que coincidan con el filtro aplicado.</div>
              )
            ) : (
              <div className="text-sm text-gray-500">Selecciona un supervisor.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
