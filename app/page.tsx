"use client"

import { useState } from "react"
import MapComponent from "@/components/map-component"
import Dashboard from "@/components/dashboard"
import { ChevronDown, ChevronUp } from "lucide-react"

export default function Home() {
  const [isMapExpanded, setIsMapExpanded] = useState(false)

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 bg-gray-50">
      <div className="w-full max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Sistema de Monitoreo de Áreas Verdes de Puente Alto
        </h1>

        {/* Dashboard Completo */}
        <Dashboard />

        {/* Mapa desplegable */}
        <div className="mt-6 border rounded-lg overflow-hidden shadow-lg bg-white">
          <div
            className="bg-blue-600 text-white p-3 flex justify-between items-center cursor-pointer hover:bg-blue-700 transition-colors"
            onClick={() => setIsMapExpanded(!isMapExpanded)}
          >
            <h2 className="text-lg font-semibold flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              Mapa Interactivo de Áreas Verdes
            </h2>
            <button className="p-1 rounded hover:bg-blue-500 transition-colors">
              {isMapExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>

          {isMapExpanded && (
            <>
              <div className="p-4 bg-blue-50 border-t border-b border-blue-200">
                <h3 className="text-md font-semibold text-blue-700 mb-2">Instrucciones</h3>
                <ul className="list-disc pl-5 space-y-1 text-blue-800 text-sm">
                  <li>Usa los controles de zoom (+/-) para acercar o alejar el mapa</li>
                  <li>Pasa el cursor sobre las áreas verdes para ver información detallada</li>
                  <li>Haz clic en un área para centrar el mapa en ella</li>
                  <li>Usa el botón "Ver todas las áreas" para mostrar todas las áreas verdes</li>
                  <li>Los colores indican cuándo fue la última visita al área</li>
                </ul>
              </div>

              <MapComponent />

              <div className="p-4 bg-gray-100 border-t">
                <h3 className="text-md font-semibold mb-2">Simbología</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-green-500 opacity-60 mr-2"></div>
                    <span className="text-sm">Visitado recientemente (menos de 24 horas)</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-orange-500 opacity-60 mr-2"></div>
                    <span className="text-sm">Visitado hace más de 24 horas y menos de 3 días</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-red-500 opacity-60 mr-2"></div>
                    <span className="text-sm">Visitado hace más de 3 días</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
