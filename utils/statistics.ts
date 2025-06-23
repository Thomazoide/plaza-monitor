import type { GreenArea } from "@/types/map-types"
import { formatDate } from "./format"

// Asegurar que la función calculateAreaStatistics devuelva todos los datos necesarios
export function calculateAreaStatistics(areas: GreenArea[]) {
  const now = new Date()

  // Calcular estado de visitas
  const visitStatus = [
    { name: "Reciente", value: 0, color: "#22c55e" },
    { name: "1-3 días", value: 0, color: "#f97316" },
    { name: "Más de 3 días", value: 0, color: "#ef4444" },
  ]

  // Contadores para el resumen
  let visitedToday = 0
  let needingAttention = 0
  let critical = 0

  // Datos para gráficos y tablas
  const areasByDaysSinceVisit: any[] = []
  const areaDetails: any[] = []

  areas.forEach((area) => {
    const timeDiff = now.getTime() - area.lastVisited.getTime()
    const daysDiff = timeDiff / (1000 * 3600 * 24)

    // Actualizar contadores de estado
    if (daysDiff < 1) {
      visitStatus[0].value++
      visitedToday++
    } else if (daysDiff < 3) {
      visitStatus[1].value++
      needingAttention++
    } else {
      visitStatus[2].value++
      critical++
    }

    // Datos para gráfico de barras
    areasByDaysSinceVisit.push({
      name: area.name,
      days: Math.floor(daysDiff),
    })

    // Datos para tabla detallada
    const status = daysDiff < 1 ? "Reciente" : daysDiff < 3 ? "Pendiente" : "Crítico"
    const priority = daysDiff > 3 ? "Alta" : daysDiff > 1 ? "Media" : "Baja"

    // Calcular tamaño aproximado (en metros cuadrados)
    const size = calculateAreaSize(area.coordinates)

    areaDetails.push({
      name: area.name,
      lastVisit: formatDate(area.lastVisited),
      status,
      size: `${size} m²`,
      type: area.name.includes("Parque") ? "Parque" : "Plaza",
      priority,
    })
  })

  // Ordenar por días desde la última visita (descendente)
  areasByDaysSinceVisit.sort((a, b) => b.days - a.days)

  // Distribución por tipo
  const parkCount = areaDetails.filter((a) => a.type === "Parque").length
  const plazaCount = areaDetails.filter((a) => a.type === "Plaza").length

  const areasByType = [
    { name: "Parques", value: parkCount, color: "#3b82f6" },
    { name: "Plazas", value: plazaCount, color: "#10b981" },
  ]

  // Distribución por tamaño
  const areasBySize = [
    { name: "Pequeño (<1000m²)", count: 0 },
    { name: "Mediano (1000-5000m²)", count: 0 },
    { name: "Grande (>5000m²)", count: 0 },
  ]

  areaDetails.forEach((area) => {
    const size = Number.parseInt(area.size)
    if (size < 1000) {
      areasBySize[0].count++
    } else if (size < 5000) {
      areasBySize[1].count++
    } else {
      areasBySize[2].count++
    }
  })

  // Generar datos de tendencia de visitas (simulados)
  const visitTrend = generateVisitTrend()

  // Generar datos de cumplimiento mensual (simulados)
  const monthlyCompliance = generateMonthlyCompliance()

  // Generar datos de visitas por personal (simulados)
  const visitsByStaff = generateVisitsByStaff()

  // Generar indicadores de rendimiento (simulados)
  const performanceIndicators = generatePerformanceIndicators()

  // Generar alertas y recomendaciones
  const alerts = generateAlerts(critical, needingAttention, areas.length)

  // Datos de cumplimiento
  const overallCompliance = Math.round(((areas.length - critical) / areas.length) * 100)
  const criticalAreasAttended = Math.round(critical * 0.3) // Simulado: 30% de áreas críticas atendidas
  const totalCriticalAreas = critical
  const averageResponseTime = "2.3 días"

  // Visitas programadas (simuladas)
  const scheduledVisits = generateScheduledVisits(areas)

  return {
    totalAreas: areas.length,
    visitedToday,
    needingAttention,
    critical,
    visitStatus,
    areasByDaysSinceVisit,
    areaDetails,
    areasByType,
    areasBySize,
    visitTrend,
    monthlyCompliance,
    visitsByStaff,
    performanceIndicators,
    alerts,
    overallCompliance,
    criticalAreasAttended,
    totalCriticalAreas,
    averageResponseTime,
    scheduledVisits,
  }
}

// Función para calcular el tamaño aproximado de un área en metros cuadrados
function calculateAreaSize(coordinates: { lat: number; lng: number }[]) {
  // Simulación: generar un tamaño aleatorio entre 500 y 10000 m²
  return Math.floor(Math.random() * 9500) + 500
}

