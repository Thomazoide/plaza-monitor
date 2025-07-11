"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VehicleTrackingMap } from "@/components/tracking/vehicle-tracking-map"
import { ArrowLeft, Edit, MapPin, Users, Car, Calendar, Phone, Mail, Shield } from "lucide-react"
import { trabajadores } from "@/data/escuadras-data"
import type { Equipo } from "@/types/escuadras-types"

interface EquipoDetailsProps {
  equipo: Equipo
  onBack: () => void
}

export function EquipoDetails({ equipo, onBack }: EquipoDetailsProps) {
  const [activeTab, setActiveTab] = useState("general")

  // Obtener trabajadores asignados a este equipo
  const trabajadoresEquipo = trabajadores.filter((t) => t.equipoId === equipo.id)

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a la lista
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{equipo.nombre}</h1>
            <p className="text-gray-600">Detalles y gestión del equipo</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={equipo.estado === "activo" ? "default" : "secondary"}>{equipo.estado}</Badge>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Información General</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="vehiculo">Vehículo</TabsTrigger>
          <TabsTrigger value="seguimiento" disabled={!equipo.vehiculo}>
            Seguimiento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Información del Equipo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Nombre</Label>
                  <p className="text-lg font-semibold">{equipo.nombre}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Estado</Label>
                  <div className="mt-1">
                    <Badge variant={equipo.estado === "activo" ? "default" : "secondary"}>{equipo.estado}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Fecha de Creación</Label>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {equipo.fechaCreacion.toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Zona de Trabajo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Zona Asignada</Label>
                  <p className="text-lg font-semibold">{equipo.zona?.nombre ?? "Sin zona asignada"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="personal" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Supervisor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Supervisor
                </CardTitle>
              </CardHeader>
              <CardContent>
                {equipo.supervisor ? (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Nombre Completo</Label>
                      <p className="font-semibold">
                        {equipo.supervisor.nombre} {equipo.supervisor.apellido}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">RUT</Label>
                      <p>{equipo.supervisor.rut}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Teléfono</Label>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {equipo.supervisor.telefono}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Email</Label>
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {equipo.supervisor.email}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Fecha de Ingreso</Label>
                      <p>{equipo.supervisor.fechaIngreso.toLocaleDateString()}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Sin supervisor asignado</p>
                )}
              </CardContent>
            </Card>

            {/* Trabajadores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Trabajadores ({trabajadoresEquipo.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trabajadoresEquipo.length > 0 ? (
                  <div className="space-y-4">
                    {trabajadoresEquipo.map((trabajador) => (
                      <div key={trabajador.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold">
                            {trabajador.nombre} {trabajador.apellido}
                          </p>
                          <Badge variant="outline">{trabajador.estado}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{trabajador.rut}</p>
                        <p className="text-sm text-gray-600">{trabajador.telefono}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Sin trabajadores asignados</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vehiculo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Vehículo Asignado
              </CardTitle>
            </CardHeader>
            <CardContent>
              {equipo.vehiculo ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Patente</Label>
                      <p className="text-lg font-semibold">{equipo.vehiculo.patente}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Marca y Modelo</Label>
                      <p className="font-semibold">
                        {equipo.vehiculo.marca} {equipo.vehiculo.modelo}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Año</Label>
                      <p>{equipo.vehiculo.año}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Tipo</Label>
                      <p className="capitalize">{equipo.vehiculo.tipo}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Estado</Label>
                      <Badge variant={equipo.vehiculo.estado === "en_uso" ? "default" : "secondary"}>
                        {equipo.vehiculo.estado}
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Sin vehículo asignado</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguimiento" className="space-y-6">
          {equipo.vehiculo ? (
            <Card>
              <CardHeader>
                <CardTitle>Seguimiento en Tiempo Real</CardTitle>
                <CardDescription>Ubicación y estado actual del vehículo {equipo.vehiculo.patente}</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[600px]">
                  <VehicleTrackingMap />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sin vehículo asignado</h3>
                <p className="text-gray-500">Este equipo no tiene un vehículo asignado para realizar seguimiento.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}
