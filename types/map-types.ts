export interface GreenArea {
  id: number
  name: string
  coordinates: { lat: number; lng: number }[]
  lastVisited: Date
  info: string
}
