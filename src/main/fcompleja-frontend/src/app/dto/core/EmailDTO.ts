import { CasosEvaluar } from '../solicitudEvaluacion/bandeja/CasosEvaluar';

export class EmailDTO {
  usrApp: string;
  flagAdjunto: number;
  tipoEnvio: number;
  asunto: string;
  cuerpo: string;
  ruta: string;
  destinatario: string;
  fechaProgramada: string;
  codigoPlantilla: string;
  codigoEnvio: string;
  codPlantilla: string;
  codigoGrupoDiagnostico: string;
  edadPaciente: number; 
  codRol : number;
  listaCasosEvaluar: CasosEvaluar[];
}
