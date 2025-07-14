"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserCheck, Phone, CheckCircle, Briefcase } from "lucide-react"
import type { Supervisor, Equipo } from "@/types/escuadras-types"

interface SupervisorDetailsProps {
  supervisor: Supervisor
  equipos: Equipo[]
}

export function SupervisorDetails({ supervisor, equipos }: SupervisorDetailsProps) {
  const equipoAsignado = equipos.find((e) => e.supervisorID === supervisor.id)

  return (
    <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <UserCheck className="h-6 w-6 text-blue-600" />
            <span>
              {supervisor.fullName}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-600">RUT:</span>
            <span className="text-gray-800">{supervisor.rut}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-600">Estado:</span>
            <Badge
              variant="default"
              className="flex items-center gap-1 bg-green-100 text-green-800"
            >
              <CheckCircle size={14} />
              Activo
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-600">Email:</span>
            <span className="text-gray-800">{supervisor.email}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Phone className="h-6 w-6 text-green-600" />
            Información de Contacto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-600">Teléfono:</span>
            <span className="text-sm text-gray-800">{supervisor.celular}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Briefcase className="h-6 w-6 text-purple-600" />
            Asignación de Equipo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-600">Equipo asignado:</span>
            <Badge variant="secondary">{equipoAsignado ? equipoAsignado.nombre : "No asignado"}</Badge>
          </div>
          {equipoAsignado && (
            <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
              Supervisa el equipo "{equipoAsignado.nombre}".
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
