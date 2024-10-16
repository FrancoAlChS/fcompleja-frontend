import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class PacienteService{

    private codPaciente: string;
    private paciente: string;

    constructor() { }

    set setCodPaciente(codPaciente: string) {this.codPaciente = codPaciente; }
    set setPaciente(paciente: string) { this.paciente = paciente; }
    
    get getCodPaciente() { return this.codPaciente; }
    get getPaciente() { return this.paciente; }

    public limpiarRegistro(): void {
        this.codPaciente = null;
        this.paciente = null;
    }
}