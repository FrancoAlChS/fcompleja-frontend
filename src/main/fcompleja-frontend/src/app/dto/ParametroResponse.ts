import { Parametro } from "./Parametro";

export class ParametroResponse {
  filtroParametro: Parametro[];
  codigoResultado: any;
  mensageResultado: string;
  data?: Parametro[];
}
