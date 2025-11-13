"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import FormVisor from "@/components/formularios/formulario-visor"
import { fetchVisitFormsByZona, fetchVisitFormsUnassigned } from "@/data/visit-forms-data"
import { fetchGreenAreas } from "@/data/zonas-data"
import type { VisitFormType } from "@/types/visitForms-types"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default function ReportesPage() {
    const UNASSIGNED_ZONE_ID = -1
	const [selectedZonaId, setSelectedZonaId] = useState<number | null>(null)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [forms, setForms] = useState<VisitFormType[]>([])
	const [search, setSearch] = useState("")

		const [zonas, setZonas] = useState<{ id: number; name: string }[]>([])

		useEffect(() => {
			let cancelled = false
			const loadZonas = async () => {
				const areas = await fetchGreenAreas()
				if (!cancelled) setZonas(areas.map(z => ({ id: z.id, name: z.name })))
			}
			loadZonas()
			return () => { cancelled = true }
		}, [])

	useEffect(() => {
		if (selectedZonaId == null) return
		let cancelled = false
		const load = async () => {
			setLoading(true)
			setError(null)
			try {
				const data = selectedZonaId === UNASSIGNED_ZONE_ID
					? await fetchVisitFormsUnassigned()
					: await fetchVisitFormsByZona(selectedZonaId)
				if (!cancelled) setForms(data)
			} catch (e: any) {
				if (!cancelled) setError(e?.message ?? 'Error al cargar reportes')
			} finally {
				if (!cancelled) setLoading(false)
			}
		}
		load()
		return () => { cancelled = true }
	}, [selectedZonaId])

	const filteredZonas = zonas.filter(z => z.name.toLowerCase().includes(search.toLowerCase()))

		return (
			<SidebarProvider>
				<div className="flex h-screen bg-background text-foreground">
					<AppSidebar />
					<SidebarInset className="flex-1">
						<div className="flex flex-col h-full">
							<header className="bg-background border-b p-4">
								<div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
									<div>
										<h1 className="text-2xl font-bold">Reportes por Zona</h1>
										<p className="text-muted-foreground">Selecciona un área verde para ver sus formularios de visita.</p>
									</div>
									<Input placeholder="Buscar zona..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
								</div>
							</header>
							<main className="flex-1 overflow-x-hidden overflow-y-auto p-6 space-y-6">
								<Card>
									<CardHeader>
										<CardTitle>Zonas</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="flex flex-wrap gap-2">
		                                    {/* Opción para ver formularios sin zona */}
		                                    <Button
		                                            key="sin-zona"
		                                            variant={selectedZonaId === UNASSIGNED_ZONE_ID ? "default" : "outline"}
		                                            onClick={() => setSelectedZonaId(UNASSIGNED_ZONE_ID)}
		                                    >
		                                            Sin zona
		                                    </Button>
											{filteredZonas.map((z) => (
												<Button
													key={z.id}
													variant={selectedZonaId === z.id ? "default" : "outline"}
													onClick={() => setSelectedZonaId(z.id)}
												>
													{z.name}
												</Button>
											))}
											{filteredZonas.length === 0 && (
												<span className="text-sm text-muted-foreground">No hay zonas que coincidan con la búsqueda.</span>
											)}
										</div>
									</CardContent>
								</Card>

								<div>
									{!selectedZonaId && (
										<Card>
											<CardContent className="p-6 text-muted-foreground">Selecciona una zona para ver sus reportes.</CardContent>
										</Card>
									)}

									{selectedZonaId && (
										<div className="space-y-4">
											<div className="flex items-center gap-3">
												<h2 className="text-xl font-semibold">Reportes de la zona</h2>
												{selectedZonaId === UNASSIGNED_ZONE_ID ? (
													<Badge variant="secondary">Sin zona</Badge>
												) : (
													<Badge variant="secondary">Zona ID: {selectedZonaId}</Badge>
												)}
											</div>
											{loading && (
												<Card>
													<CardContent className="p-6">Cargando reportes...</CardContent>
												</Card>
											)}
											{error && (
												<Card>
													<CardContent className="p-6 text-red-600">{error}</CardContent>
												</Card>
											)}
											{!loading && !error && <FormVisor forms={forms} />}
										</div>
									)}
								</div>
							</main>
						</div>
					</SidebarInset>
				</div>
			</SidebarProvider>
		)
}
