"use client"

import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CreateEquipoForm } from "./create-equipo-form"
import { EquipoDetails } from "./equipo-details"
import { equipos, supervisores, vehiculos } from "@/data/escuadras-data"
import { Shield, Users, Car, MapPin, Plus, Search, Eye } from "lucide-react"
import type { Equipo } from "@/types/escuadras-types"

export function EquiposPage() {
  const [selectedEquipo, setSelectedEquipo] = useState<Equipo | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredEquipos = equipos.filter(
    (equipo) =>
      equipo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipo.zona?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipo.supervisor?.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipo.supervisor?.apellido.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Estadísticas
  const equiposActivos = equipos.filter((e) => e.estado === "activo").length
  const supervisoresDisponibles = supervisores.filter(
    (s) => s.estado === "activo" && !equipos.some((e) => e.supervisor?.id === s.id),
  ).length
  const vehiculosDisponibles = vehiculos.filter(
    (v) => v.estado === "disponible" && !equipos.some((e) => e.vehiculo?.id === v.id),
  ).length
  const zonasDisponibles = ["Zona Norte", "Zona Sur", "Zona Centro", "Zona Este", "Zona Oeste"].filter(
    (zona) => !equipos.some((e) => e.zona === zona),
  ).length

  const handleViewDetails = (equipo: Equipo) => {
    setSelectedEquipo(equipo)
    setShowCreateForm(false)
  }

  const handleCreateNew = () => {
    setShowCreateForm(true)
    setSelectedEquipo(null)
  }

  const handleBackToList = () => {
    setShowCreateForm(false)
    setSelectedEquipo(null)
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-100">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="flex flex-col h-full">
            <header className="bg-white shadow-sm p-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Gestión de Equipos</h1>
                  <p className="text-gray-600">Administra los equipos de trabajo y sus asignaciones</p>
                </div>
                <Button onClick={handleCreateNew} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Crear Equipo
                </Button>
              </div>
            </header>

            <main className="flex-1 overflow-auto p-6">
              {showCreateForm ? (
                <CreateEquipoForm onBack={handleBackToList} />
              ) : selectedEquipo ? (
                <EquipoDetails equipo={selectedEquipo} onBack={handleBackToList} />
              ) : (
                <div className="space-y-6">
                  {/* Estadísticas */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Equipos Activos</p>
                            <p className="text-2xl font-bold">{equiposActivos}</p>
                          </div>
                          <Shield className="h-8 w-8 text-blue-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Supervisores Disponibles</p>
                            <p className="text-2xl font-bold">{supervisoresDisponibles}</p>
                          </div>
                          <Users className="h-8 w-8 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Vehículos Disponibles</p>
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
                            <p className="text-sm text-gray-600">Zonas Disponibles</p>
                            <p className="text-2xl font-bold">{zonasDisponibles}</p>
                          </div>
                          <MapPin className="h-8 w-8 text-purple-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Búsqueda y Lista */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Lista de Equipos</CardTitle>
                          <CardDescription>Gestiona y visualiza todos los equipos de trabajo</CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                              placeholder="Buscar equipos..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10 w-64"
                            />
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredEquipos.map((equipo) => (
                          <Card key={equipo.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div>
                                  <h3 className="font-semibold text-lg">{equipo.nombre}</h3>
                                  <Badge
                                    variant={equipo.estado === "activo" ? "default" : "secondary"}
                                    className="mt-1"
                                  >
                                    {equipo.estado}
                                  </Badge>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewDetails(equipo)}
                                  className="flex items-center gap-1"
                                >
                                  <Eye className="h-3 w-3" />
                                  Ver
                                </Button>
                              </div>

                              <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-gray-400" />
                                  <span>
                                    {equipo.supervisor
                                      ? `${equipo.supervisor.nombre} ${equipo.supervisor.apellido}`
                                      : "Sin supervisor"}
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-gray-400" />
                                  <span>{equipo.zona || "Sin zona asignada"}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Car className="h-4 w-4 text-gray-400" />
                                  <span>
                                    {equipo.vehiculo
                                      ? `${equipo.vehiculo.marca} ${equipo.vehiculo.modelo} (${equipo.vehiculo.patente})`
                                      : "Sin vehículo"}
                                  </span>
                                </div>
                              </div>

                              <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                                Creado: {equipo.fechaCreacion.toLocaleDateString()}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>

                      {filteredEquipos.length === 0 && (
                        <div className="text-center py-8">
                          <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron equipos</h3>
                          <p className="text-gray-500 mb-4">
                            {searchTerm
                              ? "No hay equipos que coincidan con tu búsqueda."
                              : "Aún no hay equipos creados."}
                          </p>
                          {!searchTerm && (
                            <Button onClick={handleCreateNew}>
                              <Plus className="h-4 w-4 mr-2" />
                              Crear primer equipo
                            </Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default EquiposPage
