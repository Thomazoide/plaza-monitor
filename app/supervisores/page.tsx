"use client"

import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SupervisoresPageContent } from "@/components/supervisores/supervisores-page-content"

export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="h-4 w-px bg-sidebar-border" />
          <h1 className="text-xl font-semibold">Gestión de Supervisores</h1>
        </div>
        <SupervisoresPageContent />
      </SidebarInset>
    </SidebarProvider>
  )
}
