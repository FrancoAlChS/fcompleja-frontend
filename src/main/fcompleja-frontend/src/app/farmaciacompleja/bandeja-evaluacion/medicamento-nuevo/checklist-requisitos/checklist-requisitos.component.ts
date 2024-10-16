import {
  Component,
  OnInit,
  ViewChild,
  Inject,
  Output,
  EventEmitter,
  NgZone,
} from "@angular/core";
import { HistPacienteResponse } from "src/app/dto/response/HistPacienteResponse";
import { CheckListRequisitoRequest } from "src/app/dto/request/CheckListRequisitoRequest";
import { FormControl, Validators, FormGroup } from "@angular/forms";
import {
  MatTableDataSource,
  MatPaginator,
  MatSort,
  DateAdapter,
  MatDialog,
} from "@angular/material";
import {
  PARAMETRO,
  MENSAJES,
  FILEFTP,
  FLAG_REGLAS_EVALUACION,
  ACCESO_EVALUACION,
  TIPOSCGSOLBEN,
  ESTADOEVALUACION,
} from "src/app/common";
import { ParametroRequest } from "src/app/dto/ParametroRequest";
import { DetalleSolicitudEvaluacionService } from "src/app/service/detalle.solicitud.evaluacion.service";
import { ListaParametroservice } from "src/app/service/lista.parametro.service";
import { ParametroResponse } from "src/app/dto/ParametroResponse";
import { DocuHistPacienteResponse } from "src/app/dto/response/DocuHistPacienteResponse";
import { EvaluacionService } from "src/app/dto/service/evaluacion.service";
import { CustomValidator } from "src/app/directives/custom.validator";
import { MessageComponent } from "src/app/core/message/message.component";
import { WsResponse } from "src/app/dto/WsResponse";
import { ArchivoRequest } from "src/app/dto/request/ArchivoRequest";
import { ApiOutResponse } from "src/app/dto/response/ApiOutResponse";
import { CoreService } from "src/app/service/core.service";
import { ArchivoFTP } from "src/app/dto/bandeja-preliminar/detalle-preliminar/ArchivoFTP";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { UsuarioService } from "src/app/dto/service/usuario.service";
import { BOpcionMenuLocalStorage } from "src/app/dto/core/BOpcionMenuLocalStorage";
import { InfoSolben } from "src/app/dto/bandeja-preliminar/detalle-preliminar/InfoSolben";
import { InformeSolEvaReporteRequest } from "src/app/dto/solicitudEvaluacion/detalle/InformacionScgEvaRequest";
import { DatePipe } from "@angular/common";
import { CdkTextareaAutosize } from "@angular/cdk/text-field";
import { take } from "rxjs/operators";
import { BandejaEvaluacionService } from "src/app/service/bandeja.evaluacion.service";

@Component({
  selector: "app-checklist-requisitos",
  templateUrl: "./checklist-requisitos.component.html",
  styleUrls: ["./checklist-requisitos.component.scss"],
})
export class ChecklistRequisitosComponent implements OnInit {
  @ViewChild("autosize") autosize: CdkTextareaAutosize;
  archivoRqt: ArchivoFTP;
  observerScgEva: any;
  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.

    this._ngZone.onStable
      .pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  fileupload: File;

  grabarPaso: string;

  mensajes: string;
  @Output() btnSiguiente = new EventEmitter<boolean>();

  mostrarDocumentos: boolean;
  primeraVez: boolean = true;

  parametroRequest: ParametroRequest;

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

  desDocuNuevo: FormControl;
  activarOpenFile: boolean;

  inputFile: FormControl = new FormControl(null);

