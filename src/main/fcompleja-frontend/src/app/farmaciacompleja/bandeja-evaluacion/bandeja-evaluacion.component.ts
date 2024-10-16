import {
  Component,
  Inject,
  OnInit,
  ViewChild,
  forwardRef
} from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import {
  MatDialog,
  MatIconRegistry,
  MatPaginator,
  MatPaginatorIntl,
  MatSort,
  MatTableDataSource,
} from "@angular/material";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from "@angular/router";
import {
  ACCESO_EVALUACION,
  COD_APLICACION_FC,
  ESTADOEVALUACION,
  FLAG_REGLAS_EVALUACION,
  MENSAJES,
  MY_FORMATS_AUNA,
  PARAMETRO,
  ROLES
} from "../../common";

import { ParametroRequest } from "../../dto/ParametroRequest";
import { ParametroResponse } from "../../dto/ParametroResponse";
import { ListaParametroservice } from "../../service/lista.parametro.service";

import { UsrRolRequest } from "../../dto/UsrRolRequest";
import { UsrRolResponse } from "../../dto/UsrRolResponse";
import { ListaFiltroUsuarioRolservice } from "../../service/Lista.usuario.rol.service";

import { RolResponsableResponse } from "../../dto/RolResponsableResponse";
import { RolResponsableService } from "../../service/rol.responsable.service";

import { ListaEvaluaciones } from "../../dto/solicitudEvaluacion/bandeja/ListaEvaluaciones";
import { ListaEvaluacionesRequest } from "../../dto/solicitudEvaluacion/bandeja/ListaEvaluacionesRequest";
import { BandejaEvaluacionService } from "../../service/bandeja.evaluacion.service";

import { SelectionModel } from "@angular/cdk/collections";
import { DatePipe } from "@angular/common";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { FILEFTP } from "src/app/common";
import { MessageComponent } from "src/app/core/message/message.component";
import { MatPaginatorIntlEspanol } from "src/app/directives/matpaginator-translate";
import { Clinica } from "src/app/dto/Clinica";
import { ListUsrRol } from "src/app/dto/ListUsrRol";
import { Paciente } from "src/app/dto/Paciente";
import { WsResponse } from "src/app/dto/WsResponse";
import { WsResponseOnco } from "src/app/dto/WsResponseOnco";
import { ArchivoFTP } from "src/app/dto/bandeja-preliminar/detalle-preliminar/ArchivoFTP";
import { BOpcionMenuLocalStorage } from "src/app/dto/core/BOpcionMenuLocalStorage";
import { PdfEvaluacion } from "src/app/dto/reporte/PdfEvaluacion";
import { ArchivoRequest } from "src/app/dto/request/ArchivoRequest";
import { ParticipanteRequest } from "src/app/dto/request/BandejaEvaluacion/ParticipanteRequest";
import { CheckListPacPrefeInstiRequest } from "src/app/dto/request/CheckListPacPrefeInstiRequest";
import { EvaluacionAutorizadorRequest } from "src/app/dto/request/EvaluacionAutorizadorRequest";
import { RespuestEvaluacionRequest } from "src/app/dto/request/RespuestaEvaluacionRequest";
import { SolicitudEvaluacionRequest } from "src/app/dto/request/SolicitudEvaluacionRequest";
import { EvaluacionService } from "src/app/dto/service/evaluacion.service";
import { UsuarioService } from "src/app/dto/service/usuario.service";
import { BuscarClinicaComponent } from "src/app/modal/buscar-clinica/buscar-clinica.component";
import { BuscarPacienteComponent } from "src/app/modal/buscar-paciente/buscar-paciente.component";
import { ReporteEvaluacionService } from "src/app/service/Reportes/Evaluacion/reporte-evaluacion.service";
import { CoreService } from "src/app/service/core.service";
import { CorreosService } from "src/app/service/cross/correos.service";
import { ExcelDownloadResponse } from "../../dto/ExcelDownloadResponse";
import { ExcelExportService } from "../../service/excel.bandeja.pre.service";
import { EvaluacionCmacComponent } from "./evaluacion.cmac/evaluacion.cmac.component";
import { ProgramaCmacComponent } from "./programa.cmac/programa.cmac.component";

@Component({
  selector: "app-bandeja-evaluacion",
  templateUrl: "./bandeja-evaluacion.component.html",
  styleUrls: ["./bandeja-evaluacion.component.scss"],
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
    {
      provide: MatPaginatorIntl,
      useClass: forwardRef(() => MatPaginatorIntlEspanol),
    },
  ],
})
export class BandejaEvaluacionComponent implements OnInit {
  public isLoading: boolean;

  displayedColumns: string[];
  validarIntervalo: any;
  nroIntentos: number;
  archivoRqt: ArchivoFTP;

  informeAutorizador: PdfEvaluacion;
  mensaje: string;
  chkLstPacPreInsRequest: CheckListPacPrefeInstiRequest;

  //code luis
  disableread: boolean[] = [];
  tipoDoc: string;
  numDoc: string;
  nombre1: string;
  nombre2: string;
  apePaterno: string;
  apeMaterno: string;

  bandejaEvaFrmGrp: FormGroup = new FormGroup({
    nroSolEvaFrmCtrl: new FormControl(
      null,
      Validators.compose([Validators.pattern("/W|_/g")])
    ),
    pacienteFrmCtrl: new FormControl(
      null,
      Validators.compose([Validators.pattern("/W|_/g")])
    ),
    nroSCGSolFrmCtrl: new FormControl(
      null,
      Validators.compose([Validators.pattern("/W|_/g")])
    ),
    tipoSCGSolFrmCtrl: new FormControl(
      null,
      Validators.compose([Validators.pattern("/W|_/g")])
    ),
    estadoSCGSolFrmCtrl: new FormControl(
      null,
      Validators.compose([Validators.pattern("/W|_/g")])
    ),
    nCartaGarantiaFrmCtrl: new FormControl(
      null,
      Validators.compose([Validators.pattern("/W|_/g")])
    ),
    autorizadorFrmCtrl: new FormControl(
      null,
      Validators.compose([Validators.pattern("/W|_/g")])
    ),
    liderTumorFrmCtrl: new FormControl(
      null,
      Validators.compose([Validators.pattern("/W|_/g")])
    ),
    clinicaFrmCtrl: new FormControl(
      null,
      Validators.compose([Validators.pattern("/W|_/g")])
    ),
    f_desdeRegSolEvaFrmCtrl: new FormControl(
      null,
      Validators.compose([Validators.pattern("/W|_/g")])
    ),
    f_hastaRegSolEvaFrmCtrl: new FormControl(
      null,
      Validators.compose([Validators.pattern("/W|_/g")])
    ),
    estadoSolEvaFrmCtrl: new FormControl(
      null,
      Validators.compose([Validators.pattern("/W|_/g")])
    ),
    estadoSolEvaProcesoFrmCtrl: new FormControl(null),
    rolRespEvaFrmCtrl: new FormControl(
      null,
      Validators.compose([Validators.pattern("/W|_/g")])
    ),
    correoLiderTumorFrmCtrl: new FormControl(
      null,
      Validators.compose([Validators.pattern("/W|_/g")])
    ),
    correoCMACFrmCtrl: new FormControl(
      null,
      Validators.compose([Validators.pattern("/W|_/g")])
    ),
    tipoEvaluacionFrmCtrl: new FormControl(
      null,
      Validators.compose([Validators.pattern("/W|_/g")])
    ),
    itemComiteFrmCtrl: new FormControl(
      null,
      Validators.compose([Validators.pattern("/W|_/g")])
    ),
    fechaReuCmacFrmCtrl: new FormControl(
      null,
      Validators.compose([Validators.pattern("/W|_/g")])
    ),
    fechaReuCmacAlFrmCtrl: new FormControl(
      null,
      Validators.compose([Validators.pattern("/W|_/g")])
    ),
    //code by luis
    codSolPreFrmCtrl: new FormControl(null),
  });

