import {
  Component,
  OnInit,
  Inject,
  Output,
  NgZone,
  EventEmitter,
  ViewChild,
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ApiListaIndicador } from "src/app/dto/response/ApiListaIndicador";
import { ListaIndicadorRequest } from "src/app/dto/medicamento-nuevo/ListaIndicadorRequest";
import { IndicacionCriterioRequest } from "src/app/dto/request/IndicacionCriterioRequest";
import { DetalleSolicitudEvaluacionService } from "src/app/service/detalle.solicitud.evaluacion.service";
import { WsResponse } from "src/app/dto/WsResponse";
import { EvaluacionService } from "src/app/dto/service/evaluacion.service";
import {
  MENSAJES,
  FLAG_REGLAS_EVALUACION,
  ACCESO_EVALUACION,
  TIPOSCGSOLBEN,
  FILEFTP,
} from "src/app/common";
import { ArchivoFTP } from "src/app/dto/bandeja-preliminar/detalle-preliminar/ArchivoFTP";

import { MessageComponent } from "src/app/core/message/message.component";
import { MatAccordion, MatDialog } from "@angular/material";
import { UsuarioService } from "src/app/dto/service/usuario.service";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { BOpcionMenuLocalStorage } from "src/app/dto/core/BOpcionMenuLocalStorage";
import { InfoSolben } from "src/app/dto/bandeja-preliminar/detalle-preliminar/InfoSolben";
import { InformeSolEvaReporteRequest } from "src/app/dto/solicitudEvaluacion/detalle/InformacionScgEvaRequest";
import { DatePipe } from "@angular/common";
import { CdkTextareaAutosize } from "@angular/cdk/text-field";
import { take } from "rxjs/operators";
import { CoreService } from "src/app/service/core.service";
import { BandejaEvaluacionService } from "src/app/service/bandeja.evaluacion.service";

@Component({
  selector: "app-checklist-paciente",
  templateUrl: "./checklist-paciente.component.html",
  styleUrls: ["./checklist-paciente.component.scss"],
})
export class ChecklistPacienteComponent implements OnInit {
  @Output() btnSiguiente = new EventEmitter<boolean>();
  @ViewChild("autosize") autosize: CdkTextareaAutosize;
  archivoRqt: any;
  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.

