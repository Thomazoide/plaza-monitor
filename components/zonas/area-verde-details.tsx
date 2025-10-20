"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TreePine, Calendar, MapPin, Info, Edit } from "lucide-react"
import type { GreenArea } from "@/types/map-types"

interface AreaVerdeDetailsProps {
  area: GreenArea
  onClose: () => void
  onEdit?: () => void
  onUpdateLastVisited?: () => void
}

export function AreaVerdeDetails({ area, onClose, onEdit, onUpdateLastVisited }: AreaVerdeDetailsProps) {
  const getDaysSinceVisit = (lastVisited: Date | null) => {
    if (!lastVisited) return Infinity
    return Math.floor((Date.now() - lastVisited.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getVisitStatus = (daysSinceVisit: number) => {
    if (daysSinceVisit <= 7) return { status: "recent", color: "bg-green-100 text-green-800", label: "Visitada recientemente" }
    if (daysSinceVisit <= 30) return { status: "normal", color: "bg-blue-100 text-blue-800", label: "Estado normal" }
    return { status: "attention", color: "bg-orange-100 text-orange-800", label: "Requiere atención" }
  }

  const daysSinceVisit = getDaysSinceVisit(area.lastVisited)
  const visitStatus = getVisitStatus(Number.isFinite(daysSinceVisit) ? (daysSinceVisit as number) : 9999)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <TreePine className="h-6 w-6 text-green-600" />
            {area.name}
          </h2>
          <p className="text-gray-600 mt-1">{area.info}</p>
        </div>
        <Badge className={visitStatus.color}>
          {visitStatus.label}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Última Visita
            </CardTitle>
          </CardHeader>
          <CardContent>
            {area.lastVisited ? (
              <>
                <p className="text-sm text-gray-600">{formatDate(area.lastVisited)}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {daysSinceVisit === 0
                    ? "Visitada hoy"
                    : daysSinceVisit === 1
                      ? "Hace 1 día"
                      : `Hace ${daysSinceVisit} días`}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-600">Sin visitas registradas</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-600" />
              Ubicación
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              {area.coordinates.length} puntos de coordenadas
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Centro aproximado: {area.coordinates[0]?.lat.toFixed(6)}, {area.coordinates[0]?.lng.toFixed(6)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-orange-600" />
            Información Adicional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700">{area.info}</p>
          <div className="mt-2 text-sm">
            <span className="font-medium">Dispositivo BLE:</span>{" "}
            {area.beaconId ? `Asignado (ID ${area.beaconId})` : "No asignado"}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3 pt-4 border-t">
        {onEdit && (
        <Button onClick={onEdit} className="flex-1">
          <Edit className="h-4 w-4 mr-2" />
          Editar
        </Button>
        )}
        {onUpdateLastVisited && (
        <Button onClick={onUpdateLastVisited} variant="secondary" className="flex-1">
          Marcar como visitada
        </Button>
        )}
        <Button variant="outline" onClick={onClose} className="flex-1">
          Cerrar
        </Button>
      </div>
    </div>
  )
}
