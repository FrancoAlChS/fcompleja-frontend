import { DatePipe } from "@angular/common";
import {
  AfterViewInit,
  Component,
  Inject,
  OnInit,
  ViewChild,
  forwardRef,
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
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { merge, of as observableOf } from "rxjs";
import { catchError, map, share, startWith, switchMap } from "rxjs/operators";
import { MessageComponent } from "src/app/core/message/message.component";
import { MatPaginatorIntlEspanol } from "src/app/directives/matpaginator-translate";
import { Clinica } from "src/app/dto/Clinica";
import { DetallePreeliminar } from "src/app/dto/DetallePreeliminar";
import { Paciente } from "src/app/dto/Paciente";
import { Parametro } from "src/app/dto/Parametro";
import { WsResponseOnco } from "src/app/dto/WsResponseOnco";
import { BOpcionMenuLocalStorage } from "src/app/dto/core/BOpcionMenuLocalStorage";
import { PreliminarService } from "src/app/dto/service/preliminar.service";
import { BuscarClinicaComponent } from "src/app/modal/buscar-clinica/buscar-clinica.component";
import { BuscarPacienteComponent } from "src/app/modal/buscar-paciente/buscar-paciente.component";
import {
  ACCESO,
  ESTADOPRELIMINAR,
  MENSAJES,
  MY_FORMATS_AUNA,
} from "../../common";
import { ExcelDownloadResponse } from "../../dto/ExcelDownloadResponse";
import { ListUsrRol } from "../../dto/ListUsrRol";
import { ParametroRequest } from "../../dto/ParametroRequest";
import { ParametroResponse } from "../../dto/ParametroResponse";
import { UsrRolRequest } from "../../dto/UsrRolRequest";
import { UsrRolResponse } from "../../dto/UsrRolResponse";
import { UsuariosSolben } from "../../dto/UsuariosSolben";
import { ListaSolicitudesRequest } from "../../dto/bandeja-preliminar/ListaSolicitudesRequest";
import { UsuarioService } from "../../dto/service/usuario.service";
import { BandejaPreliminarService } from "../../service/BandejaPreliminar/bandeja-preliminar.service";
import { ListaFiltroUsuarioRolservice } from "../../service/Lista.usuario.rol.service";
import { ExcelExportService } from "../../service/excel.bandeja.pre.service";
import { ListaParametroservice } from "../../service/lista.parametro.service";

@Component({
  selector: "app-bandeja-preliminar",
  templateUrl: "./bandeja-preliminar.component.html",
  styleUrls: ["./bandeja-preliminar.component.scss"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS_AUNA },
    {
      provide: MatPaginatorIntl,
      useClass: forwardRef(() => MatPaginatorIntlEspanol),
    },
  ],
})
export class BandejaPreliminarComponent implements AfterViewInit, OnInit {
  usuarioSolben: ListUsrRol[] = [];
  solben: UsuariosSolben[] = [];

  autorizador = null;

  mensaje: string;
  limpiarPcte: boolean;
  limpiarClin: boolean;
  maxDate: Date;
  disableBuscar: boolean;

  //code by luis
  tipoDoc: string;
  numDoc: string;
  nombre1: string;
  nombre2: string;
  apePaterno: string;
  apeMaterno: string;
  //

  // Tabla
  dataSource: MatTableDataSource<DetallePreeliminar>;
  listaDetallePreliminar: DetallePreeliminar[] = [];
  isLoading: boolean;
  displayedColumns: string[];
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  // @ViewChild('paginator') paginator: MatPaginator;

