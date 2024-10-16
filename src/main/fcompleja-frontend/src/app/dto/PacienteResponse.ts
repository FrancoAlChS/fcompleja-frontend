import { Input } from '@angular/core'
import {Paciente} from './Paciente'

export class PacienteResponse {
    paciente: Paciente[];
    codigoResultado: any;
    mensageResultado: String;
}
