import { EvolucionMarcadorRequest } from '../../request/BandejaMonitoreo/EvolucionMarcadorRequest';

export class EvolucionMarcador {
    codMarcador: number;
    codEvolucion: number;
    descripcion: string;
    descPerMinima: string;
    descPerMaxima: string;
    pTipoIngresoRes: number;
    listaEvolucionMarcador:EvolucionMarcadorRequest[];
}