import { Component, OnInit, ViewChild, Inject } from "@angular/core";
import {
  MatTableDataSource,
  MatPaginator,
  MatSort,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
} from "@angular/material";
import { DatePipe, DecimalPipe } from "@angular/common";
import { listaLineaTratamientoRequest } from "src/app/dto/solicitudEvaluacion/bandeja/ListaHisLineaTratamientoRequest";
import { BandejaMonitoreoService } from "src/app/service/BandejaMonitoreo/bandeja.monitoreo.service";
import { WsResponse } from "src/app/dto/WsResponse";
import { LineaTratamientoResponse } from "src/app/dto/response/BandejaMonitoreo/LineaTratamientoResponse";
import { MonitoreoResponse } from "src/app/dto/response/BandejaMonitoreo/MonitoreoResponse";
import { ACCESO_MONITOREO, MENSAJES, FILEFTP } from "src/app/common";
import { BOpcionMenuLocalStorage } from "src/app/dto/core/BOpcionMenuLocalStorage";
import { MessageComponent } from "src/app/core/message/message.component";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { ArchivoFTP } from "src/app/dto/bandeja-preliminar/detalle-preliminar/ArchivoFTP";
import { CoreService } from "src/app/service/core.service";
import { Router } from "@angular/router";
import { UsuarioService } from "src/app/dto/service/usuario.service";
import { EvaluacionService } from "src/app/dto/service/evaluacion.service";
import { BandejaEvaluacionService } from "src/app/service/bandeja.evaluacion.service";
import { ListaEvaluaciones } from "src/app/dto/solicitudEvaluacion/bandeja/ListaEvaluaciones";
import { ListaEvaluacionesRequest } from "src/app/dto/solicitudEvaluacion/bandeja/ListaEvaluacionesRequest";
import { ReporteEvaluacionService } from "src/app/service/Reportes/Evaluacion/reporte-evaluacion.service";

export interface DataModal {
  title: string;
  monitoreo: MonitoreoResponse;
}

