import { CmbValorFijoResponse } from './CmbValorFijoResponse';

export class ResultadoBasalDetResponse {
  codExamenMedDetalle: number;
  codExamenMed: number;
  tipoIngresoResul: number;
  valorFijo: string;
  codConfigMarcador: number;
  descripcionExamenMed: string;
  tipoIngresoResulDescrip: string;
  unidadMedida: string;
  rango: string;
  resultado: any;
  fecResultado: Date;
  codResultadoBasal: number;
  minLength: number;
  maxLength: number;
  cmbValorFijo: CmbValorFijoResponse[];
}
