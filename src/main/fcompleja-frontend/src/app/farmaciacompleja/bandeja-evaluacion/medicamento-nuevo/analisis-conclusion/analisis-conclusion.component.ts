import {
  Component,
  OnInit,
  Inject,
  Output,
  EventEmitter,
  ViewChild,
  NgZone,
} from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { CheckListPacPrefeInstiRequest } from "src/app/dto/request/CheckListPacPrefeInstiRequest";
import { LineaTrataPrefeInstiRequest } from "src/app/dto/request/LineaTrataPrefeInstiRequest";
import { ParametroRequest } from "src/app/dto/ParametroRequest";
import { DetalleSolicitudEvaluacionService } from "src/app/service/detalle.solicitud.evaluacion.service";
import { ListaParametroservice } from "src/app/service/lista.parametro.service";
import { ListaCasosEvaluacion } from "src/app/dto/solicitudEvaluacion/bandeja/ListaCasosEvaluacion";
import {
  MatDialog,
  DateAdapter,
  MatTableDataSource,
  MatPaginator,
  MatSort,
} from "@angular/material";
import { CheckListRequisitoRequest } from "src/app/dto/request/CheckListRequisitoRequest";
import { CustomValidator } from "src/app/directives/custom.validator";

import {
  GRUPO_PARAMETRO,
  PARAMETRO,
  PREFERENCIAINSTI,
  VALIDACION_PARAMETRO,
  RESULTADOEVALUACIONAUTO,
  ESTADOEVALUACION,
  MENSAJES,
  EMAIL,
  FILEFTP,
  ROLES,
  FLAG_REGLAS_EVALUACION,
  ACCESO_EVALUACION,
  TIPOSCGSOLBEN,
} from "src/app/common";
import { ParametroResponse } from "src/app/dto/ParametroResponse";
import { WsResponse } from "src/app/dto/WsResponse";
import { SolicitudEvaluacionRequest } from "src/app/dto/request/SolicitudEvaluacionRequest";
import { EvaluacionService } from "src/app/dto/service/evaluacion.service";
import { MessageComponent } from "src/app/core/message/message.component";
import { UsuarioService } from "src/app/dto/service/usuario.service";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { InformeSolEvaReporteRequest } from "src/app/dto/solicitudEvaluacion/detalle/InformacionScgEvaRequest";
import { ChecklistRequisitoResponse } from "src/app/dto/response/BandejaEvaluacion/MedicamentoNuevo/ChecklistRequisitoResponse";
import { ParticipanteRequest } from "src/app/dto/request/BandejaEvaluacion/ParticipanteRequest";
import { ListaFiltroUsuarioRolservice } from "src/app/service/Lista.usuario.rol.service";
import { EmailDTO } from "src/app/dto/core/EmailDTO";
import { DatePipe } from "@angular/common";
import { CorreosService } from "src/app/service/cross/correos.service";
import { OncoWsResponse } from "src/app/dto/response/OncoWsResponse";
import { Router } from "@angular/router";
import { PdfEvaluacion } from "src/app/dto/reporte/PdfEvaluacion";
import { ReporteEvaluacionService } from "src/app/service/Reportes/Evaluacion/reporte-evaluacion.service";
import { CoreService } from "src/app/service/core.service";
import { ArchivoFTP } from "src/app/dto/bandeja-preliminar/detalle-preliminar/ArchivoFTP";
import { ArchivoRequest } from "src/app/dto/request/ArchivoRequest";
import { arch } from "os";
import { EmailRequest } from "src/app/dto/request/BandejaEvaluacion/EmailRequest";
import { BandejaEvaluacionService } from "src/app/service/bandeja.evaluacion.service";
import { CasosEvaluar } from "src/app/dto/solicitudEvaluacion/bandeja/CasosEvaluar";
import { BOpcionMenuLocalStorage } from "src/app/dto/core/BOpcionMenuLocalStorage";
import { MACResponse } from "src/app/dto/configuracion/MACResponse";
import * as _moment from "moment";
import { HistPacienteResponse } from "src/app/dto/response/HistPacienteResponse";
import { CdkTextareaAutosize } from "@angular/cdk/text-field";
import { take } from "rxjs/operators";
import { ListUsrRol } from "src/app/dto/ListUsrRol";
import { SelectionModel } from "@angular/cdk/collections";
import { ApiOutResponse } from "src/app/dto/response/ApiOutResponse";
import { errorHandler } from "@angular/platform-browser/src/browser";
import { InfoSolben } from "src/app/dto/bandeja-preliminar/detalle-preliminar/InfoSolben";

