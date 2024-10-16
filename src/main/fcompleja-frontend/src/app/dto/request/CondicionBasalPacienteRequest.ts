import { MetastasisResponse } from '../response/BandejaEvaluacion/MedicamentoNuevo/MetastasisResponse';
import { ResultadoBasalDetResponse } from '../response/BandejaEvaluacion/MedicamentoNuevo/ResultadoBasalDetResponse';

export class CondicionBasalPacienteRequest {
  codSolEvaluacion: number;
  lineaLugarMetastasis: MetastasisResponse[];
  ecog: number;
  existeToxicidad: number;
  tipoToxicidad: number;
  resultadoBasal: ResultadoBasalDetResponse[];
  antecedenteImp: string;
  codigoRolUsuario: number;
  codigoUsuario: number;
}
