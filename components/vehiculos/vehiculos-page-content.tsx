"use client"

import { useState } from "react"
import { Plus, Car, Search, Eye, Edit2, Trash2, CheckCircle, Wrench } from "lucide-react"
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
import { vehiculos as initialVehiculos, escuadras } from "@/data/escuadras-data"
import type { Vehiculo } from "@/types/escuadras-types"
import { VehiculoForm } from "./vehiculo-form"
import { VehiculoDetails } from "./vehiculo-details"

export function VehiculosPageContent() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>(initialVehiculos)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [vehiculoToEdit, setVehiculoToEdit] = useState<Vehiculo | null>(null)
  const [vehiculoToView, setVehiculoToView] = useState<Vehiculo | null>(null)
  const [vehiculoToDelete, setVehiculoToDelete] = useState<Vehiculo | null>(null)

  const handleFormSubmit = (vehiculoData: Vehiculo) => {
    if (vehiculoToEdit) {
      setVehiculos(vehiculos.map((v) => (v.id === vehiculoData.id ? vehiculoData : v)))
    } else {
      const newVehiculo = {
        ...vehiculoData,
        id: Math.max(0, ...vehiculos.map((v) => v.id)) + 1,
      }
      setVehiculos([...vehiculos, newVehiculo])
    }
    setShowCreateForm(false)
    setVehiculoToEdit(null)
  }

  const handleDeleteVehiculo = (vehiculoId: number) => {
    // En una app real, verificar si el vehículo está asignado a una escuadra activa.
    setVehiculos(vehiculos.filter((v) => v.id !== vehiculoId))
    // Actualizar escuadras que pudieran tener este vehículo asignado.
    // Esta lógica sería más compleja en un backend.
    escuadras.forEach((escuadra) => {
      if (escuadra.vehiculo.id === vehiculoId) {
        // Marcar la escuadra como sin vehículo o asignar uno por defecto si es necesario.
        // Por ahora, solo lo eliminamos de la lista de vehículos.
      }
    })
    setVehiculoToDelete(null)
  }

  const filteredVehiculos = vehiculos.filter((v) =>
    `${v.patente} ${v.marca} ${v.modelo} ${v.tipo}`.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Estadísticas
  const totalVehiculos = vehiculos.length
  const vehiculosDisponibles = vehiculos.filter((v) => v.estado === "disponible").length
  const vehiculosEnUso = vehiculos.filter((v) => v.estado === "en_uso").length
  const vehiculosEnMantenimiento = vehiculos.filter((v) => v.estado === "mantenimiento").length

  const getStatusBadge = (estado: Vehiculo["estado"]) => {
    switch (estado) {
      case "disponible":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <CheckCircle size={12} className="mr-1" />
            Disponible
          </Badge>
        )
      case "en_uso":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            <Car size={12} className="mr-1" />
            En Uso
          </Badge>
        )
      case "mantenimiento":
        return (
          <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-200">
            <Wrench size={12} className="mr-1" />
            Mantenimiento
          </Badge>
        )
      default:
        return <Badge variant="secondary">Desconocido</Badge>
    }
  }

  const getEscuadraAsignada = (vehiculoId: number): string => {
    const escuadra = escuadras.find((e) => e.vehiculo.id === vehiculoId && e.activa)
    return escuadra ? escuadra.nombre : "No asignado"
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vehículos</h1>
          <p className="text-gray-600 mt-1">Administra la flota de vehículos y su estado.</p>
        </div>
        <Button
          onClick={() => {
            setVehiculoToEdit(null)
            setShowCreateForm(true)
          }}
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Nuevo Vehículo
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <Car className="h-6 w-6 text-gray-500 mb-2" />
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-bold">{totalVehiculos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <CheckCircle className="h-6 w-6 text-green-500 mb-2" />
            <p className="text-sm text-gray-600">Disponibles</p>
            <p className="text-2xl font-bold">{vehiculosDisponibles}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Car className="h-6 w-6 text-blue-500 mb-2" />
            <p className="text-sm text-gray-600">En Uso</p>
            <p className="text-2xl font-bold">{vehiculosEnUso}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Wrench className="h-6 w-6 text-orange-500 mb-2" />
            <p className="text-sm text-gray-600">Mantenimiento</p>
            <p className="text-2xl font-bold">{vehiculosEnMantenimiento}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtro y Lista */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Vehículos</CardTitle>
          <CardDescription>Busca y gestiona los vehículos registrados.</CardDescription>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar por patente, marca, modelo..."
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
                    Patente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Marca / Modelo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
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
                {filteredVehiculos.map((vehiculo) => (
                  <tr key={vehiculo.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">
                      {vehiculo.patente}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{vehiculo.marca}</div>
                      <div className="text-xs text-gray-500">
                        {vehiculo.modelo} ({vehiculo.año})
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{vehiculo.tipo}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(vehiculo.estado)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {vehiculo.estado === "en_uso" ? getEscuadraAsignada(vehiculo.id) : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button variant="outline" size="icon" onClick={() => setVehiculoToView(vehiculo)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setVehiculoToEdit(vehiculo)
                          setShowCreateForm(true)
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon" onClick={() => setVehiculoToDelete(vehiculo)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        {vehiculoToDelete && vehiculoToDelete.id === vehiculo.id && (
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Se eliminará permanentemente el vehículo con patente "
                                {vehiculoToDelete.patente}". Si está asignado a una escuadra, esta podría quedar sin
                                vehículo.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setVehiculoToDelete(null)}>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteVehiculo(vehiculoToDelete.id)}>
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
          {filteredVehiculos.length === 0 && (
            <p className="text-center text-gray-500 py-8">No se encontraron vehículos.</p>
          )}
        </CardContent>
      </Card>

      {/* Modal para Crear/Editar Vehículo */}
      <Dialog
        open={showCreateForm}
        onOpenChange={(isOpen) => {
          setShowCreateForm(isOpen)
          if (!isOpen) setVehiculoToEdit(null)
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{vehiculoToEdit ? "Editar Vehículo" : "Nuevo Vehículo"}</DialogTitle>
            <DialogDescription>
              {vehiculoToEdit
                ? "Actualiza los datos del vehículo."
                : "Completa el formulario para agregar un nuevo vehículo."}
            </DialogDescription>
          </DialogHeader>
          <VehiculoForm
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowCreateForm(false)
              setVehiculoToEdit(null)
            }}
            initialData={vehiculoToEdit}
          />
        </DialogContent>
      </Dialog>

      {/* Modal para Ver Detalles del Vehículo */}
      <Dialog open={!!vehiculoToView} onOpenChange={(isOpen) => !isOpen && setVehiculoToView(null)}>
        <DialogContent className="max-w-3xl">
          {" "}
          {/* Aumentado el tamaño para el mapa */}
          <DialogHeader>
            <DialogTitle>Detalles del Vehículo</DialogTitle>
          </DialogHeader>
          {vehiculoToView && <VehiculoDetails vehiculo={vehiculoToView} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
