import { DetalleMarcadorResponse } from './DetalleMarcadorResponse';

export class MarcadorResponse {
  codConfigMarca: number;
  codMarcador: number;
  descripcion: string;
  rangoMinimo: number;
  rangoMaximo: number;
  pPerMinima: number;
  pPerMaxima: number;
  valPerMinima: number;
  valPerMaxima: number;
  descPerMinima: string;
  descPerMaxima: string;
  rango: string;
  pTipoIngresoRes: number;
  descTipoIngresoRes: string;
  unidadMedida: string;
  codMarcadorDet: number;
  valorFijo: string;
  tieneRegHc: boolean;
  listaDetalleMarcador: any[];
}