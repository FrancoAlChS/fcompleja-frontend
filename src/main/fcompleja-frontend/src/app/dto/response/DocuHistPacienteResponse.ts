import { HistPacienteResponse } from './HistPacienteResponse';

export class DocuHistPacienteResponse {
  historialLineaTrat: HistPacienteResponse[];
  documentoLineaTrat: HistPacienteResponse[];
  grabar:string;
  codResultado: number;
  msgResultado: string;
}
