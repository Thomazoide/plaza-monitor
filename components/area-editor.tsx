"use client"

import { useState } from "react"
import type { GreenArea } from "@/types/map-types"

interface AreaEditorProps {
  areas: GreenArea[]
  onAreaUpdate: (updatedArea: GreenArea) => void
}

export default function AreaEditor({ areas, onAreaUpdate }: AreaEditorProps) {
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null)

  const handleVisitUpdate = (areaId: number) => {
    const area = areas.find((a) => a.id === areaId)
    if (area) {
      const updatedArea = {
        ...area,
        lastVisited: new Date(),
      }
      onAreaUpdate(updatedArea)
    }
  }

  return (
    <div className="mt-4 p-4 bg-white rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-2">Actualizar Áreas Verdes</h2>
      <div className="space-y-2">
        {areas.map((area) => (
          <div key={area.id} className="flex items-center justify-between p-2 border rounded">
            <div>
              <h3 className="font-medium">{area.name}</h3>
              <p className="text-sm text-gray-600">Última visita: {area.lastVisited.toLocaleDateString()}</p>
            </div>
            <button
              onClick={() => handleVisitUpdate(area.id)}
              className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Marcar como visitado
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
