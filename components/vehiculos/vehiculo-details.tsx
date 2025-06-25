"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Car, Wrench, MapPin, CheckCircle, AlertTriangle, Shield } from "lucide-react"
import type { Vehiculo } from "@/types/escuadras-types"
import { VehicleTrackingMap } from "@/components/tracking/vehicle-tracking-map"
import { escuadras } from "@/data/escuadras-data"

interface VehiculoDetailsProps {
  vehiculo: Vehiculo
}

export function VehiculoDetails({ vehiculo }: VehiculoDetailsProps) {
  const [showTracking, setShowTracking] = useState(false)

  const getStatusBadge = (estado: Vehiculo["estado"]) => {
    switch (estado) {
      case "disponible":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle size={14} className="mr-1" />
            Disponible
          </Badge>
        )
      case "en_uso":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Car size={14} className="mr-1" />
            En Uso
          </Badge>
        )
      case "mantenimiento":
        return (
          <Badge className="bg-orange-100 text-orange-800">
            <Wrench size={14} className="mr-1" />
            Mantenimiento
          </Badge>
        )
      default:
        return <Badge variant="secondary">Desconocido</Badge>
    }
  }

  const getFuelColor = (combustible: number) => {
    if (combustible >= 70) return "text-green-600"
    if (combustible >= 30) return "text-yellow-600"
    return "text-red-600"
  }

  const escuadraAsignada = escuadras.find((e) => e.vehiculo.id === vehiculo.id && e.activa)

  return (
    <div className="space-y-6 py-4 max-h-[80vh] overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Car className="h-6 w-6 text-blue-600" />
              <span>
                {vehiculo.marca} {vehiculo.modelo} ({vehiculo.año})
              </span>
            </div>
            <Badge variant="outline" className="font-mono">
              {vehiculo.patente}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Tipo</p>
              <p className="capitalize">{vehiculo.tipo}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Estado</p>
              {getStatusBadge(vehiculo.estado)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Nivel de Combustible</p>
              <p className={`font-semibold ${getFuelColor(vehiculo.combustible)}`}>{vehiculo.combustible}%</p>
            </div>
            {vehiculo.estado === "en_uso" && escuadraAsignada && (
              <div>
                <p className="text-sm font-medium text-gray-500">Asignado a Escuadra</p>
                <div className="flex items-center gap-1">
                  <Shield size={14} className="text-purple-600" />
                  <span className="text-purple-700 font-medium">{escuadraAsignada.nombre}</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold flex items-center justify-between">
            <span>Seguimiento en Tiempo Real</span>
            <Button
              onClick={() => setShowTracking(!showTracking)}
              variant={showTracking ? "secondary" : "default"}
              size="sm"
              className="flex items-center gap-1"
            >
              <MapPin size={14} />
              {showTracking ? "Ocultar Mapa" : "Mostrar Mapa"}
            </Button>
          </CardTitle>
        </CardHeader>
        {showTracking && (
          <CardContent>
            {vehiculo.estado === "mantenimiento" ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-center">
                <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-yellow-700 font-medium">Vehículo en mantenimiento.</p>
                <p className="text-sm text-yellow-600">El seguimiento en tiempo real no está disponible.</p>
              </div>
            ) : (
              <VehicleTrackingMap vehiculo={vehiculo} />
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}
