import { ListaEvaluaciones } from "../solicitudEvaluacion/bandeja/ListaEvaluaciones";
import { ListUsrRol } from "../ListUsrRol";

export class RegistrarEvaluacionCmacRequest {
  codigoActa: string;
  evaluacion: string;
  participanteCmac: string;
  codigoScan: string;
  fechaProgramada: String;
  horaProgramada: String;
  fechaEstado: string;
  codigoRolResponsableCmac: number;
  codigoUsrResponsableCmac: number;
  listaEvaluacion: ListaEvaluaciones[];
  listaParticipante: ListUsrRol[];
  codComite: any;
  fechaReal: String;
  codProgramacionCmac:string;

  codActaFtp: number;
  codArchivoSustento: number;
}
