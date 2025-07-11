"use client"

import { AppSidebar } from "@/components/app-sidebar"
import Dashboard from "@/components/dashboard"
import MapComponent from "@/components/map-component"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { TrackingProvider } from "@/context/tracking-context"
import { equipos, vehiculos } from "@/data/escuadras-data"

export default function HomePage() {
  return (
    <TrackingProvider>
      <SidebarProvider>
        <div className="flex h-screen w-full bg-gray-100">
          <AppSidebar />
          <SidebarInset className="flex-1">
            <div className="flex flex-col h-full">
              <header className="bg-white shadow-sm p-4">
                <h1 className="text-xl font-semibold text-gray-800">Panel Principal</h1>
              </header>
              <main className="flex-1 overflow-x-hidden overflow-y-auto w-full bg-gray-100 p-4 md:p-6">
                <Dashboard />
                <div className="mt-6 bg-white rounded-lg shadow-lg p-4 md:p-6">
                  <h2 className="text-xl font-bold mb-4 text-gray-800">Mapa General de Áreas y Vehículos</h2>
                  <MapComponent vehiculos={vehiculos} escuadras={equipos} />
                </div>
              </main>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TrackingProvider>
  )
}
