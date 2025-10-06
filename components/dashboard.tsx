"use client"

import { useState, useEffect } from "react"
import { fetchGreenAreas } from "@/data/zonas-data"
import { calculateAreaStatistics } from "@/utils/statistics"
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Activity,
  BarChart2,
  PieChartIcon,
  Map,
  Info,
  Award,
  Target,
  AlertCircle,
} from "lucide-react"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "details" | "trends" | "performance">("overview")
  const [stats, setStats] = useState<any>(null)
  const [trendPeriod, setTrendPeriod] = useState<"7" | "15" | "30">("30")
  const [showTrendInfo, setShowTrendInfo] = useState(false)

  useEffect(() => {
    const load = async () => {
      const areas = await fetchGreenAreas()
      const statistics = calculateAreaStatistics(areas)
      setStats(statistics)
    }
    load()
  }, [])

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6 flex justify-center items-center h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2">Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  // Verificar que los datos estén disponibles
  console.log("Estado de visitas:", stats.visitStatus)
  console.log("Áreas por días:", stats.areasByDaysSinceVisit)
  console.log("Tendencia de visitas:", stats.visitTrend)
  console.log("Cumplimiento mensual:", stats.monthlyCompliance)

  // Filtrar datos de tendencia según el período seleccionado
  const filteredTrendData = stats.visitTrend.slice(-Number.parseInt(trendPeriod))

  // Calcular estadísticas de tendencia
  const totalVisits = filteredTrendData.reduce((sum: number, day: any) => sum + day.visits, 0)
  const avgVisits = totalVisits / filteredTrendData.length
  const maxVisits = Math.max(...filteredTrendData.map((day: any) => day.visits))
  const minVisits = Math.min(...filteredTrendData.map((day: any) => day.visits))

  // Calcular tendencia (comparando primera mitad vs segunda mitad)
  const halfIndex = Math.floor(filteredTrendData.length / 2)
  const firstHalfAvg =
    filteredTrendData.slice(0, halfIndex).reduce((sum: number, day: any) => sum + day.visits, 0) / halfIndex
  const secondHalfAvg =
    filteredTrendData.slice(halfIndex).reduce((sum: number, day: any) => sum + day.visits, 0) /
    (filteredTrendData.length - halfIndex)
  const trendPercentage = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100
  const trendDirection = trendPercentage >= 0 ? "up" : "down"

  // Calcular estadísticas de cumplimiento
  const currentMonthCompliance = stats.monthlyCompliance[stats.monthlyCompliance.length - 1].compliance
  const previousMonthCompliance = stats.monthlyCompliance[stats.monthlyCompliance.length - 2].compliance
  const complianceChange = currentMonthCompliance - previousMonthCompliance
  const complianceStatus =
    currentMonthCompliance >= 90 ? "success" : currentMonthCompliance >= 80 ? "warning" : "danger"

  // Calcular estadísticas de personal
  const totalStaffVisits = stats.visitsByStaff.reduce(
    (sum: number, staff: any) => sum + staff.completed + staff.pending,
    0,
  )
  const totalCompletedVisits = stats.visitsByStaff.reduce((sum: number, staff: any) => sum + staff.completed, 0)
  const totalPendingVisits = stats.visitsByStaff.reduce((sum: number, staff: any) => sum + staff.pending, 0)
  const overallEfficiency = Math.round((totalCompletedVisits / totalStaffVisits) * 100)

  // Encontrar el miembro del personal más eficiente
  const mostEfficientStaff = [...stats.visitsByStaff].sort((a, b) => {
    const effA = a.completed / (a.completed + a.pending)
    const effB = b.completed / (b.completed + b.pending)
    return effB - effA
  })[0]

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
        <BarChart2 className="mr-2 text-blue-600" />
        Dashboard de Áreas Verdes
      </h2>

      {/* Resumen General */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col">
          <div className="text-blue-500 text-sm font-medium mb-1">Total Áreas</div>
          <div className="text-2xl font-bold text-blue-700">{stats.totalAreas}</div>
          <div className="text-xs text-blue-600 mt-1">Áreas monitoreadas</div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex flex-col">
          <div className="text-green-500 text-sm font-medium mb-1">Visitadas Hoy</div>
          <div className="text-2xl font-bold text-green-700">{stats.visitedToday}</div>
          <div className="text-xs text-green-600 mt-1">Últimas 24 horas</div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 flex flex-col">
          <div className="text-orange-500 text-sm font-medium mb-1">Visita Pendiente</div>
          <div className="text-2xl font-bold text-orange-700">{stats.needingAttention}</div>
          <div className="text-xs text-orange-600 mt-1">+24h sin visita</div>
        </div>

        <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex flex-col">
          <div className="text-red-500 text-sm font-medium mb-1">Críticas</div>
          <div className="text-2xl font-bold text-red-700">{stats.critical}</div>
          <div className="text-xs text-red-600 mt-1">+3 días sin visita</div>
        </div>
      </div>

      {/* Pestañas de navegación */}
      <div className="flex flex-wrap border-b mb-6">
        <button
          className={`px-4 py-2 ${
            activeTab === "overview" ? "border-b-2 border-blue-500 font-semibold" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("overview")}
        >
          <span className="flex items-center">
            <PieChartIcon size={16} className="mr-1" /> Resumen
          </span>
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "details" ? "border-b-2 border-blue-500 font-semibold" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("details")}
        >
          <span className="flex items-center">
            <Map size={16} className="mr-1" /> Detalle de Áreas
          </span>
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "trends" ? "border-b-2 border-blue-500 font-semibold" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("trends")}
        >
          <span className="flex items-center">
            <TrendingUp size={16} className="mr-1" /> Tendencias
          </span>
        </button>
        <button
          className={`px-4 py-2 ${
            activeTab === "performance" ? "border-b-2 border-blue-500 font-semibold" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("performance")}
        >
          <span className="flex items-center">
            <Activity size={16} className="mr-1" /> Rendimiento
          </span>
        </button>
      </div>

      {/* Contenido de las pestañas */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gráfico de estado de visitas */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center">
              <PieChartIcon className="mr-2 text-blue-500" size={18} />
              Estado de Visitas
            </h3>
            <div className="h-64 w-full">
              {/* Gráfico de pastel simplificado */}
              <div className="flex flex-col items-center justify-center h-full">
                <div className="flex space-x-4 mb-4">
                  {stats.visitStatus.map((status: any, index: number) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className="w-20 h-20 rounded-full mb-2"
                        style={{ backgroundColor: status.color, opacity: 0.8 }}
                      >
                        <div className="flex items-center justify-center h-full text-white font-bold text-lg">
                          {status.value}
                        </div>
                      </div>
                      <div className="text-sm font-medium">{status.name}</div>
                      <div className="text-xs text-gray-500">
                        {Math.round((status.value / stats.totalAreas) * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-sm text-gray-600 mt-2">Total: {stats.totalAreas} áreas verdes</div>
              </div>
            </div>
          </div>

          {/* Áreas por tiempo desde última visita */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center">
              <Clock className="mr-2 text-blue-500" size={18} />
              Tiempo desde Última Visita
            </h3>
            <div className="h-64 w-full">
              {/* Gráfico de barras simplificado */}
              <div className="h-full flex flex-col justify-center">
                {stats.areasByDaysSinceVisit.slice(0, 5).map((area: any, index: number) => (
                  <div key={index} className="mb-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium truncate max-w-[150px]">{area.name}</span>
                      <span className="text-sm text-gray-500">{area.days} días</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full ${
                          area.days < 1 ? "bg-green-500" : area.days < 3 ? "bg-orange-500" : "bg-red-500"
                        }`}
                        style={{ width: `${Math.min(100, area.days * 10)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
                {stats.areasByDaysSinceVisit.length > 5 && (
                  <div className="text-sm text-center text-gray-500 mt-2">
                    Mostrando 5 de {stats.areasByDaysSinceVisit.length} áreas
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Alertas y Recomendaciones */}
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm md:col-span-2">
            <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center">
              <AlertTriangle className="mr-2 text-amber-500" size={18} />
              Alertas y Recomendaciones
            </h3>
            <div className="space-y-3">
              {stats.alerts.map((alert: any, index: number) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    alert.type === "warning"
                      ? "bg-amber-50 border-amber-200 text-amber-800"
                      : alert.type === "danger"
                        ? "bg-red-50 border-red-200 text-red-800"
                        : "bg-green-50 border-green-200 text-green-800"
                  }`}
                >
                  <div className="flex items-start">
                    {alert.type === "warning" ? (
                      <AlertTriangle className="mr-2 flex-shrink-0" size={18} />
                    ) : alert.type === "danger" ? (
                      <AlertTriangle className="mr-2 flex-shrink-0" size={18} />
                    ) : (
                      <CheckCircle className="mr-2 flex-shrink-0" size={18} />
                    )}
                    <div>
                      <p className="font-medium">{alert.message}</p>
                      {alert.recommendation && <p className="text-sm mt-1">{alert.recommendation}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "details" && (
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center">
              <MapPin className="mr-2 text-blue-500" size={18} />
              Detalle de Todas las Áreas
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Área
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Última Visita
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tamaño Aprox.
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prioridad
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.areaDetails.map((area: any, index: number) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">{area.name}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{area.lastVisit}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            area.status === "Reciente"
                              ? "bg-green-100 text-green-800"
                              : area.status === "Pendiente"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {area.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{area.size}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{area.type}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            area.priority === "Alta"
                              ? "bg-red-100 text-red-800"
                              : area.priority === "Media"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {area.priority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Distribución por Tipo</h3>
              <div className="h-64 flex flex-col justify-center">
                {stats.areasByType.map((type: any, index: number) => (
                  <div key={index} className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{type.name}</span>
                      <span className="text-sm text-gray-500">{type.value} áreas</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="h-4 rounded-full"
                        style={{
                          width: `${(type.value / stats.totalAreas) * 100}%`,
                          backgroundColor: type.color,
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 text-right">
                      {Math.round((type.value / stats.totalAreas) * 100)}% del total
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Distribución por Tamaño</h3>
              <div className="h-64 flex flex-col justify-center">
                {stats.areasBySize.map((size: any, index: number) => (
                  <div key={index} className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{size.name}</span>
                      <span className="text-sm text-gray-500">{size.count} áreas</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="h-4 rounded-full bg-emerald-500"
                        style={{
                          width: `${(size.count / stats.totalAreas) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 text-right">
                      {Math.round((size.count / stats.totalAreas) * 100)}% del total
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "trends" && (
        <div>
          {/* Cabecera de la pestaña con título y descripción */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <TrendingUp className="mr-2 text-blue-600" size={20} />
                Análisis de Tendencias
              </h3>
              <button
                onClick={() => setShowTrendInfo(!showTrendInfo)}
                className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
              >
                <Info size={16} className="mr-1" />
                {showTrendInfo ? "Ocultar información" : "Mostrar información"}
              </button>
            </div>

            {showTrendInfo && (
              <div className="mt-2 p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
                <p>
                  Esta sección muestra las tendencias de visitas a áreas verdes, el cumplimiento de metas mensuales y el
                  rendimiento del personal. Utilice los filtros para ajustar el período de análisis y obtener
                  información más detallada.
                </p>
              </div>
            )}
          </div>

          {/* Tarjetas de resumen */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-blue-600 text-sm font-medium mb-1">Promedio de Visitas</div>
                  <div className="text-2xl font-bold text-blue-800">{avgVisits.toFixed(1)}</div>
                  <div className="text-xs text-blue-600 mt-1">visitas diarias</div>
                </div>
                <div className={`p-2 rounded-full ${trendDirection === "up" ? "bg-green-100" : "bg-red-100"}`}>
                  {trendDirection === "up" ? (
                    <TrendingUp size={20} className="text-green-600" />
                  ) : (
                    <TrendingDown size={20} className="text-red-600" />
                  )}
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs">
                <span className={trendDirection === "up" ? "text-green-600" : "text-red-600"}>
                  {trendPercentage.toFixed(1)}% {trendDirection === "up" ? "más" : "menos"} que el período anterior
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-green-600 text-sm font-medium mb-1">Cumplimiento Actual</div>
                  <div className="text-2xl font-bold text-green-800">{currentMonthCompliance}%</div>
                  <div className="text-xs text-green-600 mt-1">del objetivo mensual</div>
                </div>
                <div className={`p-2 rounded-full ${complianceChange >= 0 ? "bg-green-100" : "bg-red-100"}`}>
                  {complianceChange >= 0 ? (
                    <TrendingUp size={20} className="text-green-600" />
                  ) : (
                    <TrendingDown size={20} className="text-red-600" />
                  )}
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs">
                <span className={complianceChange >= 0 ? "text-green-600" : "text-red-600"}>
                  {Math.abs(complianceChange).toFixed(1)}% {complianceChange >= 0 ? "mejor" : "peor"} que el mes
                  anterior
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-purple-600 text-sm font-medium mb-1">Eficiencia del Personal</div>
                  <div className="text-2xl font-bold text-purple-800">{overallEfficiency}%</div>
                  <div className="text-xs text-purple-600 mt-1">visitas completadas vs. programadas</div>
                </div>
                <div className="p-2 rounded-full bg-purple-100">
                  <Users size={20} className="text-purple-600" />
                </div>
              </div>
              <div className="mt-2 flex items-center text-xs text-purple-600">
                <Award size={12} className="mr-1" />
                <span>
                  Mejor rendimiento: {mostEfficientStaff.name} (
                  {Math.round(
                    (mostEfficientStaff.completed / (mostEfficientStaff.completed + mostEfficientStaff.pending)) * 100,
                  )}
                  %)
                </span>
              </div>
            </div>
          </div>

          {/* Tendencia de Visitas */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Calendar className="mr-2 text-blue-500" size={18} />
                Tendencia de Visitas
              </h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setTrendPeriod("7")}
                  className={`px-3 py-1 text-xs rounded-full ${
                    trendPeriod === "7" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  7 días
                </button>
                <button
                  onClick={() => setTrendPeriod("15")}
                  className={`px-3 py-1 text-xs rounded-full ${
                    trendPeriod === "15" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  15 días
                </button>
                <button
                  onClick={() => setTrendPeriod("30")}
                  className={`px-3 py-1 text-xs rounded-full ${
                    trendPeriod === "30" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  30 días
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-xs text-blue-600 mb-1">Total Visitas</div>
                <div className="text-xl font-bold text-blue-800">{totalVisits}</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-xs text-green-600 mb-1">Promedio</div>
                <div className="text-xl font-bold text-green-800">{avgVisits.toFixed(1)}/día</div>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg">
                <div className="text-xs text-amber-600 mb-1">Máximo</div>
                <div className="text-xl font-bold text-amber-800">{maxVisits} visitas</div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="text-xs text-red-600 mb-1">Mínimo</div>
                <div className="text-xl font-bold text-red-800">{minVisits} visitas</div>
              </div>
            </div>

            <div className="h-64 w-full">
              <div className="h-full flex flex-col">
                <div className="flex-1 relative">
                  {/* Línea de promedio */}
                  <div
                    className="absolute w-full border-t-2 border-dashed border-blue-400 z-10 flex justify-end items-center"
                    style={{ top: `${100 - (avgVisits / maxVisits) * 100}%` }}
                  >
                    <span className="bg-white text-xs text-blue-500 px-1 border border-blue-200 rounded">
                      Promedio: {avgVisits.toFixed(1)}
                    </span>
                  </div>

                  <div className="h-full flex items-end space-x-1">
                    {filteredTrendData.map((day: any, index: number) => (
                      <div key={index} className="flex flex-col items-center flex-1 group">
                        <div className="relative w-full">
                          <div
                            className="w-full bg-blue-500 hover:bg-blue-600 transition-colors rounded-t"
                            style={{
                              height: `${(day.visits / maxVisits) * 100}%`,
                              minHeight: "4px",
                            }}
                          ></div>
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                            <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                              <div>
                                {day.date}: {day.visits} visitas
                              </div>
                            </div>
                          </div>
                        </div>
                        {(index % Math.ceil(filteredTrendData.length / 7) === 0 ||
                          index === filteredTrendData.length - 1) && (
                          <div className="text-xs text-gray-500 mt-1">{day.date}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 mr-2 rounded"></div>
                <span>Visitas diarias a áreas verdes</span>
              </div>
              {trendDirection === "up" ? (
                <div className="mt-1 text-green-600 flex items-center">
                  <TrendingUp size={14} className="mr-1" />
                  <span>
                    La tendencia muestra un aumento del {Math.abs(trendPercentage).toFixed(1)}% en las visitas
                  </span>
                </div>
              ) : (
                <div className="mt-1 text-red-600 flex items-center">
                  <TrendingDown size={14} className="mr-1" />
                  <span>
                    La tendencia muestra una disminución del {Math.abs(trendPercentage).toFixed(1)}% en las visitas
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Cumplimiento Mensual */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Target className="mr-2 text-blue-500" size={18} />
                Cumplimiento Mensual de Objetivos
              </h3>
              <div className="flex items-center text-sm text-gray-600">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold mr-2 ${
                    complianceStatus === "success"
                      ? "bg-green-100 text-green-800"
                      : complianceStatus === "warning"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {complianceStatus === "success"
                    ? "Cumpliendo objetivo"
                    : complianceStatus === "warning"
                      ? "Cerca del objetivo"
                      : "Por debajo del objetivo"}
                </span>
                <span>Meta: 90%</span>
              </div>
            </div>

            <div className="h-64 w-full">
              <div className="h-full flex flex-col">
                <div className="flex-1 relative">
                  {/* Línea de meta */}
                  <div
                    className="absolute w-full border-t-2 border-dashed border-gray-400 z-10 flex justify-end items-center"
                    style={{ top: "10%" }}
                  >
                    <span className="bg-white text-xs text-gray-500 px-1 border border-gray-200 rounded">Meta 90%</span>
                  </div>

                  <div className="h-full flex items-end space-x-2">
                    {stats.monthlyCompliance.map((month: any, index: number) => (
                      <div key={index} className="flex flex-col items-center flex-1 group">
                        <div className="relative w-full">
                          <div
                            className={`w-full rounded-t ${
                              month.compliance >= 90
                                ? "bg-green-500 hover:bg-green-600"
                                : month.compliance >= 80
                                  ? "bg-amber-500 hover:bg-amber-600"
                                  : "bg-red-500 hover:bg-red-600"
                            } transition-colors`}
                            style={{
                              height: `${month.compliance}%`,
                              maxHeight: "90%", // Limitar altura máxima para evitar desbordamiento
                              minHeight: "5px", // Altura mínima para visibilidad
                            }}
                          ></div>
                          {/* Valor encima de la barra */}
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold">
                            {month.compliance}%
                          </div>
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-20">
                            <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                              <div>
                                {month.month}: {month.compliance}% (Meta: {month.target}%)
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1 font-medium">{month.month}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Mes Actual</div>
                    <div className="text-lg font-bold text-gray-800">{currentMonthCompliance}%</div>
                  </div>
                  <div
                    className={`p-1.5 rounded-full ${
                      currentMonthCompliance >= 90
                        ? "bg-green-100 text-green-600"
                        : currentMonthCompliance >= 80
                          ? "bg-amber-100 text-amber-600"
                          : "bg-red-100 text-red-600"
                    }`}
                  >
                    {currentMonthCompliance >= 90 ? (
                      <CheckCircle size={16} />
                    ) : currentMonthCompliance >= 80 ? (
                      <AlertCircle size={16} />
                    ) : (
                      <AlertTriangle size={16} />
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Variación vs. Mes Anterior</div>
                <div className="flex items-center">
                  {complianceChange >= 0 ? (
                    <TrendingUp size={16} className="text-green-500 mr-1" />
                  ) : (
                    <TrendingDown size={16} className="text-red-500 mr-1" />
                  )}
                  <span className={`text-lg font-bold ${complianceChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {complianceChange >= 0 ? "+" : ""}
                    {complianceChange.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">Promedio Anual</div>
                <div className="text-lg font-bold text-gray-800">
                  {(
                    stats.monthlyCompliance.reduce((sum: number, month: any) => sum + month.compliance, 0) /
                    stats.monthlyCompliance.length
                  ).toFixed(1)}
                  %
                </div>
              </div>
            </div>
          </div>

          {/* Visitas por Personal */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Users className="mr-2 text-blue-500" size={18} />
                Rendimiento del Personal
              </h3>
              <div className="text-sm text-gray-600">
                Total: {totalCompletedVisits} completadas / {totalPendingVisits} pendientes
              </div>
            </div>

            <div className="space-y-6">
              {stats.visitsByStaff.map((staff: any, index: number) => {
                const efficiency = Math.round((staff.completed / (staff.completed + staff.pending)) * 100)
                const isBestPerformer = staff.name === mostEfficientStaff.name

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg ${isBestPerformer ? "bg-purple-50 border border-purple-200" : "bg-gray-50"}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-full mr-3 ${isBestPerformer ? "bg-purple-100" : "bg-gray-200"}`}>
                          <Users size={16} className={isBestPerformer ? "text-purple-600" : "text-gray-600"} />
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{staff.name}</div>
                          <div className="text-xs text-gray-500">
                            {staff.completed} completadas / {staff.pending} pendientes
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {isBestPerformer && (
                          <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full flex items-center mr-2">
                            <Award size={12} className="mr-1" /> Mejor rendimiento
                          </div>
                        )}
                        <div
                          className={`text-sm font-semibold px-2 py-1 rounded-full ${
                            efficiency >= 90
                              ? "bg-green-100 text-green-800"
                              : efficiency >= 70
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {efficiency}% eficiencia
                        </div>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-4 flex overflow-hidden">
                      <div
                        className={`h-4 ${isBestPerformer ? "bg-purple-500" : "bg-blue-500"} flex items-center justify-center text-xs text-white`}
                        style={{
                          width: `${(staff.completed / (staff.completed + staff.pending)) * 100}%`,
                        }}
                      >
                        {staff.completed}
                      </div>
                      <div
                        className="h-4 bg-gray-300 flex items-center justify-center text-xs text-gray-700"
                        style={{
                          width: `${(staff.pending / (staff.completed + staff.pending)) * 100}%`,
                        }}
                      >
                        {staff.pending}
                      </div>
                    </div>

                    <div className="mt-2 flex justify-between text-xs text-gray-500">
                      <div>
                        <span className="inline-block w-3 h-3 bg-blue-500 mr-1 rounded-sm"></span>
                        Completadas
                      </div>
                      <div>
                        <span className="inline-block w-3 h-3 bg-gray-300 mr-1 rounded-sm"></span>
                        Pendientes
                      </div>
                      <div>Total: {staff.completed + staff.pending} visitas asignadas</div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                <Info size={16} className="mr-2" />
                Análisis de Rendimiento
              </h4>
              <p className="text-sm text-blue-700 mb-2">
                El equipo tiene una eficiencia promedio del {overallEfficiency}% en la realización de visitas
                programadas.
                {overallEfficiency >= 85
                  ? " El rendimiento general es excelente."
                  : overallEfficiency >= 70
                    ? " El rendimiento general es bueno, pero hay margen de mejora."
                    : " El rendimiento general necesita mejorar significativamente."}
              </p>
              <div className="text-sm text-blue-700">
                <strong>Recomendación:</strong>{" "}
                {overallEfficiency >= 85
                  ? "Mantener el ritmo actual y reconocer el buen desempeño del equipo."
                  : overallEfficiency >= 70
                    ? "Identificar las barreras que impiden completar todas las visitas programadas y proporcionar apoyo adicional al personal con menor rendimiento."
                    : "Revisar la carga de trabajo, redistribuir las asignaciones y proporcionar capacitación adicional al personal."}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "performance" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-gray-700 flex items-center">
              <Activity className="mr-2 text-blue-500" size={18} />
              Indicadores de Rendimiento
            </h3>
            <div className="space-y-4">
              {stats.performanceIndicators.map((indicator: any, index: number) => (
                <div key={index} className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{indicator.name}</span>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        indicator.status === "success"
                          ? "bg-green-100 text-green-800"
                          : indicator.status === "warning"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {indicator.value}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        indicator.status === "success"
                          ? "bg-green-500"
                          : indicator.status === "warning"
                            ? "bg-amber-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${indicator.value}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Meta: {indicator.target}%</span>
                    <span className="flex items-center">
                      {indicator.trend === "up" ? (
                        <TrendingUp size={12} className="text-green-500 mr-1" />
                      ) : (
                        <TrendingDown size={12} className="text-red-500 mr-1" />
                      )}
                      {indicator.change}% vs mes anterior
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Resumen de Cumplimiento</h3>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-medium text-gray-700 mb-2">Cumplimiento General</h4>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-4 mr-2">
                    <div
                      className="h-4 rounded-full bg-blue-500"
                      style={{ width: `${stats.overallCompliance}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold">{stats.overallCompliance}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Áreas Críticas Atendidas</div>
                  <div className="text-xl font-bold text-gray-800">
                    {stats.criticalAreasAttended}/{stats.totalCriticalAreas}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {stats.totalCriticalAreas > 0
                      ? `${((stats.criticalAreasAttended / stats.totalCriticalAreas) * 100).toFixed(0)}% completado`
                      : "No hay áreas críticas"}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-sm text-gray-500 mb-1">Tiempo Promedio</div>
                  <div className="text-xl font-bold text-gray-800">{stats.averageResponseTime}</div>
                  <div className="text-xs text-gray-500 mt-1">Entre visitas</div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h4 className="font-medium text-gray-700 mb-2">Próximas Visitas Programadas</h4>
                <ul className="space-y-2">
                  {stats.scheduledVisits.map((visit: any, index: number) => (
                    <li key={index} className="flex justify-between items-center text-sm">
                      <span>{visit.area}</span>
                      <span className="text-gray-500">{visit.date}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
