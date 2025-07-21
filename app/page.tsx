"use client"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import Dashboard from "@/components/dashboard"
import DatabaseVehiclesMap from "@/components/database-vehicles-map"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { TrackingProvider } from "@/context/tracking-context"
import { getEquipos, getVehiculos } from "@/data/escuadras-data"
import type { Equipo, Vehiculo } from "@/types/escuadras-types"

export default function HomePage() {
  const [equipos, setEquipos] = useState<Equipo[]>([])
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [equiposData, vehiculosData] = await Promise.all([
          getEquipos(),
          getVehiculos()
        ])
        setEquipos(equiposData)
        setVehiculos(vehiculosData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleVehiculosUpdate = (updatedVehiculos: Vehiculo[]) => {
    setVehiculos(updatedVehiculos)
  }
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
                  <h2 className="text-xl font-bold mb-4 text-gray-800">Mapa de Vehículos en Tiempo Real</h2>
                  {loading ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      <span className="ml-2 text-gray-600">Cargando datos...</span>
                    </div>
                  ) : (
                    <DatabaseVehiclesMap 
                      vehiculos={vehiculos} 
                      equipos={equipos}
                      onVehiculosUpdate={handleVehiculosUpdate}
                    />
                  )}
                </div>
              </main>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TrackingProvider>
  )
}
