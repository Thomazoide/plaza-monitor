import { Beacon } from "./beacon-types";
import { VisitFormType } from "./visitForms-types";
import { WorkOrder } from "./workOrder-types";

export interface GreenArea {
  id: number
  name: string
  coordinates: { lat: number; lng: number }[]
  lastVisited: Date | null
  info: string
  beaconId?: number | null
  beacon: Beacon | null
  formularios: VisitFormType[] | null
  workOrders: WorkOrder[] | null
}
