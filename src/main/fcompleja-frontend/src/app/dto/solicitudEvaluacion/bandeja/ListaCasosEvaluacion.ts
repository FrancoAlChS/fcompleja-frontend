import { CasosEvaluar } from './CasosEvaluar';

export class ListaCasosEvaluacion {
    fecha: String ;
	  hora:String;
    listaCasosEvaluar: CasosEvaluar[];

    constructor (fecha: String,
        hora:String,
        lista: CasosEvaluar[])
        {
      this.fecha=fecha;
      this.hora= hora;
      this.listaCasosEvaluar=lista;
    }
    
  }