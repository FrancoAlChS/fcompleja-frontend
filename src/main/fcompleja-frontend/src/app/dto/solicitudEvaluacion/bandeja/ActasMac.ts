export class ActasMac {
  solEvaluacion: String;
  paciente: String;
  diagnostico: String;
  codMedicamento: String;
  medicamentoSolicitado: String;
  resultadoEvaluacion: String;
  observaciones: String;

  constructor(solEvaluacion: String,
    paciente: String,
    diagnostico: String,
    codMedicamento: String,
    medicamentoSolicitado: String,
    resultadoEvaluacion: String,
    observaciones: String) {
    this.solEvaluacion = solEvaluacion;
    this.paciente = paciente;
    this.diagnostico = diagnostico;
    this.codMedicamento = codMedicamento;
    this.medicamentoSolicitado = medicamentoSolicitado;
    this.resultadoEvaluacion = resultadoEvaluacion;
    this.observaciones = observaciones;
  }
}
