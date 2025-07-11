"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, X } from "lucide-react"
import { supervisores, vehiculos, equipos } from "@/data/escuadras-data"
import type { CreateEquipoData } from "@/types/escuadras-types"

interface CreateEquipoFormProps {
  onBack: () => void
}

export function CreateEquipoForm({ onBack }: CreateEquipoFormProps) {
  const [formData, setFormData] = useState<CreateEquipoData>({
    nombre: "",
    supervisorId: undefined,
    zona: "",
    vehiculoId: undefined,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Filtrar supervisores y vehículos disponibles
  const supervisoresDisponibles = supervisores.filter(
    (s) => s.estado === "activo" && !equipos.some((e) => e.supervisor?.id === s.id),
  )

  const vehiculosDisponibles = vehiculos.filter(
    (v) => v.estado === "disponible" && !equipos.some((e) => e.vehiculo?.id === v.id),
  )

  const zonasDisponibles = ["Zona Norte", "Zona Sur", "Zona Centro", "Zona Este", "Zona Oeste"].filter(
    (zona) => !equipos.some((e) => e.zona === zona),
  )

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre del equipo es requerido"
    } else if (equipos.some((e) => e.nombre.toLowerCase() === formData.nombre.toLowerCase())) {
      newErrors.nombre = "Ya existe un equipo con este nombre"
    }

    if (!formData.supervisorId) {
      newErrors.supervisorId = "Debe seleccionar un supervisor"
    }

    if (!formData.zona) {
      newErrors.zona = "Debe seleccionar una zona"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // Aquí normalmente enviarías los datos al servidor
    console.log("Crear equipo:", formData)

    // Simular creación exitosa
    alert("Equipo creado exitosamente")
    onBack()
  }

  const handleInputChange = (field: keyof CreateEquipoData, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a la lista
        </Button>
        <h1 className="text-2xl font-bold">Crear Nuevo Equipo</h1>
        <p className="text-gray-600">Complete la información para crear un nuevo equipo de trabajo</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Equipo</CardTitle>
          <CardDescription>Ingrese los datos básicos del equipo</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre del Equipo */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre del Equipo *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                placeholder="Ej: Equipo Delta"
                className={errors.nombre ? "border-red-500" : ""}
              />
              {errors.nombre && <p className="text-sm text-red-500">{errors.nombre}</p>}
            </div>

            {/* Supervisor */}
            <div className="space-y-2">
              <Label htmlFor="supervisor">Supervisor *</Label>
              <Select
                value={formData.supervisorId?.toString() || "0"}
                onValueChange={(value) => handleInputChange("supervisorId", value ? Number.parseInt(value) : undefined)}
              >
                <SelectTrigger className={errors.supervisorId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Seleccionar supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {supervisoresDisponibles.map((supervisor) => (
                    <SelectItem key={supervisor.id} value={supervisor.id.toString()}>
                      {supervisor.nombre} {supervisor.apellido}
                      <Badge variant="outline" className="ml-2">
                        {supervisor.rut}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.supervisorId && <p className="text-sm text-red-500">{errors.supervisorId}</p>}
              {supervisoresDisponibles.length === 0 && (
                <p className="text-sm text-amber-600">No hay supervisores disponibles</p>
              )}
            </div>

            {/* Zona */}
            <div className="space-y-2">
              <Label htmlFor="zona">Zona de Trabajo *</Label>
              <Select value={formData.zona || "0"} onValueChange={(value) => handleInputChange("zona", value)}>
                <SelectTrigger className={errors.zona ? "border-red-500" : ""}>
                  <SelectValue placeholder="Seleccionar zona" />
                </SelectTrigger>
                <SelectContent>
                  {zonasDisponibles.map((zona) => (
                    <SelectItem key={zona} value={zona}>
                      {zona}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.zona && <p className="text-sm text-red-500">{errors.zona}</p>}
              {zonasDisponibles.length === 0 && <p className="text-sm text-amber-600">No hay zonas disponibles</p>}
            </div>

            {/* Vehículo (Opcional) */}
            <div className="space-y-2">
              <Label htmlFor="vehiculo">Vehículo (Opcional)</Label>
              <Select
                value={formData.vehiculoId?.toString() || "0"}
                onValueChange={(value) => handleInputChange("vehiculoId", value ? Number.parseInt(value) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar vehículo (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sin vehículo</SelectItem>
                  {vehiculosDisponibles.map((vehiculo) => (
                    <SelectItem key={vehiculo.id} value={vehiculo.id.toString()}>
                      {vehiculo.marca} {vehiculo.modelo} ({vehiculo.patente})
                      <Badge variant="outline" className="ml-2">
                        {vehiculo.año}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {vehiculosDisponibles.length === 0 && (
                <p className="text-sm text-amber-600">No hay vehículos disponibles</p>
              )}
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                Crear Equipo
              </Button>
              <Button type="button" variant="outline" onClick={onBack}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
