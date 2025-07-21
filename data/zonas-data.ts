import type { Zona } from "@/types/escuadras-types"

/**
 * Ejemplo de zonas mock – sustituye por tu llamada a la BD o API real.
 *
 * •  id:           identificador único
 * •  nombre:       nombre legible de la zona
 * •  descripcion:  texto opcional
 * •  activa:       si la zona está habilitada para asignaciones
 * •  coordenadas:  array de coordenadas lat/lng que definen la zona
 */
export const zonas: Zona[] = [
  {
    id: 1,
    nombre: "Zona Norte",
    descripcion: "Área de mantenimiento zona norte",
    coordenadas: [
      { lat: -33.4989, lng: -70.7539 },
      { lat: -33.4989, lng: -70.7509 },
      { lat: -33.4959, lng: -70.7509 },
      { lat: -33.4959, lng: -70.7539 }
    ],
    activa: true,
  },
  {
    id: 2,
    nombre: "Zona Sur",
    descripcion: "Área de mantenimiento zona sur",
    coordenadas: [
      { lat: -33.5089, lng: -70.7539 },
      { lat: -33.5089, lng: -70.7509 },
      { lat: -33.5119, lng: -70.7509 },
      { lat: -33.5119, lng: -70.7539 }
    ],
    activa: true,
  },
  {
    id: 3,
    nombre: "Zona Este",
    descripcion: "Área de mantenimiento zona este",
    coordenadas: [
      { lat: -33.5059, lng: -70.7509 },
      { lat: -33.5059, lng: -70.7479 },
      { lat: -33.5089, lng: -70.7479 },
      { lat: -33.5089, lng: -70.7509 }
    ],
    activa: false,
  },
  {
    id: 4,
    nombre: "Zona Oeste",
    descripcion: "Área de mantenimiento zona oeste",
    coordenadas: [
      { lat: -33.5059, lng: -70.7569 },
      { lat: -33.5059, lng: -70.7539 },
      { lat: -33.5089, lng: -70.7539 },
      { lat: -33.5089, lng: -70.7569 }
    ],
    activa: true,
  },
  {
    id: 5,
    nombre: "Zona Centro",
    descripcion: "Área de mantenimiento zona centro",
    coordenadas: [
      { lat: -33.5029, lng: -70.7539 },
      { lat: -33.5029, lng: -70.7509 },
      { lat: -33.5059, lng: -70.7509 },
      { lat: -33.5059, lng: -70.7539 }
    ],
    activa: true,
  },
]

// Función para obtener todas las zonas
export function getZonas(): Zona[] {
  return zonas
}

// Función para obtener zona por ID
export function getZonaById(id: number): Zona | undefined {
  return zonas.find(zona => zona.id === id)
}

// Función para obtener zonas activas
export function getZonasActivas(): Zona[] {
  return zonas.filter(zona => zona.activa)
}
