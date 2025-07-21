import { AppSidebar } from "@/components/app-sidebar"
import DispositivosPageContent from "@/components/dispositivos/dispositivos-page-content"
import { SidebarProvider } from "@/components/ui/sidebar"

export default async function DispositivosPage() {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background text-foreground">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-background border-b p-4">
            <h1 className="text-2xl font-semibold">Gestión de Dispositivos</h1>
          </header>
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
            <DispositivosPageContent />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
