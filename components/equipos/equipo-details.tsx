"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label as UILabel } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VehicleTrackingMap } from "@/components/tracking/vehicle-tracking-map"
import { EquipoTrackingMap } from "./equipo-tracking-map"
import { ArrowLeft, Edit, MapPin, Users, Car, Calendar, Phone, Mail, Shield, Activity } from "lucide-react"
import { getTrabajadores } from "@/data/escuadras-data"
import type { Equipo } from "@/types/escuadras-types"
import type { TrackingData, VehiclePosition, SocketPositionResponse } from "@/types/tracking-types"
import { getSocket } from "@/lib/socket"

interface EquipoDetailsProps {
  equipo: Equipo
  onBack: () => void
}

export function EquipoDetails({ equipo, onBack }: EquipoDetailsProps) {
  const [activeTab, setActiveTab] = useState("general")
  const [vehicleTracking, setVehicleTracking] = useState<TrackingData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [trabajadoresEquipo, setTrabajadoresEquipo] = useState<any[]>([])

  // Obtener trabajadores asignados a este equipo
  useEffect(() => {
    const loadTrabajadores = async () => {
      const trabajadores = getTrabajadores()
      const trabajadoresDelEquipo = trabajadores.filter((t) => t.equipoId === equipo.id)
      setTrabajadoresEquipo(trabajadoresDelEquipo)
    }
    loadTrabajadores()
  }, [equipo.id])

  // Función de prueba para verificar el endpoint
  const testConnection = async () => {
    if (!equipo.vehiculo) return
    
    console.log("Probando conexión con el endpoint...")
    try {
      // Obtener el endpoint del backend
      const endpointResponse = await fetch('/api/get-backend-endpoint')
      if (!endpointResponse.ok) {
        throw new Error('Error al obtener el endpoint del backend')
      }
      const { endpoint } = await endpointResponse.json()

      // Prueba con el endpoint REST
      const response = await fetch(`${endpoint}/vehiculos/${equipo.vehiculo.id}`)
      const data = await response.json()
      console.log("Respuesta del endpoint:", data)
    } catch (error) {
      console.error("Error en la prueba de conexión:", error)
    }
  }

  // Configurar seguimiento en tiempo real para el vehículo del equipo
  useEffect(() => {
    // Solo configurar tracking si el equipo tiene vehículo
    if (!equipo.vehiculo) return

    const vehicleId = equipo.vehiculo.id
    let socket: any = null
    let positionInterval: NodeJS.Timeout | null = null
    
    // Función para obtener datos iniciales del vehículo
    const fetchVehicleData = async () => {
      try {
        // Obtener el endpoint del backend
        const endpointResponse = await fetch('/api/get-backend-endpoint')
        if (!endpointResponse.ok) {
          throw new Error('Error al obtener el endpoint del backend')
        }
        const { endpoint } = await endpointResponse.json()

        const response = await fetch(`${endpoint}/vehiculos/${vehicleId}`)
        const data = await response.json()

        if (!data.error && data.data) {
          const { data: vehicleData } = data
          const initialPosition: VehiclePosition = {
            vehiculoId: vehicleData.id,
            lat: vehicleData.latitud,
            lng: vehicleData.longitud,
            timestamp: new Date(vehicleData.timestamp),
            speed: vehicleData.velocidad,
            heading: vehicleData.heading,
            status: vehicleData.velocidad > 1 ? "moving" : "stopped",
          }

          setVehicleTracking({
            currentPosition: initialPosition,
            route: [initialPosition],
            isOnline: true,
            lastUpdate: new Date(),
          })
        }
      } catch (error) {
        console.error(`Error fetching vehicle ${vehicleId} data:`, error)
      }
    }

    const setupSocket = async () => {
      try {
        socket = await getSocket()

        const connectSocket = () => {
          if (socket && socket.disconnected) {
            socket.connect()
          }
        }

        const handleConnect = () => {
          console.log("Socket conectado para equipo:", equipo.nombre)
          console.log("Socket ID:", socket?.id)
          console.log("Socket connected:", socket?.connected)
          setIsConnected(true)
          fetchVehicleData()
        }

        const handleDisconnect = (reason: string) => {
          console.log("Socket desconectado:", reason)
          setIsConnected(false)
        }

        const handleConnectError = (error: any) => {
          console.error("Error de conexión del socket:", error)
          setIsConnected(false)
        }

        const handlePositionUpdate = (data: SocketPositionResponse) => {
          console.log("Posición recibida para equipo:", equipo.nombre, data)
          console.log("Tipo de data:", typeof data)
          console.log("Data es null/undefined:", data === null || data === undefined)

          if (data && data.vehiculoId === vehicleId) {
            setVehicleTracking(prevTracking => {
              const newPosition: VehiclePosition = {
                vehiculoId: data.vehiculoId,
                lat: data.lat,
                lng: data.lng,
                timestamp: new Date(data.timestamp), // Asegurar que sea Date
                speed: data.speed,
                heading: data.heading,
                status: data.speed > 1 ? "moving" : "stopped",
              }

              const updatedTracking: TrackingData = {
                currentPosition: newPosition,
                route: prevTracking ? [...prevTracking.route, newPosition].slice(-100) : [newPosition],
                isOnline: true,
                lastUpdate: new Date(),
              }

              return updatedTracking
            })
          } else {
            console.log("Datos inválidos o vehicleId no coincide:", data?.vehiculoId, "esperado:", vehicleId)
          }
        }

        // Configurar eventos del socket
        socket.on("connect", handleConnect)
        socket.on("disconnect", handleDisconnect)
        socket.on("connect_error", handleConnectError)
        socket.on("posicion-actualizada", handlePositionUpdate) // Solo este evento según el servidor

        // Conectar el socket
        connectSocket()

        // Intervalo para solicitar posición cada 5 segundos
        positionInterval = setInterval(() => {
          if (socket?.connected) {
            console.log(`Solicitando posición del vehículo ${vehicleId} para equipo ${equipo.nombre}`)
            console.log("Socket status:", socket.connected ? "conectado" : "desconectado")
            socket.emit("obtener-posicion", { id: vehicleId })
          } else {
            console.log("Socket desconectado, intentando reconectar...")
            connectSocket()
          }
        }, 5000)

        return () => {
          if (positionInterval) {
            clearInterval(positionInterval)
          }
          if (socket) {
            socket.off("connect", handleConnect)
            socket.off("disconnect", handleDisconnect)
            socket.off("connect_error", handleConnectError)
            socket.off("posicion-actualizada", handlePositionUpdate) // Solo este evento
            if (socket.connected) {
              socket.disconnect()
            }
          }
        }
      } catch (error) {
        console.error('Error setting up socket:', error)
      }
    }

    const cleanup = setupSocket()
    return () => {
      cleanup?.then((cleanupFn) => cleanupFn?.())
    }
  }, [equipo.vehiculo, equipo.nombre])

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a la lista
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{equipo.nombre}</h1>
            <p className="text-gray-600">Detalles y gestión del equipo</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={equipo.activa ? "default" : "secondary"}>{equipo.activa ? "Activo" : "Inactivo"}</Badge>
            {equipo.vehiculo && (
              <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                {isConnected ? "Tracking conectado" : "Tracking desconectado"}
              </Badge>
            )}
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
            {equipo.vehiculo && (
              <Button variant="outline" onClick={testConnection}>
                Test Conexión
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Información General</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="vehiculo">Vehículo</TabsTrigger>
          <TabsTrigger value="seguimiento" disabled={!equipo.vehiculo}>
            Seguimiento
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Información del Equipo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Nombre</Label>
                  <p className="text-lg font-semibold">{equipo.nombre}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Estado</Label>
                  <div className="mt-1">
                    <Badge variant={equipo.activa ? "default" : "secondary"}>{equipo.activa ? "Activo" : "Inactivo"}</Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Fecha de Creación</Label>
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {equipo.fechaCreacion?.toLocaleDateString() || "No especificado"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Zona de Trabajo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Zona Asignada</Label>
                  <p className="text-lg font-semibold">Zona asignada</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="personal" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Supervisor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Supervisor
                </CardTitle>
              </CardHeader>
              <CardContent>
                {equipo.supervisor ? (
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Nombre Completo</Label>
                      <p className="font-semibold">
                        {equipo.supervisor.fullName}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">RUT</Label>
                      <p>{equipo.supervisor.rut}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Teléfono</Label>
                      <p className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {equipo.supervisor.celular}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Email</Label>
                      <p className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {equipo.supervisor.email}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Fecha de Ingreso</Label>
                      <p>No especificado</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Sin supervisor asignado</p>
                )}
              </CardContent>
            </Card>

            {/* Trabajadores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Trabajadores ({trabajadoresEquipo.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trabajadoresEquipo.length > 0 ? (
                  <div className="space-y-4">
                    {trabajadoresEquipo.map((trabajador) => (
                      <div key={trabajador.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold">
                            {trabajador.nombre} {trabajador.apellido}
                          </p>
                          <Badge variant="outline">{trabajador.activo ? "Activo" : "Inactivo"}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{trabajador.rut}</p>
                        <p className="text-sm text-gray-600">{trabajador.telefono}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Sin trabajadores asignados</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="vehiculo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Vehículo Asignado
              </CardTitle>
            </CardHeader>
            <CardContent>
              {equipo.vehiculo ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Patente</Label>
                      <p className="text-lg font-semibold">{equipo.vehiculo.patente}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Marca y Modelo</Label>
                      <p className="font-semibold">
                        {equipo.vehiculo.marca} {equipo.vehiculo.modelo}
                      </p>
                    </div>
                    <div>
                      <UILabel className="text-sm font-medium text-gray-500">Último reporte</UILabel>
                      <p>{equipo.vehiculo.timestamp?.toLocaleString() || "No disponible"}</p>
                    </div>
                    <div>
                      <UILabel className="text-sm font-medium text-gray-500">Ubicación</UILabel>
                      <p>
                        {equipo.vehiculo.latitud && equipo.vehiculo.longitud 
                          ? `${equipo.vehiculo.latitud.toFixed(6)}, ${equipo.vehiculo.longitud.toFixed(6)}`
                          : "No disponible"}
                      </p>
                    </div>
                    <div>
                      <UILabel className="text-sm font-medium text-gray-500">Estado</UILabel>
                      <Badge variant={equipo.vehiculo.velocidad > 0 ? "default" : "secondary"}>
                        {equipo.vehiculo.velocidad > 0 ? "En movimiento" : "Detenido"}
                      </Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">Sin vehículo asignado</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguimiento" className="space-y-6">
          {equipo.vehiculo ? (
            <div className="h-[600px]">
              <EquipoTrackingMap 
                equipo={equipo} 
                vehicleTracking={vehicleTracking} 
                isConnected={isConnected} 
              />
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Sin vehículo asignado</h3>
                <p className="text-gray-500">Este equipo no tiene un vehículo asignado para realizar seguimiento.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>
}