  preliminarFrmGrp: FormGroup;
  // ABREVIATURA DE LA COLUMNA DE LA GRILLA DE SOLICITUD PRELIMINAR
  columnsGrilla = [
    {
      codAcceso: ACCESO.nroSolPreCol,
      columnDef: "codPre",
      header: "N° SOLICITUD PRELIMINAR",
      cell: (preliminar: DetallePreeliminar) => `${preliminar.numeroCodPre}`,
    },
    {
      codAcceso: ACCESO.fecRegPreCol,
      columnDef: "fechaPre",
      header: "FECHA REGISTRO SOLICITUD PRELIMINAR",
      cell: (preliminar: DetallePreeliminar) =>
        this.datePipe.transform(preliminar.fechaPre, "dd/MM/yyyy"),
    },
    {
      codAcceso: ACCESO.horRegPreCol,
      columnDef: "horaPre",
      header: "HORA REGISTRO SOLICITUD PRELIMINAR",
      cell: (preliminar: DetallePreeliminar) =>
        preliminar.horaPre !== null ? `${preliminar.horaPre}` : "",
    },
    {
      codAcceso: ACCESO.clinicaCol,
      columnDef: "descClinica",
      header: "CLÍNICA",
      cell: (preliminar: DetallePreeliminar) =>
        preliminar.descClinica !== ""
          ? `${preliminar.descClinica}`
          : "[NO DISPONIBLE]",
    },
    {
      codAcceso: ACCESO.pacienteCol,
      columnDef: "nombrePaciente",
      header: "PACIENTE",
      cell: (preliminar: DetallePreeliminar) =>
        preliminar.nombrePaciente !== ""
          ? `${preliminar.nombrePaciente}`
          : "[NO DISPONIBLE]",
    },
    {
      codAcceso: ACCESO.nroScgSolbenCol,
      columnDef: "codScgSolben",
      header: "N° SCG SOLBEN",
      cell: (preliminar: DetallePreeliminar) =>
        preliminar.codScgSolben !== null ? `${preliminar.codScgSolben}` : "",
    },
    {
      codAcceso: ACCESO.fecScgSolbenCol,
      columnDef: "fechaScgSolben",
      header: "FECHA REGISTRO SCG SOLBEN",
      cell: (preliminar: DetallePreeliminar) =>
        this.datePipe.transform(preliminar.fechaScgSolben, "dd/MM/yyyy"),
    },
    {
      codAcceso: ACCESO.horScgSolbenCol,
      columnDef: "horaScgSolben",
      header: "HORA REGISTRO SCG SOLBEN",
      cell: (preliminar: DetallePreeliminar) => `${preliminar.horaScgSolben}`,
    },
    {
      codAcceso: ACCESO.tipScgSolbenCol,
      columnDef: "tipoScgSolben",
      header: "TIPO SCG SOLBEN",
      cell: (preliminar: DetallePreeliminar) => `${preliminar.tipoScgSolben}`,
    },
    {
      codAcceso: ACCESO.estadoSolPreCol,
      columnDef: "estadoSol",
      header: "ESTADO SOLICITUD PRELIMINAR",
      cell: (preliminar: DetallePreeliminar) => `${preliminar.estadoSol}`,
    },
    {
      codAcceso: ACCESO.autorizPertenCol,
      columnDef: "medicoTratante",
      header: "AUTORIZADOR DE PERTENENCIA",
      cell: (preliminar: DetallePreeliminar) => `${preliminar.medicoTratante}`,
    },
  ];

  constructor(
    public dialog: MatDialog,
    private adapter: DateAdapter<any>,
    private router: Router,
    private sanitizer: DomSanitizer,
    private bandejaSolicitudesService: BandejaPreliminarService,
    private listaFiltroUsuarioRolservice: ListaFiltroUsuarioRolservice,
    private listaParametroservice: ListaParametroservice,
    private excelExportService: ExcelExportService,
    private iconRegistry: MatIconRegistry,
    private datePipe: DatePipe,
    private spinnerService: Ng4LoadingSpinnerService,
    @Inject(UsuarioService) private userService: UsuarioService,
    @Inject(PreliminarService) private preliminar: PreliminarService
  ) {
    this.adapter.setLocale("es-PE");

    // this.listaDetallesSolicitudes();
    this.iconRegistry.addSvgIcon(
      "excel-icon",
      this.sanitizer.bypassSecurityTrustResourceUrl(
        "./assets/img/icon-excel-2.svg"
      )
    );
  }

  title = "Bandeja de Solicitudes - Farmacia Compleja";

