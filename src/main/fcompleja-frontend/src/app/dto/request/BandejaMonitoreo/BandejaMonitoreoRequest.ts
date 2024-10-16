export class BandejaMonitoreoRequest {
  codigoPaciente: string;
  estadoMonitoreo: number;
  codigoClinica: string;
  fechaMonitoreo: string;
  codigoResponsableMonitoreo: string;
  //code by luis
  tipoDoc: any;
  nroDoc: any;
  nombre1: any;
  nombre2: any;
  apePaterno: any;
  apeMaterno: any;
  fecProxMonHasta: string;
  fecAprovaDesde: string;
  fecAprovaHasta: string;
  estSeguimiento?: number;
  codEvaluacion: number;
}
