"use client"

import { useState, useEffect } from "react"
import { MapPin, List } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { getZonas } from "@/data/zonas-data"
import type { Zona } from "@/types/escuadras-types"
import { MapaZonas } from "./mapa-zonas"
import { ZonaForm } from "./zona-form"
import { ListaZonas } from "./lista-zonas"

export function ZonasPageContent() {
  const [zonas, setZonas] = useState<Zona[]>([])
  const [selectedZona, setSelectedZona] = useState<Zona | null>(null)
  const [zonaToEdit, setZonaToEdit] = useState<Zona | null>(null)
  const [showZonaForm, setShowZonaForm] = useState(false)
  const [zonaToDelete, setZonaToDelete] = useState<Zona | null>(null)
  const [drawingCoords, setDrawingCoords] = useState<{ lat: number; lng: number }[] | null>(null)
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: -33.6119, lng: -70.5758 }) // Centro de Puente Alto
  const [mapZoom, setMapZoom] = useState<number>(13)

  // Cargar zonas desde el backend al montar
  useEffect(() => {
    let isMounted = true
    ;(async () => {
      try {
        const z = await getZonas()
        if (isMounted) setZonas(z)
      } catch (e) {
        console.error("Error cargando zonas:", e)
      }
    })()
    return () => {
      isMounted = false
    }
  }, [])

  const handlePolygonComplete = (coords: { lat: number; lng: number }[]) => {
    setDrawingCoords(coords)
    setZonaToEdit(null) // Asegurarse que no estamos editando
    setShowZonaForm(true)
  }

  const handleSaveZona = (data: Pick<Zona, "nombre" | "descripcion" | "activa">) => {
    if (zonaToEdit) {
      // Editando zona existente (solo nombre, descripción y estado activo)
      setZonas(
        zonas.map((z) =>
          z.id === zonaToEdit.id
            ? {
                ...z,
                nombre: data.nombre,
                descripcion: data.descripcion,
                activa: data.activa,
              }
            : z,
        ),
      )
    } else if (drawingCoords) {
      // Creando nueva zona a partir de un polígono dibujado
      const newZona: Zona = {
        id: Math.max(0, ...zonas.map((z) => z.id)) + 1,
        nombre: data.nombre,
        descripcion: data.descripcion,
        coordenadas: drawingCoords,
        activa: data.activa,
      }
      setZonas([...zonas, newZona])
    }
    setShowZonaForm(false)
    setZonaToEdit(null)
    setDrawingCoords(null)
  }

  const handleEditZona = (zona: Zona) => {
    setZonaToEdit(zona)
    setDrawingCoords(null) // No estamos redibujando, solo editando datos
    setShowZonaForm(true)
  }

  const handleDeleteZona = (zonaId: number) => {
    setZonas(zonas.filter((z) => z.id !== zonaId))
    setZonaToDelete(null)
    // Aquí también se debería actualizar cualquier escuadra que tuviera esta zona asignada.
  }

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

  const handleViewZonaOnMap = (zona: Zona) => {
    if (zona.coordenadas.length > 0) {
      const center = getPolygonCenter(zona.coordenadas)
      setMapCenter(center)
      setMapZoom(15)
    }
    setSelectedZona(zona)
  }

  // Estadísticas
  const totalZonas = zonas.length
  const zonasActivas = zonas.filter((z) => z.activa).length
  const zonasInactivas = totalZonas - zonasActivas

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Zonas Geográficas</h1>
          <p className="text-gray-600 mt-1">Define y gestiona las áreas de operación en el mapa.</p>
        </div>
        {/* El botón para activar el modo dibujo estará en el componente del mapa */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <MapPin className="h-6 w-6 text-[#015293] mb-2" />
            <p className="text-sm text-gray-600">Total de Zonas</p>
            <p className="text-2xl font-bold">{totalZonas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <MapPin className="h-6 w-6 text-[#f2a700] mb-2" />
            <p className="text-sm text-gray-600">Zonas Activas</p>
            <p className="text-2xl font-bold">{zonasActivas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <MapPin className="h-6 w-6 text-destructive mb-2" />
            <p className="text-sm text-gray-600">Zonas Inactivas</p>
            <p className="text-2xl font-bold">{zonasInactivas}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Mapa de Zonas</CardTitle>
              <CardDescription>
                Dibuja nuevas zonas o selecciona existentes. Haz clic en el icono de polígono para empezar a dibujar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MapaZonas
                zonas={zonas}
                onPolygonComplete={handlePolygonComplete}
                selectedZonaId={selectedZona?.id}
                center={mapCenter}
                zoom={mapZoom}
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List size={20} />
                Listado de Zonas
              </CardTitle>
              <CardDescription>Zonas definidas actualmente.</CardDescription>
            </CardHeader>
            <CardContent>
              <ListaZonas
                zonas={zonas}
                onEdit={handleEditZona}
                onDelete={(zona) => setZonaToDelete(zona)}
                onViewOnMap={handleViewZonaOnMap}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={showZonaForm}
        onOpenChange={(isOpen) => {
          setShowZonaForm(isOpen)
          if (!isOpen) {
            setZonaToEdit(null)
            setDrawingCoords(null) // Limpiar coordenadas si se cierra el form
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{zonaToEdit ? "Editar Zona" : "Nueva Zona"}</DialogTitle>
            <DialogDescription>
              {zonaToEdit ? "Actualiza los detalles de la zona." : "Ingresa los detalles para la nueva zona dibujada."}
            </DialogDescription>
          </DialogHeader>
          <ZonaForm
            onSubmit={handleSaveZona}
            onCancel={() => {
              setShowZonaForm(false)
              setZonaToEdit(null)
              setDrawingCoords(null)
            }}
            initialData={zonaToEdit}
            isEditing={!!zonaToEdit}
          />
        </DialogContent>
      </Dialog>

      {zonaToDelete && (
        <AlertDialog open={!!zonaToDelete} onOpenChange={() => setZonaToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Confirmar Eliminación?</AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que deseas eliminar la zona "{zonaToDelete.nombre}"? Esta acción no se puede deshacer.
                Si la zona está asignada a escuadras, podría afectar su operación.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setZonaToDelete(null)}>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleDeleteZona(zonaToDelete.id)}>Eliminar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
