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
    fullName: "",
    rut: "",
    celular: "",
    email: "",
    ...initialData,
  })
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
      })
    } else {
      setFormData({
        fullName: "",
        rut: "",
        celular: "",
        email: "",
      })
    }
  }, [initialData])

  const validateForm = (): string[] => {
    const newErrors: string[] = []
    if (!formData.fullName?.trim()) newErrors.push("El nombre completo es obligatorio.")
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
    if (!formData.celular?.trim()) {
      newErrors.push("El teléfono es obligatorio.")
    } else if (!/^\+?56\s?9\s?\d{4}\s?\d{4}$/.test(formData.celular)) {
      newErrors.push("Formato de teléfono inválido (Ej: +56 9 1234 5678).")
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
        <Label htmlFor="fullName">Nombre Completo *</Label>
        <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} />
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
          <Label htmlFor="celular">Teléfono *</Label>
          <Input
            id="celular"
            name="celular"
            value={formData.celular}
            onChange={handleInputChange}
            placeholder="+56 9 1234 5678"
          />
        </div>
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
