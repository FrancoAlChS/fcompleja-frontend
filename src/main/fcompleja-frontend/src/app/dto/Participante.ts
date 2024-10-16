import { ParticipanteDetalle } from './ParticipanteDetalle';

export class Participante {
    codParticipante: number;
	codUsuario: number;
	estadoParticipante: string;
	cmpMedico: string;
	nombreFirma: string;
	codRol: number;
	descripcionRol: string;
	codigoArchivoFirma: number;
	correoElectronico: string;
	nombres: string;
	apellidos: string;
	codParticipanteLargo: string;
	pEstado: number;
	coordinador: number;
	gruposDiagnosticos: ParticipanteDetalle[];
}