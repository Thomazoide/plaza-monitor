import { io, Socket } from "socket.io-client"

let socketInstance: Socket | null = null

export const getSocket = async (): Promise<Socket> => {
  if (socketInstance && socketInstance.connected) {
    return socketInstance
  }

  try {
    // Obtener el endpoint del backend
    const endpointResponse = await fetch('/api/get-backend-endpoint')
    if (!endpointResponse.ok) {
      throw new Error('Error al obtener el endpoint del backend')
    }
    const { endpoint } = await endpointResponse.json()

    // Crear nueva instancia de socket
    socketInstance = io(`${endpoint}/position`, {
      autoConnect: false,
      transports: ["websocket", "polling"],
      timeout: 20000,
      forceNew: true,
    })

    return socketInstance
  } catch (error) {
    console.error('Error getting socket:', error)
    // Fallback al endpoint por defecto
    socketInstance = io("localhost:8888/position", {
      autoConnect: false,
      transports: ["websocket", "polling"],
      timeout: 20000,
      forceNew: true,
    })
    return socketInstance
  }
}

// Función para obtener el socket existente (sin crear uno nuevo)
export const getExistingSocket = (): Socket | null => {
  return socketInstance
}

// Función para limpiar el socket
export const cleanupSocket = (): void => {
  if (socketInstance) {
    socketInstance.disconnect()
    socketInstance = null
  }
}
