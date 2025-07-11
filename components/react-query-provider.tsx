"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type ReactNode, useState } from "react"

/**
 * React Query context for the whole app.
 * Mantiene una única instancia de QueryClient.
 */
export function ReactQueryProvider({ children }: { children: ReactNode }) {
  // Creamos el QueryClient una sola vez.
  const [client] = useState(() => new QueryClient())

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
