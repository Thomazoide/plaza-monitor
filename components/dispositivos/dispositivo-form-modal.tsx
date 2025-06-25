"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Dispositivo, GatewayDevice, BeaconDevice } from "@/types/dispositivos-types"
import { useForm, Controller, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const deviceSchema = z.object({
  id: z.string().min(3, "ID debe tener al menos 3 caracteres.").max(50),
  nombre: z.string().min(3, "Nombre debe tener al menos 3 caracteres.").max(100),
  tipo: z.enum(["gateway", "beacon"], { required_error: "Debe seleccionar un tipo." }),
  estado: z.enum(["activo", "inactivo", "mantenimiento", "sin asignar"], {
    required_error: "Debe seleccionar un estado.",
  }),
  // Campos específicos opcionales
  ipAddress: z.string().ip({ version: "v4", message: "Debe ser una IP válida." }).optional().or(z.literal("")),
  versionFirmware: z.string().max(20).optional().or(z.literal("")),
  nivelBateria: z.coerce.number().min(0).max(100).optional().nullable(),
  txPower: z.coerce.number().optional().nullable(),
})

type DeviceFormData = z.infer<typeof deviceSchema>

interface DispositivoFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Dispositivo) => void
  initialData?: Dispositivo | null
}

export default function DispositivoFormModal({ isOpen, onClose, onSubmit, initialData }: DispositivoFormModalProps) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm<DeviceFormData>({
    resolver: zodResolver(deviceSchema),
    defaultValues: initialData
      ? {
          id: initialData.id,
          nombre: initialData.nombre,
          tipo: initialData.tipo,
          estado: initialData.estado,
          ipAddress: initialData.tipo === "gateway" ? (initialData as GatewayDevice).ipAddress || "" : "",
          versionFirmware: initialData.tipo === "gateway" ? (initialData as GatewayDevice).versionFirmware || "" : "",
          nivelBateria: initialData.tipo === "beacon" ? (initialData as BeaconDevice).nivelBateria || null : null,
          txPower: initialData.tipo === "beacon" ? (initialData as BeaconDevice).txPower || null : null,
        }
      : {
          id: "",
          nombre: "",
          tipo: undefined,
          estado: "sin asignar",
          ipAddress: "",
          versionFirmware: "",
          nivelBateria: null,
          txPower: null,
        },
  })

  React.useEffect(() => {
    if (initialData) {
      reset({
        id: initialData.id,
        nombre: initialData.nombre,
        tipo: initialData.tipo,
        estado: initialData.estado,
        ipAddress: initialData.tipo === "gateway" ? (initialData as GatewayDevice).ipAddress || "" : "",
        versionFirmware: initialData.tipo === "gateway" ? (initialData as GatewayDevice).versionFirmware || "" : "",
        nivelBateria: initialData.tipo === "beacon" ? (initialData as BeaconDevice).nivelBateria || null : null,
        txPower: initialData.tipo === "beacon" ? (initialData as BeaconDevice).txPower || null : null,
      })
    } else {
      reset({
        id: "",
        nombre: "",
        tipo: undefined,
        estado: "sin asignar",
        ipAddress: "",
        versionFirmware: "",
        nivelBateria: null,
        txPower: null,
      })
    }
  }, [initialData, reset])

  const tipoSeleccionado = watch("tipo")

  const processSubmit: SubmitHandler<DeviceFormData> = (data) => {
    const commonData = {
      id: data.id,
      nombre: data.nombre,
      tipo: data.tipo,
      estado: data.estado,
      fechaAgregado: initialData?.fechaAgregado || new Date().toISOString(),
      ultimaConexion: initialData?.ultimaConexion, // Mantener si existe
    }

    let dispositivoFinal: Dispositivo

    if (data.tipo === "gateway") {
      dispositivoFinal = {
        ...commonData,
        tipo: "gateway",
        ipAddress: data.ipAddress || undefined,
        versionFirmware: data.versionFirmware || undefined,
        zonaId: initialData?.tipo === "gateway" ? (initialData as GatewayDevice).zonaId : undefined,
        zona: initialData?.tipo === "gateway" ? (initialData as GatewayDevice).zona : undefined,
      } as GatewayDevice
    } else {
      dispositivoFinal = {
        ...commonData,
        tipo: "beacon",
        nivelBateria: data.nivelBateria ?? undefined,
        txPower: data.txPower ?? undefined,
        escuadraId: initialData?.tipo === "beacon" ? (initialData as BeaconDevice).escuadraId : undefined,
        escuadra: initialData?.tipo === "beacon" ? (initialData as BeaconDevice).escuadra : undefined,
      } as BeaconDevice
    }
    onSubmit(dispositivoFinal)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Dispositivo" : "Añadir Nuevo Dispositivo"}</DialogTitle>
          <DialogDescription>
            {initialData
              ? "Modifica los detalles del dispositivo."
              : "Completa la información para registrar un nuevo dispositivo."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(processSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nombre" className="text-right">
              Nombre
            </Label>
            <Input id="nombre" {...register("nombre")} className="col-span-3" />
            {errors.nombre && <p className="col-span-4 text-red-500 text-xs text-right">{errors.nombre.message}</p>}
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="id" className="text-right">
              ID Dispositivo
            </Label>
            <Input
              id="id"
              {...register("id")}
              className="col-span-3"
              disabled={!!initialData}
              placeholder="Ej: GW-001-ABC o MAC"
            />
            {errors.id && <p className="col-span-4 text-red-500 text-xs text-right">{errors.id.message}</p>}
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="tipo" className="text-right">
              Tipo
            </Label>
            <Controller
              name="tipo"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!initialData}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gateway">Gateway</SelectItem>
                    <SelectItem value="beacon">Beacon</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.tipo && <p className="col-span-4 text-red-500 text-xs text-right">{errors.tipo.message}</p>}
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="estado" className="text-right">
              Estado
            </Label>
            <Controller
              name="estado"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar estado..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                    <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                    <SelectItem value="sin asignar">Sin Asignar</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.estado && <p className="col-span-4 text-red-500 text-xs text-right">{errors.estado.message}</p>}
          </div>

          {tipoSeleccionado === "gateway" && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ipAddress" className="text-right">
                  Dirección IP
                </Label>
                <Input id="ipAddress" {...register("ipAddress")} className="col-span-3" placeholder="Opcional" />
                {errors.ipAddress && (
                  <p className="col-span-4 text-red-500 text-xs text-right">{errors.ipAddress.message}</p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="versionFirmware" className="text-right">
                  Firmware
                </Label>
                <Input
                  id="versionFirmware"
                  {...register("versionFirmware")}
                  className="col-span-3"
                  placeholder="Opcional"
                />
                {errors.versionFirmware && (
                  <p className="col-span-4 text-red-500 text-xs text-right">{errors.versionFirmware.message}</p>
                )}
              </div>
            </>
          )}

          {tipoSeleccionado === "beacon" && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nivelBateria" className="text-right">
                  Nivel Batería (%)
                </Label>
                <Input
                  id="nivelBateria"
                  type="number"
                  {...register("nivelBateria")}
                  className="col-span-3"
                  placeholder="Opcional (0-100)"
                />
                {errors.nivelBateria && (
                  <p className="col-span-4 text-red-500 text-xs text-right">{errors.nivelBateria.message}</p>
                )}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="txPower" className="text-right">
                  Potencia TX (dBm)
                </Label>
                <Input
                  id="txPower"
                  type="number"
                  {...register("txPower")}
                  className="col-span-3"
                  placeholder="Opcional"
                />
                {errors.txPower && (
                  <p className="col-span-4 text-red-500 text-xs text-right">{errors.txPower.message}</p>
                )}
              </div>
            </>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit">{initialData ? "Guardar Cambios" : "Crear Dispositivo"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
