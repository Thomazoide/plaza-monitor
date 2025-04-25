import MapComponent from "@/components/map-component"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4">
      <div className="w-full max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Mapa de Áreas Verdes de Puente Alto</h1>

        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-lg font-semibold text-blue-700 mb-2">Instrucciones</h2>
          <ul className="list-disc pl-5 space-y-1 text-blue-800">
            <li>Usa los controles de zoom (+/-) para acercar o alejar el mapa</li>
            <li>Pasa el cursor sobre las áreas verdes para ver información detallada</li>
            <li>Haz clic en un área para centrar el mapa en ella</li>
            <li>Usa el botón "Ver todas las áreas" para mostrar todas las áreas verdes</li>
            <li>Los colores indican cuándo fue la última visita al área</li>
          </ul>
        </div>

        <div className="border rounded-lg overflow-hidden shadow-lg">
          <MapComponent />
        </div>

        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Simbología</h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-green-500 opacity-60 mr-2"></div>
              <span>Visitado recientemente (menos de 24 horas)</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-orange-500 opacity-60 mr-2"></div>
              <span>Visitado hace más de 24 horas y menos de 3 días</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-red-500 opacity-60 mr-2"></div>
              <span>Visitado hace más de 3 días</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