  listaTipoScg: any[] = [];
  listaSolicitudes: any[] = [];
  filtrosSolicitudRequest: ListaSolicitudesRequest;
  filtrosSolicitudesOldRequest: ListaSolicitudesRequest;

  // autorizador de pertenencia
  usrRolRequest: UsrRolRequest = new UsrRolRequest();
  UsrRolResponse: UsrRolResponse = new UsrRolResponse();
  cmbUsrRol: any[];

  // Lista Estado SCG
  ParametroRequest: ParametroRequest = new ParametroRequest();
  ParametroResponse: ParametroResponse = new ParametroResponse();
  cmbTipoSCG: Parametro[];
  cmbEstadoPreliminar: Parametro[];
  codigoAfiliado: string;
  codigoClinica: string;

  // LISTA EXCEL
  exportExcelPreliminar: string;

  // DECLARAR VARIABLES OPCIONMENU ACCESO
  opcionMenu: BOpcionMenuLocalStorage;
  valorMostrarOpcion = ACCESO.mostrarOpcion;
  solicitudPrelimTxt: number;
  pacienteTxt: number;
  tipoScgSolbenCmb: number;
  nroScgSolbenTxt: number;
  clinicaTxt: number;
  estadoSolicPrelimCmb: number;
  autorizadorPertCmb: number;
  fecRegPrelimIniTxt: number;
  fecRegPrelimFinTxt: number;
  buscarPrelimBtn: number;
  exportarExcelBtn: number;
  nroSolPreCol: number;
  fecRegPreCol: number;
  horRegPreCol: number;
  clinicaCol: number;
  pacienteCol: number;
  nroScgSolbenCol: number;
  fecScgSolbenCol: number;
  horScgSolbenCol: number;
  tipScgSolbenCol: number;
  estadoSolPreCol: number;
  autorizPertenCol: number;
  botonDetalleCol: number;

  // PAGINACION
  totalResultadoBandeja: number = 0;
  pageSize: number = 10;
  skip: number = 0;
  pageIndex: number = 0;

  public crearFormularios(): void {
    this.preliminarFrmGrp = new FormGroup({
      nroSolPreFrmCtrl: new FormControl(
        null,
        Validators.compose([Validators.pattern("/W|_/g")])
      ),
      pacienteFrmCtrl: new FormControl(
        null,
        Validators.compose([Validators.pattern("/W|_/g")])
      ),
      tipSCGSolFrmCtrl: new FormControl(
        null,
        Validators.compose([Validators.pattern("/W|_/g")])
      ),
      nroSCGSolFrmCtrl: new FormControl(
        null,
        Validators.compose([Validators.pattern("/W|_/g")])
      ),
      clinicaFrmCtrl: new FormControl(
        null,
        Validators.compose([Validators.pattern("/W|_/g")])
      ),
      estadoPreFrmCtrl: new FormControl(
        null,
        Validators.compose([Validators.pattern("/W|_/g")])
      ),
      fechaRegDesdeFrmCtrl: new FormControl(
        null,
        Validators.compose([Validators.pattern("/W|_/g")])
      ),
      fechaRegHastaFrmCtrl: new FormControl(
        null,
        Validators.compose([Validators.pattern("/W|_/g")])
      ),
      autorizadorFrmCtrl: new FormControl(
        null,
        Validators.compose([Validators.pattern("/W|_/g")])
      ),
    });
  }

  get nroSolPreFrmCtrl() {
    return this.preliminarFrmGrp.get("nroSolPreFrmCtrl");
  }
  get pacienteFrmCtrl() {
    return this.preliminarFrmGrp.get("pacienteFrmCtrl");
  }
  get tipSCGSolFrmCtrl() {
    return this.preliminarFrmGrp.get("tipSCGSolFrmCtrl");
  }
  get nroSCGSolFrmCtrl() {
    return this.preliminarFrmGrp.get("nroSCGSolFrmCtrl");
  }
  get clinicaFrmCtrl() {
    return this.preliminarFrmGrp.get("clinicaFrmCtrl");
  }
  get estadoPreFrmCtrl() {
    return this.preliminarFrmGrp.get("estadoPreFrmCtrl");
  }
  get fechaRegDesdeFrmCtrl() {
    return this.preliminarFrmGrp.get("fechaRegDesdeFrmCtrl");
  }
  get fechaRegHastaFrmCtrl() {
    return this.preliminarFrmGrp.get("fechaRegHastaFrmCtrl");
  }
  get autorizadorFrmCtrl() {
    return this.preliminarFrmGrp.get("autorizadorFrmCtrl");
  }

