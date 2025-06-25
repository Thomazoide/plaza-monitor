"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import type { Zona } from "@/types/escuadras-types"

interface ZonaFormProps {
  onSubmit: (data: Pick<Zona, "nombre" | "descripcion" | "activa">) => void
  onCancel: () => void
  initialData?: Pick<Zona, "nombre" | "descripcion" | "activa"> | null
  isEditing: boolean
}

export function ZonaForm({ onSubmit, onCancel, initialData, isEditing }: ZonaFormProps) {
  const [nombre, setNombre] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [activa, setActiva] = useState(true)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (initialData) {
      setNombre(initialData.nombre || "")
      setDescripcion(initialData.descripcion || "")
      setActiva(initialData.activa === undefined ? true : initialData.activa)
    } else {
      setNombre("")
      setDescripcion("")
      setActiva(true)
    }
  }, [initialData])

  const validateForm = (): string[] => {
    const newErrors: string[] = []
    if (!nombre.trim()) newErrors.push("El nombre de la zona es obligatorio.")
    if (nombre.trim().length > 50) newErrors.push("El nombre no puede exceder los 50 caracteres.")
    if (descripcion.trim().length > 200) newErrors.push("La descripción no puede exceder los 200 caracteres.")
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
    onSubmit({ nombre, descripcion, activa })
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
        <Label htmlFor="nombreZona">Nombre de la Zona *</Label>
        <Input
          id="nombreZona"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Sector Residencial Norte"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="descripcionZona">Descripción (opcional)</Label>
        <Textarea
          id="descripcionZona"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Detalles adicionales sobre la zona..."
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="activaZona" checked={activa} onCheckedChange={setActiva} />
        <Label htmlFor="activaZona">Zona Activa</Label>
      </div>
      {!isEditing && (
        <p className="text-sm text-gray-500">
          La forma de la zona se ha capturado del mapa. Aquí puedes agregar nombre y descripción.
        </p>
      )}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">{isEditing ? "Guardar Cambios" : "Crear Zona"}</Button>
      </div>
    </form>
  )
}
