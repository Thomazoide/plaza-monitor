import { Equipo, Zona } from "./escuadras-types";
import { SuperForm } from "./super-form-types";
import { VisitFormType } from "./visitForms-types";

export type WorkOrderType = "Areas verdes" | "Emergencias" | "Obras publicas";

export interface WorkOrder {
    id: number;
    descripcion: string;
    creada_en: Date;
    completada: boolean;
    completada_en: Date | null;
    equipoID: number | null;
    equipo: Equipo | null;
    visitFormID: number | null;
    visitForm: VisitFormType | null;
    zonaID: number | null;
    zona: Zona | null;
    tipo: WorkOrderType;
    lat: number | null;
    lng: number | null;
    reference: string | null;
    superForm: SuperForm | null;
    superFormID: number | null;
}