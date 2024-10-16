import { ListaEvaluaciones } from "../solicitudEvaluacion/bandeja/ListaEvaluaciones";
import { ListadoSolEvaluacionRequest } from "./ListadoSolEvaluacionRequest";
import { ParticipantesRequest } from "./ParticipantesRequest";
export class ProgramacionCmacRequest {
  fecha: string;
  hora: string;
  codEvaluacion: string;
  codArchivo: number;
  codComite: string;
  codReporteActaEscaneada: string;
  listaEvaluacion: ListaEvaluaciones[];
  listaParticipante: ParticipantesRequest[];
  listadoSolEvaluacion: ListadoSolEvaluacionRequest[];
}