  dataSource: MatTableDataSource<HistPacienteResponse>;
  columnsGrilla = [
    {
      codAcceso: ACCESO_EVALUACION.paso2.lineaTratamiento,
      columnDef: "lineaTratamiento",
      header: "LINEA TRATAMIENTO",
      cell: (docHistPcte: HistPacienteResponse) =>
        `${docHistPcte.lineaTratamiento}`,
    },
    {
      codAcceso: ACCESO_EVALUACION.paso2.medicamento,
      columnDef: "descripcionMac",
      header: "MEDICAMENTO",
      cell: (docHistPcte: HistPacienteResponse) =>
        `${docHistPcte.descripcionMac}`,
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
  displayedColumns: String[];
  isLoading: boolean;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  opcionMenu: BOpcionMenuLocalStorage;
  fileRecetaMedica: number;
  fileInformeMedica: number;
  fileEvaluacionGeriatrica: number;
  txtDescripcion: number; // Opcion para Otros archivos.
  fileArchivo: number;
  btnAgregar: number;
  btnEliminar: number;
  btnCargarArchivo: number;
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

  public step: number;
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
  mensaje: string;

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
    public dialog: MatDialog,
    private coreService: CoreService,
    private datePipe: DatePipe,
    private _ngZone: NgZone,
    private bandejaEvaluacionService: BandejaEvaluacionService,
    private listaParametroservice: ListaParametroservice,
    private detalleServicioSolEva: DetalleSolicitudEvaluacionService,
    private detalleSolicitudEvaluacionService: DetalleSolicitudEvaluacionService,
    @Inject(UsuarioService) private userService: UsuarioService,
    @Inject(EvaluacionService) private solicitud: EvaluacionService
  ) {
    this.adapter.setLocale("es-PE");
  }

  ngOnInit() {
    this.accesoOpcionMenu();

    this.desDocuNuevo = new FormControl(
      "",
      CustomValidator.descripcionInvalida(this.todosDocumentos)
    );
    this.definirTablaCheckListRequisito();
    this.iniciarVariables();
  }

  public iniciarVariables() {
    this.step = 0;
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
    this.observerScgEva = this.detalleSolicitudEvaluacionService
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

  public definirTablaCheckListRequisito(): void {
    this.historicoLineaTratRequisito = [];
    this.displayedColumns = [];

    this.displayedColumns.push("indice");

    this.columnsGrilla.forEach((c) => {
      this.displayedColumns.push(c.columnDef);
    });

    this.displayedColumns.push("descargar");
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

  // -----------  INICIO PASO 2 DESARROLLO   --------------
  public iniciarCheckListRequisito() {
    if (this.primeraVez) {
      this.request.codSolEva = this.solicitud.codSolEvaluacion;
      this.consultarInformacionScgEva();
      this.primeraVez = false;
    }
    this.isLoading = false;
    this.dataSource = null;
    this.desDocuNuevo = new FormControl(
      "",
      CustomValidator.descripcionInvalida(this.todosDocumentos)
    );
    this.parametroRequest = new ParametroRequest();
    this.historicoLineaTratRequisito = [];
    this.activarOpenFile = true;
    this.chkListRequisito = new CheckListRequisitoRequest();
    this.mostrarDocumentos = false;
    this.consultarFilaMaxReqParametro();
    this.consultarCheckListRequisito();
  }

  public consultarFilaMaxReqParametro() {
    this.parametroRequest.codigoParametro = PARAMETRO.nroFilaCheckListReq;
    this.listaParametroservice.parametro(this.parametroRequest).subscribe(
      (data: ParametroResponse) => {
        if (data.codigoResultado === 0) {
          this.nroMaxFilaAgreArch = data.filtroParametro[0].valor1Parametro;
        } else {
          this.openDialogMensaje(
            MENSAJES.ERROR_NOFUNCION,
            data.mensageResultado,
            true,
            false,
            null
          );
        }
      },
      (error) => {
        console.error(error);
        this.openDialogMensaje(
          MENSAJES.ERROR_SERVICIO,
          "Error al obtener total de archivos",
          true,
          false,
          null
        );
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

  public docRequeridosRol() {
    let docRequeridosAux: HistPacienteResponse[] = [];
    this.docRequeridos.forEach((doc) => {
      this.opcionMenu.opcion.forEach((element) => {
        if (
          doc.tipoDocumento === ACCESO_EVALUACION.paso2.codigoRecetaParametro &&
          ACCESO_EVALUACION.paso2.recetaMedica === element.codOpcion &&
          Number(element.flagAsignacion) === ACCESO_EVALUACION.mostrarOpcion
        ) {
          docRequeridosAux.push(doc);
        }
        if (
          doc.tipoDocumento ===
            ACCESO_EVALUACION.paso2.codigoInformeParametro &&
          ACCESO_EVALUACION.paso2.informeMedico === element.codOpcion &&
          Number(element.flagAsignacion) === ACCESO_EVALUACION.mostrarOpcion
        ) {
          docRequeridosAux.push(doc);
        }
        if (
          doc.tipoDocumento ===
            ACCESO_EVALUACION.paso2.codigoEvaluacionParametro &&
          ACCESO_EVALUACION.paso2.evaluacionGeriatrica === element.codOpcion &&
          Number(element.flagAsignacion) === ACCESO_EVALUACION.mostrarOpcion
        ) {
          docRequeridosAux.push(doc);
        }
      });
    });
    this.docRequeridos = docRequeridosAux;

    var docOtrosAux: HistPacienteResponse[] = [];
    this.docOtros.forEach((doc) => {
      this.opcionMenu.opcion.forEach((element) => {
        if (
          doc.tipoDocumento === ACCESO_EVALUACION.paso2.codigoOtroParametro &&
          ACCESO_EVALUACION.paso2.otro === element.codOpcion &&
          Number(element.flagAsignacion) === ACCESO_EVALUACION.mostrarOpcion
        ) {
          docOtrosAux.push(doc);
        }
      });
    });
    this.docOtros = docOtrosAux;
  }

  public consultarCheckListRequisito() {
    this.mostrarDocumentos = false;
    this.isLoading = true;

    this.dataSource = null;
    this.historicoLineaTratRequisito = [];

    this.grabarRequest();

    this.detalleSolicitudEvaluacionService
      .consultarCheckListRequisito(this.chkListRequisito)
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

  public verDescripDocumentos() {
    if (
      this.desDocuNuevo.value !== undefined &&
      this.desDocuNuevo.value !== ""
    ) {
      this.activarOpenFile = false;
      this.todosDocumentos.forEach((doc) => {
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

  public openFileRequerido(documento: HistPacienteResponse, event) {
    this.fileupload = event.target.files[0];

    // AQUI SE ELIMINO EL LIMITE DE SUBIDA  if (this.fileupload.size > FILEFTP.tamanioMax)

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
    this.chkListRequisito.tipoDocumento = documento.tipoDocumento;
    this.chkListRequisito.descripcionDocumento = documento.descripcionDocumento;
    this.chkListRequisito.estadoDocumento = 88;
    this.chkListRequisito.edad = this.solicitud.edad;
    this.chkListRequisito.tipoEvaluacion = 1;
    this.chkListRequisito.codigoRolUsuario = this.userService.getCodRol;
    this.chkListRequisito.codigoUsuario = this.userService.getCodUsuario;

    documento.descripcionEstado = "ARCHIVO CARGADO";
    documento.estadoDocumento = 88;
    documento.estado = true;
    documento.cargando = true;

    this.subirArchivoFTP(documento, 1);
  }

  public openFile(event) {
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

      const documento2: HistPacienteResponse = {
        codChekListReq: null,
        lineaTratamiento: null,
        descripcionMac: null,
        tipoDocumento: 87,
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
        cargando: true,
      };

      this.docOtros.push(documento2);

      this.chkListRequisito = {
        codSolEva: this.chkListRequisito.codSolEva,
        codCheckListRequisito: null,
        codContinuadorDoc: null,
        codMac: this.solicitud.codMac,
        tipoDocumento: 87,
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
            this.consultarCheckListRequisito();
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
      tipoDocumento: documento.tipoDocumento,
      descripcionDocumento: documento.descripcionDocumento,
      estadoDocumento: 89,
      urlDescarga: null,
      edad: this.solicitud.edad,
      tipoEvaluacion: 1,
      codArchivo: null,
      codigoRolUsuario: this.userService.getCodRol,
      codigoUsuario: this.userService.getCodUsuario,
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
            this.consultarCheckListRequisito();
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

  public ValidarChecklistRequisito(): boolean {
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

  public guardarChecklistRequisito() {
    // if (this.ValidarChecklistRequisito()) {
    this.spinnerService.show();
    this.detalleSolicitudEvaluacionService
      .actualizarCheckListGuardarDocumento(this.chkListRequisito)
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
            this.btnSiguiente.emit(true);
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
          this.btnSiguiente.emit(true);
          this.mensajes = "Error, por favor volver a intentar";
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            this.mensajes,
            true,
            false,
            null
          );
          console.error(error);
          this.spinnerService.hide();
        }
      );
    // } else {
    //   // POPUP PARA ENVIAR MENSAJE DE CAMPOS REQUERIDOS
    //   console.error(this.mensajes);
    //   this.openDialogMensaje(MENSAJES.ERROR_VALIDA_DOC, this.mensajes, true, false, null);
    // }
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
        title: MENSAJES.medicNuevo.chkListRequisito.TITLE,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((rspta) => {});
  }

  public accesoOpcionMenu() {
    const data = require("src/assets/data/permisosRecursos.json");
    const bandejaEvaluacion = data.bandejaEvaluacion.paso2;
    const bandejaEvaluacion2 = data.bandejaEvaluacion.detalle;
    this.opcionMenu = JSON.parse(localStorage.getItem("opcionMenu"));

    if (this.opcionMenu.opcion.length > 0) {
      this.opcionMenu.opcion.forEach((element) => {
        const codOpcion = element.codOpcion;
        switch (codOpcion) {
          case bandejaEvaluacion.fileRecetaMedica:
            this.fileRecetaMedica = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.fileInformeMedica:
            this.fileInformeMedica = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.fileEvaluacionGeriatrica:
            this.fileEvaluacionGeriatrica = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtDescripcion:
            this.txtDescripcion = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.fileArchivo:
            this.fileArchivo = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnAgregar:
            this.btnAgregar = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnEliminar:
            this.btnEliminar = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnCargarArchivo:
            this.btnCargarArchivo = Number(element.flagAsignacion);
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
          // case bandejaEvaluacion2.txtCodigoSolicitud:
          //   this.txtCodigoSolicitud = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.txtEstadoSolicitud:
          //   this.txtEstadoSolicitud = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.txtCodigoMac:
          //   this.txtCodigoMac = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.txtDescripcionMac:
          //   this.txtDescripcionMac = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.btnInforme:
          //   this.btnInforme = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.btnActaMac:
          //   this.btnActaMac = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.txtNroSCG:
          //   this.txtNroSCG = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.txtEstadoSCG:
          //   this.txtEstadoSCG = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.txtFechaSCG:
          //   this.txtFechaSCG = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.txtTipoSCG:
          //   this.txtTipoSCG = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.txtNroCartaGarantiaDet:
          //   this.txtNroCartaGarantiaDet = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.txtClinicaDet:
          //   this.txtClinicaDet = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.txtMedicoTratante:
          //   this.txtMedicoTratante = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.txtCMP:
          //   this.txtCMP = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.txtFechaReceta:
          //   this.txtFechaReceta = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.txtFechaQuimioterapia:
          //   this.txtFechaQuimioterapia = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.txtFechaHospitalizacion:
          //   this.txtFechaHospitalizacion = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.txtMedicamentos:
          //   this.txtMedicamentos = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.txtEsquemaQuimioterapia:
          //   this.txtEsquemaQuimioterapia = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.txtPersonaContacto:
          //   this.txtPersonaContacto = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.txtTotalPresupuesto:
          //   this.txtTotalPresupuesto = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.txtPacienteDet:
          //   this.txtPacienteDet = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.txtEdad:
          //   this.txtEdad = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.txtDiagnostico:
          //   this.txtDiagnostico = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.txtCie10:
          //   this.txtCie10 = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.txtGrupoDiagnostico:
          //   this.txtGrupoDiagnostico = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.txtContratante:
          //   this.txtContratante = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.txtPlan:
          //   this.txtPlan = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.txtCodigoAfiliado:
          //   this.txtCodigoAfiliado = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.txtFechaAfiliacion:
          //   this.txtFechaAfiliacion = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.txtEstadioClinico:
          //   this.txtEstadioClinico = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.txtTNM:
          //   this.txtTNM = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.txtObservacion:
          //   this.txtObservacion = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.btnEnviarAlertaMonitoreo:
          //   this.btnEnviarAlertaMonitoreo = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.btnRegistrarEvaAutorizador:
          //   this.btnRegistrarEvaAutorizador = Number(element.flagAsignacion);
          //   break;
          // case bandejaEvaluacion2.btnRegistrarEvaLiderTumor:
          //   this.btnRegistrarEvaLiderTumor = Number(element.flagAsignacion);
          //   break;
        }
      });
    }
  }

  public setStep(index: number): void {
    this.step = index;
  }

  public setStep2(index: number): void {
    this.step2 = index;
  }

  public generarReportePaso2(vista: boolean): void {
    //this.guardarRequestInforme();
    var data = {
      codSolEva: this.solicitud.codSolEvaluacion,
      edad: this.solicitud.edad,
    };

    this.detalleSolicitudEvaluacionService.generarReportePaso2(data).subscribe(
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

  public visualizarInformeAutorizador(): void {
    this.archivoRqt = new ArchivoFTP();
    this.archivoRqt.codArchivo = this.solicitud.codInformePDF;
    this.archivoRqt.ruta = FILEFTP.rutaInformeAutorizador;
    this.descargarDocumento2();
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
