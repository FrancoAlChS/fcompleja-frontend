import { Input } from '@angular/core'
import { ListaEvaluaciones } from './ListaEvaluaciones'

export class ListaEvaluacionesResponse {
    listabandeja: ListaEvaluaciones[];
    codigoResultado: any;
    mensajeResultado: string;
}
