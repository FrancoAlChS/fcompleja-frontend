import { CurrencyIndex } from "@angular/common/src/i18n/locale_data";
import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  Inject,
  EventEmitter,
  NgZone,
  Output,
} from "@angular/core";
import { FormGroup, FormControl, FormArray, Validators } from "@angular/forms";
import {
  MatPaginatorIntl,
  MatTableDataSource,
  MatPaginator,
  MatSort,
  MatDialog,
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
} from "@angular/material";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MatDatepicker } from "@angular/material/datepicker";
import { flattenStyles } from "@angular/platform-browser/src/dom/dom_renderer";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import {
  ESTADOMONITOREOMED,
  ESTADOEVALUACION,
  TIPOSCGSOLBEN,
  MENSAJES,
  MY_FORMATS_AUNA,
  MY_FORMATS_MONTH,
  EMAIL,
  PARAMETRO,
  FILEFTP,
  ROLES,
  TIPO_SOL_EVA,
  ACCESO_EVALUACION,
  FLAG_REGLAS_EVALUACION,
  ESTADO_LINEA_TRAT,
} from "src/app/common";
import { MessageComponent } from "src/app/core/message/message.component";
import { ArchivoRequest } from "src/app/dto/request/ArchivoRequest";
import { HistPacienteResponse } from "src/app/dto/response/HistPacienteResponse";
import { EvaluacionService } from "src/app/dto/service/evaluacion.service";
import { UsuarioService } from "src/app/dto/service/usuario.service";
import { WsResponse } from "src/app/dto/WsResponse";
import { EvaluacionCmacService } from "src/app/service/BandejaEvaluacion/evaluacion.cmac.service";
import { CoreService } from "src/app/service/core.service";
import { ListaParametroservice } from "src/app/service/lista.parametro.service";
import { CdkTextareaAutosize } from "@angular/cdk/text-field";
import { take } from "rxjs/operators";
import { DatePipe } from "@angular/common";
import { InfoSolben } from "src/app/dto/bandeja-preliminar/detalle-preliminar/InfoSolben";
import { InformeSolEvaReporteRequest } from "src/app/dto/solicitudEvaluacion/detalle/InformacionScgEvaRequest";
import { DetalleSolicitudEvaluacionService } from "src/app/service/detalle.solicitud.evaluacion.service";
import { ReporteEvaluacionService } from "src/app/service/Reportes/Evaluacion/reporte-evaluacion.service";
import { BOpcionMenuLocalStorage } from "src/app/dto/core/BOpcionMenuLocalStorage";
import { ApiOutResponse } from "src/app/dto/response/ApiOutResponse";
import { CasosEvaluar } from "src/app/dto/solicitudEvaluacion/bandeja/CasosEvaluar";
import { ListaCasosEvaluacion } from "src/app/dto/solicitudEvaluacion/bandeja/ListaCasosEvaluacion";
import * as _moment from "moment";
import { ArchivoFTP } from "src/app/dto/bandeja-preliminar/detalle-preliminar/ArchivoFTP";
import { ParticipanteRequest } from "src/app/dto/request/BandejaEvaluacion/ParticipanteRequest";
import { ListaFiltroUsuarioRolservice } from "src/app/service/Lista.usuario.rol.service";
import { EmailDTO } from "src/app/dto/core/EmailDTO";
import { OncoWsResponse } from "src/app/dto/response/OncoWsResponse";
import { CorreosService } from "src/app/service/cross/correos.service";
import { SolicitudEvaluacionRequest } from "src/app/dto/request/SolicitudEvaluacionRequest";
import { CheckListRequisitoRequest } from "src/app/dto/request/CheckListRequisitoRequest";
import { BandejaEvaluacionService } from "src/app/service/bandeja.evaluacion.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-observaciones",
  templateUrl: "./observaciones.component.html",
  styleUrls: ["./observaciones.component.scss"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: MY_FORMATS_AUNA,
    },
  ],
})
export class ObservacionesComponent implements OnInit {
  @ViewChild("archivoCargado") archivoCargado: ElementRef;
  @ViewChild("autosize") autosize: CdkTextareaAutosize;
  @Output() btnFinalizar = new EventEmitter<boolean>();
  listaCompleta: import("src/app/dto/Parametro").Parametro[];
  archivoRqt: ArchivoFTP;
  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.

