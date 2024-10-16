import { Input } from '@angular/core'
import { Clinica } from './Clinica'

export class ClinicaResponse{
    clinica:Clinica[];
    codigoResultado: any;
    mensageResultado: String;
}