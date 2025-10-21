"use client"

import { OrdenesDeTrabajoPageContent } from "@/components/ordenes/ordenes-page-content"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

export default function OrdenesDeTrabajoPage() {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
					<SidebarTrigger className="-ml-1" />
					<div className="h-4 w-px bg-sidebar-border" />
					<h1 className="text-xl font-semibold">Órdenes de Trabajo</h1>
				</div>
				<OrdenesDeTrabajoPageContent />
			</SidebarInset>
		</SidebarProvider>
	)
}
