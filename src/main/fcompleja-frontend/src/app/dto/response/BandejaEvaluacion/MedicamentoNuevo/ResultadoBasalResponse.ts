import { ResultadoBasalDetResponse } from './ResultadoBasalDetResponse';
import { MetastasisResponse } from './MetastasisResponse';

export class ResultadoBasalResponse {
  resultadoBasal: ResultadoBasalDetResponse[];
  cmbValorFijo: ResultadoBasalDetResponse[];
  metastasis: MetastasisResponse[];
}
