"use client"

// DEPRECATED: This component is no longer used. 
// The new beacon management is handled in dispositivos-page-content.tsx
// This file is kept for reference only.

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Edit3, Trash2, MapPin, Users, Truck, Link2, Unlink2 } from "lucide-react"
import type { Dispositivo, GatewayDevice, BeaconDevice } from "@/types/dispositivos-types"
import type { Beacon } from "@/types/beacon-types"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface ListaDispositivosProps {
  dispositivos: Dispositivo[]
  onEdit: (dispositivo: Dispositivo) => void
  onDelete: (dispositivoId: string) => void
  onAssignGateway: (gateway: GatewayDevice) => void
  onAssignBeacon: (beacon: BeaconDevice) => void
}

const getStatusBadgeVariant = (
  status: "activo" | "inactivo" | "mantenimiento" | "sin asignar",
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "activo":
      return "default"
    case "inactivo":
      return "secondary"
    case "mantenimiento":
      return "destructive"
    case "sin asignar":
      return "outline"
    default:
      return "secondary"
  }
}

export default function ListaDispositivos({
  dispositivos,
  onEdit,
  onDelete,
  onAssignGateway,
  onAssignBeacon,
}: ListaDispositivosProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    try {
      return format(new Date(dateString), "dd MMM yyyy, HH:mm", { locale: es })
    } catch (error) {
      return "Fecha inválida"
    }
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>ID Físico</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Asignado a</TableHead>
            <TableHead>Última Conexión</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dispositivos.map((dispositivo) => (
            <TableRow key={dispositivo.id}>
              <TableCell className="font-medium">{dispositivo.nombre}</TableCell>
              <TableCell>{dispositivo.id}</TableCell>
              <TableCell>
                <Badge variant={dispositivo.tipo === "gateway" ? "blue" : "green"} className="capitalize">
                  {dispositivo.tipo}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(dispositivo.estado)} className="capitalize">
                  {dispositivo.estado.replace("_", " ")}
                </Badge>
              </TableCell>
              <TableCell>
                {dispositivo.tipo === "gateway" ? (
                  dispositivo.greenArea ? (
                    <span className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-green-600" />
                      {dispositivo.greenArea?.name}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500 italic">No asignado</span>
                  )
                ) : dispositivo.tipo === "beacon" ? (
                  <div className="flex flex-col space-y-1">
                    {(dispositivo as BeaconDevice).equipo && (
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1 text-blue-600" />
                        {(dispositivo as BeaconDevice).equipo?.nombre}
                      </span>
                    )}
                    {(dispositivo as BeaconDevice).vehiculo && (
                      <span className="flex items-center">
                        <Truck className="w-4 h-4 mr-1 text-orange-600" />
                        {(dispositivo as BeaconDevice).vehiculo?.patente} (
                        {(dispositivo as BeaconDevice).vehiculo?.modelo})
                      </span>
                    )}
                    {!(dispositivo as BeaconDevice).equipo && !(dispositivo as BeaconDevice).vehiculo && (
                      <span className="text-xs text-gray-500 italic">No asignado</span>
                    )}
                  </div>
                ) : (
                  "N/A"
                )}
              </TableCell>
              <TableCell>{formatDate(dispositivo.ultimaConexion)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menú</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(dispositivo)}>
                      <Edit3 className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    {dispositivo.tipo === "gateway" && (
                      <DropdownMenuItem onClick={() => onAssignGateway(dispositivo as GatewayDevice)}>
                        {(dispositivo as GatewayDevice).greenAreaId ? (
                          <Unlink2 className="mr-2 h-4 w-4" />
                        ) : (
                          <Link2 className="mr-2 h-4 w-4" />
                        )}
                        Asignar a Plaza
                      </DropdownMenuItem>
                    )}
                    {dispositivo.tipo === "beacon" && (
                      <DropdownMenuItem onClick={() => onAssignBeacon(dispositivo as BeaconDevice)}>
                        {(dispositivo as BeaconDevice).equipoId || (dispositivo as BeaconDevice).vehiculoId ? (
                          <Unlink2 className="mr-2 h-4 w-4" />
                        ) : (
                          <Link2 className="mr-2 h-4 w-4" />
                        )}
                        Asignar Beacon
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onDelete(dispositivo.id)} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

// Definición de variantes de Badge si no existen globalmente
declare module "@/components/ui/badge" {
  interface BadgeProps {
    variant?: "default" | "secondary" | "destructive" | "outline" | "blue" | "green"
  }
}