  get nroSolEvaFrmCtrl() {
    return this.bandejaEvaFrmGrp.get("nroSolEvaFrmCtrl");
  }
  get pacienteFrmCtrl() {
    return this.bandejaEvaFrmGrp.get("pacienteFrmCtrl");
  }
  get nroSCGSolFrmCtrl() {
    return this.bandejaEvaFrmGrp.get("nroSCGSolFrmCtrl");
  }
  get tipoSCGSolFrmCtrl() {
    return this.bandejaEvaFrmGrp.get("tipoSCGSolFrmCtrl");
  }
  get estadoSCGSolFrmCtrl() {
    return this.bandejaEvaFrmGrp.get("estadoSCGSolFrmCtrl");
  }
  get nCartaGarantiaFrmCtrl() {
    return this.bandejaEvaFrmGrp.get("nCartaGarantiaFrmCtrl");
  }
  get autorizadorFrmCtrl() {
    return this.bandejaEvaFrmGrp.get("autorizadorFrmCtrl");
  }
  get liderTumorFrmCtrl() {
    return this.bandejaEvaFrmGrp.get("liderTumorFrmCtrl");
  }
  get clinicaFrmCtrl() {
    return this.bandejaEvaFrmGrp.get("clinicaFrmCtrl");
  }
  get f_desdeRegSolEvaFrmCtrl() {
    return this.bandejaEvaFrmGrp.get("f_desdeRegSolEvaFrmCtrl");
  }
  get f_hastaRegSolEvaFrmCtrl() {
    return this.bandejaEvaFrmGrp.get("f_hastaRegSolEvaFrmCtrl");
  }
  get estadoSolEvaFrmCtrl() {
    return this.bandejaEvaFrmGrp.get("estadoSolEvaFrmCtrl");
  }
  get estadoSolEvaProcesoFrmCtrl() {
    return this.bandejaEvaFrmGrp.get("estadoSolEvaProcesoFrmCtrl");
  }
  get rolRespEvaFrmCtrl() {
    return this.bandejaEvaFrmGrp.get("rolRespEvaFrmCtrl");
  }
  get correoLiderTumorFrmCtrl() {
    return this.bandejaEvaFrmGrp.get("correoLiderTumorFrmCtrl");
  }
  get correoCMACFrmCtrl() {
    return this.bandejaEvaFrmGrp.get("correoCMACFrmCtrl");
  }
  get tipoEvaluacionFrmCtrl() {
    return this.bandejaEvaFrmGrp.get("tipoEvaluacionFrmCtrl");
  }
  get itemComiteFrmCtrl() {
    return this.bandejaEvaFrmGrp.get("itemComiteFrmCtrl");
  }
  get fechaReuCmacFrmCtrl() {
    return this.bandejaEvaFrmGrp.get("fechaReuCmacFrmCtrl");
  }
  get fechaReuCmacAlFrmCtrl() {
    return this.bandejaEvaFrmGrp.get("fechaReuCmacAlFrmCtrl");
  }
  get codSolPreFrmCtrl() {
    return this.bandejaEvaFrmGrp.get("codSolPreFrmCtrl");
  }

  columnsGrilla = [
    {
      codAcceso: ACCESO_EVALUACION.busqueda.numeroSolEvaluacion,
      columnDef: "numeroSolEvaluacion",
      header: "N° SOLICITUD EVALUACIÓN",
      cell: (evaluacion: ListaEvaluaciones) =>
        `${evaluacion.numeroSolEvaluacion}`,
    },
    {
      codAcceso: ACCESO_EVALUACION.busqueda.codigoSolPre,
      columnDef: "numeroCodPre",
      header: "N° SOLICITUD PRELIMINAR",
      cell: (evaluacion: ListaEvaluaciones) => `${evaluacion.numeroCodPre}`,
    },
    {
      codAcceso: ACCESO_EVALUACION.busqueda.numeroScgSolben,
      columnDef: "numeroScgSolben",
      header: "N° SCG SOLBEN",
      cell: (evaluacion: ListaEvaluaciones) => `${evaluacion.numeroScgSolben}`,
    },
    {
      codAcceso: ACCESO_EVALUACION.busqueda.nombrePaciente,
      columnDef: "nombrePaciente",
      header: "PACIENTE",
      cell: (evaluacion: ListaEvaluaciones) =>
        evaluacion.nombrePaciente !== ""
          ? `${evaluacion.nombrePaciente}`
          : "[NO DISPONIBLE]",
    },
    {
      codAcceso: ACCESO_EVALUACION.busqueda.tipoScgSolben,
      columnDef: "tipoScgSolben",
      header: "TIPO SCG SOLBEN",
      cell: (evaluacion: ListaEvaluaciones) => `${evaluacion.tipoScgSolben}`,
    },
    {
      codAcceso: ACCESO_EVALUACION.busqueda.descEstadoSCGSolben,
      columnDef: "descEstadoSCGSolben",
      header: "ESTADO SCG SOLBEN",
      cell: (evaluacion: ListaEvaluaciones) =>
        `${evaluacion.descEstadoSCGSolben}`,
    },
    {
      codAcceso: ACCESO_EVALUACION.busqueda.numeroCartaGarantia,
      columnDef: "numeroCartaGarantia",
      header: "N° CARTA GARANTÍA",
      cell: (evaluacion: ListaEvaluaciones) =>
        `${evaluacion.numeroCartaGarantia}`,
    },
    {
      codAcceso: ACCESO_EVALUACION.busqueda.descClinica,
      columnDef: "descClinica",
      header: "CLÍNICA",
      cell: (evaluacion: ListaEvaluaciones) =>
        evaluacion.descClinica !== ""
          ? `${evaluacion.descClinica}`
          : "[NO DISPONIBLE]",
    },
    {
      codAcceso: ACCESO_EVALUACION.busqueda.nombreDiagnostico,
      columnDef: "nombreDiagnostico",
      header: "DIAGNOSTICO",
      cell: (evaluacion: ListaEvaluaciones) =>
        evaluacion.nombreDiagnostico !== ""
          ? `${evaluacion.nombreDiagnostico}`
          : "[NO DISPONIBLE]",
    },
    {
      codAcceso: ACCESO_EVALUACION.busqueda.descripcionCmac,
      columnDef: "descripcionCmac",
      header: "MAC",
      cell: (evaluacion: ListaEvaluaciones) => `${evaluacion.descripcionCmac}`,
    },
    {
      codAcceso: ACCESO_EVALUACION.busqueda.fechaRegistroEvaluacion,
      columnDef: "fechaRegistroEvaluacion",
      header: "FECHA - HORA REGISTRO SOLICITUD EVALUACIÓN",
      cell: (evaluacion: ListaEvaluaciones) =>
        this.datePipe.transform(
          evaluacion.fechaRegistroEvaluacion,
          "dd/MM/yyyy HH:mm:ss"
        ),
    },
    {
      codAcceso: ACCESO_EVALUACION.busqueda.tipoEvaluacion,
      columnDef: "tipoEvaluacion",
      header: "TIPO EVALUACIÓN",
      cell: (evaluacion: ListaEvaluaciones) => `${evaluacion.tipoEvaluacion}`,
    },
    {
      codAcceso: ACCESO_EVALUACION.busqueda.estadoProceso,
      columnDef: "estadoProceso",
      header: "ESTADO DE PROCESO",
      cell: (evaluacion: ListaEvaluaciones) => `${evaluacion.estadoProceso}`,
    },
    {
      codAcceso: ACCESO_EVALUACION.busqueda.estadoEvaluacion,
      columnDef: "estadoEvaluacion",
      header: "ESTADO DE EVALUACIÓN DE LA SOLICITUD",
      cell: (evaluacion: ListaEvaluaciones) => `${evaluacion.estadoEvaluacion}`,
    },
    {
      codAcceso: ACCESO_EVALUACION.busqueda.rolResponsableEvaluacion,
      columnDef: "rolResponsableEvaluacion",
      header: "ROL RESPONSABLE PENDIENTE DE EVALUACIÓN",
      cell: (evaluacion: ListaEvaluaciones) =>
        `${evaluacion.rolResponsableEvaluacion}`,
    },
    {
      codAcceso: ACCESO_EVALUACION.busqueda.tipoComite,
      columnDef: "nombComite",
      header: "TIPO COMITE",
      cell: (evaluacion: ListaEvaluaciones) =>
        `${evaluacion.nombComite ? evaluacion.nombComite : "NO ESPECIFICADO"}`,
    },
    {
      codAcceso: ACCESO_EVALUACION.busqueda.estadoCorreoEnvCmac,
      columnDef: "estadoCorreoEnvCmac",
      header: "CORREO ENVIADO COMITE",
      cell: (evaluacion: ListaEvaluaciones) => `${evaluacion.correoCmac}`,
    },
  ];

  columnsGrilla2 = [
    {
      codAcceso: ACCESO_EVALUACION.busqueda.fechaCmac,
      columnDef: "fechaCmac",
      header: "FECHA REUNION COMITÉ",
      cell: (evaluacion: ListaEvaluaciones) =>
        this.datePipe.transform(evaluacion.fechaCmac, "dd/MM/yyyy"),
    },
    {
      codAcceso: ACCESO_EVALUACION.busqueda.auditorPertenencia,
      columnDef: "auditorPertenencia",
      header: "AUTORIZADOR PERTINENCIA",
      cell: (evaluacion: ListaEvaluaciones) =>
        evaluacion.auditorPertenencia == null
          ? ``
          : `${evaluacion.auditorPertenencia}`,
    },

    {
      codAcceso: ACCESO_EVALUACION.busqueda.liderTumor,
      columnDef: "liderTumor",
      header: "LÍDER TUMOR",
      cell: (evaluacion: ListaEvaluaciones) => `${evaluacion.liderTumor}`,
    },
  ];

  public dataSource: MatTableDataSource<ListaEvaluaciones>;
  public selection = new SelectionModel<ListaEvaluaciones>(true, []);

  PARAMETRO = PARAMETRO;
  filtroEstadoSCG: boolean;
  filtroTipoSCG: boolean;
  filtroEstadoSolEvaluacion: boolean;
  filtroCorreoLiderTumor: boolean;
  filtroCorreocMAC: boolean;
  filtroEvaluacion: boolean;
  filtroFiltroUsuarioRol: boolean;
  filtroUsuarioLiderTumor: boolean;
  filtroRolResponsable: boolean;

