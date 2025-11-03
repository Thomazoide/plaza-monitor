import { WorkOrder } from "./workOrder-types";

export interface SuperForm {
    id: number;
    description: string | null;
    pictureUrl: string;
    workOrderID: number | null;
    lat: number;
    lng: number;
    workOrder: WorkOrder | null;
}