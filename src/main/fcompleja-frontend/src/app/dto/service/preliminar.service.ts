import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PreliminarService {
  codSolPre: number;
  numSolPre: string;
  codEstadoPre: number;
  estadoPreliminar: string;

  constructor() { }

  set setPreliminar(preliminar: PreliminarService) {
    localStorage.setItem('preliminar', JSON.stringify(preliminar));
    this.codSolPre = preliminar.codSolPre;
    this.numSolPre = preliminar.numSolPre;
    this.codEstadoPre = preliminar.codEstadoPre;
    this.estadoPreliminar = preliminar.estadoPreliminar;
  }

  get getPreliminar() {
    const preliminar: PreliminarService = JSON.parse(localStorage.getItem('preliminar'));
    this.codSolPre = preliminar.codSolPre;
    this.numSolPre = preliminar.numSolPre;
    this.codEstadoPre = preliminar.codEstadoPre;
    this.estadoPreliminar = preliminar.estadoPreliminar;
    return preliminar;
  }
}
