import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  Output,
  EventEmitter,
} from "@angular/core";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";
import * as _moment from "moment";
import { HistPacienteResponse } from "src/app/dto/response/HistPacienteResponse";
import { CheckListRequisitoRequest } from "src/app/dto/request/CheckListRequisitoRequest";
import { DetalleSolicitudEvaluacionService } from "src/app/service/detalle.solicitud.evaluacion.service";
import {
  PARAMETRO,
  MENSAJES,
  MY_FORMATS_AUNA,
  FLAG_REGLAS_EVALUACION,
  ACCESO_EVALUACION,
  FILEFTP,
  GRUPO_PARAMETRO,
  VALIDACION_PARAMETRO,
  RESULT_EVOLUCION,
  RESULTADOEVALUACIONAUTO,
  ESTADOEVALUACION,
  TIPOSCGSOLBEN,
} from "src/app/common";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { CustomValidator } from "src/app/directives/custom.validator";
import { ApiOutResponse } from "src/app/dto/response/ApiOutResponse";
import { EvaluacionService } from "src/app/dto/service/evaluacion.service";
import { ParametroRequest } from "src/app/dto/ParametroRequest";
import { CoreService } from "src/app/service/core.service";
import { ListaParametroservice } from "src/app/service/lista.parametro.service";
import { UsuarioService } from "src/app/dto/service/usuario.service";
import { ParametroResponse } from "src/app/dto/ParametroResponse";
import { MessageComponent } from "src/app/core/message/message.component";
import {
  MatDialog,
  MatTableDataSource,
  MatPaginator,
  MatSort,
} from "@angular/material";
import { WsResponse } from "src/app/dto/WsResponse";
import { BOpcionMenuLocalStorage } from "src/app/dto/core/BOpcionMenuLocalStorage";
import { DocuHistPacienteResponse } from "src/app/dto/response/DocuHistPacienteResponse";
import { ArchivoRequest } from "src/app/dto/request/ArchivoRequest";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { Router } from "@angular/router";
import { MonitoreoEvolucionRequest } from "src/app/dto/request/BandejaEvaluacion/MonitoreoEvolucionRequest";
import { DatePipe } from "@angular/common";
import { ContinuadorRequest } from "src/app/dto/request/ContinuadorRequest";
import { BandejaEvaluacionService } from "src/app/service/bandeja.evaluacion.service";
import { ArchivoFTP } from "src/app/dto/bandeja-preliminar/detalle-preliminar/ArchivoFTP";
import { InformeSolEvaReporteRequest } from "src/app/dto/solicitudEvaluacion/detalle/InformacionScgEvaRequest";
import { InfoSolben } from "src/app/dto/bandeja-preliminar/detalle-preliminar/InfoSolben";
import { BandejaMonitoreoRequest } from "src/app/dto/request/BandejaMonitoreo/BandejaMonitoreoRequest";
import { BandejaMonitoreoService } from "src/app/service/BandejaMonitoreo/bandeja.monitoreo.service";
import { MonitoreoResponse } from "src/app/dto/response/BandejaMonitoreo/MonitoreoResponse";
import { Parametro } from "src/app/dto/Parametro";
import { Console } from "console";

@Component({
  selector: "app-medicamento-continuador",
  templateUrl: "./medicamento-continuador.component.html",
  styleUrls: ["./medicamento-continuador.component.scss"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS_AUNA },
  ],
})
export class MedicamentoContinuadorComponent implements OnInit {
  nroMaxFilaAgreArch: number;
  fileupload: File;

  historicoLineaTratRequisito: HistPacienteResponse[] = [];
  chkListRequisito: CheckListRequisitoRequest = new CheckListRequisitoRequest();
  requestGrabar: ContinuadorRequest = new ContinuadorRequest();
  docRequeridos: HistPacienteResponse[] = [];
  docOtros: HistPacienteResponse[] = [];
  todosDocumentos: HistPacienteResponse[] = [];
  totalDocumentosRequeridos: string;
  totalDocumentosOtros: string;
  cmbResultAutorizador: any[] = [];
  btnGrabarContinuador: boolean;
  mensaje: string;
  regresarBandeja: boolean = false;

  parametroRequest: ParametroRequest;

  activarOpenFile: boolean;
  desDocuNuevo: FormControl;
  fileDocOtros: FormControl;

  mostrarCampoDetalle: number;
  mostrarDocumentos: boolean;
  mostrarMonitoreo: boolean;
  noPendiente: boolean;

  mensajes: string;
  mensajes2: string;
  isLoading: boolean;

  flagResultAuto: boolean;
  resultAutoTxt: String;

  opcionMenu: BOpcionMenuLocalStorage;
  fileRecetaMedica: number;
  txtDescripcion: number; // File otros
  txtResultadoMonitoreo: number;
  txtTareaMonitoreo: number;
  txtResponsableMonitoreo: number;
  txtFechaMonitoreo: number;
  txtResultadoEvaluacion: number;
  txtResultadoAutorizador: number;
  txtComentario: number;
  comentarioTxt: boolean = false;
  btnGrabar: number;
  btnSalir: number;
  flagEvaluacion = FLAG_REGLAS_EVALUACION;
  valorMostrarOpcion = ACCESO_EVALUACION.mostrarOpcion;

  estadoContinuador: string = "";
  dataSource: MatTableDataSource<HistPacienteResponse>;
  grabarPaso: string;
  dataMonitoreo: MonitoreoResponse[];
  hideBotonMon: boolean = true;
  parametroReq: ParametroRequest;
  cmbTipoTumor: any[];
  cmbSubTipoTumor: any[];
  cmbDescripcion: any[];
  listaEstadosMonitoreo: Parametro[];

  columnsGrilla = [
    {
      codAcceso: ACCESO_EVALUACION.continuador.medicamento,
      columnDef: "descripcionMac",
      header: "MEDICAMENTO",
      cell: (docHistPcte: HistPacienteResponse) =>
        `${docHistPcte.descripcionMac}`,
    },
    {
      codAcceso: ACCESO_EVALUACION.continuador.tipoDocumento,
      columnDef: "nombreTipoDocumento",
      header: "TIPO DE DOCUMENTO",
      cell: (docHistPcte: HistPacienteResponse) =>
        `${docHistPcte.nombreTipoDocumento}`,
    },
    {
      codAcceso: ACCESO_EVALUACION.continuador.descripcionDocumento,
      columnDef: "descripcionDocumento",
      header: "DESCRIPCIÓN DOCUMENTO",
      cell: (docHistPcte: HistPacienteResponse) =>
        `${docHistPcte.descripcionDocumento}`,
    },
    {
      codAcceso: ACCESO_EVALUACION.continuador.fechaCarga,
      columnDef: "fechaCarga",
      header: "FECHA DE CARGA",
      cell: (docHistPcte: HistPacienteResponse) => `${docHistPcte.fechaCarga}`,
    },
  ];

