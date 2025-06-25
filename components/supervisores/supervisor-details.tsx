"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserCheck, Phone, CheckCircle, XCircle, Award, Briefcase } from "lucide-react"
import type { Supervisor, Escuadra } from "@/types/escuadras-types"

interface SupervisorDetailsProps {
  supervisor: Supervisor
  escuadras: Escuadra[]
}

export function SupervisorDetails({ supervisor, escuadras }: SupervisorDetailsProps) {
  const escuadraAsignada = escuadras.find((e) => e.supervisor.id === supervisor.id && e.activa)

  return (
    <div className="space-y-6 py-4 max-h-[70vh] overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <UserCheck className="h-6 w-6 text-blue-600" />
            <span>
              {supervisor.nombre} {supervisor.apellido}
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
              variant={supervisor.activo ? "default" : "destructive"}
              className={`flex items-center gap-1 ${supervisor.activo ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {supervisor.activo ? <CheckCircle size={14} /> : <XCircle size={14} />}
              {supervisor.activo ? "Activo" : "Inactivo"}
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
            <a href={`mailto:${supervisor.email}`} className="text-sm text-blue-600 hover:underline">
              {supervisor.email}
            </a>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Teléfono:</span>
            <span className="text-sm text-gray-800">{supervisor.telefono}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Award className="h-4 w-4 text-gray-500" /> Información Profesional
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Fecha de Ingreso:</span>
            <span className="text-sm text-gray-800">
              {new Date(supervisor.fechaIngreso).toLocaleDateString("es-CL")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Años de Experiencia:</span>
            <span className="text-sm text-gray-800">{supervisor.experiencia} años</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-gray-500" /> Asignación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Escuadra Asignada:</span>
            <Badge variant="secondary">{escuadraAsignada ? escuadraAsignada.nombre : "No asignado"}</Badge>
          </div>
          {escuadraAsignada && (
            <p className="text-xs text-gray-500 mt-1">
              Lidera la escuadra "{escuadraAsignada.nombre}" en la zona "{escuadraAsignada.zona.nombre}".
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
