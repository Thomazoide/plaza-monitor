import { AppSidebar } from "@/components/app-sidebar"
import DispositivosPageContent from "@/components/dispositivos/dispositivos-page-content"
import { dispositivosData } from "@/data/dispositivos-data"
import { greenAreas } from "@/data/green-areas"
import { escuadras, vehiculos } from "@/data/escuadras-data"
import { SidebarProvider } from "@/components/ui/sidebar"

export default async function DispositivosPage() {
  // En una aplicación real, estos datos vendrían de una API o base de datos
  const initialDispositivos = dispositivosData
  const plazasDisponibles = greenAreas
  const escuadrasDisponibles = escuadras
  const vehiculosDisponibles = vehiculos

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background text-foreground">
        <AppSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-background border-b p-4">
            <h1 className="text-2xl font-semibold">Gestión de Dispositivos</h1>
          </header>
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
            <DispositivosPageContent
              initialDispositivos={initialDispositivos}
              plazasDisponibles={plazasDisponibles}
              escuadrasDisponibles={escuadrasDisponibles}
              vehiculosDisponibles={vehiculosDisponibles}
            />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