    this._ngZone.onStable
      .pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }
  @ViewChild(MatAccordion) accordion: MatAccordion;
  grabarPaso: string;
  rptaPerfilPaciente: number;
  mensajes: string;
  noCriteriosFlag: boolean;
  barCriterios: boolean;
  noCriterios: string;
  primeraVez: boolean = true;

  flagComentarios: Boolean;
  valCumpleChkListPer: any;
  // , {
  //   codigo: 2,
  //   titulo: 'NO APLICA',
  //   selected: false
  // }

  rbtPerfilPcte: any[] = [
    {
      codigo: 1,
      titulo: "SI",
      selected: false,
    },
    {
      codigo: 0,
      titulo: "NO",
      selected: false,
    },
    {
      codigo: 2,
      titulo: "NA",
      selected: false,
    },
  ];

  rbtCriterios: any[] = [
    {
      codigo: 1,
      titulo: "SI",
      selected: false,
    },
    {
      codigo: 0,
      titulo: "NO",
      selected: false,
    },
  ];

  indicadorFrmCtrl: FormControl = new FormControl(null, [Validators.required]);
  rbgPerfilPcteFrmCtrl: FormControl = new FormControl(null, [
    Validators.required,
  ]);
  naPcteFrmCtrl: FormControl = new FormControl(false);
  comePerfcteFrmCtrl: FormControl = new FormControl(null, []);
  // comePerfcteFrmCtrl: FormControl = new FormControl(null, [Validators.required]);
  disableComentario: boolean;

  ApiListaIndicador: ApiListaIndicador;
  listaIndicador: any[] = [];
  criterioInclusion: any[] = [];
  criterioExclusion: any[] = [];
  listaTemporal: any;
  rbgPerfilPcte: any;
  listaIndicadorRequest: ListaIndicadorRequest;
  step: number;
  indicacionCriterio: IndicacionCriterioRequest;

  opcionMenu: BOpcionMenuLocalStorage;
  chkIndicacion: number;
  chkCriteriosInclusion: number;
  chkCriteriosExclusion: number;
  chkPaciente: number;
  txtComentario: number;
  flagEvaluacion = FLAG_REGLAS_EVALUACION;
  flagEvaluacion_ = true;
  valorMostrarOpcion = ACCESO_EVALUACION.mostrarOpcion;

  ValidarListaIndicador: string;
  listaIndicadorData: any;

  infoSolben: InfoSolben;
  // DECLARACION DE LAS VARIABLES FORMGROUP Y FORMCONTROL DETALLE EVALUACION
  detEvaluacionFrmGrp: FormGroup = new FormGroup({
    codSolEvaluacionFrmCtrl: new FormControl(null),
    estadoDescripFrmCtrl: new FormControl(null),
    descripCodMacFrmCtrl: new FormControl(null),
    descripMacFrmCtrl: new FormControl(null),
    codScgSolbenFrmCtrl: new FormControl(null),
    estadoScgSolbenFrmCtrl: new FormControl(null),
    fechaScgSolbenFrmCtrl: new FormControl(null),
    tipoScgSolbenFrmCtrl: new FormControl(null),
    nroCartaGarantiaFrmCtrl: new FormControl(null),
    clinicaFrmCtrl: new FormControl(null),
    medicoTrataPrescripFrmCtrl: new FormControl(null),
    cmpMedicoFrmCtrl: new FormControl(null),
    fechaRecetaFrmCtrl: new FormControl(null),
    fechaQuimioterapiaFrmCtrl: new FormControl(null),
    fechaHospitalInicioFrmCtrl: new FormControl(null),
    fechaHospitalFinFrmCtrl: new FormControl(null),
    descripMedicamentoFrmCtrl: new FormControl(null),
    esquemaFrmCtrl: new FormControl(null),
    personaContactoFrmCtrl: new FormControl(null),
    totalPresupuestoFrmCtrl: new FormControl(null),
    pacienteFrmCtrl: new FormControl(null),
    edadFrmCtrl: new FormControl(null),
    descripDiagFrmCtrl: new FormControl(null),
    codDiagFrmCtrl: new FormControl(null),
    descripGrupoDiagFrmCtrl: new FormControl(null),
    contratanteFrmCtrl: new FormControl(null),
    planFrmCtrl: new FormControl(null),
    codAfiliadoFrmCtrl: new FormControl(null),
    fechaAfiliacionFrmCtrl: new FormControl(null),
    estadioClinicoFrmCtrl: new FormControl(null),
    tnmFrmCtrl: new FormControl(null),
    observacionFrmCtrl2: new FormControl(null),
    //codigo luis
    codHisFrmCtrl: new FormControl(null),
    descHisFrmCtrl: new FormControl(null),
  });

  get codSolEvaluacionFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("codSolEvaluacionFrmCtrl");
  }
  get estadoDescripFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("estadoDescripFrmCtrl");
  }
  get descripCodMacFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("descripCodMacFrmCtrl");
  }
  get descripMacFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("descripMacFrmCtrl");
  }
  get codScgSolbenFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("codScgSolbenFrmCtrl");
  }
  get estadoScgSolbenFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("estadoScgSolbenFrmCtrl");
  }
  get fechaScgSolbenFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("fechaScgSolbenFrmCtrl");
  }
  get tipoScgSolbenFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("tipoScgSolbenFrmCtrl");
  }
  get nroCartaGarantiaFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("nroCartaGarantiaFrmCtrl");
  }
  get clinicaFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("clinicaFrmCtrl");
  }
  get medicoTrataPrescripFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("medicoTrataPrescripFrmCtrl");
  }
  get cmpMedicoFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("cmpMedicoFrmCtrl");
  }
  get fechaRecetaFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("fechaRecetaFrmCtrl");
  }
  get fechaQuimioterapiaFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("fechaQuimioterapiaFrmCtrl");
  }
  get fechaHospitalInicioFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("fechaHospitalInicioFrmCtrl");
  }
  get fechaHospitalFinFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("fechaHospitalFinFrmCtrl");
  }
  get descripMedicamentoFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("descripMedicamentoFrmCtrl");
  }
  get esquemaFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("esquemaFrmCtrl");
  }
  get personaContactoFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("personaContactoFrmCtrl");
  }
  get totalPresupuestoFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("totalPresupuestoFrmCtrl");
  }
  get pacienteFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("pacienteFrmCtrl");
  }
  get edadFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("edadFrmCtrl");
  }
  get descripDiagFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("descripDiagFrmCtrl");
  }
  get codDiagFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("codDiagFrmCtrl");
  }
  get descripGrupoDiagFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("descripGrupoDiagFrmCtrl");
  }
  get contratanteFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("contratanteFrmCtrl");
  }
  get planFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("planFrmCtrl");
  }
  get codAfiliadoFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("codAfiliadoFrmCtrl");
  }
  get fechaAfiliacionFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("fechaAfiliacionFrmCtrl");
  }
  get estadioClinicoFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("estadioClinicoFrmCtrl");
  }
  get tnmFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("tnmFrmCtrl");
  }
  get observacionFrmCtrl2() {
    return this.detEvaluacionFrmGrp.get("observacionFrmCtrl2");
  }
  get codHisFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("codHisFrmCtrl");
  }
  get descHisFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("descHisFrmCtrl");
  }

  request: InformeSolEvaReporteRequest = new InformeSolEvaReporteRequest();
  public step1: number;
  public step2: number;
  public codSolEvaluacion: any;
  mostrarCampoDetalle: number;
  mostrarFechaReceta: number;
  mostrarFechaQuimio: number;
  mostrarFechaHospital: number;
  proBarTabla: boolean;
  flagVerActaCmac: number;
  reporteActaCmac: string;
  flagVerInforme: number;
  reportePdf: string;
  codArchCompMed: number;
  codArchFichaTec: number;

  txtCodigoSolicitud: number;
  txtEstadoSolicitud: number;
  txtCodigoMac: number;
  txtDescripcionMac: number;
  btnInforme: number;
  btnActaMac: number;
  txtNroSCG: number;
  txtEstadoSCG: number;
  txtFechaSCG: number;
  txtTipoSCG: number;
  txtNroCartaGarantiaDet: number;
  txtClinicaDet: number;
  txtMedicoTratante: number;
  txtCMP: number;
  txtFechaReceta: number;
  txtFechaQuimioterapia: number;
  txtFechaHospitalizacion: number;
  txtMedicamentos: number;
  txtEsquemaQuimioterapia: number;
  txtPersonaContacto: number;
  txtTotalPresupuesto: number;
  txtPacienteDet: number;
  txtEdad: number;
  txtDiagnostico: number;
  txtCie10: number;
  txtGrupoDiagnostico: number;
  //txtGrupoDiagnostico: number;
  txtContratante: number;
  txtPlan: number;
  txtCodigoAfiliado: number;
  txtFechaAfiliacion: number;
  txtEstadioClinico: number;
  txtTNM: number;
  txtObservacion: number;
  //txtObservacion: number;
  btnEnviarAlertaMonitoreo: number;
  btnRegistrarEvaAutorizador: number;
  btnRegistrarEvaLiderTumor: number;
  mensaje: string;

  constructor(
    @Inject(EvaluacionService) private solicitud: EvaluacionService,
    @Inject(UsuarioService) private userService: UsuarioService,
    private spinerService: Ng4LoadingSpinnerService,
    private spinnerService: Ng4LoadingSpinnerService,
    private dialog: MatDialog,
    private _ngZone: NgZone,
    private datePipe: DatePipe,
    private coreService: CoreService,
    private bandejaEvaluacionService: BandejaEvaluacionService,
    private detalleSolicitudEvaluacionService: DetalleSolicitudEvaluacionService,
    private detalleServicioSolEva: DetalleSolicitudEvaluacionService
  ) {}

  ngOnInit() {
    this.accesoOpcionMenu();
    this.inicializarVariables();
  }

  public visualizarInformeAutorizador(): void {
    this.archivoRqt = new ArchivoFTP();
    this.archivoRqt.codArchivo = this.solicitud.codInformePDF;
    this.archivoRqt.ruta = FILEFTP.rutaInformeAutorizador;
    this.descargarDocumento2();
  }

  public descargarDocumento2(): void {
    this.spinnerService.show();
    this.coreService.descargarArchivoFTP(this.archivoRqt).subscribe(
      (response: WsResponse) => {
        if (response.audiResponse.codigoRespuesta === "0") {
          response.data.contentType = "application/pdf";
          const blob = this.coreService.crearBlobFile(response.data);
          const link = document.createElement("a");
          link.target = "_blank";
          link.href = window.URL.createObjectURL(blob);
          link.setAttribute("download", response.data.nomArchivo);
          link.click();
          this.spinnerService.hide();
        } else {
          this.mensaje = response.audiResponse.mensajeRespuesta;
          this.openDialogMensaje(
            MENSAJES.ERROR_NOFUNCION,
            this.mensaje,
            true,
            false,
            null
          );
          this.spinnerService.hide();
        }
      },
      (error) => {
        console.error(error);
        this.openDialogMensaje(
          MENSAJES.ERROR_NOFUNCION,
          this.mensaje,
          true,
          false,
          null
        );
        this.spinnerService.hide();
      }
    );
  }

  public visualizarActaPDF() {
    this.archivoRqt = new ArchivoFTP();
    this.archivoRqt.codArchivo = this.solicitud.codCmacPDF;
    this.archivoRqt.ruta = FILEFTP.rutaInformeAutorizador;
    this.descargarDocumento2();
  }

  public inicializarVariables(): void {
    this.ApiListaIndicador = new ApiListaIndicador();
    this.listaIndicador = [];
    this.criterioInclusion = [];
    this.criterioExclusion = [];

    this.step1 = 0;
    this.step2 = 0;
    this.codSolEvaluacion = this.solicitud.numeroSolEvaluacion;
    this.request.codSolEva = this.solicitud.codSolEvaluacion;
    this.infoSolben = new InfoSolben();
    this.mostrarCampoDetalle = TIPOSCGSOLBEN.mostrarCampoDetalle;
  }

  public mostrarInformacionSCG(): void {
    this.validarClaseEstadioClinico();
    this.validarClaseTnm();
    this.mostrarInformacionRestSolben();
  }

  mostrarInformacionRestSolben(){
    let infoSolbenRequest = new InfoSolben();

    infoSolbenRequest.codDiagnostico = this.infoSolben.codDiagnostico;
    infoSolbenRequest.codAfiliado = this.infoSolben.codAfiliado;
    infoSolbenRequest.codClinica = this.infoSolben.codClinica;

    this.detalleServicioSolEva
      .consultarInformacionScgEvaRest(infoSolbenRequest)
      .subscribe(
        (data: WsResponse) => {
          if (data.audiResponse.codigoRespuesta === "0") {
            this.infoSolben.codDiagnostico = data.data.codDiagnostico;
            this.infoSolben.diagnostico = data.data.diagnostico;
            this.infoSolben.codGrupoDiagnostico = data.data.codGrupoDiagnostico;
            this.infoSolben.grupoDiagnostico = data.data.grupoDiagnostico;
            this.infoSolben.paciente = data.data.paciente;
            this.infoSolben.sexoPaciente = data.data.sexoPaciente;
            this.infoSolben.clinica = data.data.clinica;

            this.codSolEvaluacionFrmCtrl.setValue(this.codSolEvaluacion);
            this.estadoDescripFrmCtrl.setValue(this.infoSolben.descripEstadoSolEva);
            this.descripCodMacFrmCtrl.setValue(this.infoSolben.descripCodMac);
            this.descripMacFrmCtrl.setValue(this.infoSolben.descripcionMac);
            this.codScgSolbenFrmCtrl.setValue(this.infoSolben.nroSCGSolben);
            this.estadoScgSolbenFrmCtrl.setValue(this.infoSolben.estadoSCGSolben);
            this.fechaScgSolbenFrmCtrl.setValue(
              this.datePipe.transform(this.infoSolben.fecSCGSolben, "dd/MM/yyyy") +
                " " +
                this.infoSolben.horaSCGSolben
            );
            this.tipoScgSolbenFrmCtrl.setValue(this.infoSolben.tipoSolben);
            this.nroCartaGarantiaFrmCtrl.setValue(this.infoSolben.nroCartaGarantia);
            this.clinicaFrmCtrl.setValue(this.infoSolben.clinica);
            this.medicoTrataPrescripFrmCtrl.setValue(this.infoSolben.medicoTratante);
            this.cmpMedicoFrmCtrl.setValue(this.infoSolben.cmpMedico);
            this.mostrarFechaReceta =
              this.infoSolben.codTipoSolben === TIPOSCGSOLBEN.farmaciaCompleja ||
              this.infoSolben.codTipoSolben === TIPOSCGSOLBEN.quimioAmbulatoria
                ? TIPOSCGSOLBEN.mostrarCampoDetalle
                : TIPOSCGSOLBEN.ocultarCampoDetalle;
            this.fechaRecetaFrmCtrl.setValue(this.infoSolben.fechaReceta);
            this.mostrarFechaQuimio =
              this.infoSolben.codTipoSolben === TIPOSCGSOLBEN.quimioAmbulatoria
                ? TIPOSCGSOLBEN.mostrarCampoDetalle
                : TIPOSCGSOLBEN.ocultarCampoDetalle;
            this.fechaQuimioterapiaFrmCtrl.setValue(this.infoSolben.fechaQuimio);
            this.mostrarFechaHospital =
              this.infoSolben.codTipoSolben === TIPOSCGSOLBEN.hospitalizacion
                ? TIPOSCGSOLBEN.mostrarCampoDetalle
                : TIPOSCGSOLBEN.ocultarCampoDetalle;
            this.fechaHospitalInicioFrmCtrl.setValue(
              this.infoSolben.fechaHospitalInicio
            );
            this.fechaHospitalFinFrmCtrl.setValue(this.infoSolben.fechaHospitalFin);
            this.descripMedicamentoFrmCtrl.setValue(
              this.infoSolben.medicamentos !== null
                ? this.infoSolben.medicamentos.replace(/\|/g, ",")
                : null
            );
            this.esquemaFrmCtrl.setValue(
              this.infoSolben.esquemaQuimio !== null
                ? this.infoSolben.esquemaQuimio.replace(/\|/g, ",")
                : null
            );
            this.personaContactoFrmCtrl.setValue(this.infoSolben.personaContacto);
            this.totalPresupuestoFrmCtrl.setValue(this.infoSolben.totalPresupuesto); // TO-DO FALTA DECIMAL
            this.pacienteFrmCtrl.setValue(this.infoSolben.paciente);
            this.edadFrmCtrl.setValue(this.infoSolben.edad);
            this.descripDiagFrmCtrl.setValue(this.infoSolben.diagnostico);
            this.codDiagFrmCtrl.setValue(this.infoSolben.codDiagnostico);
            this.descripGrupoDiagFrmCtrl.setValue(this.infoSolben.grupoDiagnostico);
            this.contratanteFrmCtrl.setValue(this.infoSolben.contratante);
            this.planFrmCtrl.setValue(this.infoSolben.plan);
            this.codAfiliadoFrmCtrl.setValue(this.infoSolben.codAfiliado);
            this.fechaAfiliacionFrmCtrl.setValue(this.infoSolben.fechaAfiliado);
            this.estadioClinicoFrmCtrl.setValue(
              this.infoSolben.estadoClinico == ""
                ? "---"
                : this.infoSolben.estadoClinico
            );
            this.tnmFrmCtrl.setValue(
              this.infoSolben.tnm != "" ? this.infoSolben.tnm : "---"
            );
            this.observacionFrmCtrl2.setValue(this.infoSolben.observacion);
            this.codHisFrmCtrl.setValue(this.infoSolben.codHis);
            this.descHisFrmCtrl.setValue(this.infoSolben.descHis);
          } else {
            this.mensaje =
              "Error al consultar la información de la Evaluación.";
            this.openDialogMensaje(
              MENSAJES.INFO_NO_DATA,
              this.mensaje,
              true,
              false,
              null
            );
          }
          this.proBarTabla = false;
        },
        (error) => {
          console.error(error);
          this.mensaje = "Error al obtener el detalle de la Evaluacion.";
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            this.mensaje,
            true,
            false,
            null
          );
          this.proBarTabla = false;
        }
      );

  }

  validarClaseEstadioClinico() {
    if (this.infoSolben.estadoClinico == "") {
      let idEstadioClinico = document.getElementById("idEstadioClinico");
      idEstadioClinico.classList.add("formPersonal");
    }
  }

  validarClaseTnm() {
    if (this.infoSolben.tnm == "") {
      let idTnm = document.getElementById("idTnm");
      idTnm.classList.add("formPersonal");
    }
  }

  /**Funcionalidad de Detalle Solicitud Evaluacion */
  public consultarInformacionScgEva() {
    this.proBarTabla = true;
    this.detalleSolicitudEvaluacionService
      .consultarInformacionScgEva(this.request)
      .subscribe(
        (data: WsResponse) => {
          if (data.audiResponse.codigoRespuesta === "0") {
            this.infoSolben = data.data.solbenBean;
            this.flagVerActaCmac = data.data.flagVerActaCmac;
            this.reporteActaCmac = data.data.reporteActaCmac;
            this.flagVerInforme = data.data.flagVerInforme;
            this.reportePdf = data.data.reportePdf;
            this.codArchCompMed = data.data.codArchComplMed;
            this.codArchFichaTec = data.data.codArchFichaTec;
            // this.guardarDetalleEvaluacion();
            // if (this.infoSolben.codAfiliado != null) {
            //   this.listaLineaTratamientoRequest.codigoAfiliado = this.infoSolben.codAfiliado;
            // }

            // if (
            //   this.infoSolben.estadoSolEva ===
            //   ESTADOEVALUACION.estadoObservadoAutorizador
            // ) {
            //   this.validacionLiderTumor();
            // }

            this.mostrarInformacionSCG();
          } else {
            this.mensaje =
              "Error al consultar la información de la Evaluación.";
            this.openDialogMensaje(
              MENSAJES.INFO_NO_DATA,
              this.mensaje,
              true,
              false,
              null
            );
          }
          this.proBarTabla = false;
        },
        (error) => {
          console.error(error);
          this.mensaje = "Error al obtener el detalle de la Evaluacion.";
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            this.mensaje,
            true,
            false,
            null
          );
          this.proBarTabla = false;
        }
      );
  }

  public setStep1(index: number): void {
    this.step = index;
  }

  public setStep2(index: number): void {
    this.step2 = index;
  }

  public setStep(index: number): void {
    this.step = index;
  }

  public iniciarChkListPaciente() {
    this.btnSiguiente.emit(true);
    if (this.primeraVez) {
      this.request.codSolEva = this.solicitud.codSolEvaluacion;

      this.consultarInformacionScgEva();
      this.primeraVez = false;
    }
    //this.rbgPerfilPcteFrmCtrl.disable();
    this.disableComentario = true;
    this.flagComentarios = false; // this.comePerfcteFrmCtrl.disable();
    this.listaIndicadorRequest = new ListaIndicadorRequest();
    this.indicacionCriterio = new IndicacionCriterioRequest();
    this.precargaChkListPaciente();
  }

  public precargaChkListPaciente() {
    this.barCriterios = true;
    this.noCriteriosFlag = true;
    this.listaIndicadorRequest.codSolEvaluacion =
      this.solicitud.codSolEvaluacion;
    this.listaIndicadorRequest.codMac = this.solicitud.codMac;
    // this.listaIndicadorRequest.codGrpDiag = '10';
    this.listaIndicadorRequest.codGrpDiag = this.solicitud.codGrupoDiagnostico;

    this.detalleSolicitudEvaluacionService
      .consultarIndicadorCriterio(this.listaIndicadorRequest)
      .subscribe(
        (data: WsResponse) => {
          if (data.audiResponse.codigoRespuesta === "0") {
            this.noCriteriosFlag = false;
            this.grabarPaso = data.data.grabar;
            this.valCumpleChkListPer = data.data.valCumpleChkListPer;
            if (this.valCumpleChkListPer == 2) {
              this.naPcteFrmCtrl.setValue(true);
            }

            this.ValidarListaIndicador =
              "NUEVA INDICACIÓN (SELECCIONAR EN CASO NO SE MUESTRE PERFIL DE PACIENTE CONFIGURADO EN EL SISTEMA)";
            this.listaIndicadorData = data.data.listaIndicador.length;

            if (this.grabarPaso === "1") {
              this.btnSiguiente.emit(false);
            }
            this.listaIndicador = data.data.listaIndicador;
            this.rbgPerfilPcteFrmCtrl.setValue(data.data.valCumpleChkListPer);
            /*if (this.rbgPerfilPcteFrmCtrl.value != null) {
              this.rbgPerfilPcteFrmCtrl.enable();
            }*/
            if (
              data.data.comentario != null &&
              data.data.comentario.trim() !== ""
            ) {
              this.flagComentarios = true;
              this.comePerfcteFrmCtrl.enable();
              this.comePerfcteFrmCtrl.setValue(data.data.comentario);
            }
            this.listaIndicador.forEach((element) => {
              element.selected = false;
              if (element.codigo === data.data.codigoIndicacionPre) {
                this.indicadorFrmCtrl.setValue(element.codigo);
                this.contadorIndicador(
                  element,
                  "listaCriterioInclusion",
                  "criterioInclusion",
                  true
                );
                this.contadorIndicador(
                  element,
                  "listaCriterioExclusion",
                  "criterioExclusion",
                  true
                );
                element.selected = true;
                this.step = element.codigo;
              }
              element.listaCriterioInclusion.forEach((inclusion) => {
                inclusion.selected = false;
                inclusion.totalDesc = inclusion.descripcion.length;
                if (data.data.inclusionPrecarga != null) {
                  data.data.inclusionPrecarga.forEach((inclusionPre) => {
                    inclusion.selected = false;
                    if (inclusion.codigo === inclusionPre.codigo) {
                      inclusion.selected = true;
                      if (
                        inclusionPre.criterioInclusion === 90 ||
                        inclusionPre.criterioInclusion === 1
                      ) {
                        inclusion.parametro = 1;
                        inclusion.criterioInclusion = 90;
                      } else if (
                        inclusionPre.criterioInclusion === 91 ||
                        inclusionPre.criterioInclusion === 0
                      ) {
                        inclusion.parametro = 0;
                        inclusion.criterioInclusion = 91;
                      }
                    }
                  });
                }
              });
              element.listaCriterioExclusion.forEach((exclusion) => {
                exclusion.selected = false;
                exclusion.totalDesc = exclusion.descripcion.length;
                if (data.data.exclusionPrecarga != null) {
                  data.data.exclusionPrecarga.forEach((exclusionPre) => {
                    exclusion.selected = false;
                    if (exclusion.codigo === exclusionPre.codigo) {
                      exclusion.selected = true;
                      if (
                        exclusionPre.criterioExclusion === 90 ||
                        exclusionPre.criterioExclusion === 1
                      ) {
                        exclusion.parametro = 1;
                        exclusion.criterioExclusion = 90;
                      } else if (
                        exclusionPre.criterioExclusion === 91 ||
                        exclusionPre.criterioExclusion === 0
                      ) {
                        exclusion.parametro = 0;
                        exclusion.criterioExclusion = 91;
                      }
                    }
                  });
                }
              });
            });
          } else {
            this.noCriteriosFlag = true;
            this.noCriterios = `No existen indicadores registrados para Mac: ${this.solicitud.descMAC}
            y Grupo Diagnostico ${this.solicitud.descGrupoDiagnostico}`;
            this.mensajes = data.audiResponse.mensajeRespuesta;
            this.openDialogMensaje(
              MENSAJES.ERROR_NOFUNCION,
              this.mensajes,
              true,
              false,
              null
            );
          }

          this.barCriterios = false;
        },
        (error) => {
          console.error(error);
          this.mensajes = "Error al listar los indicadores y sus criterios.";
          this.openDialogMensaje(
            MENSAJES.ERROR_NOFUNCION,
            this.mensajes,
            true,
            false,
            null
          );
          this.barCriterios = false;
          this.noCriteriosFlag = false;
        }
      );
  }

  public crearRequestGuardar(): void {
    this.listaIndicadorRequest = new ListaIndicadorRequest();
    this.listaIndicadorRequest.codSolEvaluacion =
      this.solicitud.codSolEvaluacion;
    this.listaIndicadorRequest.codMac = this.solicitud.codMac;
    this.listaIndicadorRequest.codGrpDiag = this.solicitud.codGrupoDiagnostico;
    this.listaIndicadorRequest.codigoIndicacion = this.step;
    this.listaIndicadorRequest.valCumpleChkListPer =
      this.rbgPerfilPcteFrmCtrl.value;
    this.listaIndicador.forEach((element) => {
      if (element.codigo === this.listaIndicadorRequest.codigoIndicacion) {
        this.indicacionCriterio = element;
      }
    });

    if (this.naPcteFrmCtrl.value === true) {
      this.listaIndicadorRequest.indicacionCriterio = {};
      this.listaIndicadorRequest.codigoIndicacion = null;
    } else {
      this.listaIndicadorRequest.indicacionCriterio = this.indicacionCriterio;
      this.listaIndicadorRequest.codigoIndicacion = this.step;
    }
    this.listaIndicadorRequest.comentario = this.comePerfcteFrmCtrl.value;
    this.listaIndicadorRequest.codigoRolUsuario = this.userService.getCodRol;
    this.listaIndicadorRequest.codigoUsuario = this.userService.getCodUsuario;
  }

  public insertarCheckListPaciente() {
    this.crearRequestGuardar();
    this.spinerService.show();

    this.detalleSolicitudEvaluacionService
      .insertarCheckListPaciente(this.listaIndicadorRequest)
      .subscribe(
        (data: WsResponse) => {
          if (data.audiResponse.codigoRespuesta === "0") {
            this.grabarPaso = "1";
            this.btnSiguiente.emit(false);
            this.openDialogMensaje(
              MENSAJES.INFO_SUCCESS2,
              null,
              true,
              false,
              null
            );
          } else {
            this.grabarPaso = "0";
            this.btnSiguiente.emit(false);
            this.mensajes = data.audiResponse.mensajeRespuesta;
            this.openDialogMensaje(
              MENSAJES.ERROR_NOFUNCION,
              this.mensajes,
              true,
              false,
              null
            );
          }
          this.spinerService.hide();
        },
        (error) => {
          console.error(error);
          this.grabarPaso = "0";
          this.btnSiguiente.emit(false);
          this.mensajes = "Error al grabar el perfil del paciente.";
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            this.mensajes,
            true,
            false,
            null
          );
          this.spinerService.hide();
        }
      );
  }

  public activarRadioBtn(item) {
    item.selected = true;
    this.listaIndicador.forEach((indicador) => {
      if (item !== indicador) {
        indicador.selected = false;
      }
    });
    this.indicadorFrmCtrl.setValue(item);
  }

  public contadorIndicador(indicador, criterio, objeto, precarga) {
    let Si = 0;
    let No = 0;
    setTimeout(() => {
      indicador[criterio].forEach((x) => {
        if (x.parametro === 1) {
          x[objeto] = 90;
          Si++;
        } else if (x.parametro === 0) {
          x[objeto] = 91;
          No++;
        }
      });
      indicador[criterio].totalSi = Si;
      indicador[criterio].totalNo = No;
      indicador[criterio].rptaCriterio = false;
      this.validandoCriterio(indicador, criterio, precarga);
    }, 500);
  }

  public validandoCriterio(indicador, criterio, precarga) {
    const criterioIndicador = indicador[criterio];
    if (
      criterioIndicador.length ===
      criterioIndicador.totalSi + criterioIndicador.totalNo
    ) {
      criterioIndicador.rptaCriterio = true;
      localStorage.setItem("indicador", JSON.stringify(indicador));
      localStorage.setItem("precarga", precarga);

      this.validarPerfilPaciente(indicador, precarga);
    } else {
      criterioIndicador.rptaCriterio = false;
    }
    return false;
  }

  aplicarNA(e) {
    var indicador_ = JSON.parse(localStorage.getItem("indicador"));
    var precarga_ = localStorage.getItem("precarga");

    if (this.naPcteFrmCtrl.value == false) {
      document.querySelectorAll(".todisable2").forEach((el) => {
        //@ts-ignore
        el.style.pointerEvents = "none";
      });
      this.accordion.closeAll();
      this.rbgPerfilPcteFrmCtrl.setValue(2);
      document
        .querySelectorAll(".todisable2 .mat-expansion-panel-header-title")
        .forEach((el) => {
          //@ts-ignore
          el.style.color = "grey!important";
        });
      this.validarPerfilPaciente(indicador_, precarga_);
    } else {
      this.rbtPerfilPcte.forEach((element) => {
        if (element.codigo === 2) {
          this.rptaPerfilPaciente = element.codigo;
          element.selected = false;
        } else {
          element.selected = false;
        }
      });
      // this.validarPerfilPaciente(indicador_, precarga_);
      document.querySelectorAll(".todisable2").forEach((el) => {
        //@ts-ignore
        el.style.pointerEvents = "auto";
      });
      document
        .querySelectorAll(".todisable2 .mat-expansion-panel-header-title")
        .forEach((el) => {
          //@ts-ignore
          el.style.color = null;
        });
    }
  }

  public validarPerfilPaciente(indicador, precarga) {
    this.rptaPerfilPaciente = 0;
    if (
      indicador.listaCriterioInclusion.rptaCriterio &&
      indicador.listaCriterioExclusion.rptaCriterio &&
      !precarga
    ) {
      this.rbgPerfilPcteFrmCtrl.enable();
      if (
        indicador.listaCriterioInclusion.totalSi ===
          indicador.listaCriterioInclusion.length &&
        indicador.listaCriterioExclusion.totalNo ===
          indicador.listaCriterioExclusion.length
      ) {
        this.rbtPerfilPcte.forEach((element) => {
          if (element.codigo === 1) {
            this.rptaPerfilPaciente = element.codigo;
            element.selected = true;
          } else {
            element.selected = false;
          }
        });
        this.rbgPerfilPcteFrmCtrl.setValue(1);
      } else {
        this.rbtPerfilPcte.forEach((element2) => {
          if (element2.codigo === 0) {
            this.rptaPerfilPaciente = element2.codigo;
            element2.selected = true;
          } else {
            element2.selected = false;
          }
        });
        this.rbgPerfilPcteFrmCtrl.setValue(0);
      }
      this.indicadorFrmCtrl.setValue(indicador);
    } else {
      this.rbgPerfilPcteFrmCtrl.enable();
      this.indicadorFrmCtrl.setValue(indicador);
    }
  }

  public verificarPerfil(perfilRpta) {
    const cambioPerfil: number = perfilRpta.codigo;
    if (this.rptaPerfilPaciente === cambioPerfil && this.grabarPaso !== "1") {
      this.flagComentarios = false; // this.comePerfcteFrmCtrl.disable();
      this.comePerfcteFrmCtrl.markAsUntouched();
      this.disableComentario = true;
    } else {
      this.flagComentarios = true;
      this.comePerfcteFrmCtrl.enable();
      this.disableComentario = false;
    }
  }

  public ValidarChkListPaciente() {
    if (this.indicadorFrmCtrl.value === null) {
      this.mensajes =
        "Selecionar la Lista de Indicaciones del Medicamento de Alta Complejidad";
      return false;
    }

    let valido = false;

    if (this.rbgPerfilPcteFrmCtrl.value != null) {
      valido = true;
    }

    if (valido) {
      if (this.flagComentarios) {
        if (
          this.comePerfcteFrmCtrl.value !== null &&
          this.comePerfcteFrmCtrl.value !== ""
        ) {
          return true;
        } else {
          this.mensajes =
            "Debe ingresar un comentario, el perfil generado fue cambiado";
          this.comePerfcteFrmCtrl.markAsTouched();
          return false;
        }
      } else {
        return true;
      }
      /*if (this.comePerfcteFrmCtrl.enabled) {
        if (this.comePerfcteFrmCtrl.value !== null && this.comePerfcteFrmCtrl.value !== '') {
          return true;
        } else {
          this.mensajes = 'Debe ingresar un comentario, el perfil generado fue cambiado';
          this.comePerfcteFrmCtrl.markAsTouched();
          return false;
        }
      } else {
        return true;
      }
      return true;*/
    } else {
      this.mensajes = "Falta seleccionar los criterios";
      return false;
    }
  }

  public guardarChkListPaciente() {
    // if (this.ValidarChkListPaciente()) {
    this.insertarCheckListPaciente();
    // } else {
    //   this.openDialogMensaje(MENSAJES.ERROR_CAMPOS, this.mensajes, true, false, null);
    // }
  }
  // -------------  FIN PASO 4    ----------------

  // POP-UP MENSAJES
  public openDialogMensaje(
    message: String,
    message2: String,
    alerta: boolean,
    confirmacion: boolean,
    valor: any
  ): void {
    const dialogRef = this.dialog.open(MessageComponent, {
      disableClose: true,
      width: "400px",
      data: {
        title: MENSAJES.medicNuevo.chkListPaciente.TITLE,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((rspta) => {});
  }

  public generarReportePaso4(vista: boolean): void {
    //this.guardarRequestInforme();
    var data = {
      codSolEvaluacion: this.solicitud.codSolEvaluacion,
      codMac: this.solicitud.codMac,
      codGrpDiag: this.solicitud.codGrupoDiagnostico,
    };
    this.detalleSolicitudEvaluacionService.generarReportePaso4(data).subscribe(
      (response: WsResponse) => {
        if (response.audiResponse.codigoRespuesta === "0") {
          response.data.contentType = "application/pdf";
          const blob = this.coreService.crearBlobFile(response.data);
          if (!vista) {
            this.mensaje += "\n*El reporte fue generado correctamente.";
            response.data.nomArchivo = `${response.data.nomArchivo}.pdf`;
            response.data.archivoFile = new File(
              [blob],
              `${response.data.nomArchivo}`,
              {
                type: response.data.contentType,
                lastModified: Date.now(),
              }
            );
            //this.subirArchivoFTP(response.data);
          } else {
            this.spinnerService.hide();
            const link = document.createElement("a");
            link.target = "_blank";
            link.href = window.URL.createObjectURL(blob);
            link.setAttribute("download", response.data.nomArchivo);
            link.click();
          }
        } else {
          this.mensaje = response.audiResponse.mensajeRespuesta;
          this.openDialogMensaje(
            MENSAJES.ERROR_NOFUNCION,
            this.mensaje,
            true,
            false,
            null
          );
          this.spinnerService.hide();
        }
      },
      (error) => {
        this.spinnerService.hide();
        console.error(error);
        const mensaje = MENSAJES.ERROR_SERVICIO;
        this.openDialogMensaje(
          mensaje,
          "Error al generar el Informe Autorizador.",
          true,
          false,
          null
        );
      }
    );
  }

  public accesoOpcionMenu() {
    const data = require("src/assets/data/permisosRecursos.json");
    const bandejaEvaluacion = data.bandejaEvaluacion.paso4;
    const bandejaEvaluacion2 = data.bandejaEvaluacion.detalle;
    this.opcionMenu = JSON.parse(localStorage.getItem("opcionMenu"));

    if (this.opcionMenu.opcion.length > 0) {
      this.opcionMenu.opcion.forEach((element) => {
        const codOpcion = element.codOpcion;
        switch (codOpcion) {
          case bandejaEvaluacion.chkIndicacion:
            this.chkIndicacion = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.chkCriteriosInclusion:
            this.chkCriteriosInclusion = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.chkCriteriosExclusion:
            this.chkCriteriosExclusion = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.chkPaciente:
            this.chkPaciente = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtComentario:
            this.txtComentario = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtCodigoSolicitud:
            this.txtCodigoSolicitud = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtEstadoSolicitud:
            this.txtEstadoSolicitud = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtCodigoMac:
            this.txtCodigoMac = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtDescripcionMac:
            this.txtDescripcionMac = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.btnInforme:
            this.btnInforme = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.btnActaMac:
            this.btnActaMac = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtNroSCG:
            this.txtNroSCG = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtEstadoSCG:
            this.txtEstadoSCG = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtFechaSCG:
            this.txtFechaSCG = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtTipoSCG:
            this.txtTipoSCG = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtNroCartaGarantiaDet:
            this.txtNroCartaGarantiaDet = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtClinicaDet:
            this.txtClinicaDet = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtMedicoTratante:
            this.txtMedicoTratante = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtCMP:
            this.txtCMP = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtFechaReceta:
            this.txtFechaReceta = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtFechaQuimioterapia:
            this.txtFechaQuimioterapia = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtFechaHospitalizacion:
            this.txtFechaHospitalizacion = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtMedicamentos:
            this.txtMedicamentos = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtEsquemaQuimioterapia:
            this.txtEsquemaQuimioterapia = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtPersonaContacto:
            this.txtPersonaContacto = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtTotalPresupuesto:
            this.txtTotalPresupuesto = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtPacienteDet:
            this.txtPacienteDet = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtEdad:
            this.txtEdad = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtDiagnostico:
            this.txtDiagnostico = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtCie10:
            this.txtCie10 = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtGrupoDiagnostico:
            this.txtGrupoDiagnostico = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtContratante:
            this.txtContratante = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtPlan:
            this.txtPlan = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtCodigoAfiliado:
            this.txtCodigoAfiliado = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtFechaAfiliacion:
            this.txtFechaAfiliacion = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtEstadioClinico:
            this.txtEstadioClinico = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtTNM:
            this.txtTNM = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtObservacion:
            this.txtObservacion = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.btnEnviarAlertaMonitoreo:
            this.btnEnviarAlertaMonitoreo = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.btnRegistrarEvaAutorizador:
            this.btnRegistrarEvaAutorizador = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.btnRegistrarEvaLiderTumor:
            this.btnRegistrarEvaLiderTumor = Number(element.flagAsignacion);
            break;
        }
      });
    }
  }

  async canDeactivate() {
    const result = await this.openDialogMensajeSalida(
      "Los cambios no guardados se perderán ¿Desea continuar?",
      null,
      false,
      true,
      null
    );

    return result;
  }

  public openDialogMensajeSalida(
    message: string,
    message2: string,
    alerta: boolean,
    confirmacion: boolean,
    valor: any
  ): any {
    const dialogRef = this.dialog.open(MessageComponent, {
      width: "400px",
      disableClose: true,
      data: {
        title: MENSAJES.ANTECEDENTES.TITULO,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    return dialogRef
      .afterClosed()
      .toPromise() // here you have a Promise instead an Observable
      .then((result) => {
        if (result == 1) {
          this.retirarBanderaSolicitud();
          return Promise.resolve(result == 1);
        }
        //return Promise.resolve(result == 1); // will return a Promise here
      });
  }

  retirarBanderaSolicitud() {
    let codSolEva = localStorage.getItem("codSolEva");
    var json = {
      codSolEva: codSolEva,
      tipo: "SALIENDO",
    };

    this.bandejaEvaluacionService.consultarBanderaEvaluacion(json).subscribe(
      (data) => {
        //return false
      },
      (error) => {
        console.error(error);
        this.mensaje = "ERROR CON EL SERVICIO BANDEJA EVALUACION.";
        this.openDialogMensaje(this.mensaje, null, true, false, null);
        this.spinnerService.hide();
      }
    );
  }
}
