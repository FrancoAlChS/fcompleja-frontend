import { IndicacionCriterioRequest } from '../request/IndicacionCriterioRequest';

export class ListaIndicadorRequest {
  codSolEvaluacion: number;
  codMac: number;
  codGrpDiag: string;
  codigoMedico: number;
  codigoIndicacion: number | null;
  inclusion: string;
  exclusion: string;
  comentario: string;
  valCumpleChkListPer: number;
  indicacionCriterio: IndicacionCriterioRequest | {};
  codigoRolUsuario: number;
  codigoUsuario: number;
}

//IndicacionCriterioRequest