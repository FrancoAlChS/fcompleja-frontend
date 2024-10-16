import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  forwardRef,
} from "@angular/core";
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
  MatTableDataSource,
  MatPaginator,
  MatSort,
  MatPaginatorIntl,
  MatDialog,
} from "@angular/material";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { FormControl, Validators, FormGroup } from "@angular/forms";
import { ListaEvaluaciones } from "src/app/dto/solicitudEvaluacion/bandeja/ListaEvaluaciones";
import { BandejaEvaluacionService } from "src/app/service/bandeja.evaluacion.service";
import { ListaEvaluacionesRequest } from "src/app/dto/solicitudEvaluacion/bandeja/ListaEvaluacionesRequest";
import { ListaFiltroUsuarioRolservice } from "src/app/service/Lista.usuario.rol.service";
import { UsrRolRequest } from "src/app/dto/UsrRolRequest";
import { EmailAlertaCmacRequest } from "src/app/dto/request/EmailAlertaCmacRequest";
import { WsResponse } from "src/app/dto/WsResponse";
import { RegistrarEvaluacionCmacRequest } from "src/app/dto/request/RegistrarEvaluacionCmacRequest";
import { ParametroRequest } from "src/app/dto/ParametroRequest";
import { ListaParametroservice } from "src/app/service/lista.parametro.service";
import { Parametro } from "src/app/dto/Parametro";
import {
  MENSAJES,
  MY_FORMATS_AUNA,
  EMAIL,
  FILEFTP,
  FLAG_REGLAS_EVALUACION,
  ACCESO_EVALUACION,
} from "src/app/common";
import { MessageComponent } from "src/app/core/message/message.component";
// service
import { ReporteEvaluacion } from "src/app/service/reporte.evaluacion.service";
import { ListaActasCMAC } from "src/app/dto/solicitudEvaluacion/bandeja/ListaActasCMAC";
import { Participantes } from "src/app/dto/solicitudEvaluacion/bandeja/Participantes";
import { ActasMac } from "src/app/dto/solicitudEvaluacion/bandeja/ActasMac";

import { MatPaginatorIntlEspanol } from "src/app/directives/matpaginator-translate";
import { ListUsrRol } from "src/app/dto/ListUsrRol";
import { SelectionModel } from "@angular/cdk/collections";
import { CometarioComponent } from "src/app/core/cometario/cometario.component";
import { ApiOutResponse } from "src/app/dto/solicitudEvaluacion/ApiOutResponse";
import { EmailDTO } from "src/app/dto/core/EmailDTO";
import { CorreosService } from "src/app/service/cross/correos.service";
import { OncoWsResponse } from "src/app/dto/response/OncoWsResponse";
import { DatePipe } from "@angular/common";
import { UsuarioService } from "src/app/dto/service/usuario.service";
import { CoreService } from "src/app/service/core.service";
import { ArchivoRequest } from "src/app/dto/request/ArchivoRequest";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { BOpcionMenuLocalStorage } from "src/app/dto/core/BOpcionMenuLocalStorage";
import { EvaluacionCmacService } from "src/app/service/BandejaEvaluacion/evaluacion.cmac.service";
import { SolicitudEvaluacionRequest } from "src/app/dto/request/SolicitudEvaluacionRequest";
import { ArchivoFTP } from "src/app/dto/bandeja-preliminar/detalle-preliminar/ArchivoFTP";
import { ProgramacionCmacRequest } from "src/app/dto/request/ProgramacionCmacRequest";
import { RegistroParticipantesComponent } from "./registro-participantes/registro-participantes.component";
import { RegistroResultadoEvaluacionComponent } from "./registro-resultado-evaluacion/registro-resultado-evaluacion.component";
import { HistPacienteResponse } from "src/app/dto/response/HistPacienteResponse";
import { GenerarEncrypt } from "src/app/dto/request/GenerarEncryp";

export interface EvaluacionCMAC {
  title: string;
}

