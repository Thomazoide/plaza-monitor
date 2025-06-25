"use client"

import Dashboard from "@/components/dashboard"
import MapComponent from "@/components/map-component"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { vehiculos, escuadras } from "@/data/escuadras-data" // Importar vehiculos y escuadras

export default function HomePage() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-100">
        <AppSidebar />
        <div className="flex-1 flex w-full flex-col overflow-hidden">
          <header className="bg-white shadow-sm p-4">
            <h1 className="text-xl font-semibold text-gray-800">Panel Principal</h1>
          </header>
          <main className="flex-1 overflow-x-hidden overflow-y-auto w-full bg-gray-100 p-4 md:p-6">
            <Dashboard />
            <div className="mt-6 bg-white rounded-lg shadow-lg p-4 md:p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Mapa General de Áreas y Vehículos</h2>
              {/* Pasar vehiculos y escuadras como props */}
              <MapComponent vehiculos={vehiculos} escuadras={escuadras} />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
