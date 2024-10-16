export class EvolucionResponse {
  codEvolucion: number;
  nroDescEvolucion: string;
  codMonitoreo: number;
  codDescMonitoreo: string;
  codMac: number;
  descResEvolucion: string;
  fecMonitoreo: Date;
  fecProxMonitoreo: Date;
  pMotivoInactivacion: number;
  fecInactivacion: Date;
  observacion: string;
  // existeToxicidad:string;
  Toxigrado: any;
  pTolerancia: number;
  pResEvolucion;
  pToxicidad: number;
  descTolerancia: string;
  descToxicidad: string;
  descGrado: string;
  pRespClinica: number;
  descRespClinica: string;
  pAtenAlerta: number;
  descAtenAlerta: string;
  existeToxicidad: string;
  existeMarcadores:boolean;
  fUltimoConsumo: Date;
  ultimaCantConsumida: number;
  estado: number;
  usuarioCrea: string;
  fechaCrea: Date;
  usuarioModif: string;
  fechaModif: Date;
  pEstadoMonitoreo: number;
  descMac: string;
  toxigrado:any
}