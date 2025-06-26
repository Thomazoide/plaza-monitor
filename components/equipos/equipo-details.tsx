"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Users, MapPin, Car, Calendar, Phone, Mail, Fuel, Wrench } from "lucide-react"
import type { Equipo } from "@/types/escuadras-types"
import { VehicleTrackingMap } from "../tracking/vehicle-tracking-map"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface EquipoDetailsProps {
  equipo: Equipo
}

export function EquipoDetails({ equipo }: EquipoDetailsProps) {
  const [showTracking, setShowTracking] = useState(false)

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

  const getVehicleStatusColor = (estado: string) => {
    switch (estado) {
      case "disponible":
        return "bg-green-100 text-green-800"
      case "en_uso":
        return "bg-blue-100 text-blue-800"
      case "mantenimiento":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getVehicleStatusText = (estado: string) => {
    switch (estado) {
      case "disponible":
        return "Disponible"
      case "en_uso":
        return "En uso"
      case "mantenimiento":
        return "Mantenimiento"
      default:
        return "Desconocido"
    }
  }

  const getFuelColor = (combustible: number) => {
    if (combustible >= 70) return "text-green-600"
    if (combustible >= 30) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className="space-y-6 h-screen overflow-auto">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{equipo.nombre}</h2>
          {equipo.descripcion && <p className="text-gray-600 mt-1">{equipo.descripcion}</p>}
        </div>
        <Badge className={getStatusColor(equipo)}>{getStatusText(equipo)}</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Información General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Información General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">Fecha de creación:</span>
              <p className="text-gray-600">{equipo.fechaCreacion.toLocaleDateString("es-CL")}</p>
            </div>
            <div>
              <span className="font-medium">Estado:</span>
              <p className="text-gray-600">{getStatusText(equipo)}</p>
            </div>
            <div>
              <span className="font-medium">Personal asignado:</span>
              <p className="text-gray-600">
                {equipo.trabajadores.length + 1} personas (1 supervisor + {equipo.trabajadores.length} trabajadores)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Supervisor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Supervisor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">Nombre:</span>
              <p className="text-gray-600">
                {equipo.supervisor.nombre} {equipo.supervisor.apellido}
              </p>
            </div>
            <div>
              <span className="font-medium">RUT:</span>
              <p className="text-gray-600">{equipo.supervisor.rut}</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{equipo.supervisor.telefono}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">{equipo.supervisor.email}</span>
            </div>
            <div>
              <span className="font-medium">Experiencia:</span>
              <p className="text-gray-600">{equipo.supervisor.experiencia} años</p>
            </div>
          </CardContent>
        </Card>

        {/* Trabajadores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Trabajadores ({equipo.trabajadores.length}/4)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {equipo.trabajadores.length > 0 ? (
              <div className="space-y-3">
                {equipo.trabajadores.map((trabajador, index) => (
                  <div key={trabajador.id}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {trabajador.nombre} {trabajador.apellido}
                        </p>
                        <p className="text-sm text-gray-600">{trabajador.rut}</p>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-600">{trabajador.telefono}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < equipo.trabajadores.length - 1 && <Separator className="mt-3" />}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No hay trabajadores asignados</p>
            )}
          </CardContent>
        </Card>

        {/* Zona Asignada */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Zona Asignada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">Nombre:</span>
              <p className="text-gray-600">{equipo.zona.nombre}</p>
            </div>
            <div>
              <span className="font-medium">Descripción:</span>
              <p className="text-gray-600">{equipo.zona.descripcion}</p>
            </div>
            <div>
              <span className="font-medium">Estado:</span>
              <Badge className={equipo.zona.activa ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {equipo.zona.activa ? "Activa" : "Inactiva"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Vehículo Asignado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Vehículo Asignado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <span className="font-medium">Vehículo:</span>
              <p className="text-gray-600">
                {equipo.vehiculo.marca} {equipo.vehiculo.modelo} ({equipo.vehiculo.año})
              </p>
            </div>
            <div>
              <span className="font-medium">Patente:</span>
              <p className="text-gray-600 font-mono">{equipo.vehiculo.patente}</p>
            </div>
            <div>
              <span className="font-medium">Tipo:</span>
              <p className="text-gray-600 capitalize">{equipo.vehiculo.tipo}</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Estado:</span>
              <Badge className={getVehicleStatusColor(equipo.vehiculo.estado)}>
                {getVehicleStatusText(equipo.vehiculo.estado)}
              </Badge>
            </div>
            <div className="mt-3">
              <Button
                onClick={() => setShowTracking(!showTracking)}
                className="w-full flex items-center justify-center gap-2"
                variant={showTracking ? "secondary" : "default"}
              >
                <MapPin size={16} />
                {showTracking ? "Ocultar Seguimiento" : "Ver Seguimiento en Tiempo Real"}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Fuel className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Combustible:</span>
              <span className={`font-bold ${getFuelColor(equipo.vehiculo.combustible)}`}>
                {equipo.vehiculo.combustible}%
              </span>
            </div>
            {equipo.vehiculo.estado === "mantenimiento" && (
              <div className="flex items-center gap-2 p-2 bg-red-50 rounded-md">
                <Wrench className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-700">Vehículo en mantenimiento</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Tracking del Vehículo */}
      {showTracking && (
        <div className="md:col-span-2">
          <VehicleTrackingMap vehiculo={equipo.vehiculo} />
        </div>
      )}
    </div>
  )
}
