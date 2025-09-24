import { Zona } from "./beacon-types";
import { Supervisor } from "./escuadras-types";

export enum NIVEL_DE_BASURA {
    ALTO = "ALTO",
    MEDIO = "MEDIO",
    BAJO = "BAJO"
};

export interface VisitFormType {
    id: number;
    fecha: string;
    zona_id: number;
    supervisor_id: number;
    supervisor?: Supervisor;
    zona?: Zona;
    comentarios: string;
    requiere_corte_cesped: boolean;
    hay_gente_acampando: boolean;
    mobiliaro_danado: boolean;
    nivel_de_basura: NIVEL_DE_BASURA;
    foto: string | null;
}