@Component({
  selector: "app-analisis-conclusion",
  templateUrl: "./analisis-conclusion.component.html",
  styleUrls: ["./analisis-conclusion.component.scss"],
})
export class AnalisisConclusionComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Output() btnFinalizar = new EventEmitter<boolean>();
  @Output() btnSiguiente = new EventEmitter<boolean>();
  fileupload: File;
  @ViewChild("autosize") autosize: CdkTextareaAutosize;
  paso5Comite: any;
  listaComites2: any[];
  codSevLeva: any;
  archivoRqt: ArchivoFTP;
  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.

    this._ngZone.onStable
      .pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }
  mostrarDocumentos: boolean;
  dataSource: MatTableDataSource<HistPacienteResponse>;
  columnsGrilla = [
    {
      codAcceso: ACCESO_EVALUACION.paso2.item,
      columnDef: "codChekListReq",
      header: "N°",
      cell: (docHistPcte: HistPacienteResponse) => `${docHistPcte.index}`,
    },
    {
      codAcceso: ACCESO_EVALUACION.paso2.tipoDocumento,
      columnDef: "nombreTipoDocumento",
      header: "TIPO DE DOCUMENTO",
      cell: (docHistPcte: HistPacienteResponse) =>
        `${docHistPcte.nombreTipoDocumento}`,
    },
    {
      codAcceso: ACCESO_EVALUACION.paso2.descripcionDocumento,
      columnDef: "descripcionDocumento",
      header: "DESCRIPCIÓN DOCUMENTO",
      cell: (docHistPcte: HistPacienteResponse) =>
        `${docHistPcte.descripcionDocumento}`,
    },
    {
      codAcceso: ACCESO_EVALUACION.paso2.fechaCarga,
      columnDef: "fechaCarga",
      header: "FECHA DE CARGA",
      cell: (docHistPcte: HistPacienteResponse) => `${docHistPcte.fechaCarga}`,
    },
  ];
  aplicaCanadisable: boolean;
  InstCanadisable: boolean;
  lidTumDisabled: boolean;
  comiteDisabled: boolean;
  primeraVez: boolean = true;
  //noPermitirGrabar: boolean;
  displayedColumns: String[];
  isLoading: boolean;
  step: number;
  grabarPaso: string;
  parametroRequest: ParametroRequest;
  informeAutorizador: PdfEvaluacion;
  estadoCorreoLidTumor: SolicitudEvaluacionRequest;
  codLevObs: number;
  //dataSource: MatTableDataSource<any>;

  racionalidad: FormGroup = new FormGroup({
    indicacionPeritorio: new FormControl(null),
    preferenciaInstitucional: new FormControl(null),
    alternativaTerapeutica: new FormControl(null),
    fichaTecnica: new FormControl(null),
    comentarios: new FormControl(""),
  });

  pertinencia: FormGroup = new FormGroup({
    gpc: new FormControl(null),
    ncon: new FormControl(null),
    categoriaEvidencia: new FormControl(null),
    medPrev: new FormControl(null),
    multiPrevio: new FormControl(null),
    concluyoFase3: new FormControl(null),
    cumpleChecklist: new FormControl(null),
    comentarios: new FormControl(""),
  });

  determinacion: FormGroup = new FormGroup({
    resultadoAutorizador: new FormControl(null),
    modoRechazo: new FormControl(""),
    aplicaCanalizacion: new FormControl(null),
    instanciaCanalizar: new FormControl(null, [Validators.required]),
    docData: new FormControl(null),
    especificarComite: new FormControl(null, [Validators.required]),
    comentarios: new FormControl(""),
    escogerParFrm: new FormControl(null, [Validators.required]),
  });

  flagObservaciones: Boolean;
  radio = 1;
  rbtPerfilPcteP5: any[] = [
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

  rbtPrefInsti: any[] = [
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
      titulo: "NO APLICA",
      selected: false,
    },
  ];

  rbtPertinencia: any[] = [
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

  public anaConclFrmGrp: FormGroup = new FormGroup({
    rbtPerfilPcteFrmCtrl: new FormControl(null),
    rbtPrefInstiFrmCtrl: new FormControl(null),
    descripcionMacAnaConFrmCtrl: new FormControl(null),
    tipoTratamientoGuiaFrmCtrl: new FormControl(null),
    observacionFrmCtrl: new FormControl(null),
    rbtPertinenciaFrmCtrl: new FormControl(null),
    condicionPacFrmCtrl: new FormControl(null),
    tiempoUsoFrmCtrl: new FormControl(null),
    resulReglaSisFrmCtrl: new FormControl(null),
    resultAutorizadorFrmCtrl: new FormControl(null),
    comeAnaConFrmCtrl: new FormControl(null, []),
    // 'comeAnaConFrmCtrl': new FormControl(null, [Validators.required])
  });

  desDocuNuevo_: FormControl;

  indicadorCheckListPaciente: string;

  resultadoSistema: number;
  pasoFinal: boolean;

  solEvaRequest: SolicitudEvaluacionRequest;
  lineaTratRequest: LineaTrataPrefeInstiRequest;
  chkLstPacPreInsRequest: CheckListPacPrefeInstiRequest;
  cmbCondicionPac: any[] = [];
  cmbTiempoUso: any[] = [];
  cmbResultAutorizador: any[] = [];
  codMacAnalisisConcl: any;
  deshabilitarVistaPreliminar: boolean;
  reglasAnalisisConcl: any[][];
  cumplePrefInsti: number;
  cumpleCheckListPer: number;
  codMac: number;
  nroMaxFilaAgreArch: any;
  historicoLineaTratRequisito: HistPacienteResponse[] = [];
  docRequeridos: HistPacienteResponse[] = [];
  docOtros: HistPacienteResponse[] = [];
  todosDocumentos: HistPacienteResponse[] = [];
  totalDocumentosRequeridos: string;
  totalDocumentosOtros: string;
  rptaPerfilPaciente: number;
  nameDocumento: any;
  fileDocumento: any;
  fileDocRequerido: any;
  chkListRequisito: CheckListRequisitoRequest;
  invalidDescription: boolean;
  html: any;
  boton: boolean;
  txtComentario: boolean;
  listaComites = [];
  listaParticipantes = [];

  opcionMenu: BOpcionMenuLocalStorage;
  chkPerfil: number;
  chkPreferencia: number;
  txtTratamiento: number;
  txtTipoTratamiento: number;
  txtObservaciones: number;
  chkPertinencia: number;
  cmbCondicion: number;
  cmbTiempo: number;
  txtResultado: number;
  btnVista: number;
  cmbResultado: number;
  txtComentarioRol: number;
  flagEvaluacion = FLAG_REGLAS_EVALUACION;
  flagEvaluacion_ = true;
  valorMostrarOpcion = ACCESO_EVALUACION.mostrarOpcion;
  mensajes: string;
  desDocuNuevo: any;
  // chkListRequisito: {
  //   codSolEva: any;
  //   codCheckListRequisito: any;
  //   codContinuadorDoc: any;
  //   codMac: number;
  //   tipoDocumento: number;
  //   descripcionDocumento: string;
  //   estadoDocumento: number;
  //   urlDescarga: any;
  //   edad: number;
  //   tipoEvaluacion: number;
  //   codigoRolUsuario: number;
  //   codigoUsuario: number;
  //   codArchivo: any;
  // };
  registroGrabado: boolean;
  activarOpenFile: boolean;
  selectionParticipante: SelectionModel<ListUsrRol> =
    new SelectionModel<ListUsrRol>(true, []);

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
    private adapter: DateAdapter<any>,
    public dialog: MatDialog,
    private router: Router,
    private listaParametroservice: ListaParametroservice,
    private detalleSolicitudEvaluacionService: DetalleSolicitudEvaluacionService,
    private spinnerService: Ng4LoadingSpinnerService,
    private participanteService: ListaFiltroUsuarioRolservice,
    private detalleServicioSolEva: DetalleSolicitudEvaluacionService,
    private correoService: CorreosService,
    private coreService: CoreService,
    private datePipe: DatePipe,
    private reporteService: ReporteEvaluacionService,
    private bandejaEvaluacionService: BandejaEvaluacionService,
    private _ngZone: NgZone,
    @Inject(UsuarioService) private userService: UsuarioService,
    @Inject(EvaluacionService) private solicitud: EvaluacionService
  ) {
    this.adapter.setLocale("es-PE");
  }

  ngOnInit() {
    this.accesoOpcionMenu();

    this.inicializarVariables();
    this.desDocuNuevo_ = new FormControl(
      "",
      CustomValidator.descripcionInvalida(this.todosDocumentos)
    );

    this.listaParametroservice
      .listaComiteFiltro({ codigoEstado: 507 })
      .subscribe((response) => {
        this.listaComites = response.data;
        this.listaComites2 = this.listaComites;

        this.detalleSolicitudEvaluacionService
          .obtenerParticipantesPorComite({ codRol: 8 })
          .subscribe(
            (resp) => {
              this.listaParticipantes = resp["data"];
            },
            (err) => {}
          );
      });

    this.definirTablaCheckListRequisito();

    if (this.userService.getCodRol == 5 || this.userService.getCodRol == 6) {
      this.desDocuNuevo_.disable();
    }
  }
  checkObjetoCompleto(obj) {
    for (let o in obj) {
      if (obj[o] == null) {
        return false;
      }
    }
    return true;
  }

  public validacionEnCanalizar() {
    if (
      this.determinacion.value.aplicaCanalizacion ||
      this.determinacion.value.resultadoAutorizador ||
      this.determinacion.value.instanciaCanalizar
    ) {
      if (
        this.checkObjetoCompleto(this.racionalidad.value) &&
        this.checkObjetoCompleto(this.pertinencia.value)
      ) {
        let determinacion = this.determinacion.value;
        if (
          determinacion.resultadoAutorizador != null &&
          (determinacion.aplicaCanalizacion == 0 ||
            determinacion.instanciaCanalizar != null)
        ) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
    return true;
  }

  public inicializarVariables(): void {
    this.step1 = 0;
    this.step2 = 0;
    this.codSolEvaluacion = this.solicitud.numeroSolEvaluacion;
    this.request.codSolEva = this.solicitud.codSolEvaluacion;
    this.infoSolben = new InfoSolben();
    this.mostrarCampoDetalle = TIPOSCGSOLBEN.mostrarCampoDetalle;
  }

  public definirTablaCheckListRequisito(): void {
    this.historicoLineaTratRequisito = [];
    this.displayedColumns = [];
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
        if (element.codOpcion === ACCESO_EVALUACION.paso2.descargar) {
          this.displayedColumns.push("descargar");
        }
      });
    }
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

  public verDescripDocumentos() {
    if (
      this.desDocuNuevo_.value !== undefined &&
      this.desDocuNuevo_.value !== ""
    ) {
      this.activarOpenFile = false;
      this.todosDocumentos.forEach((doc) => {
        if (
          doc.descripcionDocumento.trim().toUpperCase() ===
          this.desDocuNuevo_.value.trim().toUpperCase()
        ) {
          this.activarOpenFile = true;
          return;
        }
      });
    } else if (
      this.desDocuNuevo_.value === undefined ||
      this.desDocuNuevo_.value === ""
    ) {
      this.activarOpenFile = true;
    }
  }

  cambiarComite(event) {
    let selectedComite = this.listaComites.find(
      (el) => el.codigoComite == event.value
    );

    this.paso5Comite = selectedComite.descripcionComite;
  }

  get rbtPerfilPcteFrmCtrl() {
    return this.anaConclFrmGrp.get("rbtPerfilPcteFrmCtrl");
  }
  get rbtPrefInstiFrmCtrl() {
    return this.anaConclFrmGrp.get("rbtPrefInstiFrmCtrl");
  }
  get descripcionMacAnaConFrmCtrl() {
    return this.anaConclFrmGrp.get("descripcionMacAnaConFrmCtrl");
  }
  get tipoTratamientoGuiaFrmCtrl() {
    return this.anaConclFrmGrp.get("tipoTratamientoGuiaFrmCtrl");
  }
  get observacionFrmCtrl() {
    return this.anaConclFrmGrp.get("observacionFrmCtrl");
  }
  get rbtPertinenciaFrmCtrl() {
    return this.anaConclFrmGrp.get("rbtPertinenciaFrmCtrl");
  }
  get condicionPacFrmCtrl() {
    return this.anaConclFrmGrp.get("condicionPacFrmCtrl");
  }
  get tiempoUsoFrmCtrl() {
    return this.anaConclFrmGrp.get("tiempoUsoFrmCtrl");
  }
  get resulReglaSisFrmCtrl() {
    return this.anaConclFrmGrp.get("resulReglaSisFrmCtrl");
  }
  get resultAutorizadorFrmCtrl() {
    return this.anaConclFrmGrp.get("resultAutorizadorFrmCtrl");
  }
  get comeAnaConFrmCtrl() {
    return this.anaConclFrmGrp.get("comeAnaConFrmCtrl");
  }

  public addElement() {
    // crea un nuevo div
    // y añade contenido
    var newDiv = document.createElement("div");
    var newContent = document.createTextNode("campo requerido");
    newDiv.appendChild(newContent); //añade texto al div creado.

    // añade el elemento creado y su contenido al DOM
    var currentDiv = document.getElementById("mesasge_requerido");
    currentDiv.appendChild(newContent);
  }

  public cambioCanalizar(event) {
    if (event.value == 1) {
      this.determinacion.controls.instanciaCanalizar.enable();
      if (
        this.determinacion.value.instanciaCanalizar == null ||
        this.determinacion.value.instanciaCanalizar == "" ||
        this.determinacion.value.instanciaCanalizar == undefined
      ) {
        this.determinacion.controls.instanciaCanalizar.markAsTouched();
        var idInstanciaCanalizar = document.getElementById(
          "idInstanciaCanalizar"
        );
        if (document.getElementsByClassName("labelEspeComite").length == 0) {
          idInstanciaCanalizar.classList.add("labelEspeComite");
          //this.addElement()
        }
      }
    } else {
      this.determinacion.controls.instanciaCanalizar.disable();
      var idInstanciaCanalizar = document.getElementById(
        "idInstanciaCanalizar"
      );
      idInstanciaCanalizar.classList.remove("labelEspeComite");
    }
  }

  public openFilePaso2(event) {
    // if (this.docOtros.length < Number(this.nroMaxFilaAgreArch)) {
    this.fileupload = event.target.files[0];

    if (this.fileupload.size > FILEFTP.tamanioMax) {
      this.mensajes = "Validación del tamaño de archivo";
      this.openDialogMensaje(
        this.mensajes,
        "El archivo supera la cantidad permitidad '4MB', no se puede cargar el documento.",
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
      tipoDocumento: 517,
      nombreTipoDocumento: "OTROS",
      descripcionDocumento: this.desDocuNuevo_.value
        ? this.desDocuNuevo_.value
        : null,
      subtitle: "",
      urlDescarga: "",
      fechaCarga: null,
      estadoDocumento: 88,
      descripcionEstado: "ARCHIVO CARGADO",
      estado: true,
      nameFile: this.desDocuNuevo_.value,
      codArchivo: null,
      cargando: true,
    };

    this.docOtros.push(documento2);

    this.chkListRequisito = {
      codSolEva: this.solicitud.codSolEvaluacion,
      codCheckListRequisito: null,
      codContinuadorDoc: null,
      codMac: this.solicitud.codMac,
      tipoDocumento: 517,
      descripcionDocumento: documento2.descripcionDocumento
        ? documento2.descripcionDocumento
        : null,
      estadoDocumento: 88,
      urlDescarga: null,
      edad: this.solicitud.edad,
      tipoEvaluacion: 1,
      codigoRolUsuario: this.userService.getCodRol,
      codigoUsuario: this.userService.getCodUsuario,
      codArchivo: null,
    };

    this.desDocuNuevo_.setValue("");
    this.activarOpenFile = true;
    this.subirArchivoFTPPaso2(documento2, 2);
    // } else {
    //   this.mensajes = "Máximo Archivos: " + this.nroMaxFilaAgreArch;
    //   this.openDialogMensaje(
    //     "Cantidad de archivos adicionales superada.",
    //     this.mensajes,
    //     true,
    //     false,
    //     null
    //   );
    // }
  }

  // public subirArchivoFTP(
  //   documento: HistPacienteResponse,
  //   tipoDoc: number
  // ): void {
  //
  //
  //
  //   if (
  //     typeof this.fileupload === "undefined" ||
  //     typeof this.fileupload.name === "undefined"
  //   ) {
  //     this.openDialogMensaje(
  //       "Subida de archivos al FTP",
  //       "Falta seleccionar el archivo a subir.",
  //       true,
  //       false,
  //       null
  //     );
  //   } else if (this.fileupload.type != "application/pdf") {
  //     this.openDialogMensaje(
  //       "Subida de archivos al FTP",
  //       "Tipo de archivo incorrecto. Solo se admite PDF",
  //       true,
  //       false,
  //       null
  //     );
  //   } else {
  //     const archivoRequest = new ArchivoRequest();
  //
  //     archivoRequest.archivo = this.fileupload;
  //     archivoRequest.nomArchivo =
  //       documento.descripcionDocumento.replace(/ /gi, "_") +
  //       "_" +
  //       this.solicitud.codSolEvaluacion +
  //       ".pdf";
  //     archivoRequest.nomArchivo = archivoRequest.nomArchivo.replace("(*)", "");
  //     archivoRequest.ruta = FILEFTP.rutaEvaluacionRequisitos;

  //     this.spinnerService.show();

  //     this.coreService.subirArchivo(archivoRequest).subscribe(
  //       (response: WsResponse) => {
  //         try {
  //
  //           if (response.audiResponse.codigoRespuesta === "0") {
  //             this.mensajes = response.audiResponse.mensajeRespuesta;
  //             this.determinacion.patchValue({
  //               docData: response.data.codArchivo,
  //             });
  //             this.mensajes = "El archivo se cargo correctamente";
  //             this.openDialogMensaje("", this.mensajes, true, false, null);

  //             // this.llamarServicioCargarArchivo();
  //           } else {
  //             this.mensajes =
  //               response.audiResponse.mensajeRespuesta +
  //               ".. No se logró eliminar el archivo";
  //             this.openDialogMensaje(
  //               MENSAJES.ERROR_NOFUNCION,
  //               this.mensajes,
  //               true,
  //               false,
  //               null
  //             );
  //             if (tipoDoc === 1) {
  //               // this.eliminarRequeridosDoc(documento);
  //             } else {
  //               // this.eliminarOtrosDoc(documento);
  //             }
  //           }
  //           this.spinnerService.hide();
  //         } catch (error) {
  //
  //           this.spinnerService.hide();
  //         }
  //       },
  //       (error) => {
  //         this.spinnerService.hide();
  //         console.error(error);
  //         this.mensajes = "Error al enviar archivo FTP.";
  //         this.openDialogMensaje(
  //           MENSAJES.ERROR_CARGA_SERVICIO,
  //           this.mensajes,
  //           true,
  //           false,
  //           null
  //         );
  //         if (tipoDoc === 1) {
  //           // this.eliminarRequeridosDoc(documento);
  //         } else {
  //           // this.eliminarOtrosDoc(documento);
  //         }
  //       }
  //     );
  //   }
  // }

  public subirArchivoFTPPaso2(
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
      archivoRequest.nomArchivo =
        documento.descripcionDocumento.replace(/ /gi, "_") +
        "_" +
        this.solicitud.codSolEvaluacion +
        ".pdf";
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
            this.consultarCheckListPaso5();
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
      codSolEva: this.solicitud.codSolEvaluacion,
      codCheckListRequisito: documento.codChekListReq,
      codContinuadorDoc: null,
      codMac: this.solicitud.codMac,
      tipoDocumento: 517,
      descripcionDocumento: documento.descripcionDocumento,
      estadoDocumento: 89,
      urlDescarga: null,
      edad: this.solicitud.edad,
      tipoEvaluacion: 1,
      codArchivo: null,
      codigoRolUsuario: this.userService.getCodRol,
      codigoUsuario: this.userService.getCodUsuario,
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
            this.consultarCheckListPaso5();
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

  // public openFileRequerido(documento: HistPacienteResponse, event) {
  //   this.fileupload = event.target.files[0];
  //
  //
  //

  //   if (this.fileupload.size > FILEFTP.tamanioMax) {
  //     this.mensajes = "Validación del tamaño de archivo";
  //     this.openDialogMensaje(
  //       this.mensajes,
  //       "El archivo supera la cantidad permitidad '3MB', no se puede cargar el documento.",
  //       true,
  //       false,
  //       "Tamaño archivo: " + this.fileupload.size / 1024 / 1024 + "MB"
  //     );
  //     return false;
  //   } else if (
  //     this.fileupload.type != FILEFTP.filePdf &&
  //     this.fileupload.type != FILEFTP.fileExcel
  //   ) {
  //     this.openDialogMensaje(
  //       "Validación del tipo de archivo",
  //       "Solo se permiten archivos PDF y EXCEL ",
  //       true,
  //       false,
  //       "Tipo de archivo: " + this.fileupload.type + " MB"
  //     );
  //     return false;
  //   }

  //   // this.chkListRequisito = new CheckListRequisitoRequest();
  //   // this.chkListRequisito.codSolEva = this.solicitud.codSolEvaluacion;
  //   // this.chkListRequisito.codCheckListRequisito = documento.codChekListReq;
  //   // this.chkListRequisito.codMac = this.solicitud.codMac;
  //   // this.chkListRequisito.tipoDocumento = documento.tipoDocumento;
  //   // this.chkListRequisito.descripcionDocumento = documento.descripcionDocumento;
  //   // this.chkListRequisito.estadoDocumento = 88;
  //   // this.chkListRequisito.edad = this.solicitud.edad;
  //   // this.chkListRequisito.tipoEvaluacion = 1;
  //   // this.chkListRequisito.codigoRolUsuario = this.userService.getCodRol;
  //   // this.chkListRequisito.codigoUsuario = this.userService.getCodUsuario;

  //   documento.descripcionEstado = "ARCHIVO CARGADO";
  //   documento.estadoDocumento = 88;
  //   documento.estado = true;
  //   documento.cargando = true;

  //   this.subirArchivoFTP(documento, 1);
  // }

  public consultarCheckListPaso5() {
    this.mostrarDocumentos = false;
    this.isLoading = true;

    this.dataSource = null;
    this.historicoLineaTratRequisito = [];
    //this.grabarRequest();

    this.detalleSolicitudEvaluacionService
      .consultarCheckListPaso5({ codSolEva: this.solicitud.codSolEvaluacion })
      .subscribe(
        (res) => {
          if (res["codResultado"] === 0) {
            this.docRequeridos = [];
            this.docOtros = [];
            this.todosDocumentos = [];
            this.historicoLineaTratRequisito =
              res["historialLineaTrat"] != null
                ? res["historialLineaTrat"]
                : [];

            if (res["documentoLineaTrat"] != null) {
              res["documentoLineaTrat"].forEach((documento) => {
                documento.estado =
                  documento.estadoDocumento !== 88 ? false : true;
                documento.cargando = false;
                const tempDescription = documento.descripcionDocumento;
                documento.descripcionDocumento = tempDescription.split(
                  "(*)<BR>"
                )[0]
                  ? tempDescription.split("(*)<BR>")[0]
                  : tempDescription;
                documento.subtitle = tempDescription.split("(*)<BR>")[1]
                  ? tempDescription.split("(*)<BR>")[1]
                  : "";
                if (documento.tipoDocumento === PARAMETRO.documentoOtrosPaso5) {
                  this.docOtros.push(documento);
                }

                this.todosDocumentos.push(documento);
              });
            }
            this.totalDocumentosOtros = this.docOtros.length + "";

            this.desDocuNuevo_.setValidators(
              Validators.compose([
                CustomValidator.descripcionInvalida(this.todosDocumentos),
              ])
            );

            this.docRequeridosRol();
            // }

            this.cargarDatosTabla();

            this.isLoading = false;
            this.mostrarDocumentos = true;
          }

          // if (!this.flagEvaluacion) {
        },
        (err) => {
          console.error("Error al consultar CheckList Requisito");
          console.error(err);
          this.isLoading = false;
          this.mostrarDocumentos = true;
        }
      );
  }

  public docRequeridosRol() {
    var docOtrosAux: HistPacienteResponse[] = [];
    this.docOtros.forEach((doc) => {
      this.opcionMenu.opcion.forEach((element) => {
        if (
          doc.tipoDocumento ===
            ACCESO_EVALUACION.paso2.codigoOtroParametroPaso5 &&
          ACCESO_EVALUACION.paso2.otro === element.codOpcion &&
          Number(element.flagAsignacion) === ACCESO_EVALUACION.mostrarOpcion
        ) {
          docOtrosAux.push(doc);
        }
      });
    });
    this.docOtros = docOtrosAux;
  }

  public cargarDatosTabla(): void {
    if (
      this.historicoLineaTratRequisito.length &&
      this.historicoLineaTratRequisito.length > 0
    ) {
      this.dataSource = new MatTableDataSource(
        this.historicoLineaTratRequisito.map((el, index) => {
          return { ...el, index: index + 1 };
        })
      );
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
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
          response.data.contentType = "application/pdf";
          const blob = this.coreService.crearBlobFile(response.data);
          const link = document.createElement("a");
          link.target = "_blank";
          link.href = window.URL.createObjectURL(blob);
          link.setAttribute("download", response.data.nomArchivo);
          link.click();
          this.spinnerService.hide();
        } else {
          this.mensajes = response.audiResponse.mensajeRespuesta;
          this.openDialogMensaje(
            MENSAJES.ERROR_NOFUNCION,
            this.mensajes,
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
          this.mensajes,
          true,
          false,
          null
        );
        this.spinnerService.hide();
      }
    );
  }

  public grabarRequest(): void {
    this.chkListRequisito.codSolEva = this.solicitud.codSolEvaluacion;
    this.chkListRequisito.edad = this.solicitud.edad;
    this.chkListRequisito.tipoEvaluacion = 1;
    this.chkListRequisito.codigoRolUsuario = this.userService.getCodRol;
    this.chkListRequisito.codigoUsuario = this.userService.getCodUsuario;
  }

  public showDetails() {
    this.consultarCheckListPacPrefeInsti();
  }

  public iniciarAnalisisConclusion() {
    if (this.primeraVez) {
      this.request.codSolEva = this.solicitud.codSolEvaluacion;
      this.consultarInformacionScgEva();
      this.primeraVez = false;
    }
    this.rbtPerfilPcteFrmCtrl.disable();
    this.rbtPrefInstiFrmCtrl.disable();
    this.btnSiguiente.emit(true);
    this.btnFinalizar.emit(true);
    this.indicadorCheckListPaciente = "";
    this.pasoFinal = false;
    this.resultadoSistema = null;
    this.isLoading = false;
    this.mostrarDocumentos = false;
    this.dataSource = null;
    this.activarOpenFile = true;

    this.desDocuNuevo_ = new FormControl(
      "",
      CustomValidator.descripcionInvalida(this.todosDocumentos)
    );
    this.parametroRequest = new ParametroRequest();
    this.chkLstPacPreInsRequest = new CheckListPacPrefeInstiRequest();
    this.solEvaRequest = new SolicitudEvaluacionRequest();
    this.lineaTratRequest = new LineaTrataPrefeInstiRequest();
    this.deshabilitarVistaPreliminar = false;
    this.flagObservaciones = false; // this.comeAnaConFrmCtrl.disable();
    if (this.solicitud.estadoEvaluacion === 19) {
      this.pasoFinal = true;
    }

    // this.consultarCondicionPac();
    // this.consultarTiempoUso();
    // this.consultarResultAutorizador();
    this.consultarCheckListPacPrefeInsti();
    this.consultarCheckListPaso5();
  }

  public consultarCondicionPac() {
    this.parametroRequest.codigoGrupo = GRUPO_PARAMETRO.condicionPac;
    this.listaParametroservice.listaParametro(this.parametroRequest).subscribe(
      (data: ParametroResponse) => {
        if (data.codigoResultado === 0) {
          this.cmbCondicionPac = data.filtroParametro;
          this.obtenerCombo(
            this.cmbCondicionPac,
            null,
            "-- Seleccionar Condicion Paciente --"
          );
        } else {
          console.error(data);
        }
      },
      (error) => {
        console.error("Error al listar Condicion del Paciente");
      }
    );
  }

  public consultarTiempoUso() {
    this.parametroRequest.codigoGrupo = GRUPO_PARAMETRO.tiempoUso;
    this.listaParametroservice.listaParametro(this.parametroRequest).subscribe(
      (data: ParametroResponse) => {
        if (data.codigoResultado === 0) {
          this.cmbTiempoUso = data.filtroParametro;
          this.obtenerCombo(
            this.cmbTiempoUso,
            null,
            "-- Seleccionar Tiempo de Uso --"
          );
        } else {
          console.error(data);
        }
      },
      (error) => {
        console.error("Error al listar Tiempo de Uso");
      }
    );
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
          } else {
            console.error("No se encuentra data con el codigo de grupo");
          }
        },
        (error) => {
          console.error("Error al listar el Resultado del Autorizador");
        }
      );
  }

  public funcionPertinencia() {
    this.resulReglaSisFrmCtrl.setValue(null);
  }

  public obtenerResultado() {
    this.reglasAnalisisConcl = [
      [0, 1, 1],
      [1, 1, 1],
      [1, 1, 2],
    ];
    let sistemaAnalisis = [];
    let i = 0;
    if (this.rbtPertinenciaFrmCtrl.value === null) {
      return;
    }
    if (this.condicionPacFrmCtrl.value === null) {
      return;
    }
    if (this.tiempoUsoFrmCtrl.value === null) {
      return;
    }

    sistemaAnalisis = [
      this.rbtPerfilPcteFrmCtrl.value,
      this.rbtPertinenciaFrmCtrl.value,
      this.rbtPrefInstiFrmCtrl.value,
    ];

    this.reglasAnalisisConcl.forEach((regla) => {
      if (
        sistemaAnalisis[0] === regla[0] &&
        sistemaAnalisis[1] === regla[1] &&
        sistemaAnalisis[2] === regla[2]
      ) {
        i++;
        this.resulReglaSisFrmCtrl.setValue(
          RESULTADOEVALUACIONAUTO.resultadoAprobado
        );
      }
    });
    if (i === 0) {
      this.resulReglaSisFrmCtrl.setValue(
        RESULTADOEVALUACIONAUTO.resultadoRechazado
      );
    }
  }

  public verficarResultadoAutorizador(): void {
    const resulAutorizador = this.resultAutorizadorFrmCtrl.value;

    if (
      !(
        (this.resulReglaSisFrmCtrl.value ===
          RESULTADOEVALUACIONAUTO.resultadoAprobado &&
          resulAutorizador === ESTADOEVALUACION.estadoAprobadoAutorizador) ||
        (this.resulReglaSisFrmCtrl.value ===
          RESULTADOEVALUACIONAUTO.resultadoRechazado &&
          resulAutorizador === ESTADOEVALUACION.estadoRechazadoAutorizador)
      )
    ) {
      this.flagObservaciones = true;
      this.comeAnaConFrmCtrl.enable();
      this.txtComentario = true;
    } else {
      this.flagObservaciones = false; // this.comeAnaConFrmCtrl.disable();
      this.txtComentario = false;
      this.comeAnaConFrmCtrl.markAsUntouched();
    }
  }

  public consultarCheckListPacPrefeInsti() {
    this.solEvaRequest.codSolicitudEvaluacion = this.solicitud.codSolEvaluacion;
    // this.solEvaRequest.codMac = this.solicitud.codMac;
    // this.solEvaRequest.codGrpDiag = this.solicitud.codGrupoDiagnostico;

    /*this.listaParametroservice.listaComite().subscribe((response) => {

    });*/
    this.spinnerService.show();

    this.detalleSolicitudEvaluacionService
      .consultarCheckListPacPrefeInsti(this.solEvaRequest)
      .subscribe(
        (data: WsResponse) => {
          // cambiar a response
          if (data.data) {
            this.codSevLeva = data.data.codSevLeva;
            this.racionalidad.patchValue({
              indicacionPeritorio: data.data.indiPetAuna,
              preferenciaInstitucional: data.data.esPrefIns,
              alternativaTerapeutica: data.data.dispoAlterTerap,
              fichaTecnica: data.data.fichaFDA_EMA,

              comentarios: data.data.comentPaso3 || "",
            });
            this.pertinencia.patchValue({
              gpc: data.data.acorGPCAuna,
              ncon: data.data.acorGNCCN,
              medPrev: data.data.junMedPrev,
              multiPrevio: data.data.comMultiPrev,
              categoriaEvidencia: data.data.catEviden,
              concluyoFase3: data.data.indiConcluFase3,
              cumpleChecklist: data.data.cumpleChckListPerPac,
              comentarios: data.data.comentPaso4 || "",
            });
            this.determinacion.patchValue({
              resultadoAutorizador: data.data.resultAutor,
              modoRechazo: data.data.motRecha || "",
              aplicaCanalizacion: data.data.apliCanal,
              instanciaCanalizar: data.data.instCanal,
              especificarComite: data.data.especComite,
              comentarios: data.data.comentDeter || "",
              escogerParFrm: data.data.codLiderTumor,
            });
            this.codLevObs = data.data.codSevLeva;
            this.btnSiguiente.emit(false);
            /*if(data.data.apliCanal !== null && data.data.apliCanal !== "" ){
              this.noPermitirGrabar = true;
            }*/
            if (
              data.data.resultAutor !== null &&
              data.data.resultAutor !== ""
            ) {
              this.validarcamposBloqueados();
            }
          }
          this.spinnerService.hide();
        },
        (error) => {
          this.spinnerService.hide();
        }
      );
  }

  public validarcamposBloqueados() {
    this.aplicaCanadisable = true;
    this.InstCanadisable = true;
    this.lidTumDisabled = true;
    this.comiteDisabled = true;
  }

  public validarResultadoEvaluacion() {
    if (
      (this.rbtPerfilPcteFrmCtrl.value === 1 ||
        this.rbtPerfilPcteFrmCtrl.value === 0) &&
      (this.rbtPrefInstiFrmCtrl.value === 1 ||
        this.rbtPrefInstiFrmCtrl.value === 2) &&
      this.rbtPertinenciaFrmCtrl.value === 1
    ) {
      this.parametroRequest.codigoGrupo = GRUPO_PARAMETRO.resulReglaSis;
      this.parametroRequest.codigoParametro = PARAMETRO.resulReglaSisAprobado;
      this.parametroRequest.codigoParam = null;

      this.listaParametroservice
        .consultarParametro(this.parametroRequest)
        .subscribe(
          (data: WsResponse) => {
            if (data.audiResponse.codigoRespuesta === "0") {
              this.pasoFinal = true;
              if (data.data.length > 0) {
                this.resulReglaSisFrmCtrl.setValue(
                  data.data[0].nombreParametro
                );
              } else {
                console.error("No se encontraron resultados");
                this.openDialogMensaje(
                  data.audiResponse.mensajeRespuesta,
                  null,
                  true,
                  false,
                  null
                );
              }
            } else {
              console.error(
                "Error en obtener resultado segun la regla del sistema"
              );
              this.openDialogMensaje(
                data.audiResponse.mensajeRespuesta,
                null,
                true,
                false,
                null
              );
            }
          },
          (error) => {
            console.error("Error al obtener el resultado de la evaluación.");
            this.openDialogMensaje(
              MENSAJES.ERROR_SERVICIO,
              "Error al obtener el resultado de la evaluación.",
              true,
              false,
              null
            );
          }
        );
    } else {
      this.parametroRequest.codigoGrupo = GRUPO_PARAMETRO.resulReglaSis;
      this.parametroRequest.codigoParametro = PARAMETRO.ResulReglaSisRechazado;
      this.parametroRequest.codigoParam = null;
      this.listaParametroservice
        .consultarParametro(this.parametroRequest)
        .subscribe(
          (data: WsResponse) => {
            this.pasoFinal = true;
            if (data.audiResponse.codigoRespuesta === "0") {
              if (data.data.length > 0) {
                this.resulReglaSisFrmCtrl.setValue(
                  data.data[0].nombreParametro
                );
              } else {
                console.error("No se encontraron resultados");
                this.openDialogMensaje(
                  data.audiResponse.mensajeRespuesta,
                  null,
                  true,
                  false,
                  null
                );
              }
            } else {
              console.error(
                "Error en obtener resultado segun la regla del sistema"
              );
              this.openDialogMensaje(
                data.audiResponse.mensajeRespuesta,
                null,
                true,
                false,
                null
              );
            }
          },
          (error) => {
            console.error("Error al obtener el resultado de la evaluación.");
            this.openDialogMensaje(
              MENSAJES.ERROR_SERVICIO,
              "Error al obtener el resultado de la evaluación.",
              true,
              false,
              null
            );
          }
        );
    }
  }

  public validarAnalisisConclusion(boton: boolean): boolean {
    this.mensaje = "";
    let valido = true;
    if (this.rbtPerfilPcteFrmCtrl.invalid) {
      this.mensaje += "*Perfil de Paciente no cargo correctamente.\n";
      this.rbtPerfilPcteFrmCtrl.markAsTouched();
      valido = false;
    }

    if (this.rbtPrefInstiFrmCtrl.invalid) {
      this.mensaje +=
        "*Perfil de Preferencias Institucionales no cargo correctamente.\n";
      this.rbtPrefInstiFrmCtrl.markAsTouched();
      valido = false;
    }

    if (this.rbtPertinenciaFrmCtrl.invalid) {
      this.mensaje += "*Seleccionar Pertinencia.\n";
      this.rbtPertinenciaFrmCtrl.markAsTouched();
      valido = false;
    }

    if (this.condicionPacFrmCtrl.invalid) {
      this.mensaje += "*Seleccionar la condición del paciente.\n";
      this.condicionPacFrmCtrl.markAsTouched();
      valido = false;
    }

    if (this.tiempoUsoFrmCtrl.invalid) {
      this.mensaje += "*Seleccionar el tiempo de uso en meses.\n";
      this.tiempoUsoFrmCtrl.markAsTouched();
      valido = false;
    }

    if (!boton) {
      if (this.resultAutorizadorFrmCtrl.invalid) {
        this.mensaje = "*Por favor, ingresar el resultado final.\n";
        this.comeAnaConFrmCtrl.markAsTouched();
        valido = false;
      }

      if (
        this.txtComentario === true &&
        (this.comeAnaConFrmCtrl.value === null ||
          this.comeAnaConFrmCtrl.value.trim() === "")
      ) {
        this.mensaje = "*Por favor, ingresar las observaciones.\n";
        this.comeAnaConFrmCtrl.markAsTouched();
        valido = false;
      }
    }
    return valido;
  }

  public grabarRequestAnalisis(boton: boolean): void {
    // this.chkLstPacPreInsRequest.codSolicitudEvaluacion = this.solicitud.codSolEvaluacion;
    // this.chkLstPacPreInsRequest.cumpleCheckListPerfilPac = this.rbtPerfilPcteFrmCtrl.value;
    // this.chkLstPacPreInsRequest.cumplePrefeInsti = this.rbtPrefInstiFrmCtrl.value;
    // this.chkLstPacPreInsRequest.codMac = this.codMac;
    // this.chkLstPacPreInsRequest.pertinencia = this.rbtPertinenciaFrmCtrl.value;
    // this.chkLstPacPreInsRequest.condicionPaciente = this.condicionPacFrmCtrl.value;
    // this.chkLstPacPreInsRequest.tiempoUso = this.tiempoUsoFrmCtrl.value;
    // if (boton) {
    //   this.chkLstPacPreInsRequest.resultadoAutorizador = null;
    //   this.chkLstPacPreInsRequest.comentario = null;
    //   this.chkLstPacPreInsRequest.flagGrabar = 0;
    // } else {
    //   this.chkLstPacPreInsRequest.resultadoAutorizador = this.resultAutorizadorFrmCtrl.value;
    //   this.chkLstPacPreInsRequest.comentario = this.comeAnaConFrmCtrl.value;
    //   this.chkLstPacPreInsRequest.flagGrabar = 1;
    // }
    this.chkLstPacPreInsRequest.codigoRolUsuario = this.userService.getCodRol;
    this.chkLstPacPreInsRequest.codigoUsuario = this.userService.getCodUsuario;
  }

  public guardarAnalisisConclusion(grabar: boolean) {
    // TRUE => OPCION GRABAR   FALSE=> OPCION FINALIZAR

    // if (this.validarAnalisisConclusion(grabar)) {
    //   this.grabarRequestAnalisis(grabar);
    this.preGuardarAnalisisConclusionre(grabar);
    // } else {()
    //   this.mensaje = this.mensaje.substring(0, (this.mensaje.length - 2));
    //   this.openDialogMensaje(MENSAJES.ERROR_CAMPOS, this.mensaje, true, false, null);
    // }
  }

  preGuardarAnalisisConclusionre(grabar) {
    //if(this.noPermitirGrabar===false){
    if (this.determinacion.value.aplicaCanalizacion === 0) {
      this.mensaje = "LA EVALUACIÓN DE LA SOLICITUD SERÁ FINALIZADA";
      this.openDialogMensajeGuardarAnalisisConclusion(
        "ALERTA",
        this.mensaje,
        false,
        true,
        null,
        (result) => {
          if (result == 1) {
            this.insActCheckListPacPrefeInsti(grabar);
          }
        }
      );
    } else if (this.determinacion.value.aplicaCanalizacion === 1) {
      this.insActCheckListPacPrefeInsti(grabar);
    } else {
      this.insActCheckListPacPrefeInsti(grabar);
    }
    // }else{
    //   this.mensaje = "LA SOLICITUD YA SE ENCUENTRA CON DATOS REGISTRADOS"
    //   this.openDialogMensaje(this.mensaje, null, true, false, null);
    //   return
    // }
  }

  public openDialogMensajeGuardarAnalisisConclusion(
    message: string,
    message2: string,
    alerta: boolean,
    confirmacion: boolean,
    valor: any,
    callback = (result) => {}
  ): void {
    const dialogRef = this.dialog.open(MessageComponent, {
      width: "400px",
      disableClose: true,
      data: {
        title: MENSAJES.medicNuevo.analiConclusion.TITLE,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      callback(result);
    });
  }

  filtrarComite(name) {
    this.listaComites2 = this.listaComites.filter((el) => {
      return el.descripcionComite.toLowerCase().includes(name.toLowerCase());
    });
  }

  //(change)="cambiarInstancia($event)"
  cambiarInstancia(event) {
    if (event.value == 35) {
      this.determinacion.controls.especificarComite.patchValue(null);
      this.determinacion.controls.especificarComite.markAsUntouched();
    } else {
      this.determinacion.controls.escogerParFrm.markAsUntouched();
    }
  }

  public insActCheckListPacPrefeInsti(grabar: boolean): void {
    let totalMarcados = 0;

    if (
      this.determinacion.value.aplicaCanalizacion === null ||
      this.determinacion.value.aplicaCanalizacion === ""
    ) {
    } else {
      totalMarcados++;
    }

    if (
      this.determinacion.value.instanciaCanalizar === null ||
      this.determinacion.value.instanciaCanalizar === ""
    ) {
    } else {
      totalMarcados++;
    }

    //
    // if(this.racionalidad.invalid){
    //
    //   this.mensaje = "Falta ingresar datos en racionalidad"
    //   this.openDialogMensaje(this.mensaje, null, true, false, null);
    //   return
    //   }

    //
    // if(this.pertinencia.invalid){
    //
    //   this.mensaje = "Falta ingresar datos en pertinencia"
    //   this.openDialogMensaje(this.mensaje, null, true, false, null);
    //   return
    // }

    if (this.determinacion.value.aplicaCanalizacion == 1) {
      if (this.determinacion.getRawValue().instanciaCanalizar == 35) {
        if (
          this.determinacion.getRawValue().escogerParFrm == null ||
          this.determinacion.getRawValue().escogerParFrm == "" ||
          this.determinacion.getRawValue().escogerParFrm == undefined
        ) {
          this.determinacion.controls.escogerParFrm.markAsTouched();
          return;
        } else {
          totalMarcados++;
        }
      }

      if (this.determinacion.getRawValue().instanciaCanalizar == 506) {
        if (
          this.determinacion.getRawValue().especificarComite == null ||
          this.determinacion.getRawValue().especificarComite == "" ||
          this.determinacion.getRawValue().especificarComite == undefined ||
          this.determinacion.getRawValue().especificarComite == -1
        ) {
          this.determinacion.controls.especificarComite.markAsTouched();
          return;
        } else {
          totalMarcados++;
        }
      }
    }

    if (!this.validacionEnCanalizar()) {
      this.mensaje = "Formulario incompleto";
      this.openDialogMensaje(this.mensaje, null, true, false, null);
      return;
    }

    // if(totalMarcados===0){
    //   return
    // }
    this.servicioGuardarAnalisisConclusion();

    // if(this.racionalidad.invalid){
    //
    //   this.mensaje = "Falta ingresar datos en racionalidad"
    //   this.openDialogMensaje(this.mensaje, null, true, false, null);
    //   return
    // }else if(this.pertinencia.invalid){
    //
    //   this.mensaje = "Falta ingresar datos en pertinencia"
    //   this.openDialogMensaje(this.mensaje, null, true, false, null);
    //   return
    // }

    // if(this.determinacion.value.aplicaCanalizacion == null || this.determinacion.value.aplicaCanalizacion == "" || this.determinacion.value.aplicaCanalizacion == undefined){
    //
    //   return
    // }else if(this.determinacion.value.instanciaCanalizar == null || this.determinacion.value.instanciaCanalizar == "" || this.determinacion.value.instanciaCanalizar == undefined){
    //
    //   return
    // }else if(this.determinacion.getRawValue().escogerParFrm == null || this.determinacion.getRawValue().escogerParFrm == '' || this.determinacion.getRawValue().escogerParFrm == undefined){
    //
    //   .escogerParFrm)
    //   this.determinacion.controls.escogerParFrm.markAsTouched();
    //   return
    // }else if(this.determinacion.getRawValue().especificarComite == null || this.determinacion.getRawValue().especificarComite == '' || this.determinacion.getRawValue().especificarComite == undefined){
    //
    //   .especificarComite)
    //   this.determinacion.controls.especificarComite.markAsTouched();
    //   return
    // }else if(this.racionalidad.invalid){
    //
    //   this.mensaje = "Falta ingresar datos en racionalidad"
    //   this.openDialogMensaje(this.mensaje, null, true, false, null);
    //   return
    // }else if(this.pertinencia.invalid){
    //
    //   this.mensaje = "Falta ingresar datos en pertinencia"
    //   this.openDialogMensaje(this.mensaje, null, true, false, null);
    //   return
    // }

    // else if(this.determinacion.getRawValue().instanciaCanalizar == 35 ){
    //
    //   .escogerParFrm)
    //   if(this.determinacion.getRawValue().escogerParFrm == null || this.determinacion.getRawValue().escogerParFrm == '' || this.determinacion.getRawValue().escogerParFrm == undefined){
    //     this.determinacion.controls.escogerParFrm.markAsTouched();
    //     return
    //   }
    //   return
    // }else if(this.determinacion.getRawValue().instanciaCanalizar == 506){
    //
    //   if(this.determinacion.getRawValue().especificarComite == null || this.determinacion.getRawValue().especificarComite == '' || this.determinacion.getRawValue().especificarComite == undefined){
    //     this.determinacion.controls.especificarComite.markAsTouched();
    //     return
    //   }
    // }
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

  servicioGuardarAnalisisConclusion() {
    this.mensajes = "";
    const json = {
      codSolicitudEvaluacion: this.solicitud.codSolEvaluacion,
      codAfiliado: this.solicitud.codAfiliado,
      indiPetAuna: this.racionalidad.value.indicacionPeritorio,
      esPrefIns: this.racionalidad.value.preferenciaInstitucional,
      dispoAlterTerap: this.racionalidad.value.alternativaTerapeutica,
      fichaFDA_EMA: this.racionalidad.value.fichaTecnica,
      comMultiPrev: this.pertinencia.value.multiPrevio,
      acorGPCAuna: this.pertinencia.value.gpc,
      acorGNCCN: this.pertinencia.value.ncon,
      catEviden: this.pertinencia.value.categoriaEvidencia,
      junMedPrev: this.pertinencia.value.medPrev,
      indiConcluFase3: this.pertinencia.value.concluyoFase3,
      resultAutor: this.determinacion.value.resultadoAutorizador,
      carDocuSust: this.determinacion.value.docData,
      motRecha: this.determinacion.value.modoRechazo,
      apliCanal: this.determinacion.value.aplicaCanalizacion,
      instCanal: this.determinacion.value.instanciaCanalizar,
      especComite:
        this.determinacion.value.instanciaCanalizar == 35
          ? -1
          : this.determinacion.value.especificarComite || -1,
      comentDeter: this.determinacion.value.comentarios,
      codigoRolUsuario: this.userService.getCodRol,
      codigoUsuario: this.userService.getCodUsuario,
      codLiderTumor: this.determinacion.value.escogerParFrm,
      codSevLeva: this.codSevLeva,
    };
    localStorage.setItem("paso5Comite", this.paso5Comite);

    this.detalleSolicitudEvaluacionService
      .insActCheckListPacPrefeInsti(json)
      .subscribe(
        (data: WsResponse) => {
          if (data.audiResponse.codigoRespuesta === "0") {
            if (data && data.data && !data.data.resultAutor) {
              this.aplicaCanadisable = true;
              this.lidTumDisabled = true;
              this.InstCanadisable = true;
            }
            if (this.determinacion.controls.aplicaCanalizacion.value == 0) {
              this.grabarPaso = "0";
              this.btnSiguiente.emit(true);
              //this.noPermitirGrabar = true;
              this.mensaje = "La solicitud ha sido completada con exito.";
              this.cambiarEstadoTratamiento();
              this.openDialogMensaje(this.mensaje, null, true, false, null);
              return;
            } else if (
              this.determinacion.controls.aplicaCanalizacion.value == 1
            ) {
              //this.btnSiguiente.emit(true);
              this.mensaje = "La información se grabó correctamente";
              this.openDialogMensaje(this.mensaje, null, true, false, null);
            } else {
              this.mensaje = "La información se grabó correctamente";
              this.openDialogMensaje(this.mensaje, null, true, false, null);
            }
            this.deshabilitarVistaPreliminar = false;
            this.validarResultadoEvaluacion();
            this.grabarPaso = "1";
            this.btnSiguiente.emit(false);
            if (
              this.determinacion.value.instanciaCanalizar == 35 &&
              this.determinacion.value.escogerParFrm !== null
            ) {
              this.mensajes += "*La solicitud ha sido completada con exito.";
              let listaLidTumor: CasosEvaluar[];
              listaLidTumor = [];
              listaLidTumor.push({
                numSolicitudEvaluacion: this.solicitud.numeroSolEvaluacion,
                paciente: this.solicitud.paciente,
                diagnostico: this.solicitud.descDiagnostico,
                codigoMedicamento: this.solicitud.codMac.toString(),
                medicamentoSolicitado: this.solicitud.descMAC,
                fechaMac: _moment(new Date()).format("DD/MM/YYYY HH:mm"),
                codAfipaciente: this.solicitud.codAfiliado,
              });

              const requestCasosPDF: ListaCasosEvaluacion = {
                fecha: _moment(new Date()).format("DD/MM/YYYY HH:mm"),
                hora: "00:00",
                listaCasosEvaluar: listaLidTumor,
              };

              this.reporteService
                .getListaCasosEvaluacion(requestCasosPDF)
                .subscribe(
                  (response: WsResponse) => {
                    if (response.audiResponse.codigoRespuesta === "0") {
                      response.data.contentType = "application/pdf";
                      const blob = this.coreService.crearBlobFile(
                        response.data
                      );
                      //CUANDO ES FALSE ENVIA EL EMAIL
                      this.mensajes +=
                        "\n*El archivo pdf fue generado correctamente.";
                      response.data.nomArchivo = `${response.data.nomArchivo}.pdf`;
                      response.data.archivoFile = new File(
                        [blob],
                        `${response.data.nomArchivo}`,
                        {
                          type: response.data.contentType,
                          lastModified: Date.now(),
                        }
                      );
                      this.subirArchivoFTP(response.data);
                      this.spinnerService.hide();
                    } else {
                      this.mensajes = response.audiResponse.mensajeRespuesta;
                      this.openDialogMensaje(
                        MENSAJES.ERROR_NOFUNCION,
                        this.mensajes,
                        true,
                        false,
                        null
                      );
                      this.spinnerService.hide();
                    }
                  },
                  (error) => {
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
          } else if (
            data.audiResponse.codigoRespuesta === "1" ||
            data.audiResponse.codigoRespuesta === "2" ||
            data.audiResponse.codigoRespuesta === "3"
          ) {
            this.spinnerService.hide();
            this.grabarPaso = "0";
            this.btnSiguiente.emit(false);
            //this.btnFinalizar.emit(true);
            this.mensaje = data.audiResponse.mensajeRespuesta;
            this.openDialogMensaje(
              MENSAJES.ERROR_NOFUNCION,
              this.mensaje,
              true,
              false,
              null
            );
          } else {
            this.spinnerService.hide();
            this.grabarPaso = "0";
            this.btnSiguiente.emit(false);
            //this.btnFinalizar.emit(true);
            this.mensaje = data.audiResponse.mensajeRespuesta;
            this.openDialogMensaje(
              MENSAJES.ERROR_NOFUNCION,
              this.mensaje,
              true,
              false,
              null
            );
          }
        },
        (error) => {
          console.error(error);
          this.grabarPaso = "0";
          this.btnSiguiente.emit(false);
          this.mensaje = "Error al guardar el análisis y conclusión.";
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            this.mensaje,
            true,
            false,
            null
          );
          this.spinnerService.hide();
        }
      );
  }

  public visualizarInformeAutorizador(): void {
    this.archivoRqt = new ArchivoFTP();
    this.archivoRqt.codArchivo = this.solicitud.codInformePDF;
    this.archivoRqt.ruta = FILEFTP.rutaInformeAutorizador;
    this.descargarDocumento2();
  }

  public cambiarEstadoTratamiento() {
    let data = {
      cod_evaluacion_trat: this.solicitud.codSolEvaluacion,
      cod_solben_trat: this.infoSolben.nroSCGSolben,
      codigo_afiliado_trat: this.infoSolben.codAfiliado,
      apli_cana: 0,
    };

    this.detalleSolicitudEvaluacionService.estadoTratamientoApi(data).subscribe(
      (resp) => {},
      (err) => {}
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

  public guardarRequestInforme(): void {
    this.informeAutorizador = new PdfEvaluacion();
    this.informeAutorizador.codSolicitudEvaluacion =
      this.solicitud.codSolEvaluacion;
    this.informeAutorizador.codDiagnostico = this.solicitud.codDiagnostico;
    this.informeAutorizador.descripcionDiagnostico =
      this.solicitud.descDiagnostico;
    this.informeAutorizador.codAfiliado = this.solicitud.codAfiliado;
    this.informeAutorizador.nombrePaciente = this.solicitud.paciente;
    this.informeAutorizador.sexo = this.solicitud.sexoPaciente;
    this.informeAutorizador.nombreMedicoAuditor = `${this.userService.getApelPaterno} ${this.userService.getApelMaterno}, ${this.userService.getNombres}`;
    this.informeAutorizador.codArchivo = this.userService.getCodFirma;
    this.informeAutorizador.codUsuario = this.userService.getCodUsuario;
    this.informeAutorizador.codMac = this.solicitud.codMac;
    this.informeAutorizador.codGrupopDiagnostico = Number(
      this.solicitud.codGrupoDiagnostico
    );
  }

  public generarReporteAutorizador(vista: boolean): void {
    this.guardarRequestInforme();

    this.reporteService
      .generarReporteAutorizador(this.informeAutorizador)
      .subscribe(
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
              // this.subirArchivoFTP(response.data, 1);
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

  public actualizarSolicitudEvaluacion(archivo: ArchivoFTP) {
    const solEvaRequest = new SolicitudEvaluacionRequest();
    solEvaRequest.codSolicitudEvaluacion = this.solicitud.codSolEvaluacion;
    solEvaRequest.codInformeAutorizador = archivo.codArchivo;
    this.detalleSolicitudEvaluacionService
      .actualizarEvaluacionInformeAutorizador(solEvaRequest)
      .subscribe(
        (response: WsResponse) => {
          if (response.audiResponse.codigoRespuesta === "0") {
            this.mensaje += "\n*El código de archivo fue actualizado";
            this.enviarCorreoLiderTumor(this.chkLstPacPreInsRequest);
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
          const mensaje = MENSAJES.ERROR_SERVICIO;
          this.openDialogMensaje(
            mensaje,
            "Error al subir el archivo.",
            true,
            false,
            null
          );
          this.spinnerService.hide();
        }
      );
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
        title: MENSAJES.medicNuevo.analiConclusion.TITLE,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((rspta) => {});
  }

  public openDialogMensajeEmail(
    message: string,
    message2: string,
    alerta: boolean,
    confirmacion: boolean,
    valor: any
  ): void {
    const dialogRef = this.dialog.open(MessageComponent, {
      width: "400px",
      disableClose: true,
      data: {
        title: MENSAJES.medicNuevo.analiConclusion.TITLE,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.router.navigate(["./app/bandeja-evaluacion"]);
    });
  }

  public enviarCorreoLiderTumor(clpaciente: CheckListPacPrefeInstiRequest) {
    if (
      clpaciente.resultAutor === ESTADOEVALUACION.estadoObservadoAutorizador
    ) {
      // OBSERVADA POR AUTORIZADOR DE PERTENENCIA
      let request = new InformeSolEvaReporteRequest();
      request.codSolEva = this.solicitud.codSolEvaluacion;

      // OBTENER LIDER TUMOR  => POR GRUPO DE DIAGNOSTICO (SOLO DEBE SER UNO)
      let req = new ParticipanteRequest();
      req.codRol = ROLES.liderTumor; // LIDER TUMOR
      req.codGrpDiag = this.solicitud.codGrupoDiagnostico; // 037

      this.participanteService.listarUsuarioFarmaciaDetallado(req).subscribe(
        (data: WsResponse) => {
          if (data.audiResponse.codigoRespuesta === "0") {
            if (data.data.length > 0) {
              let liderTumor = data.data[0]; // EXISTE UN SOLO LIDER TUMOR POR GRP DIAGNOSTICO
              if (this.validarFormatoEmail(liderTumor.correoElectronico)) {
                // VALIDA SI EXISTE
                // VALIDACION SI LIDER TUMOR == MEDICO TRATANTE (SI LOS CMP SON IGUALES)
                if (liderTumor.cmpMedico === this.solicitud.codCmp) {
                  this.spinnerService.hide();
                  this.openDialogMensajeEmail(
                    MENSAJES.INFO_SUCCESS,
                    this.mensaje,
                    true,
                    false,
                    null
                  );
                  // this.derivarSolicitudACmac();
                } else {
                  this.detalleSolicitudEvaluacionService
                    .listarCodDocumentosChecklist(request)
                    .subscribe(
                      (dataCheck: WsResponse) => {
                        if (dataCheck.audiResponse.codigoRespuesta === "0") {
                          // LISTA TODOS LOS DOCUMENTOS ADJUNTOS
                          let rutaDoc = "";
                          dataCheck.data.forEach(
                            (element: ChecklistRequisitoResponse) => {
                              if (element.codArchivo != null) {
                                rutaDoc += element.codArchivo + ",";
                              }
                            }
                          );
                          rutaDoc = rutaDoc.substr(0, rutaDoc.length - 1);

                          const correoRequest = new EmailDTO();
                          correoRequest.codPlantilla =
                            EMAIL.EVALUACION_LIDER_TUMOR.codigoPlantilla;
                          correoRequest.fechaProgramada =
                            this.datePipe.transform(
                              new Date(),
                              "dd/MM/yyyy HH:mm:ss"
                            );
                          correoRequest.flagAdjunto =
                            EMAIL.EVALUACION_LIDER_TUMOR.flagAdjunto;
                          correoRequest.tipoEnvio =
                            EMAIL.EVALUACION_LIDER_TUMOR.tipoEnvio;
                          correoRequest.usrApp = EMAIL.usrApp;
                          this.correoService
                            .generarCorreo(correoRequest)
                            .subscribe(
                              (response: OncoWsResponse) => {
                                if (
                                  response.audiResponse.codigoRespuesta === "0"
                                ) {
                                  let result = "";
                                  let nombreUsuario =
                                    (this.userService.getNombres != null
                                      ? this.userService.getNombres + " "
                                      : "") +
                                    (this.userService.getApelPaterno != null
                                      ? this.userService.getApelPaterno + " "
                                      : "") +
                                    (this.userService.getApelMaterno != null
                                      ? this.userService.getApelMaterno
                                      : "");
                                  result += response.dataList[0].cuerpo
                                    .toString()
                                    .replace(
                                      "{{codSolEvaluacion}}",
                                      this.solicitud.numeroSolEvaluacion != null
                                        ? this.solicitud.numeroSolEvaluacion
                                        : "-----"
                                    )
                                    .replace(
                                      "{{paciente}}",
                                      this.solicitud.paciente != null
                                        ? this.solicitud.paciente
                                        : "-----"
                                    )
                                    .replace(
                                      "{{diagnostico}}",
                                      this.solicitud.descDiagnostico != null
                                        ? this.solicitud.descDiagnostico
                                        : "-----"
                                    )
                                    .replace(
                                      "{{codMedicamento}}",
                                      this.solicitud.codMac != null
                                        ? this.solicitud.codMac
                                        : "-----"
                                    )
                                    .replace(
                                      "{{descripcionMac}}",
                                      this.solicitud.descMAC != null
                                        ? this.solicitud.descMAC
                                        : "-----"
                                    )
                                    .replace(
                                      "{{medicoAutorizador}}",
                                      nombreUsuario
                                    );

                                  correoRequest.asunto =
                                    EMAIL.EVALUACION_LIDER_TUMOR.asunto +
                                    this.solicitud.paciente;
                                  correoRequest.cuerpo = result;
                                  correoRequest.codigoEnvio =
                                    response.dataList[0].codigoEnvio;
                                  correoRequest.destinatario =
                                    liderTumor.correoElectronico;
                                  correoRequest.ruta = rutaDoc;
                                  correoRequest.codigoPlantilla =
                                    correoRequest.codPlantilla;
                                  this.correoService
                                    .enviarCorreoGenerico(correoRequest)
                                    .subscribe(
                                      (response: OncoWsResponse) => {
                                        this.spinnerService.hide();
                                        this.mensaje +=
                                          "\n*" +
                                          MENSAJES.PRELIMINAR
                                            .EXITO_ENVIAR_CORREO_LT;
                                        this.openDialogMensajeEmail(
                                          MENSAJES.INFO_SUCCESS,
                                          this.mensaje,
                                          true,
                                          false,
                                          null
                                        );
                                      },
                                      (error) => {
                                        this.spinnerService.hide();
                                        console.error(error);
                                        this.mensaje +=
                                          "\n*" +
                                          MENSAJES.PRELIMINAR
                                            .ERROR_ENVIAR_CORREO;
                                        this.openDialogMensajeEmail(
                                          MENSAJES.INFO_SUCCESS,
                                          this.mensaje,
                                          true,
                                          false,
                                          null
                                        );
                                      }
                                    );
                                  //PASOS FINALES LUEGO DE ENVIAR EMAIL A LIDER TUMOR
                                  let evaluacion = new CasosEvaluar(
                                    request.codSolEva,
                                    null,
                                    null,
                                    null,
                                    null,
                                    null,
                                    null
                                  );
                                  correoRequest.listaCasosEvaluar = [
                                    evaluacion,
                                  ];
                                  this.actualizarEstCorreoLidTumSolEvalucion(
                                    correoRequest
                                  );
                                } else {
                                  this.spinnerService.hide();
                                  this.mensaje +=
                                    "\n*Ocurrio un error de envio correo al lider tumor";
                                  this.openDialogMensajeEmail(
                                    MENSAJES.INFO_SUCCESS,
                                    this.mensaje,
                                    true,
                                    false,
                                    null
                                  );
                                }
                              },
                              (error) => {
                                console.error(error);
                                this.spinnerService.hide();
                                this.mensaje +=
                                  "\n*Ocurrio un error de envio correo al lider tumor";
                                this.openDialogMensajeEmail(
                                  MENSAJES.INFO_SUCCESS,
                                  this.mensaje,
                                  true,
                                  false,
                                  null
                                );
                              }
                            );
                        } else {
                          this.spinnerService.hide();
                          this.mensaje +=
                            "\n*Error correo al lider tumor : no se obtuvo adjuntos";
                          this.openDialogMensajeEmail(
                            MENSAJES.INFO_SUCCESS,
                            this.mensaje,
                            true,
                            false,
                            null
                          );
                        }
                      },
                      (error) => {
                        this.spinnerService.hide();
                        this.mensaje +=
                          "\n*Error correo al lider tumor : no se obtuvo adjuntos";
                        this.openDialogMensajeEmail(
                          MENSAJES.INFO_SUCCESS,
                          this.mensaje,
                          true,
                          false,
                          null
                        );
                      }
                    );
                }
              } else {
                this.spinnerService.hide();
                this.mensaje +=
                  "\n*Error correo al lider tumor : email vacio o formato incorrecto";
                this.openDialogMensajeEmail(
                  MENSAJES.INFO_SUCCESS,
                  this.mensaje,
                  true,
                  false,
                  null
                );
              }
            } else {
              this.spinnerService.hide();
              this.mensaje +=
                "\n*Error correo al lider tumor : no existe lider tumor para el grupo diagnostico";
              this.openDialogMensajeEmail(
                MENSAJES.INFO_SUCCESS,
                this.mensaje,
                true,
                false,
                null
              );
            }
          } else {
            this.spinnerService.hide();
            this.mensaje +=
              "\n*Error correo al lider tumor : no se pudo obtener la cuenta";
            this.openDialogMensajeEmail(
              MENSAJES.INFO_SUCCESS,
              this.mensaje,
              true,
              false,
              null
            );
          }
        },
        (error) => {
          this.spinnerService.hide();
          this.mensaje +=
            "\n*Error correo al lider tumor : no se pudo obtener la cuenta";
          this.openDialogMensajeEmail(
            MENSAJES.INFO_SUCCESS,
            this.mensaje,
            true,
            false,
            null
          );
        }
      );
    } else {
      this.spinnerService.hide();
      this.openDialogMensajeEmail(
        MENSAJES.INFO_SUCCESS,
        this.mensaje,
        true,
        false,
        null
      );
    }
  }

  public actualizarEstCorreoLidTumSolEvalucion(email: EmailDTO) {
    this.correoService.actualizarEstCorreoLidTumSolEvalucion(email).subscribe(
      (response: WsResponse) => {},
      (error) => {
        console.error(error);
      }
    );
  }

  public derivarSolicitudACmac() {
    const req = new EmailRequest();
    req.codSolicitudEvaluacion = this.solicitud.codSolEvaluacion;
    req.estadoSolicitudEvaluacion = Number(PARAMETRO.observadorPorLiderTumor);

    //alert('IMPLEMENTAR DERIVAR SOLICITUD A CMAC => SE DEBE ACTUALIZAR EL ESTADO DE LA SOLICITUD A CMAC (ESTADO => OBSERVADO POR LIDER TUMOR (COD: 25))');
    this.bandejaEvaluacionService.actualizarEstadoSolEvaluacion(req).subscribe(
      (res: WsResponse) => {
        if (res.audiResponse.codigoRespuesta == "0") {
          this.mensaje += "\n*Se derivo la solicitud al CMAC";
          this.openDialogMensajeEmail(
            MENSAJES.INFO_SUCCESS,
            this.mensaje,
            true,
            false,
            null
          );
        } else {
          this.mensaje += "\n*Error al derivar la solicitud al CMAC";
          this.openDialogMensajeEmail(
            MENSAJES.INFO_SUCCESS,
            this.mensaje,
            true,
            false,
            null
          );
        }
      },
      (error) => {
        console.error(error);
        this.mensaje += "\n*Error al derivar la solicitud al CMAC";
        this.openDialogMensajeEmail(
          MENSAJES.INFO_SUCCESS,
          this.mensaje,
          true,
          false,
          null
        );
      }
    );
  }

  public subirArchivoFTP(archivo: ArchivoFTP) {
    const archivoRequest = new ArchivoRequest();

    archivoRequest.archivo = archivo.archivoFile;
    archivoRequest.nomArchivo = archivo.nomArchivo;
    archivoRequest.ruta = FILEFTP.rutaInformeAutorizador;

    this.spinnerService.show();

    this.coreService.subirArchivo(archivoRequest).subscribe(
      (response: WsResponse) => {
        if (response.audiResponse.codigoRespuesta === "0") {
          this.mensajes +=
            "\n*El Reporte de Casos a Evaluar fue subido correctamente";
          this.enviarEmailReunionLidTumor(this.bandejaEvaluacionService);
        } else {
          //this.bloquearBtn(false);
          this.mensajes = response.audiResponse.mensajeRespuesta;
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
        //this.bloquearBtn(false);
        this.spinnerService.hide();
        console.error(error);
        this.openDialogMensaje(
          MENSAJES.ERROR_SERVICIO,
          "Error al subir el archivo FTP.",
          true,
          false,
          null
        );
      }
    );
  }

  public enviarEmailReunionLidTumor(lista: BandejaEvaluacionService) {
    let listaSolicitudLdTum: CasosEvaluar[] = [];
    const req = new ParticipanteRequest();
    req.codRol = ROLES.liderTumor; // LIDER TUMOR ROL
    req.codParticipante = this.determinacion.value.escogerParFrm; //LIDER TUMOR PARTICIPANTE

    const nombreUsuario =
      (this.userService.getNombres != null
        ? this.userService.getNombres + " "
        : "") +
      (this.userService.getApelPaterno != null
        ? this.userService.getApelPaterno + " "
        : "") +
      (this.userService.getApelMaterno != null
        ? this.userService.getApelMaterno
        : "");

    this.participanteService.listarUsuarioFarmacia(req).subscribe(
      (response: WsResponse) => {
        if (response.audiResponse.codigoRespuesta === "0") {
          // CONSULTO SERVICE QUE TRAE LA DATA
          const correoRequest = new EmailDTO();
          correoRequest.codPlantilla =
            EMAIL.EVALUACION_LIDER_TUMOR.codigoPlantilla;
          correoRequest.fechaProgramada = _moment(new Date()).format(
            "DD/MM/YYYY HH:mm"
          );
          correoRequest.flagAdjunto = EMAIL.EVALUACION_LIDER_TUMOR.flagAdjunto;
          correoRequest.tipoEnvio = EMAIL.EVALUACION_LIDER_TUMOR.tipoEnvio;
          correoRequest.usrApp = EMAIL.usrApp;

          this.correoService.generarCorreo(correoRequest).subscribe(
            // DEBERIA A LA VEZ REGISTRAR LA TABLA DE ENVIOS DE CORREOS Y ACTUALIZAR LA TABLA CON ESTADO DE ENVIADO
            (respCorreo: OncoWsResponse) => {
              if (respCorreo.audiResponse.codigoRespuesta === "0") {
                let result = "";
                let asuntoNew = "";
                const lista: any = respCorreo.dataList;

                this.html =
                  "<table border='0' cellpadding='0' cellspacing='0' class='grilla'>";
                this.html +=
                  "<tr><th>N° Solicitud de Evaluación</th><th>Paciente</th><th>Diagnóstico</th><th>Código Medicamento</th><th>Medicamento Solicitado</th></tr>";
                listaSolicitudLdTum.push({
                  numSolicitudEvaluacion: this.solicitud.numeroSolEvaluacion,
                  paciente: this.solicitud.paciente,
                  diagnostico: this.solicitud.descDiagnostico,
                  codigoMedicamento: this.solicitud.codMac.toString(),
                  medicamentoSolicitado: this.solicitud.descMAC,
                  fechaMac: "",
                  codAfipaciente: this.solicitud.codAfiliado,
                });

                this.html +=
                  "<tr><td>" +
                  this.solicitud.numeroSolEvaluacion +
                  "</td><td>" +
                  this.solicitud.paciente +
                  "</td><td>" +
                  this.solicitud.descDiagnostico +
                  "</td><td>" +
                  this.solicitud.codMac.toString() +
                  "</td><td>" +
                  this.solicitud.descMAC +
                  "</td></tr>";

                this.html += "</table>";

                result += lista[0].cuerpo
                  .toString()
                  .replace("{{grilla}}", this.html)
                  .replace("{{medicoAutorizador}}", nombreUsuario);

                asuntoNew += lista[0].asunto
                  .toString()
                  .replace("{{nomPaciente}}", this.solicitud.paciente)
                  .replace("{{nomMedicamento}}", this.solicitud.descMAC);

                correoRequest.asunto = asuntoNew;
                correoRequest.cuerpo = result;
                correoRequest.ruta = "";
                correoRequest.codigoPlantilla = correoRequest.codPlantilla + "";
                correoRequest.codigoEnvio = lista[0].codigoEnvio;
                correoRequest.listaCasosEvaluar = listaSolicitudLdTum;

                const listaUsuarios = response.data;
                let destinatarioTodos = "";
                listaUsuarios.forEach((usu) => {
                  destinatarioTodos += usu.correoElectronico;
                });

                listaUsuarios.forEach((usu) => {
                  if (usu.correoElectronico != null) {
                    correoRequest.destinatario = usu.correoElectronico;
                    const estadoCorreoLidTumorRequest =
                      new SolicitudEvaluacionRequest();
                    this.correoService
                      .finalizarEnvioCorreoReunionMac(correoRequest)
                      .subscribe(
                        (response: OncoWsResponse) => {
                          if (response.audiResponse.codigoRespuesta === "0") {
                            estadoCorreoLidTumorRequest.estadoCorreoEnvLiderTumor = 28;
                            estadoCorreoLidTumorRequest.codSolicitudEvaluacion =
                              this.solicitud.codSolEvaluacion;

                            this.correoService
                              .actParamsCorreoLiderTumor(
                                estadoCorreoLidTumorRequest
                              )
                              .subscribe((data) => null);
                          }
                          //this.verConfirmacion("su correo está en proceso de envio", "Envio de correo");
                        },
                        (error) => {
                          console.error(error);
                          estadoCorreoLidTumorRequest.estadoCorreoEnvLiderTumor = 29;
                          estadoCorreoLidTumorRequest.codSolicitudEvaluacion =
                            this.solicitud.codSolEvaluacion;
                          this.correoService
                            .actParamsCorreoLiderTumor(
                              estadoCorreoLidTumorRequest
                            )
                            .subscribe((data) => null);
                        }
                      );
                  } else {
                  }
                });
                this.mensajes += "\n*Se envio los email al Lider Tumor";
                this.openDialogMensaje(
                  "Registro generado",
                  this.mensajes,
                  true,
                  false,
                  null
                );
                this.spinnerService.hide();
              } else {
                console.error("Error al generar email" + respCorreo);
                this.mensajes +=
                  "\n*Email miembros Lider Tumor: Error al generar correo";
                this.openDialogMensaje(
                  "Registro generado",
                  this.mensajes,
                  true,
                  false,
                  null
                );
                this.spinnerService.hide();
              }
            },
            (error) => {
              this.mensajes +=
                "\n*Email miembros Lider Tumor: Error al generar correo";
              this.openDialogMensaje(
                "Registro generado",
                this.mensajes,
                true,
                false,
                null
              );
              this.spinnerService.hide();
            }
          );
        } else {
          this.mensajes += "\n*Email miembros MAC: Error al listar miembros";
          this.openDialogMensaje(
            "Registro generado",
            this.mensajes,
            true,
            false,
            null
          );
          this.spinnerService.hide();
        }
      },
      (error) => {
        console.error(error);
        this.mensajes += "\n*Email miembros MAC: Error al listar miembros";
        this.openDialogMensaje(
          "Registro generado",
          this.mensajes,
          true,
          false,
          null
        );
        this.spinnerService.hide();
      }
    );
  }

  public validarFormatoEmail(email: string): boolean {
    var regex = /^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i;
    if (email) {
      if (regex.test(email)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
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

  public accesoOpcionMenu() {
    const data = require("src/assets/data/permisosRecursos.json");
    const bandejaEvaluacion = data.bandejaEvaluacion.paso5;
    const bandejaEvaluacion2 = data.bandejaEvaluacion.detalle;
    this.opcionMenu = JSON.parse(localStorage.getItem("opcionMenu"));

    if (this.opcionMenu.opcion.length > 0) {
      this.opcionMenu.opcion.forEach((element) => {
        const codOpcion = element.codOpcion;
        switch (codOpcion) {
          case bandejaEvaluacion.chkPerfil:
            this.chkPerfil = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.chkPreferencia:
            this.chkPreferencia = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtTratamiento:
            this.txtTratamiento = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtTipoTratamiento:
            this.txtTipoTratamiento = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtObservaciones:
            this.txtObservaciones = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.chkPertinencia:
            this.chkPertinencia = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.cmbCondicion:
            this.cmbCondicion = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.cmbTiempo:
            this.cmbTiempo = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtResultado:
            this.txtResultado = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnVista:
            this.btnVista = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.cmbResultado:
            this.cmbResultado = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtComentarioRol:
            this.txtComentarioRol = Number(element.flagAsignacion);
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

  public generarReportePaso5(vista: boolean): void {
    //this.guardarRequestInforme();
    var data = {
      codSolicitudEvaluacion: this.solicitud.codSolEvaluacion,
    };

    this.detalleSolicitudEvaluacionService.generarReportePaso5(data).subscribe(
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
