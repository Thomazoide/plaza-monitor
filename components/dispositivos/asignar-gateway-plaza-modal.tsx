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
import type { AsignarGatewayPlazaProps } from "@/types/dispositivos-types" // Tipo actualizado
import * as React from "react"

export default function AsignarGatewayPlazaModal({ gateway, plazas, onAssign, onCancel }: AsignarGatewayPlazaProps) {
  const [selectedPlazaId, setSelectedPlazaId] = React.useState<string | null>(gateway.greenAreaId || null)

  const handleSubmit = () => {
    onAssign(gateway.id, selectedPlazaId)
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asignar Gateway a Plaza</DialogTitle>
          <DialogDescription>
            Selecciona una plaza (área verde) para el gateway "{gateway.nombre}" (ID: {gateway.id}). Si seleccionas
            "Ninguna", el gateway quedará desasignado.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="plaza" className="text-right col-span-1">
              Plaza
            </Label>
            <Select
              value={selectedPlazaId || ""}
              onValueChange={(value) => setSelectedPlazaId(value === "ninguna" ? null : value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Seleccionar plaza..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ninguna">-- Ninguna (Desasignar) --</SelectItem>
                {plazas.map((plaza) => (
                  <SelectItem key={plaza.id} value={plaza.id.toString()}>
                    {plaza.name}
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
