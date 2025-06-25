"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import type { Supervisor } from "@/types/escuadras-types"

interface SupervisorFormProps {
  onSubmit: (supervisor: Supervisor) => void
  onCancel: () => void
  initialData?: Supervisor | null
}

export function SupervisorForm({ onSubmit, onCancel, initialData }: SupervisorFormProps) {
  const [formData, setFormData] = useState<Partial<Supervisor>>({
    nombre: "",
    apellido: "",
    rut: "",
    telefono: "",
    email: "",
    fechaIngreso: new Date(),
    activo: true,
    experiencia: 0,
    ...initialData,
  })
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        fechaIngreso: initialData.fechaIngreso ? new Date(initialData.fechaIngreso) : new Date(),
      })
    } else {
      setFormData({
        nombre: "",
        apellido: "",
        rut: "",
        telefono: "",
        email: "",
        fechaIngreso: new Date(),
        activo: true,
        experiencia: 0,
      })
    }
  }, [initialData])

  const validateForm = (): string[] => {
    const newErrors: string[] = []
    if (!formData.nombre?.trim()) newErrors.push("El nombre es obligatorio.")
    if (!formData.apellido?.trim()) newErrors.push("El apellido es obligatorio.")
    if (!formData.rut?.trim()) {
      newErrors.push("El RUT es obligatorio.")
    } else if (!/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/.test(formData.rut)) {
      newErrors.push("Formato de RUT inválido (Ej: 12.345.678-K).")
    }
    if (!formData.email?.trim()) {
      newErrors.push("El email es obligatorio.")
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push("Formato de email inválido.")
    }
    if (!formData.telefono?.trim()) {
      newErrors.push("El teléfono es obligatorio.")
    } else if (!/^\+?56\s?9\s?\d{4}\s?\d{4}$/.test(formData.telefono)) {
      newErrors.push("Formato de teléfono inválido (Ej: +56 9 1234 5678).")
    }
    if (!formData.fechaIngreso) newErrors.push("La fecha de ingreso es obligatoria.")
    if (formData.experiencia === undefined || formData.experiencia < 0) {
      newErrors.push("Los años de experiencia deben ser un número positivo o cero.")
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
    setErrors([])
    onSubmit(formData as Supervisor)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setFormData({ ...formData, [name]: type === "number" ? Number.parseInt(value) : value })
  }

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, fechaIngreso: new Date(e.target.value) })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      {errors.length > 0 && (
        <Alert variant="destructive">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nombre">Nombre *</Label>
          <Input id="nombre" name="nombre" value={formData.nombre} onChange={handleInputChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="apellido">Apellido *</Label>
          <Input id="apellido" name="apellido" value={formData.apellido} onChange={handleInputChange} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="rut">RUT *</Label>
        <Input id="rut" name="rut" value={formData.rut} onChange={handleInputChange} placeholder="12.345.678-K" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefono">Teléfono *</Label>
          <Input
            id="telefono"
            name="telefono"
            value={formData.telefono}
            onChange={handleInputChange}
            placeholder="+56 9 1234 5678"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fechaIngreso">Fecha de Ingreso *</Label>
          <Input
            id="fechaIngreso"
            name="fechaIngreso"
            type="date"
            value={formData.fechaIngreso ? formData.fechaIngreso.toISOString().split("T")[0] : ""}
            onChange={handleDateChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="experiencia">Años de Experiencia *</Label>
          <Input
            id="experiencia"
            name="experiencia"
            type="number"
            value={formData.experiencia}
            onChange={handleInputChange}
            min="0"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="activo"
          checked={formData.activo}
          onCheckedChange={(checked) => setFormData({ ...formData, activo: checked })}
        />
        <Label htmlFor="activo">Supervisor Activo</Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{initialData ? "Guardar Cambios" : "Crear Supervisor"}</Button>
      </div>
    </form>
  )
}
