"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, X } from "lucide-react"
import { getSupervisores, getVehiculos, getEquipos } from "@/data/escuadras-data"
import { fetchGreenAreas } from "@/data/zonas-data"
import type { CreateEquipoData, Supervisor, Vehiculo, Equipo, Zona } from "@/types/escuadras-types"

interface CreateEquipoFormProps {
  onBack: () => void
}

export function CreateEquipoForm({ onBack }: CreateEquipoFormProps) {
  const [formData, setFormData] = useState<CreateEquipoData>({
    nombre: "",
    supervisorId: 0,
    zonaId: 0,
    vehiculoId: 0,
    trabajadorIds: [],
    descripcion: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [supervisores, setSupervisores] = useState<Supervisor[]>([])
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [zonas, setZonas] = useState<Zona[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar datos del backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [supervisoresData, vehiculosData, equiposData, greenAreas] = await Promise.all([
          getSupervisores(),
          getVehiculos(),
          getEquipos(),
          fetchGreenAreas()
        ])
        setSupervisores(supervisoresData)
        setVehiculos(vehiculosData)
        setEquipos(equiposData)
        setZonas(greenAreas.map(a => ({ id: a.id, nombre: a.name, descripcion: a.info, coordenadas: a.coordinates, activa: true })))
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filtrar supervisores y vehículos disponibles
  const supervisoresDisponibles = supervisores.filter(
    (s) => !equipos.some((e) => e.supervisor?.id === s.id),
  )

  const vehiculosDisponibles = vehiculos.filter(
    (v) => !equipos.some((e) => e.vehiculo?.id === v.id),
  )

  const zonasDisponibles = zonas.filter(
    (zona) => zona.activa && !equipos.some((e) => e.supervisor?.id === zona.id),
  )

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre del equipo es requerido"
    } else if (equipos.some((e) => e.nombre.toLowerCase() === formData.nombre.toLowerCase())) {
      newErrors.nombre = "Ya existe un equipo con este nombre"
    }

    if (!formData.supervisorId || formData.supervisorId === 0) {
      newErrors.supervisorId = "Debe seleccionar un supervisor"
    }

    if (!formData.zonaId || formData.zonaId === 0) {
      newErrors.zonaId = "Debe seleccionar una zona"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      // Obtener el endpoint del backend
      const endpointResponse = await fetch('/api/get-backend-endpoint')
      if (!endpointResponse.ok) {
        throw new Error('Error al obtener el endpoint del backend')
      }
      const { endpoint } = await endpointResponse.json()

      // Crear el equipo en el backend
      const response = await fetch(`${endpoint}/equipos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          supervisorID: formData.supervisorId,
          vehiculoID: formData.vehiculoId || null,
          descripcion: formData.descripcion,
          // Agregar otros campos según sea necesario
        }),
      })

      if (!response.ok) {
        throw new Error('Error al crear el equipo')
      }

      const nuevoEquipo = await response.json()
      console.log("Equipo creado:", nuevoEquipo)

      // Mostrar mensaje de éxito
      alert("Equipo creado exitosamente")
      onBack()
    } catch (error) {
      console.error('Error creating equipo:', error)
      alert("Error al crear el equipo")
    }
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
          {loading ? (
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : (
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
                onValueChange={(value) => handleInputChange("supervisorId", value === "0" ? 0 : Number.parseInt(value))}
              >
                <SelectTrigger className={errors.supervisorId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Seleccionar supervisor" />
                </SelectTrigger>
                <SelectContent>
                  {supervisoresDisponibles.map((supervisor) => (
                    <SelectItem key={supervisor.id} value={supervisor.id.toString()}>
                      {supervisor.fullName}
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
              <Select 
                value={formData.zonaId?.toString() || "0"} 
                onValueChange={(value) => handleInputChange("zonaId", value === "0" ? 0 : Number.parseInt(value))}
              >
                <SelectTrigger className={errors.zonaId ? "border-red-500" : ""}>
                  <SelectValue placeholder="Seleccionar zona" />
                </SelectTrigger>
                <SelectContent>
                  {zonasDisponibles.map((zona) => (
                    <SelectItem key={zona.id} value={zona.id.toString()}>
                      {zona.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.zonaId && <p className="text-sm text-red-500">{errors.zonaId}</p>}
              {zonasDisponibles.length === 0 && <p className="text-sm text-amber-600">No hay zonas disponibles</p>}
            </div>

            {/* Vehículo (Opcional) */}
            <div className="space-y-2">
              <Label htmlFor="vehiculo">Vehículo (Opcional)</Label>
              <Select
                value={formData.vehiculoId?.toString() || "0"}
                onValueChange={(value) => handleInputChange("vehiculoId", value === "0" ? 0 : Number.parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar vehículo (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sin vehículo</SelectItem>
                  {vehiculosDisponibles.map((vehiculo) => (
                    <SelectItem key={vehiculo.id} value={vehiculo.id.toString()}>
                      {vehiculo.marca} {vehiculo.modelo} ({vehiculo.patente})
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
            </div>            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
