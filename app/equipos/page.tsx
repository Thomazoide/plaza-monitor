import { TrackingProvider } from "@/context/tracking-context"
import EquiposPage from "@/components/equipos/equipos-page"

export default function Page() {
  return (
    <TrackingProvider>
      <EquiposPage />
    </TrackingProvider>
  )
}
