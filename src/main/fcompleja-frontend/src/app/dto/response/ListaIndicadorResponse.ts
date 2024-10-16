import { Input } from '@angular/core'
import { listaCriterioInclusionResponse } from './listaCriterioInclusionResponse'
import { listaCriterioExclusionResponse } from './listaCriterioExclusionResponse'

export class ListaIndicadorResponse{
    codigo: any;
    descripcion: String;
    selected:boolean;
    listaCriterioInclusion:listaCriterioInclusionResponse[];
    listaCriterioExclusion:listaCriterioExclusionResponse[];
}