@Component({
  selector: "app-linea-tratamiento-modal",
  templateUrl: "./linea-tratamiento-modal.component.html",
  styleUrls: ["./linea-tratamiento-modal.component.scss"],
})
export class LineaTratamientoModalComponent implements OnInit {
  // Tabla
  dataSource: MatTableDataSource<LineaTratamientoResponse>;
  listaLineaTratamiento: LineaTratamientoResponse[];
  isLoading: boolean;
  displayedColumns: string[];
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  columnsGrilla = [
    //   {
    //   codAcceso: ACCESO_MONITOREO.lineaTratamiento.lineaTratamiento,
    //   columnDef: 'lineaTratamiento',
    //   header: 'LINEA DE TRATAMIENTO',
    //   cell: (lineaTrat: LineaTratamientoResponse) => `${lineaTrat.lineaTratamiento}`
    // },
    {
      codAcceso: ACCESO_MONITOREO.lineaTratamiento.numeroSolicitud,
      columnDef: "codEvaluacion",
      header: "N° SOLICITUD EVALUACIÓN",
      cell: (lineaTrat: LineaTratamientoResponse) =>
        lineaTrat.codEvaluacion != null ? `${lineaTrat.codEvaluacion}` : "",
    },
    {
      codAcceso: ACCESO_MONITOREO.lineaTratamiento.fechaAprobacion,
      columnDef: "fecAprobacion",
      header: "FECHA DE APROBACIÓN",
      cell: (lineaTrat: LineaTratamientoResponse) =>
        this.datePipe.transform(lineaTrat.fecAprobacion, "dd/MM/yyyy"),
    },
    {
      codAcceso: ACCESO_MONITOREO.lineaTratamiento.numeroSGC,
      columnDef: "nroScgSolben",
      header: "N° SCG SOLBEN",
      cell: (lineaTrat: LineaTratamientoResponse) =>
        lineaTrat.nroScgSolben != null ? `${lineaTrat.nroScgSolben}` : "",
    },
    {
      codAcceso: ACCESO_MONITOREO.lineaTratamiento.fechaSGC,
      columnDef: "fecScgSolben",
      header: "FECHA SCG SOLBEN",
      cell: (lineaTrat: LineaTratamientoResponse) =>
        this.datePipe.transform(lineaTrat.fecScgSolben, "dd/MM/yyyy"),
    },
    {
      codAcceso: ACCESO_MONITOREO.lineaTratamiento.numeroInforme,
      columnDef: "nroInforme",
      header: "N° INFORME",
      cell: (lineaTrat: LineaTratamientoResponse) =>
        lineaTrat.nroInforme != null ? `${lineaTrat.nroInforme}` : "",
    },
    {
      codAcceso: ACCESO_MONITOREO.lineaTratamiento.fechaEmision,
      columnDef: "fecEmision",
      header: "FECHA DE EMISIÓN",
      cell: (lineaTrat: LineaTratamientoResponse) =>
        this.datePipe.transform(lineaTrat.fecEmision, "dd/MM/yyyy"),
    },
    {
      codAcceso: ACCESO_MONITOREO.lineaTratamiento.auditorEvaluacion,
      columnDef: "nomAuditorEvaluacion",
      header: "AUDITOR REALIZO EVALUACIÓN",
      cell: (lineaTrat: LineaTratamientoResponse) =>
        lineaTrat.nomAuditorEvaluacion != null
          ? `${lineaTrat.nomAuditorEvaluacion}`
          : "",
    },
    {
      codAcceso: ACCESO_MONITOREO.lineaTratamiento.numeroCG,
      columnDef: "nroCgSolben",
      header: "N° CG SOLBEN",
      cell: (lineaTrat: LineaTratamientoResponse) =>
        lineaTrat.nroCgSolben != null ? `${lineaTrat.nroCgSolben}` : "",
    },
    {
      codAcceso: ACCESO_MONITOREO.lineaTratamiento.fechaCG,
      columnDef: "fecCgSolben",
      header: "FECHA CG SOLBEN",
      cell: (lineaTrat: LineaTratamientoResponse) =>
        lineaTrat.fecCgSolben != null ? `${lineaTrat.fecCgSolben}` : "",
    },
    {
      codAcceso: ACCESO_MONITOREO.lineaTratamiento.medicamento,
      columnDef: "macSolicitado",
      header: "MEDICAMENTO SOLICITADO",
      cell: (lineaTrat: LineaTratamientoResponse) =>
        lineaTrat.macSolicitado != null ? `${lineaTrat.macSolicitado}` : "",
    },
    {
      codAcceso: ACCESO_MONITOREO.lineaTratamiento.medicoTratante,
      columnDef: "medicoTratantePrescriptor",
      header: "MEDICO TRATANTE",
      cell: (lineaTrat: LineaTratamientoResponse) =>
        `${lineaTrat.medicoTratantePrescriptor}`,
    },
    {
      codAcceso: ACCESO_MONITOREO.lineaTratamiento.montoAutorizado,
      columnDef: "montoAutorizado",
      header: "MONTO AUTORIZADO",
      cell: (lineaTrat: LineaTratamientoResponse) =>
        this.decimalPipe.transform(lineaTrat.montoAutorizado, "1.2-2"),
    },
  ];

  opcionMenu: BOpcionMenuLocalStorage;
  mensaje: string;
  dataEvaluacion;
  hideBotonDet: boolean = true;
  modeConsulta;

  listaEva: ListaEvaluaciones;
  constructor(
    private spinnerService: Ng4LoadingSpinnerService,
    private coreService: CoreService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<LineaTratamientoModalComponent>,
    private datePipe: DatePipe,
    private decimalPipe: DecimalPipe,
    private bandejaMonitoreoService: BandejaMonitoreoService,
    private router: Router,
    private reporteService: ReporteEvaluacionService,
    private bandejaEvaluacionService: BandejaEvaluacionService,
    @Inject(EvaluacionService) private solicitud: EvaluacionService,
    @Inject(UsuarioService) private userService: UsuarioService,
    @Inject(MAT_DIALOG_DATA) public data: DataModal
  ) {}

  ngOnInit() {
    this.accesoOpcionMenu();
    this.listarLineaTratamiento();
    
    this.inicializarVariables();
    this.crearTablaLineaTratamiento();
    this.obtenerListaLineasTratamiento();
  }

