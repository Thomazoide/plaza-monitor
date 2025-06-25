"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import type { Vehiculo } from "@/types/escuadras-types"

interface VehiculoFormProps {
  onSubmit: (vehiculo: Vehiculo) => void
  onCancel: () => void
  initialData?: Vehiculo | null
}

export function VehiculoForm({ onSubmit, onCancel, initialData }: VehiculoFormProps) {
  const [formData, setFormData] = useState<Partial<Vehiculo>>({
    patente: "",
    marca: "",
    modelo: "",
    año: new Date().getFullYear(),
    tipo: "camioneta",
    estado: "disponible",
    combustible: 100,
    ...initialData,
  })
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (initialData) {
      setFormData(initialData)
    } else {
      setFormData({
        patente: "",
        marca: "",
        modelo: "",
        año: new Date().getFullYear(),
        tipo: "camioneta",
        estado: "disponible",
        combustible: 100,
      })
    }
  }, [initialData])

  const validateForm = (): string[] => {
    const newErrors: string[] = []
    if (!formData.patente?.trim()) newErrors.push("La patente es obligatoria.")
    // Validación simple de patente chilena (formato antiguo y nuevo sin puntos ni guion para simplificar)
    else if (!/^[A-Z0-9]{6}$/i.test(formData.patente.replace(/[-.]/g, ""))) {
      newErrors.push("Formato de patente inválido (Ej: ABCD12 o AB1234).")
    }
    if (!formData.marca?.trim()) newErrors.push("La marca es obligatoria.")
    if (!formData.modelo?.trim()) newErrors.push("El modelo es obligatorio.")
    if (!formData.año || formData.año < 1980 || formData.año > new Date().getFullYear() + 1) {
      newErrors.push(`El año debe ser válido (entre 1980 y ${new Date().getFullYear() + 1}).`)
    }
    if (!formData.tipo) newErrors.push("El tipo de vehículo es obligatorio.")
    if (!formData.estado) newErrors.push("El estado del vehículo es obligatorio.")
    if (formData.combustible === undefined || formData.combustible < 0 || formData.combustible > 100) {
      newErrors.push("El nivel de combustible debe estar entre 0 y 100%.")
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
    onSubmit(formData as Vehiculo)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setFormData({ ...formData, [name]: type === "number" ? Number.parseInt(value) : value })
  }

  const handleSelectChange = (name: keyof Vehiculo, value: string) => {
    setFormData({ ...formData, [name]: value })
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

      <div className="space-y-2">
        <Label htmlFor="patente">Patente *</Label>
        <Input id="patente" name="patente" value={formData.patente} onChange={handleInputChange} placeholder="ABCD12" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="marca">Marca *</Label>
          <Input id="marca" name="marca" value={formData.marca} onChange={handleInputChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="modelo">Modelo *</Label>
          <Input id="modelo" name="modelo" value={formData.modelo} onChange={handleInputChange} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="año">Año *</Label>
          <Input id="año" name="año" type="number" value={formData.año} onChange={handleInputChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo *</Label>
          <Select
            name="tipo"
            value={formData.tipo}
            onValueChange={(value) => handleSelectChange("tipo", value as Vehiculo["tipo"])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="camioneta">Camioneta</SelectItem>
              <SelectItem value="camion">Camión</SelectItem>
              <SelectItem value="furgon">Furgón</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="estado">Estado *</Label>
          <Select
            name="estado"
            value={formData.estado}
            onValueChange={(value) => handleSelectChange("estado", value as Vehiculo["estado"])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="disponible">Disponible</SelectItem>
              <SelectItem value="en_uso">En Uso</SelectItem>
              <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="combustible">Nivel de Combustible (%) *</Label>
          <Input
            id="combustible"
            name="combustible"
            type="number"
            value={formData.combustible}
            onChange={handleInputChange}
            min="0"
            max="100"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{initialData ? "Guardar Cambios" : "Crear Vehículo"}</Button>
      </div>
    </form>
  )
}
