import {
  Component,
  OnInit,
  forwardRef,
  ViewChild,
  Inject,
} from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import {
  MatTableDataSource,
  MatPaginatorIntl,
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
  MatDialog,
  MatSort,
  MatPaginator,
} from "@angular/material";
import { MatPaginatorIntlEspanol } from "src/app/directives/matpaginator-translate";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import {
  MY_FORMATS_AUNA,
  MENSAJES,
  FILEFTP,
  FLAG_REGLAS_MONITOREO,
  ACCESO_MONITOREO,
  ESTADO_MONITOREO,
  ROLES,
} from "src/app/common";
import { LineaTratamientoModalComponent } from "./linea-tratamiento-modal/linea-tratamiento-modal.component";
import { RegistrarEvolucionComponent } from "./registrar-evolucion/registrar-evolucion.component";
import { EvolucionResponse } from "src/app/dto/response/BandejaMonitoreo/EvolucionResponse";
import { BandejaMonitoreoService } from "src/app/service/BandejaMonitoreo/bandeja.monitoreo.service";
import { listaLineaTratamientoRequest } from "src/app/dto/solicitudEvaluacion/bandeja/ListaHisLineaTratamientoRequest";
import { WsResponse } from "src/app/dto/WsResponse";
import { EvolucionRequest } from "src/app/dto/request/BandejaMonitoreo/EvolucionRequest";
import { ResultadosEvolucionComponent } from "./resultados-evolucion/resultados-evolucion.component";
import { LineaTratamientoResponse } from "src/app/dto/response/BandejaMonitoreo/LineaTratamientoResponse";
import { MarcadoresModalComponent } from "./marcadores-modal/marcadores-modal.component";
import { SeguimientoEjecutivoComponent } from "./seguimiento-ejecutivo/seguimiento-ejecutivo.component";
import { Parametro } from "src/app/dto/Parametro";
import { UsuarioService } from "src/app/dto/service/usuario.service";
import { SegEjecutivoRequest } from "src/app/dto/request/BandejaMonitoreo/SegEjecutivoRequest";
import { MonitoreoResponse } from "src/app/dto/response/BandejaMonitoreo/MonitoreoResponse";
import { DatePipe } from "@angular/common";
import { CoreService } from "src/app/service/core.service";
import { ArchivoFTP } from "src/app/dto/bandeja-preliminar/detalle-preliminar/ArchivoFTP";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { MessageComponent } from "src/app/core/message/message.component";
import { BOpcionMenuLocalStorage } from "src/app/dto/core/BOpcionMenuLocalStorage";
import { elementEnd } from "@angular/core/src/render3/instructions";
import { ReporteEvaluacionService } from "src/app/service/Reportes/Evaluacion/reporte-evaluacion.service";
import { Router } from "@angular/router";
import { BandejaEvaluacionService } from "src/app/service/bandeja.evaluacion.service";
import { Console } from "console";
import { filter } from 'rxjs/operators';