  ngAfterViewInit(): void {
    //this.actualizarTablaBandejaPrelim();
    setTimeout(() => {
      if (this.dataSource == null) {
        this.dataSource = new MatTableDataSource([]);
      }
      //this.listaDetallesSolicitudes();
    });
  }

  ngOnInit() {
    this.isLoading = false;
    this.accesoOpcionMenu();
    this.crearFormularios();
    this.inicializarVariables();
    this.crearTablaPreliminar();
    this.listaTipoS();
    setTimeout(() => {
      this.actualizarTablaBandejaPrelim();
    });
  }

  public inicializarVariables(): void {
    this.cmbEstadoPreliminar = [];
    this.cmbTipoSCG = [];
    this.cmbUsrRol = [];
    this.tipSCGSolFrmCtrl.setValue("");
    this.estadoPreFrmCtrl.setValue(ESTADOPRELIMINAR.estadoPendiente);
    this.autorizadorFrmCtrl.setValue("");
    this.maxDate = new Date();
    this.pageSize = 10;
  }

  public crearTablaPreliminar(): void {
    this.displayedColumns = [];

    this.columnsGrilla.forEach((c) => {
      this.opcionMenu.opcion.forEach((element) => {
        if (
          c.codAcceso &&
          c.codAcceso === element.codOpcion &&
          Number(element.flagAsignacion) === ACCESO.mostrarOpcion
        ) {
          this.displayedColumns.push(c.columnDef);
        }
      });
    });
    this.opcionMenu.opcion.forEach((element) => {
      if (element.codOpcion === ACCESO.botonVerDetalleCol) {
        this.displayedColumns.push("verDetalle");
      }
    });
    this.dataSource = new MatTableDataSource([]);
  }

  public listaTipoS(): void {
    this.ParametroRequest.codigoGrupo = "01";

    this.listaParametroservice.listaParametro(this.ParametroRequest).subscribe(
      (data: ParametroResponse) => {
        if (data != null || data.codigoResultado != null) {
          if (data.codigoResultado === 0) {
            this.cmbTipoSCG =
              data.filtroParametro !== null ? data.filtroParametro : null;
            this.cmbTipoSCG.unshift({
              codigoParametro: "",
              nombreParametro: "TODOS",
              valor1Parametro: "",
              codigoExterno: null,
            });
            this.listaEstadoPree();
          } else {
            this.openDialogMensaje(
              MENSAJES.ERROR_NOFUNCION,
              data.mensageResultado,
              true,
              false,
              null
            );
          }
        } else {
          this.openDialogMensaje(
            MENSAJES.ERROR_NOFUNCION,
            "Error con el Servicio",
            true,
            false,
            data.codigoResultado
          );
        }
      },
      (error) => {
        console.error("Error al listar el Tipo de SCG SOLBEN");
        this.mensaje = MENSAJES.ERROR_SERVICIO;
        this.openDialogMensaje(
          this.mensaje,
          "Error al listar el Tipo de SCG SOLBEN",
          true,
          false,
          null
        );
        console.error(error);
      }
    );
  }

