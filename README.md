# Plaza Monitor

Aplicación web construida con Next.js 14 para visualizar y administrar en tiempo real la operación de áreas verdes de una comuna. El panel integra mapas, dashboards y módulos de gestión para coordinar equipos en terreno, dispositivos IoT y órdenes de trabajo que provienen de un backend REST.

## Características principales
- **Panel operativo** con métricas de cobertura, alertas y análisis de tendencias calculados a partir de los datos de zonas verdes (`components/dashboard.tsx`, `utils/statistics.ts`).
- **Mapa en tiempo real** que usa Google Maps y WebSockets (`lib/socket.ts`, `context/tracking-context.tsx`) para seguir la flota municipal y actualizar recorridos con animaciones suaves.
- **Gestión de recursos** para trabajadores, supervisores, equipos, vehículos y zonas; cada módulo consume los endpoints del backend desde el directorio `data/` y comparte componentes de interfaz (`components/ui`).
- **Administración de dispositivos** beacon con formularios de alta, edición, asignaciones y alertas de batería (`components/dispositivos`).
- **Órdenes de trabajo** end-to-end: creación, edición y eliminación sincronizadas con el servicio externo, incluyendo asignación opcional de equipo y zona (`components/ordenes`, `data/work-orders-data.ts`).
- **Reportes y registros históricos** con filtros por fecha y zona para auditar visitas, incidencias y formularios asociados.

## Arquitectura y stack
- Next.js (App Router) con componentes cliente en `app/` y proveedores compartidos (`TrackingProvider`, `ReactQueryProvider`).
- Tailwind CSS y la librería de componentes basada en Radix (shadcn/ui) para construir la interfaz responsiva.
- React Query para caches declarativos cuando se requiere sincronizar datos remotos.
- Integración con Google Maps JavaScript API y Socket.IO para telemetría vehicular.
- Consumo centralizado de servicios REST mediante funciones en `data/`, que resuelven el endpoint mediante `/api/get-backend-endpoint` para permitir configuraciones locales o productivas.

## Flujo de datos
1. El front obtiene el endpoint del backend (`/api/get-backend-endpoint`) y llama a los recursos correspondientes (`ordenes`, `vehiculos`, `zonas`, etc.).
2. Los datos se normalizan en las utilidades de `data/` para uniformar fechas, relaciones (ej. `zonaID`, `equipo`) y payloads de formularios.
3. Los contextos (`TrackingProvider`) y hooks de cada módulo mantienen el estado derivado y actualizan la UI sin refrescar la página.
4. Los eventos en vivo llegan vía Socket.IO y actualizan la posición de los vehículos, manteniendo la ruta reciente en memoria.

## Desarrollo
- Instala dependencias con `pnpm install`.
- Ejecuta el entorno de desarrollo con `pnpm dev` y define las variables requeridas para Google Maps y el backend (ver `app/api/get-map-key` y `app/api/get-backend-endpoint`).
- Ajusta o extiende los módulos reutilizando las funciones del directorio `data/` y los componentes UI compartidos.
