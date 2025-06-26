"use client"

import { useState } from "react"
import { Plus, Users, MapPin, Car, Calendar, AlertTriangle, Edit, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { equipos as initialEquipos, supervisores, zonas, vehiculos } from "@/data/escuadras-data"
import type { Equipo } from "@/types/escuadras-types"
import { CreateEquipoForm } from "./create-equipo-form"
import { EquipoDetails } from "./equipo-details"

export default function EquiposPage() {
  const [equipos, setEquipos] = useState<Equipo[]>(initialEquipos)
  const [selectedEquipo, setSelectedEquipo] = useState<Equipo | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [equipoToDissolve, setEquipoToDissolve] = useState<Equipo | null>(null)

  // Estadísticas
  const totalEquipos = equipos.length
  const equiposActivos = equipos.filter((e) => e.activa).length
  const totalTrabajadores = equipos.reduce((sum, e) => sum + e.trabajadores.length, 0)
  const supervisoresDisponibles = supervisores.filter(
    (s) => s.activo && !equipos.some((e) => e.supervisor.id === s.id && e.activa),
  ).length
  const vehiculosDisponibles = vehiculos.filter((v) => v.estado === "disponible").length
  const zonasDisponibles = zonas.filter((z) => z.activa && !equipos.some((e) => e.zona.id === z.id && e.activa)).length

  const handleCreateEquipo = (newEquipo: Equipo) => {
    setEquipos([...equipos, newEquipo])
    setShowCreateForm(false)
  }

  const handleDissolveEquipo = (equipoId: number) => {
    setEquipos(equipos.map((e) => (e.id === equipoId ? { ...e, activa: false } : e)))
    setEquipoToDissolve(null)
  }

  const getStatusColor = (equipo: Equipo) => {
    if (!equipo.activa) return "bg-gray-100 text-gray-800"
    if (equipo.trabajadores.length === 0) return "bg-yellow-100 text-yellow-800"
    if (equipo.trabajadores.length < 2) return "bg-orange-100 text-orange-800"
    return "bg-green-100 text-green-800"
  }

  const getStatusText = (equipo: Equipo) => {
    if (!equipo.activa) return "Disuelto"
    if (equipo.trabajadores.length === 0) return "Sin personal"
    if (equipo.trabajadores.length < 2) return "Personal insuficiente"
    return "Operativo"
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Equipos</h1>
          <p className="text-gray-600 mt-1">Administra los equipos de trabajo y sus asignaciones</p>
        </div>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Nuevo Equipo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Equipo</DialogTitle>
              <DialogDescription>
                Configura un nuevo equipo asignando supervisor, trabajadores, zona y vehículo
              </DialogDescription>
            </DialogHeader>
            <CreateEquipoForm onSubmit={handleCreateEquipo} onCancel={() => setShowCreateForm(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Equipos</p>
                <p className="text-2xl font-bold">{totalEquipos}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-green-600">{equiposActivos}</p>
              </div>
              <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Trabajadores</p>
                <p className="text-2xl font-bold">{totalTrabajadores}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Supervisores Libres</p>
                <p className="text-2xl font-bold">{supervisoresDisponibles}</p>
              </div>
              <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Vehículos Libres</p>
                <p className="text-2xl font-bold">{vehiculosDisponibles}</p>
              </div>
              <Car className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Zonas Libres</p>
                <p className="text-2xl font-bold">{zonasDisponibles}</p>
              </div>
              <MapPin className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas */}
      {(supervisoresDisponibles === 0 || vehiculosDisponibles === 0 || zonasDisponibles === 0) && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {supervisoresDisponibles === 0 && "No hay supervisores disponibles para nuevos equipos. "}
            {vehiculosDisponibles === 0 && "No hay vehículos disponibles para nuevos equipos. "}
            {zonasDisponibles === 0 && "No hay zonas disponibles para nuevos equipos. "}
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de Equipos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipos.map((equipo) => (
          <Card key={equipo.id} className={`${!equipo.activa ? "opacity-60" : ""}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{equipo.nombre}</CardTitle>
                  <CardDescription className="mt-1">{equipo.descripcion || "Sin descripción"}</CardDescription>
                </div>
                <Badge className={getStatusColor(equipo)}>{getStatusText(equipo)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Supervisor */}
              <div className="flex items-center gap-2">
                <Users size={16} className="text-blue-500" />
                <span className="text-sm">
                  <strong>Supervisor:</strong> {equipo.supervisor.nombre} {equipo.supervisor.apellido}
                </span>
              </div>

              {/* Trabajadores */}
              <div className="flex items-center gap-2">
                <Users size={16} className="text-purple-500" />
                <span className="text-sm">
                  <strong>Trabajadores:</strong> {equipo.trabajadores.length}/4
                </span>
              </div>

              {/* Zona */}
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-green-500" />
                <span className="text-sm">
                  <strong>Zona:</strong> {equipo.zona.nombre}
                </span>
              </div>

              {/* Vehículo */}
              <div className="flex items-center gap-2">
                <Car size={16} className="text-orange-500" />
                <span className="text-sm">
                  <strong>Vehículo:</strong> {equipo.vehiculo.marca} {equipo.vehiculo.modelo} ({equipo.vehiculo.patente}
                  )
                </span>
              </div>

              {/* Fecha de creación */}
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-500" />
                <span className="text-sm">
                  <strong>Creado:</strong> {equipo.fechaCreacion.toLocaleDateString("es-CL")}
                </span>
              </div>

              {/* Acciones */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedEquipo(equipo)
                    setShowDetails(true)
                  }}
                  className="flex items-center gap-1"
                >
                  <Eye size={14} />
                  Ver
                </Button>

                {equipo.activa && (
                  <>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Edit size={14} />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setEquipoToDissolve(equipo)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      Disolver
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog para ver detalles */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Detalles del Equipo</DialogTitle>
          </DialogHeader>
          {selectedEquipo && <EquipoDetails equipo={selectedEquipo} />}
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar disolución */}
      <Dialog open={!!equipoToDissolve} onOpenChange={() => setEquipoToDissolve(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Disolución</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas disolver el equipo "{equipoToDissolve?.nombre}"? Esta acción liberará todos
              los recursos asignados (supervisor, trabajadores, zona y vehículo).
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEquipoToDissolve(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={() => equipoToDissolve && handleDissolveEquipo(equipoToDissolve.id)}>
              Disolver Equipo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
