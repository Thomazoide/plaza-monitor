"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import type { AsignarBeaconProps } from "@/types/dispositivos-types"
import * as React from "react"

export default function AsignarBeaconModal({ beacon, equipos, vehiculos, onAssign, onCancel }: AsignarBeaconProps) {
  const [selectedEscuadraId, setSelectedEscuadraId] = React.useState<string | null>(beacon.equipoId?.toString() || null)
  const [selectedVehiculoId, setSelectedVehiculoId] = React.useState<string | null>(beacon.vehiculoId || null)

  const handleSubmit = () => {
    onAssign(beacon.id, selectedEscuadraId, selectedVehiculoId)
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Asignar Beacon</DialogTitle>
          <DialogDescription>
            Selecciona una escuadra y/o un vehículo para el beacon "{beacon.nombre}" (ID: {beacon.id}). Puedes dejar uno
            o ambos campos como "Ninguno".
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="escuadra" className="text-right col-span-1">
              Escuadra
            </Label>
            <Select
              value={selectedEscuadraId || ""}
              onValueChange={(value) => setSelectedEscuadraId(value === "ninguna" ? null : value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seleccionar escuadra..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ninguna">-- Ninguna --</SelectItem>
                {equipos.map((equipo) => (
                  <SelectItem key={equipo.id} value={equipo.id.toString()}>
                    {equipo.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="vehiculo" className="text-right col-span-1">
              Vehículo
            </Label>
            <Select
              value={selectedVehiculoId || ""}
              onValueChange={(value) => setSelectedVehiculoId(value === "ninguna" ? null : value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seleccionar vehículo..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ninguna">-- Ninguno --</SelectItem>
                {vehiculos.map((vehiculo) => (
                  <SelectItem key={vehiculo.id} value={vehiculo.id.toString()}>
                    {vehiculo.marca} {vehiculo.modelo} ({vehiculo.patente})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit}>
            Guardar Asignación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
