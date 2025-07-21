"use client"

import * as React from "react"
import { PlusCircle, SlidersHorizontal, Wifi, Bluetooth, AlertTriangle, Edit2, Trash2, Eye, Battery } from "lucide-react"
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
import type { Beacon, CreateBeaconRequest } from "@/types/beacon-types"
import type { Trabajador, Supervisor, Vehiculo, Zona } from "@/types/escuadras-types"
import { getBeacons, createBeacon, deleteBeacon, updateBeacon } from "@/data/beacon-data"
import { getTrabajadores, getSupervisores, getVehiculos } from "@/data/escuadras-data"
import { useToast } from "@/hooks/use-toast"

export default function DispositivosPageContent() {
  const [beacons, setBeacons] = React.useState<Beacon[]>([])
  const [trabajadores, setTrabajadores] = React.useState<Trabajador[]>([])
  const [supervisores, setSupervisores] = React.useState<Supervisor[]>([])
  const [vehiculos, setVehiculos] = React.useState<Vehiculo[]>([])
  const [loading, setLoading] = React.useState(true)
  const [searchTerm, setSearchTerm] = React.useState("")
  
  const [showCreateModal, setShowCreateModal] = React.useState(false)
  const [editingBeacon, setEditingBeacon] = React.useState<Beacon | null>(null)
  const [viewingBeacon, setViewingBeacon] = React.useState<Beacon | null>(null)
  const [deletingBeacon, setDeletingBeacon] = React.useState<Beacon | null>(null)
  
  const { toast } = useToast()

  // Cargar datos del backend
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [beaconsData, trabajadoresData, supervisoresData, vehiculosData] = await Promise.all([
          getBeacons(),
          getTrabajadores(),
          getSupervisores(),
          getVehiculos()
        ])
        setBeacons(beaconsData)
        setTrabajadores(trabajadoresData)
        setSupervisores(supervisoresData)
        setVehiculos(vehiculosData)
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Filtrar beacons por término de búsqueda
  const filteredBeacons = beacons.filter(beacon =>
    beacon.mac.toLowerCase().includes(searchTerm.toLowerCase()) ||
    beacon.id.toString().includes(searchTerm)
  )

  // Manejar creación de beacon
  const handleCreateBeacon = async (beaconData: CreateBeaconRequest) => {
    try {
      const newBeacon = await createBeacon(beaconData)
      if (newBeacon) {
        setBeacons(prev => [...prev, newBeacon])
        setShowCreateModal(false)
        toast({
          title: "Beacon Creado",
          description: `El beacon ${newBeacon.mac} ha sido creado exitosamente.`
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo crear el beacon.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error creating beacon:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error al crear el beacon.",
        variant: "destructive"
      })
    }
  }

  // Manejar actualización de beacon
  const handleUpdateBeacon = async (beaconId: number, beaconData: Partial<CreateBeaconRequest>) => {
    try {
      const updatedBeacon = await updateBeacon(beaconId, beaconData)
      if (updatedBeacon) {
        setBeacons(prev => prev.map(b => b.id === beaconId ? updatedBeacon : b))
        setEditingBeacon(null)
        toast({
          title: "Beacon Actualizado",
          description: `El beacon ${updatedBeacon.mac} ha sido actualizado.`
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar el beacon.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error updating beacon:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error al actualizar el beacon.",
        variant: "destructive"
      })
    }
  }

  // Manejar eliminación de beacon
  const handleDeleteBeacon = async (beaconId: number) => {
    try {
      const success = await deleteBeacon(beaconId)
      if (success) {
        setBeacons(prev => prev.filter(b => b.id !== beaconId))
        setDeletingBeacon(null)
        toast({
          title: "Beacon Eliminado",
          description: "El beacon ha sido eliminado exitosamente."
        })
      } else {
        toast({
          title: "Error",
          description: "No se pudo eliminar el beacon.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting beacon:', error)
      toast({
        title: "Error",
        description: "Ocurrió un error al eliminar el beacon.",
        variant: "destructive"
      })
    }
  }

  // Obtener información de asignación del beacon
  const getBeaconAssignment = (beacon: Beacon) => {
    if (beacon.empleado) {
      return { type: "Empleado", name: `${beacon.empleado.nombre} ${beacon.empleado.apellido}` || "N/A" }
    }
    if (beacon.supervisor) {
      return { type: "Supervisor", name: beacon.supervisor.fullName || "N/A" }
    }
    if (beacon.vehiculo) {
      return { type: "Vehículo", name: beacon.vehiculo.patente || "N/A" }
    }
    if (beacon.zona) {
      return { type: "Zona", name: beacon.zona.name || "N/A" }
    }
    return { type: "Sin asignar", name: "-" }
  }

  // Estadísticas
  const totalBeacons = beacons.length
  const beaconsAsignados = beacons.filter(b => b.empleado || b.supervisor || b.vehiculo || b.zona).length
  const beaconsSinAsignar = totalBeacons - beaconsAsignados
  const beaconsBateriaBaja = beacons.filter(b => b.bateria < 20).length

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Cargando beacons...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Beacons</h1>
          <p className="text-gray-600 mt-1">Administra los dispositivos beacon y sus asignaciones.</p>
        </div>
        <Button
          onClick={() => {
            setEditingBeacon(null)
            setShowCreateModal(true)
          }}
          className="flex items-center gap-2"
        >
          <PlusCircle size={16} />
          Nuevo Beacon
        </Button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <Bluetooth className="h-6 w-6 text-blue-500 mb-2" />
            <p className="text-sm text-gray-600">Total Beacons</p>
            <p className="text-2xl font-bold">{totalBeacons}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Wifi className="h-6 w-6 text-green-500 mb-2" />
            <p className="text-sm text-gray-600">Asignados</p>
            <p className="text-2xl font-bold">{beaconsAsignados}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <SlidersHorizontal className="h-6 w-6 text-orange-500 mb-2" />
            <p className="text-sm text-gray-600">Sin Asignar</p>
            <p className="text-2xl font-bold">{beaconsSinAsignar}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Battery className="h-6 w-6 text-red-500 mb-2" />
            <p className="text-sm text-gray-600">Batería Baja</p>
            <p className="text-2xl font-bold">{beaconsBateriaBaja}</p>
          </CardContent>
        </Card>
      </div>

      {/* Búsqueda y Lista */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Beacons</CardTitle>
          <CardDescription>Busca y gestiona los beacons registrados.</CardDescription>
          <div className="relative mt-4">
            <Input
              placeholder="Buscar por MAC o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    MAC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batería
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Asignación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBeacons.map((beacon) => {
                  const assignment = getBeaconAssignment(beacon)
                  return (
                    <tr key={beacon.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {beacon.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {beacon.mac}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Battery className={`h-4 w-4 mr-2 ${beacon.bateria < 20 ? 'text-red-500' : beacon.bateria < 50 ? 'text-yellow-500' : 'text-green-500'}`} />
                          <span className="text-sm text-gray-900">{beacon.bateria}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <Badge variant={assignment.type === "Sin asignar" ? "secondary" : "default"}>
                            {assignment.type}
                          </Badge>
                          {assignment.name !== "-" && (
                            <span className="text-xs text-gray-500 mt-1">{assignment.name}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button variant="outline" size="icon" onClick={() => setViewingBeacon(beacon)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => {
                            setEditingBeacon(beacon)
                            setShowCreateModal(true)
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="icon" onClick={() => setDeletingBeacon(beacon)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          {deletingBeacon && deletingBeacon.id === beacon.id && (
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente el beacon con MAC "{deletingBeacon.mac}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeletingBeacon(null)}>
                                  Cancelar
                                </AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteBeacon(deletingBeacon.id)}>
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          )}
                        </AlertDialog>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {filteredBeacons.length === 0 && (
            <p className="text-center text-gray-500 py-8">No se encontraron beacons.</p>
          )}
        </CardContent>
      </Card>

      {/* Modal para Crear/Editar Beacon */}
      <BeaconFormModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setEditingBeacon(null)
        }}
        onSubmit={editingBeacon ? 
          (data) => handleUpdateBeacon(editingBeacon.id, data) : 
          handleCreateBeacon
        }
        initialData={editingBeacon}
        title={editingBeacon ? "Editar Beacon" : "Crear Beacon"}
      />

      {/* Modal para Ver Detalles del Beacon */}
      <Dialog open={!!viewingBeacon} onOpenChange={(isOpen) => !isOpen && setViewingBeacon(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Beacon</DialogTitle>
          </DialogHeader>
          {viewingBeacon && <BeaconDetails beacon={viewingBeacon} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Componente para el formulario de beacon
interface BeaconFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateBeaconRequest) => void
  initialData?: Beacon | null
  title: string
}

function BeaconFormModal({ isOpen, onClose, onSubmit, initialData, title }: BeaconFormModalProps) {
  const [formData, setFormData] = React.useState<CreateBeaconRequest>({
    mac: "",
    bateria: 100
  })

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        mac: initialData.mac,
        bateria: initialData.bateria
      })
    } else {
      setFormData({
        mac: "",
        bateria: 100
      })
    }
  }, [initialData, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {initialData ? "Actualiza los datos del beacon." : "Completa el formulario para crear un nuevo beacon."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="mac" className="text-sm font-medium">MAC Address *</label>
            <Input
              id="mac"
              value={formData.mac}
              onChange={(e) => setFormData({ ...formData, mac: e.target.value })}
              placeholder="XX:XX:XX:XX:XX:XX"
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="bateria" className="text-sm font-medium">Batería (%) *</label>
            <Input
              id="bateria"
              type="number"
              min="0"
              max="100"
              value={formData.bateria}
              onChange={(e) => setFormData({ ...formData, bateria: parseInt(e.target.value) || 0 })}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {initialData ? "Actualizar" : "Crear"} Beacon
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// Componente para mostrar detalles del beacon
interface BeaconDetailsProps {
  beacon: Beacon
}

function BeaconDetails({ beacon }: BeaconDetailsProps) {
  const assignment = React.useMemo(() => {
    if (beacon.empleado) {
      return { type: "Empleado", name: `${beacon.empleado.nombre} ${beacon.empleado.apellido}` || "N/A", details: beacon.empleado }
    }
    if (beacon.supervisor) {
      return { type: "Supervisor", name: beacon.supervisor.fullName || "N/A", details: beacon.supervisor }
    }
    if (beacon.vehiculo) {
      return { type: "Vehículo", name: beacon.vehiculo.patente || "N/A", details: beacon.vehiculo }
    }
    if (beacon.zona) {
      return { type: "Zona", name: beacon.zona.name || "N/A", details: beacon.zona }
    }
    return { type: "Sin asignar", name: "-", details: null }
  }, [beacon])

  return (
    <div className="space-y-6 py-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Bluetooth className="h-6 w-6 text-blue-600" />
            <span>Beacon #{beacon.id}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">MAC Address</p>
              <p className="font-medium">{beacon.mac}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Batería</p>
              <div className="flex items-center gap-2">
                <Battery className={`h-4 w-4 ${beacon.bateria < 20 ? 'text-red-500' : beacon.bateria < 50 ? 'text-yellow-500' : 'text-green-500'}`} />
                <span className="font-medium">{beacon.bateria}%</span>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Asignación</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={assignment.type === "Sin asignar" ? "secondary" : "default"}>
                {assignment.type}
              </Badge>
              {assignment.name !== "-" && (
                <span className="text-sm text-gray-700">{assignment.name}</span>
              )}
            </div>
            {beacon.zona && (
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 font-medium">Información de la Zona:</p>
                <p className="text-sm text-gray-800 mt-1">{beacon.zona.info}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Coordenadas: {beacon.zona.coordinates.length} puntos definidos
                </p>
                {beacon.zona.lastVisited && (
                  <p className="text-xs text-gray-500">
                    Última visita: {new Date(beacon.zona.lastVisited).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
