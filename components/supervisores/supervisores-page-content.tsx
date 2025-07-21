"use client"

import { AlertDialogTrigger } from "@/components/ui/alert-dialog"

import { useState, useEffect } from "react"
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
import { getSupervisores, getEquipos } from "@/data/escuadras-data"
import type { Supervisor, Equipo } from "@/types/escuadras-types"
import { SupervisorForm } from "./supervisor-form"
import { SupervisorDetails } from "./supervisor-details"

export function SupervisoresPageContent() {
  const [supervisores, setSupervisores] = useState<Supervisor[]>([])
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [supervisorToEdit, setSupervisorToEdit] = useState<Supervisor | null>(null)
  const [supervisorToView, setSupervisorToView] = useState<Supervisor | null>(null)
  const [supervisorToDelete, setSupervisorToDelete] = useState<Supervisor | null>(null)

  // Cargar supervisores y equipos del backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [supervisoresData, equiposData] = await Promise.all([
          getSupervisores(),
          getEquipos()
        ])
        setSupervisores(supervisoresData)
        setEquipos(equiposData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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
    `${s.fullName} ${s.rut} ${s.email}`.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Estadísticas (adaptadas a los datos del backend)
  const totalSupervisores = supervisores.length
  const supervisoresActivos = supervisores.length // Asumimos que todos los supervisores del backend están activos
  const supervisoresInactivos = 0 // No tenemos información de inactivos del backend
  const supervisoresAsignados = equipos.filter(equipo => equipo.supervisorID).length
  const supervisoresDisponibles = totalSupervisores - supervisoresAsignados

  const getEquipoAsignado = (supervisorId: number) => {
    const equipoAsignado = equipos.find((e) => e.supervisorID === supervisorId)
    return equipoAsignado ? equipoAsignado.nombre : "No asignado"
  }

  return (
    <div className="p-6 space-y-6">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Cargando supervisores...</div>
        </div>
      ) : (
        <>
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
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Equipo
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
                        {supervisor.fullName}
                      </div>
                      <div className="text-xs text-gray-500">{supervisor.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supervisor.rut}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800"
                      >
                        Activo
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{supervisor.celular}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getEquipoAsignado(supervisor.id)}
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
                                {supervisorToDelete.fullName}". Si está asignado a un equipo, este podría quedar sin supervisor.
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
          {supervisorToView && <SupervisorDetails supervisor={supervisorToView} equipos={equipos} />}
        </DialogContent>
      </Dialog>
        </>
      )}
    </div>
  )
}
