"use client"

import { useEffect, useRef, useState } from "react"
import { Loader } from "@googlemaps/js-api-loader"
import type { google } from "@googlemaps/js-api-loader"
import { greenAreas } from "@/data/green-areas"

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

  useEffect(() => {
    if (!mapRef.current) return

    // Reemplaza "TU_CLAVE_API" con la clave proporcionada por el usuario
    const apiKey = "AIzaSyAGfymo74EK2kG_5vht87mQzl_ik6zRs0A"

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
            const bounds = new google.maps.LatLngBounds()
            area.coordinates.forEach((coord) => {
              bounds.extend(new google.maps.LatLng(coord.lat, coord.lng))
            })
            mapInstance.fitBounds(bounds)
            mapInstance.setZoom(Math.min(18, mapInstance.getZoom() || 15)) // Limitar el zoom máximo a 18
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
  }, [])

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
      const bounds = new google.maps.LatLngBounds()
      greenAreas.forEach((area) => {
        area.coordinates.forEach((coord) => {
          bounds.extend(new google.maps.LatLng(coord.lat, coord.lng))
        })
      })
      map.fitBounds(bounds)
    })

    return controlButton
  }

  return (
    <div className="relative w-full">
      {mapError && (
        <div className="absolute top-0 left-0 right-0 bg-red-100 text-red-700 p-2 z-[1000] text-center">{mapError}</div>
      )}
      <div
        ref={mapRef}
        className="w-full h-[500px] bg-gray-100"
        style={{ visibility: isMapReady ? "visible" : "hidden" }}
      ></div>
      {!isMapReady && !mapError && (
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
