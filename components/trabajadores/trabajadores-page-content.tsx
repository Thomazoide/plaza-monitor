"use client"

import { useState, useEffect } from "react"
import { Plus, Users, UserCheck, UserX, Briefcase, Search, Eye, Edit2, Trash2 } from "lucide-react"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { trabajadores as initialTrabajadores, getEquipos, getTrabajadores } from "@/data/escuadras-data"
import type { Trabajador, Equipo } from "@/types/escuadras-types"
import { TrabajadorForm } from "./trabajador-form"
import { TrabajadorDetails } from "./trabajador-details"

export function TrabajadoresPageContent() {
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>(initialTrabajadores)
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [trabajadorToEdit, setTrabajadorToEdit] = useState<Trabajador | null>(null)
  const [trabajadorToView, setTrabajadorToView] = useState<Trabajador | null>(null)
  const [trabajadorToDelete, setTrabajadorToDelete] = useState<Trabajador | null>(null)

  // Cargar equipos del backend
  useEffect(() => {
    const loadEquipos = async () => {
      try {
        const equiposData = await getEquipos()
        setEquipos(equiposData)
      } catch (error) {
        console.error('Error loading equipos:', error)
      }
    }
    loadEquipos()
  }, [])

  const handleFormSubmit = (trabajadorData: Trabajador) => {
    if (trabajadorToEdit) {
      setTrabajadores(trabajadores.map((t) => (t.id === trabajadorData.id ? trabajadorData : t)))
    } else {
      const newTrabajador = {
        ...trabajadorData,
        id: Math.max(0, ...trabajadores.map((t) => t.id)) + 1,
      }
      setTrabajadores([...trabajadores, newTrabajador])
    }
    setShowCreateForm(false)
    setTrabajadorToEdit(null)
  }

  const handleDeleteTrabajador = (trabajadorId: number) => {
    // En una app real, esto sería una llamada a API.
    // Aquí simulamos la eliminación y desasignación de equipo.
    setTrabajadores(trabajadores.filter((t) => t.id !== trabajadorId))
    setTrabajadorToDelete(null)
  }

  const filteredTrabajadores = trabajadores.filter((t) =>
    `${t.nombre} ${t.apellido} ${t.rut} ${t.email}`.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Estadísticas
  const totalTrabajadores = trabajadores.length
  const trabajadoresActivos = trabajadores.filter((t) => t.activo).length
  const trabajadoresInactivos = totalTrabajadores - trabajadoresActivos
  const trabajadoresAsignados = trabajadores.filter((t) => t.equipoId).length
  const trabajadoresDisponibles = totalTrabajadores - trabajadoresAsignados

  const getEquipoNombre = (equipoId?: number) => {
    if (!equipoId) return "No asignado"
    const equipo = equipos.find((e) => e.id === equipoId)
    return equipo ? equipo.nombre : "Equipo desconocido"
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trabajadores</h1>
          <p className="text-gray-600 mt-1">Gestiona el personal, asignaciones y estado.</p>
        </div>
        <Button
          onClick={() => {
            setTrabajadorToEdit(null)
            setShowCreateForm(true)
          }}
          className="flex items-center gap-2 bg-[#015293] hover:bg-[#f2a700]"
        >
          <Plus size={16} />
          Nuevo Trabajador
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <Users className="h-6 w-6 text-blue-500 mb-2" />
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold">{totalTrabajadores}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <UserCheck className="h-6 w-6 text-green-500 mb-2" />
            <p className="text-sm text-gray-600">Activos</p>
            <p className="text-2xl font-bold">{trabajadoresActivos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <UserX className="h-6 w-6 text-red-500 mb-2" />
            <p className="text-sm text-gray-600">Inactivos</p>
            <p className="text-2xl font-bold">{trabajadoresInactivos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Briefcase className="h-6 w-6 text-purple-500 mb-2" />
            <p className="text-sm text-gray-600">Asignados</p>
            <p className="text-2xl font-bold">{trabajadoresAsignados}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Users className="h-6 w-6 text-orange-500 mb-2" />
            <p className="text-sm text-gray-600">Disponibles</p>
            <p className="text-2xl font-bold">{trabajadoresDisponibles}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtro y Lista */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Trabajadores</CardTitle>
          <CardDescription>Busca y gestiona los trabajadores registrados.</CardDescription>
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
                    Equipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTrabajadores.map((trabajador) => (
                  <tr key={trabajador.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {trabajador.nombre} {trabajador.apellido}
                      </div>
                      <div className="text-xs text-gray-500">{trabajador.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{trabajador.rut}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={trabajador.activo ? "default" : "destructive"}
                        className={trabajador.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                      >
                        {trabajador.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getEquipoNombre(trabajador.equipoId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button variant="outline" size="icon" onClick={() => setTrabajadorToView(trabajador)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setTrabajadorToEdit(trabajador)
                          setShowCreateForm(true)
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon" onClick={() => setTrabajadorToDelete(trabajador)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        {trabajadorToDelete && trabajadorToDelete.id === trabajador.id && (
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente al trabajador "
                                {trabajadorToDelete.nombre} {trabajadorToDelete.apellido}". Si está asignado a un
                                equipo, será desasignado.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setTrabajadorToDelete(null)}>
                                Cancelar
                              </AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteTrabajador(trabajadorToDelete.id)}>
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
          {filteredTrabajadores.length === 0 && (
            <p className="text-center text-gray-500 py-8">No se encontraron trabajadores.</p>
          )}
        </CardContent>
      </Card>

      {/* Modal para Crear/Editar Trabajador */}
      <Dialog
        open={showCreateForm}
        onOpenChange={(isOpen) => {
          setShowCreateForm(isOpen)
          if (!isOpen) setTrabajadorToEdit(null)
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{trabajadorToEdit ? "Editar Trabajador" : "Nuevo Trabajador"}</DialogTitle>
            <DialogDescription>
              {trabajadorToEdit
                ? "Actualiza los datos del trabajador."
                : "Completa el formulario para agregar un nuevo trabajador."}
            </DialogDescription>
          </DialogHeader>
          <TrabajadorForm
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowCreateForm(false)
              setTrabajadorToEdit(null)
            }}
            initialData={trabajadorToEdit}
          />
        </DialogContent>
      </Dialog>

      {/* Modal para Ver Detalles del Trabajador */}
      <Dialog open={!!trabajadorToView} onOpenChange={(isOpen) => !isOpen && setTrabajadorToView(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Trabajador</DialogTitle>
          </DialogHeader>
          {trabajadorToView && <TrabajadorDetails trabajador={trabajadorToView} equipos={equipos} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