    this._ngZone.onStable
      .pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }
  mostrarDocumentos: boolean;
  isLoading: boolean;
  desDocuNuevo_: FormControl;
  chkListRequisito: CheckListRequisitoRequest;
  activarOpenFile: boolean;
  docRequeridos: HistPacienteResponse[] = [];
  archivoSust: ArchivoFTP;
  codArchivoDown: any;
  mensajeDownload: string;
  primeraVez: boolean = true;

  documentoCargado: boolean;

  aplicaCanalDisabled: boolean;
  instCanalDisabled: boolean;
  instEspcCmtDisabled: boolean;
  lidTmrDisabled: boolean;
  lastApliCana: number;
  evaApliCana: any;
  evaCodcana: any;
  evaOpcLid: any;
  pasoFinal: boolean;
  fechaReuComite_: string;
  NopermitirGrabar: boolean;
  fechaArchivo_: string;
  tituloPrincipal: string;
  paso5Comite: String;
  fileupload: File;
  docOtros: HistPacienteResponse[] = [];
  listaParticipantes = [];
  desDocuNuevo: any;
  mensajes: string;
  mensajesLidTum: string;
  resultadoComite: [];
  resultadoCodArchivos: [];
  estadoCorreoLidTumor: SolicitudEvaluacionRequest;
  resultAutorizador: any[] = [
    {
      codigo: 20,
      titulo: "APROBADO",
      selected: false,
    },
    {
      codigo: 21,
      titulo: "RECHAZADO",
      selected: false,
    },
    {
      codigo: 22,
      titulo: "OBSERVADO",
      selected: false,
    },
  ];

  aplicaCanalizacion: any[] = [
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

  instanciaCanalizar: any[] = [
    {
      codigo: 506,
      titulo: "COMITÉ",
      selected: false,
    },
    {
      codigo: 35,
      titulo: "LÍDER TUMOR",
      selected: false,
    },
  ];

  bloqInscripcion: boolean;

  resultCmtFrmArray = new FormArray([], [Validators.required]);

  //   resultCmtFrmArray = new FormArray([
  //     new FormGroup({
  //       lidTmrFrmCtrl: new FormControl("",Validators.required),
  //       espCmtFrmCtrl: new FormControl("",Validators.required),
  //   })
  // ]);

  selectComite: boolean[] = [false];
  selectParticipante: boolean[] = [false];

  array = [];
  listaComites = [];
  html: any;

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
  step: number;
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

  FormMessages = {
    participantes: [],
  };

  constructor(
    public dialog: MatDialog,
    @Inject(EvaluacionCmacService) private solicitud: EvaluacionCmacService,
    @Inject(UsuarioService) private userService: UsuarioService,
    private spinnerService: Ng4LoadingSpinnerService,
    @Inject(EvaluacionService) private solicitud_: EvaluacionService,
    private listaParametroservice: ListaParametroservice,
    private detalleServicioSolEva: DetalleSolicitudEvaluacionService,
    private detalleSolicitudEvaluacionService: DetalleSolicitudEvaluacionService,
    private participanteService: ListaFiltroUsuarioRolservice,
    private correoService: CorreosService,
    private router: Router,
    private _ngZone: NgZone,
    private coreService: CoreService,
    private bandejaEvaluacionService: BandejaEvaluacionService,
    private datePipe: DatePipe,
    private reporteService: ReporteEvaluacionService
  ) {}

  ngOnInit() {
    this.accesoOpcionMenu();
    this.inicializarVariables();
    //this.resultCmtArray();
    this.listaParametroservice
      .listaComiteFiltro({ codigoEstado: 507 })
      .subscribe((response) => {
        this.listaComites = response.data;
        this.listaCompleta = response.data;

        this.detalleSolicitudEvaluacionService
          .obtenerParticipantesPorComite({ codRol: 8 })
          .subscribe(
            (resp) => {
              this.listaParticipantes = resp["data"];
            },
            (err) => {}
          );
      });

    this.NopermitirGrabar = false;
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
    this.archivoRqt.codArchivo = this.solicitud_.codCmacPDF;
    this.archivoRqt.ruta = FILEFTP.rutaInformeAutorizador;
    this.descargarDocumento2();
  }

  public inicializarVariables(): void {
    this.step1 = 0;
    this.step2 = 0;
    this.codSolEvaluacion = this.solicitud_.numeroSolEvaluacion;
    this.request.codSolEva = this.solicitud_.codSolEvaluacion;
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
    this.request.codSolEva = this.solicitud_.codSolEvaluacion;
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
      codSolEva: this.solicitud_.codSolEvaluacion,
      codCheckListRequisito: null,
      codContinuadorDoc: null,
      codMac: this.solicitud_.codMac,
      tipoDocumento: 517,
      descripcionDocumento: documento2.descripcionDocumento
        ? documento2.descripcionDocumento
        : null,
      estadoDocumento: 88,
      urlDescarga: null,
      edad: this.solicitud_.edad,
      tipoEvaluacion: 1,
      codigoRolUsuario: this.userService.getCodRol,
      codigoUsuario: this.userService.getCodUsuario,
      codArchivo: null,
    };

    this.desDocuNuevo_.setValue("");
    this.activarOpenFile = true;
    this.subirArchivoFTPPaso2(documento2, 2);
  }

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
        this.solicitud_.codSolEvaluacion +
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
            this.pintarResultadoComite();
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
      codSolEva: this.solicitud_.codSolEvaluacion,
      codCheckListRequisito: documento.codChekListReq,
      codContinuadorDoc: null,
      codMac: this.solicitud_.codMac,
      tipoDocumento: 517,
      descripcionDocumento: documento.descripcionDocumento,
      estadoDocumento: 89,
      urlDescarga: null,
      edad: this.solicitud_.edad,
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
            this.pintarResultadoComite();
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

  cambiarComite(event) {
    let selectedComite = this.listaComites.find(
      (el) => el.codigoComite == event.value
    );

    this.paso5Comite = selectedComite.descripcionComite;
  }

  iniciarObservaciones() {
    if(this.primeraVez){
      this.consultarInformacionScgEva();
      this.primeraVez=false;
    }
    this.btnFinalizar.emit(false);
    this.pasoFinal = false;
    this.pintarResultadoComite();
  }

  cargarDocumentosSustentos() {
    this.resultCmtFrmArray.value.forEach((element) => {
      if (element["cgrDocSusteFrmCtrl"] == null) {
        this.documentoCargado = true;
      } else {
        this.documentoCargado = false;
      }
    });
  }

  preGuardarObservaciones() {
    this.mensaje = "LA EVALUACIÓN DE LA SOLICITUD SERÁ FINALIZADA";
    this.openDialogMensajeGuardarObservaciones(
      "ALERTA",
      this.mensaje,
      false,
      true,
      null,
      (result) => {
        if (result == 1) {
          this.grabarPaso6(0);
        } else {
        }
      }
    );
  }

  public openDialogMensajeGuardarObservaciones(
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
        title: MENSAJES.medicNuevo.levantamientoObservaciones.TITLE,
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

  public addElement() {
    // crea un nuevo div
    // y añade contenido
    var newDiv = document.createElement("div");
    var newContent = document.createTextNode("campo requerido");
    newDiv.appendChild(newContent); //añade texto al div creado.

    // añade el elemento creado y su contenido al DOM
    var currentDiv = document.getElementById("mesasge_requerido");
    if (currentDiv) {
      currentDiv.appendChild(newContent);
    }
  }

  public cambiarEstado(e) {
    if (e.value != null || e.value != "" || e.value != undefined) {
      var especComiteId = document.getElementById("especificar_comite");
      especComiteId.classList.remove("labelEspeComite");
      var currentDiv = document.getElementById("mesasge_requerido");
      currentDiv.remove();
    }
  }

  public cambiarEstadoPartipante(e) {
    if (e.value != null || e.value != "" || e.value != undefined) {
      var participanteId = document.getElementById("participantes");
      participanteId.classList.remove("labelEspeComite");
      var currentDiv = document.getElementById("mesasge_requerido");
      currentDiv.remove();
    }
  }

  public logicaGrabarPaso6(tipo) {
    if (this.NopermitirGrabar === false) {
      if (tipo === 2) {
        this.mensaje = "LA EVALUACIÓN DE LA SOLICITUD SERÁ FINALIZADA";
        this.openDialogMensajeGuardarObservaciones(
          "ALERTA",
          this.mensaje,

          false,
          true,
          null,
          (result) => {
            if (result == 1) {
              this.validarRestricion();
            } else {
            }
          }
        );
      } else if (tipo === 1) {
        this.validarRestricion();
      }
    } else if (this.NopermitirGrabar === true) {
      this.mensaje = "LA SOLICITUD YA SE ENCUENTRA CON DATOS REGISTRADOS";
      this.openDialogMensajeGuardarObservaciones(
        this.mensaje,
        null,
        true,
        false,
        null
      );
      return;
    } else {
      this.mensaje = "OCURRIÓ UN ERROR";
      this.openDialogMensajeGuardarObservaciones(
        this.mensaje,
        null,
        true,
        false,
        null
      );
      return;
    }
  }

  public grabarPaso6(tipo: number) {
    this.resultCmtFrmArray.controls.forEach((e) => {
      if (e.value.apliCanaFrmCtrl == 1) {
        if (
          e.value.instanciaCanaFrmCtrl == null ||
          e.value.instanciaCanaFrmCtrl == "" ||
          e.value.instanciaCanaFrmCtrl == undefined
        ) {
          return;
        }
        var resultParticipantes = this.resultCmtFrmArray.value.map((e) => {
          return e["instanciaCanaFrmCtrl"];
        });
        resultParticipantes.forEach((element) => {
          if (element == 506) {
            var especifComite = this.resultCmtFrmArray.value.map((el) => {
              return el["espCmtFrmCtrl"];
            });
            especifComite.forEach((element2) => {
              if (element2 == null || element2 == "" || element2 == undefined) {
                var especComiteId =
                  document.getElementById("especificar_comite");
                if (
                  document.getElementsByClassName("labelEspeComite").length == 0
                ) {
                  especComiteId.classList.add("labelEspeComite");
                  this.addElement();
                  return;
                }
                return;
              } else {
                this.logicaGrabarPaso6(tipo);
              }
            });
          } else if (element == 35) {
            var liderTumor = this.resultCmtFrmArray.value.map((res) => {
              return res["lidTmrFrmCtrl"];
            });
            liderTumor.forEach((element3) => {
              if (element3 == null || element3 == "" || element3 == undefined) {
                var participanteId = document.getElementById("participantes");
                if (
                  document.getElementsByClassName("labelEspeComite").length == 0
                ) {
                  participanteId.classList.add("labelEspeComite");
                  this.addElement();
                  return;
                }
                return;
              } else {
                this.logicaGrabarPaso6(tipo);
              }
            });
          }
        });
      } else if (e.value.apliCanaFrmCtrl == 0) {
        this.logicaGrabarPaso6(tipo);
      }
    });
  }

  public estadoTratamientoApi() {
    let data = {
      cod_evaluacion_trat: this.solicitud_.codSolEvaluacion,
      cod_solben_trat: this.infoSolben.nroSCGSolben,
      codigo_afiliado_trat: this.infoSolben.codAfiliado,
      apli_cana: 0,
    };

    this.detalleSolicitudEvaluacionService.estadoTratamientoApi(data).subscribe(
      (resp) => {},
      (err) => {}
    );
  }

  public validarParticipantes() {
    this.resultCmtFrmArray.controls.map((e) => {
      return e["controls"].lidTmrFrmCtrl.setValidators([Validators.required]);
    });
    this.FormMessages.participantes = [
      { type: "pattern", message: "campo obligatorio" },
    ];
  }

  public validarRestricion() {
    var resultadoArray = [];

    let documentoValue = this.resultCmtFrmArray.controls.map((e) => {
      return e["controls"].cgrDocSusteFrmCtrl.value;
    });

    var instanciaCanalizarValue = this.resultCmtFrmArray.controls.map((e) => {
      return e["controls"].instanciaCanaFrmCtrl.value;
    });

    for (let index = 0; index < documentoValue.length - 1; index++) {
      if (documentoValue[index] == null) {
        this.mensajes = "Validación de  carga de archivo";
        this.openDialogMensaje(
          "Cargar Archivo Sustento",
          "Es obligatoria subir un archivo de sustento.",
          true,
          false,
          null
        );
        return false;
      }
    }
    this.resultCmtFrmArray.controls.map((e) => {
      const fechaFormato = this.datePipe.transform(
        e["controls"].fechaResObservFrmCtrl.value,
        "dd/MM/yyyy"
      );
      resultadoArray.push({
        fechaArchivo: fechaFormato,
        codArchivo: e["controls"].cgrDocSusteFrmCtrl.value,
        codResultadoAutorizador: e["controls"].resultAutoriFrmCtrl.value,
        motivo: e["controls"].mtvRechazFrmCtrl.value,
        aplicaCanalizacion: e["controls"].apliCanaFrmCtrl.value,
        codInsCanalizacion: e["controls"].instanciaCanaFrmCtrl
          ? e["controls"].instanciaCanaFrmCtrl.value
          : null,
        codComite: e["controls"].espCmtFrmCtrl.value,
        comentario: e["controls"].comentariosFrmCtrl.value,
        codSolEva: this.solicitud_.codSolEvaluacion,
        codLiderTumor: e["controls"].lidTmrFrmCtrl
          ? e["controls"].lidTmrFrmCtrl.value
          : null,
        codUsuario: this.userService.getCodUsuario,
        codigoRolUsuario: this.userService.getCodRol,
        // instEspcCmtDisabled:true
      });
      this.evaApliCana = e["controls"].apliCanaFrmCtrl.value;
      this.evaCodcana = e["controls"].instanciaCanaFrmCtrl
        ? e["controls"].instanciaCanaFrmCtrl.value
        : null;
      this.evaOpcLid = e["controls"].lidTmrFrmCtrl
        ? e["controls"].lidTmrFrmCtrl.value
        : null;
    });
    this.solicitud
      .registrarLevantaObser(resultadoArray[resultadoArray.length - 1])
      .subscribe(
        (resp: ApiOutResponse) => {
          if (resp.codResultado === 0) {
            //   this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
            //     this.router.navigate(['Your actualComponent']);
            // });
            this.aplicaCanalDisabled = true;
            this.instCanalDisabled = true;
            // this.instEspcCmtDisabled = true;
            this.NopermitirGrabar = true;
            if (this.evaApliCana == 0) {
              this.mensaje = "La solicitud ha sido completada con exito.";
              this.openDialogMensaje(this.mensaje, null, true, false, null);
              this.estadoTratamientoApi();
              this.aplicaCanalDisabled = true;
              var participanteId = document.getElementById("participantes");
              if (document.getElementsByClassName("labelEspeComite")) {
                if (participanteId.classList) {
                  participanteId.classList.remove("labelEspeComite");
                }
                var currentDiv = document.getElementById("mesasge_requerido");
                currentDiv.remove();
                return;
              }
              return;
            }
            if (this.evaCodcana == 35 && this.evaOpcLid !== null) {
              this.mensajesLidTum +=
                "*La solicitud ha sido completada con exito.";
              let listaLidTumor: CasosEvaluar[];
              listaLidTumor = [];
              listaLidTumor.push({
                numSolicitudEvaluacion: this.solicitud_.numeroSolEvaluacion,
                paciente: this.solicitud_.paciente,
                diagnostico: this.solicitud_.descDiagnostico,
                codigoMedicamento: this.solicitud_.codMac.toString(),
                medicamentoSolicitado: this.solicitud_.descMAC,
                fechaMac: _moment(new Date()).format("DD/MM/YYYY HH:mm"),
                codAfipaciente: this.solicitud_.codAfiliado,
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
                      this.aplicaCanalDisabled = true;
                      this.instCanalDisabled = true;
                      response.data.contentType = "application/pdf";
                      const blob = this.coreService.crearBlobFile(
                        response.data
                      );
                      //CUANDO ES FALSE ENVIA EL EMAIL
                      this.mensajesLidTum +=
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
                      this.subirArchivoFTPLidTumor(response.data);
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
            } else if (
              resp.codResultado === "1" ||
              resp.codResultado === "2" ||
              resp.codResultado === "3"
            ) {
              this.spinnerService.hide();
              this.mensaje = resp.msgResultado;
              this.openDialogMensaje(
                MENSAJES.ERROR_NOFUNCION,
                this.mensaje,
                true,
                false,
                null
              );
            } else {
              this.spinnerService.hide();
              this.mensaje = resp.msgResultado;
              this.openDialogMensaje(this.mensaje, null, true, false, null);
            }
          }
        },
        (err) => {
          console.error(err);
          this.mensaje = "Error al guardar la determinacion.";
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

  public subirArchivoFTPLidTumor(archivo: ArchivoFTP) {
    const archivoRequest = new ArchivoRequest();

    archivoRequest.archivo = archivo.archivoFile;
    archivoRequest.nomArchivo = archivo.nomArchivo;
    archivoRequest.ruta = FILEFTP.rutaInformeAutorizador;

    this.spinnerService.show();

    this.coreService.subirArchivo(archivoRequest).subscribe(
      (response: WsResponse) => {
        if (response.audiResponse.codigoRespuesta === "0") {
          this.mensajesLidTum +=
            "\n*El Reporte de Casos a Evaluar fue subido correctamente";
          this.enviarEmailReunionLidTumor();
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

  public enviarEmailReunionLidTumor() {
    let listaSolicitudLdTum: CasosEvaluar[] = [];
    const req = new ParticipanteRequest();
    req.codRol = ROLES.liderTumor; // LIDER TUMOR ROL
    req.codParticipante = this.evaOpcLid; //LIDER TUMOR PARTICIPANTE

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
                  numSolicitudEvaluacion: this.solicitud_.numeroSolEvaluacion,
                  paciente: this.solicitud_.paciente,
                  diagnostico: this.solicitud_.descDiagnostico,
                  codigoMedicamento: this.solicitud_.codMac.toString(),
                  medicamentoSolicitado: this.solicitud_.descMAC,
                  fechaMac: _moment(new Date()).format("DD/MM/YYYY HH:mm"),
                  codAfipaciente: this.solicitud_.codAfiliado,
                });
                this.html +=
                  "<tr><td>" +
                  this.solicitud_.numeroSolEvaluacion +
                  "</td><td>" +
                  this.solicitud_.paciente +
                  "</td><td>" +
                  this.solicitud_.descDiagnostico +
                  "</td><td>" +
                  this.solicitud_.codMac.toString() +
                  "</td><td>" +
                  this.solicitud_.descMAC +
                  "</td></tr>";

                this.html += "</table>";

                result += lista[0].cuerpo
                  .toString()
                  .replace("{{grilla}}", this.html)
                  .replace("{{medicoAutorizador}}", nombreUsuario);

                asuntoNew += lista[0].asunto
                  .toString()
                  .replace("{{nomPaciente}}", this.solicitud_.paciente)
                  .replace("{{nomMedicamento}}", this.solicitud_.descMAC);

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
                              this.solicitud_.codSolEvaluacion;

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
                            this.solicitud_.codSolEvaluacion;
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
                this.mensajesLidTum += "\n*Se envio los email al Lider Tumor";
                this.openDialogMensaje(
                  "Registro generado",
                  this.mensajesLidTum,
                  true,
                  false,
                  null
                );
                this.spinnerService.hide();
              } else {
                console.error("Error al generar email" + respCorreo);
                this.mensajesLidTum +=
                  "\n*Email miembros Lider Tumor: Error al generar correo";
                this.openDialogMensaje(
                  "Registro generado",
                  this.mensajesLidTum,
                  true,
                  false,
                  null
                );
                this.spinnerService.hide();
              }
            },
            (error) => {
              this.mensajesLidTum +=
                "\n*Email miembros Lider Tumor: Error al generar correo";
              this.openDialogMensaje(
                "Registro generado",
                this.mensajesLidTum,
                true,
                false,
                null
              );
              this.spinnerService.hide();
            }
          );
        } else {
          this.mensajesLidTum +=
            "\n*Email miembros MAC: Error al listar miembros";
          this.openDialogMensaje(
            "Registro generado",
            this.mensajesLidTum,
            true,
            false,
            null
          );
          this.spinnerService.hide();
        }
      },
      (error) => {
        console.error(error);
        this.mensajesLidTum +=
          "\n*Email miembros MAC: Error al listar miembros";
        this.openDialogMensaje(
          "Registro generado",
          this.mensajesLidTum,
          true,
          false,
          null
        );
        this.spinnerService.hide();
      }
    );
  }

  pintarResultadoComite() {
    this.mostrarDocumentos = false;
    this.isLoading = true;

    const json = {
      codSolEva: this.solicitud_.codSolEvaluacion,
    };

    this.solicitud.consultarLevantaObser(json).subscribe(
      (resp) => {
        this.resultadoComite = resp["dataListjSON"]["resultadoComite"];

        if (this.resultCmtFrmArray.length == 0) {
          this.agregarResultadosComite();
        }
      },
      (err) => {}
    );
  }

  agregarResultadosComite() {
    for (let index = 0; index < this.resultadoComite.length; index++) {
      if (
        this.resultadoComite[index]["aplicaCanalizacion"] === 0 ||
        this.resultadoComite[index]["aplicaCanalizacion"] === 1
      ) {
        this.NopermitirGrabar = true;
      } else {
        this.NopermitirGrabar = false;
      }
      this.fechaReuComite_ = this.resultadoComite[index]["fechaReuComite"];
      var fechaSplit =
        this.fechaReuComite_ != null
          ? this.fechaReuComite_.split("/")
          : new Date();
      var dia = Number(fechaSplit[0]);
      var mes = Number(fechaSplit[1]);
      var anio = Number(fechaSplit[2]);
      var fechaComiteReu =
        this.fechaReuComite_ != null
          ? new Date(anio, mes - 1, dia)
          : new Date();

      this.fechaArchivo_ = this.resultadoComite[index]["fechaArchivo"];
      var fechaArchSplit =
        this.fechaArchivo_ != null ? this.fechaArchivo_.split("/") : new Date();

      var diaFArch = Number(fechaArchSplit[0]);
      var mesFArch = Number(fechaArchSplit[1]);
      var anioFArch = Number(fechaArchSplit[2]);

      var fechaArchivonew =
        this.fechaArchivo_ != null
          ? new Date(anioFArch, mesFArch - 1, diaFArch)
          : new Date();

      let lastApliCana = this.resultadoComite[index]["aplicaCanalizacion"];
      window["result"] = this.resultCmtFrmArray;

      this.resultCmtFrmArray.push(
        new FormGroup({
          tpCmtFrmCtrl: new FormControl(
            this.resultadoComite[index]["strnombreComite"] == null
              ? this.resultadoComite[index]["nombreLiderTumor"]
              : this.resultadoComite[index]["strnombreComite"]
          ),
          tipoFrmCtrl: new FormControl(
            this.resultadoComite[index]["strnombreComite"]
          ),
          fechaReuComite: new FormControl(fechaComiteReu),
          resCmtFrmCtrl: new FormControl(
            this.resultadoComite[index]["strResultadoAutorizador"]
          ),
          comentFrmCtrl: new FormControl(
            this.resultadoComite[index]["comentarioResultadoComite"]
          ),
          //fechaResObservFrmCtrl: new FormControl(new Date()),
          //element["cgrDocSusteFrmCtrl"] == null ? this.documentoCargado = true : this.documentoCargado = false;

          cgrDocSusteFrmCtrl: new FormControl(
            this.resultadoComite[index]["codArchivo"]
          ),
          resultAutoriFrmCtrl: new FormControl(
            this.resultadoComite[index]["codResultadoAutorizador"]
          ),
          mtvRechazFrmCtrl: new FormControl(
            this.resultadoComite[index]["motivo"]
          ),
          apliCanaFrmCtrl: new FormControl({
            value: this.resultadoComite[index]["aplicaCanalizacion"],
            disabled:
              this.resultadoComite[index]["codResultadoAutorizador"] != "" &&
              this.resultadoComite[index]["codResultadoAutorizador"] != null
                ? //this.resultadoComite[index]["aplicaCanalizacion"] == 0
                  true
                : false,
          }),
          instanciaCanaFrmCtrl: new FormControl({
            value: this.resultadoComite[index]["codInsCanalizacion"],
            disabled:
              this.resultadoComite[index]["codResultadoAutorizador"] != "" &&
              this.resultadoComite[index]["codResultadoAutorizador"] != null
                ? // this.resultadoComite[index]["aplicaCanalizacion"] == 0
                  true
                : false,
          }),
          espCmtFrmCtrl: new FormControl({
            value: this.resultadoComite[index]["codComite"],
            disabled: true,
          }),
          lidTmrFrmCtrl: new FormControl({
            value: this.resultadoComite[index]["codLiderTumor"],
            disabled: true,
          }),
          fechaResObservFrmCtrl: new FormControl(fechaArchivonew),
          archivoCargado: new FormControl(null),
          comentariosFrmCtrl: new FormControl(
            this.resultadoComite[index]["comentario"]
          ),
          nameFileFrmCtrl: new FormControl(null),
        })
      );

      if (this.resultadoComite[index]["codInsCanalizacion"]) {
      }

      if (this.resultadoComite[index]["codComite"] != null) {
        // this.instEspcCmtDisabled = true;
        // this.resultadoComite[index]["instEspcCmtDisabled"] = true
        this.resultCmtFrmArray.controls[index]["controls"][
          "espCmtFrmCtrl"
        ].disable();
        // this.resultCmtFrmArray.controls[index]["controls"]["espCmtFrmCtrl"].disable()
        //this.lidTmrDisabled = true;
      }

      if (this.resultadoComite[index]["codLiderTumor"] != null) {
        //this.instEspcCmtDisabled = true;
        this.resultCmtFrmArray.controls[index]["controls"][
          "lidTmrFrmCtrl"
        ].disable();
        // this.resultadoComite[index]["lidTmrDisabled"] = true
        // this.lidTmrDisabled = true;
      }

      //this.instanciaCana(event);
      /*let codResp = this.resultadoComite[index]["codResultadoAutorizador"]
      if(codResp !== null || codResp !== '' ){
        this.resultCmtFrmArray.controls[index]['apliCanaFrmCtrl'].disabled();
        this.resultCmtFrmArray.controls[index]['instanciaCanaFrmCtrl'].disabled();
        this.resultCmtFrmArray.controls[index]['espCmtFrmCtrl'].disabled();
      }*/

      this.tituloPrincipal =
        this.resultCmtFrmArray.controls[index].value.resCmtFrmCtrl.slice(-5);
      //this.cargarDocumentosSustentos()
    }
  }

  public validarFechaInicio() {}

  openInput(): void {
    // if (this.today < this.endDate && this.startDate <= this.today) {
    document.getElementById("fileInput").click();
    // }
    // else {
    //   this.openDialogMensaje(MENSAJES.CONSUMO.VALIDA_MES, null, true, false, null);
    // }
  }

  filtrarComite(name) {
    if (name.length > 0) {
      this.listaComites = this.listaComites.filter((el) => {
        return el.descripcionComite.toLowerCase().includes(name.toLowerCase());
      });
    } else {
      this.listaComites = this.listaCompleta;
    }
  }

  cargarArchivo(event) {
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
    } else if (this.fileupload.type != FILEFTP.filePdf) {
      this.openDialogMensaje(
        "Validación del tipo de archivo",
        "Solo se permiten archivos PDF",
        true,
        false,
        "Tipo de archivo: " + this.fileupload.type + " MB"
      );
      return false;
    }

    const documento2: HistPacienteResponse = {
      codChekListReq: null,
      lineaTratamiento: null,
      descripcionMac: null,
      tipoDocumento: 87,
      nombreTipoDocumento: "OTROS",
      descripcionDocumento: this.fileupload.name,
      subtitle: "",
      urlDescarga: "",
      fechaCarga: null,
      estadoDocumento: 88,
      descripcionEstado: "ARCHIVO CARGADO",
      estado: true,
      nameFile: this.fileupload.name,
      codArchivo: null,
      cargando: true,
    };

    this.docOtros.push(documento2);

    //this.desDocuNuevo.setValue("");
    // this.activarOpenFile = true;
    this.subirArchivoFTP(documento2, 2);

    //
    //
    // var typeArchivo = this.archivoCargado.nativeElement.files[0].type;

    // if(typeArchivo != FILEFTP.filePdf){
    //   this.openDialogMensaje(
    //     "Validación del tipo de archivo",
    //     "Solo se permiten archivos PDF",
    //     true,
    //     false,
    //     "Tipo de archivo: " + typeArchivo + " MB"
    //   );
    //   return false;
    // }

    // if (this.archivoCargado.nativeElement.files.length === 0) {
    //   this.resultCmtFrmArray.controls.forEach((e) => {
    //     e.patchValue({
    //       nameFileFrmCtrl: null,
    //     });
    //   });
    //   this.bloqInscripcion = true;
    // } else {
    //   this.resultCmtFrmArray.controls.forEach((e) => {
    //     e.patchValue({
    //       nameFileFrmCtrl: this.archivoCargado.nativeElement.files[0].name,
    //     });
    //   });
    //   this.bloqInscripcion = false;
    // }
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
      archivoRequest.nomArchivo =
        documento.descripcionDocumento.replace(/ /gi, "_") +
        "_" +
        this.solicitud_.codSolEvaluacion +
        ".pdf";
      archivoRequest.nomArchivo = archivoRequest.nomArchivo.replace("(*)", "");
      archivoRequest.ruta = FILEFTP.rutaEvaluacionRequisitos;

      this.spinnerService.show();

      this.coreService.subirArchivo(archivoRequest).subscribe(
        (response: WsResponse) => {
          if (response.audiResponse.codigoRespuesta === "0") {
            this.mensajes = response.audiResponse.mensajeRespuesta;
            this.codArchivoDown = response.data.codArchivo;
            this.resultCmtFrmArray.controls.forEach((e) => {
              e.patchValue({
                cgrDocSusteFrmCtrl: response.data.codArchivo,
              });
            });
            this.mensajes = "El archivo se cargo correctamente";
            this.openDialogMensaje("", this.mensajes, true, false, null);
            this.documentoCargado = false;
            // this.llamarServicioCargarArchivo();
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
              // this.eliminarRequeridosDoc(documento);
            } else {
              // this.eliminarOtrosDoc(documento);
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
            // this.eliminarRequeridosDoc(documento);
          } else {
            // this.eliminarOtrosDoc(documento);
          }
        }
      );
    }
  }

  public descArchivoSust(data) {
    // this.archivoSust = new ArchivoFTP();
    // this.archivoSust.codArchivo = this.codArchivoDown;
    // this.archivoSust.ruta = FILEFTP.rutaInformeAutorizador;

    this.resultCmtFrmArray.value.forEach((element) => {
      this.archivoSust = new ArchivoFTP();
      this.archivoSust.codArchivo = element["cgrDocSusteFrmCtrl"];
      this.archivoSust.ruta = FILEFTP.rutaInformeAutorizador;

      this.spinnerService.show();
      this.coreService.descargarArchivoFTP(this.archivoSust).subscribe(
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
            this.mensajeDownload = response.audiResponse.mensajeRespuesta;
            this.openDialogMensaje(
              MENSAJES.ERROR_NOFUNCION,
              this.mensajeDownload,
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
            this.mensajeDownload,
            true,
            false,
            null
          );
          this.spinnerService.hide();
        }
      );
    });
  }

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
        title: MENSAJES.medicNuevo.levantamientoObservaciones.TITLE,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((rspta) => {});
  }

  importarArchivoObserv() {}

  public verificarResultAutori(event, index): void {
    if (event.value !== 22) {
      //@ts-ignore
      //prettier-ignore
      this.resultCmtFrmArray.controls[index].controls.mtvRechazFrmCtrl.disable();
      //@ts-ignore
      this.resultCmtFrmArray.controls[index].controls.apliCanaFrmCtrl.disable();
      //@ts-ignore
      //prettier-ignore
      this.resultCmtFrmArray.controls[index].controls.instanciaCanaFrmCtrl.disable();
      //@ts-ignore
      this.resultCmtFrmArray.controls[index].controls.espCmtFrmCtrl.disable();
      //@ts-ignore
      this.resultCmtFrmArray.controls[index].controls.lidTmrFrmCtrl.disable();
    } else {
      //@ts-ignore
      //prettier-ignore
      this.resultCmtFrmArray.controls[index].controls.mtvRechazFrmCtrl.enable();
      //@ts-ignore
      this.resultCmtFrmArray.controls[index].controls.apliCanaFrmCtrl.enable();
      //@ts-ignore
      //prettier-ignore
      this.resultCmtFrmArray.controls[index].controls.instanciaCanaFrmCtrl.enable();
      //@ts-ignore
      this.resultCmtFrmArray.controls[index].controls.espCmtFrmCtrl.enable();
      //@ts-ignore
      this.resultCmtFrmArray.controls[index].controls.lidTmrFrmCtrl.enable();
    }
  }

  public aplicaCana(event): void {
    this.resultCmtFrmArray.controls.forEach((e) => {
      if (e.value.apliCanaFrmCtrl == 1) {
        e["controls"].instanciaCanaFrmCtrl.enable();
        if (
          e["controls"].instanciaCanaFrmCtrl.value == null ||
          e["controls"].instanciaCanaFrmCtrl.value == "" ||
          e["controls"].instanciaCanaFrmCtrl.value == undefined
        ) {
          var idInstanciaCanalizar_ = document.getElementById(
            "idInstanciaCanalizarData"
          );
          if (document.getElementsByClassName("labelEspeComite").length == 0) {
            idInstanciaCanalizar_.classList.add("labelEspeComite");
            this.addElement();
          }
        }
        if (e.value.instanciaCanaFrmCtrl == 506) {
          e["controls"].espCmtFrmCtrl.enable();
        } else {
          e["controls"].espCmtFrmCtrl.disable();
        }
      } else {
        e["controls"].espCmtFrmCtrl.disable();
        e["controls"].instanciaCanaFrmCtrl.disable();
        e["controls"].lidTmrFrmCtrl.disable();
        e["controls"].lidTmrFrmCtrl.reset();
        e["controls"].espCmtFrmCtrl.reset();
        e["controls"].instanciaCanaFrmCtrl.reset();

        var idInstanciaCanalizar = document.getElementById(
          "idInstanciaCanalizarData"
        );
        idInstanciaCanalizar.classList.remove("labelEspeComite");
        var currentDiv = document.getElementById("mesasge_requerido");
        if (currentDiv) {
          currentDiv.innerHTML = "";
        }
        // añade el elemento creado y su contenido al DOM
        // var currentDiv = document.getElementById("mesasge_requerido");
        // currentDiv.innerHTML = "";
      }
      //e["controls"].espCmtFrmCtrl.enable();
    });
  }

  public instanciaCana(event): void {
    this.resultCmtFrmArray.controls.forEach((e) => {
      if (
        e.value.instanciaCanaFrmCtrl != null ||
        e.value.instanciaCanaFrmCtrl != "" ||
        e.value.instanciaCanaFrmCtrl != undefined
      ) {
        var idInstanciaCanalizar = document.getElementById(
          "idInstanciaCanalizarData"
        );
        idInstanciaCanalizar.classList.remove("labelEspeComite");
        var currentDiv = document.getElementById("mesasge_requerido");
        if (currentDiv) currentDiv.remove();
      }

      window["eliminar"] = e["controls"];

      if (e.value.instanciaCanaFrmCtrl == 506) {
        e["controls"].lidTmrFrmCtrl.disable();
        e["controls"].espCmtFrmCtrl.enable();
      } else {
        e["controls"].lidTmrFrmCtrl.enable();
        e["controls"].espCmtFrmCtrl.disable();
      }
    });
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

  public visualizarInformeAutorizador(): void {
    this.archivoRqt = new ArchivoFTP();
    this.archivoRqt.codArchivo = this.solicitud_.codInformePDF;
    this.archivoRqt.ruta = FILEFTP.rutaInformeAutorizador;
    this.descargarDocumento2();
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
          // case bandejaEvaluacion.chkPerfil:
          //   this.chkPerfil = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion.chkPreferencia:
          //   this.chkPreferencia = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion.txtTratamiento:
          //   this.txtTratamiento = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion.txtTipoTratamiento:
          //   this.txtTipoTratamiento = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion.txtObservaciones:
          //   this.txtObservaciones = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion.chkPertinencia:
          //   this.chkPertinencia = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion.cmbCondicion:
          //   this.cmbCondicion = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion.cmbTiempo:
          //   this.cmbTiempo = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion.txtResultado:
          //   this.txtResultado = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion.btnVista:
          //   this.btnVista = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion.cmbResultado:
          //   this.cmbResultado = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion.txtComentarioRol:
          //   this.txtComentarioRol = Number(element.flagAsignacion);
          //   break;
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

  public generarReportePaso6(vista: boolean): void {
    //this.guardarRequestInforme();
    var data = {
      codSolEva: this.solicitud_.codSolEvaluacion,
    };

    this.detalleSolicitudEvaluacionService.generarReportePaso6(data).subscribe(
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
