import { io } from "socket.io-client"

export const socket = io("https://82p8g0bl-8888.brs.devtunnels.ms/position", {
  autoConnect: false,
  transports: ["websocket", "polling"],
  timeout: 20000,
  forceNew: true,
})
