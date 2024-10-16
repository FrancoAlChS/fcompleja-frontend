export class CasosEvaluar {

numSolicitudEvaluacion: String;
paciente: String;
diagnostico: String;
codigoMedicamento: String;
medicamentoSolicitado: String;
fechaMac: String;
codAfipaciente: String;

constructor(numSolicitudEvaluacion: String,
    paciente: String,
    diagnostico: String,
    codigoMedicamento: String,
    medicamentoSolicitado: String,
    codAfipaciente: String,
    fechaMac: String){
        this.numSolicitudEvaluacion=numSolicitudEvaluacion;
        this.paciente=paciente;
        this.diagnostico=diagnostico;
        this.codigoMedicamento=codigoMedicamento;
        this.medicamentoSolicitado=medicamentoSolicitado;
        this.fechaMac=fechaMac;
        this.codAfipaciente=codAfipaciente;
}

}