@Component({
  selector: "app-monitoreo-paciente",
  templateUrl: "./monitoreo-paciente.component.html",
  styleUrls: ["./monitoreo-paciente.component.scss"],
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
export class MonitoreoPacienteComponent implements OnInit {
  [x: string]: any;
  step: number;
  datMoniFrmGrp: FormGroup = new FormGroup({
    codTareaFrmCtrl: new FormControl(null),
    estadoTareaFrmCtrl: new FormControl(null),
    codCie10FrmCtrl: new FormControl(null),
    descMACFrmCtrl: new FormControl(null),
    pacienteFrmCtrl: new FormControl(null),
    diagnosticoFrmCtrl: new FormControl(null),
    lineaTrataFrmCtrl: new FormControl(null),
    codAfiliadoFrmCtrl: new FormControl(null),
    grpDiagnosticoFrmCtrl: new FormControl(null),
    fechaProFrmCtrlDate: new FormControl(null),
    fechaProFrmCtrlText: new FormControl(null),
    edadFrmCtrl: new FormControl(null),
    medicoTratanteFrmCtrl: new FormControl(null),
    fInicioTratFrmCtrl: new FormControl(null),
    sexoFrmCtrl: new FormControl(null),
  });

  get codTareaFrmCtrl() {
    return this.datMoniFrmGrp.get("codTareaFrmCtrl");
  }
  get estadoTareaFrmCtrl() {
    return this.datMoniFrmGrp.get("estadoTareaFrmCtrl");
  }
  get codCie10FrmCtrl() {
    return this.datMoniFrmGrp.get("codCie10FrmCtrl");
  }
  get descMACFrmCtrl() {
    return this.datMoniFrmGrp.get("descMACFrmCtrl");
  }
  get pacienteFrmCtrl() {
    return this.datMoniFrmGrp.get("pacienteFrmCtrl");
  }
  get diagnosticoFrmCtrl() {
    return this.datMoniFrmGrp.get("diagnosticoFrmCtrl");
  }
  get lineaTrataFrmCtrl() {
    return this.datMoniFrmGrp.get("lineaTrataFrmCtrl");
  }
  get codAfiliadoFrmCtrl() {
    return this.datMoniFrmGrp.get("codAfiliadoFrmCtrl");
  }
  get grpDiagnosticoFrmCtrl() {
    return this.datMoniFrmGrp.get("grpDiagnosticoFrmCtrl");
  }
  get fechaProFrmCtrlDate() {
    return this.datMoniFrmGrp.get("fechaProFrmCtrlDate");
  }
  get fechaProFrmCtrlText() {
    return this.datMoniFrmGrp.get("fechaProFrmCtrlText");
  }
  get edadFrmCtrl() {
    return this.datMoniFrmGrp.get("edadFrmCtrl");
  }
  get medicoTratanteFrmCtrl() {
    return this.datMoniFrmGrp.get("medicoTratanteFrmCtrl");
  }
  get fInicioTratFrmCtrl() {
    return this.datMoniFrmGrp.get("fInicioTratFrmCtrl");
  }
  get sexoFrmCtrl() {
    return this.datMoniFrmGrp.get("sexoFrmCtrl");
  }
  monitoreo: MonitoreoResponse;
  lineaTratamiento: LineaTratamientoResponse;
  dataSource: MatTableDataSource<EvolucionResponse>;
  isLoading: boolean;
  displayedColumns: string[];
  listaEvolucion: EvolucionResponse[];
  listaTablaToxicidad = [];
  listaEstadosMonitoreo: Parametro[];
  pendSeguimiento: number = 0;
  cantSeguimiento: number = 0;

  columnsGrilla = [
    {
      codAcceso: ACCESO_MONITOREO.detalle.numeroEvolucion,
      columnDef: "nroDescEvolucion",
      header: "N° EVOLUCIÓN",
      cell: (mac: EvolucionResponse) => `${mac.nroDescEvolucion}`,
    },
    {
      codAcceso: ACCESO_MONITOREO.detalle.codigoTarea,
      columnDef: "codDescMonitoreo",
      header: "COD. TAREA MONITOREO",
      cell: (mac: EvolucionResponse) => `${mac.codDescMonitoreo}`,
    },
    {
      codAcceso: ACCESO_MONITOREO.detalle.fechaProgramada,
      columnDef: "fecProxMonitoreo",
      header: "FECHA PROGRAMADA MONITOREO",
      //cell: (mac: EvolucionResponse) => mac.fecProxMonitoreo ? this.datePipe.transform(mac.fecProxMonitoreo, 'dd/MM/yyyy') : "-"
      cell: (mac: EvolucionResponse) =>
        mac.fecProxMonitoreo
          ? this.datePipe.transform(mac.fecProxMonitoreo, "dd/MM/yyyy")
          : "-",
    },
    {
      codAcceso: ACCESO_MONITOREO.detalle.fechaReal,
      columnDef: "fecMonitoreo",
      header: "FECHA REAL MONITOREO",
      cell: (mac: EvolucionResponse) =>
        this.datePipe.transform(mac.fecMonitoreo, "dd/MM/yyyy"),
    },
    {
      codAcceso: ACCESO_MONITOREO.detalle.tolerancia,
      columnDef: "descTolerancia",
      header: "TOLERANCIA",
      cell: (mac: EvolucionResponse) =>
        mac.descTolerancia == null ? "" : `${mac.descTolerancia}`,
    },
    {
      codAcceso: ACCESO_MONITOREO.detalle.toxicidad,
      columnDef: "toxigrado",
      header: "TOXICIDAD",
      cell: (mac: EvolucionResponse) =>
        (mac.toxigrado ? mac.toxigrado[0] : null) == null
          ? ""
          : `${
              mac.toxigrado[0]["nomTipo_Toxicidad"]
                ? mac.toxigrado[0]["nomTipo_Toxicidad"]
                : "-"
            } ${mac.toxigrado.length > 1 ? ", ..." : ""}`,
    },
    {
      codAcceso: ACCESO_MONITOREO.detalle.grado,
      columnDef: "descGrado",
      header: "GRADO",
      cell: (mac: EvolucionResponse) =>
        (mac.toxigrado ? mac.toxigrado[0] : null) == null
          ? ""
          : `${mac.toxigrado[0]["grado"] ? mac.toxigrado[0]["grado"] : "-"} ${
              mac.toxigrado.length > 1 ? ", ..." : ""
            }`,
    },
    {
      codAcceso: ACCESO_MONITOREO.detalle.respuestaClinica,
      columnDef: "descRespClinica",
      header: "RESPUESTA CLÍNICA",
      cell: (mac: EvolucionResponse) =>
        mac.descRespClinica == null ? "" : `${mac.descRespClinica}`,
    },
    {
      codAcceso: ACCESO_MONITOREO.detalle.atencionAlertas,
      columnDef: "descAtenAlerta",
      header: "ATENCIÓN ALERTAS",
      cell: (mac: EvolucionResponse) => `${mac.descAtenAlerta || "-"}`,
    },
    {
      codAcceso: ACCESO_MONITOREO.detalle.fechaUltimo,
      columnDef: "fUltimoConsumo",
      header: "FECHA ÚLTIMO CONSUMO",
      cell: (mac: EvolucionResponse) =>
        this.datePipe.transform(mac.fUltimoConsumo, "dd/MM/yyyy"),
    },
    {
      codAcceso: ACCESO_MONITOREO.detalle.ultimaCantidad,
      columnDef: "ultimaCantConsumida",
      header: "ÚLTIMA CANTIDAD CONSUMIDA",
      cell: (mac: EvolucionResponse) =>
        mac.ultimaCantConsumida != 0 ? `${mac.ultimaCantConsumida}` : "",
    },
  ];
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  opcionMenu: BOpcionMenuLocalStorage;
  txtCodigo: number;
  txtMedicamento: number;
  txtLineaTratamiento: number;
  txtFechaProgramada: number;
  txtFechaInicio: number;
  txtEstado: number;
  txtPaciente: number;
  txtCodigoAfiliado: number;
  txtEdad: number;
  txtSexo: number;
  txtCodigoCIE10: number;
  txtDiagnostico: number;
  txtGrupoDiagnostico: number;
  txtMedicoTratante: number;
  btnLineaTratamiento: number;
  btnInformeMAC: number;
  btnVerMarcador: number;
  btnRegistrarDatos: number;
  btnRegistrarRasultado: number;
  btnVerSeguimiento: number;
  btnRegistrarSeguimiento: number;
  mensaje: string;
  existe: Boolean;
  fechaMonitoreoReporte: any;

  btnVerComentarioTabla: number;
  btnEditarTabla: number;
  flagEvaluacion = FLAG_REGLAS_MONITOREO;
  valorMostrarOpcion = ACCESO_MONITOREO.mostrarOpcion;

  grabarHabilitado: boolean = false;
  marcadorHabilitado: boolean = false;
  visibleBotonCont: boolean;
  disabEdit: boolean = true;

  constructor(
    private dialog: MatDialog,
    private bandejaMonitoreoService: BandejaMonitoreoService,
    @Inject(UsuarioService) private user: UsuarioService,
    private bandejaEvaluacionService: BandejaEvaluacionService,
    private coreService: CoreService,
    private spinnerService: Ng4LoadingSpinnerService,
    private reporteService: ReporteEvaluacionService,
    private router: Router,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.accesoOpcionMenu();

    this.monitoreo = JSON.parse(localStorage.getItem("monitoreo"));
    this.listaEstadosMonitoreo = JSON.parse(
      localStorage.getItem("listaEstadosMonitoreo")
    );
    const validarIntervalo = setInterval(() => {
      if (this.user.getCodRol) {
        this.inicializarVariables();
        this.crearTablaSeguimiento();
        //PARA ACTIVAR EL BOTON REG DATOS
        // quitar true <------------------------
        if (
          this.monitoreo.codResponsableMonitoreo == this.user.getCodUsuario ||
          true
        ) {
          this.grabarHabilitado = true;
        }
        clearInterval(validarIntervalo);
      }
      if (this.user.getCodRol == 6) {
        this.grabarHabilitado = false;
        this.disabEdit = false;
      }
    }, 100);
  }

  public cargarTablaToxicidad(listaEvolucion,i=0) {
    const evolucion = listaEvolucion[i];
    if (!evolucion){
      return;
    }
    let request = new EvolucionRequest();
    request.codEvolucion = evolucion.codEvolucion;

    this.bandejaMonitoreoService.listarEvoToxiGrado(request).subscribe(
      (data: WsResponse) => {
        this.listaTablaToxicidad.push(data.data);
        this.listaEvolucion.find(
          (el) => el.codEvolucion == request.codEvolucion
        )["toxigrado"] = data.data;

        if (this.listaTablaToxicidad.length == this.listaEvolucion.length) {
          this.cargarDatosTabla();
        }
        if(listaEvolucion[i+1]){
          this.cargarTablaToxicidad(listaEvolucion,i+1);
        }else{
          this.obtUltimaLineaTratamiento(this.monitoreo);
        }
      },
      (error) => {
        this.spinnerService.hide();
        console.error("Error registro datos evolucion");
      }
    );
    localStorage.getItem("modeConsultCont")
      ? (this.visibleBotonCont = true)
      : false;
  }

  public inicializarVariables(): void {
    this.codTareaFrmCtrl.setValue(this.monitoreo.codigoDescripcionMonitoreo);
    this.estadoTareaFrmCtrl.setValue(this.monitoreo.nomEstadoMonitoreo);
    this.codCie10FrmCtrl.setValue(this.monitoreo.codDiagnostico);
    this.descMACFrmCtrl.setValue(this.monitoreo.nomMedicamento);
    this.pacienteFrmCtrl.setValue(this.monitoreo.nombrePaciente);
    this.diagnosticoFrmCtrl.setValue(this.monitoreo.nomDiagnostico);
    this.lineaTrataFrmCtrl.setValue(this.monitoreo.numeroLineaTratamiento);
    this.codAfiliadoFrmCtrl.setValue(this.monitoreo.codigoAfiliado);
    this.grpDiagnosticoFrmCtrl.setValue(this.monitoreo.codGrupoDiagnostico);
    this.monitoreo.fechaProximoMonitoreo != null
      ? (this.existe = true)
      : (this.existe = false);
    this.fechaMonitoreoReporte = this.monitoreo.fechaProximoMonitoreo;
    //this.fechaProFrmCtrl.setValue(this.monitoreo.fechaProximoMonitoreo);
    this.existe
      ? this.fechaProFrmCtrlDate.setValue(this.monitoreo.fechaProximoMonitoreo)
      : this.fechaProFrmCtrlText.setValue("-");
    this.edadFrmCtrl.setValue(this.monitoreo.edadPaciente);
    this.medicoTratanteFrmCtrl.setValue(this.monitoreo.medicoTratante);
    this.fInicioTratFrmCtrl.setValue(this.monitoreo.fecIniLineaTratamiento);
    this.sexoFrmCtrl.setValue(this.monitoreo.sexoPaciente);
    this.listaEvolucion = [];
    this.dataSource = null;
    this.isLoading = false;
    this.step = 0;
    this.consDatosGrpDiagnostico(this.monitoreo);
  }

  public crearTablaSeguimiento(): void {
    this.displayedColumns = [];
    this.columnsGrilla.forEach((c) => {
      this.displayedColumns.push(c.columnDef);
    });
    if (this.user.getCodRol == 5) {
      this.displayedColumns.push("verDetalle");
    }
    this.displayedColumns.push("descargarReporte");
  }

  public consDatosGrpDiagnostico(mon: MonitoreoResponse): void {
    let request = new MonitoreoResponse();
    request.codDiagnostico = mon.codDiagnostico;
    request.codGrupoDiagnostico = mon.codGrupoDiagnostico;

    this.bandejaMonitoreoService.consDatosGrpDiagnostico(request).subscribe(
      (data: WsResponse) => {
        if (data.audiResponse.codigoRespuesta === "0") {
          mon.nomDiagnostico = data.data.nomDiagnostico;
          mon.nomGrupoDiagnostico = data.data.nomGrupoDiagnostico;
          this.diagnosticoFrmCtrl.setValue(mon.nomDiagnostico);
          this.grpDiagnosticoFrmCtrl.setValue(mon.nomGrupoDiagnostico);
          this.listarEvoluciones(this.monitoreo.codSolEvaluacion);
        } else {
          console.error(
            "RESPUESTA CONSULTA DATOS:" + data.audiResponse.mensajeRespuesta
          );
        }
      },
      (error) => {
        console.error("Error al consultar datos");
      }
    );
  }

  public descargarReporteEvolucion(row: EvolucionResponse, vista: boolean) {
    this.reporteService.generarReporteEvolucion(row).subscribe(
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

  public descargarReporteMonitoreo(vista: boolean): void {
    //this.monitoreo.fechaProximoMonitoreo = this.fechaProFrmCtrl.value;
    this.monitoreo.fechaProximoMonitoreo = this.fechaMonitoreoReporte;
    this.reporteService.generarReporteMonitoreo(this.monitoreo).subscribe(
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

  public listarEvoluciones(codSolEvaluacion: number): void {
    this.isLoading = true;
    this.dataSource = null;
    this.listaEvolucion = [];
    const request = new EvolucionRequest();
    request.codSolEvaluacion = codSolEvaluacion;

    this.bandejaMonitoreoService.listarEvoluciones(request).subscribe(
      (data: WsResponse) => {
        this.listaTablaToxicidad = [];
        if (data.audiResponse.codigoRespuesta === "0") {
          this.listaEvolucion = data.data;
          let valor= this.listaEvolucion[this.listaEvolucion.length-1];
          if(valor != undefined){
            valor = valor['descEstadoMonitoreo']!=undefined?valor['descEstadoMonitoreo']:'';
            this.estadoTareaFrmCtrl.setValue(valor);
          }else{
            this.estadoTareaFrmCtrl.setValue("");
          }
          this.cargarTablaToxicidad(this.listaEvolucion);
          this.listaEvolucion.map((evolucion) => {
            return evolucion;
          });
        } else {
          console.error(
            "RESPUESTA LISTA EVOLUCIONES:" + data.audiResponse.mensajeRespuesta
          );
        }
        data.data.forEach((element) => {
          if (
            element.pEstadoMonitoreo == 120 ||
            element.pEstadoMonitoreo == 121 ||
            element.pResEvolucion == 226
          ) {
            this.marcadorHabilitado = true;
          }
          if (
            element.pResEvolucion == 226 &&
            element.pMotivoInactivacion == 212
          ) {
            this.marcadorHabilitado = false;
          }
        });

        // fecProxMonitoreo
        /*if(this.listaEvolucion.length>0){
          this.listaEvolucion[this.listaEvolucion.length-1].fecProxMonitoreo ?this.fechaProFrmCtrl.setValue(this.listaEvolucion[this.listaEvolucion.length-1].fecProxMonitoreo):this.fechaProFrmCtrl.setValue("-");
        }*/
        this.cargarDatosTabla();
        this.isLoading = false;

      },
      (error) => {
        console.error("Error al listar monitoreo");
        this.isLoading = false;
      }
    );
  }

  public obtUltimaLineaTratamiento(mon: MonitoreoResponse): void {
    let request = new listaLineaTratamientoRequest();

    this.bandejaMonitoreoService.getUltLineaTratamiento(request).subscribe(
      (data: WsResponse) => {
        if (data.audiResponse.codigoRespuesta === "0") {
          this.lineaTratamiento = data.data;
        } else {
          console.error(
            "ULTIMA LINEA DE TRATAMIENTO:" + data.audiResponse.mensajeRespuesta
          );
        }
        if (this.user.getCodRol == ROLES.responsableMonitoreo) {
          // 121 5 => RESPONSABLE MONITOREO
          this.getSeguimientosPendientes(this.monitoreo);
        }
      },
      (error) => {
        console.error("Error al listar monitoreo");
      }
    );
  }

  public getSeguimientosPendientes(mon: MonitoreoResponse): void {
    let request = new SegEjecutivoRequest();
    request.codMonitoreo = mon.codigoMonitoreo;

    this.bandejaMonitoreoService.getSeguimientosPendientes(request).subscribe(
      (data: WsResponse) => {
        if (data.audiResponse.codigoRespuesta === "0") {
          this.pendSeguimiento = data.data.pendientes;
          this.cantSeguimiento = data.data.seguimiento;
        } else {
          console.error(
            "Seguimientos pendientes:" + data.audiResponse.mensajeRespuesta
          );
        }
      },
      (error) => {
        console.error("Error al listar monitoreo");
      }
    );
  }

  public cargarDatosTabla(): void {
    if (this.listaEvolucion.length > 0) {
      this.dataSource = new MatTableDataSource(this.listaEvolucion);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  public setStep(valor: number) {
    this.step = valor;
  }

  public verHistorialLineasTratamiento(): void {
    const dialogRef = this.dialog.open(LineaTratamientoModalComponent, {
      width: "650px",
      disableClose: true,
      data: {
        title: MENSAJES.MONITOREO.LINEA.TITLE,
        monitoreo: this.monitoreo,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  public verEvaluacionMAC(codEvaluacion: string, codAfiliado: string): void {
    this.spinnerService.show();
    var data = {
      cod_afiliado: codAfiliado,
      cod_evaluacion: Number(codEvaluacion),
    };
    this.reporteService.generarReporteGeneral(data).subscribe(
      (response: WsResponse) => {
        if (response.audiResponse.codigoRespuesta === "0") {
          response.data.contentType = "application/pdf";
          const blob = this.coreService.crearBlobFile(response.data);
          this.spinnerService.hide();
          const link = document.createElement("a");
          link.target = "_blank";
          link.href = window.URL.createObjectURL(blob);
          link.setAttribute("download", response.data.nomArchivo);
          link.click();
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
    /*let request = new ArchivoFTP();

    request.usrApp = FILEFTP.usrApp;
    request.codArchivo = codInfor;
    request.nomArchivo = "";
    request.ruta = "";*/

    // request.codSolicitudEvaluacion = 175;
    // request.codArchivo = null;
    // request.descripcionDiagnostico = "GRIPE";
    // request.codAfiliado = "10107794100640143";
    // request.codDiagnostico = "37";
    // request.nombreMedicoAuditor = "ADONIS DINIZ VISCARRA";
    // request.nombrePaciente = "AMILCAR BOSCAN";
    // request.sexo = "MASCULINO";
    // request.codMac = 1;
    // request.codGrupopDiagnostico = 37;

    // this.bandejaMonitoreoService.getPdfEvaluacionMACXCodigo(request).subscribe(
    //   (data: WsResponse) => {
    //     if (data.audiResponse.codigoRespuesta === "0") {
    //       this.spinnerService.hide();
    //       data.data.contentType = "application/pdf";
    //       const blob = this.coreService.crearBlobFile(data.data);

    //       const link = document.createElement("a");
    //       link.target = "_blank";
    //       link.href = window.URL.createObjectURL(blob);
    //       link.setAttribute("download", data.data.nomArchivo);
    //       link.click();

    //       window.open(window.URL.createObjectURL(blob), "_blank");
    //       //this.spinnerService.hide();
    //     } else {
    //       this.spinnerService.hide();
    //       this.openDialogMensaje(
    //         MENSAJES.MONITOREO.DETALLE.TITLE,
    //         "No se pudo cargar el reporte",
    //         true,
    //         false,
    //         null
    //       );
    //     }
    //   },
    //   (error) => {
    //     console.error(error);
    //     this.openDialogMensaje(
    //       MENSAJES.MONITOREO.DETALLE.TITLE,
    //       "No se pudo cargar el reporte",
    //       true,
    //       false,
    //       null
    //     );
    //   }
    // );
  }

  public verDetalleEvolucion(row: EvolucionResponse) {
    const dialogRef = this.dialog.open(RegistrarEvolucionComponent, {
      width: "650px",
      disableClose: true,
      data: {
        title: MENSAJES.MONITOREO.EVOLUCION.TITLE_VER_COMENTARIO,
        monitoreo: this.monitoreo,
        lineaTratamiento: this.lineaTratamiento,
        listaEvolucion: this.listaEvolucion,
        evolucion: row,
        tipo: 3,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  public editarEvolucion(row: EvolucionResponse) {
    const dialogRef = this.dialog.open(RegistrarEvolucionComponent, {
      width: "650px",
      disableClose: true,
      data: {
        title: MENSAJES.MONITOREO.EVOLUCION.TITLE_EDIT_DATOS,
        monitoreo: this.monitoreo,
        lineaTratamiento: this.lineaTratamiento,
        listaEvolucion: this.listaEvolucion,
        evolucion: row,
        tipo: 2,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.actualizarEstadoMonitoreo(this.monitoreo, result);
        this.listarEvoluciones(this.monitoreo.codSolEvaluacion);
      }
    });
  }

  public verMarcadores(): void {
    const dialogRef = this.dialog.open(MarcadoresModalComponent, {
      width: "650px",
      height: "600px",
      disableClose: true,
      data: {
        title: MENSAJES.MONITOREO.EVOLUCION.TITLE_DATOS,
        monitoreo: this.monitoreo,
        listaEvolucion: this.listaEvolucion,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }
  public tablaToxicidad() {
    let evolucion = this.listaEvolucion.filter(
      (evo) => evo.codMonitoreo == this.monitoreo.codigoMonitoreo
    )[0];

    if (this.lineaTratamiento) {
      const dialogRef = this.dialog.open(RegistrarEvolucionComponent, {
        width: "650px",
        disableClose: true,
        data: {
          title: MENSAJES.MONITOREO.EVOLUCION.TITLE_DATOS,
          monitoreo: this.monitoreo,
          lineaTratamiento: this.lineaTratamiento,
          listaEvolucion: this.listaEvolucion,
          evolucion: evolucion,
          tipo: 4,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.actualizarEstadoMonitoreo(
            this.monitoreo,
            result
          );
          this.listarEvoluciones(this.monitoreo.codSolEvaluacion);
        }
      });
    } else {
      alert(
        "NO EXISTE UNA LINEA DE TRATAMIENTO ASOCIADA A ESTA SOLICITUD DE EVALUACION"
      );
    }
  }

  public registrarDatosEvolucion(): void {
    //REDIRECCION A MODAL

    let evolucion = this.listaEvolucion.filter(
      (evo) => evo.codMonitoreo == this.monitoreo.codigoMonitoreo
    )[0];

      const dialogRef = this.dialog.open(RegistrarEvolucionComponent, {
        width: "650px",
        disableClose: true,
        data: {
          title: "REGISTRAR DATOS EVOLUCION",
          monitoreo: this.monitoreo,
          lineaTratamiento: this.lineaTratamiento,
          listaEvolucion: this.listaEvolucion,
          evolucion: evolucion,
          tipo: 1,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          if (result.pResEvolucion == 226) {
            this.marcadorHabilitado = true;
          }
          if (
            result.pResEvolucion == 226 &&
            result.pMotivoInactivacion == 212
          ) {
            this.marcadorHabilitado = false;
          }
          this.actualizarEstadoMonitoreo(
            this.monitoreo,
            result
          );
          this.listarEvoluciones(this.monitoreo.codSolEvaluacion);
        }
      });
  }

  public registrarResultadoEvolucion(): void {
    //FILTRA LA EVOLUCION
    let evolucion = this.listaEvolucion.filter(
      (evo) => evo.codMonitoreo == this.monitoreo.codigoMonitoreo
    )[0];

    if (this.lineaTratamiento && evolucion) {
      const dialogRef = this.dialog.open(ResultadosEvolucionComponent, {
        width: "650px",
        disableClose: false,
        data: {
          title: MENSAJES.MONITOREO.EVOLUCION.TITLE_RES_EVOL,
          monitoreo: this.monitoreo,
          lineaTratamiento: this.lineaTratamiento,
          evolucion: evolucion,
        },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result.codigoRespuesta == 0) {
          // this.actualizarEstadoMonitoreo(this.monitoreo, result.pEstadoMonitoreo);
          this.listarEvoluciones(this.monitoreo.codSolEvaluacion);
        }
      });
    } else {
      alert(
        "NO PUDO SER CARGADA LA LINEA DE TRATAMIENTO ASOCIADA A ESTA SOLICITUD DE EVALUACION"
      );
    }
  }

  public regSeguimientoEjecutivo(): void {
    const tamano = this.listaEvolucion.length - 1;

    let evolucion = this.listaEvolucion.filter(
      (evo) => evo.codMonitoreo == this.monitoreo.codigoMonitoreo
    )[0];
    const dialogRef = this.dialog.open(SeguimientoEjecutivoComponent, {
      width: "650px",
      height: "600px",
      disableClose: true,
      data: {
        title: MENSAJES.MONITOREO.SEGUIMIENTO.TITLE_SEG_EJECUTIVO,
        monitoreo: this.monitoreo,
        tipo: 1,
        listaEvolucion: this.listaEvolucion[tamano],
        evolucion: evolucion,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.pEstadoMonitoreo) {
          this.actualizarEstadoMonitoreo(
            this.monitoreo,
            result
          );
        }
      }
    });
  }

  public verSeguimientoEjecutivo(): void {
    // ACTUALIZA TODOS LOS PENDIENTES A VISTOS
    if (this.user.getCodRol === 5) {
      let request = new SegEjecutivoRequest();
      request.codMonitoreo = this.monitoreo.codigoMonitoreo;

      this.bandejaMonitoreoService.actEstadoSegPendientes(request).subscribe(
        (data: WsResponse) => {
          if (data.audiResponse.codigoRespuesta === "0") {
            this.pendSeguimiento = 0;
          } else {
            console.error(
              "Actualizacion estado: " + data.audiResponse.mensajeRespuesta
            );
          }
        },
        (error) => {
          console.error("Error al listar monitoreo");
        }
      );
    }

    //MUESTRA MODAL

    const dialogRef = this.dialog.open(SeguimientoEjecutivoComponent, {
      width: "650px",
      height: "600px",
      disableClose: true,
      data: {
        title: MENSAJES.MONITOREO.SEGUIMIENTO.TITLE_SEG_EJECUTIVO,
        monitoreo: this.monitoreo,
        tipo: 2,
        user: this.user.getCodRol,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result.pEstadoMonitoreo) {
          this.actualizarEstadoMonitoreo(
            this.monitoreo,
            result
          );
        }
      }
    });
  }

  public actualizarEstadoMonitoreo(
    mon: MonitoreoResponse,
    result: any
  ) {
    let pEstadomonitoreo = parseInt(result.pEstadoMonitoreo);
    let estadoMon = this.listaEstadosMonitoreo.filter(
      (elem) => parseInt(elem.codigoParametro) == pEstadomonitoreo
    )[0];
    if (estadoMon) {
      mon.nomEstadoMonitoreo = estadoMon.nombreParametro;
      mon.codEstadoMonitoreo = pEstadomonitoreo;
      //this.estadoTareaFrmCtrl.setValue(mon.nomEstadoMonitoreo);
    }

    let evolucionActualizar = this.listaEvolucion.filter(dato =>{
        return result.codEvolucion == dato.codEvolucion
    })

    if(evolucionActualizar.length != 0 ){
      if (parseInt(evolucionActualizar[0].nroDescEvolucion) == this.listaEvolucion.length){
        this.estadoTareaFrmCtrl.setValue(mon.nomEstadoMonitoreo);
      }
    }


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
        title: MENSAJES.MONITOREO.TITLE,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }

  public irEvaluacionContinuador(): void {
    //this.ponerBanderaSolicitud();
    this.router.navigate(["/app/medicamento-continuador"]);
  }

  ponerBanderaSolicitud() {
    let codSolEva = localStorage.getItem("codSolEva");
    var json = {
      codSolEva: codSolEva,
      tipo: "ENTRANDO",
      codUsuario: this.user.getCodUsuario,
      nombreUsuario: this.user.getNombres,
      apePaternoUsuario: this.user.getApelPaterno,
      apeMaternoUsuario: this.user.getApelMaterno,
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
  public accesoOpcionMenu() {
    const data = require("src/assets/data/permisosRecursos.json");
    const bandejaMonitoreo = data.bandejaMonitoreo.detalle;
    this.opcionMenu = JSON.parse(localStorage.getItem("opcionMenu"));

    if (this.opcionMenu.opcion.length > 0) {
      this.opcionMenu.opcion.forEach((element) => {
        const codOpcion = element.codOpcion;
        switch (codOpcion) {
          case bandejaMonitoreo.txtCodigo:
            this.txtCodigo = Number(element.flagAsignacion);
            break;
          case bandejaMonitoreo.txtMedicamento:
            this.txtMedicamento = Number(element.flagAsignacion);
            break;
          case bandejaMonitoreo.txtLineaTratamiento:
            this.txtLineaTratamiento = Number(element.flagAsignacion);
            break;
          case bandejaMonitoreo.txtFechaProgramada:
            this.txtFechaProgramada = Number(element.flagAsignacion);
            break;
          case bandejaMonitoreo.txtFechaInicio:
            this.txtFechaInicio = Number(element.flagAsignacion);
            break;
          case bandejaMonitoreo.txtEstado:
            this.txtEstado = Number(element.flagAsignacion);
            break;
          case bandejaMonitoreo.txtPaciente:
            this.txtPaciente = Number(element.flagAsignacion);
            break;
          case bandejaMonitoreo.txtCodigoAfiliado:
            this.txtCodigoAfiliado = Number(element.flagAsignacion);
            break;
          case bandejaMonitoreo.txtEdad:
            this.txtEdad = Number(element.flagAsignacion);
            break;
          case bandejaMonitoreo.txtSexo:
            this.txtSexo = Number(element.flagAsignacion);
            break;
          case bandejaMonitoreo.txtCodigoCIE10:
            this.txtCodigoCIE10 = Number(element.flagAsignacion);
            break;
          case bandejaMonitoreo.txtDiagnostico:
            this.txtDiagnostico = Number(element.flagAsignacion);
            break;
          case bandejaMonitoreo.txtGrupoDiagnostico:
            this.txtGrupoDiagnostico = Number(element.flagAsignacion);
            break;
          case bandejaMonitoreo.txtMedicoTratante:
            this.txtMedicoTratante = Number(element.flagAsignacion);
            break;
          case bandejaMonitoreo.btnLineaTratamiento:
            this.btnLineaTratamiento = Number(element.flagAsignacion);
            break;
          case bandejaMonitoreo.btnInformeMAC:
            this.btnInformeMAC = Number(element.flagAsignacion);
            break;
          case bandejaMonitoreo.btnVerMarcador:
            this.btnVerMarcador = Number(element.flagAsignacion);
            break;
          case bandejaMonitoreo.btnRegistrarDatos:
            this.btnRegistrarDatos = Number(element.flagAsignacion);
            break;
          case bandejaMonitoreo.btnRegistrarRasultado:
            this.btnRegistrarRasultado = Number(element.flagAsignacion);
            break;
          case bandejaMonitoreo.btnVerSeguimiento:
            this.btnVerSeguimiento = Number(element.flagAsignacion);
            break;
          case bandejaMonitoreo.btnRegistrarSeguimiento:
            this.btnRegistrarSeguimiento = Number(element.flagAsignacion);
            break;
          case bandejaMonitoreo.btnVerComentario:
            this.btnVerComentarioTabla = Number(element.flagAsignacion);
            break;
          case bandejaMonitoreo.btnEditar:
            this.btnEditarTabla = Number(element.flagAsignacion);
            break;
        }
      });
    }
  }
}
