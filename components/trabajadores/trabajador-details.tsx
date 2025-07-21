"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Phone, CalendarDays, CheckCircle, XCircle } from "lucide-react"
import type { Trabajador, Equipo } from "@/types/escuadras-types"

interface TrabajadorDetailsProps {
  trabajador: Trabajador
  equipos: Equipo[]
}

export function TrabajadorDetails({ trabajador, equipos }: TrabajadorDetailsProps) {
  const getEquipoNombre = (equipoId?: number) => {
    if (!equipoId) return "No asignado"
    const equipo = equipos.find((e) => e.id === equipoId)
    return equipo ? equipo.nombre : "Equipo desconocido"
  }

  return (
    <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-600" />
            <span>
              {trabajador.nombre} {trabajador.apellido}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-600">RUT:</span>
            <span className="text-gray-800">{trabajador.rut}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-600">Estado:</span>
            <Badge
              variant={trabajador.activo ? "default" : "destructive"}
              className={`flex items-center gap-1 ${trabajador.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {trabajador.activo ? <CheckCircle size={14} /> : <XCircle size={14} />}
              {trabajador.activo ? "Activo" : "Inactivo"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Phone className="h-4 w-4 text-gray-500" /> Contacto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Email:</span>
            <a href={`mailto:${trabajador.email}`} className="text-sm text-blue-600 hover:underline">
              {trabajador.email}
            </a>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Teléfono:</span>
            <span className="text-sm text-gray-800">{trabajador.telefono}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-gray-500" /> Información Laboral
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Fecha de Ingreso:</span>
            <span className="text-sm text-gray-800">
              {new Date(trabajador.fechaIngreso).toLocaleDateString("es-CL")}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Equipo Asignado:</span>
            <Badge variant="secondary">{getEquipoNombre(trabajador.equipoId)}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
