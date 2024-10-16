export class SolicitudEvaluacionRequest {
  codSolicitudEvaluacion: number;
  codInformeAutorizador: number;
  codMac: number;
  codGrpDiag: string;
  tipoDocumento: number;
  descripcionDocumento: string;
  urlDescarga: string;

  estadoCorreoEnvCmac: number;
  estadoCorreoEnvLiderTumor: number;
  codigoEnvioEnvMac: number;
  codigoEnvioEnvLiderTumor: number;
  codigoEnvioEnvAlerMonit: number;
  codSevLeva:number;
  pTipoEva: number;
  codPrograCmac: number;
}
