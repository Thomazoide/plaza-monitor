import type { Zona } from "@/types/zonas-types"

/**
 * Ejemplo de zonas mock – sustituye por tu llamada a la BD o API real.
 *
 * •  id:           identificador único
 * •  nombre:       nombre legible de la zona
 * •  descripcion:  texto opcional
 * •  activo:       si la zona está habilitada para asignaciones
 */
export const zonas: Zona[] = [
  {
    id: "ZONA-001",
    nombre: "Depósito Principal",
    descripcion: "Área de almacenamiento general",
    activo: true,
  },
  {
    id: "ZONA-002",
    nombre: "Andén de Carga",
    descripcion: "Zona de preparación de pedidos y carga",
    activo: true,
  },
  {
    id: "ZONA-003",
    nombre: "Zona Administrativa",
    descripcion: "Oficinas y servicios",
    activo: false,
  },
]
