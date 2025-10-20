"use client"

import { useEffect, useState } from "react"
import { TreePine, List, Calendar, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { fetchGreenAreas } from "@/data/zonas-data"
import type { GreenArea } from "@/types/map-types"
import { MapaAreasVerdes } from "./mapa-areas-verdes"
import { ListaAreasVerdes } from "./lista-areas-verdes"
import { AreaVerdeDetails } from "./area-verde-details"

export function AreasVerdesPageContent() {
  const [areasVerdes, setAreasVerdes] = useState<GreenArea[]>([])
  const [selectedArea, setSelectedArea] = useState<GreenArea | null>(null)
  const [showAreaDetails, setShowAreaDetails] = useState(false)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: -33.6119, lng: -70.5758 }) // Centro de Puente Alto
  const [mapZoom, setMapZoom] = useState<number>(13)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError(null)
      const data = await fetchGreenAreas()
      if (cancelled) return
      setAreasVerdes(data)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [])

  // util sencillo para hallar centro aproximado del polígono
  function getPolygonCenter(coords: { lat: number; lng: number }[]) {
    const { latSum, lngSum } = coords.reduce((acc, c) => ({ latSum: acc.latSum + c.lat, lngSum: acc.lngSum + c.lng }), {
      latSum: 0,
      lngSum: 0,
    })
    return {
      lat: latSum / coords.length,
      lng: lngSum / coords.length,
    }
  }

  const handleViewAreaOnMap = (area: GreenArea) => {
    if (area.coordinates.length > 0) {
      const center = getPolygonCenter(area.coordinates)
      setMapCenter(center)
      setMapZoom(15)
    }
    setSelectedArea(area)
  }

  const handleShowAreaDetails = (area: GreenArea) => {
    setSelectedArea(area)
    setShowAreaDetails(true)
  }

  const handleUpdateLastVisited = (areaId: number) => {
    setAreasVerdes(
      areasVerdes.map((area) =>
        area.id === areaId
          ? { ...area, lastVisited: new Date() }
          : area
      )
    )
  }

  // Estadísticas
  const totalAreas = areasVerdes.length
  const areasRecentesVisitadas = areasVerdes.filter(area => {
    if (!area.lastVisited) return false
    const daysSinceVisit = Math.floor((Date.now() - area.lastVisited.getTime()) / (1000 * 60 * 60 * 24))
    return daysSinceVisit <= 7
  }).length
  const areasSinVisitar = areasVerdes.filter(area => {
    if (!area.lastVisited) return true
    const daysSinceVisit = Math.floor((Date.now() - area.lastVisited.getTime()) / (1000 * 60 * 60 * 24))
    return daysSinceVisit > 30
  }).length

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Áreas Verdes</h1>
          <p className="text-gray-600 mt-1">Visualiza y gestiona las áreas verdes de la comuna.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <TreePine className="h-6 w-6 text-green-500 mb-2" />
            <p className="text-sm text-gray-600">Total de Áreas</p>
            <p className="text-2xl font-bold">{totalAreas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Calendar className="h-6 w-6 text-blue-500 mb-2" />
            <p className="text-sm text-gray-600">Visitadas esta semana</p>
            <p className="text-2xl font-bold">{areasRecentesVisitadas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Info className="h-6 w-6 text-orange-500 mb-2" />
            <p className="text-sm text-gray-600">Requieren atención</p>
            <p className="text-2xl font-bold">{areasSinVisitar}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Mapa de Áreas Verdes</CardTitle>
              <CardDescription>
                Visualiza la ubicación de todas las áreas verdes de la comuna. Haz clic en una área para ver más detalles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MapaAreasVerdes
                areasVerdes={areasVerdes}
                selectedAreaId={selectedArea?.id}
                center={mapCenter}
                zoom={mapZoom}
                onAreaClick={handleShowAreaDetails}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List size={20} />
                Listado de Áreas Verdes
              </CardTitle>
              <CardDescription>Todas las áreas verdes registradas.</CardDescription>
            </CardHeader>
            <CardContent>
              <ListaAreasVerdes
                areasVerdes={areasVerdes}
                onViewOnMap={handleViewAreaOnMap}
                onShowDetails={handleShowAreaDetails}
                onUpdateLastVisited={handleUpdateLastVisited}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showAreaDetails} onOpenChange={setShowAreaDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Área Verde</DialogTitle>
            <DialogDescription>
              Información detallada sobre el área verde seleccionada.
            </DialogDescription>
          </DialogHeader>
          {selectedArea && (
            <AreaVerdeDetails
              area={selectedArea}
              onClose={() => setShowAreaDetails(false)}
              onUpdateLastVisited={() => handleUpdateLastVisited(selectedArea.id)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
