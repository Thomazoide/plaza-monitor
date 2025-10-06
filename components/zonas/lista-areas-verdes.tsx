"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TreePine, Eye, Info, MapPin, Calendar } from "lucide-react"
import type { GreenArea } from "@/types/map-types"

interface ListaAreasVerdesProps {
  areasVerdes: GreenArea[]
  onViewOnMap: (area: GreenArea) => void
  onShowDetails: (area: GreenArea) => void
  onUpdateLastVisited: (areaId: number) => void
}

export function ListaAreasVerdes({ areasVerdes, onViewOnMap, onShowDetails, onUpdateLastVisited }: ListaAreasVerdesProps) {
  if (areasVerdes.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-4">No hay áreas verdes registradas.</p>
  }

  const getDaysSinceVisit = (lastVisited: Date | null) => {
    if (!lastVisited) return Infinity
    return Math.floor((Date.now() - lastVisited.getTime()) / (1000 * 60 * 60 * 24))
  }

  const getVisitStatus = (daysSinceVisit: number) => {
    if (daysSinceVisit <= 7) return { status: "recent", color: "bg-green-100 text-green-800", label: "Reciente" }
    if (daysSinceVisit <= 30) return { status: "normal", color: "bg-blue-100 text-blue-800", label: "Normal" }
    return { status: "attention", color: "bg-orange-100 text-orange-800", label: "Atención" }
  }

  return (
    <div className="space-y-3 max-h-[450px] overflow-y-auto">
      {areasVerdes.map((area) => {
  const daysSinceVisit = getDaysSinceVisit(area.lastVisited)
        const visitStatus = getVisitStatus(daysSinceVisit)
        
        return (
          <div key={area.id} className="p-3 border rounded-lg hover:shadow-sm transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-sm flex items-center">
                  <TreePine size={14} className="mr-1.5 text-green-600" />
                  {area.name}
                </h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {area.info}
                </p>
              </div>
              <Badge className={visitStatus.color}>
                {visitStatus.label}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <Calendar size={12} />
              <span>
                {Number.isFinite(daysSinceVisit)
                  ? daysSinceVisit === 0
                    ? "Visitada hoy"
                    : daysSinceVisit === 1
                      ? "Hace 1 día"
                      : `Hace ${daysSinceVisit} días`
                  : "Sin visitas registradas"}
              </span>
            </div>
            
            <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
              <Button variant="outline" size="sm" onClick={() => onViewOnMap(area)} className="flex-1">
                <MapPin size={12} className="mr-1" /> Ubicar
              </Button>
              <Button variant="outline" size="sm" onClick={() => onShowDetails(area)} className="flex-1">
                <Info size={12} className="mr-1" /> Detalles
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onUpdateLastVisited(area.id)} 
                className="flex-1"
              >
                <Eye size={12} className="mr-1" /> Visitada
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
