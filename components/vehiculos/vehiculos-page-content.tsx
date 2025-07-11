"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Loader2, Server, HardDrive } from "lucide-react"
import { vehiculos as localVehiculos } from "@/data/escuadras-data"
import type { Vehiculo as LocalVehiculo } from "@/types/escuadras-types"
import { format } from "date-fns"

// Define el tipo para los vehículos del servidor basado en el JSON que proporcionaste
interface ServerVehiculo {
  id: number
  patente: string
  marca: string
  modelo: string
  latitud: number
  longitud: number
  altitud: number
  velocidad: number
  heading: number
  timestamp: string
  equipoID: number | null
  beaconID: number | null
}

// Función para obtener los vehículos del servidor
async function getServerVehiculos(): Promise<ServerVehiculo[]> {
  const response = await fetch("https://82p8g0bl-8888.brs.devtunnels.ms/vehiculos")
  if (!response.ok) {
    throw new Error("La respuesta de la red no fue exitosa")
  }
  const data = await response.json()
  if (data.error || !Array.isArray(data.data)) {
    throw new Error("Formato de datos inválido desde el servidor")
  }
  return data.data
}

export function VehiculosPageContent() {
  // Estado para los vehículos locales (del archivo de datos)
  const [fictitiousVehicles] = useState<LocalVehiculo[]>(localVehiculos)

  // React Query para los vehículos del servidor
  const {
    data: serverVehicles,
    isLoading,
    isError,
    error,
  } = useQuery<ServerVehiculo[], Error>({
    queryKey: ["serverVehicles"],
    queryFn: getServerVehiculos,
    refetchInterval: 5000, // Opcional: Refresca los datos cada 5 segundos
  })

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Vehículos</h1>
        <p className="text-gray-600 mt-1">Visualiza los vehículos registrados en el servidor y los datos locales.</p>
      </div>

      {/* Tarjeta de Vehículos del Servidor */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Server className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle>Vehículos del Servidor</CardTitle>
              <CardDescription>Datos en tiempo real obtenidos desde el endpoint.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              <p className="ml-3 text-gray-600">Cargando vehículos del servidor...</p>
            </div>
          )}
          {isError && (
            <div className="flex items-center justify-center py-8 text-red-600 bg-red-50 p-4 rounded-md">
              <AlertTriangle className="h-6 w-6 mr-3" />
              <div>
                <p className="font-semibold">Error al cargar los datos del servidor.</p>
                <p className="text-sm">{error.message}</p>
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
                    <TableHead>Última Actualización</TableHead>
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
                        {vehiculo.latitud.toFixed(5)}, {vehiculo.longitud.toFixed(5)}
                      </TableCell>
                      <TableCell>{(vehiculo.velocidad * 3.6).toFixed(2)}</TableCell>
                      <TableCell>{format(new Date(vehiculo.timestamp), "dd/MM/yyyy HH:mm:ss")}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {serverVehicles.length === 0 && (
                <p className="text-center text-gray-500 py-8">No se encontraron vehículos en el servidor.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tarjeta de Vehículos Ficticios */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <HardDrive className="h-6 w-6 text-gray-600" />
            <div>
              <CardTitle>Vehículos Ficticios (Locales)</CardTitle>
              <CardDescription>Datos de prueba definidos en la aplicación.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patente</TableHead>
                  <TableHead>Marca / Modelo</TableHead>
                  <TableHead>Año</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fictitiousVehicles.map((vehiculo) => (
                  <TableRow key={vehiculo.id}>
                    <TableCell className="font-mono">{vehiculo.patente}</TableCell>
                    <TableCell>
                      {vehiculo.marca} {vehiculo.modelo}
                    </TableCell>
                    <TableCell>{vehiculo.año}</TableCell>
                    <TableCell className="capitalize">{vehiculo.tipo}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          vehiculo.estado === "disponible"
                            ? "bg-green-100 text-green-800"
                            : vehiculo.estado === "en_uso"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-orange-100 text-orange-800"
                        }
                      >
                        {vehiculo.estado.replace("_", " ")}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
