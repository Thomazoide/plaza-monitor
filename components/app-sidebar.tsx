"use client"

import * as React from "react"
import { Users, UserCheck, Car, Smartphone, MapPin, Home, BarChart3, Settings, ChevronRight } from "lucide-react"

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
    url: "#",
    icon: Home,
    isActive: true,
  }
]

// Datos de gestión de recursos
const resourceItems = [
  {
    title: "Trabajadores",
    url: "#trabajadores",
    icon: Users,
    badge: "12",
  },
  {
    title: "Supervisores",
    url: "#supervisores",
    icon: UserCheck,
    badge: "3",
  },
  {
    title: "Escuadras",
    url: "/escuadras",
    icon: Users,
    badge: "5",
  },
  {
    title: "Vehículos",
    url: "#vehiculos",
    icon: Car,
    badge: "8",
  },
  {
    title: "Dispositivos",
    url: "#dispositivos",
    icon: Smartphone,
    badge: "15",
  },
  {
    title: "Zonas",
    url: "#zonas",
    icon: MapPin,
    badge: "12",
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [activeItem, setActiveItem] = React.useState("Dashboard")

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
                  <SidebarMenuButton
                    asChild
                    isActive={activeItem === item.title}
                    onClick={() => setActiveItem(item.title)}
                  >
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
                  <SidebarMenuButton
                    asChild
                    isActive={activeItem === item.title}
                    onClick={() => setActiveItem(item.title)}
                  >
                    <a href={item.url} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <span className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600 group-data-[collapsible=icon]:hidden">
                          {item.badge}
                        </span>
                      )}
                      <ChevronRight className="ml-auto size-3 opacity-50 group-data-[collapsible=icon]:hidden" />
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Configuración */}
        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={activeItem === "Configuración"}
                  onClick={() => setActiveItem("Configuración")}
                >
                  <a href="#configuracion" className="flex items-center">
                    <Settings className="size-4" />
                    <span>Configuración</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
