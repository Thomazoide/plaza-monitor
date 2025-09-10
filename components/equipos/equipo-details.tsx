"use client"

import React, { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label as UILabel } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EquipoTrackingMap, type EquipoTrackingMapRef } from "./equipo-tracking-map"
import { ArrowLeft, Edit, MapPin, Users, Car, Calendar, Phone, Mail, Shield } from "lucide-react"
import { getTrabajadores } from "@/data/escuadras-data"
import type { Equipo } from "@/types/escuadras-types"
// tracking UI simplificado, la lógica de tiempo real vive en EquipoTrackingMap
import { formatDateTime } from "@/utils/format"

interface EquipoDetailsProps {
  equipo: Equipo
  onBack: () => void
}

export function EquipoDetails({ equipo, onBack }: EquipoDetailsProps) {
  const [activeTab, setActiveTab] = useState("general")
  const [trabajadoresEquipo, setTrabajadoresEquipo] = useState<any[]>([])
  const [lastTimestamp, setLastTimestamp] = useState<Date | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const mapRef = useRef<EquipoTrackingMapRef | null>(null)

  // Obtener trabajadores asignados a este equipo
  useEffect(() => {
    const loadTrabajadores = async () => {
      const trabajadores = getTrabajadores()
      const trabajadoresDelEquipo = trabajadores.filter((t) => t.equipoId === equipo.id)
      setTrabajadoresEquipo(trabajadoresDelEquipo)
    }
    loadTrabajadores()
  }, [equipo.id])

  // Tracking en tiempo real manejado dentro del componente EquipoTrackingMap (cada 5s)

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
                    <Badge variant={equipo.activa ? "default" : "secondary"}>{equipo.activa ? "Activo" : "Inactivo"}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Fecha de Creación</Label>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {equipo.fechaCreacion?.toLocaleDateString('es-CL', { 
                      timeZone: 'America/Santiago',
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    }) || "No especificado"}
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
                  <p className="text-lg font-semibold">Zona asignada</p>
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
                        {equipo.supervisor.fullName}
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
                        {equipo.supervisor.celular}
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
                      <p>No especificado</p>
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
                          <Badge variant="outline">{trabajador.activo ? "Activo" : "Inactivo"}</Badge>
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
                      <UILabel className="text-sm font-medium text-gray-500">Último reporte</UILabel>
                      <p>{equipo.vehiculo.timestamp ? formatDateTime(equipo.vehiculo.timestamp) : "No disponible"}</p>
                    </div>
                    <div>
                      <UILabel className="text-sm font-medium text-gray-500">Ubicación</UILabel>
                      <p>
                        {equipo.vehiculo.latitud && equipo.vehiculo.longitud 
                          ? `${equipo.vehiculo.latitud.toFixed(6)}, ${equipo.vehiculo.longitud.toFixed(6)}`
                          : "No disponible"}
                      </p>
                    </div>
                    <div>
                      <UILabel className="text-sm font-medium text-gray-500">Estado</UILabel>
                      <Badge variant={equipo.vehiculo.velocidad > 0 ? "default" : "secondary"}>
                        {equipo.vehiculo.velocidad > 0 ? "En movimiento" : "Detenido"}
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[600px]">
              <div className="md:col-span-3 h-full">
                <EquipoTrackingMap
                  ref={mapRef}
                  equipo={equipo}
                  onTrackingUpdate={({ lastUpdate, timestamp }) => {
                    setLastUpdate(lastUpdate)
                    setLastTimestamp(timestamp)
                  }}
                />
              </div>
              <div className="md:col-span-1 h-full">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>Estado de Seguimiento</CardTitle>
                    <CardDescription>Controles y últimos datos</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <UILabel className="text-sm font-medium text-gray-500">Última actualización</UILabel>
                      <p className="text-sm">{lastUpdate ? formatDateTime(lastUpdate) : "—"}</p>
                    </div>
                    <div>
                      <UILabel className="text-sm font-medium text-gray-500">Timestamp del vehículo</UILabel>
                      <p className="text-sm">{lastTimestamp ? formatDateTime(lastTimestamp) : "—"}</p>
                    </div>
                    <Button onClick={() => mapRef.current?.center()} className="w-full">Centrar</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
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
