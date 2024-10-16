export class EmailRequest {
    usrApp: string;
    flagAdjunto: number;
    tipoEnvio: number;
    asunto: string;
    cuerpo: string;
    ruta: string;
    destinatario: string;
    fechaProgramada: string;
    codigoPlantilla: string;
    codigoEnvio: string;
    codPlantilla: string;
    codigoGrupoDiagnostico: string;
    edadPaciente: number;
    codSolicitudEvaluacion: number;
    estadoSolicitudEvaluacion: number;
    codRol: number;
    listaCasosEvaluar: any[];
}