@Component({
  selector: "app-evaluacion-cmac",
  templateUrl: "./evaluacion.cmac.component.html",
  styleUrls: ["./evaluacion.cmac.component.scss"],
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
export class EvaluacionCmacComponent implements OnInit {
  evaFrmGrp: FormGroup;
  displayedColumns: string[];
  dataSource: MatTableDataSource<any>;
  isLoading: boolean;

  isAddSolicitud: boolean;
  isCambioFecha: boolean;
  proBarTabla: boolean;
  registroGrabado: boolean;
  disableBtn: boolean;
  agregarSolicitudBtn: boolean = false;

  disableOpenFile: boolean;
  codArchivoDown: any;
  mensajeDownload: string;

  correoRequest: EmailDTO;
  generarEncryptRequest: GenerarEncrypt;
  // lista de participantes de Cmac
  listaParticipantes: ListUsrRol[] = [];
  isLoadingParticipantes: boolean;
  codProgramacionCmac: string;
  dataSourceParticipantes: MatTableDataSource<ListUsrRol>;
  selectionParticipante: SelectionModel<ListUsrRol> =
    new SelectionModel<ListUsrRol>(true, []);
  displayedColumnsParticipantes: string[];

  usrRolRequest: UsrRolRequest = new UsrRolRequest();
  evaluacionXFecha: EmailAlertaCmacRequest = new EmailAlertaCmacRequest();
  listaSeleccionados: any[];
  evaluaciones: any[] = [];
  listaParticipantesGrabados: ListUsrRol[];

  fechaRealdis: boolean = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  showFile: boolean;
  public abrirPanel: boolean;
  public mostrarCasosEvaluados: boolean;

  codigoActa: string;
  codActaFtp: number;
  fecReunion: Date;
  reporteActaEscaneada: string;
  fileupload: File;
  mensajeSubActa: string;
  archivoSust: ArchivoFTP;
  docEnviarActa: HistPacienteResponse[] = [];
  listaEvaluacionesRequest: ListaEvaluacionesRequest =
    new ListaEvaluacionesRequest();
  detalleEvaluacion: ListaEvaluaciones[] = [];
  evaCmacRequest: RegistrarEvaluacionCmacRequest =
    new RegistrarEvaluacionCmacRequest();
  parametroRequest: ParametroRequest = new ParametroRequest();
  cmbResultadoCmac: Parametro[] = [];
  disableDownloadFile: boolean;
  public bloquearBoton: boolean = false;

  // MENSAJES
  mensajes: string;
  mensajes2: string;
  valores: any;
  evaluacionesEva: any[] = [];
  listaComites = [];

  public codSolicitudFrmCtrl: FormControl = new FormControl(null, [
    Validators.required,
  ]);

  evaluacionCmacFrmGrp: FormGroup = new FormGroup({
    horaReunionFrmCtrl: new FormControl(null, Validators.required),
    fechaReunionCMAC: new FormControl(null, [Validators.required]),
    espCmtFrmCtrl: new FormControl(null, [Validators.required]),
    fechaRealFrmCtrl: new FormControl(null, [Validators.required]),
  });

  get fechaReunionCMAC() {
    return this.evaluacionCmacFrmGrp.get("fechaReunionCMAC");
  }
  get horaReunionFrmCtrl() {
    return this.evaluacionCmacFrmGrp.get("horaReunionFrmCtrl");
  }
  get espCmtFrmCtrl() {
    return this.evaluacionCmacFrmGrp.get("espCmtFrmCtrl");
  }
  get fechaRealFrmCtrl() {
    return this.evaluacionCmacFrmGrp.get("fechaRealFrmCtrl");
  }

  opcionMenu: BOpcionMenuLocalStorage;
  txtFechaReunion: number;
  txtHoraReunion: number;
  btnAgregarSolicitud: number;
  btnImprimirActa: number;
  fileActaEscaneada: number;
  btnCargarActaEscaneada: number;
  btnGrabar: number;
  btnEnviar: number;
  btnSalir: number;
  btnCargaArchivo: boolean;
  flagEvaluacion = FLAG_REGLAS_EVALUACION;
  valorMostrarOpcion = ACCESO_EVALUACION.mostrarOpcion;

  public columnsGrillaParticipantes = [
    {
      codAcceso: ACCESO_EVALUACION.resultadoCMAC.asistio,
      columnDef: "select",
    },
    {
      codAcceso: ACCESO_EVALUACION.resultadoCMAC.nombres,
      columnDef: "nombreUsuarioRol",
    },
    {
      codAcceso: ACCESO_EVALUACION.resultadoCMAC.eliminar,
      columnDef: "eliminarParti",
    },
  ];

  public columnsGrillaCasos = [
    {
      codAcceso: ACCESO_EVALUACION.resultadoCMAC.numeroSolicitud,
      columnDef: "numeroSolEvaluacion",
    },
    {
      codAcceso: ACCESO_EVALUACION.resultadoCMAC.paciente,
      columnDef: "paciente",
    },
    {
      codAcceso: ACCESO_EVALUACION.resultadoCMAC.diagnostico,
      columnDef: "diagnostico",
    },
    {
      codAcceso: ACCESO_EVALUACION.resultadoCMAC.codigoMedicamento,
      columnDef: "codMac",
    },
    {
      codAcceso: ACCESO_EVALUACION.resultadoCMAC.medicamentoSolicitado,
      columnDef: "descripcionCmac",
    },
    {
      codAcceso: ACCESO_EVALUACION.resultadoCMAC.resultadoEvaluacion,
      columnDef: "codigoResultado",
    },
    {
      codAcceso: ACCESO_EVALUACION.resultadoCMAC.observaciones,
      columnDef: "observaciones",
    },
    {
      codAcceso: ACCESO_EVALUACION.resultadoCMAC.eliminar,
      columnDef: "accion",
    },
  ];

  constructor(
    public dialogRef: MatDialogRef<EvaluacionCmacComponent>,
    private reporteEvaluacion: ReporteEvaluacion,
    public dialog: MatDialog,
    private adapter: DateAdapter<any>,
    @Inject(MAT_DIALOG_DATA) public data: EvaluacionCMAC,
    @Inject(UsuarioService) private userService: UsuarioService,
    private bandejaEvaluacionService: BandejaEvaluacionService,
    private coreService: CoreService,
    private spinnerService: Ng4LoadingSpinnerService,
    private listaFiltroUsuarioRolService: ListaFiltroUsuarioRolservice,
    private listaParametroservice: ListaParametroservice,
    private correoService: CorreosService,
    private datePipe: DatePipe,
    private evaluacionCmacService: EvaluacionCmacService
  ) {
    this.adapter.setLocale("es-PE");
    this.showFile = false;
    this.displayedColumnsParticipantes = [];
    this.displayedColumns = [];
  }

  ngOnInit() {
    this.accesoOpcionMenu();
    this.bloquearBoton = true;
    this.disableOpenFile = false;
    this.disableDownloadFile = false;
    this.listaParametroservice
      .listaComiteFiltro({ codigoEstado: 507 })
      .subscribe((response) => {
        this.listaComites = response.data;
        this.listaResultadoCmac();
      });
    this.inicializarVariables();
    this.cargarTabla();
    this.definirTablas();
  }

  public definirTablas(): void {
    this.displayedColumnsParticipantes = [];
    this.columnsGrillaParticipantes.forEach((c) => {
      if (this.flagEvaluacion) {
        this.displayedColumnsParticipantes.push(c.columnDef);
      } else {
        this.opcionMenu.opcion.forEach((element) => {
          if (
            c.codAcceso &&
            c.codAcceso === element.codOpcion &&
            Number(element.flagAsignacion) === ACCESO_EVALUACION.mostrarOpcion
          ) {
            this.displayedColumnsParticipantes.push(c.columnDef);
          }
        });
      }
    });

    this.displayedColumns = [];
    this.columnsGrillaCasos.forEach((c) => {
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
  }

  public inicializarVariables() {
    this.abrirPanel = false;
    this.mostrarCasosEvaluados = false;
    this.listaSeleccionados = [];
    this.listaParticipantes = [];
    this.dataSource = null;
    this.dataSourceParticipantes = null;
    this.isLoading = false;
    this.isCambioFecha = false;
    this.isAddSolicitud = false;
    this.isLoadingParticipantes = false;
    this.proBarTabla = false;
    this.registroGrabado = false;
    this.disableBtn = true;
    this.codProgramacionCmac = "";
  }

  public cargarListaParticipantes(): void {
    if (this.listaParticipantes.length > 0) {
      this.dataSourceParticipantes = new MatTableDataSource(
        this.listaParticipantes
      );
    }
    this.dataSourceParticipantes.data.forEach((row: ListUsrRol) =>
      this.selectionParticipante.select(row)
    );
  }

  public cargarTabla(): void {
    if (this.listaSeleccionados.length > 0) {
      this.dataSource = new MatTableDataSource(this.listaSeleccionados);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } else {
      this.dataSource = null;
    }
  }

  public ImprimirListaActasMAC() {
    this.spinnerService.show();
    let request = new ArchivoFTP();

    request.usrApp = FILEFTP.usrApp;
    request.codArchivo = this.codActaFtp;
    request.nomArchivo = "";
    request.ruta = "";

    this.evaluacionCmacService.getPdfEvaluacionCmac(request).subscribe(
      (data: WsResponse) => {
        if (data.audiResponse.codigoRespuesta === "0") {
          this.spinnerService.hide();
          data.data.contentType = "application/pdf";
          const blob = this.coreService.crearBlobFile(data.data);

          const link = document.createElement("a");
          link.target = "_blank";
          link.href = window.URL.createObjectURL(blob);
          link.setAttribute("download", data.data.nomArchivo);
          link.click();

          window.open(window.URL.createObjectURL(blob), "_blank");
          //this.spinnerService.hide();
        } else {
          this.spinnerService.hide();
          this.openDialogMensaje(
            MENSAJES.MONITOREO.DETALLE.TITLE,
            "No se pudo cargar el reporte",
            true,
            false,
            null
          );
        }
      },
      (error) => {
        console.error(error);
        this.openDialogMensaje(
          MENSAJES.MONITOREO.DETALLE.TITLE,
          "No se pudo cargar el reporte",
          true,
          false,
          null
        );
      }
    );
  }

  public GenerarYGuardarFTPListaActasMAC(): ApiOutResponse {
    let fecha: String = "";
    const listaActasMAC: ActasMac[] = [];
    const listaParticipantes: Participantes[] = [];

    fecha = this.datePipe.transform(this.fechaReunionCMAC.value, "dd/MM/yyyy");
    // TODO listaSelecionado tiene que integrase con ONCOSYS para que muestre eso datos en el reporte, por el momento muestra null
    if (this.listaSeleccionados.length === 0) {
      this.openDialogMensaje(
        MENSAJES.CMAC.ERROR_SOLICITUDES,
        null,
        true,
        false,
        null
      );
      return null;
    }

    for (const j of this.listaSeleccionados) {
      listaActasMAC.push({
        solEvaluacion: j.numeroSolEvaluacion,
        paciente: j.nombrePaciente,
        diagnostico: j.nombreDiagnostico,
        codMedicamento: j.codMac,
        medicamentoSolicitado: j.descripcionCmac,
        resultadoEvaluacion: j.estadoEvaluacion,
        observaciones: j.observacionCMAC,
      });
    }

    if (this.listaParticipantes.length === 0) {
      this.openDialogMensaje(
        MENSAJES.CMAC.ERROR_PARTICIPANTES,
        null,
        true,
        false,
        null
      );
      return null;
    }

    this.selectionParticipante.selected.forEach((participante: ListUsrRol) => {
      listaParticipantes.push({
        nombreApellidos:
          participante.nombre + " " + participante.apellidoPaterno,
        firma: "",
      });
    });

    const objListaActasMac = new ListaActasCMAC();
    objListaActasMac.fecha = fecha;
    objListaActasMac.hora = this.horaReunionFrmCtrl.value;
    objListaActasMac.listaActasMAC = listaActasMAC;
    objListaActasMac.listaParticipantes = listaParticipantes;

    this.reporteEvaluacion
      .getListaActasMac(objListaActasMac)
      .subscribe((result) => {
        return result;
        // this.EnviarFTP(resultBlob);
      });
  }

  onNoClick(): void {
    if (this.listaSeleccionados.length > 0) {
      this.dialogRef.close();
    } else if (this.mostrarCasosEvaluados) {
      this.openDialogMensaje(
        "¿Seguro que dese salir?\nSe perdera la fecha programada.",
        null,
        false,
        true,
        null
      );
    } else {
      this.dialogRef.close();
    }
  }

  public obtenerCombo(lista: any[], valor: number, descripcion: string) {
    lista.unshift({
      codigoParametro: valor,
      nombreParametro: descripcion,
    });
  }

  upFile() {
    this.showFile = !this.showFile;
  }

  public Validacion() {
    this.listaEvaluacionesRequest.codigoEvaluacion =
      this.fechaReunionCMAC.value !== null
        ? this.fechaReunionCMAC.value.format("DD/MM/YYYY")
        : null;
    this.listaEvaluacionesRequest.codigoEvaluacion = null;
    this.listaEvaluacionesRequest.codigoClinica = null;
    this.listaEvaluacionesRequest.codigoPaciente = null;
    this.listaEvaluacionesRequest.fechaInicio = null;
    this.listaEvaluacionesRequest.fechaFin = null;
    this.listaEvaluacionesRequest.fechaFin = null;
    this.listaEvaluacionesRequest.numeroScgSolben = 0;
    this.listaEvaluacionesRequest.estadoSolicitudEvaluacion = null;
    this.listaEvaluacionesRequest.tipoScgSolben = null;
    this.listaEvaluacionesRequest.rolResponsable = null;
    this.listaEvaluacionesRequest.estadoScgSolben = null;
    this.listaEvaluacionesRequest.correoLiderTumor = null;
    this.listaEvaluacionesRequest.numeroCartaGarantia = 0;
    this.listaEvaluacionesRequest.correoCmac = null;
    this.listaEvaluacionesRequest.autorizadorPertenencia = null;
    this.listaEvaluacionesRequest.tipoEvaluacion = null;
    this.listaEvaluacionesRequest.liderTumor = null;
    this.listaEvaluacionesRequest.reunionCmac = null;
  }

  public listaParticipantesCmac() {
    this.dataSourceParticipantes = null;
    this.selectionParticipante = new SelectionModel<ListUsrRol>(true, []);
    this.listaParticipantes = [];

    this.isLoadingParticipantes = true;

    this.usrRolRequest = new UsrRolRequest();
    this.usrRolRequest.codRol = 9;

    this.listaFiltroUsuarioRolService
      .consultarUsuarioRolFarmacia(this.usrRolRequest)
      .subscribe(
        (data: OncoWsResponse) => {
          if (data.audiResponse.codigoRespuesta === "0") {
            this.listaParticipantes =
              data.dataList != null ? data.dataList : [];
            this.cargarListaParticipantes();
          } else {
            this.openDialogMensaje(
              MENSAJES.ERROR_NOFUNCION,
              data.audiResponse.mensajeRespuesta,
              true,
              false,
              null
            );
          }
          this.isLoadingParticipantes = false;
        },
        (error) => {
          console.error(error);
          this.mensajes =
            "Error al listar el Usuario del Rol Auditor de Pertenencia";
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            this.mensajes,
            true,
            false,
            null
          );
          this.isLoadingParticipantes = false;
        }
      );
  }
  public busquedaXFecha(): void {
    this.listaSeleccionados = [];
    this.dataSource = null;
    this.isLoading = true;
    this.proBarTabla = true;
    this.bandejaEvaluacionService
      .listaEvaluacionCmacXFecha(this.evaluacionXFecha)
      .subscribe(
        (response: WsResponse) => {
          if (response.audiResponse.codigoRespuesta === "0") {
            if (response.data.listaBandeja.length !== 0) {
              this.fechaRealFrmCtrl.setValue(
                new Date(response.data.fecReunion + "T00:00:00")
              );
              this.disableDownloadFile = true;
              this.disableOpenFile = false;
              if (this.isCambioFecha) {
                this.codProgramacionCmac = response.data.codProgramacionCmac;
              }
              this.listaParticipantes = response.data["listaPart"];
              this.cargarListaParticipantes();

              this.listaSeleccionados = response.data.listaBandeja;
              this.listaParticipantesGrabados =
                response.data.listFiltroRolResponse;
              this.codigoActa = response.data.codActa;
              this.codActaFtp = response.data.codActaFtp;
              this.fecReunion = response.data.fecReunion;
              this.reporteActaEscaneada = response.data.reporteActaEscaneada;
              this.horaReunionFrmCtrl.setValue(response.data.horaCmac);
              if (response.data.codArchivoSust !== null) {
                this.disableDownloadFile = false;
                this.disableOpenFile = true;
                this.codArchivoDown = response.data.codArchivoSust;
              }
              this.crearFormControlResultadosCMAC();
              this.cargarTabla();
              this.disableBtn = false;
              if (response.data.codigoGrabado === "0") {
                this.registroGrabado = true;
                this.disableBtn = true;
                this.listaSeleccionados.forEach((evalua: ListaEvaluaciones) => {
                  this.evaFrmGrp.controls[
                    `r${evalua.codSolEvaluacion}`
                  ].disable();
                });
                this.listaParticipantesGrabados.forEach(
                  (participante: ListUsrRol) => {
                    let part = this.listaParticipantes.filter(
                      (parti) => parti.codUsuario === participante.codigoRol
                    )[0];
                    this.selectionParticipante.select(part);
                    // this.selectionParticipante.toggle(part);
                    // this.masterToggle();
                  }
                );
              } else {
                this.bloquearBoton = false;
              }
            } else {
              this.openDialogMensaje(
                "No se encuentra datos con le fecha ingresada",
                null,
                true,
                false,
                this.fechaReunionCMAC.value.format("DD/MM/YYYY")
              );
              this.cargarTabla();
              this.horaReunionFrmCtrl.setValue(null);
              this.mostrarCasosEvaluados = false;
            }
          } else {
            this.openDialogMensaje(
              response.audiResponse.mensajeRespuesta,
              null,
              true,
              false,
              null
            );
            this.horaReunionFrmCtrl.setValue(null);
            this.mostrarCasosEvaluados = false;
          }
          this.isLoading = false;
          this.proBarTabla = false;
          this.isCambioFecha = false;
        },
        (error) => {
          console.error(error);
          this.mensajes =
            "Error al listar el Usuario del Rol Auditor de Pertenencia";
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            this.mensajes,
            true,
            false,
            null
          );
          this.isLoading = false;
          this.proBarTabla = false;
          this.isCambioFecha = false;
        }
      );
  }

  public guardarParametros(): boolean {
    if (this.listaSeleccionados.length === 0) {
      this.openDialogMensaje(
        MENSAJES.CMAC.ERROR_SOLICITUDES,
        null,
        true,
        false,
        null
      );
      return false;
    }

    if (this.selectionParticipante.selected.length === 0) {
      this.openDialogMensaje(
        MENSAJES.CMAC.ERROR_PARTICIPANTES,
        null,
        true,
        false,
        null
      );
      return false;
    }

    if (this.evaFrmGrp.invalid) {
      this.listaSeleccionados.forEach((evaluacion: ListaEvaluaciones) => {
        this.evaFrmGrp.controls[
          `r${evaluacion.codSolEvaluacion}`
        ].markAsTouched();
      });
      this.openDialogMensaje(
        MENSAJES.CMAC.ERROR_RESULTADOS,
        null,
        true,
        false,
        null
      );
      return false;
    }

    //let faltaObservaciones = false;
    let valores = "";
    this.dataSource.data.forEach((evaluacion: ListaEvaluaciones) => {
      if (
        evaluacion.observacion === undefined ||
        evaluacion.observacion === null ||
        evaluacion.observacion.trim() === ""
      ) {
        valores = valores + `${evaluacion.numeroSolEvaluacion}, `;
        //faltaObservaciones = true;
      }
    });

    // if (faltaObservaciones) {
    //   valores = valores.substring(0, valores.length - 2);
    //   this.openDialogMensaje(
    //     MENSAJES.CMAC.ERROR_OBSERVACIONES,
    //     null,
    //     true,
    //     false,
    //     valores
    //   );
    //   return false;
    // }

    this.evaCmacRequest.codigoScan = "2"; // TO-DO
    this.evaCmacRequest.codigoRolResponsableCmac = this.userService.getCodRol;
    this.evaCmacRequest.codigoUsrResponsableCmac = this.userService.getCodUsuario;
    this.evaCmacRequest.listaParticipante = this.selectionParticipante.selected;
    this.evaCmacRequest.listaEvaluacion = [];
    this.evaCmacRequest.codComite = localStorage.getItem("tipoComite");

    this.listaSeleccionados.forEach((evalua: ListaEvaluaciones) => {
      let tempCMAC: ListaEvaluaciones = new ListaEvaluaciones();
      tempCMAC = evalua;
      tempCMAC.resultadoCMAC = this.evaFrmGrp.value[`r${evalua.codSolEvaluacion}`];
      this.evaCmacRequest.listaEvaluacion.push(tempCMAC);
    });

    return true;
  }

  public grabarEvaluacionCMAC() {
    if (this.guardarParametros()) {
      if (
        this.fechaRealFrmCtrl.value === null ||
        this.fechaRealFrmCtrl.value === ""
      ) {
        this.openDialogMensaje(
          "Ingresar FECHA REAL DE REUNION",
          null,
          true,
          false,
          null
        );
        return;
      }
      if (
        this.horaReunionFrmCtrl.value === null ||
        this.horaReunionFrmCtrl.value === ""
      ) {
        this.openDialogMensaje(
          "Ingresar HORA DE REUNION FORMATO HH:MM",
          null,
          true,
          false,
          null
        );
        return;
      }
      this.bloquearBoton = true;
      let fecha: String = "";
      let fechaReal: String = "";
      const listaActasMAC: ActasMac[] = [];
      const listaParticipantes: Participantes[] = [];

      fecha = this.datePipe.transform(
        this.fechaReunionCMAC.value,
        "dd-MM-yyyy"
      ); // this.fechaReunionCMAC.value.format('DD-MM-YYYY');
      // TODO listaSelecionado tiene que integrase con ONCOSYS para que muestre eso datos en el reporte, por el momento muestra null
      fechaReal = this.datePipe.transform(
        this.fechaRealFrmCtrl.value,
        "dd-MM-yyyy"
      );

      for (let j of this.dataSource.data) {
        let res = this.cmbResultadoCmac.filter(
          (opt) => opt.codigoParametro == j.resultadoCMAC
        )[0];
        listaActasMAC.push({
          solEvaluacion: j.numeroSolEvaluacion,
          paciente: j.paciente,
          diagnostico: j.diagnostico,
          codMedicamento: j.codMac,
          medicamentoSolicitado: j.descripcionCmac,
          resultadoEvaluacion: res ? res.nombreParametro : "",
          observaciones: j.observacionCMAC,
        });
      }

      this.selectionParticipante.selected.forEach(
        (participante: ListUsrRol) => {
          listaParticipantes.push({
            nombreApellidos: participante.nombreApellido,
            firma: "",
          });
        }
      );

      const objListaActasMac = new ListaActasCMAC();
      objListaActasMac.fecha = fecha;
      objListaActasMac.fechaReal = fechaReal == null ? fecha : fechaReal;
      objListaActasMac.hora = this.horaReunionFrmCtrl.value;
      objListaActasMac.listaActasMAC = listaActasMAC;
      objListaActasMac.listaParticipantes = listaParticipantes;
      objListaActasMac.codigoActa = this.codigoActa;
      const comiteSelEnvi = this.listaComites.find(
        (el) => el.codigoComite == this.espCmtFrmCtrl.value
      );
      objListaActasMac.nomComite = comiteSelEnvi.descripcionComite;

      this.reporteEvaluacion
        .getListaActasMac(objListaActasMac)
        .subscribe((result) => {
          if (result.codResultado === 0) {
            // CODIGO DE ARCHIVO GENERADO
            this.codActaFtp = result.response.codArchivo;
            this.evaCmacRequest.codActaFtp = result.response.codArchivo;
            this.evaCmacRequest.fechaProgramada = fecha;
            this.evaCmacRequest.horaProgramada = this.horaReunionFrmCtrl.value;
            this.evaCmacRequest.fechaReal = fechaReal;
            this.evaCmacRequest.codProgramacionCmac = this.codProgramacionCmac;
            this.evaCmacRequest.codComite = this.espCmtFrmCtrl.value;
            this.evaCmacRequest.codArchivoSustento = this.codArchivoDown;
            this.bloquearBoton = true;
            this.fechaRealdis = true;
            this.disableOpenFile = true;
            this.registrarEvaluacionCMAC();
          } else {
            this.bloquearBoton = false;
            this.openDialogMensaje(
              MENSAJES.CMAC.ERROR_GENERAR_REPORTE,
              null,
              true,
              false,
              null
            );
          }
        });
    } else {
      this.bloquearBoton = false;
    }
  }

  public registrarEvaluacionCMAC(): void {
    this.bandejaEvaluacionService
      .registrarEvaluacionCmac(this.evaCmacRequest)
      .subscribe(
        (data: WsResponse) => {

          const comiteSel = this.listaComites.find(
            (el) => el.codigoComite == this.espCmtFrmCtrl.value
          );
          const concat = "EVALUACION DEL COMITÉ " + comiteSel.descripcionComite;
          if (data.audiResponse.codigoRespuesta === "0") {
            this.openDialogMensaje(
              concat,
              data.audiResponse.mensajeRespuesta,
              true,
              false,
              null
            );
            this.registroGrabado = true;
            this.disableBtn = true;
            this.fechaRealdis = true;
            this.listaSeleccionados.forEach((evalua: ListaEvaluaciones) => {
              this.evaFrmGrp.controls[`r${evalua.codSolEvaluacion}`].disable();
            });
          } else {
            this.bloquearBoton = false;
            this.openDialogMensaje(
              "EVALUACION DEL COMITÉ",
              data.audiResponse.mensajeRespuesta,
              true,
              false,
              null
            );
            this.registroGrabado = false;
            this.disableBtn = false;
          }
        },
        (error) => {
          console.error("Error al listar las Solicitudes de Evaluacion");
          this.registroGrabado = false;
          this.disableBtn = false;
          this.bloquearBoton = false;
        }
      );
  }

  public listaResultadoCmac(): void {
    this.parametroRequest.codigoGrupo = "6";
    this.parametroRequest.codigoParam = "3";
    this.listaParametroservice
      .consultarParametro(this.parametroRequest)
      .subscribe(
        (data: WsResponse) => {
          if (data.audiResponse.codigoRespuesta === "0") {
            this.cmbResultadoCmac = data.data;
            this.obtenerCombo(
              this.cmbResultadoCmac,
              null,
              "-- Seleccionar Tipo de resultado --"
            );
          } else {
            console.error("No se encuentra data con el codigo de grupo");
          }
        },
        (error) => {
          console.error("Error estado de evaluacion de lider tumor");
        }
      );
  }

  public inputFecha($event: Event): void {
    $event.preventDefault();
    this.horaReunionFrmCtrl.setValue(null);
    if (this.fechaReunionCMAC.value !== null) {
      this.evaluacionXFecha.fechaCmac =
        this.fechaReunionCMAC.value.format("DD/MM/YYYY");
      this.isCambioFecha = true;
      this.evaluacionXFecha.codComite = this.espCmtFrmCtrl.value;
      if (this.espCmtFrmCtrl.value == null || this.espCmtFrmCtrl.value == "") {
        this.openDialogMensaje(
          MENSAJES.ERROR_NOFUNCION,
          "DEBES ESCOGER UN COMITÉ",
          true,
          false,
          null
        );
        return;
      }
      this.busquedaXFecha();
    } else {
      this.openDialogMensaje("No ingresó la fecha", null, true, false, null);
      this.listaSeleccionados = [];
      this.cargarTabla();
      this.horaReunionFrmCtrl.setValue(null);
      return;
    }
  }

  public ingresarComentario(row: ListaEvaluaciones) {
    const dialogComentario = this.dialog.open(CometarioComponent, {
      width: "400px",
      disableClose: true,
      data: {
        title: MENSAJES.CMAC.TITLE2,
        evaluacion: row,
      },
    });

    dialogComentario.afterClosed().subscribe((result: ListaEvaluaciones) => {
      if (result !== null) {
        row.observacion = result.observacion;
        row.observacionCMAC = result.observacion;
      }
      // else{
      //   this.openDialogMensaje(
      //     "El campo observaciones es obligatorio.",
      //     null,
      //     true,
      //     false,
      //     null
      //   );
      // }
    });
  }

  public eliminarEvaluacion(row: ListaEvaluaciones) {
    var request: SolicitudEvaluacionRequest = new SolicitudEvaluacionRequest();
    request.codSolicitudEvaluacion = parseInt(row.codSolEvaluacion);
    request.codPrograCmac = row.codProgramacionCmac
    const index: number = this.listaSeleccionados.findIndex((d) => d === row);
    this.dataSource = null;
    this.isLoading = true;

    this.evaFrmGrp.removeControl(
      `r${row.codSolEvaluacion}`,
    )

    this.evaluacionCmacService.eliminarEvaluacionCmac(request).subscribe(
      (data: WsResponse) => {
        if (data.audiResponse.codigoRespuesta === "0") {
          this.listaSeleccionados.splice(index, 1);
          this.cargarTabla();
          this.openDialogMensaje(
            data.audiResponse.mensajeRespuesta,
            null,
            true,
            false,
            null
          );
          this.isLoading = false;
        } else {
          this.openDialogMensaje(
            "ocurrio un error al eliminar registro",
            null,
            true,
            false,
            null
          );
          this.isLoading = false;
        }
      },
      (error) => {
        console.error("Error al eliminar registro");
        this.isLoading = false;
      }
    );
  }

  public cancelar() {
    this.codSolicitudFrmCtrl.setValue(null);
    this.abrirPanel = false;
    this.disableBtn = false;
    this.bloquearBoton = false;
  }

  public agregarSolicitud(): void {
    this.abrirPanel = true;
    this.disableBtn = true;
    this.bloquearBoton = true;
  }

  public busquedaXCodigo() {
    this.dataSource = null;
    this.isAddSolicitud = true;
    this.isLoading = true;

    this.evaluacionXFecha.codLagoSolEva = this.codSolicitudFrmCtrl.value;
    this.evaluacionXFecha.codLargoMac = this.codProgramacionCmac;
    //this.evaluacionXFecha.codComite = this.espCmtFrmCtrl.value;

    this.spinnerService.show();
    this.bandejaEvaluacionService
      .listaEvaluacionXCodigoCmac(this.evaluacionXFecha)
      .subscribe(
        (data: WsResponse) => {
          if (
            data.audiResponse !== null &&
            data.audiResponse.codigoRespuesta === "0"
          ) {
            this.agregarSolicitudBtn = false;
            if (data.data.length !== 0) {
              this.evaluacionesEva = data.data;
              if (this.verificarEstadosSolicitudesCMAC()) {
                if(this.espCmtFrmCtrl.value === this.evaluacionesEva[0].codComite){
                  this.evaluacionCmacService.agregarRegEvaluacionCmac(this.evaluacionXFecha).subscribe(
                    (data: WsResponse) =>{
                    }
                  )
                  this.evaluacionesEva[0].codigoElimirReuPrev = 1;
                  this.listaSeleccionados.push(this.evaluacionesEva[0]); // = data.listabandeja;

                  this.evaFrmGrp.addControl(
                    `r${data.data[0].codSolEvaluacion}`,
                    new FormControl(null, [Validators.required])
                  );

                  this.cargarTabla();
                  this.codSolicitudFrmCtrl.setValue(null);
                  this.codSolicitudFrmCtrl.markAsUntouched();
                  this.isAddSolicitud = false;
                  this.isLoading = false;
                  this.spinnerService.hide();
                }else{
                  this.isAddSolicitud = false;
                  this.isLoading = false;
                  this.spinnerService.hide();
                  this.openDialogMensaje(
                    "Advertencia",
                    "La solicitud de evaluación no pertenece al mismo comité",
                    true,
                    false,
                    null
                  );
                  this.cargarTabla();
                }

              } else {
                this.isAddSolicitud = false;
                this.isLoading = false;
                this.spinnerService.hide();
                this.openDialogMensaje(
                  this.mensajes,
                  this.mensajes2,
                  true,
                  false,
                  this.valores
                );
                this.cargarTabla();
              }
            } else {
              this.isAddSolicitud = false;
              this.isLoading = false;
              this.openDialogMensaje(
                "Error",
                data.audiResponse.mensajeRespuesta,
                true,
                false,
                null
              );
              this.cargarTabla();
              this.isAddSolicitud = false;
              this.isLoading = false;
            }
          } else if (
            data.audiResponse !== null &&
            data.audiResponse.codigoRespuesta === "1"
          ) {
            this.agregarSolicitudBtn = false;
            this.spinnerService.hide();
            this.openDialogMensaje(
              "Error",
              data.audiResponse.mensajeRespuesta,
              true,
              false,
              null
            );
            this.cargarTabla();
            this.isAddSolicitud = false;
            this.isLoading = false;
          } else {
            this.agregarSolicitudBtn = false;
            this.spinnerService.hide();
            this.cargarTabla();
            this.isAddSolicitud = false;
            this.isLoading = false;
            this.openDialogMensaje(
              "Error",
              MENSAJES.ERROR_SERVICIO,
              true,
              false,
              null
            );
          }
        },
        (error) => {
          console.error("Error al listar las Solicitudes de Evaluacion");
          this.agregarSolicitudBtn = false;
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            "Error al listar las Solicitudes de Evaluacion",
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
        title: MENSAJES.CMAC.TITLE2,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        this.dialogRef.close();
      }
    });
  }

  public addSolicitud($event): void {
    $event.preventDefault();

    if (this.codSolicitudFrmCtrl.invalid) {
      this.codSolicitudFrmCtrl.markAsTouched();
      return;
    }

    const codigoIngresado = this.codSolicitudFrmCtrl.value;
    let agregado = false;

    this.listaSeleccionados.forEach((evaluacion: ListaEvaluaciones) => {
      if (
        evaluacion.codSolEvaluacion === codigoIngresado ||
        evaluacion.numeroSolEvaluacion === codigoIngresado
      ) {
        agregado = true;
        return;
      }
    });

    if (agregado) {
      this.codSolicitudFrmCtrl.setValue(null);
      this.openDialogMensaje(
        "Evaluación ya se encuentra en la lista: ",
        null,
        true,
        false,
        codigoIngresado
      );
      return;
    }

    this.agregarSolicitudBtn = true;
    this.busquedaXCodigo();
  }

  // Crea Tabla de Listas de Casos de la Reunión.
  public crearFormControlResultadosCMAC(): void {
    if (this.listaSeleccionados.length > 0) {
      const frmCtrlDinamico = {};

      this.listaSeleccionados.forEach((resultado: ListaEvaluaciones) => {
        frmCtrlDinamico[`r${resultado.codSolEvaluacion}`] = new FormControl(
          resultado.codigoResultado != null
            ? Number(resultado.codigoResultado)
            : null,
          [Validators.required]
        );
      });

      this.evaFrmGrp = new FormGroup(frmCtrlDinamico);
      this.mostrarCasosEvaluados = true;
    }
  }

  public isAllSelected(): boolean {
    const numSelected: number = this.selectionParticipante.selected.length;
    const numRows: number = this.dataSourceParticipantes.data.length;
    return numSelected === numRows;
  }

  public masterToggle(): void {
    if (this.isSomeSelected()) {
      this.selectionParticipante.clear();
    } else {
      this.isAllSelected()
        ? this.selectionParticipante.clear()
        : this.dataSourceParticipantes.data.forEach((row: ListUsrRol) =>
            this.selectionParticipante.select(row)
          );
    }
  }

  public isSomeSelected(): boolean {
    return this.selectionParticipante.selected.length > 0;
  }

  public verificarEstadosSolicitudesCMAC(): boolean {
    let valido = true;

    let noValSolicitud = false;
    this.mensajes = null;
    this.valores = "";

    if (
      this.evaluacionesEva[0].aplCana === 1 &&
      this.evaluacionesEva[0].insCana === 506
    ) {
      noValSolicitud = false;
    } else {
      this.valores =
        this.valores + this.evaluacionesEva[0].numeroSolEvaluacion + ", ";
      noValSolicitud = true;
    }

    if (noValSolicitud) {
      this.mensajes = MENSAJES.CMAC.ERROR_EVALUACION_ESTADO;
      this.valores = this.valores.substring(0, this.valores.length - 2);
      valido = false;
    }

    return valido;
  }

  public openFileRecarga(event) {
    this.fileupload = event.target.files[0];

    if (this.fileupload.size > FILEFTP.tamanioMax) {
      this.mensajeSubActa = "Validación del tamaño de archivo";
      this.openDialogMensaje(
        this.mensajeSubActa,
        "El archivo supera la cantidad permitidad '4MB', no se puede cargar el documento.",
        true,
        false,
        "Tamaño archivo: " + this.fileupload.size / 1024 / 1024 + "MB"
      );
      return false;
    }

    const archivoRequest = new ArchivoRequest();
    archivoRequest.archivo = this.fileupload;
    archivoRequest.nomArchivo = this.fileupload.name;
    archivoRequest.ruta = FILEFTP.rutaEvaluacionRequisitos;

    this.spinnerService.show();
    this.coreService
      .subirArchivo(archivoRequest)
      .subscribe((response: WsResponse) => {
        if (response.audiResponse.codigoRespuesta === "0") {
          this.mensajeSubActa = response.audiResponse.mensajeRespuesta;
          this.evaCmacRequest.codArchivoSustento = response.data.codArchivo;
          this.codArchivoDown = response.data.codArchivo;
          this.disableDownloadFile = false;
          //this.disableOpenFile=true;
          this.openDialogMensaje(
            "Archivo cargado...!",
            this.mensajeSubActa,
            true,
            false,
            null
          );
        } else {
          this.mensajeSubActa = response.audiResponse.mensajeRespuesta;
          this.openDialogMensaje(
            MENSAJES.ERROR_NOFUNCION,
            this.mensajeSubActa,
            true,
            false,
            null
          );
        }
      });
    /*const nombreArchivo = `CMAC_EVALUACION_ESC_${this.fechaReunionCMAC.value.format(
      "DD-MM-YYYY"
    )}.pdf`;
    const archivoRequest = new ArchivoRequest();
    archivoRequest.archivo = fileupload;
    archivoRequest.nomArchivo = nombreArchivo;
    archivoRequest.ruta = FILEFTP.rutaInformeCMAC;

    if (
      typeof event === "undefined" ||
      typeof fileupload === "undefined" ||
      typeof fileupload.name === "undefined"
    ) {
      this.openDialogMensaje(
        "Subida de archivos al FTP",
        "Falta seleccionar el archivo a subir.",
        true,
        false,
        null
      );
    } else {
      this.spinnerService.show();
      this.coreService.subirArchivo(archivoRequest).subscribe(
        (response: WsResponse) => {
          if (response.audiResponse.codigoRespuesta === "0") {
            this.mensajes = response.audiResponse.mensajeRespuesta;
            this.reporteActaEscaneada = response.data.codArchivo;
            //this.openDialogMensaje(response.audiResponse.mensajeRespuesta, null, true, false, null);
            this.actualizarActaEscanProgramacionCmac(
              this.codProgramacionCmac,
              response.data.codArchivo
            );
          } else {
            this.spinnerService.hide();
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
        }
      );
    }*/
  }

  public descArchivoSust() {
    this.archivoSust = new ArchivoFTP();
    this.archivoSust.codArchivo = this.codArchivoDown;
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
  }

  public enviarActa(): void {
    const selected = this.selectionParticipante.selected;
    if (selected.length > 0) {
      this.spinnerService.show();
      this.correoRequest = new EmailDTO();
      this.correoRequest.codPlantilla =
        EMAIL.EVALUACION_PROGRAMAR_REUNION_CMAC.codigoPlantilla;
      this.correoRequest.fechaProgramada = this.datePipe.transform(
        new Date(),
        "dd/MM/yyyy HH:mm:ss"
      );
      this.correoRequest.flagAdjunto =
        EMAIL.EVALUACION_PROGRAMAR_REUNION_CMAC.flagAdjunto;
      this.correoRequest.tipoEnvio =
        EMAIL.EVALUACION_PROGRAMAR_REUNION_CMAC.tipoEnvio;
      this.correoRequest.usrApp = EMAIL.usrApp;

      this.correoService.generarCorreo(this.correoRequest).subscribe(
        (response: OncoWsResponse) => {
          if (response.audiResponse.codigoRespuesta === "0") {
            //ACCION
            let result = "";
            const lista: any = response.dataList;
            let selectedComite = this.listaComites.find(
              (el) => el.codigoComite == this.espCmtFrmCtrl.value
            );

            let nombComite = selectedComite.descripcionComite;

            result += lista[0].cuerpo
              .toString()
              .replace("{{nombComite}}", nombComite)
              .replace(
                "{{fechaReunion}}",
                this.fechaRealFrmCtrl.value != null
                  ? this.datePipe.transform(
                      this.fechaRealFrmCtrl.value,
                      "dd/MM/yyyy"
                    )
                  : this.datePipe.transform(
                      this.fechaReunionCMAC.value,
                      "dd/MM/yyyy"
                    )
              )
              .replace("{{codActa}}", this.codigoActa);

            this.correoRequest.codigoPlantilla =
              EMAIL.EVALUACION_PROGRAMAR_REUNION_CMAC.codigoPlantilla;
            this.correoRequest.asunto = lista[0].asunto
              .toString()
              .replace("{{codActa}}", this.codigoActa)
              .replace("{{nombComite}}", nombComite)
              .replace(
                "{{fechaReunion}}",
                this.fechaRealFrmCtrl.value != null
                  ? this.datePipe.transform(
                      this.fechaRealFrmCtrl.value,
                      "dd/MM/yyyy"
                    )
                  : this.datePipe.transform(
                      this.fechaReunionCMAC.value,
                      "dd/MM/yyyy"
                    )
              );

            this.correoRequest.cuerpo = result;

            this.correoRequest.codigoEnvio = lista[0].codigoEnvio;
            //this.correoRequest.destinatario = 'nbaez001@gmail.com';
            if (this.reporteActaEscaneada) {
              this.correoRequest.ruta = this.reporteActaEscaneada;
            } else {
              this.correoRequest.ruta = this.codActaFtp + "";
            }
            //SELECCIONAR AL AUTORIZADOR DE PERTENENCIA Y ENVIAR MENSAJE
            let lEvaluaciones = JSON.parse(
              JSON.stringify(this.listaSeleccionados)
            );
            lEvaluaciones.forEach((element) => {
              element.fecReunion = null;
            });

            this.generarEncryptRequest = new GenerarEncrypt();

            this.generarEncryptRequest.fechaReu = this.datePipe.transform(
              this.fechaRealFrmCtrl.value,
              "dd/MM/yyyy"
            );
            this.generarEncryptRequest.codComite = selectedComite.codigoComite;
            this.generarEncryptRequest.nombreComite = nombComite;
            this.generarEncryptRequest.cuerpo = result;
            this.generarEncryptRequest.asunto = this.correoRequest.asunto;

            this.correoService
              .generarLinkEncypt(this.generarEncryptRequest)
              .subscribe((response: WsResponse) => {
                if (response.audiResponse.codigoRespuesta === "0") {
                  this.correoRequest.cuerpo = response.data;
                  this.correoService
                    .obtenerDatosAutorizadorPert(lEvaluaciones)
                    .subscribe(
                      (respAuPert: OncoWsResponse) => {
                        let listaAutorizador =
                          respAuPert.dataList != null
                            ? respAuPert.dataList
                            : [];
                        listaAutorizador.forEach((au: ListUsrRol) => {
                          if (au.correo) {
                            this.correoRequest.destinatario = au.correo;

                            this.correoService
                              .enviarCorreoGenerico(this.correoRequest)
                              .subscribe(
                                (respFinalizar: OncoWsResponse) => {},
                                (error) => {
                                  console.error(error);
                                }
                              );
                          } else {
                          }
                        });
                        selected.forEach((usu: ListUsrRol) => {
                          if (usu.correo) {
                            this.correoRequest.destinatario = usu.correo;
                            this.correoService
                              .enviarCorreoGenerico(this.correoRequest)
                              .subscribe(
                                (respFinalizar: OncoWsResponse) => {},
                                (error) => {
                                  console.error(error);
                                }
                              );
                          } else {
                          }
                        });
                        this.spinnerService.hide();
                        this.openDialogMensaje(
                          "Correo a miembros Comité",
                          "Se ha enviado correos a los miembros del Comité",
                          true,
                          false,
                          null
                        );
                      },
                      (error) => {
                        console.error(error);
                        this.spinnerService.hide();
                        this.openDialogMensaje(
                          "Correo a miembros Comité",
                          "Error al obtener datos de Autorizador de Pertenencia",
                          true,
                          false,
                          null
                        );
                      }
                    );
                }
              });
          } else {
            this.spinnerService.hide();
            this.openDialogMensaje(
              "Correo a miembros CMAC",
              "Error al generar plantilla correo",
              true,
              false,
              null
            );
          }
        },
        (error) => {
          console.error(error);
          this.spinnerService.hide();
          this.openDialogMensaje(
            "Correo a miembros CMAC",
            "Error al generar plantilla correo",
            true,
            false,
            null
          );
        }
      );
    } else {
      this.spinnerService.hide();
      this.openDialogMensaje(
        "Correo a miembros CMAC",
        "Por favor seleccione a menos un miembro de la lista",
        true,
        false,
        null
      );
    }
  }

  public actualizarActaEscanProgramacionCmac(
    codSolEva: string,
    codReporteActaEscaneada: string
  ) {
    let prog = new ProgramacionCmacRequest();
    prog.codEvaluacion = codSolEva;
    prog.codReporteActaEscaneada = codReporteActaEscaneada;

    this.evaluacionCmacService
      .actualizarActaEscanProgramacionCmac(prog)
      .subscribe(
        (response: WsResponse) => {
          if (response.audiResponse.codigoRespuesta === "0") {
            this.spinnerService.hide();
            this.openDialogMensaje(
              "Se cargo el archivo correctamente",
              null,
              true,
              false,
              null
            );
          } else {
            this.spinnerService.hide();
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
        }
      );
  }

  public accesoOpcionMenu() {
    const data = require("src/assets/data/permisosRecursos.json");
    const bandejaEvaluacion = data.bandejaEvaluacion.resultadoCMAC;
    this.opcionMenu = JSON.parse(localStorage.getItem("opcionMenu"));

    if (this.opcionMenu.opcion.length > 0) {
      this.opcionMenu.opcion.forEach((element) => {
        const codOpcion = element.codOpcion;
        switch (codOpcion) {
          case bandejaEvaluacion.txtFechaReunion:
            this.txtFechaReunion = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtHoraReunion:
            this.txtHoraReunion = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnAgregarSolicitud:
            this.btnAgregarSolicitud = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnImprimirActa:
            this.btnImprimirActa = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.fileActaEscaneada:
            this.fileActaEscaneada = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnCargarActaEscaneada:
            this.btnCargarActaEscaneada = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnGrabar:
            this.btnGrabar = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnEnviar:
            this.btnEnviar = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnSalir:
            this.btnSalir = Number(element.flagAsignacion);
            break;
        }
      });
    }
  }

  openDiaRegistroParticipantes($event: Event) {
    $event.preventDefault();
    if (this.listaParticipantes.length == 0) {
      this.openDialogMensaje(
        "Primero debes filtrar por Fecha Reunión",
        null,
        true,
        false,
        null
      );
    } else {
      const dialogEvaCmac = this.dialog.open(
        RegistroResultadoEvaluacionComponent,
        {
          disableClose: true,
          width: "850px",
          data: {
            title: "REGISTRAR RESULTADO EVALUACIÓN COMITE",
          },
        }
      );
      dialogEvaCmac.afterClosed().subscribe((result) => {
        if (result === 1) {
          this.dialogRef.close();
        } else if (result !== undefined) {
          this.listaParticipantes.push(result);

          this.cargarListaParticipantes();
        }

        //
        //
        //
      });
    }
  }

  eliminarParticipantes(element) {}

  public validarFechaInicio() {}
}
