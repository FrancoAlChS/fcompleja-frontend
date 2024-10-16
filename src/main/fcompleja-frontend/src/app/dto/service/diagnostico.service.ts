import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DiagnosticoService {
    private codDiagnostico: string;
    private diagnostico: string;
    private codGrupoDiagnostico: string;
    private grupoDiagnostico: string;

    constructor() {  }
    
    set setCodDiagnostico(codDiagnostico: string) { this.codDiagnostico = codDiagnostico; }
    set setDiagnostico(diagnostico: string) { this.diagnostico = diagnostico; }
    set setCodGrupoDiagnostico(codGrupoDiagnostico: string) { this.codGrupoDiagnostico = codGrupoDiagnostico; }
    set setGrupoDiagnostico(grupoDiagnostico: string) { this.grupoDiagnostico = grupoDiagnostico; }
    
    get getCodDiagnostico() { return this.codDiagnostico; }
    get getDiagnostico() { return this.diagnostico; }
    get getCodGrupoDiagnostico() { return this.codGrupoDiagnostico; }
    get getGrupoDiagnostico() { return this.grupoDiagnostico; }

    public limpiarRegistro() {
        this.codDiagnostico = null;
        this.diagnostico = null;
        this.codGrupoDiagnostico = null;
        this.grupoDiagnostico = null;
        return null;
    }

}