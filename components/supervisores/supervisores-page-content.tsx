"use client"

import { AlertDialogTrigger } from "@/components/ui/alert-dialog"

import { useState } from "react"
import { Plus, UserCheck, UserX, Users, Briefcase, Search, Eye, Edit2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { supervisores as initialSupervisores, escuadras } from "@/data/escuadras-data"
import type { Supervisor } from "@/types/escuadras-types"
import { SupervisorForm } from "./supervisor-form"
import { SupervisorDetails } from "./supervisor-details"

export function SupervisoresPageContent() {
  const [supervisores, setSupervisores] = useState<Supervisor[]>(initialSupervisores)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [supervisorToEdit, setSupervisorToEdit] = useState<Supervisor | null>(null)
  const [supervisorToView, setSupervisorToView] = useState<Supervisor | null>(null)
  const [supervisorToDelete, setSupervisorToDelete] = useState<Supervisor | null>(null)

  const handleFormSubmit = (supervisorData: Supervisor) => {
    if (supervisorToEdit) {
      setSupervisores(supervisores.map((s) => (s.id === supervisorData.id ? supervisorData : s)))
    } else {
      const newSupervisor = {
        ...supervisorData,
        id: Math.max(0, ...supervisores.map((s) => s.id)) + 1,
      }
      setSupervisores([...supervisores, newSupervisor])
    }
    setShowCreateForm(false)
    setSupervisorToEdit(null)
  }

  const handleDeleteSupervisor = (supervisorId: number) => {
    // En una app real, esto implicaría verificar si el supervisor está asignado
    // y manejar esa lógica (ej. impedir borrado, desasignar, etc.)
    setSupervisores(supervisores.filter((s) => s.id !== supervisorId))
    // Si un supervisor es eliminado, las escuadras que supervisaba podrían necesitar
    // un nuevo supervisor o marcarse como "sin supervisor".
    // Por ahora, solo lo eliminamos de la lista de supervisores.
    // La lógica de actualización de escuadras se manejaría en un backend.
    setSupervisorToDelete(null)
  }

  const filteredSupervisores = supervisores.filter((s) =>
    `${s.nombre} ${s.apellido} ${s.rut} ${s.email}`.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Estadísticas
  const totalSupervisores = supervisores.length
  const supervisoresActivos = supervisores.filter((s) => s.activo).length
  const supervisoresInactivos = totalSupervisores - supervisoresActivos
  const supervisoresAsignados = escuadras
    .filter((e) => e.activa && e.supervisor)
    .map((e) => e.supervisor.id)
    .filter((value, index, self) => self.indexOf(value) === index).length
  const supervisoresDisponibles = supervisores.filter(
    (s) => s.activo && !escuadras.some((e) => e.activa && e.supervisor.id === s.id),
  ).length

  const getEscuadraAsignada = (supervisorId: number) => {
    const escuadraAsignada = escuadras.find((e) => e.supervisor.id === supervisorId && e.activa)
    return escuadraAsignada ? escuadraAsignada.nombre : "No asignado"
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supervisores</h1>
          <p className="text-gray-600 mt-1">Gestiona el personal de supervisión y sus asignaciones.</p>
        </div>
        <Button
          onClick={() => {
            setSupervisorToEdit(null)
            setShowCreateForm(true)
          }}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Nuevo Supervisor
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <Users className="h-6 w-6 text-blue-500 mb-2" />
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold">{totalSupervisores}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <UserCheck className="h-6 w-6 text-green-500 mb-2" />
            <p className="text-sm text-gray-600">Activos</p>
            <p className="text-2xl font-bold">{supervisoresActivos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <UserX className="h-6 w-6 text-red-500 mb-2" />
            <p className="text-sm text-gray-600">Inactivos</p>
            <p className="text-2xl font-bold">{supervisoresInactivos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Briefcase className="h-6 w-6 text-purple-500 mb-2" />
            <p className="text-sm text-gray-600">Asignados</p>
            <p className="text-2xl font-bold">{supervisoresAsignados}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Users className="h-6 w-6 text-orange-500 mb-2" />
            <p className="text-sm text-gray-600">Disponibles</p>
            <p className="text-2xl font-bold">{supervisoresDisponibles}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtro y Lista */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Supervisores</CardTitle>
          <CardDescription>Busca y gestiona los supervisores registrados.</CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre, RUT, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RUT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Experiencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Escuadra
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSupervisores.map((supervisor) => (
                  <tr key={supervisor.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {supervisor.nombre} {supervisor.apellido}
                      </div>
                      <div className="text-xs text-gray-500">{supervisor.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supervisor.rut}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={supervisor.activo ? "default" : "destructive"}
                        className={supervisor.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                      >
                        {supervisor.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supervisor.experiencia} años</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getEscuadraAsignada(supervisor.id)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button variant="outline" size="icon" onClick={() => setSupervisorToView(supervisor)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSupervisorToEdit(supervisor)
                          setShowCreateForm(true)
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon" onClick={() => setSupervisorToDelete(supervisor)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        {supervisorToDelete && supervisorToDelete.id === supervisor.id && (
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente al supervisor "
                                {supervisorToDelete.nombre} {supervisorToDelete.apellido}". Si está asignado a una
                                escuadra, esta podría quedar sin supervisor.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setSupervisorToDelete(null)}>
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteSupervisor(supervisorToDelete.id)}>
                                Eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        )}
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredSupervisores.length === 0 && (
            <p className="text-center text-gray-500 py-8">No se encontraron supervisores.</p>
          )}
        </CardContent>
      </Card>

      {/* Modal para Crear/Editar Supervisor */}
      <Dialog
        open={showCreateForm}
        onOpenChange={(isOpen) => {
          setShowCreateForm(isOpen)
          if (!isOpen) setSupervisorToEdit(null)
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{supervisorToEdit ? "Editar Supervisor" : "Nuevo Supervisor"}</DialogTitle>
            <DialogDescription>
              {supervisorToEdit
                ? "Actualiza los datos del supervisor."
                : "Completa el formulario para agregar un nuevo supervisor."}
            </DialogDescription>
          </DialogHeader>
          <SupervisorForm
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowCreateForm(false)
              setSupervisorToEdit(null)
            }}
            initialData={supervisorToEdit}
          />
        </DialogContent>
      </Dialog>

      {/* Modal para Ver Detalles del Supervisor */}
      <Dialog open={!!supervisorToView} onOpenChange={(isOpen) => !isOpen && setSupervisorToView(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Supervisor</DialogTitle>
          </DialogHeader>
          {supervisorToView && <SupervisorDetails supervisor={supervisorToView} escuadras={escuadras} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
