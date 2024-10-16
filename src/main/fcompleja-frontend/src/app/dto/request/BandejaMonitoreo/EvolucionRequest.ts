import { EvolucionMarcadorRequest } from './EvolucionMarcadorRequest';

export class EvolucionRequest {
  codEvolucion: number;
  nroEvolucion: number;
  nroDescEvolucion: string;
  codMonitoreo: number;
  codMac: number;
  pResEvolucion: number;
  fecMonitoreo: Date;
  fecMonitoreoR?: Date;
  fecProxMonitoreo: Date;
  pMotivoInactivacion: number;
  fecInactivacion: Date;
  observacion: string;
  pTolerancia: number;
  pToxicidad: number;
  Grado: string;
  pRespClinica: number;
  pAtenAlerta: number;
  existeToxicidad: any;
  listaMarcadores: EvolucionMarcadorRequest[];
  estado: number;
  usuarioCrea: string;
  existeMarcadores:string;
  fechaCrea: Date;
  usuarioModif: string;
  fechaModif: Date;
  pEstadoMonitoreo: number;
  fecUltimoConsumo: Date;
  codSolEvaluacion: number;
  toxigrado: any;
  descCodSolEvaluacion: string;
  codAfiliado: string;
  cie10: string;
  // existeMarcadores:boolean;
}
