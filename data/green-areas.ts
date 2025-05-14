import type { GreenArea } from "@/types/map-types"

// Datos de áreas verdes reales de Puente Alto (coordenadas aproximadas)
export const greenAreas: GreenArea[] = [
  {
    id: 1,
    name: "Plaza de Puente Alto",
    coordinates: [
      { lat: -33.609284412283095, lng: -70.57592524032991 },
      { lat: -33.60984634865028, lng: -70.57583025376978 },
      { lat: -33.60972359587313, lng: -70.5750343319034 },
      { lat: -33.60918893729279, lng: -70.57515552165246 },
    ],
    lastVisited: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 horas atrás
    info: "Plaza principal de la comuna, ubicada frente a la Municipalidad",
  },
  {
    id: 2,
    name: "Parque Juan Pablo II",
    coordinates: [
      { lat: -33.6219470658146, lng: -70.61278424551158 },
      { lat: -33.62236584755271, lng: -70.61782663983854 },
      { lat: -33.6258592895883, lng: -70.6175884164846 },
      { lat: -33.6252642022165, lng: -70.61267836846571 },
    ],
    lastVisited: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 días atrás
    info: "Parque urbano con áreas verdes, juegos infantiles y zonas deportivas",
  },
  {
    id: 3,
    name: "Parque Gabriela Mistral",
    coordinates: [
      { lat: -33.5923, lng: -70.5953 },
      { lat: -33.5923, lng: -70.5933 },
      { lat: -33.5943, lng: -70.5933 },
      { lat: -33.5943, lng: -70.5953 },
    ],
    lastVisited: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 días atrás
    info: "Parque con áreas verdes y espacios recreativos",
  },
  {
    id: 4,
    name: "Plaza Arturo Prat",
    coordinates: [
      { lat: -33.6097, lng: -70.5783 },
      { lat: -33.6097, lng: -70.5773 },
      { lat: -33.6107, lng: -70.5773 },
      { lat: -33.6107, lng: -70.5783 },
    ],
    lastVisited: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 día atrás
    info: "Plaza histórica de Puente Alto",
  },
  {
    id: 5,
    name: "Parque Las Vizcachas",
    coordinates: [
      { lat: -33.5833, lng: -70.5553 },
      { lat: -33.5833, lng: -70.5533 },
      { lat: -33.5853, lng: -70.5533 },
      { lat: -33.5853, lng: -70.5553 },
    ],
    lastVisited: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 días atrás
    info: "Parque con áreas verdes y senderos para caminatas",
  },
  {
    id: 6,
    name: "Plaza Padre Hurtado",
    coordinates: [
      { lat: -33.5973, lng: -70.5883 },
      { lat: -33.5973, lng: -70.5873 },
      { lat: -33.5983, lng: -70.5873 },
      { lat: -33.5983, lng: -70.5883 },
    ],
    lastVisited: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 días atrás
    info: "Plaza con juegos infantiles y áreas de descanso",
  },
  {
    id: 7,
    name: "Parque Protectora de la Infancia",
    coordinates: [
      { lat: -33.5903, lng: -70.5953 },
      { lat: -33.5903, lng: -70.5933 },
      { lat: -33.5923, lng: -70.5933 },
      { lat: -33.5923, lng: -70.5953 },
    ],
    lastVisited: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 horas atrás
    info: "Parque con áreas verdes y espacios recreativos",
  },
  {
    id: 8,
    name: "Plaza Anibal Pinto",
    coordinates: [
      { lat: -33.6147, lng: -70.5793 },
      { lat: -33.6147, lng: -70.5783 },
      { lat: -33.6157, lng: -70.5783 },
      { lat: -33.6157, lng: -70.5793 },
    ],
    lastVisited: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 días atrás
    info: "Plaza con áreas verdes y juegos infantiles",
  },
  {
    id: 9,
    name: "Plaza Los Aromos",
    coordinates: [
      { lat: -33.6047, lng: -70.5693 },
      { lat: -33.6047, lng: -70.5683 },
      { lat: -33.6057, lng: -70.5683 },
      { lat: -33.6057, lng: -70.5693 },
    ],
    lastVisited: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 días atrás
    info: "Plaza vecinal con áreas verdes",
  },
  {
    id: 10,
    name: "Parque El Canelo",
    coordinates: [
      { lat: -33.5953, lng: -70.5753 },
      { lat: -33.5953, lng: -70.5733 },
      { lat: -33.5973, lng: -70.5733 },
      { lat: -33.5973, lng: -70.5753 },
    ],
    lastVisited: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 días atrás
    info: "Parque con áreas verdes y zonas de picnic",
  },
  {
    id: 11,
    name: "Plaza Los Quillayes",
    coordinates: [
      { lat: -33.6023, lng: -70.5823 },
      { lat: -33.6023, lng: -70.5813 },
      { lat: -33.6033, lng: -70.5813 },
      { lat: -33.6033, lng: -70.5823 },
    ],
    lastVisited: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 día atrás
    info: "Plaza con juegos infantiles",
  },
  {
    id: 12,
    name: "Parque Maipo",
    coordinates: [
      { lat: -33.6203, lng: -70.5703 },
      { lat: -33.6203, lng: -70.5683 },
      { lat: -33.6223, lng: -70.5683 },
      { lat: -33.6223, lng: -70.5703 },
    ],
    lastVisited: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 días atrás
    info: "Parque natural junto al río Maipo",
  },
]
