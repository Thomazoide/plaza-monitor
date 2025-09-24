


"use client"

import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import type { VisitFormType, NIVEL_DE_BASURA } from "@/types/visitForms-types"
import { formatDateTime } from "@/utils/format"

type Props = {
    forms: VisitFormType[]
}

const basuraColor: Record<NIVEL_DE_BASURA, string> = {
    ALTO: "bg-red-100 text-red-800",
    MEDIO: "bg-yellow-100 text-yellow-800",
    BAJO: "bg-green-100 text-green-800",
}

export default function FormVisor({ forms }: Props) {
    if (!forms || forms.length === 0) {
        return (
            <Card>
                <CardContent className="p-6 text-center text-gray-500">No hay reportes para esta zona.</CardContent>
            </Card>
        )
    }

    return (
        <ScrollArea className="h-[520px] w-full pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {forms.map((form) => (
                    <Card key={form.id} className="overflow-hidden">
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-base">{form.zona?.name ?? `Zona #${form.zona_id}`}</CardTitle>
                            <div className="text-xs text-gray-500">{formatDateTime(form.fecha)}</div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {form.foto && (
                                <a href={form.foto} target="_blank" rel="noreferrer">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={form.foto}
                                        alt={`Foto reporte ${form.id}`}
                                        className="w-full h-40 object-cover rounded"
                                    />
                                </a>
                            )}

                            <div className="flex flex-wrap gap-2">
                                <Badge variant="secondary">Supervisor: {form.supervisor?.fullName ?? form.supervisor_id}</Badge>
                                <Badge className={basuraColor[form.nivel_de_basura]}>Basura: {form.nivel_de_basura}</Badge>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <Flag value={form.requiere_corte_cesped} label="Corte césped" />
                                <Flag value={form.hay_gente_acampando} label="Acampando" />
                                <Flag value={form.mobiliaro_danado} label="Mobiliario dañado" />
                            </div>

                            {form.comentarios && (
                                <p className="text-sm text-gray-700 mt-2">{form.comentarios}</p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </ScrollArea>
    )
}

function Flag({ value, label }: { value: boolean; label: string }) {
    return (
        <div className="flex items-center gap-2">
            <span
                className={`inline-block h-2 w-2 rounded-full ${value ? "bg-green-500" : "bg-gray-300"}`}
                aria-hidden
            />
            <span className="text-gray-600">{label}</span>
        </div>
    )
}