  ParametroRequest: ParametroRequest = new ParametroRequest();
  ParametroResponse: ParametroResponse = new ParametroResponse();
  ListaTipoSCG: any[] = [];
  ListaEstadoSCG: any[] = [];
  ListaSolEvaluacionCmac: any[] = [];
  ListaSolEvaluacionProceso: any[] = [];
  codigoGrupoP: string;
  nombreTipoSCG: string;
  nombreEstadoSolben: string;
  nombreEstadoEvaluacion: any;
  ListaCorreoLiderTumor: any[] = [];
  correoLiderTumor: any;
  ListaCorreoCMAC: any[] = [];
  correoCMAC: string;
  ListaEval: any[] = [];
  tipoEval: any;
  UsrRolRequest: UsrRolRequest = new UsrRolRequest();
  UsrRolResponse: UsrRolResponse = new UsrRolResponse();
  userAutorizador: any[] = [];
  FiltroUsrRol: string;
  listaLiderTumor: any[] = [];
  listLidTumor: string;
  RolResponsableResponse: RolResponsableResponse = new RolResponsableResponse();
  listaRolResp: any[] = [];
  rolResponsable: string;
  // LISTA BANDEJA EVALUACION
  detalleEvaluacion: ListaEvaluaciones[] = [];
  listEvaRequest: ListaEvaluacionesRequest = new ListaEvaluacionesRequest();
  listEvaOldRequest: ListaEvaluacionesRequest = new ListaEvaluacionesRequest();
  // LISTA EXCEL
  ExportExcelBandEvaluacion: string;
  respuestEvaluacionRequest: RespuestEvaluacionRequest =
    new RespuestEvaluacionRequest();
  public EvaluacionAutorizadorRequest: EvaluacionAutorizadorRequest =
    new EvaluacionAutorizadorRequest();
  resultadoEvaluacionLiderTumor: any[] = [];
  codigoAfiliado: string;
  codigoClinica: string;

  // MENSAJES
  mensajes: string;
  mensajes2: string;
  valores: any;

  disableBuscar: boolean;
  maxDate: Date;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  opcionMenu: BOpcionMenuLocalStorage;
  txtSolicitudEvaluacion: number;
  txtCodSolPre: number;
  txtPaciente: number;
  txtNroScgSolben: number;
  cmbTipoScgSolben: number;
  cmbEstadoScgSolben: number;
  txtNroCartaGarantia: number;
  cmbAutorizadorPertinencia: number;
  cmbLiderTumor: number;
  txtClinica: number;
  txtFecRegEvalIni: number;
  txtFecRegEvalFin: number;
  cmbEstadoEvaluacion: number;
  cmbRolResponsable: number;
  cmbCorreoLiderTumor: number;
  cmbCorreoMac: number;
  cmbTipoEvaluacion: number;
  txtFecCmac: number;
  btnBuscar: number;
  btnExportarExcel: number;
  btnProgramarCmac: number;
  btnRegistrarCmac: number;
  btnCorreoPendiente: number;
  nombComite: string;

  tipoComite: string;
  flagEvaluacion = FLAG_REGLAS_EVALUACION;
  // flagEvaluacion = true;
  valorMostrarOpcion = ACCESO_EVALUACION.mostrarOpcion;
  ListaComite: any;

  constructor(
    public dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private iconRegistry: MatIconRegistry,
    private listaParametroService: ListaParametroservice,
    private listaFiltroUsuarioRolService: ListaFiltroUsuarioRolservice,
    private rolResponsableService: RolResponsableService,
    private bandejaEvaluacionService: BandejaEvaluacionService,
    private excelExportService: ExcelExportService,
    private correoService: CorreosService,
    private reporteService: ReporteEvaluacionService,
    private coreService: CoreService,
    private router: Router,
    private datePipe: DatePipe,
    private spinnerService: Ng4LoadingSpinnerService,
    @Inject(EvaluacionService) private solicitud: EvaluacionService,
    @Inject(UsuarioService) private userService: UsuarioService
  ) {}

  selectRow(row, event, selection) {
    if (this.tipoComite == row.codComite || !this.tipoComite) {
      this.selection.toggle(row);
      this.tipoComite = row.codComite;
      this.nombComite = row.nombComite;
      localStorage.setItem("nombComite", this.nombComite);
      localStorage.setItem("tipoComite", this.tipoComite);
    }
    if (this.selection.selected.length == 0) {
      this.tipoComite = undefined;
      this.nombComite = "";
    }
  }

  ngOnInit() {
    this.accesoOpcionMenu();
    this.crearTablaEvaluacion();
    this.cargarFiltros();

    this.iconRegistry.addSvgIcon(
      "excel-icon",
      this.sanitizer.bypassSecurityTrustResourceUrl(
        "./assets/img/icon-excel-2.svg"
      )
    );
    localStorage.removeItem("modeConsulta");
    localStorage.removeItem("modeConsultaEva");
    this.maxDate = new Date();
  }