  public listaEstadoPree(): void {
    this.ParametroRequest.codigoGrupo = "02";

    this.listaParametroservice.listaParametro(this.ParametroRequest).subscribe(
      (data: ParametroResponse) => {
        if (data != null || data.codigoResultado != null) {
          if (data.codigoResultado === 0) {
            this.cmbEstadoPreliminar =
              data.filtroParametro !== null ? data.filtroParametro : null;
            this.cmbEstadoPreliminar.unshift({
              codigoParametro: "",
              nombreParametro: "TODOS",
              valor1Parametro: "",
              codigoExterno: null,
            });
            this.listaAuditor();
          } else {
            this.openDialogMensaje(
              MENSAJES.ERROR_NOFUNCION,
              data.mensageResultado,
              true,
              false,
              null
            );
          }
        } else {
          this.openDialogMensaje(
            MENSAJES.ERROR_NOFUNCION,
            "Error con el Servicio",
            true,
            false,
            data.codigoResultado
          );
        }
      },
      (error) => {
        console.error("Error al listar el Estado de la Solicitud Preliminar");
        this.mensaje = MENSAJES.ERROR_SERVICIO;
        this.openDialogMensaje(
          this.mensaje,
          "Error al listar el Estado de la Solicitud Preliminar",
          true,
          false,
          null
        );
        console.error(error);
      }
    );
  }

  // AFLORES LISTA AUDITOR DE PERTENENCIA
  public listaAuditor(): void {
    this.usrRolRequest.codRol = 2;
    this.listaFiltroUsuarioRolservice
      .listaFilUsrRol(this.usrRolRequest)
      .subscribe(
        (response: UsrRolResponse) => {
          if (response.audiResponse.codigoRespuesta === "0") {
            this.cmbUsrRol =
              response.dataList !== null ? response.dataList : [];
            this.cmbUsrRol.unshift({
              codUsuario: "",
              nombre: "TODOS",
            });
            this.listaDetallesSolicitudes();
          } else {
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
          console.error(error);
          this.mensaje =
            "Error al listar el Usuario del Rol Auditor de Pertenencia";
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            this.mensaje,
            true,
            false,
            null
          );
        }
      );
  }

  public guardarFiltrosBusqueda(): void {
    this.filtrosSolicitudRequest = new ListaSolicitudesRequest();
    this.filtrosSolicitudRequest.codigoPreliminar = this.nroSolPreFrmCtrl.value;
    //this.filtrosSolicitudRequest.codigoPaciente = this.codigoAfiliado;
    this.filtrosSolicitudRequest.codigoScgSolben = this.nroSCGSolFrmCtrl.value;
    this.filtrosSolicitudRequest.tipoScgSolben = this.tipSCGSolFrmCtrl.value;
    this.filtrosSolicitudRequest.codigoClinica = this.codigoClinica;
    this.filtrosSolicitudRequest.fechaInicio_pre =
      this.fechaRegDesdeFrmCtrl.value;
    this.filtrosSolicitudRequest.fechaFinPre = this.fechaRegHastaFrmCtrl.value;
    this.filtrosSolicitudRequest.estadoPre = this.estadoPreFrmCtrl.value;

    //code by luis
    this.filtrosSolicitudRequest.tipoDoc = this.tipoDoc;
    this.filtrosSolicitudRequest.nroDoc = this.numDoc;
    this.filtrosSolicitudRequest.nombre1 = this.nombre1;
    this.filtrosSolicitudRequest.nombre2 = this.nombre2;
    this.filtrosSolicitudRequest.apePaterno = this.apePaterno;
    this.filtrosSolicitudRequest.apeMaterno = this.apeMaterno;
    //

    if (this.userService.getCodRol === 2) {
      this.filtrosSolicitudRequest.autorizadorPertenencia =
        this.userService.getCodUsuario;
    } else {
      this.filtrosSolicitudRequest.autorizadorPertenencia =
        this.autorizadorFrmCtrl.value;
    }
  }

