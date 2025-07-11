"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { TrackingData, VehiclePosition, SocketPositionResponse, VehicleApiResponse } from "@/types/tracking-types"
import { vehiculos as allVehicles } from "@/data/escuadras-data"
import { generateVehicleTracking, updateVehiclePosition } from "@/data/tracking-data"
import { socket } from "@/lib/socket"

interface TrackingContextType {
  vehicleTrackings: Record<number, TrackingData>
  getTrackingById: (id: number) => TrackingData | undefined
  isConnected: boolean
}

const TrackingContext = createContext<TrackingContextType | undefined>(undefined)

export function TrackingProvider({ children }: { children: ReactNode }) {
  const [vehicleTrackings, setVehicleTrackings] = useState<Record<number, TrackingData>>(() => {
    const initialTrackings: Record<number, TrackingData> = {}
    allVehicles.forEach((v) => {
      if (v.estado === "en_uso") {
        initialTrackings[v.id] = generateVehicleTracking(v.id)
      }
    })
    return initialTrackings
  })

  const [isConnected, setIsConnected] = useState(false)

  // Función para obtener datos iniciales del vehículo desde el API
  const fetchVehicleData = async (vehicleId: number) => {
    try {
      const response = await fetch(`https://82p8g0bl-8888.brs.devtunnels.ms/vehiculos/${vehicleId}`)
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
    const connectSocket = () => {
      if (socket.disconnected) {
        socket.connect()
      }
    }

    const handleConnect = () => {
      console.log("Socket conectado:", socket.id)
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

      if (data && data.vehiculoId === 1) {
        setVehicleTrackings((prevTrackings) => {
          const newTrackings = { ...prevTrackings }
          const existingTracking = newTrackings[1]

          const newPosition: VehiclePosition = {
            vehiculoId: data.vehiculoId,
            lat: data.lat,
            lng: data.lng,
            timestamp: new Date(data.timestamp),
            speed: data.speed,
            heading: data.heading,
            status: data.speed > 1 ? "moving" : "stopped",
          }

          const updatedTrackingData: TrackingData = {
            currentPosition: newPosition,
            route: existingTracking ? [...existingTracking.route, newPosition].slice(-100) : [newPosition],
            isOnline: true,
            lastUpdate: new Date(),
          }

          newTrackings[1] = updatedTrackingData
          return newTrackings
        })
      }
    }

    // Configurar eventos del socket
    socket.on("connect", handleConnect)
    socket.on("disconnect", handleDisconnect)
    socket.on("connect_error", handleConnectError)
    socket.on("posicion-actualizada", handlePositionUpdate)
    socket.on("posicion actualizada", handlePositionUpdate) // nuevo nombre con espacio

    // Conectar el socket
    connectSocket()

    // Intervalo para solicitar posición cada 5 segundos
    const positionInterval = setInterval(() => {
      if (socket.connected) {
        console.log("Solicitando posición del vehículo 1...")
        socket.emit("obtener posicion", { id: 1 })
        // socket.emit("obtener-posicion", { id: 1 })
      }
    }, 5000)

    return () => {
      clearInterval(positionInterval)
      socket.off("connect", handleConnect)
      socket.off("disconnect", handleDisconnect)
      socket.off("connect_error", handleConnectError)
      socket.off("posicion-actualizada", handlePositionUpdate)
      socket.off("posicion actualizada", handlePositionUpdate)
      if (socket.connected) {
        socket.disconnect()
      }
    }
  }, [])

  // Efecto para simular el movimiento de los otros vehículos (no el ID 1)
  useEffect(() => {
    const simulationInterval = setInterval(() => {
      setVehicleTrackings((prevTrackings) => {
        const newTrackings = { ...prevTrackings }
        allVehicles.forEach((v) => {
          // Solo simula los que no son el vehículo 1 (que viene del socket)
          if (v.estado === "en_uso" && v.id !== 1 && prevTrackings[v.id]) {
            const updatedTracking = updateVehiclePosition(prevTrackings[v.id])
            newTrackings[v.id] = updatedTracking
          }
        })
        return newTrackings
      })
    }, 5000)

    return () => clearInterval(simulationInterval)
  }, [])

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
