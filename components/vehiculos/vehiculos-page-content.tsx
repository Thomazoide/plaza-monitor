"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Loader2, Server } from "lucide-react"
import { getVehiculos } from "@/data/escuadras-data"
import type { Vehiculo } from "@/types/escuadras-types"
import { format } from "date-fns"

// Función para obtener los vehículos del servidor usando nuestra función de backend
async function getServerVehiculos(): Promise<Vehiculo[]> {
  return await getVehiculos()
}

export function VehiculosPageContent() {
  // React Query para los vehículos del servidor
  const {
    data: serverVehicles,
    isLoading,
    isError,
    error,
  } = useQuery<Vehiculo[], Error>({
    queryKey: ["serverVehicles"],
    queryFn: getServerVehiculos,
    refetchInterval: 5000, // Opcional: Refresca los datos cada 5 segundos
  })

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Vehículos</h1>
        <p className="text-gray-600 mt-1">Visualiza los vehículos registrados en el sistema.</p>
      </div>

      {/* Tarjeta de Vehículos del Sistema */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Server className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle>Vehículos del Sistema</CardTitle>
              <CardDescription>Datos en tiempo real obtenidos desde el backend.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              <p className="ml-3 text-gray-600">Cargando vehículos...</p>
            </div>
          )}
          {isError && (
            <div className="flex items-center justify-center py-8 text-red-600 bg-red-50 p-4 rounded-md">
              <AlertTriangle className="h-6 w-6 mr-3" />
              <div>
                <p className="font-semibold">Error al cargar los datos.</p>
                <p className="text-sm">{error?.message}</p>
              </div>
            </div>
          )}
          {serverVehicles && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patente</TableHead>
                    <TableHead>Marca / Modelo</TableHead>
                    <TableHead>Coordenadas (Lat, Lng)</TableHead>
                    <TableHead>Velocidad (km/h)</TableHead>
                    <TableHead>Rumbo (°)</TableHead>
                    <TableHead>Última Actualización</TableHead>
                    <TableHead>Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {serverVehicles.map((vehiculo) => (
                    <TableRow key={vehiculo.id}>
                      <TableCell className="font-mono">{vehiculo.patente.toUpperCase()}</TableCell>
                      <TableCell className="capitalize">
                        {vehiculo.marca} {vehiculo.modelo}
                      </TableCell>
                      <TableCell className="font-mono">
                        {vehiculo.latitud ? vehiculo.latitud.toFixed(5) : "N/A"},{" "}
                        {vehiculo.longitud ? vehiculo.longitud.toFixed(5) : "N/A"}
                      </TableCell>
                      <TableCell>{vehiculo.velocidad ? vehiculo.velocidad.toFixed(2) : "0.00"}</TableCell>
                      <TableCell>{vehiculo.heading}°</TableCell>
                      <TableCell>
                        {vehiculo.timestamp ? format(new Date(vehiculo.timestamp), "dd/MM/yyyy HH:mm:ss") : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={vehiculo.velocidad > 5 ? "default" : "secondary"}
                        >
                          {vehiculo.velocidad > 5 ? "En movimiento" : "Detenido"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {serverVehicles.length === 0 && (
                <p className="text-center text-gray-500 py-8">No se encontraron vehículos en el sistema.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