// Modificar la función generateVisitTrend para asegurar que devuelva datos más visibles
function generateVisitTrend() {
  const trend = []
  const today = new Date()

  // Generar una tendencia con un patrón más visible
  for (let i = 30; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)

    // Crear un patrón más visible con variaciones mayores
    const baseVisits = 3 // Base de visitas diarias
    const weekPattern = Math.sin((i / 7) * Math.PI) * 2 // Patr��n semanal
    const randomVariation = Math.random() * 2 - 1 // Variación aleatoria

    trend.push({
      date: formatDate(date, "short"),
      visits: Math.max(1, Math.round(baseVisits + weekPattern + randomVariation)), // Asegurar mínimo 1 visita
    })
  }

  return trend
}

// Modificar la función generateMonthlyCompliance para datos más realistas
function generateMonthlyCompliance() {
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  const compliance = []

  // Tendencia anual con mejora gradual y algunas caídas
  let baseCompliance = 75 // Comenzar en 75%

  for (let i = 0; i < 12; i++) {
    // Tendencia general ascendente con algunas fluctuaciones
    const monthlyChange = i < 6 ? 1.5 : 0.5 // Mayor mejora en primera mitad del año
    baseCompliance += monthlyChange

    // Añadir fluctuaciones aleatorias
    const randomVariation = Math.random() * 8 - 4 // Entre -4 y +4

    // Simular caídas específicas en ciertos meses
    let specificDrop = 0
    if (i === 3) specificDrop = -8 // Caída en abril
    if (i === 7) specificDrop = -5 // Caída en agosto

    const monthlyCompliance = Math.min(98, Math.max(70, Math.round(baseCompliance + randomVariation + specificDrop)))

    compliance.push({
      month: months[i],
      compliance: monthlyCompliance,
      target: 90, // Meta constante del 90%
    })
  }

  return compliance
}

// Mejorar la función generateVisitsByStaff para datos más realistas
function generateVisitsByStaff() {
  return [
    { name: "Juan Pérez", completed: 24, pending: 6 },
    { name: "María López", completed: 18, pending: 4 },
    { name: "Carlos Gómez", completed: 22, pending: 3 },
    { name: "Ana Martínez", completed: 16, pending: 8 },
    { name: "Roberto Silva", completed: 20, pending: 5 },
  ]
}

// Generar indicadores de rendimiento (simulados)
function generatePerformanceIndicators() {
  return [
    {
      name: "Cumplimiento de visitas",
      value: 87,
      target: 90,
      status: "warning",
      trend: "up",
      change: 5,
    },
    {
      name: "Tiempo de respuesta",
      value: 92,
      target: 85,
      status: "success",
      trend: "up",
      change: 8,
    },
    {
      name: "Cobertura de áreas críticas",
      value: 65,
      target: 95,
      status: "danger",
      trend: "down",
      change: -12,
    },
    {
      name: "Satisfacción ciudadana",
      value: 89,
      target: 80,
      status: "success",
      trend: "up",
      change: 3,
    },
  ]
}

// Generar alertas y recomendaciones
function generateAlerts(critical: number, needingAttention: number, totalAreas: number) {
  const alerts = []

  if (critical > 0) {
    alerts.push({
      type: "danger",
      message: `${critical} áreas no han sido visitadas en más de 3 días.`,
      recommendation: "Programar visitas urgentes a estas áreas para evitar deterioro.",
    })
  }

  if (needingAttention > totalAreas * 0.3) {
    alerts.push({
      type: "warning",
      message: `${needingAttention} áreas (${Math.round((needingAttention / totalAreas) * 100)}%) requieren atención pronto.`,
      recommendation: "Considerar redistribuir el personal para cubrir estas áreas en los próximos días.",
    })
  }

  if (critical === 0 && needingAttention < totalAreas * 0.2) {
    alerts.push({
      type: "success",
      message: "La mayoría de las áreas han sido visitadas recientemente.",
      recommendation: "Mantener el ritmo actual de visitas para asegurar un buen mantenimiento.",
    })
  }

  return alerts
}

// Generar visitas programadas (simuladas)
function generateScheduledVisits(areas: GreenArea[]) {
  // Filtrar áreas que no han sido visitadas recientemente
  const criticalAreas = areas.filter((area) => {
    const daysSinceVisit = (new Date().getTime() - area.lastVisited.getTime()) / (1000 * 3600 * 24)
    return daysSinceVisit > 2
  })

  // Tomar hasta 5 áreas críticas
  const areasToSchedule = criticalAreas.slice(0, 5)

  // Generar fechas para los próximos días
  return areasToSchedule.map((area, index) => {
    const visitDate = new Date()
    visitDate.setDate(visitDate.getDate() + index + 1)

    return {
      area: area.name,
      date: formatDate(visitDate),
    }
  })
}
