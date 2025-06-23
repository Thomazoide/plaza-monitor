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
import { escuadras as initialEscuadras, supervisores, zonas, vehiculos } from "@/data/escuadras-data"
import type { Escuadra } from "@/types/escuadras-types"
import { CreateEscuadraForm } from "./create-escuadra-form"
import { EscuadraDetails } from "./escuadra-details"

export default function EscuadrasPage() {
  const [escuadras, setEscuadras] = useState<Escuadra[]>(initialEscuadras)
  const [selectedEscuadra, setSelectedEscuadra] = useState<Escuadra | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [escuadraToDissolve, setEscuadraToDissolve] = useState<Escuadra | null>(null)

  // Estadísticas
  const totalEscuadras = escuadras.length
  const escuadrasActivas = escuadras.filter((e) => e.activa).length
  const totalTrabajadores = escuadras.reduce((sum, e) => sum + e.trabajadores.length, 0)
  const supervisoresDisponibles = supervisores.filter(
    (s) => s.activo && !escuadras.some((e) => e.supervisor.id === s.id && e.activa),
  ).length
  const vehiculosDisponibles = vehiculos.filter((v) => v.estado === "disponible").length
  const zonasDisponibles = zonas.filter(
    (z) => z.activa && !escuadras.some((e) => e.zona.id === z.id && e.activa),
  ).length

  const handleCreateEscuadra = (newEscuadra: Escuadra) => {
    setEscuadras([...escuadras, newEscuadra])
    setShowCreateForm(false)
  }

  const handleDissolveEscuadra = (escuadraId: number) => {
    setEscuadras(escuadras.map((e) => (e.id === escuadraId ? { ...e, activa: false } : e)))
    setEscuadraToDissolve(null)
  }

  const getStatusColor = (escuadra: Escuadra) => {
    if (!escuadra.activa) return "bg-gray-100 text-gray-800"
    if (escuadra.trabajadores.length === 0) return "bg-yellow-100 text-yellow-800"
    if (escuadra.trabajadores.length < 2) return "bg-orange-100 text-orange-800"
    return "bg-green-100 text-green-800"
  }

  const getStatusText = (escuadra: Escuadra) => {
    if (!escuadra.activa) return "Disuelta"
    if (escuadra.trabajadores.length === 0) return "Sin personal"
    if (escuadra.trabajadores.length < 2) return "Personal insuficiente"
    return "Operativa"
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Escuadras</h1>
          <p className="text-gray-600 mt-1">Administra las escuadras de trabajo y sus asignaciones</p>
        </div>
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} />
              Nueva Escuadra
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nueva Escuadra</DialogTitle>
              <DialogDescription>
                Configura una nueva escuadra asignando supervisor, trabajadores, zona y vehículo
              </DialogDescription>
            </DialogHeader>
            <CreateEscuadraForm onSubmit={handleCreateEscuadra} onCancel={() => setShowCreateForm(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Escuadras</p>
                <p className="text-2xl font-bold">{totalEscuadras}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activas</p>
                <p className="text-2xl font-bold text-green-600">{escuadrasActivas}</p>
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
            {supervisoresDisponibles === 0 && "No hay supervisores disponibles para nuevas escuadras. "}
            {vehiculosDisponibles === 0 && "No hay vehículos disponibles para nuevas escuadras. "}
            {zonasDisponibles === 0 && "No hay zonas disponibles para nuevas escuadras. "}
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de Escuadras */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {escuadras.map((escuadra) => (
          <Card key={escuadra.id} className={`${!escuadra.activa ? "opacity-60" : ""}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{escuadra.nombre}</CardTitle>
                  <CardDescription className="mt-1">{escuadra.descripcion || "Sin descripción"}</CardDescription>
                </div>
                <Badge className={getStatusColor(escuadra)}>{getStatusText(escuadra)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Supervisor */}
              <div className="flex items-center gap-2">
                <Users size={16} className="text-blue-500" />
                <span className="text-sm">
                  <strong>Supervisor:</strong> {escuadra.supervisor.nombre} {escuadra.supervisor.apellido}
                </span>
              </div>

              {/* Trabajadores */}
              <div className="flex items-center gap-2">
                <Users size={16} className="text-purple-500" />
                <span className="text-sm">
                  <strong>Trabajadores:</strong> {escuadra.trabajadores.length}/4
                </span>
              </div>

              {/* Zona */}
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-green-500" />
                <span className="text-sm">
                  <strong>Zona:</strong> {escuadra.zona.nombre}
                </span>
              </div>

              {/* Vehículo */}
              <div className="flex items-center gap-2">
                <Car size={16} className="text-orange-500" />
                <span className="text-sm">
                  <strong>Vehículo:</strong> {escuadra.vehiculo.marca} {escuadra.vehiculo.modelo} (
                  {escuadra.vehiculo.patente})
                </span>
              </div>

              {/* Fecha de creación */}
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-500" />
                <span className="text-sm">
                  <strong>Creada:</strong> {escuadra.fechaCreacion.toLocaleDateString("es-CL")}
                </span>
              </div>

              {/* Acciones */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedEscuadra(escuadra)
                    setShowDetails(true)
                  }}
                  className="flex items-center gap-1"
                >
                  <Eye size={14} />
                  Ver
                </Button>

                {escuadra.activa && (
                  <>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Edit size={14} />
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setEscuadraToDissolve(escuadra)}
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
            <DialogTitle>Detalles de la Escuadra</DialogTitle>
          </DialogHeader>
          {selectedEscuadra && <EscuadraDetails escuadra={selectedEscuadra} />}
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar disolución */}
      <Dialog open={!!escuadraToDissolve} onOpenChange={() => setEscuadraToDissolve(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Disolución</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas disolver la escuadra "{escuadraToDissolve?.nombre}"? Esta acción liberará
              todos los recursos asignados (supervisor, trabajadores, zona y vehículo).
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setEscuadraToDissolve(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => escuadraToDissolve && handleDissolveEscuadra(escuadraToDissolve.id)}
            >
              Disolver Escuadra
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
