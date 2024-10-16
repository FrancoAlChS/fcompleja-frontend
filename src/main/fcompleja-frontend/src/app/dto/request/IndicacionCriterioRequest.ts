import { listaCriterioInclusionResponse } from '../response/listaCriterioInclusionResponse';
import { listaCriterioExclusionResponse } from '../response/listaCriterioExclusionResponse';

export class IndicacionCriterioRequest{
    codigo : number;
    descripcion: string;
    listaCriterioInclusion : listaCriterioInclusionResponse[];
    listaCriterioExclusion : listaCriterioExclusionResponse[];
    selected : boolean;
}