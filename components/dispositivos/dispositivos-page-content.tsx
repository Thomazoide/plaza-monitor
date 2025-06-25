"use client"

import * as React from "react"
import { PlusCircle, SlidersHorizontal, Wifi, Bluetooth, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Dispositivo, GatewayDevice, BeaconDevice, DeviceType } from "@/types/dispositivos-types"
import type { GreenArea } from "@/types/map-types" // Cambiado de Zona a GreenArea
import type { Escuadra, Vehiculo } from "@/types/escuadras-types"
import ListaDispositivos from "./lista-dispositivos"
import DispositivoFormModal from "./dispositivo-form-modal"
import AsignarGatewayPlazaModal from "./asignar-gateway-plaza-modal" // Renombrado
import AsignarBeaconModal from "./asignar-beacon-escuadra-modal" // Nombre genérico, ya que asigna a escuadra y/o vehículo
import { useToast } from "@/hooks/use-toast"

interface DispositivosPageContentProps {
  initialDispositivos: Dispositivo[]
  plazasDisponibles: GreenArea[] // Cambiado de zonasDisponibles a plazasDisponibles
  escuadrasDisponibles: Escuadra[]
  vehiculosDisponibles: Vehiculo[]
}

export default function DispositivosPageContent({
  initialDispositivos,
  plazasDisponibles, // Cambiado
  escuadrasDisponibles,
  vehiculosDisponibles,
}: DispositivosPageContentProps) {
  const [dispositivos, setDispositivos] = React.useState<Dispositivo[]>(initialDispositivos)
  const [filtroTipo, setFiltroTipo] = React.useState<DeviceType | "todos">("todos")

  const [showCreateModal, setShowCreateModal] = React.useState(false)
  const [editingDispositivo, setEditingDispositivo] = React.useState<Dispositivo | null>(null)

  const [assigningGateway, setAssigningGateway] = React.useState<GatewayDevice | null>(null)
  const [assigningBeacon, setAssigningBeacon] = React.useState<BeaconDevice | null>(null)

  const { toast } = useToast()

  const handleCreateDispositivo = (nuevoDispositivo: Dispositivo) => {
    setDispositivos((prev) => [...prev, { ...nuevoDispositivo, id: nuevoDispositivo.id || `DEV-${Date.now()}` }])
    toast({ title: "Dispositivo Creado", description: `El dispositivo "${nuevoDispositivo.nombre}" ha sido añadido.` })
    setShowCreateModal(false)
    setEditingDispositivo(null)
  }

  const handleUpdateDispositivo = (updatedDispositivo: Dispositivo) => {
    setDispositivos((prev) => prev.map((d) => (d.id === updatedDispositivo.id ? updatedDispositivo : d)))
    toast({
      title: "Dispositivo Actualizado",
      description: `El dispositivo "${updatedDispositivo.nombre}" ha sido modificado.`,
    })
    setShowCreateModal(false)
    setEditingDispositivo(null)
  }

  const handleDeleteDispositivo = (dispositivoId: string) => {
    const dispositivo = dispositivos.find((d) => d.id === dispositivoId)
    setDispositivos((prev) => prev.filter((d) => d.id !== dispositivoId))
    toast({
      title: "Dispositivo Eliminado",
      description: `El dispositivo "${dispositivo?.nombre}" ha sido eliminado.`,
      variant: "destructive",
    })
  }

  const handleOpenAssignGatewayModal = (gateway: GatewayDevice) => {
    setAssigningGateway(gateway)
  }

  const handleAssignGateway = (gatewayId: string, plazaId: string | null) => {
    setDispositivos((prev) =>
      prev.map((d) => {
        if (d.id === gatewayId && d.tipo === "gateway") {
          const plaza = plazasDisponibles.find((p) => p.id.toString() === plazaId)
          return {
            ...d,
            greenAreaId: plazaId ?? undefined,
            greenArea: plaza ?? undefined,
            estado: plazaId ? "activo" : "sin asignar",
          } as GatewayDevice
        }
        return d
      }),
    )
    const gateway = dispositivos.find((d) => d.id === gatewayId) as GatewayDevice
    const plaza = plazasDisponibles.find((p) => p.id.toString() === plazaId)
    toast({
      title: "Gateway Asignado",
      description: `Gateway "${gateway?.nombre}" ${plazaId ? `asignado a plaza "${plaza?.name}"` : "desasignado"}.`,
    })
    setAssigningGateway(null)
  }

  const handleOpenAssignBeaconModal = (beacon: BeaconDevice) => {
    setAssigningBeacon(beacon)
  }

  const handleAssignBeacon = (beaconId: string, escuadraId: string | null, vehiculoId: string | null) => {
    setDispositivos((prev) =>
      prev.map((d) => {
        if (d.id === beaconId && d.tipo === "beacon") {
          const escuadra = escuadrasDisponibles.find((e) => e.id.toString() === escuadraId)
          const vehiculo = vehiculosDisponibles.find((v) => v.id.toString() === vehiculoId)
          return {
            ...d,
            escuadraId: escuadraId ?? undefined,
            escuadra: escuadra ?? undefined,
            vehiculoId: vehiculoId ?? undefined,
            vehiculo: vehiculo ?? undefined,
            estado: escuadraId || vehiculoId ? "activo" : "sin asignar",
          } as BeaconDevice
        }
        return d
      }),
    )
    const beacon = dispositivos.find((d) => d.id === beaconId) as BeaconDevice
    const escuadra = escuadrasDisponibles.find((e) => e.id.toString() === escuadraId)
    const vehiculo = vehiculosDisponibles.find((v) => v.id.toString() === vehiculoId)

    let assignmentText = ""
    if (escuadraId && vehiculoId) {
      assignmentText = `asignado a escuadra "${escuadra?.nombre}" y vehículo "${vehiculo?.patente}"`
    } else if (escuadraId) {
      assignmentText = `asignado a escuadra "${escuadra?.nombre}"`
    } else if (vehiculoId) {
      assignmentText = `asignado a vehículo "${vehiculo?.patente}"`
    } else {
      assignmentText = "desasignado"
    }

    toast({
      title: "Beacon Asignado",
      description: `Beacon "${beacon?.nombre}" ${assignmentText}.`,
    })
    setAssigningBeacon(null)
  }

  const dispositivosFiltrados = React.useMemo(() => {
    if (filtroTipo === "todos") return dispositivos
    return dispositivos.filter((d) => d.tipo === filtroTipo)
  }, [dispositivos, filtroTipo])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Tabs value={filtroTipo} onValueChange={(value) => setFiltroTipo(value as DeviceType | "todos")}>
          <TabsList>
            <TabsTrigger value="todos">
              <SlidersHorizontal className="w-4 h-4 mr-2" /> Todos
            </TabsTrigger>
            <TabsTrigger value="gateway">
              <Wifi className="w-4 h-4 mr-2" /> Gateways
            </TabsTrigger>
            <TabsTrigger value="beacon">
              <Bluetooth className="w-4 h-4 mr-2" /> Beacons
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <Button
          onClick={() => {
            setEditingDispositivo(null)
            setShowCreateModal(true)
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Añadir Dispositivo
        </Button>
      </div>

      {dispositivosFiltrados.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-lg">No hay dispositivos para mostrar.</p>
          <p>Intenta cambiar los filtros o añade un nuevo dispositivo.</p>
        </div>
      ) : (
        <ListaDispositivos
          dispositivos={dispositivosFiltrados}
          onEdit={(dispositivo) => {
            setEditingDispositivo(dispositivo)
            setShowCreateModal(true)
          }}
          onDelete={handleDeleteDispositivo}
          onAssignGateway={handleOpenAssignGatewayModal}
          onAssignBeacon={handleOpenAssignBeaconModal}
        />
      )}

      {showCreateModal && (
        <DispositivoFormModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false)
            setEditingDispositivo(null)
          }}
          onSubmit={editingDispositivo ? handleUpdateDispositivo : handleCreateDispositivo}
          initialData={editingDispositivo}
        />
      )}

      {assigningGateway && (
        <AsignarGatewayPlazaModal // Renombrado
          gateway={assigningGateway}
          plazas={plazasDisponibles} // Cambiado
          onAssign={handleAssignGateway}
          onCancel={() => setAssigningGateway(null)}
        />
      )}

      {assigningBeacon && (
        <AsignarBeaconModal
          beacon={assigningBeacon}
          escuadras={escuadrasDisponibles}
          vehiculos={vehiculosDisponibles} // Añadido
          onAssign={handleAssignBeacon}
          onCancel={() => setAssigningBeacon(null)}
        />
      )}
    </div>
  )
}
