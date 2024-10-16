export class SolicitudEvaluacion {

  codSolicitudEvaluacion: number;
  codDiagnostico: string;
  descripcionDocumento: string;
  codAfiliado: string;
  nombreCompleto: string;
  sexo: string;
  medioAuditor: string;
  nombre: string;

  constructor(
    codSolicitudEvaluacion: number,
    codDiagnostico: string,
    descripcionDocumento: string,
    codAfiliado: string,
    nombreCompleto: string,
    sexo: string,
    medioAuditor: string,
    nombre: string) {
    this.codSolicitudEvaluacion = codSolicitudEvaluacion;
    this.codDiagnostico = codDiagnostico;
    this.descripcionDocumento = descripcionDocumento;
    this.descripcionDocumento = descripcionDocumento;
    this.codAfiliado = codAfiliado;
    this.nombreCompleto = nombreCompleto;
    this.sexo = sexo;
    this.medioAuditor = medioAuditor;
    this.nombre = nombre;
  }

}
