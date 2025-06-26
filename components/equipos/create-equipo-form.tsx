"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { supervisores, trabajadores, zonas, vehiculos, equipos } from "@/data/escuadras-data"
import type { Equipo, CreateEquipoData } from "@/types/escuadras-types"

interface CreateEquipoFormProps {
  onSubmit: (equipo: Equipo) => void
  onCancel: () => void
}

export function CreateEquipoForm({ onSubmit, onCancel }: CreateEquipoFormProps) {
  const [formData, setFormData] = useState<CreateEquipoData>({
    nombre: "",
    supervisorId: 0,
    zonaId: 0,
    vehiculoId: 0,
    trabajadorIds: [],
    descripcion: "",
  })
  const [errors, setErrors] = useState<string[]>([])

  // Filtrar recursos disponibles
  const supervisoresDisponibles = supervisores.filter(
    (s) => s.activo && !equipos.some((e) => e.supervisor.id === s.id && e.activa),
  )

  const trabajadoresDisponibles = trabajadores.filter((t) => t.activo && !t.equipoId)

  const zonasDisponibles = zonas.filter((z) => z.activa && !equipos.some((e) => e.zona.id === z.id && e.activa))

  const vehiculosDisponibles = vehiculos.filter((v) => v.estado === "disponible")

  const validateForm = (): string[] => {
    const newErrors: string[] = []

    if (!formData.nombre.trim()) {
      newErrors.push("El nombre del equipo es obligatorio")
    }

    if (formData.supervisorId === 0) {
      newErrors.push("Debe seleccionar un supervisor")
    }

    if (formData.zonaId === 0) {
      newErrors.push("Debe seleccionar una zona")
    }

    if (formData.vehiculoId === 0) {
      newErrors.push("Debe seleccionar un vehículo")
    }

    if (formData.trabajadorIds.length > 4) {
      newErrors.push("Un equipo no puede tener más de 4 trabajadores")
    }

    return newErrors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    // Crear nuevo equipo
    const supervisor = supervisores.find((s) => s.id === formData.supervisorId)!
    const zona = zonas.find((z) => z.id === formData.zonaId)!
    const vehiculo = vehiculos.find((v) => v.id === formData.vehiculoId)!
    const trabajadoresSeleccionados = trabajadores.filter((t) => formData.trabajadorIds.includes(t.id))

    const newEquipo: Equipo = {
      id: Math.max(...equipos.map((e) => e.id)) + 1,
      nombre: formData.nombre.trim(),
      supervisor,
      trabajadores: trabajadoresSeleccionados,
      zona,
      vehiculo,
      fechaCreacion: new Date(),
      activa: true,
      descripcion: formData.descripcion.trim() || undefined,
    }

    onSubmit(newEquipo)
  }

  const handleTrabajadorChange = (trabajadorId: number, checked: boolean) => {
    if (checked) {
      if (formData.trabajadorIds.length < 4) {
        setFormData({
          ...formData,
          trabajadorIds: [...formData.trabajadorIds, trabajadorId],
        })
      }
    } else {
      setFormData({
        ...formData,
        trabajadorIds: formData.trabajadorIds.filter((id) => id !== trabajadorId),
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 h-screen overflow-auto">
      {errors.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Información básica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre del Equipo *</Label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Ej: Equipo Delta"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supervisor">Supervisor *</Label>
          <Select
            value={formData.supervisorId.toString()}
            onValueChange={(value) => setFormData({ ...formData, supervisorId: Number.parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar supervisor" />
            </SelectTrigger>
            <SelectContent>
              {supervisoresDisponibles.map((supervisor) => (
                <SelectItem key={supervisor.id} value={supervisor.id.toString()}>
                  {supervisor.nombre} {supervisor.apellido} ({supervisor.experiencia} años exp.)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Zona y Vehículo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="zona">Zona Asignada *</Label>
          <Select
            value={formData.zonaId.toString()}
            onValueChange={(value) => setFormData({ ...formData, zonaId: Number.parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar zona" />
            </SelectTrigger>
            <SelectContent>
              {zonasDisponibles.map((zona) => (
                <SelectItem key={zona.id} value={zona.id.toString()}>
                  {zona.nombre} - {zona.descripcion}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="vehiculo">Vehículo Asignado *</Label>
          <Select
            value={formData.vehiculoId.toString()}
            onValueChange={(value) => setFormData({ ...formData, vehiculoId: Number.parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar vehículo" />
            </SelectTrigger>
            <SelectContent>
              {vehiculosDisponibles.map((vehiculo) => (
                <SelectItem key={vehiculo.id} value={vehiculo.id.toString()}>
                  {vehiculo.marca} {vehiculo.modelo} ({vehiculo.patente}) - {vehiculo.combustible}% combustible
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Trabajadores */}
      <div className="space-y-2">
        <Label>Trabajadores (máximo 4)</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
          {trabajadoresDisponibles.map((trabajador) => (
            <div key={trabajador.id} className="flex items-center space-x-2">
              <Checkbox
                id={`trabajador-${trabajador.id}`}
                checked={formData.trabajadorIds.includes(trabajador.id)}
                onCheckedChange={(checked) => handleTrabajadorChange(trabajador.id, checked as boolean)}
                disabled={!formData.trabajadorIds.includes(trabajador.id) && formData.trabajadorIds.length >= 4}
              />
              <Label htmlFor={`trabajador-${trabajador.id}`} className="text-sm cursor-pointer">
                {trabajador.nombre} {trabajador.apellido}
              </Label>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500">Seleccionados: {formData.trabajadorIds.length}/4</p>
      </div>

      {/* Descripción */}
      <div className="space-y-2">
        <Label htmlFor="descripcion">Descripción (opcional)</Label>
        <Textarea
          id="descripcion"
          value={formData.descripcion}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          placeholder="Descripción del equipo y sus responsabilidades..."
          rows={3}
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Crear Equipo</Button>
      </div>
    </form>
  )
}
