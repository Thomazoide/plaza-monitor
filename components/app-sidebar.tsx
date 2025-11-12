"use client"

import type * as React from "react"
import { Users, UserCheck, Car, Smartphone, MapPin, Home, ChevronRight, Shield, FileText, FileBadge, FileClock, TreesIcon } from "lucide-react"
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
import Image from "next/image"

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
    title: "Reportes",
    url: "/reportes",
    icon: FileText,
  },
  {
    title: "Dispositivos",
    url: "/dispositivos",
    icon: Smartphone,
  },
  {
    title: "Registros",
    url: "/registros",
    icon: FileClock,
  },
  {
    title: "Órdenes de Trabajo",
    url: "/ordenes-de-trabajo",
    icon: FileBadge,
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
        <div className="flex flex-col items-center">
          <div className="flex w-full mx-5 text-center justify-center text-md font-bold mt-5" >
            Control de áreas verdes
          </div>
          <div className="flex items-center gap-2 px-4 ">
            <div className="flex aspect-square size-fit items-center justify-center rounded-lg text-sidebar-primary-foreground">
              <Image src="https://www.mpuentealto.cl/wp-content/uploads/log_mpte.png" alt="Logo municipalidad" width={150} height={20}/>
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold"> <TreesIcon className="text-[#f2a700]" height={150} width={50} /> </span>
            </div>
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
                    <a href={item.url} className="flex items-center hover:bg-[#f2a700] transition-colors">
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
                    <a href={item.url} className="flex items-center justify-between hover:bg-[#f2a700] transition-colors ">
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
