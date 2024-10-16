import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EvaluacionService {
  codMac: number;
  numeroMac: string;
  descMAC: string;
  codSolEvaluacion: number;
  numeroSolEvaluacion: string;
  codAfiliado: string;
  paciente: string;
  sexoPaciente: string;
  codLineaTratamiento: number;
  lineaTratamiento: string;
  nroLineaTratamiento: number;
  edad: number;
  estadoEvaluacion: number;
  descEstadoEvaluacion: string;
  codDiagnostico: string;
  descDiagnostico: string;
  codGrupoDiagnostico: string;
  descGrupoDiagnostico: string;
  fechaSolEva: String;
  codCmp: string;
  nombreCmp: string;
  nombreRolResponsablePenEva: string;
  flagLiderTumor: string;
  codRolLiderTum: number;
  codUsrLiderTum: number;
  usrLiderTum: string;
  codArchFichaTec: number;
  codArchCompMed: number;
  codInformePDF: number;
  codCmacPDF: number;
  codEvaluacion ?: number;
  constructor() { }

  set setEvaluacion(solicitud: EvaluacionService) {
    localStorage.setItem('evaluacion', JSON.stringify(solicitud));
    this.codMac = solicitud.codMac;
    this.numeroMac = solicitud.numeroMac;
    this.descMAC = solicitud.descMAC;
    this.codSolEvaluacion = solicitud.codSolEvaluacion;
    this.numeroSolEvaluacion = solicitud.numeroSolEvaluacion;
    this.codAfiliado = solicitud.codAfiliado;
    this.paciente = solicitud.paciente;
    this.sexoPaciente = solicitud.sexoPaciente;
    this.codLineaTratamiento = solicitud.codLineaTratamiento;
    this.lineaTratamiento = solicitud.lineaTratamiento;
    this.nroLineaTratamiento = solicitud.nroLineaTratamiento;
    this.edad = solicitud.edad;
    this.estadoEvaluacion = solicitud.estadoEvaluacion;
    this.descEstadoEvaluacion = solicitud.descEstadoEvaluacion;
    this.codDiagnostico = solicitud.codDiagnostico;
    this.descDiagnostico = solicitud.descDiagnostico;
    this.codGrupoDiagnostico = solicitud.codGrupoDiagnostico;
    this.descGrupoDiagnostico = solicitud.descGrupoDiagnostico;
    this.fechaSolEva = solicitud.fechaSolEva;
    this.codCmp = solicitud.codCmp;
    this.nombreCmp = solicitud.nombreCmp;
    this.nombreRolResponsablePenEva = solicitud.nombreRolResponsablePenEva;
    this.flagLiderTumor = solicitud.flagLiderTumor;
    this.codRolLiderTum = solicitud.codRolLiderTum;
    this.codUsrLiderTum = solicitud.codUsrLiderTum;
    this.usrLiderTum = solicitud.usrLiderTum;
    this.codArchFichaTec = solicitud.codArchFichaTec;
    this.codArchCompMed = solicitud.codArchCompMed;
    this.codInformePDF = solicitud.codInformePDF;
    this.codCmacPDF = solicitud.codCmacPDF;
  }

  get getEvaluacion() {
    const solicitud: EvaluacionService = JSON.parse(localStorage.getItem('evaluacion'));
    this.codMac = solicitud.codMac;
    this.numeroMac = solicitud.numeroMac;
    this.descMAC = solicitud.descMAC;
    this.codSolEvaluacion = solicitud.codSolEvaluacion;
    this.numeroSolEvaluacion = solicitud.numeroSolEvaluacion;
    this.codAfiliado = solicitud.codAfiliado;
    this.paciente = solicitud.paciente;
    this.sexoPaciente = solicitud.sexoPaciente;
    this.codLineaTratamiento = solicitud.codLineaTratamiento;
    this.lineaTratamiento = solicitud.lineaTratamiento;
    this.nroLineaTratamiento = solicitud.nroLineaTratamiento;
    this.edad = solicitud.edad;
    this.estadoEvaluacion = solicitud.estadoEvaluacion;
    this.descEstadoEvaluacion = solicitud.descEstadoEvaluacion;
    this.codDiagnostico = solicitud.codDiagnostico;
    this.descDiagnostico = solicitud.descDiagnostico;
    this.codGrupoDiagnostico = solicitud.codGrupoDiagnostico;
    this.descGrupoDiagnostico = solicitud.descGrupoDiagnostico;
    this.fechaSolEva = solicitud.fechaSolEva;
    this.codCmp = solicitud.codCmp;
    this.nombreCmp = solicitud.nombreCmp;
    this.nombreRolResponsablePenEva = solicitud.nombreRolResponsablePenEva;
    this.flagLiderTumor = solicitud.flagLiderTumor;
    this.codRolLiderTum = solicitud.codRolLiderTum;
    this.codUsrLiderTum = solicitud.codUsrLiderTum;
    this.usrLiderTum = solicitud.usrLiderTum;
    this.codArchFichaTec = solicitud.codArchFichaTec;
    this.codArchCompMed = solicitud.codArchCompMed;
    this.codInformePDF = solicitud.codInformePDF;
    this.codCmacPDF = solicitud.codCmacPDF;
    return solicitud;
  }
}
