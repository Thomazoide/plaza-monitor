"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Edit, Trash2, Eye } from "lucide-react"
import type { Zona } from "@/types/escuadras-types"

interface ListaZonasProps {
  zonas: Zona[]
  onEdit: (zona: Zona) => void
  onDelete: (zona: Zona) => void
  onViewOnMap: (zona: Zona) => void
}

export function ListaZonas({ zonas, onEdit, onDelete, onViewOnMap }: ListaZonasProps) {
  if (zonas.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-4">No hay zonas definidas.</p>
  }

  return (
    <div className="space-y-3 max-h-[450px] overflow-y-auto">
      {zonas.map((zona) => (
        <div key={zona.id} className="p-3 border rounded-lg hover:shadow-sm transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-sm flex items-center">
                <MapPin size={14} className="mr-1.5 text-blue-600" />
                {zona.nombre}
              </h4>
              <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[180px]">
                {zona.descripcion || "Sin descripción"}
              </p>
            </div>
            <Badge
              variant={zona.activa ? "default" : "outline"}
              className={zona.activa ? "bg-green-100 text-green-800" : ""}
            >
              {zona.activa ? "Activa" : "Inactiva"}
            </Badge>
          </div>
          <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
            <Button variant="outline" size="xs" onClick={() => onViewOnMap(zona)} className="flex-1">
              <Eye size={12} className="mr-1" /> Ver
            </Button>
            <Button variant="outline" size="xs" onClick={() => onEdit(zona)} className="flex-1">
              <Edit size={12} className="mr-1" /> Editar
            </Button>
            <Button variant="destructive" size="xs" onClick={() => onDelete(zona)} className="flex-1">
              <Trash2 size={12} className="mr-1" /> Eliminar
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
