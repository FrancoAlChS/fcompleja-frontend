import { Criterio } from './Criterio';

export class Indicador {
    codMac: number;
    codGrpDiag: number;
    codChkListIndi: number;
    codIndicadorLargo: string;
    descripcion: string;
    fechaIniVigencia: Date;
    fechaFinVigencia: Date;
    codEstado: number;
    estado: string;
    listaCriterioInclusion: Criterio[];
    listaCriterioExclusion: Criterio[];
}