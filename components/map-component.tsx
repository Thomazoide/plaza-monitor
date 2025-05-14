"use client"

import { useEffect, useRef, useState } from "react"
import { Loader } from "@googlemaps/js-api-loader"
import type { google } from "@googlemaps/js-api-loader"
import { greenAreas } from "@/data/green-areas"
import { MapPin, Search, X } from "lucide-react"

// Declarar el tipo para el objeto google global
declare global {
  interface Window {
    google: typeof google
  }
}

export default function MapComponent() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapError, setMapError] = useState<string | null>(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const [apiKey, setApiKey] = useState<string>("")
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAreaList, setShowAreaList] = useState(false)
  const [filteredAreas, setFilteredAreas] = useState(greenAreas)

  // Obtener la API key al cargar el componente
  useEffect(() => {
    // Obtener la API key desde la variable de entorno
    const fetchApiKey = async () => {
      try {
        const response = await fetch("/api/get-map-key")
        const data = await response.json()
        if (data.apiKey) {
          setApiKey(data.apiKey)
        } else {
          setMapError("No se pudo obtener la clave de API de Google Maps")
        }
      } catch (error) {
        console.error("Error al obtener la clave de API:", error)
        setMapError("Error al obtener la clave de API de Google Maps")
      }
    }

    fetchApiKey()
  }, [])

  // Filtrar áreas cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredAreas(greenAreas)
    } else {
      const filtered = greenAreas.filter((area) => area.name.toLowerCase().includes(searchTerm.toLowerCase()))
      setFilteredAreas(filtered)
    }
  }, [searchTerm])

  useEffect(() => {
    if (!mapRef.current || !apiKey) return

    const loader = new Loader({
      apiKey,
      version: "weekly",
      libraries: ["places", "drawing", "geometry"],
    })

    loader
      .load()
      .then((google) => {
        // Crear el mapa centrado en Puente Alto
        const mapInstance = new google.maps.Map(mapRef.current!, {
          center: { lat: -33.6119, lng: -70.5758 }, // Centro de Puente Alto
          zoom: 13,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
        })

        // Guardar la referencia del mapa
        mapInstanceRef.current = mapInstance

        // Crear una ventana de información reutilizable
        const infoWindowInstance = new google.maps.InfoWindow()
        infoWindowRef.current = infoWindowInstance

        // Añadir las áreas verdes con colores según tiempo de visita
        greenAreas.forEach((area) => {
          const now = new Date()
          const timeDiff = now.getTime() - area.lastVisited.getTime()
          const daysDiff = timeDiff / (1000 * 3600 * 24)

          let fillColor = ""
          let statusText = ""

          if (daysDiff < 1) {
            fillColor = "#22c55e" // verde
            statusText = "Visitado recientemente"
          } else if (daysDiff < 3) {
            fillColor = "#f97316" // naranja
            statusText = "Visitado hace más de 24 horas y menos de 3 días"
          } else {
            fillColor = "#ef4444" // rojo
            statusText = "Visitado hace más de 3 días"
          }

          // Crear el polígono
          const polygon = new google.maps.Polygon({
            paths: area.coordinates,
            strokeColor: fillColor,
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: fillColor,
            fillOpacity: 0.35,
            map: mapInstance,
            zIndex: 1,
          })

          // Añadir evento de mouseover para mostrar información
          polygon.addListener("mouseover", (e: google.maps.PolyMouseEvent) => {
            if (infoWindowRef.current) {
              infoWindowRef.current.setContent(`
                <div style="padding: 8px; max-width: 250px;">
                  <h3 style="font-weight: bold; margin-bottom: 5px;">${area.name}</h3>
                  <p style="margin-bottom: 5px;">${area.info}</p>
                  <p style="font-style: italic; margin-bottom: 5px;">${statusText}</p>
                  <p style="font-size: 0.8rem;">Última visita: ${area.lastVisited.toLocaleDateString()}</p>
                </div>
              `)

              // Posicionar el infoWindow cerca del cursor
              if (e.latLng) {
                infoWindowRef.current.setPosition(e.latLng)
                infoWindowRef.current.open(mapInstance)
              }
            }
          })

          // Cerrar el infoWindow al salir del polígono
          polygon.addListener("mouseout", () => {
            if (infoWindowRef.current) {
              infoWindowRef.current.close()
            }
          })

          // Añadir evento de clic para centrar en el área
          polygon.addListener("click", () => {
            centerMapOnArea(area)
          })
        })

        // Añadir botón para mostrar todas las áreas
        const centerControlDiv = document.createElement("div")
        const centerControl = createCenterControl(mapInstance, google)
        centerControlDiv.appendChild(centerControl)
        mapInstance.controls[google.maps.ControlPosition.TOP_RIGHT].push(centerControlDiv)

        setIsMapReady(true)
      })
      .catch((error) => {
        console.error("Error loading Google Maps:", error)
        setMapError(`Error al cargar Google Maps: ${error.message}`)
      })

    return () => {
      // Limpiar recursos si es necesario
      if (infoWindowRef.current) {
        infoWindowRef.current.close()
      }
    }
  }, [apiKey])

  // Función para crear el control personalizado
  function createCenterControl(map: google.maps.Map, google: any) {
    const controlButton = document.createElement("button")
    controlButton.style.backgroundColor = "#fff"
    controlButton.style.border = "2px solid #ccc"
    controlButton.style.borderRadius = "3px"
    controlButton.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)"
    controlButton.style.color = "rgb(25,25,25)"
    controlButton.style.cursor = "pointer"
    controlButton.style.fontFamily = "Roboto,Arial,sans-serif"
    controlButton.style.fontSize = "16px"
    controlButton.style.lineHeight = "38px"
    controlButton.style.margin = "8px"
    controlButton.style.padding = "0 5px"
    controlButton.style.textAlign = "center"
    controlButton.textContent = "Ver todas las áreas"
    controlButton.title = "Haz clic para ver todas las áreas verdes"
    controlButton.type = "button"

    controlButton.addEventListener("click", () => {
      showAllAreas()
    })

    return controlButton
  }

  // Función para centrar el mapa en un área específica
  const centerMapOnArea = (area: (typeof greenAreas)[0]) => {
    if (!mapInstanceRef.current || !window.google) return

    const bounds = new window.google.maps.LatLngBounds()
    area.coordinates.forEach((coord) => {
      bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng))
    })
    mapInstanceRef.current.fitBounds(bounds)
    mapInstanceRef.current.setZoom(Math.min(18, mapInstanceRef.current.getZoom() || 15))

    // Cerrar la lista de áreas después de seleccionar una
    setShowAreaList(false)
  }

  // Función para mostrar todas las áreas
  const showAllAreas = () => {
    if (!mapInstanceRef.current || !window.google) return

    const bounds = new window.google.maps.LatLngBounds()
    greenAreas.forEach((area) => {
      area.coordinates.forEach((coord) => {
        bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng))
      })
    })
    mapInstanceRef.current.fitBounds(bounds)

    // Cerrar la lista de áreas
    setShowAreaList(false)
  }

  // Función para determinar el color del botón según el estado del área
  const getAreaButtonColor = (area: (typeof greenAreas)[0]) => {
    const now = new Date()
    const timeDiff = now.getTime() - area.lastVisited.getTime()
    const daysDiff = timeDiff / (1000 * 3600 * 24)

    if (daysDiff < 1) {
      return "bg-green-100 text-green-800 hover:bg-green-200 border-green-300"
    } else if (daysDiff < 3) {
      return "bg-orange-100 text-orange-800 hover:bg-orange-200 border-orange-300"
    } else {
      return "bg-red-100 text-red-800 hover:bg-red-200 border-red-300"
    }
  }

  return (
    <div className="relative w-full">
      {mapError && (
        <div className="absolute top-0 left-0 right-0 bg-red-100 text-red-700 p-2 z-[1000] text-center">{mapError}</div>
      )}

      {/* Panel de acceso rápido a áreas */}
      <div className="absolute top-4 left-4 z-[100] flex flex-col gap-2 max-w-xs">
        <div className="bg-white rounded-lg shadow-lg p-2 flex items-center">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar área..."
              className="w-full pl-8 pr-2 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowAreaList(true)}
            />
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            {searchTerm && (
              <button
                className="absolute right-2 top-2.5 text-gray-400 hover:text-gray-600"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <button
            className="ml-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md flex items-center justify-center"
            onClick={() => setShowAreaList(!showAreaList)}
            title={showAreaList ? "Ocultar lista" : "Mostrar lista"}
          >
            <MapPin className="h-5 w-5" />
          </button>
        </div>

        {showAreaList && (
          <div className="bg-white rounded-lg shadow-lg p-2 max-h-[300px] overflow-y-auto">
            <div className="mb-2">
              <button
                className="w-full text-left p-2 rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-300 flex items-center"
                onClick={showAllAreas}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Ver todas las áreas
              </button>
            </div>
            <div className="space-y-1">
              {filteredAreas.length > 0 ? (
                filteredAreas.map((area) => (
                  <button
                    key={area.id}
                    className={`w-full text-left p-2 rounded-md ${getAreaButtonColor(area)} border flex items-center justify-between`}
                    onClick={() => centerMapOnArea(area)}
                  >
                    <span className="truncate">{area.name}</span>
                    <span className="text-xs ml-1 whitespace-nowrap">
                      {new Date(area.lastVisited).toLocaleDateString("es-CL", { day: "2-digit", month: "2-digit" })}
                    </span>
                  </button>
                ))
              ) : (
                <div className="text-center text-gray-500 py-2">No se encontraron áreas</div>
              )}
            </div>
          </div>
        )}
      </div>

      <div
        ref={mapRef}
        className="w-full h-[500px] bg-gray-100"
        style={{ visibility: isMapReady ? "visible" : "hidden" }}
      ></div>
      {(!isMapReady || !apiKey) && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div
              className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
              role="status"
            >
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Cargando...
              </span>
            </div>
            <p className="mt-2">Cargando mapa...</p>
          </div>
        </div>
      )}
    </div>
  )
}
