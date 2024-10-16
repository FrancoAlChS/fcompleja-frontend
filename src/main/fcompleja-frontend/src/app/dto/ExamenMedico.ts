import { ExamenMedicoDetalle } from './ExamenMedicoDetalle';

export class ExamenMedico {
    codExamenMed: number;
    codExamenMedLargo: string;
    descripcion: string;
    tipoExamen: number;
    examen: string;
    codEstado: number;
    estado: string;
    usuarioCrea: string;
    fechaCrea: string;
    usuarioModif: string;
    fechaModif: string;
    lExamenMedicoDetalle: ExamenMedicoDetalle[];
}
