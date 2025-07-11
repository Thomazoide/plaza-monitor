"use client"

import type * as React from "react"
import { Users, UserCheck, Car, Smartphone, MapPin, Home, ChevronRight, Shield } from "lucide-react"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// Datos de navegación principal
const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
]

// Datos de gestión de recursos
const resourceItems = [
  {
    title: "Trabajadores",
    url: "/trabajadores",
    icon: Users,
  },
  {
    title: "Supervisores",
    url: "/supervisores",
    icon: UserCheck,
  },
  {
    title: "Equipos", // Cambiado de "Escuadras"
    url: "/equipos", // Cambiado de "/escuadras"
    icon: Shield,
  },
  {
    title: "Vehículos",
    url: "/vehiculos",
    icon: Car,
  },
  {
    title: "Áreas Verdes",
    url: "/zonas",
    icon: MapPin,
  },
  {
    title: "Dispositivos",
    url: "/dispositivos",
    icon: Smartphone,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  // Simplificamos la lógica de activeItem
  const activeItem =
    [...navigationItems, ...resourceItems].find((item) => pathname.startsWith(item.url) && item.url !== "/")?.title ||
    (pathname === "/" ? "Dashboard" : "") ||
    (pathname.startsWith("/configuracion") ? "Configuración" : "") ||
    "Dashboard" // Fallback a Dashboard

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-blue-600 text-sidebar-primary-foreground">
            <MapPin className="size-4 text-white" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Áreas Verdes</span>
            <span className="truncate text-xs text-sidebar-muted-foreground">Puente Alto</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Navegación Principal */}
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={activeItem === item.title}>
                    <a href={item.url} className="flex items-center">
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Gestión de Recursos */}
        <SidebarGroup>
          <SidebarGroupLabel>Gestión de Recursos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {resourceItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={activeItem === item.title}>
                    <a href={item.url} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </div>
                      {/* Mostrar chevron si la URL no es un placeholder (#) */}
                      {!item.url.startsWith("#") && (
                        <ChevronRight className="ml-auto size-3 opacity-50 group-data-[collapsible=icon]:hidden" />
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-4 border-t">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-green-100">
              <div className="size-3 rounded-full bg-green-500"></div>
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">Sistema Activo</span>
              <span className="truncate text-xs text-sidebar-muted-foreground">
                {new Date().toLocaleDateString("es-CL")}
              </span>
            </div>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