  public crearTablaEvaluacion(): void {
    this.displayedColumns = ["select"];
    this.columnsGrilla.forEach((c) => {
      if (this.flagEvaluacion || true) {
        this.displayedColumns.push(c.columnDef);
      }
    });

    if (this.flagEvaluacion || true) {
      this.displayedColumns.push("correoLiderTumor");
    } else {
      this.opcionMenu.opcion.forEach((element) => {
        if (element.codOpcion === ACCESO_EVALUACION.busqueda.correoLiderTumor) {
          this.displayedColumns.push("correoLiderTumor");
        }
        if (element.codOpcion === ACCESO_EVALUACION.busqueda.correoCmac) {
          this.displayedColumns.push("correoCmac");
        }
      });
    }

    this.columnsGrilla2.forEach((c) => {
      if (this.flagEvaluacion || true) {
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

    if (this.flagEvaluacion || true) {
      this.displayedColumns.push("verDetalle");
      this.displayedColumns.push("verSeguimiento");
      this.displayedColumns.push("vistaPreliminarDelInforme");
    } else {
      this.opcionMenu.opcion.forEach((element) => {
        if (element.codOpcion === ACCESO_EVALUACION.busqueda.verDetalle) {
          this.displayedColumns.push("verDetalle");
        }
        if (element.codOpcion === ACCESO_EVALUACION.busqueda.verSeguimiento) {
          this.displayedColumns.push("verSeguimiento");
        }
        if (
          element.codOpcion ===
          ACCESO_EVALUACION.busqueda.vistaPreliminarDelInforme
        ) {
          this.displayedColumns.push("vistaPreliminarDelInforme");
        }
      });
    }
  }

  public cargarFiltros(): void {
    this.pruebalista();
    //this.listaEstadoSCG();
  }

  // LISTA TIPO DE SCG SOLBEN
  /*public listaTipoSCG() {
    this.ParametroRequest.codigoGrupo = "01";

    this.listaParametroService.listaParametro(this.ParametroRequest).subscribe(
      (data: ParametroResponse) => {
        if (data.codigoResultado === 0) {
          this.ListaTipoSCG = data.filtroParametro;
          this.ListaTipoSCG.unshift({
            // INICIO
            codigoParametro: "",
            nombreParametro: "TODOS",
          });
          this.tipoSCGSolFrmCtrl.setValue("");
          this.listaEstadoSolEvaluacion();
        } else {
          console.error(data);
          // TO-DO
          // CUANDO NO TRAE DATA
        }
      },
      (error) => {
        console.error("Error al listar el Tipo de SCG SOLBEN");
      }
    );
  }*/

  // LISTA DE ESTADO DE SCG SOLBEN
  /*public listaEstadoSCG() {
    this.ParametroRequest.codigoGrupo = "05";

    this.listaParametroService.listaParametro(this.ParametroRequest).subscribe(
      (data: ParametroResponse) => {
        if (data.codigoResultado === 0) {
          this.ListaEstadoSCG = data.filtroParametro;
          console.log(this.ListaEstadoSCG);
          this.ListaEstadoSCG.unshift({
            // INICIO
            codigoExterno: "",
            nombreParametro: "TODOS",
          });
          this.estadoSCGSolFrmCtrl.setValue("");
          this.listaTipoSCG();
        } else {
          console.error(data);
          // TO-DO
          // CUANDO NO TRAE DATA
        }
      },
      (error) => {
        console.error("Error al listar el Estado de SCG SOLBEN");
      }
    );
  }*/

  // Lista ESTADO DE EVALUACION CMAC
  /*public listaEstadoSolEvaluacion() {
    this.ParametroRequest.codigoGrupo = "06";
    this.listaParametroService.listaParametro(this.ParametroRequest).subscribe(
      (data: ParametroResponse) => {
        if (data.codigoResultado === 0) {
          for (let i = 0; i < data.filtroParametro.length; i++) {
            if (data.filtroParametro[i].codigoExterno !== null) {
              this.ListaSolEvaluacionCmac.push(data.filtroParametro[i]);
            }
          }
          this.ListaSolEvaluacionCmac.unshift({
            // INICIO
            codigoParametro: "",
            nombreParametro: "TODOS",
          });
          this.estadoSolEvaFrmCtrl.setValue("");
          this.listaEstadoSolEvaluacionProceso();
        } else {
          console.error(data);
          // TO-DO
          // CUANDO NO TRAE DATA
        }
      },
      (error) => {
        console.error("Error al listar el Estado de Evaluacion del comite");
      }
    );
  }*/

  /*public listaEstadoSolEvaluacionProceso() {
    this.ParametroRequest.codigoGrupo = "06";
    this.listaParametroService.listaParametro(this.ParametroRequest).subscribe(
      (data: ParametroResponse) => {
        if (data.codigoResultado === 0) {
          for (let i = 0; i < data.filtroParametro.length; i++) {
            if (data.filtroParametro[i].codigoExterno === null) {
              this.ListaSolEvaluacionProceso.push(data.filtroParametro[i]);
            }
          }
          this.ListaSolEvaluacionProceso.unshift({
            // INICIO
            codigoParametro: "",
            nombreParametro: "TODOS",
          });

          this.bandejaEvaFrmGrp.get("estadoSolEvaProcesoFrmCtrl").setValue(13);
          this.estadoSolEvaProcesoFrmCtrl.setValue(13);
          this.listaCorreoLiderTumor();
        } else {
          console.error(data);
          // TO-DO
          // CUANDO NO TRAE DATA
        }
      },
      (error) => {
        console.error("Error al listar el Estado de Evaluacion del comite");
      }
    );
  }*/

  // COMBO DE CORREO ENVIADO LIDER TUMOR
  /*public listaCorreoLiderTumor(): void {
    this.ParametroRequest.codigoGrupo = "07";

    this.listaParametroService.listaParametro(this.ParametroRequest).subscribe(
      (data: ParametroResponse) => {
        if (data.codigoResultado === 0) {
          this.ListaCorreoLiderTumor = data.filtroParametro;
          this.ListaCorreoLiderTumor.unshift({
            // INICIO
            codigoParametro: "",
            nombreParametro: "TODOS",
          });
          this.correoLiderTumorFrmCtrl.setValue("");
          this.listaCorreocMAC();
        } else {
          console.error(data);
          // TO-DO
          // CUANDO NO TRAE DATA
        }
      },
      (error) => {
        console.error(
          "Error al listar la confirmacion de Correo de Lider Tumor"
        );
      }
    );
  }*/
  // COMBO DE CORREO ENVIADO CMAC
  /*public listaCorreocMAC(): void {
    this.ParametroRequest.codigoGrupo = "08";

    this.listaParametroService.listaParametro(this.ParametroRequest).subscribe(
      (data: ParametroResponse) => {
        if (data.codigoResultado === 0) {
          this.ListaCorreoCMAC = data.filtroParametro;
          this.ListaCorreoCMAC.unshift({
            // INICIO
            codigoParametro: "",
            nombreParametro: "TODOS",
          });
          this.correoCMACFrmCtrl.setValue("");
          this.listaEvaluacion();
        } else {
          console.error(data);
          // TO-DO
          // CUANDO NO TRAE DATA
        }
      },
      (error) => {
        console.error("Error al listar la confirmacion de Correo CMAC");
      }
    );
  }*/

  public pruebalista(): void {
    console.log("nueva funcion");
    this.listaParametroService.listaParametroEvaluacionGrilla().subscribe((data: WsResponse) => {
      console.log(data);
      if (data.audiResponse.codigoRespuesta === "0") {
        this.ListaEstadoSCG = data.data["TC_LIST_PARAM_EST_SCG_SOLBEN"];
        this.ListaEstadoSCG.unshift({
          // INICIO
          codigoExterno: "",
          nombreParametro: "TODOS",
        });
        this.estadoSCGSolFrmCtrl.setValue("");
        //this.listaTipoSCG();
      } else {
        console.error(data);
        // TO-DO
        // CUANDO NO TRAE DATA
      }

      if (data.audiResponse.codigoRespuesta === "0") {
        this.ListaTipoSCG = data.data["TC_LIST_PARAM_TIP_SCG_SOLBEN"];
        this.ListaTipoSCG.unshift({
          // INICIO
          codigoParametro: "",
          nombreParametro: "TODOS",
        });
        this.tipoSCGSolFrmCtrl.setValue("");
        //this.listaEstadoSolEvaluacion();
      } else {
        console.error(data);
        // TO-DO
        // CUANDO NO TRAE DATA
      }

      if (data.audiResponse.codigoRespuesta === "0") {
        for (let i = 0; i < data.data["TC_LIST_PARAM_EST_EVAL_CMAC"].length; i++) {
          if (data.data["TC_LIST_PARAM_EST_EVAL_CMAC"][i].codigoExterno !== null) {
            this.ListaSolEvaluacionCmac.push(data.data["TC_LIST_PARAM_EST_EVAL_CMAC"][i]);
          }
        }
        this.ListaSolEvaluacionCmac.unshift({
          // INICIO
          codigoParametro: "",
          nombreParametro: "TODOS",
        });
        this.estadoSolEvaFrmCtrl.setValue("");
        //this.listaEstadoSolEvaluacionProceso();
      } else {
        console.error(data);
        // TO-DO
        // CUANDO NO TRAE DATA
      }

      if (data.audiResponse.codigoRespuesta === "0") {
        for (let i = 0; i < data.data["TC_LIST_PARAM_EST_EVAL_CMAC"].length; i++) {
          if (data.data["TC_LIST_PARAM_EST_EVAL_CMAC"][i].codigoExterno === null) {
            this.ListaSolEvaluacionProceso.push(data.data["TC_LIST_PARAM_EST_EVAL_CMAC"][i]);
          }
        }
        this.ListaSolEvaluacionProceso.unshift({
          // INICIO
          codigoParametro: "",
          nombreParametro: "TODOS",
        });

        this.bandejaEvaFrmGrp.get("estadoSolEvaProcesoFrmCtrl").setValue(13);
        this.estadoSolEvaProcesoFrmCtrl.setValue(13);
        //this.listaCorreoLiderTumor();
      } else {
        console.error(data);
        // TO-DO
        // CUANDO NO TRAE DATA
      }

      if (data.audiResponse.codigoRespuesta === "0") {
        this.ListaCorreoLiderTumor = data.data["TC_LIST_PARAM_CORREO_LT"];
        this.ListaCorreoLiderTumor.unshift({
          // INICIO
          codigoParametro: "",
          nombreParametro: "TODOS",
        });
        this.correoLiderTumorFrmCtrl.setValue("");
        //this.listaCorreocMAC();
      } else {
        console.error(data);
        // TO-DO
        // CUANDO NO TRAE DATA
      }

      if (data.audiResponse.codigoRespuesta === "0") {
        this.ListaCorreoCMAC = data.data["TC_LIST_PARAM_CORREO_CMAC"];
        this.ListaCorreoCMAC.unshift({
          // INICIO
          codigoParametro: "",
          nombreParametro: "TODOS",
        });
        this.correoCMACFrmCtrl.setValue("");
        //this.listaEvaluacion();
      } else {
        console.error(data);
        // TO-DO
        // CUANDO NO TRAE DATA
      }

      if (data.audiResponse.codigoRespuesta === "0") {
        this.ListaEval = data.data["TC_LIST_PARAM_TIP_EVAL"];
        this.ListaEval.unshift({
          // INICIO
          codigoParametro: "",
          nombreParametro: "TODOS",
        });
        this.tipoEvaluacionFrmCtrl.setValue("");
        this.listaFiltroUsuarioRol();
      } else {
        console.error(data);
        // TO-DO
        // CUANDO NO TRAE DATA
      }
    })
  }

  // COMBO DE LISTADO DE TIPO DE EVEALUACION
  /*public listaEvaluacion(): void {
    this.ParametroRequest.codigoGrupo = "09";
    this.listaParametroService.listaParametro(this.ParametroRequest).subscribe(
      (data: ParametroResponse) => {
        if (data.codigoResultado === 0) {
          this.ListaEval = data.filtroParametro;
          this.ListaEval.unshift({
            // INICIO
            codigoParametro: "",
            nombreParametro: "TODOS",
          });
          this.tipoEvaluacionFrmCtrl.setValue("");
          this.listaFiltroUsuarioRol();
        } else {
          console.error(data);
          // TO-DO
          // CUANDO NO TRAE DATA
        }
      },
      (error) => {
        console.error("Error al listar el Tipo de Evaliacion Mac");
      }
    );
  }*/
  public listaComite(): void {
    this.ParametroRequest.codigoGrupo = "87";
    this.listaParametroService
      .listaComiteFiltro({ codigoEstado: 507 })
      .subscribe(
        (data: ParametroResponse) => {
          this.ListaComite = data.data;
          this.ListaComite.unshift({
            // INICIO
            codigoComite: "",
            descripcionComite: "TODOS",
          });
          this.itemComiteFrmCtrl.setValue("");
          this.BandejaEvaluacionList();
        },
        (error) => {
          console.error("Error al listar el Tipo de Evaliacion Mac");
        }
      );
  }

  // COMBO DE LISTA AUDITOR DE PERTENENCIA
  public listaFiltroUsuarioRol(): void {
    this.UsrRolRequest.codRol = 2;
    this.listaFiltroUsuarioRolService
      .listaFilUsrRol(this.UsrRolRequest)
      .subscribe(
        (response: UsrRolResponse) => {
          if (response.audiResponse.codigoRespuesta === "0") {
            this.userAutorizador =
              response.dataList != null ? response.dataList : [];
            this.userAutorizador.unshift({
              codUsuario: "",
              nombre: "TODOS",
            });
            this.autorizadorFrmCtrl.setValue("");
            this.listaUsuarioLiderTumor();
          } else {
            this.mensajes = response.audiResponse.mensajeRespuesta;
            this.openDialogMensaje(
              MENSAJES.ERROR_SERVICIO,
              this.mensajes,
              true,
              false,
              null
            );
          }
        },
        (error) => {
          console.error(error);
          this.mensajes =
            "Error al listar los usuarios del Rol Auditor de Pertenencia";
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

  // COMBO DE LISTA LIDER TUMOR
  public listaUsuarioLiderTumor() {
    const participanteRequest = new ParticipanteRequest();
    participanteRequest.codRol = 8;
    this.listaFiltroUsuarioRolService
      .listarUsuarioFarmacia(participanteRequest)
      .subscribe(
        (response: WsResponse) => {
          if (response.audiResponse.codigoRespuesta === "0") {
            if (response.data != null && response.data.length > 0) {
              response.data.forEach((element) => {
                this.listaLiderTumor.unshift({
                  codParticipante: element.codParticipante,
                  nombreUsuarioRol: `${element.apellidos}, ${element.nombres}`,
                });
              });

              this.listaLiderTumor.unshift({
                codParticipante: "",
                nombreUsuarioRol: "TODOS",
              });
              this.listaRolResponsable();
            } else {
              this.listaLiderTumor.unshift({
                codParticipante: "",
                nombreUsuarioRol: "TODOS",
              });
            }
            this.liderTumorFrmCtrl.setValue("");
          } else {
            this.mensajes = response.audiResponse.mensajeRespuesta;
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
          this.mensajes = "Error al listar los usuarios con rol lider tumor.";
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

  // LISTA ROL RESPONSABLE
  public listaRolResponsable(): void {
    const rolRequest = new UsrRolRequest();
    rolRequest.codAplicacion = COD_APLICACION_FC;
    this.listaFiltroUsuarioRolService.listarRoles(rolRequest).subscribe(
      (response: UsrRolResponse) => {
        if (response.audiResponse.codigoRespuesta === "0") {
          this.listaRolResp = [];
          if (response.dataList != null) {
            response.dataList.forEach((lista: ListUsrRol) => {
              switch (lista.codRol) {
                case ROLES.autoriPertenencia:
                case ROLES.coordiPertenencia:
                case ROLES.liderTumor:
                case ROLES.autorizadorCmac:
                  this.listaRolResp.unshift({
                    codRol: lista.codRol,
                    nombreRol: lista.nombreRol,
                  });
                  break;
              }
            });
          }

          this.listaRolResp.unshift({
            codRol: "",
            nombreRol: "TODOS",
          });
          this.rolRespEvaFrmCtrl.setValue("");
          this.listaComite();
        } else {
          console.error(response);
          // TO-DO
          // CUANDO NO TRAE DATA
        }
      },
      (error) => {
        console.error("Error de listar el Combo de ROL RESPONSABLE");
      }
    );
  }

  public cargarActualizarTabla(): void {
    if (this.detalleEvaluacion.length > 0) {
      this.dataSource = new MatTableDataSource(this.detalleEvaluacion);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
      this.verificarEstadoEmail();
    }
  }

  public verificarEstadoEmail() {
    clearInterval(this.validarIntervalo); //EIMINA CUALQUIER FUNCION PREVIA
    this.nroIntentos = 0;
    this.validarIntervalo = setInterval(() => {
      this.nroIntentos++;
      if (this.nroIntentos <= 9) {
        let listaPendientes = [];
        this.detalleEvaluacion.forEach((eva) => {
          if (
            Number(eva.codigoEstadoEvaluacion) ==
              ESTADOEVALUACION.estadoObservadoAutorizador &&
            !(
              Number(eva.codigoEstadoEvaluacion) ==
                ESTADOEVALUACION.estadoObservadoAutorizador &&
              eva.codigoP == PARAMETRO.liderTumorMedicoTrata
            ) &&
            eva.codigoEnvioEnvLiderTumor != 0 &&
            eva.estadoCorreoEnvLiderTumor == 0
          ) {
            listaPendientes.push(eva);
          } else {
            if (
              (Number(eva.codigoEstadoEvaluacion) ==
                ESTADOEVALUACION.estadoObservadoLiderTumor ||
                (Number(eva.codigoEstadoEvaluacion) ==
                  ESTADOEVALUACION.estadoObservadoAutorizador &&
                  eva.codigoP == PARAMETRO.liderTumorMedicoTrata)) &&
              eva.codigoEnvioEnvMac != 0 &&
              eva.estadoCorreoEnvCmac == 0
            ) {
              listaPendientes.push(eva);
            }
          }
        });

        if (listaPendientes.length > 0) {
          listaPendientes = JSON.parse(JSON.stringify(listaPendientes));
          listaPendientes.forEach((evalu) => {
            evalu.fechaCmac = null;
            evalu.fechaRegistroEvaluacion = null;
          });
          this.correoService
            .actualizarCorreosPendientesV2(listaPendientes)
            .subscribe(
              (data: WsResponse) => {
                if (data.audiResponse.codigoRespuesta === "0") {
                  data.data.forEach((element: ListaEvaluaciones) => {
                    let variable = this.detalleEvaluacion.filter(
                      (evalu) =>
                        evalu.codSolEvaluacion == element.codSolEvaluacion
                    )[0];
                    if (
                      Number(variable.codigoEstadoEvaluacion) ==
                        ESTADOEVALUACION.estadoObservadoAutorizador &&
                      !(
                        Number(variable.codigoEstadoEvaluacion) ==
                          ESTADOEVALUACION.estadoObservadoAutorizador &&
                        variable.codigoP == PARAMETRO.liderTumorMedicoTrata
                      )
                    ) {
                      variable.estadoCorreoEnvLiderTumor =
                        element.estadoCorreoEnvLiderTumor;
                    } else {
                      if (
                        Number(variable.codigoEstadoEvaluacion) ==
                          ESTADOEVALUACION.estadoObservadoLiderTumor ||
                        (Number(variable.codigoEstadoEvaluacion) ==
                          ESTADOEVALUACION.estadoObservadoAutorizador &&
                          variable.codigoP == PARAMETRO.liderTumorMedicoTrata)
                      ) {
                        variable.estadoCorreoEnvCmac =
                          element.estadoCorreoEnvCmac;
                      } else {
                      }
                    }
                  });
                } else {
                  clearInterval(this.validarIntervalo);
                }
              },
              (error) => {
                console.error(error);
                clearInterval(this.validarIntervalo);
              }
            );
        } else {
          clearInterval(this.validarIntervalo);
        }
      } else {
        clearInterval(this.validarIntervalo);
      }
    }, 20000);
  }

  public validarSCGSolben(): void {
    if (this.detalleEvaluacion.length > 0) {
      this.detalleEvaluacion.forEach((evaluacion: ListaEvaluaciones) => {
        if (this.validarEstadoFinal(evaluacion)) {
          if (this.verificarAlertSolben(evaluacion)) {
            evaluacion.alertSCGSolben = true;
          } else {
            evaluacion.alertSCGSolben = false;
          }
        } else {
          evaluacion.alertSCGSolben = false;
        }
      });
    }
  }

  public validarEstadoFinal(evaluacion: ListaEvaluaciones): boolean {
    let isEstadoFinal: boolean;

    switch (evaluacion.codigoEstadoEvaluacion) {
      case PARAMETRO.aprobadoEstado:
      case PARAMETRO.aprobadoTumorEstado:
      case PARAMETRO.aprobadoCMACEstado:
      case PARAMETRO.rechazadoEstado:
      case PARAMETRO.rechazadoTumorEstado:
      case PARAMETRO.rechazadoCMACEstado:
        isEstadoFinal = true;
        break;
      default:
        isEstadoFinal = false;
        break;
    }

    return isEstadoFinal;
  }

  public verificarAlertSolben(evaluacion: ListaEvaluaciones): boolean {
    let isAlertaSolben: boolean;

    switch (evaluacion.codigoEstadoEvaluacion) {
      case PARAMETRO.aprobadoEstado:
      case PARAMETRO.aprobadoTumorEstado:
      case PARAMETRO.aprobadoCMACEstado:
        if (
          evaluacion.estadoScgSolben !== PARAMETRO.equivalenteSCGSolbenAprobado
        ) {
          isAlertaSolben = true;
        } else {
          isAlertaSolben = false;
        }
        break;
      case PARAMETRO.rechazadoEstado:
      case PARAMETRO.rechazadoTumorEstado:
      case PARAMETRO.rechazadoCMACEstado:
        if (
          evaluacion.estadoScgSolben !== PARAMETRO.equivalenteSCGSolbenRechazado
        ) {
          isAlertaSolben = true;
        } else {
          isAlertaSolben = false;
        }
        break;
      default:
        isAlertaSolben = false;
        break;
    }

    return isAlertaSolben;
  }

  public BandejaEvaluacionList(): void {
    this.guardarFiltros();
    this.isLoading = true;
    this.dataSource = null;
    this.detalleEvaluacion = [];
    this.selection = new SelectionModel<ListaEvaluaciones>(true, []);
    this.disableBuscar = true;
    // COMO SOLO SE USA UNA VEZ, SE SETEA A 13
    this.listEvaRequest.estadoSolicitudProceso = "13";
    //this.listEvaRequest.estadoSolicitudEvaluacion = ESTADOEVALUACION.penEva.toString();

    this.bandejaEvaluacionService
      .listarDetalleSolicitud(this.listEvaRequest)
      .subscribe(
        (data: WsResponseOnco) => {
          console.log(data)
          if (
            data.audiResponse.codigoRespuesta === "0" ||
            data.audiResponse.codigoRespuesta === "1" ||
            data.audiResponse.codigoRespuesta === "2"
          ) {
            this.detalleEvaluacion = data.dataList;
            this.listEvaOldRequest = this.listEvaRequest;

            if (this.itemComiteFrmCtrl.value != "") {
              this.detalleEvaluacion = data.dataList.filter((el) => {
                return el.codComite == this.itemComiteFrmCtrl.value;
              });
            }
            this.validarSCGSolben();
            this.cargarActualizarTabla();
          } else {
            console.error(data);
            this.mensajes = MENSAJES.ERROR_NOFUNCION;
            this.openDialogMensaje(
              this.mensajes,
              data.audiResponse.mensajeRespuesta,
              true,
              false,
              null
            );
          }
          this.isLoading = false;
          this.disableBuscar = false;
        },
        (error) => {
          this.isLoading = false;
          this.disableBuscar = false;
          console.error("Error al listar las Solicitudes de Evaluacion");
          if (error.error.error === "invalid_token") {
            this.openDialogMensaje("Sesión Expirada", null, true, false, null);
            this.router.navigate(["./login"]);
          } else {
            this.openDialogMensaje(
              this.mensajes,
              "Listado de Solicitudes de Evaluación",
              true,
              false,
              null
            );
          }
        }
      );
  }

  public BusquedaEvaluacion(): void {
    this.guardarFiltros();
    this.dataSource = null;
    this.isLoading = true;
    this.detalleEvaluacion = [];
    this.selection = new SelectionModel<ListaEvaluaciones>(true, []);
    this.disableBuscar = true;

    this.bandejaEvaluacionService
      .listarDetalleSolicitud(this.listEvaRequest)
      .subscribe(
        (response: WsResponseOnco) => {
          console.log(response)
          if (
            response.audiResponse.codigoRespuesta === "0" ||
            response.audiResponse.codigoRespuesta === "1" ||
            response.audiResponse.codigoRespuesta === "2"
          ) {
            this.detalleEvaluacion = response.dataList;
            this.listEvaOldRequest = this.listEvaRequest;

            if (this.itemComiteFrmCtrl.value != "") {
              this.detalleEvaluacion = response.dataList.filter((el) => {
                return el.codComite == this.itemComiteFrmCtrl.value;
              });
            }
            this.validarSCGSolben();
            this.cargarActualizarTabla();
          } else {
            console.error(response);
            this.mensajes = MENSAJES.ERROR_NOFUNCION;
            this.openDialogMensaje(
              this.mensajes,
              response.audiResponse.mensajeRespuesta,
              true,
              false,
              null
            );
          }
          this.isLoading = false;
          this.disableBuscar = false;
        },
        (error) => {
          this.isLoading = false;
          this.disableBuscar = false;
          this.mensajes = MENSAJES.ERROR_SERVICIO;
          if (error.error.error === "invalid_token") {
            this.openDialogMensaje("Sesión Expirada", null, true, false, null);
            this.router.navigate(["./login"]);
          } else {
            this.openDialogMensaje(
              this.mensajes,
              "Listado de Solicitudes de Evaluación",
              true,
              false,
              null
            );
          }
          console.error(error);
          console.error(
            "Error al listar la busqueda de Solicitudes de Evaluacion"
          );
        }
      );
  }

  public ExportExcelEvaluacion(): void {
    if (this.dataSource === null || this.dataSource.data.length === 0) {
      this.mensajes = "No existen datos que exportar.";
      this.openDialogMensaje(
        MENSAJES.PRELIMINAR.EXCEL,
        this.mensajes,
        true,
        false,
        null
      );
      return;
    }

    this.listEvaRequest.codigoEvaluacion =
      this.listEvaOldRequest.codigoEvaluacion;
    this.listEvaRequest.codigoClinica = this.listEvaOldRequest.codigoClinica;
    this.listEvaRequest.codigoPaciente = this.listEvaOldRequest.codigoPaciente;
    this.listEvaRequest.fechaInicio = this.listEvaOldRequest.fechaInicio;
    this.listEvaRequest.fechaFin = this.listEvaOldRequest.fechaFin;
    this.listEvaRequest.numeroScgSolben =
      this.listEvaOldRequest.numeroScgSolben;
    this.listEvaRequest.estadoSolicitudEvaluacion =
      this.listEvaOldRequest.estadoSolicitudEvaluacion;
    this.listEvaRequest.tipoScgSolben = this.listEvaOldRequest.tipoScgSolben;
    this.listEvaRequest.rolResponsable = this.listEvaOldRequest.rolResponsable;
    this.listEvaRequest.estadoScgSolben =
      this.listEvaOldRequest.estadoScgSolben;
    this.listEvaRequest.correoLiderTumor =
      this.listEvaOldRequest.correoLiderTumor;
    this.listEvaRequest.numeroCartaGarantia =
      this.listEvaOldRequest.numeroCartaGarantia;
    this.listEvaRequest.correoCmac = this.listEvaOldRequest.correoCmac;
    this.listEvaRequest.autorizadorPertenencia =
      this.listEvaOldRequest.autorizadorPertenencia;
    this.listEvaRequest.tipoEvaluacion = this.listEvaOldRequest.tipoEvaluacion;
    this.listEvaRequest.liderTumor = this.listEvaOldRequest.liderTumor;
    this.listEvaRequest.reunionCmac = this.listEvaOldRequest.reunionCmac;
    this.listEvaRequest.reunionCmacAL = this.listEvaOldRequest.reunionCmacAL;

    this.disableBuscar = true;
    this.spinnerService.show();
    this.excelExportService
      .ExportExcelBandejaEva(this.listEvaRequest)
      .subscribe(
        (data: ExcelDownloadResponse) => {
          this.ExportExcelBandEvaluacion = data.url;
          const urlEvaluacion = this.ExportExcelBandEvaluacion;
          const win = window.open(urlEvaluacion);
          win.blur();
          this.disableBuscar = false;
          this.spinnerService.hide();
        },
        (error) => {
          this.disableBuscar = false;
          if (error.error.error === "invalid_token") {
            this.openDialogMensaje("Sesión Expirada", null, true, false, null);
            this.router.navigate(["./login"]);
          } else {
            this.openDialogMensaje(
              MENSAJES.ERROR_SERVICIO,
              null,
              true,
              false,
              null
            );
          }
          this.spinnerService.hide();
        }
      );
  }

  public guardarFiltros(): void {
    this.listEvaRequest.codigoEvaluacion = this.nroSolEvaFrmCtrl.value;
    this.listEvaRequest.codigoClinica = this.codigoClinica; // this.clinicaFrmCtrl.value;
    //this.listEvaRequest.codigoPaciente = this.codigoAfiliado; // this.pacienteFrmCtrl.value;
    this.listEvaRequest.fechaInicio = this.f_desdeRegSolEvaFrmCtrl.value;
    this.listEvaRequest.fechaFin = this.f_hastaRegSolEvaFrmCtrl.value;
    this.listEvaRequest.numeroScgSolben = this.nroSCGSolFrmCtrl.value;
    this.listEvaRequest.estadoSolicitudProceso = this.bandejaEvaFrmGrp.get(
      "estadoSolEvaProcesoFrmCtrl"
    ).value;

    this.listEvaRequest.estadoSolicitudEvaluacion =
      this.estadoSolEvaFrmCtrl.value;
    this.listEvaRequest.tipoScgSolben = this.tipoSCGSolFrmCtrl.value;
    this.listEvaRequest.rolResponsable = this.rolRespEvaFrmCtrl.value;
    this.listEvaRequest.estadoScgSolben = this.estadoSCGSolFrmCtrl.value;
    this.listEvaRequest.correoLiderTumor = this.correoLiderTumorFrmCtrl.value;
    this.listEvaRequest.numeroCartaGarantia = this.nCartaGarantiaFrmCtrl.value;
    this.listEvaRequest.correoCmac = this.correoCMACFrmCtrl.value;
    this.listEvaRequest.autorizadorPertenencia = this.autorizadorFrmCtrl.value;
    this.listEvaRequest.tipoEvaluacion = this.tipoEvaluacionFrmCtrl.value;
    this.listEvaRequest.liderTumor = this.liderTumorFrmCtrl.value;
    this.listEvaRequest.reunionCmac = this.fechaReuCmacFrmCtrl.value;
    this.listEvaRequest.reunionCmacAL = this.fechaReuCmacAlFrmCtrl.value;
    this.listEvaRequest.codSolPre = this.codSolPreFrmCtrl.value;

    //code by luis
    this.listEvaRequest.tipoDoc = this.tipoDoc;
    this.listEvaRequest.nroDoc = this.numDoc;
    this.listEvaRequest.nombre1 = this.nombre1;
    this.listEvaRequest.nombre2 = this.nombre2;
    this.listEvaRequest.apePaterno = this.apePaterno;
    this.listEvaRequest.apeMaterno = this.apeMaterno;
    //
  }

  public verDetalleSolicitud(rowEvaluacion: ListaEvaluaciones) {
    //servicio
    localStorage.setItem("codigoPaciente", rowEvaluacion.codigoPaciente);
    let codSolEva = rowEvaluacion.codSolEvaluacion;
    var json = {
      codSolEva: codSolEva,
      tipo: "ENTRANDO",
      codUsuario: this.userService.getCodUsuario,
      nombreUsuario: this.userService.getNombres,
      apePaternoUsuario: this.userService.getApelPaterno,
      apeMaternoUsuario: this.userService.getApelMaterno,
    };
    this.bandejaEvaluacionService.consultarBanderaEvaluacion(json).subscribe(
      (data) => {
        // this.openDialogMensaje("Se Actualizo Correctamente", null, true, false, null);

        // descomentar luego xd

        if (data["codResultado"] == -1) {
          this.mensaje = data["msgResultado"];
          this.openDialogMensaje(this.mensaje, null, true, false, null);
          return false;
        } else {
          this.capturarVariableLocal(rowEvaluacion);
          this.router.navigate(["/app/detalle-evaluacion"]);
        }
      },
      (error) => {
        console.error(error);
        this.mensaje = "ERROR CON EL SERVICIO BANDEJA EVALUACION.";
        this.openDialogMensaje(this.mensaje, null, true, false, null);
        this.spinnerService.hide();
      }
    );
  }

  public verSeguimientoSolicitud(rowEvaluacion: ListaEvaluaciones) {
    this.capturarVariableLocal(rowEvaluacion);
    this.router.navigate(["/app/seguimiento-evaluacion"]);
  }

  public capturarVariableLocal(rowEvaluacion: ListaEvaluaciones): void {
    this.solicitud.codSolEvaluacion = Number(rowEvaluacion.codSolEvaluacion);
    this.solicitud.codMac = Number(rowEvaluacion.codMac);
    this.solicitud.descMAC = rowEvaluacion.descripcionCmac;
    this.solicitud.nombreRolResponsablePenEva =
      rowEvaluacion.rolResponsableEvaluacion;
    this.solicitud.descEstadoEvaluacion = rowEvaluacion.estadoEvaluacion;

    this.solicitud.numeroSolEvaluacion = rowEvaluacion.numeroSolEvaluacion;
    this.solicitud.estadoEvaluacion = Number(
      rowEvaluacion.codigoEstadoEvaluacion
    );
    this.solicitud.flagLiderTumor = rowEvaluacion.codigoP;
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataSource.data.forEach((row) => this.selection.select(row));
  }

  public verificarEstadosSolicitudesCMAC(): boolean {
    let valido = true;

    let noCtaFechaCMAC = false;
    let noValSolicitud = false;

    this.mensajes = null;
    this.mensajes2 = null;

    if (this.selection.selected.length === 0) {
      this.mensajes = MENSAJES.CMAC.ERROR_SELEC_SOLIC;
      this.valores = null;
      valido = false;
      return valido;
    }
    this.valores = "";

    let valoresFecha = "";

    this.selection.selected.forEach((solicitud: ListaEvaluaciones) => {
      if (solicitud.aplCana == 0 || solicitud.insCana == 35 || solicitud.estadoPrograCmac == 1) {
        this.valores = this.valores + solicitud.numeroSolEvaluacion + ", ";
        noValSolicitud = true;
      }
    });

    if (noValSolicitud && noCtaFechaCMAC) {
      this.mensajes = `${MENSAJES.CMAC.ERROR_VALID_SOLIC} y ${MENSAJES.CMAC.ERROR_FECHA_SOLIC}`;
      valoresFecha = valoresFecha.substring(0, valoresFecha.length - 2);
      this.valores = this.valores.substring(0, this.valores.length - 2);
      this.valores = `${this.valores} y ${valoresFecha}`;
      valido = false;
    } else if (noValSolicitud) {
      this.mensajes = MENSAJES.CMAC.ERROR_VALID_SOLIC;
      this.valores = this.valores.substring(0, this.valores.length - 2);
      valido = false;
    } else if (noCtaFechaCMAC) {
      this.mensajes = MENSAJES.CMAC.ERROR_FECHA_SOLIC;
      this.valores = valoresFecha.substring(0, valoresFecha.length - 2);
      valido = false;
    }

    return valido;
  }

  public openDiaProgramaCMAC($event: Event): void {
    $event.preventDefault();
    if (this.verificarEstadosSolicitudesCMAC()) {
      const dialogProgCmac = this.dialog.open(ProgramaCmacComponent, {
        width: "850px",
        disableClose: true,
        data: {
          title: `PROGRAMAR EVALUACIÓN COMITE ${this.nombComite}`,
          listaEvaluaciones: this.detalleEvaluacion,
          listaSeleccionadas: this.selection.selected,
        },
      });

      dialogProgCmac.afterClosed().subscribe((result) => {
        this.selection = new SelectionModel<ListaEvaluaciones>(true, []);
        this.BusquedaEvaluacion();
      });
    } else {
      this.openDialogMensaje(
        this.mensajes,
        this.mensajes2,
        true,
        false,
        this.valores
      );
    }
  }

  public openDiaRegistrarEvalCMAC($event): void {
    $event.preventDefault();
    const dialogEvaCmac = this.dialog.open(EvaluacionCmacComponent, {
      disableClose: true,
      width: "850px",
      data: {
        title: "REGISTRAR RESULTADO EVALUACIÓN COMITE",
      },
    });
    dialogEvaCmac.afterClosed().subscribe((result) => {
      this.BusquedaEvaluacion();
    });
  }

  // POP-UP MENSAJES
  public openDialogMensaje(
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
        title: MENSAJES.EVALUACION.TITLE,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        // RESULTADO CONFIRMACION
      } else {
      }
    });
  }

  public openDialogMensajeEmail(
    message: string,
    message2: string,
    alerta: boolean,
    confirmacion: boolean,
    valor: any
  ): void {
    const dialogRef = this.dialog.open(MessageComponent, {
      width: "500px",
      disableClose: true,
      data: {
        title: MENSAJES.EVALUACION.TITLE,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.BusquedaEvaluacion();
    });
  }

  // POPPUP PACIENTE
  public abrirBuscarPaciente(): void {
    const dialogRef = this.dialog.open(BuscarPacienteComponent, {
      width: "640px",
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result: Paciente) => {
      if (result !== null) {
        const nombre2 = result.nombr2 != null ? result.nombr2 : "";
        const nombreCom = `${result.apepat} ${result.apemat}, ${result.nombr1} ${nombre2}`;
        this.pacienteFrmCtrl.setValue(nombreCom);
        this.listEvaRequest.codigoPaciente = null;
        this.codigoAfiliado = result.codafir;
        this.tipoDoc = result.tipdoc;
        this.numDoc = result.numdoc;
        this.nombre1 = result.nombr1;
        this.nombre2 = result.nombr2;
        this.apePaterno = result.apepat;
        this.apeMaterno = result.apemat;
        this.BusquedaEvaluacion();
      } else {
        this.pacienteFrmCtrl.setValue(null);
        this.codigoAfiliado = null;
        this.listEvaRequest.codigoPaciente = null;
      }
    });
  }

  // POPPUP CLINICA
  public abrirBuscarClinica(): void {
    const dialogRef = this.dialog.open(BuscarClinicaComponent, {
      width: "640px",
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result: Clinica) => {
      if (result !== null) {
        this.clinicaFrmCtrl.setValue(result.nomcli);
        this.codigoClinica = result.codcli;
      } else {
        this.clinicaFrmCtrl.setValue(null);
      }
    });
  }

  public limpiarControl($event: Event, tipo: string, codigo: string) {
    this.bandejaEvaFrmGrp.get(tipo).setValue(null);
    this.tipoDoc = null;
    this.numDoc = null;
    this.nombre1 = null;
    this.nombre2 = null;
    this.apePaterno = null;
    this.apeMaterno = null;
    this[codigo] = null;
  }

  public validarFechaInicio() {
    const dateInicio = this.f_desdeRegSolEvaFrmCtrl.value;
    const dateFin = this.f_hastaRegSolEvaFrmCtrl.value;
    const dateActual = new Date();
    if (this.f_hastaRegSolEvaFrmCtrl.value !== null) {
      if (dateInicio > dateFin) {
        this.openDialogMensaje(
          "Fecha inicial debe ser menor que la fecha final",
          null,
          true,
          false,
          null
        );
        this.f_desdeRegSolEvaFrmCtrl.setValue(null);
      } else if (dateInicio === dateFin) {
        this.openDialogMensaje(
          "Fecha inicial debe ser distinta a la fecha final",
          null,
          true,
          false,
          null
        );
        this.f_desdeRegSolEvaFrmCtrl.setValue(null);
      } else if (dateInicio > dateActual) {
        this.openDialogMensaje(
          "Fecha no debe de ser mayor al actual",
          null,
          true,
          false,
          null
        );
        this.f_desdeRegSolEvaFrmCtrl.setValue(null);
      }
    }
  }

  public validarFechaFin() {
    const dateInicio = this.f_desdeRegSolEvaFrmCtrl.value;
    const dateFin = this.f_hastaRegSolEvaFrmCtrl.value;
    const dateActual = new Date();
    if (this.f_desdeRegSolEvaFrmCtrl.value !== null) {
      if (dateInicio > dateFin) {
        this.openDialogMensaje(
          "Fecha final debe ser mayor a la fecha inicial",
          null,
          true,
          false,
          null
        );
        this.f_hastaRegSolEvaFrmCtrl.setValue(null);
      } else if (dateInicio === dateFin) {
        this.openDialogMensaje(
          "Fecha final debe ser distinta a la fecha inicial",
          null,
          true,
          false,
          null
        );
        this.f_hastaRegSolEvaFrmCtrl.setValue(null);
      } else if (dateFin > dateActual) {
        this.openDialogMensaje(
          "Fecha no debe de ser mayor al actual",
          null,
          true,
          false,
          null
        );
        this.f_hastaRegSolEvaFrmCtrl.setValue(null);
      }
    }
  }

  public enviarCorreosPendientes($event: Event) {
    $event.preventDefault();
    this.spinnerService.show();
    let listaEvaCorreos = JSON.parse(JSON.stringify(this.selection.selected));
    if (listaEvaCorreos.length > 0) {
      listaEvaCorreos.forEach((elem) => {
        elem.fechaCmac = null;
        elem.fechaRegistroEvaluacion = null;
      });

      this.correoService.reenviarCorreos(listaEvaCorreos).subscribe(
        (data: WsResponse) => {
          if (data.audiResponse.codigoRespuesta === "0") {
            let allMsg = "";
            data.data.forEach((msg) => {
              allMsg += msg + "\n";
            });

            this.openDialogMensajeEmail(
              "Detalle de reenvio de correos",
              allMsg,
              true,
              false,
              null
            );
            this.spinnerService.hide();
          } else {
            this.openDialogMensajeEmail(
              "Ocurrio un error al procesar las solicitudes",
              null,
              true,
              false,
              null
            );
            this.spinnerService.hide();
          }
        },
        (error) => {
          this.openDialogMensaje(
            "Ocurrio un error al procesar las solicitudes",
            null,
            true,
            false,
            null
          );
          console.error(error);
          this.spinnerService.hide();
        }
      );
    } else {
      this.openDialogMensaje(
        "Por favor, seleccione Solicitudes de la lista",
        null,
        true,
        false,
        null
      );
      this.spinnerService.hide();
    }
  }

  public actualizarCorreosPendientes($event: Event) {
    //TO-DELETE(ALL-FUNCTIONS)
    $event.preventDefault();
    this.spinnerService.show();
    if (this.selection.selected.length > 0) {
      this.selection.selected.forEach((elem) => {
        elem.fechaCmac = null;
        elem.fechaRegistroEvaluacion = null;
      });

      this.correoService
        .actualizarCorreosPendientes(this.selection.selected)
        .subscribe(
          (data: WsResponse) => {
            if (data.audiResponse.codigoRespuesta === "0") {
              let allMsg = "";
              data.data.forEach((msg) => {
                allMsg += msg + "\n";
              });
              this.openDialogMensajeEmail(
                "Detalle de estado de correos",
                allMsg,
                true,
                false,
                null
              );
              this.spinnerService.hide();
            } else {
              this.openDialogMensajeEmail(
                "Ocurrio un error al procesar las solicitudes",
                null,
                true,
                false,
                null
              );
              this.spinnerService.hide();
            }
          },
          (error) => {
            this.openDialogMensaje(
              "Ocurrio un error al procesar las solicitudes",
              null,
              true,
              false,
              null
            );
            console.error(error);
            this.spinnerService.hide();
          }
        );
    } else {
      this.openDialogMensaje(
        "Por favor, seleccione Solicitudes de la lista",
        null,
        true,
        false,
        null
      );
      this.spinnerService.hide();
    }
  }

  public accesoOpcionMenu() {
    const data = require("src/assets/data/permisosRecursos.json");
    const bandejaEvaluacion = data.bandejaEvaluacion.busqueda;
    this.opcionMenu = JSON.parse(localStorage.getItem("opcionMenu"));

    if (this.opcionMenu.opcion.length > 0) {
      this.opcionMenu.opcion.forEach((element) => {
        const codOpcion = element.codOpcion;
        switch (codOpcion) {
          case bandejaEvaluacion.txtSolicitudEvaluacion:
            this.txtSolicitudEvaluacion = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtCodSolPre:
            this.txtCodSolPre = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtPaciente:
            this.txtPaciente = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtNroScgSolben:
            this.txtNroScgSolben = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.cmbTipoScgSolben:
            this.cmbTipoScgSolben = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.cmbEstadoScgSolben:
            this.cmbEstadoScgSolben = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtNroCartaGarantia:
            this.txtNroCartaGarantia = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.cmbAutorizadorPertinencia:
            this.cmbAutorizadorPertinencia = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.cmbLiderTumor:
            this.cmbLiderTumor = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtClinica:
            this.txtClinica = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtFecRegEvalIni:
            this.txtFecRegEvalIni = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtFecRegEvalFin:
            this.txtFecRegEvalFin = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.cmbEstadoEvaluacion:
            this.cmbEstadoEvaluacion = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.cmbRolResponsable:
            this.cmbRolResponsable = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.cmbCorreoLiderTumor:
            this.cmbCorreoLiderTumor = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.cmbCorreoMac:
            this.cmbCorreoMac = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.cmbTipoEvaluacion:
            this.cmbTipoEvaluacion = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtFecCmac:
            this.txtFecCmac = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnBuscar:
            this.btnBuscar = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnExportarExcel:
            this.btnExportarExcel = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnProgramarCmac:
            this.btnProgramarCmac = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnRegistrarCmac:
            this.btnRegistrarCmac = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnCorreoPendiente:
            this.btnCorreoPendiente = Number(element.flagAsignacion);
            break;
        }
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

  public generarReporteAutorizador(el): void {
    this.archivoRqt = new ArchivoFTP();
    this.archivoRqt.codArchivo = el.codInformeAuto;
    this.archivoRqt.ruta = FILEFTP.rutaEvaluacionRequisitos;

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
          this.mensaje = "NO SE ENCUENTRA INFORME CARGADO"; //response.audiResponse.mensajeRespuesta;
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

  public subirArchivoFTP(archivo: ArchivoFTP) {
    const archivoRequest = new ArchivoRequest();

    archivoRequest.archivo = archivo.archivoFile;
    archivoRequest.nomArchivo = archivo.nomArchivo;
    archivoRequest.ruta = FILEFTP.rutaInformeAutorizador;

    this.coreService.subirArchivo(archivoRequest).subscribe(
      (response: WsResponse) => {
        if (response.audiResponse.codigoRespuesta === "0") {
          const codigoArchInformeEvaluador = response.data.codArchivo;
          this.mensaje +=
            "\n*El informe del autorizador fue subido correctamente";
          this.actualizarSolicitudEvaluacion(response.data);
        } else {
          this.spinnerService.hide();
          this.mensaje = response.audiResponse.mensajeRespuesta;
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
        this.spinnerService.hide();
        console.error(error);
        const mensaje = MENSAJES.ERROR_SERVICIO;
        this.openDialogMensaje(
          mensaje,
          "Error al subir el archivo.",
          true,
          false,
          null
        );
      }
    );
  }

  public actualizarSolicitudEvaluacion(archivo: ArchivoFTP) {
    const solEvaRequest = new SolicitudEvaluacionRequest();
    // solEvaRequest.codSolicitudEvaluacion = this.solicitud.codSolEvaluacion;
    // solEvaRequest.codInformeAutorizador = archivo.codArchivo;
    // this.detalleSolicitudEvaluacionService.actualizarEvaluacionInformeAutorizador(solEvaRequest).subscribe(
    //   (response: WsResponse) => {
    //     if (response.audiResponse.codigoRespuesta === '0') {
    //       this.mensaje += '\n*El código de archivo fue actualizado';
    //       this.enviarCorreoLiderTumor(this.chkLstPacPreInsRequest);
    //     } else {
    //       this.mensaje = response.audiResponse.mensajeRespuesta;
    //       this.openDialogMensaje(MENSAJES.ERROR_NOFUNCION, this.mensaje, true, false, null);
    //       this.spinnerService.hide();
    //     }
    //   }, error => {
    //     console.error(error);
    //     const mensaje = MENSAJES.ERROR_SERVICIO;
    //     this.openDialogMensaje(mensaje, 'Error al subir el archivo.', true, false, null);
    //     this.spinnerService.hide();
    //   }
    // );
  }
}