  displayedColumns: String[];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Output() btnSiguiente = new EventEmitter<boolean>();

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
    observacionFrmCtrl: new FormControl(null),
    //codigo luis
    codHisFrmCtrl: new FormControl(null),
    descHisFrmCtrl: new FormControl(null),
  });
  codEvolucion: any;

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
  get observacionFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("observacionFrmCtrl");
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
  step: number;
  public codSolEvaluacion: any;
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

  constructor(
    private adapter: DateAdapter<any>,
    private spinnerService: Ng4LoadingSpinnerService,
    private coreService: CoreService,
    private listaParametroservice: ListaParametroservice,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private bandejaMonitoreoService: BandejaMonitoreoService,
    @Inject(UsuarioService) private userService: UsuarioService,
    @Inject(EvaluacionService) private solicitud: EvaluacionService,
    private router: Router,
    private bandejaEvaluacionService: BandejaEvaluacionService,
    private detalleSolicitudEvaluacionService: DetalleSolicitudEvaluacionService,
    private parametroService: ListaParametroservice,
    private detalleServicioSolEva: DetalleSolicitudEvaluacionService
  ) {
    this.adapter.setLocale("es-PE");
  }

  ngOnInit() {
    this.accesoOpcionMenu();
    this.inicializarVariables();
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

  public mostrarInformacionSCG(): void {
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
            this.fechaScgSolbenFrmCtrl.setValue(this.datePipe.transform(this.infoSolben.fecSCGSolben, "dd/MM/yyyy") + " " +this.infoSolben.horaSCGSolben);
            this.tipoScgSolbenFrmCtrl.setValue(this.infoSolben.tipoSolben);
            this.nroCartaGarantiaFrmCtrl.setValue(this.infoSolben.nroCartaGarantia);
            this.clinicaFrmCtrl.setValue(this.infoSolben.clinica);
            this.medicoTrataPrescripFrmCtrl.setValue(this.infoSolben.medicoTratante);
            this.cmpMedicoFrmCtrl.setValue(this.infoSolben.cmpMedico);
            this.mostrarFechaReceta = this.infoSolben.codTipoSolben === TIPOSCGSOLBEN.farmaciaCompleja ||this.infoSolben.codTipoSolben === TIPOSCGSOLBEN.quimioAmbulatoria? TIPOSCGSOLBEN.mostrarCampoDetalle : TIPOSCGSOLBEN.ocultarCampoDetalle;
            this.fechaRecetaFrmCtrl.setValue(this.infoSolben.fechaReceta);
            this.mostrarFechaQuimio = this.infoSolben.codTipoSolben === TIPOSCGSOLBEN.quimioAmbulatoria ? TIPOSCGSOLBEN.mostrarCampoDetalle : TIPOSCGSOLBEN.ocultarCampoDetalle;
            this.fechaQuimioterapiaFrmCtrl.setValue(this.infoSolben.fechaQuimio);
            this.mostrarFechaHospital = this.infoSolben.codTipoSolben === TIPOSCGSOLBEN.hospitalizacion ? TIPOSCGSOLBEN.mostrarCampoDetalle : TIPOSCGSOLBEN.ocultarCampoDetalle;
            this.fechaHospitalInicioFrmCtrl.setValue(this.infoSolben.fechaHospitalInicio);
            this.fechaHospitalFinFrmCtrl.setValue(this.infoSolben.fechaHospitalFin);
            this.descripMedicamentoFrmCtrl.setValue( this.infoSolben.medicamentos !== null ? this.infoSolben.medicamentos.replace(/\|/g, ",") : null);
            this.esquemaFrmCtrl.setValue(this.infoSolben.esquemaQuimio !== null ? this.infoSolben.esquemaQuimio.replace(/\|/g, ",") : null);
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
            this.estadioClinicoFrmCtrl.setValue(this.infoSolben.estadoClinico ? this.infoSolben.estadoClinico : "---");
            this.tnmFrmCtrl.setValue(this.infoSolben.tnm ? this.infoSolben.tnm : "---");
            this.observacionFrmCtrl.setValue(this.infoSolben.observacion);
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
    /*this.codSolEvaluacionFrmCtrl.setValue(this.codSolEvaluacion);
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
    this.estadioClinicoFrmCtrl.setValue(
      this.infoSolben.estadoClinico ? this.infoSolben.estadoClinico : "---"
    );
    this.tnmFrmCtrl.setValue(this.infoSolben.tnm ? this.infoSolben.tnm : "---");

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

    this.observacionFrmCtrl.setValue(this.infoSolben.observacion);
    this.codHisFrmCtrl.setValue(this.infoSolben.codHis);
    this.descHisFrmCtrl.setValue(this.infoSolben.descHis);*/
  }

  monitoreoFrmGrp: FormGroup = new FormGroup({
    resultAutotizadorTxtFrmCtrl: new FormControl(null),
    rstdoUltMonitoreoFrmCtrl: new FormControl(null),
    tareaMonitoreoFrmCtrl: new FormControl(null),
    responsableUltMonitoreoFrmCtrl: new FormControl(null),
    fechaUltMonitoreoFrmCtrl: new FormControl(null),
    fechaResultadoFrmCtrl: new FormControl(null),
    estadoMonitoreoFrmCtrl: new FormControl(null),
    estadoSegEjecFrmCtrl: new FormControl(null),
    fechaSegEjecFrmCtrl: new FormControl(null),
    tipoTumorFrmCtrl: new FormControl(null),
    subtipoTumorFrmCtrl: new FormControl(null),
    descripRespAlcanFrmCtrl: new FormControl(null),
    resulSistemaFrmCtrl: new FormControl(null),
    resulAutorizadorFrmCtrl: new FormControl(null, [Validators.required]),
    comentarioFrmCtrl: new FormControl(
      null,
      Validators.compose([Validators.pattern("/W|_/g")])
    ),
  });
  get resultAutotizadorTxtFrmCtrl() {
    return this.monitoreoFrmGrp.get("resultAutotizadorTxtFrmCtrl");
  }
  get rstdoUltMonitoreoFrmCtrl() {
    return this.monitoreoFrmGrp.get("rstdoUltMonitoreoFrmCtrl");
  }
  get tareaMonitoreoFrmCtrl() {
    return this.monitoreoFrmGrp.get("tareaMonitoreoFrmCtrl");
  }
  get responsableUltMonitoreoFrmCtrl() {
    return this.monitoreoFrmGrp.get("responsableUltMonitoreoFrmCtrl");
  }
  get fechaUltMonitoreoFrmCtrl() {
    return this.monitoreoFrmGrp.get("fechaUltMonitoreoFrmCtrl");
  }
  get fechaResultadoFrmCtrl() {
    return this.monitoreoFrmGrp.get("fechaResultadoFrmCtrl");
  }
  get estadoMonitoreoFrmCtrl() {
    return this.monitoreoFrmGrp.get("estadoMonitoreoFrmCtrl");
  }
  get estadoSegEjecFrmCtrl() {
    return this.monitoreoFrmGrp.get("estadoSegEjecFrmCtrl");
  }
  get fechaSegEjecFrmCtrl() {
    return this.monitoreoFrmGrp.get("fechaSegEjecFrmCtrl");
  }
  get tipoTumorFrmCtrl() {
    return this.monitoreoFrmGrp.get("tipoTumorFrmCtrl");
  }
  get subtipoTumorFrmCtrl() {
    return this.monitoreoFrmGrp.get("subtipoTumorFrmCtrl");
  }
  get descripRespAlcanFrmCtrl() {
    return this.monitoreoFrmGrp.get("descripRespAlcanFrmCtrl");
  }
  get resulSistemaFrmCtrl() {
    return this.monitoreoFrmGrp.get("resulSistemaFrmCtrl");
  }
  get resulAutorizadorFrmCtrl() {
    return this.monitoreoFrmGrp.get("resulAutorizadorFrmCtrl");
  }
  get comentarioFrmCtrl() {
    return this.monitoreoFrmGrp.get("comentarioFrmCtrl");
  }

  public inicializarVariables(): void {
    this.desDocuNuevo = new FormControl("", [
      CustomValidator.descripcionInvalida(this.todosDocumentos),
    ]);
    this.mostrarCampoDetalle = TIPOSCGSOLBEN.mostrarCampoDetalle;
    this.parametroRequest = new ParametroRequest();
    this.activarOpenFile = true;
    this.mostrarDocumentos = false;
    this.mostrarMonitoreo = false;
    //this.consultarDocumentos();

    this.step1 = 0;
    this.step2 = 0;
    this.codSolEvaluacion = this.solicitud.numeroSolEvaluacion;
    this.request.codSolEva = this.solicitud.codSolEvaluacion;
    this.infoSolben = new InfoSolben();

    this.consultarResultAutorizador();
  }

  public cargarDatosTabla(): void {
    if (
      this.historicoLineaTratRequisito.length &&
      this.historicoLineaTratRequisito.length > 0
    ) {
      this.dataSource = new MatTableDataSource(
        this.historicoLineaTratRequisito
      );
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  public comboTumor(): void {
    this.parametroReq = new ParametroRequest();
    this.parametroReq.codigoGrupo = GRUPO_PARAMETRO.tipoTumor;
    var array = [];
    this.listaParametroservice.consultarParametro(this.parametroReq).subscribe(
      (data: WsResponse) => {
        //this.cargarComboEstadoMonit();

        if (data.audiResponse.codigoRespuesta === "0") {
          data.data.forEach((element) => {
            if (element.codigoExterno == null) {
              array.push(element);
            }
          });
          this.cmbTipoTumor = array;
          this.cmbTipoTumor.unshift({
            codigoParametro: 0,
            nombreParametro: "SELECCIONE",
          });
        } else {
          console.error("No se encuentra data con el codigo de grupo");
        }
        this.cargarComboEstadoMonit();
      },
      (error) => {
        console.error("Error al listar el Resultado del Autorizador");
      }
    );
  }

  public changeSubTipoTumor(event): void {
    this.parametroReq = new ParametroRequest();
    this.parametroReq.codigoGrupo = GRUPO_PARAMETRO.tipoTumor;
    this.parametroReq.codigoParam = event.value;
    this.subtipoTumorFrmCtrl.setValue("");
    this.descripRespAlcanFrmCtrl.setValue("");
    this.cmbDescripcion = [];
    this.cmbSubTipoTumor = [];
    if (event.value !== 0) {
      this.listaParametroservice
        .consultarParametro(this.parametroReq)
        .subscribe(
          (data: WsResponse) => {
            if (data.audiResponse.codigoRespuesta === "0") {
              this.cmbSubTipoTumor = data.data;
              this.cmbSubTipoTumor.unshift({
                codigoParametro: 0,
                nombreParametro: "SELECCIONE",
              });
            } else {
              console.error("No se encuentra data con el codigo de grupo");
            }
          },
          (error) => {
            console.error("Error al listar el Resultado del Autorizador");
          }
        );
    }
  }

  public changeDescripResp(event): void {
    this.parametroReq = new ParametroRequest();
    this.parametroReq.codigoGrupo = GRUPO_PARAMETRO.tipoTumor;
    this.parametroReq.codigoParam = event.value;
    this.descripRespAlcanFrmCtrl.setValue("");
    this.cmbDescripcion = [];
    if (event.value !== 0) {
      this.listaParametroservice
        .consultarParametro(this.parametroReq)
        .subscribe(
          (data: WsResponse) => {
            if (data.audiResponse.codigoRespuesta === "0") {
              this.cmbDescripcion = data.data;
              this.cmbDescripcion.unshift({
                codigoParametro: 0,
                nombreParametro: "SELECCIONE",
              });
            } else {
              console.error("No se encuentra data con el codigo de grupo");
            }
          },
          (error) => {
            console.error("Error al listar el Resultado del Autorizador");
          }
        );
    }
  }
  public visualizarInformeContinuador(): void {
    const archivoRqt = new ArchivoFTP();
    archivoRqt.codArchivo = this.solicitud.codInformePDF;
    archivoRqt.ruta = FILEFTP.rutaInformeAutorizador;
    this.descargarDocumentoContinuador(archivoRqt);
  }
  public descargarDocumentoContinuador(archivoRqt: any): void {
    this.spinnerService.show();
    this.coreService.descargarArchivoFTP(archivoRqt).subscribe(
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

  public cargarComboEstadoMonit() {
    let request = new ParametroRequest();
    request.codigoGrupo = GRUPO_PARAMETRO.estadoMonitoreo;
    this.parametroService.consultarParametro(request).subscribe(
      (data: WsResponse) => {
        //this.consultarUltimoMonitoreo();

        if (data.audiResponse.codigoRespuesta === "0") {
          let param = new Parametro();
          param.codigoParametro = "";
          param.nombreParametro = "TODOS";
          this.listaEstadosMonitoreo = data.data;
        } else {
          console.error(data);
        }
        this.consultarUltimoMonitoreo();
      },
      (error) => {
        console.error("Error al listar parametros");
      }
    );
  }

  public verificarDataMonitoreo(): void {
    const evaRequest: BandejaMonitoreoRequest = new BandejaMonitoreoRequest();
    this.bandejaMonitoreoService
      .consultarMonitoreo(evaRequest)
      .subscribe((data) => {
        //this.comboTumor();
        this.dataMonitoreo = data.data;
        this.dataMonitoreo.forEach((element: MonitoreoResponse) => {
          if (element.codEvolucion == this.codEvolucion) {
            // this.hideBotonMon = false;
            this.hideBotonMon = false;
          }
        });
      });
      this.comboTumor();
  }

  public definirTablaCheckListRequisito(): void {
    this.historicoLineaTratRequisito = [];
    this.displayedColumns = [];

    if (this.flagEvaluacion) {
      this.displayedColumns.push("indice");
    } else {
      this.opcionMenu.opcion.forEach((element) => {
        if (element.codOpcion === ACCESO_EVALUACION.continuador.descargar) {
          this.displayedColumns.push("indice");
        }
      });
    }

    this.columnsGrilla.forEach((c) => {
      if (this.flagEvaluacion) {
        this.displayedColumns.push(c.columnDef);
      } else {
        this.opcionMenu.opcion.forEach((element) => {
          if (
            c.codAcceso &&
            c.codAcceso === element.codOpcion &&
            Number(element.flagAsignacion) === ACCESO_EVALUACION.mostrarOpcion
          ) {
            this.displayedColumns.push(c.columnDef);
          }
        });
      }
    });

    if (this.flagEvaluacion) {
      this.displayedColumns.push("descargar");
    } else {
      this.opcionMenu.opcion.forEach((element) => {
        if (element.codOpcion === ACCESO_EVALUACION.continuador.descargar) {
          this.displayedColumns.push("descargar");
        }
      });
    }

    this.verificarDataMonitoreo();
  }

  public grabarRequest(): void {
    this.chkListRequisito.codSolEva = this.solicitud.codSolEvaluacion;
    this.chkListRequisito.edad = this.solicitud.edad;
    this.chkListRequisito.tipoEvaluacion = 1;
    this.chkListRequisito.codigoRolUsuario = this.userService.getCodRol;
    this.chkListRequisito.codigoUsuario = this.userService.getCodUsuario;
  }

  public consultarCheckListContinuador() {
    this.mostrarDocumentos = false;
    this.isLoading = true;

    this.dataSource = null;
    this.historicoLineaTratRequisito = [];

    this.grabarRequest();
    this.detalleSolicitudEvaluacionService
      .consultarCheckListContinuador(this.chkListRequisito)
      .subscribe(
        (data: DocuHistPacienteResponse) => {

          if (data.codResultado === 0) {
            this.docRequeridos = [];
            this.docOtros = [];
            this.todosDocumentos = [];
            this.historicoLineaTratRequisito =
              data.historialLineaTrat != null ? data.historialLineaTrat : [];
            if (data.documentoLineaTrat != null) {
              data.documentoLineaTrat.forEach((documento) => {
                documento.estado =
                  documento.estadoDocumento !== 88 ? false : true;
                const tempDescription = documento.descripcionDocumento;
                documento.descripcionDocumento = tempDescription.split(
                  "(*)<BR>"
                )[0]
                  ? tempDescription.split("(*)<BR>")[0]
                  : tempDescription;
                documento.subtitle = tempDescription.split("(*)<BR>")[1]
                  ? tempDescription.split("(*)<BR>")[1]
                  : "";
                if (documento.tipoDocumento !== PARAMETRO.documentoOtros) {
                  this.docRequeridos.push(documento);
                } else {
                  this.docOtros.push(documento);
                }
                this.todosDocumentos.push(documento);
              });
            }

            if (!this.flagEvaluacion) {
              this.docRequeridosRol();
            }

            this.totalDocumentosRequeridos = this.docRequeridos.length + "";
            this.totalDocumentosOtros = this.docOtros.length + "";
            this.grabarPaso = data.grabar;

            this.desDocuNuevo.setValidators(
              Validators.compose([
                CustomValidator.descripcionInvalida(this.todosDocumentos),
              ])
            );
            this.cargarDatosTabla();

            if (this.grabarPaso === "1") {
              this.btnSiguiente.emit(false);
            } else {
              this.btnSiguiente.emit(true);
            }
          } else {
            this.openDialogMensaje(data.msgResultado, null, true, false, null);
          }

          this.mostrarDocumentos = true;
          this.isLoading = false;
        },
        (error) => {
          console.error("Error al consultar CheckList Requisito");
          console.error(error);
          this.isLoading = false;
          this.mostrarDocumentos = true;
        }
      );
      this.consultarDatosMonitoreo();
  }

  public docRequeridosRol() {
    let docRequeridosAux: HistPacienteResponse[] = [];
    this.docRequeridos.forEach((doc) => {
      if (doc.tipoDocumento === ACCESO_EVALUACION.continuador.tipoDocumento) {
        docRequeridosAux.push(doc);
      }
    });
    this.docRequeridos = docRequeridosAux;

    var docOtrosAux: HistPacienteResponse[] = [];
    this.docOtros.forEach((doc) => {
      this.opcionMenu.opcion.forEach((element) => {
        if (
          doc.tipoDocumento ===
            ACCESO_EVALUACION.continuador.codigoOtroParametro &&
          ACCESO_EVALUACION.continuador.otro === element.codOpcion &&
          Number(element.flagAsignacion) === ACCESO_EVALUACION.mostrarOpcion
        ) {
          docOtrosAux.push(doc);
        }
      });
    });
    this.docOtros = docOtrosAux;
  }

  public consultarFilaMaxReqParametro() {
    this.parametroRequest.codigoParametro = PARAMETRO.nroFilaCheckListReq;
    this.listaParametroservice.parametro(this.parametroRequest).subscribe(
      (data: ParametroResponse) => {

        if (data.codigoResultado === 0) {
          this.nroMaxFilaAgreArch = Number(
            data.filtroParametro[0].valor1Parametro
          );
        } else {
          this.openDialogMensaje(
            MENSAJES.ERROR_NOFUNCION,
            "No se obtuvo la cantidad máxima de archivos a subir.",
            true,
            false,
            null
          );
        }
        this.definirTablaCheckListRequisito();
      },
      (error) => {
        console.error(error);
        this.openDialogMensaje(
          MENSAJES.ERROR_SERVICIO,
          "Error al obtener total de archivos a subir",
          true,
          false,
          null
        );
      }
    );
  }

  public descargarDocumento(documento: HistPacienteResponse): void {
    const archivoRqt = new ArchivoFTP();
    archivoRqt.codArchivo = documento.codArchivo;
    archivoRqt.nomArchivo = documento.nameFile;
    archivoRqt.ruta = FILEFTP.rutaEvaluacionRequisitos;
    this.spinnerService.show();
    this.coreService.descargarArchivoFTP(archivoRqt).subscribe(
      (response: WsResponse) => {
        if (response.audiResponse.codigoRespuesta === "0") {
          //response.data.contentType = "application/pdf";
          const blob = this.coreService.crearBlobFile(response.data);
          const link = document.createElement("a");
          link.target = "_blank";
          link.href = window.URL.createObjectURL(blob);
          link.setAttribute("download", response.data.nomArchivo);
          link.click();
          this.spinnerService.hide();
        } else {
          this.mensajes2 = response.audiResponse.mensajeRespuesta;
          this.openDialogMensaje(
            MENSAJES.ERROR_NOFUNCION,
            this.mensajes2,
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
          this.mensajes2,
          true,
          false,
          null
        );
        this.spinnerService.hide();
      }
    );
  }

  public grabarRequestDocumento(): void {
    this.chkListRequisito = new CheckListRequisitoRequest();
    this.chkListRequisito.codSolEva = this.solicitud.codSolEvaluacion;
    this.chkListRequisito.edad = this.solicitud.edad;
  }

  public consultarResultAutorizador() {
    this.parametroRequest.codigoGrupo = GRUPO_PARAMETRO.estadoSolEva;
    this.parametroRequest.codigoParam =
      VALIDACION_PARAMETRO.perfilAutorPertenencia;

    this.listaParametroservice
      .consultarParametro(this.parametroRequest)
      .subscribe(
        (data: WsResponse) => {

          if (data.audiResponse.codigoRespuesta === "0") {
            this.cmbResultAutorizador = data.data;
            this.obtenerCombo(
              this.cmbResultAutorizador,
              null,
              "-- Seleccionar Resultado --"
            );
            if (
              this.requestGrabar.codResultadoMonitoreo ===
              RESULT_EVOLUCION.estadoActivo
            ) {
              this.resulAutorizadorFrmCtrl.setValue(
                ESTADOEVALUACION.estadoAprobadoAutorizador
              );
            } else if (
              this.requestGrabar.codResultadoMonitoreo ===
              RESULT_EVOLUCION.estadoInactivo
            ) {
              this.resulAutorizadorFrmCtrl.setValue(
                ESTADOEVALUACION.estadoRechazadoAutorizador
              );
            }
          } else {
            console.error("No se encuentra data con el codigo de grupo");
          }
          this.consultarFilaMaxReqParametro();
        },
        (error) => {
          console.error("Error al listar el Resultado del Autorizador");
        }
      );
  }

  public obtenerCombo(lista: any[], valor: number, descripcion: string) {
    if (lista !== null) {
      lista.unshift({
        codigoParametro: valor,
        nombreParametro: descripcion,
      });
    }
  }

  public consultarDatosMonitoreo() {
    const requestMonit: MonitoreoEvolucionRequest =
      new MonitoreoEvolucionRequest();
    requestMonit.codSoleva = this.solicitud.codSolEvaluacion;

    this.detalleSolicitudEvaluacionService
      .consultarDatosContinuador(requestMonit)
      .subscribe((response: WsResponse) => {
        if (response.data.length > 0) {
          this.tipoTumorFrmCtrl.setValue(response.data[0].pTipoTumor);
          this.subtipoTumorFrmCtrl.setValue(response.data[0].pSubTipTumor);
          this.descripRespAlcanFrmCtrl.setValue(response.data[0].respAlcanzada);
          this.resulAutorizadorFrmCtrl.setValue(
            response.data[0].codRptaAutorizador
          );
          this.comentarioFrmCtrl.setValue(response.data[0].comentario);
          this.fechaResultadoFrmCtrl.setValue(response.data[0].fechaResultado);

          // ACTIVAR SUBTIPO
          this.parametroReq.codigoParam = response.data[0].pTipoTumor;
          this.listaParametroservice
            .consultarParametro(this.parametroReq)
            .subscribe(
              (data: WsResponse) => {
                if (data.audiResponse.codigoRespuesta === "0") {
                  this.cmbSubTipoTumor = data.data;
                  this.cmbSubTipoTumor.unshift({
                    codigoParametro: 0,
                    nombreParametro: "SELECCIONE",
                  });

                  this.parametroReq.codigoParam = response.data[0].pSubTipTumor;
                  // ACTIVAR RESP ALCANZADA
                  this.listaParametroservice
                    .consultarParametro(this.parametroReq)
                    .subscribe(
                      (data: WsResponse) => {
                        if (data.audiResponse.codigoRespuesta === "0") {
                          this.cmbDescripcion = data.data;
                          this.cmbDescripcion.unshift({
                            codigoParametro: 0,
                            nombreParametro: "SELECCIONE",
                          });
                        } else {
                          console.error("No se encuentra data con el codigo de grupo");
                        }
                      },
                      (error) => {
                        console.error("Error al listar el Resultado del Autorizador");
                      }
                    );

                } else {
                  console.error("No se encuentra data con el codigo de grupo");
                }
              },
              (error) => {
                console.error("Error al listar el Resultado del Autorizador");
              }
            );


        }
      });
      this.consultarInformacionScgEva();
  }

  public consultarUltimoMonitoreo(): void {
    this.flagResultAuto = true;
    const requestMonitCont: MonitoreoEvolucionRequest =
      new MonitoreoEvolucionRequest();

    requestMonitCont.codGrpDiag = this.solicitud.codGrupoDiagnostico;
    requestMonitCont.codSoleva = this.solicitud.codSolEvaluacion;
    requestMonitCont.codMac = this.solicitud.codMac;
    requestMonitCont.codAfiliado = this.solicitud.codAfiliado;

    this.detalleSolicitudEvaluacionService
      .consultarUltimoMonitoreo(requestMonitCont)
      .subscribe(
        (response: WsResponse) => {
          if (response.audiResponse.codigoRespuesta === "0") {
            if (response.data !== null) {
              this.noPendiente = true;
              this.mostrarMonitoreo = true;
              this.flagResultAuto = true;
              this.requestGrabar.codResponsableMonitoreo =
                response.data.codResponsableMonitoreo;
              this.requestGrabar.codResultadoMonitoreo =
                response.data.codResEvolucion;
              this.rstdoUltMonitoreoFrmCtrl.setValue(
                response.data.descResEvolucion
              );
              this.codEvolucion = response.data.codEvolucion;
              this.tareaMonitoreoFrmCtrl.setValue(
                response.data.codigoDescripcionMonitoreo
              );
              this.responsableUltMonitoreoFrmCtrl.setValue(
                response.data.nomResponsableMonitoreo
              );
              this.fechaUltMonitoreoFrmCtrl.setValue(
                response.data.fechaMonitoreo
              );
              this.estadoMonitoreoFrmCtrl.setValue(
                response.data.codEstadoMonitoreo
              );
              this.estadoSegEjecFrmCtrl.setValue(response.data.descEstSeg);
              this.fechaSegEjecFrmCtrl.setValue(response.data.fechaEjecutiva);
            } else {
              this.rstdoUltMonitoreoFrmCtrl.setValue(null);
              this.tareaMonitoreoFrmCtrl.setValue(null);
              this.responsableUltMonitoreoFrmCtrl.setValue(null);
              this.fechaUltMonitoreoFrmCtrl.setValue(null);
              this.fechaResultadoFrmCtrl.setValue(null);
              this.resulSistemaFrmCtrl.setValue(null);
              this.comentarioFrmCtrl.setValue(null);
              this.comentarioFrmCtrl.enable();
            }
          } else {
            this.noPendiente = true;
            this.mostrarMonitoreo = true;
            this.flagResultAuto = false;
            this.requestGrabar.codResponsableMonitoreo = null;
            this.requestGrabar.codResultadoMonitoreo = null;
            this.resultAutoTxt = "No se tiene registrado el monitoreo";
            this.resultAutotizadorTxtFrmCtrl.setValue(this.resultAutoTxt);
            this.rstdoUltMonitoreoFrmCtrl.setValue(null);
            this.tareaMonitoreoFrmCtrl.setValue(null);
            this.responsableUltMonitoreoFrmCtrl.setValue(null);
            this.fechaUltMonitoreoFrmCtrl.setValue(null);
            this.fechaResultadoFrmCtrl.setValue(null);
            this.resulSistemaFrmCtrl.setValue(null);
            this.comentarioFrmCtrl.setValue(null);
            this.comentarioFrmCtrl.enable();
          }
          this.consultarCheckListContinuador();

        },
        (error) => {
          this.mostrarMonitoreo = true;
          this.noPendiente = true;
          console.error(error);
          this.mensajes =
            "Error al consultar los documentos para la evaluación del medicamento continuador.";
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            this.mensajes,
            true,
            false,
            null
          );
        }
      );
  }

  public grabarContinuador() {
    this.btnGrabarContinuador = true;
    if (this.validarContinuador()) {
      this.requestGrabar.codSolicitudEvaluacion =
        this.solicitud.codSolEvaluacion;
      this.requestGrabar.comentario = this.comentarioFrmCtrl.value;
      this.requestGrabar.nroTareaMonitoreo = this.tareaMonitoreoFrmCtrl.value;
      // this.requestGrabar.fechaMonitoreo = this.fechaUltMonitoreoFrmCtrl.value;
      this.requestGrabar.resultadoAutorizador =
        this.resulAutorizadorFrmCtrl.value;
      this.requestGrabar.fechaEstado = this.datePipe.transform(
        new Date(),
        "dd/MM/yyyy HH:mm:ss"
      );
      this.requestGrabar.fecha_resultado = this.datePipe.transform(
        this.fechaResultadoFrmCtrl.value,
        "yyyy-MM-dd"
      );
      //this.requestGrabar.fecha_resultado =  this.fechaResultadoFrmCtrl.value;
      //this.requestGrabar.fechaMonitoreo =  this.fechaResultadoFrmCtrl.value;
      this.requestGrabar.fechaMonitoreo = this.datePipe.transform(
        this.fechaResultadoFrmCtrl.value,
        "dd/MM/yyyy"
      );

      this.requestGrabar.codigoRolUsuario = this.userService.getCodRol;
      this.requestGrabar.codigoUsuario = this.userService.getCodUsuario;
      this.requestGrabar.tipoTumor = this.tipoTumorFrmCtrl.value;
      this.requestGrabar.subTipoTumor = this.subtipoTumorFrmCtrl.value;
      this.requestGrabar.respAlcanzada = this.descripRespAlcanFrmCtrl.value;
      (this.requestGrabar.codAfiliado = this.solicitud.codAfiliado),
        (this.requestGrabar.codMac = this.solicitud.codMac),
        (this.requestGrabar.codGrupoDiagnostico =
          this.solicitud.codGrupoDiagnostico);
      this.detalleSolicitudEvaluacionService
        .guardarContinuador(this.requestGrabar)
        .subscribe(
          (response: WsResponse) => {
            if (
              response.audiResponse !== null &&
              response.audiResponse.codigoRespuesta === "0"
            ) {
              this.regresarBandeja = true;
              this.openDialogMensaje(
                response.audiResponse.mensajeRespuesta,
                null,
                true,
                false,
                null
              );
              this.btnGrabarContinuador = false;
            } else {
              this.openDialogMensaje(
                response.audiResponse.mensajeRespuesta,
                null,
                true,
                false,
                null
              );
              this.btnGrabarContinuador = false;
            }
          },
          (error) => {
            console.error(error);
            this.btnGrabarContinuador = false;
            this.openDialogMensaje(
              MENSAJES.ERROR_NOFUNCION,
              null,
              true,
              false,
              null
            );
          }
        );
    } else {
      this.btnGrabarContinuador = false;
      this.mensaje = this.mensaje.substring(0, this.mensaje.length - 2);
      this.openDialogMensaje(
        MENSAJES.ERROR_CAMPOS,
        this.mensaje,
        true,
        false,
        null
      );
    }
  }

  public validarContinuador(): boolean {
    let valido = true;
    /*if (this.resulAutorizadorFrmCtrl.value === null) {
      return false;
    }*/
    // if (this.resulSistemaFrmCtrl.value !== null) {
    //   if (this.resulAutorizadorFrmCtrl.invalid) {
    //     this.mensaje = "*Por favor, ingresar el resultado final.\n";
    //     this.resulAutorizadorFrmCtrl.markAsTouched();
    //     return false;
    //   }
    // }
    // if (
    //   this.comentarioTxt === true &&
    //   (this.comentarioFrmCtrl.value === null ||
    //     this.comentarioFrmCtrl.value.trim() === "")
    // ) {
    //   this.mensaje = "*Por favor, ingresar la observación.\n";
    //   return false;
    // }
    this.mensaje = "*Falta cargar el documento <";
    this.docRequeridos.forEach((docReq: HistPacienteResponse) => {
      if (docReq.estadoDocumento === 89 && docReq.tipoDocumento !== 86) {
        valido = false;
        this.mensaje = this.mensaje + docReq.descripcionDocumento + ",";
      }
    });

    this.mensaje = this.mensaje.substring(0, this.mensaje.length - 1) + ">";
    if (!valido) {
      return false;
    } else {
      return true;
    }
  }

  public verficarResultadoAutorizador() {
    this.requestGrabar.resultadoAutorizador =
      this.resulAutorizadorFrmCtrl.value;
    if (
      this.requestGrabar.codResultadoMonitoreo ===
        RESULT_EVOLUCION.estadoActivo &&
      this.resulAutorizadorFrmCtrl.value ===
        ESTADOEVALUACION.estadoAprobadoAutorizador
    ) {
      //this.comentarioFrmCtrl.setValue(null);
      // this.comentarioFrmCtrl.disable();
      this.comentarioTxt = false;
    } else if (
      this.requestGrabar.codResultadoMonitoreo ===
        RESULT_EVOLUCION.estadoInactivo &&
      this.resulAutorizadorFrmCtrl.value ===
        ESTADOEVALUACION.estadoRechazadoAutorizador
    ) {
      //this.comentarioFrmCtrl.setValue(null);
      // this.comentarioFrmCtrl.disable();
      this.comentarioTxt = false;
    } else {
      this.comentarioFrmCtrl.enable();
      this.comentarioFrmCtrl.markAsUntouched();
      this.comentarioTxt = true;
    }
  }

  public openFileRequerido(documento: HistPacienteResponse, event) {
    this.fileupload = event.target.files[0];
    /*if (this.fileupload.size > FILEFTP.tamanioMax) {
      this.mensajes = "Validación del tamaño de archivo";
      this.openDialogMensaje(
        this.mensajes,
        "Solo se permiten archivos de 2MB como máximo",
        true,
        false,
        "Tamaño archivo: " + this.fileupload.size / 1024 / 1024 + "MB"
      );
      return false;
    }*/

    if (false) {
      this.mensajes = "Validación del tamaño de archivo";
      this.openDialogMensaje(
        this.mensajes,
        "El archivo supera la cantidad permitidad '4MB', no se puede cargar el documento.",
        true,
        false,
        "Tamaño archivo: " + this.fileupload.size / 1024 / 1024 + "MB"
      );
      return false;
    } else if (
      this.fileupload.type != FILEFTP.filePdf &&
      this.fileupload.type != FILEFTP.fileExcel
    ) {
      this.openDialogMensaje(
        "Validación del tipo de archivo",
        "Solo se permiten archivos PDF y EXCEL ",
        true,
        false,
        "Tipo de archivo: " + this.fileupload.type + " MB"
      );
      return false;
    }

    this.chkListRequisito = new CheckListRequisitoRequest();
    this.chkListRequisito.codSolEva = this.solicitud.codSolEvaluacion;
    this.chkListRequisito.codCheckListRequisito = documento.codChekListReq;
    this.chkListRequisito.codMac = this.solicitud.codMac;
    this.chkListRequisito.tipoDocumento = 580;
    this.chkListRequisito.descripcionDocumento = documento.descripcionDocumento;
    this.chkListRequisito.estadoDocumento = 88;
    this.chkListRequisito.edad = this.solicitud.edad;
    this.chkListRequisito.tipoEvaluacion = 1;
    this.chkListRequisito.codigoRolUsuario = 2;
    this.chkListRequisito.codigoUsuario = 1002;

    documento.descripcionEstado = "ARCHIVO CARGADO";
    documento.estadoDocumento = 88;
    documento.estado = true;
    documento.cargando = true;
    //this.llamarServicioCargarArchivo();
    this.subirArchivoFTP(documento, 1);
  }

  public verDescripDocumentos(): void {
    if (
      this.desDocuNuevo.value !== undefined &&
      this.desDocuNuevo.value !== ""
    ) {
      this.activarOpenFile = false;
      this.todosDocumentos.forEach((doc: HistPacienteResponse) => {
        if (
          doc.descripcionDocumento.trim().toUpperCase() ===
          this.desDocuNuevo.value.trim().toUpperCase()
        ) {
          this.activarOpenFile = true;
          return;
        }
      });
    } else if (
      this.desDocuNuevo.value === undefined ||
      this.desDocuNuevo.value === ""
    ) {
      this.activarOpenFile = true;
    }
  }

  public openFile(event) {
    //event.preventDefault();
    this.fileupload = event.target.files[0];
    if (
      this.fileupload.type != FILEFTP.filePdf &&
      this.fileupload.type != FILEFTP.fileExcel
    ) {
      this.openDialogMensaje(
        "Validación del tipo de archivo",
        "Solo se permiten archivos PDF y EXCEL ",
        true,
        false,
        "Tipo de archivo: " + this.fileupload.type + " MB"
      );
      return false;
    }

    if (this.docOtros.length < Number(this.nroMaxFilaAgreArch)) {
      this.fileupload = event.target.files[0];
      if (this.fileupload.size > FILEFTP.tamanioMax) {
        this.mensajes = "Validación del tamaño de archivo";
        this.openDialogMensaje(
          this.mensajes,
          "El archivo supera la cantidad permitidad '3MB', no se puede cargar el documento.",
          true,
          false,
          "Tamaño archivo: " + this.fileupload.size / 1024 / 1024 + "MB"
        );
        return false;
      }

      const documento2: HistPacienteResponse = {
        codChekListReq: null,
        lineaTratamiento: null,
        descripcionMac: null,
        tipoDocumento: 580,
        nombreTipoDocumento: "OTROS",
        descripcionDocumento: this.desDocuNuevo.value
          ? this.desDocuNuevo.value
          : null,
        subtitle: "",
        urlDescarga: "",
        fechaCarga: null,
        estadoDocumento: 88,
        descripcionEstado: "ARCHIVO CARGADO",
        estado: true,
        nameFile: this.desDocuNuevo.value,
        codArchivo: null,
        cargando: false,
      };

      this.docOtros.push(documento2);

      this.chkListRequisito = {
        codSolEva: this.chkListRequisito.codSolEva,
        codCheckListRequisito: null,
        codContinuadorDoc: null,
        codMac: this.solicitud.codMac,
        tipoDocumento: 580,
        descripcionDocumento: documento2.descripcionDocumento
          ? documento2.descripcionDocumento
          : null,
        estadoDocumento: 88,
        urlDescarga: null,
        edad: this.solicitud.edad,
        tipoEvaluacion: 2,
        codArchivo: null,
        codigoRolUsuario: 2, // TO-DO SEGUIMIENTO
        codigoUsuario: 1003, // TO-DO SEGUIMIENTO
      };

      this.desDocuNuevo.setValue("");
      this.activarOpenFile = true;

      this.subirArchivoFTP(documento2, 2);
    } else {
      this.mensajes = "Máximo Archivos: " + this.nroMaxFilaAgreArch;
      this.openDialogMensaje(
        "Cantidad de archivos adicionales superada.",
        this.mensajes,
        true,
        false,
        null
      );
    }
    //this.llamarServicioCargarArchivo();
  }

  public subirArchivoFTP(
    documento: HistPacienteResponse,
    tipoDoc: number
  ): void {
    if (
      typeof this.fileupload === "undefined" ||
      typeof this.fileupload.name === "undefined"
    ) {
      this.openDialogMensaje(
        "Subida de archivos al FTP",
        "Falta seleccionar el archivo a subir.",
        true,
        false,
        null
      );
    } else {
      const archivoRequest = new ArchivoRequest();
      archivoRequest.archivo = this.fileupload;

      if (this.fileupload.type == "application/pdf") {
        archivoRequest.nomArchivo =
          documento.descripcionDocumento.replace(/ /gi, "_") +
          "_" +
          this.solicitud.codSolEvaluacion +
          ".pdf";
      } else {
        archivoRequest.nomArchivo =
          documento.descripcionDocumento.replace(/ /gi, "_") +
          "_" +
          this.solicitud.codSolEvaluacion +
          ".xlsx";
      }

      archivoRequest.nomArchivo = archivoRequest.nomArchivo.replace("(*)", "");
      archivoRequest.ruta = FILEFTP.rutaEvaluacionRequisitos;

      this.spinnerService.show();

      this.coreService.subirArchivo(archivoRequest).subscribe(
        (response: WsResponse) => {
          if (response.audiResponse.codigoRespuesta === "0") {
            this.mensajes = response.audiResponse.mensajeRespuesta;
            this.chkListRequisito.codArchivo = response.data.codArchivo;
            this.llamarServicioCargarArchivo();
          } else {
            this.mensajes =
              response.audiResponse.mensajeRespuesta +
              ".. No se logró eliminar el archivo";
            this.openDialogMensaje(
              MENSAJES.ERROR_NOFUNCION,
              this.mensajes,
              true,
              false,
              null
            );
            if (tipoDoc === 1) {
              this.eliminarRequeridosDoc(documento);
            } else {
              this.eliminarOtrosDoc(documento);
            }
          }
          this.spinnerService.hide();
        },
        (error) => {
          this.spinnerService.hide();
          console.error(error);
          this.mensajes = "Error al enviar archivo FTP.";
          this.openDialogMensaje(
            MENSAJES.ERROR_CARGA_SERVICIO,
            this.mensajes,
            true,
            false,
            null
          );
          if (tipoDoc === 1) {
            this.eliminarRequeridosDoc(documento);
          } else {
            this.eliminarOtrosDoc(documento);
          }
        }
      );
    }
  }

  public llamarServicioCargarArchivo() {
    this.spinnerService.show();

    this.detalleSolicitudEvaluacionService
      .cargarArchivo(this.chkListRequisito)
      .subscribe(
        (data: WsResponse) => {
          if (data.audiResponse.codigoRespuesta === "0") {
            //this.consultarDocumentos();
            this.consultarCheckListContinuador();
            this.mensajes = data.audiResponse.mensajeRespuesta;
            this.openDialogMensaje(
              "Archivo cargado...!",
              this.mensajes,
              true,
              false,
              null
            );
          } else {
            this.mensajes = data.audiResponse.mensajeRespuesta;
            this.openDialogMensaje(
              MENSAJES.ERROR_NOFUNCION,
              this.mensajes,
              true,
              false,
              null
            );
          }
          this.spinnerService.hide();
        },
        (error) => {
          console.error(error);
          this.spinnerService.hide();
          this.mensajes = "Error al registar/actualizar documento.";
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            this.mensajes,
            true,
            false,
            null
          );
        }
      );
  }

  public eliminarRequeridosDoc(documento: HistPacienteResponse) {
    const requeridosTemp = this.docRequeridos;
    documento.estado = false;
    documento.estadoDocumento = 89;

    this.chkListRequisito = {
      codSolEva: this.chkListRequisito.codSolEva,
      codCheckListRequisito: documento.codChekListReq,
      codContinuadorDoc: null,
      codMac: this.solicitud.codMac,
      tipoDocumento: 580,
      descripcionDocumento: documento.descripcionDocumento,
      estadoDocumento: 89,
      urlDescarga: null,
      edad: this.solicitud.edad,
      tipoEvaluacion: 1,
      codArchivo: null,
      codigoRolUsuario: this.userService.getCodRol, // TO-DO SEGUIMIENTO
      codigoUsuario: this.userService.getCodUsuario, // TO-DO SEGUIMIENTO
    };

    this.llamarEliminarArchivos(requeridosTemp, 1);
  }

  public eliminarOtrosDoc(documento: HistPacienteResponse) {
    const otrosTemp = this.docOtros;
    let contador: number;
    contador = 0;
    this.docOtros.forEach((otroDoc) => {
      if (otroDoc.descripcionDocumento === documento.descripcionDocumento) {
        this.docOtros.splice(contador, 1);
      }
      contador++;
    });

    this.chkListRequisito = {
      codSolEva: this.chkListRequisito.codSolEva,
      codCheckListRequisito: documento.codChekListReq,
      codContinuadorDoc: null,
      codMac: this.solicitud.codMac,
      tipoDocumento: 87,
      descripcionDocumento: documento.descripcionDocumento,
      estadoDocumento: 89,
      urlDescarga: null,
      edad: this.solicitud.edad,
      tipoEvaluacion: 1,
      codArchivo: null,
      codigoRolUsuario: this.userService.getCodRol, // TO-DO SEGUIMIENTO
      codigoUsuario: this.userService.getCodUsuario, // TO-DO SEGUIMIENTO
    };
    this.llamarEliminarArchivos(otrosTemp, 2);
  }

  public llamarEliminarArchivos(
    documentos: HistPacienteResponse[],
    tipo: number
  ) {
    this.detalleSolicitudEvaluacionService
      .eliminarArchivo(this.chkListRequisito)
      .subscribe(
        (data: ApiOutResponse) => {
          if (data.codResultado === 0) {
            this.openDialogMensaje(
              "Archivo fue eliminado...!",
              data.msgResultado,
              true,
              false,
              null
            );
            //this.consultarDocumentos();
            this.consultarCheckListContinuador();
          } else {
            this.mensajes = data.msgResultado;
            if (tipo === 1) {
              this.docRequeridos = documentos;
            } else {
              this.docOtros = documentos;
            }
            this.openDialogMensaje(
              MENSAJES.ERROR_NOFUNCION,
              this.mensajes,
              true,
              false,
              null
            );
          }
        },
        (error) => {
          console.error(error);
          this.mensajes = "Error, por favor volver a intentar";
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            this.mensajes,
            true,
            false,
            null
          );
          if (tipo === 1) {
            this.docRequeridos = documentos;
          } else {
            this.docOtros = documentos;
          }
        }
      );
  }

  public irDetalleMonitoreo() {
    const evaRequest: BandejaMonitoreoRequest = new BandejaMonitoreoRequest();
    this.bandejaMonitoreoService
      .consultarMonitoreo(evaRequest)
      .subscribe((data) => {
        this.dataMonitoreo = data.data;

        this.dataMonitoreo.forEach((element: MonitoreoResponse) => {
          if (element.codEvolucion == this.codEvolucion) {
            this.verDetalleSolicitud(element);
          }
        });
      });
  }

  public verDetalleSolicitud(rowMonitoreo: MonitoreoResponse) {
    const request = new BandejaMonitoreoRequest();
    request.codEvaluacion = rowMonitoreo.codSolEvaluacion;

    this.bandejaMonitoreoService.consultarMonitoreo(request).subscribe(
      (data) => {
        //this.retirarBanderaSolicitud();
        this.router.navigate(["/app/monitoreo-paciente"]);
        localStorage.setItem("modeConsultCont", "true");
        localStorage.setItem("monitoreo", JSON.stringify(rowMonitoreo));
      },
      (error) => {
        console.error(error);
        this.mensaje = "ERROR CON EL SERVICIO BANDEJA MONITOREO.";
        this.openDialogMensaje(this.mensaje, null, true, false, null);
        this.spinnerService.hide();
      }
    );
  }

  public ValidarChecklistRequisito() {
    if (this.docRequeridos === undefined && this.docRequeridos.length === 0) {
      this.mensajes = MENSAJES.ERROR_DOCREQUERIDO;
      return false;
    }

    let valido = true;

    this.mensajes = "Falta cargar el documento <";
    this.docRequeridos.forEach((docReq: HistPacienteResponse) => {
      if (docReq.estadoDocumento === 89 && docReq.tipoDocumento !== 86) {
        valido = false;
        this.mensajes = this.mensajes + docReq.descripcionDocumento + ",";
      }
    });

    this.mensajes = this.mensajes.substring(0, this.mensajes.length - 1) + ">";

    if (valido) {
      return true;
    } else {
      return false;
    }
  }

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
        title: MENSAJES.MEDICONTINUADOR.TITLE,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((rspta) => {
      if (this.regresarBandeja === true) {
        return true;
        //this.router.navigate(["./app/bandeja-evaluacion"]);
      }
    });
  }

  public salirContinuador(): void {
    this.router.navigate(["./app/detalle-evaluacion"]);
  }

  public accesoOpcionMenu() {
    const data = require("src/assets/data/permisosRecursos.json");
    const bandejaEvaluacion = data.bandejaEvaluacion.continuador;
    const bandejaEvaluacion2 = data.bandejaEvaluacion.detalle;
    this.opcionMenu = JSON.parse(localStorage.getItem("opcionMenu"));

    if (this.opcionMenu.opcion.length > 0) {
      this.opcionMenu.opcion.forEach((element) => {
        const codOpcion = element.codOpcion;
        switch (codOpcion) {
          case bandejaEvaluacion.fileRecetaMedica:
            this.fileRecetaMedica = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtDescripcion:
            this.txtDescripcion = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtResultadoMonitoreo:
            this.txtResultadoMonitoreo = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtTareaMonitoreo:
            this.txtTareaMonitoreo = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtResponsableMonitoreo:
            this.txtResponsableMonitoreo = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtFechaMonitoreo:
            this.txtFechaMonitoreo = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtResultadoEvaluacion:
            this.txtResultadoEvaluacion = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtResultadoAutorizador:
            this.txtResultadoAutorizador = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtComentario:
            this.txtComentario = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnGrabar:
            this.btnGrabar = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnSalir:
            this.btnSalir = Number(element.flagAsignacion);
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
          case bandejaEvaluacion.txtFechaReceta:
            this.txtFechaReceta = Number(element.flagAsignacion);
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
        title: MENSAJES.MEDICONTINUADOR.salidaMedicamentoContinuador.TITLE,
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

  // public openDialogMensaje2(
  //   message: string,
  //   message2: string,
  //   alerta: boolean,
  //   confirmacion: boolean,
  //   valor: any
  // ): any {
  //   const dialogRef = this.dialog.open(MessageComponent, {
  //     width: "400px",
  //     disableClose: true,
  //     data: {
  //       title: MENSAJES.ANTECEDENTES.TITULO,
  //       message: message,
  //       message2: message2,
  //       alerta: alerta,
  //       confirmacion: confirmacion,
  //       valor: valor,
  //     },
  //   });
  //   return dialogRef
  //     .afterClosed()
  //     .toPromise() // here you have a Promise instead an Observable
  //     .then((result) => {
  //       return Promise.resolve(result == 1); // will return a Promise here
  //     });
  // }
  public generarContinuador(vista: boolean): void {
    //this.guardarRequestInforme();
    var data = {
      cod_evaluacion: this.solicitud.codSolEvaluacion,
      cod_afiliado: this.solicitud.codAfiliado,
      cod_mac: this.solicitud.codMac,
      cod_grp_diag: this.solicitud.codGrupoDiagnostico,
    };
    this.detalleSolicitudEvaluacionService.generarContinuador(data).subscribe(
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
          "Error al generar el Informe Continuador.",
          true,
          false,
          null
        );
      }
    );
  }
}