  // AFLORES LISTA DE LabcA GRILLA DE SOLICITUDES
  public listaDetallesSolicitudes() {
    this.disableBuscar = true;
    this.listaDetallePreliminar = [];
    this.isLoading = true;
    // this.dataSource = null;
    this.dataSource = new MatTableDataSource([]);
    this.guardarFiltrosBusqueda();
    this.filtrosSolicitudRequest.index = 0;
    this.filtrosSolicitudRequest.size = this.pageSize;
    this.bandejaSolicitudesService
      .listarDetalleSolicitud(this.filtrosSolicitudRequest)
      .subscribe(
        (response: WsResponseOnco) => {
          if (
            response.audiResponse.codigoRespuesta === "0" ||
            response.audiResponse.codigoRespuesta === "1" ||
            response.audiResponse.codigoRespuesta === "2"
          ) {
            this.listaDetallePreliminar =
              response.dataList != null ? response.dataList : [];

            this.totalResultadoBandeja =
              response.total != null ? response.total : 0;
            this.filtrosSolicitudesOldRequest = this.filtrosSolicitudRequest;
            this.cargarTablaPreliminares();
          } else {
            this.mensaje = MENSAJES.ERROR_NOFUNCION;
            this.openDialogMensaje(
              this.mensaje,
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
          this.mensaje = MENSAJES.ERROR_SERVICIO;
          this.openDialogMensaje(
            this.mensaje,
            "Listar Solicitudes Preliminares",
            true,
            false,
            null
          );
          console.error(error);
          this.disableBuscar = false;
        }
      );
  }

  public cambiarPagina(event) {
    if (event.pageSize !== this.pageSize) {
      this.pageSize = event.pageSize;
      this.skip = event.pageSize * event.pageIndex;
      //this.actualizarTablaBandejaPrelim();
      event.length = this.totalResultadoBandeja;
    } else {
      if (this.totalResultadoBandeja > this.dataSource.data.length) {
        this.skip = event.pageSize * event.pageIndex;
        this.pageSize = event.pageSize;
        //this.actualizarTablaBandejaPrelim();
      }
    }
  }

  private actualizarTablaBandejaPrelim() {
    merge(this.paginator.page, this.paginator.pageSize)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.disableBuscar = true;
          this.listaDetallePreliminar = [];
          this.isLoading = true;
          this.guardarFiltrosBusqueda();
          this.filtrosSolicitudRequest.index = this.skip;
          this.filtrosSolicitudRequest.size = this.pageSize;
          this.dataSource.data = [];
          return this.bandejaSolicitudesService.listarDetalleSolicitud(
            this.filtrosSolicitudRequest
          );
        }),
        share(),
        map((response: WsResponseOnco) => {
          this.totalResultadoBandeja =
            response.total != null ? response.total : 0;
          if (response.audiResponse.codigoRespuesta !== "0") {
            this.mensaje = response.audiResponse.mensajeRespuesta;
            this.openDialogMensaje(
              MENSAJES.ERROR_NOFUNCION,
              this.mensaje,
              true,
              false,
              null
            );
          }
          this.listaDetallePreliminar =
            response.dataList != null ? response.dataList : [];
          this.filtrosSolicitudesOldRequest = this.filtrosSolicitudRequest;
          return response;
        }),
        catchError(() => {
          return observableOf([]);
        })
      )
      .subscribe((data: WsResponseOnco) => {
        this.disableBuscar = false;
        this.isLoading = false;
        this.dataSource.data = data.dataList;
      });
  }

  public cargarTablaPreliminares(): void {
    if (
      this.listaDetallePreliminar != null &&
      this.listaDetallePreliminar.length > 0
    ) {
      this.dataSource = new MatTableDataSource(this.listaDetallePreliminar);
      this.dataSource.sort = this.sort;
    }
  }

  public exportExcelBandejaPreliminar(): void {
    if (
      typeof this.listaDetallePreliminar === "undefined" ||
      this.listaDetallePreliminar === null ||
      this.listaDetallePreliminar.length === 0
    ) {
      this.mensaje = "No existen datos que exportar.";
      this.openDialogMensaje(
        MENSAJES.PRELIMINAR.EXCEL,
        this.mensaje,
        true,
        false,
        null
      );
      return;
    }

    this.filtrosSolicitudRequest.codigoPreliminar =
      this.filtrosSolicitudesOldRequest.codigoPreliminar;
    this.filtrosSolicitudRequest.codigoPaciente =
      this.filtrosSolicitudesOldRequest.codigoPaciente;
    this.filtrosSolicitudRequest.tipoScgSolben =
      this.filtrosSolicitudesOldRequest.tipoScgSolben;
    this.filtrosSolicitudRequest.codigoScgSolben =
      this.filtrosSolicitudesOldRequest.codigoScgSolben;
    this.filtrosSolicitudRequest.nombreClinica =
      this.filtrosSolicitudesOldRequest.nombreClinica;
    this.filtrosSolicitudRequest.estadoPre =
      this.filtrosSolicitudesOldRequest.estadoPre;
    this.filtrosSolicitudRequest.fechaInicio_pre =
      this.filtrosSolicitudesOldRequest.fechaInicio_pre;
    this.filtrosSolicitudRequest.fechaFinPre =
      this.filtrosSolicitudesOldRequest.fechaFinPre;
    this.filtrosSolicitudRequest.autorizadorPertenencia =
      this.filtrosSolicitudesOldRequest.autorizadorPertenencia;
    this.filtrosSolicitudRequest.index = 0;
    this.filtrosSolicitudRequest.size = this.totalResultadoBandeja;

    this.disableBuscar = true;

    this.spinnerService.show();

    this.excelExportService
      .ExportExcelBandejaPre(this.filtrosSolicitudRequest)
      .subscribe(
        (data: ExcelDownloadResponse) => {
          this.disableBuscar = false;
          this.exportExcelPreliminar = data.url;
          const urlPreliminar = this.exportExcelPreliminar;
          const win = window.open(urlPreliminar);
          win.blur();
          this.spinnerService.hide();
        },
        (error) => {
          this.mensaje = MENSAJES.ERROR_SERVICIO;
          this.openDialogMensaje(
            this.mensaje,
            "Error en Servicio de Exportar Excel",
            true,
            false,
            null
          );
          console.error(error);
          this.disableBuscar = false;
          this.spinnerService.hide();
        }
      );
  }

  public abrirBuscarPaciente(): void {
    const dialogRef = this.dialog.open(BuscarPacienteComponent, {
      width: "640px",
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result: Paciente) => {
      if (result !== null) {
        const nombre2 = result.nombr2 != null ? ` ${result.nombr2}` : "";
        const nombreCom = `${result.apepat} ${result.apemat}, ${result.nombr1}${nombre2}`;
        this.pacienteFrmCtrl.setValue(nombreCom);
        this.filtrosSolicitudRequest.codigoPaciente = null;
        this.codigoAfiliado = result.codafir;
        this.tipoDoc = result.tipdoc;
        this.numDoc = result.numdoc;
        this.nombre1 = result.nombr1;
        this.nombre2 = result.nombr2;
        this.apePaterno = result.apepat;
        this.apeMaterno = result.apemat;
        this.listaDetallesSolicitudes();
        // this.filtrosSolicitudRequest.tipoDoc = result.tipdoc;
        // this.filtrosSolicitudRequest.nroDoc = result.numdoc;
      } else {
        this.pacienteFrmCtrl.setValue(null);
        this.codigoAfiliado = null;
        this.filtrosSolicitudRequest.codigoPaciente = null;
      }
    });
  }

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
        this.codigoClinica = null;
      }
    });
  }

  public limpiarControl($event: Event, tipo: string, codigo: string) {
    this.preliminarFrmGrp.get(tipo).setValue(null);
    this.tipoDoc = null;
    this.numDoc = null;
    this.nombre1 = null;
    this.nombre2 = null;
    this.apePaterno = null;
    this.apeMaterno = null;
    this[codigo] = null;
  }

  public verFichaDeSolicitud(row: DetallePreeliminar) {
    this.preliminar.codSolPre = row.codPre;
    this.preliminar.estadoPreliminar = row.estadoSol;
    this.router.navigate(["./app/detalle-preliminar"]);
  }

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
        title: MENSAJES.PRELIMINAR.TITLE,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }

  public validarFechaInicio() {
    const dateInicio = this.fechaRegDesdeFrmCtrl.value;
    const dateFin = this.fechaRegHastaFrmCtrl.value;
    const dateActual = new Date();
    if (this.fechaRegHastaFrmCtrl.value !== null) {
      if (
        this.datePipe.transform(dateInicio, "dd/MM/yyyy") ===
        this.datePipe.transform(dateFin, "dd/MM/yyyy")
      ) {
        this.openDialogMensaje(
          "Fecha inicial debe ser distinta a la fecha final",
          null,
          true,
          false,
          null
        );
        this.fechaRegDesdeFrmCtrl.setValue(null);
        return;
      }

      if (dateInicio > dateFin) {
        this.openDialogMensaje(
          "Fecha inicial debe ser menor que la fecha final",
          null,
          true,
          false,
          null
        );
        this.fechaRegDesdeFrmCtrl.setValue(null);
      } else if (dateInicio === dateFin) {
      } else if (dateInicio > dateActual) {
        this.openDialogMensaje(
          "Fecha no debe de ser mayor al actual",
          null,
          true,
          false,
          null
        );
        this.fechaRegDesdeFrmCtrl.setValue(null);
      }
    }
  }

  public validarFechaFin() {
    const dateInicio = this.fechaRegDesdeFrmCtrl.value;
    const dateFin = this.fechaRegHastaFrmCtrl.value;
    const dateActual = new Date();
    if (this.fechaRegDesdeFrmCtrl.value !== null) {
      if (
        this.datePipe.transform(dateInicio, "dd/MM/yyyy") ===
        this.datePipe.transform(dateFin, "dd/MM/yyyy")
      ) {
        this.openDialogMensaje(
          "Fecha final debe ser distinta a la fecha inicial",
          null,
          true,
          false,
          null
        );
        this.fechaRegHastaFrmCtrl.setValue(null);
        return;
      }

      if (dateInicio > dateFin) {
        this.openDialogMensaje(
          "Fecha final debe ser mayor a la fecha inicial",
          null,
          true,
          false,
          null
        );
        this.fechaRegHastaFrmCtrl.setValue(null);
      } else if (dateInicio === dateFin) {
        this.openDialogMensaje(
          "Fecha final debe ser distinta a la fecha inicial",
          null,
          true,
          false,
          null
        );
        this.fechaRegHastaFrmCtrl.setValue(null);
      } else if (dateFin > dateActual) {
        this.openDialogMensaje(
          "Fecha no debe de ser mayor al actual",
          null,
          true,
          false,
          null
        );
        this.fechaRegHastaFrmCtrl.setValue(null);
      }
    }
  }

  public accesoOpcionMenu() {
    const data = require("src/assets/data/permisosRecursos.json");
    const bandejaPreliminar = data.bandejaPremiliminar;
    this.opcionMenu = JSON.parse(localStorage.getItem("opcionMenu"));

    if (this.opcionMenu.opcion.length > 0) {
      this.opcionMenu.opcion.forEach((element) => {
        const codOpcion = element.codOpcion;
        switch (codOpcion) {
          case bandejaPreliminar.txtSolicitudPreliminar:
            this.solicitudPrelimTxt = Number(element.flagAsignacion);
            break;
          case bandejaPreliminar.txtPaciente:
            this.pacienteTxt = Number(element.flagAsignacion);
            break;
          case bandejaPreliminar.txtNnroScgSolben:
            this.nroScgSolbenTxt = Number(element.flagAsignacion);
            break;
          case bandejaPreliminar.cmbTipoScgSolben:
            this.tipoScgSolbenCmb = Number(element.flagAsignacion);
            break;
          case bandejaPreliminar.txtClinica:
            this.clinicaTxt = Number(element.flagAsignacion);
            break;
          case bandejaPreliminar.txtFecRegPrelimIni:
            this.fecRegPrelimIniTxt = Number(element.flagAsignacion);
            break;
          case bandejaPreliminar.txtFecRegPrelimFin:
            this.fecRegPrelimFinTxt = Number(element.flagAsignacion);
            break;
          case bandejaPreliminar.cmbEstadoSolicPrelim:
            this.estadoSolicPrelimCmb = Number(element.flagAsignacion);
            break;
          case bandejaPreliminar.cmbAutorizadorPert:
            this.autorizadorPertCmb = Number(element.flagAsignacion);
            break;
          case bandejaPreliminar.btnBuscarPrelim:
            this.buscarPrelimBtn = Number(element.flagAsignacion);
            break;
          case bandejaPreliminar.btnExportarExcel:
            this.exportarExcelBtn = Number(element.flagAsignacion);
            break;
        }
      });
    }
  }
}