  public inicializarVariables(): void {
    this.listaLineaTratamiento = [];
    this.dataSource = null;
    this.isLoading = false;
  }

  public verificarDataEvaluacion(): void {
    const evaRequest: ListaEvaluacionesRequest = new ListaEvaluacionesRequest();
    this.bandejaEvaluacionService
      .listarDetalleSolicitud(evaRequest)
      .subscribe((data) => {
        this.dataEvaluacion = data.dataList;

        this.dataEvaluacion.forEach((element) => {
          this.listaLineaTratamiento.forEach((e) => {
            if (element.codSolEvaluacion == e.nroInforme) {
              this.hideBotonDet = false;
            }
          });
        });
      });
      
  }

  public crearTablaLineaTratamiento(): void {
    this.displayedColumns = [];
    this.displayedColumns.push("verInforme");
    this.columnsGrilla.forEach((c) => {
      this.displayedColumns.push(c.columnDef);
    });
  }

  public cargarDatosTabla(): void {
    if (this.listaLineaTratamiento.length > 0) {
      this.dataSource = new MatTableDataSource(this.listaLineaTratamiento);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  public obtenerListaLineasTratamiento(): void {
    this.listaLineaTratamiento = [];
    this.dataSource = null;
    this.isLoading = true; // Muestra el Spinner;
    this.isLoading = false; // Oculta el Spinner;
    this.cargarDatosTabla();
  }

  public opcionSalir(): void {
    this.dialogRef.close(null);
  }

  public listarLineaTratamiento(): void {
    this.isLoading = true;
    this.dataSource = null;
    this.listaLineaTratamiento = [];
    let request = new listaLineaTratamientoRequest();
    request.codigoAfiliado = this.data.monitoreo.codigoAfiliado;
    this.bandejaMonitoreoService.listarLineaTratamiento(request).subscribe(
      (data: WsResponse) => {
        if (data.audiResponse.codigoRespuesta === "0") {
          this.listaLineaTratamiento = data.data;
        } else {
          console.error(
            "RESPUESTA LINEA DE TRATAMIENTO:" +
              data.audiResponse.mensajeRespuesta
          );
        }
        this.cargarDatosTabla();
        this.isLoading = false;
        this.verificarDataEvaluacion();
      },
      (error) => {
        console.error("Error al listar monitoreo");
        this.isLoading = false;
      }
    );
  }

  public accesoOpcionMenu() {
    this.opcionMenu = JSON.parse(localStorage.getItem("opcionMenu"));
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

  public mostrarInforme(elem: LineaTratamientoResponse) {
    this.spinnerService.show();
    var data = {
      cod_afiliado: elem.codAfiliado,
      cod_evaluacion: Number(elem.codEvaluacion),
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
  }

  public busquedaEvaluacion() {
    const evaRequest: ListaEvaluacionesRequest = new ListaEvaluacionesRequest();

    this.bandejaEvaluacionService
      .listarDetalleSolicitud(evaRequest)
      .subscribe((data) => {
        this.dataEvaluacion = data.dataList;

        this.dataEvaluacion.forEach((element) => {
          this.listaLineaTratamiento.forEach((e) => {
            if (element.codSolEvaluacion == e.nroInforme) {
              this.listaEva = element;
            }
          });
        });

        this.verDetalleSolicitud(this.listaEva);
      });
  }

  public verDetalleSolicitud(rowEvaluacion: ListaEvaluaciones) {
    //servicio

    localStorage.setItem("codigoPaciente", rowEvaluacion.codigoPaciente);
    let codSolEva = rowEvaluacion.codEvaluacion;
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
        this.dialogRef.close(null);
        this.capturarVariableLocal(rowEvaluacion);
        if (!localStorage.getItem("modeConsultaEva")) {
          localStorage.setItem("modeConsulta", "true");
        }

        this.router.navigate(["/app/detalle-evaluacion"]);
      },
      (error) => {
        console.error(error);
        this.mensaje = "ERROR CON EL SERVICIO BANDEJA EVALUACION.";
        this.openDialogMensaje(this.mensaje, null, true, false, null);
        this.spinnerService.hide();
      }
    );
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
}
