"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { TrackingData, VehiclePosition, SocketPositionResponse, VehicleApiResponse } from "@/types/tracking-types"
import { getVehiculos, getVehicleTrackingData } from "@/data/escuadras-data"
import { generateVehicleTracking, updateVehiclePosition } from "@/data/tracking-data"
import { getSocket } from "@/lib/socket"
import type { Socket } from "socket.io-client"

interface TrackingContextType {
  vehicleTrackings: Record<number, TrackingData>
  getTrackingById: (id: number) => TrackingData | undefined
  isConnected: boolean
}

const TrackingContext = createContext<TrackingContextType | undefined>(undefined)

export function TrackingProvider({ children }: { children: ReactNode }) {
  const [vehicleTrackings, setVehicleTrackings] = useState<Record<number, TrackingData>>({})
  const [isConnected, setIsConnected] = useState(false)
  const [vehiculosLoaded, setVehiculosLoaded] = useState(false)
  const [currentSocket, setCurrentSocket] = useState<Socket | null>(null)

  // Inicializar tracking cuando se cargan los vehículos
  useEffect(() => {
    const initializeTracking = async () => {
      try {
        const vehiculos = await getVehiculos()
        const initialTrackings: Record<number, TrackingData> = {}
        
        // Ensure vehiculos is an array before iterating
        if (Array.isArray(vehiculos)) {
          for (const vehiculo of vehiculos) {
            // Usar datos del backend si están disponibles
            const trackingData = await getVehicleTrackingData(vehiculo.id)
            if (trackingData) {
              initialTrackings[vehiculo.id] = trackingData
            } else {
              // Fallback a datos simulados
              initialTrackings[vehiculo.id] = generateVehicleTracking(vehiculo.id)
            }
          }
        } else {
          console.warn('getVehiculos() did not return an array:', vehiculos)
        }
        
        setVehicleTrackings(initialTrackings)
        setVehiculosLoaded(true)
      } catch (error) {
        console.error('Error initializing tracking:', error)
        setVehiculosLoaded(true)
      }
    }

    initializeTracking()
  }, [])

  // Función para obtener datos iniciales del vehículo desde el API
  const fetchVehicleData = async (vehicleId: number) => {
    try {
      // Obtener el endpoint del backend
      const endpointResponse = await fetch('/api/get-backend-endpoint')
      if (!endpointResponse.ok) {
        throw new Error('Error al obtener el endpoint del backend')
      }
      const { endpoint } = await endpointResponse.json()

      const response = await fetch(`${endpoint}/vehiculos/${vehicleId}`)
      const vehicleData: VehicleApiResponse = await response.json()

      if (!vehicleData.error && vehicleData.data) {
        const { data } = vehicleData
        const initialPosition: VehiclePosition = {
          vehiculoId: data.id,
          lat: data.latitud,
          lng: data.longitud,
          timestamp: new Date(data.timestamp),
          speed: data.velocidad,
          heading: data.heading,
          status: data.velocidad > 1 ? "moving" : "stopped",
        }

        setVehicleTrackings((prev) => ({
          ...prev,
          [vehicleId]: {
            currentPosition: initialPosition,
            route: [initialPosition],
            isOnline: true,
            lastUpdate: new Date(),
          },
        }))
      }
    } catch (error) {
      console.error(`Error fetching vehicle ${vehicleId} data:`, error)
    }
  }

  // Efecto para la conexión del Socket y las actualizaciones en tiempo real
  useEffect(() => {
    let socket: Socket | null = null
    let positionInterval: NodeJS.Timeout | null = null

    const setupSocket = async () => {
      try {
        socket = await getSocket()
        setCurrentSocket(socket)

        const connectSocket = () => {
          if (socket && socket.disconnected) {
            socket.connect()
          }
        }

        const handleConnect = () => {
          console.log("Socket conectado:", socket?.id)
          if (socket?.io?.engine?.transport) {
            console.log("Socket transport:", socket.io.engine.transport.name)
          }
          setIsConnected(true)
          // Obtener datos iniciales del vehículo 1
          fetchVehicleData(1)
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
          console.log("Posición recibida:", data)
          console.log("Tipo de data:", typeof data)
          console.log("Data es null/undefined:", data === null || data === undefined)

          if (data && data.vehiculoId) {
            setVehicleTrackings((prevTrackings) => {
              const newTrackings = { ...prevTrackings }
              const existingTracking = newTrackings[data.vehiculoId]

              const newPosition: VehiclePosition = {
                vehiculoId: data.vehiculoId,
                lat: data.lat,
                lng: data.lng,
                timestamp: new Date(data.timestamp),
                speed: data.speed,
                heading: data.heading,
                status: data.speed > 1 ? "moving" : "stopped",
              }

              if (existingTracking) {
                newTrackings[data.vehiculoId] = {
                  ...existingTracking,
                  currentPosition: newPosition,
                  route: [...existingTracking.route, newPosition].slice(-100), // Mantener solo las últimas 100 posiciones
                  isOnline: true,
                  lastUpdate: new Date(),
                }
              } else {
                newTrackings[data.vehiculoId] = {
                  currentPosition: newPosition,
                  route: [newPosition],
                  isOnline: true,
                  lastUpdate: new Date(),
                }
              }

              return newTrackings
            })
          } else {
            console.log("Datos inválidos o vehicleId no encontrado:", data?.vehiculoId)
          }
        }

        // Configurar eventos del socket
        socket.on("connect", handleConnect)
        socket.on("disconnect", handleDisconnect)
        socket.on("connect_error", handleConnectError)
        
        // Escuchar múltiples eventos posibles
        socket.on("posicion-actualizada", handlePositionUpdate)
        socket.on("posicion_actualizada", handlePositionUpdate)
        socket.on("position-updated", handlePositionUpdate)
        socket.on("position_updated", handlePositionUpdate)
        socket.on("vehiclePosition", handlePositionUpdate)
        socket.on("vehicle_position", handlePositionUpdate)

        // Listener para todos los eventos (para debug)
        socket.onAny((eventName: string, ...args: any[]) => {
          console.log(`Evento recibido: ${eventName}`, args)
        })

        connectSocket()

        // Intervalo para solicitar posición cada 5 segundos
        positionInterval = setInterval(() => {
          if (socket?.connected) {
            console.log("Solicitando posición del vehículo 1...")
            console.log("Socket conectado:", socket.connected)
            console.log("Socket ID:", socket.id)
            
            // Probar diferentes mensajes
            socket.emit("obtener-posicion", { id: 1 })
            // También probar variaciones por si acaso
            setTimeout(() => socket?.emit("obtener_posicion", { id: 1 }), 100)
            setTimeout(() => socket?.emit("get-position", { id: 1 }), 200)
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
            socket.off("posicion-actualizada", handlePositionUpdate)
            socket.off("posicion_actualizada", handlePositionUpdate)
            socket.off("position-updated", handlePositionUpdate)
            socket.off("position_updated", handlePositionUpdate)
            socket.off("vehiclePosition", handlePositionUpdate)
            socket.off("vehicle_position", handlePositionUpdate)
            socket.offAny()
            if (socket.connected) {
              socket.disconnect()
            }
          }
        }
      } catch (error) {
        console.error('Error setting up socket:', error)
      }
    }

    if (vehiculosLoaded) {
      const cleanup = setupSocket()
      return () => {
        cleanup?.then((cleanupFn) => cleanupFn?.())
      }
    }
  }, [vehiculosLoaded])

  // Efecto para simular el movimiento de los otros vehículos
  useEffect(() => {
    if (!vehiculosLoaded) return

    const simulationInterval = setInterval(async () => {
      try {
        const vehiculos = await getVehiculos()
        
        // Ensure vehiculos is an array before iterating
        if (Array.isArray(vehiculos)) {
          for (const vehiculo of vehiculos) {
            if (vehicleTrackings[vehiculo.id]) {
              // Usar datos del backend si están disponibles
              try {
                const backendData = await getVehicleTrackingData(vehiculo.id)
                if (backendData) {
                  setVehicleTrackings((prev) => ({
                    ...prev,
                    [vehiculo.id]: backendData
                  }))
                } else {
                  // Fallback a simulación
                  const updatedTracking = updateVehiclePosition(vehicleTrackings[vehiculo.id])
                  setVehicleTrackings((prev) => ({
                    ...prev,
                    [vehiculo.id]: updatedTracking
                  }))
                }
              } catch (error) {
                // En caso de error, usar simulación
                const updatedTracking = updateVehiclePosition(vehicleTrackings[vehiculo.id])
                setVehicleTrackings((prev) => ({
                  ...prev,
                  [vehiculo.id]: updatedTracking
                }))
              }
            }
          }
        } else {
          console.warn('getVehiculos() did not return an array in simulation interval:', vehiculos)
        }
      } catch (error) {
        console.error('Error updating vehicle tracking:', error)
      }
    }, 5000)

    return () => clearInterval(simulationInterval)
  }, [vehiculosLoaded, vehicleTrackings])

  const getTrackingById = (id: number) => {
    return vehicleTrackings[id]
  }

  return (
    <TrackingContext.Provider value={{ vehicleTrackings, getTrackingById, isConnected }}>
      {children}
    </TrackingContext.Provider>
  )
}

export function useTracking() {
  const context = useContext(TrackingContext)
  if (context === undefined) {
    throw new Error("useTracking debe ser usado dentro de un TrackingProvider")
  }
  return context
}
