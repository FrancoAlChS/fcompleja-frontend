import {
  Component,
  OnInit,
  ViewChild,
  forwardRef,
  Inject,
} from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { ListaSeguimiento } from "src/app/dto/request/BandejaEvaluacion/ListaSeguimiento";
import {
  MatTableDataSource,
  MatSort,
  MatPaginator,
  MatDialog,
  MatPaginatorIntl,
} from "@angular/material";
import { Router } from "@angular/router";
import { MessageComponent } from "src/app/core/message/message.component";
import {
  MENSAJES,
  ACCESO_EVALUACION,
  FLAG_REGLAS_EVALUACION,
  FILEFTP,
} from "src/app/common";
import { BEvaluacionLocalStorage } from "src/app/dto/solicitudEvaluacion/bandeja/BEvaluacionLocalStorage";
import { SeguimientoEvaluacionService } from "src/app/service/BandejaEvaluacion/seguimiento.evaluacion.service";
import { WsResponse } from "src/app/dto/WsResponse";
import { ListaEvaluacionesRequest } from "src/app/dto/solicitudEvaluacion/bandeja/ListaEvaluacionesRequest";
import { MatPaginatorIntlEspanol } from "src/app/directives/matpaginator-translate";
import { EvaluacionService } from "src/app/dto/service/evaluacion.service";
import { BOpcionMenuLocalStorage } from "src/app/dto/core/BOpcionMenuLocalStorage";
import { ArchivoFTP } from "src/app/dto/bandeja-preliminar/detalle-preliminar/ArchivoFTP";
import { BandejaMonitoreoService } from "src/app/service/BandejaMonitoreo/bandeja.monitoreo.service";
import { CoreService } from "src/app/service/core.service";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";

@Component({
  selector: "app-seguimiento-evaluacion",
  templateUrl: "./seguimiento.evaluacion.component.html",
  styleUrls: ["./seguimiento.evaluacion.component.scss"],
  providers: [
    {
      provide: MatPaginatorIntl,
      useClass: forwardRef(() => MatPaginatorIntlEspanol),
    },
  ],
})
export class SeguimientoEvaluacionComponent implements OnInit {
  segEvaFrmGrp: FormGroup;

  dataListaSeguimiento: ListaSeguimiento[];
  dataSource: MatTableDataSource<ListaSeguimiento>;
  displayedColumns: string[];
  isLoading: boolean;
  columnsGrilla = [
    {
      codAcceso: ACCESO_EVALUACION.estSolEvalSeguimiento,
      columnDef: "descEstadoEvaluacion",
      header: "ESTADO SOLICITUD",
      cell: (seguimiento: ListaSeguimiento) =>
        `${seguimiento.descEstadoEvaluacion}`,
    },
    {
      codAcceso: ACCESO_EVALUACION.fecHorEstSeguimiento,
      columnDef: "fechaEvaluacion",
      header: "FECHA - HORA ESTADO",
      cell: (seguimiento: ListaSeguimiento) => `${seguimiento.fechaEvaluacion}`,
    },
    {
      codAcceso: ACCESO_EVALUACION.rolResEstSeguimiento,
      columnDef: "descRolRespEstado",
      header: "ROL RESPONSABLE ESTADO",
      cell: (seguimiento: ListaSeguimiento) =>
        `${seguimiento.descRolRespEstado}`,
    },
    {
      codAcceso: ACCESO_EVALUACION.usrResEstSeguimiento,
      columnDef: "descUsrRespEstado",
      header: "USUARIO RESPONSABLE ESTADO",
      cell: (seguimiento: ListaSeguimiento) =>
        `${seguimiento.descUsrRespEstado}`,
    },
    {
      codAcceso: ACCESO_EVALUACION.rolResRegEstSeguimiento,
      columnDef: "descRolRespRegistroEstado",
      header: "ROL RESPONSABLE REGISTRO ESTADO",
      cell: (seguimiento: ListaSeguimiento) =>
        `${seguimiento.descRolRespRegistroEstado}`,
    },
    {
      codAcceso: ACCESO_EVALUACION.usrResRegEstSeguimiento,
      columnDef: "descUsrRespRegistroEstado",
      header: "USUARIO RESPONSABLE REGISTRO ESTADO",
      cell: (seguimiento: ListaSeguimiento) =>
        `${seguimiento.descUsrRespRegistroEstado}`,
    },
  ];

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  opcionMenu: BOpcionMenuLocalStorage;
  txtNumeroSolicitud: number;
  txtEstadoActual: number;
  txtCodigoMac: number;
  txtDescripcionMac: number;
  txtRolResponsable: number;
  btnInforme: number;
  btnActa: number;
  btnActaMac: number = 1;
  flagEvaluacion = FLAG_REGLAS_EVALUACION;
  valorMostrarOpcion = ACCESO_EVALUACION.mostrarOpcion;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private seguimientoEvaluacionService: SeguimientoEvaluacionService,
    private bandejaMonitoreoService: BandejaMonitoreoService,
    private spinnerService: Ng4LoadingSpinnerService,
    private coreService: CoreService,
    @Inject(EvaluacionService) private solicitud: EvaluacionService
  ) {}

  evaluacionRequest: ListaEvaluacionesRequest = new ListaEvaluacionesRequest();

  ngOnInit() {
    this.accesoOpcionMenu();
    this.createFormGroup();
    this.inicializarVariables();
    this.definirTablaSeguimiento();
    this.consultarInformAutorizYCmac(this.solicitud);
  }

  public inicializarVariables(): void {
    this.nroSolEvaFrmCtrl.setValue(this.solicitud.numeroSolEvaluacion);
    this.estadoSolEvaFrmCtrl.setValue(this.solicitud.descEstadoEvaluacion);
    this.codMACFrmCtrl.setValue(this.solicitud.codMac);
    this.descMACFrmCtrl.setValue(this.solicitud.descMAC);
    this.rolResponsableFrmCtrl.setValue(
      this.solicitud.nombreRolResponsablePenEva
    );
    this.displayedColumns = [];
    this.dataListaSeguimiento = [];
    this.dataSource = null;
    this.isLoading = false;
  }

  public definirTablaSeguimiento(): void {
    this.columnsGrilla.forEach((column) => {
      if (this.flagEvaluacion) {
        this.displayedColumns.push(column.columnDef);
      } else {
        this.opcionMenu.opcion.forEach((element) => {
          if (
            column.codAcceso &&
            column.codAcceso === element.codOpcion &&
            Number(element.flagAsignacion) === ACCESO_EVALUACION.mostrarOpcion
          ) {
            this.displayedColumns.push(column.columnDef);
          }
        });
      }
    });
  }

  public createFormGroup(): void {
    this.segEvaFrmGrp = new FormGroup({
      nroSolEvaFrmCtrl: new FormControl(null),
      estadoSolEvaFrmCtrl: new FormControl(null),
      codMACFrmCtrl: new FormControl(null),
      descMACFrmCtrl: new FormControl(null),
      rolResponsableFrmCtrl: new FormControl(null),
    });
  }

  get nroSolEvaFrmCtrl() {
    return this.segEvaFrmGrp.get("nroSolEvaFrmCtrl");
  }
  get estadoSolEvaFrmCtrl() {
    return this.segEvaFrmGrp.get("estadoSolEvaFrmCtrl");
  }
  get codMACFrmCtrl() {
    return this.segEvaFrmGrp.get("codMACFrmCtrl");
  }
  get descMACFrmCtrl() {
    return this.segEvaFrmGrp.get("descMACFrmCtrl");
  }
  get rolResponsableFrmCtrl() {
    return this.segEvaFrmGrp.get("rolResponsableFrmCtrl");
  }

  public cargarActualizarTablaSeguimiento(): void {
    if (this.dataListaSeguimiento.length > 0) {
      this.dataSource = new MatTableDataSource(this.dataListaSeguimiento);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  public openDialog(
    message: string,
    message2: string,
    alerta: boolean,
    confirmacion: boolean,
    valor: any,
    tipo: string
  ): void {
    const dialogRef = this.dialog.open(MessageComponent, {
      width: "400px",
      disableClose: true,
      data: {
        title: MENSAJES.seguiEva.TITLE,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (tipo === "salir" && result === 1) {
        this.router.navigate(["./app/bandeja-evaluacion"]);
      } else {
        return;
      }
    });
  }

  public openDialog2(
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
        title: MENSAJES.seguiEva.TITLE,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {});
  }

  public salirForm(): void {
    this.openDialog(
      MENSAJES.INFO_SALIR,
      MENSAJES.seguiEva.INFO_SALIR,
      false,
      true,
      null,
      "salir"
    );
  }

  public consultarSeguimiento() {
    this.dataSource = null;
    this.isLoading = true;
    this.dataListaSeguimiento = [];
    this.evaluacionRequest.codigoEvaluacion = `${this.solicitud.codSolEvaluacion}`;
    this.seguimientoEvaluacionService
      .listaSeguimiento(this.evaluacionRequest)
      .subscribe(
        (data: WsResponse) => {
          if (data.audiResponse.codigoRespuesta === "0") {
            this.dataListaSeguimiento = data.data;
            this.cargarActualizarTablaSeguimiento();
          }
          this.isLoading = false;
        },
        (error) => {
          console.error("Error al listar las Solicitudes de Evaluacion");
          console.error(error);
          this.isLoading = false;
        }
      );
  }
  public consultarInformAutorizYCmac(solEva: EvaluacionService) {
    let evaRequest = new ListaEvaluacionesRequest();
    evaRequest.codigoEvaluacion = solEva.codSolEvaluacion + "";
    this.seguimientoEvaluacionService
      .consultarInformAutorizYCmac(evaRequest)
      .subscribe(
        (data: WsResponse) => {
          if (data.audiResponse.codigoRespuesta === "0") {
            solEva.codInformePDF = data.data.codInformeAuto;
            //EL INFORME CMAC PUEDE SER EL ESCANEADO O EL GENERADO
            if (data.data.codRepActaScan) {
              solEva.codCmacPDF = data.data.codRepActaScan;
            } else {
              solEva.codCmacPDF = data.data.codActaCmacFtp;
            }
            this.consultarSeguimiento();
          }
        },
        (error) => {
          console.error("Error al listar las Solicitudes de Evaluacion");
          console.error(error);
        }
      );
  }

  visualizarInformAutorizPDF(): void {
    this.spinnerService.show();
    let request = new ArchivoFTP();

    request.usrApp = FILEFTP.usrApp;
    request.codArchivo = this.solicitud.codInformePDF;
    request.nomArchivo = "";
    request.ruta = "";

    this.bandejaMonitoreoService.getPdfEvaluacionMACXCodigo(request).subscribe(
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
          this.openDialog2(
            MENSAJES.MONITOREO.DETALLE.TITLE,
            "No se pudo cargar el informe",
            true,
            false,
            null
          );
        }
      },
      (error) => {
        console.error(error);
        this.openDialog2(
          MENSAJES.MONITOREO.DETALLE.TITLE,
          "No se pudo cargar el informe",
          true,
          false,
          null
        );
      }
    );
  }

  visualizarActaCmacPDF(): void {
    this.spinnerService.show();
    let request = new ArchivoFTP();

    request.usrApp = FILEFTP.usrApp;
    request.codArchivo = this.solicitud.codCmacPDF;
    request.nomArchivo = "";
    request.ruta = "";

    this.bandejaMonitoreoService.getPdfEvaluacionMACXCodigo(request).subscribe(
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
          this.openDialog2(
            MENSAJES.MONITOREO.DETALLE.TITLE,
            "No se pudo cargar el informe",
            true,
            false,
            null
          );
        }
      },
      (error) => {
        console.error(error);
        this.openDialog2(
          MENSAJES.MONITOREO.DETALLE.TITLE,
          "No se pudo cargar el informe",
          true,
          false,
          null
        );
      }
    );
  }

  public accesoOpcionMenu() {
    const data = require("src/assets/data/permisosRecursos.json");
    const bandejaEvaluacion = data.bandejaEvaluacion.seguimiento;
    this.opcionMenu = JSON.parse(localStorage.getItem("opcionMenu"));

    if (this.opcionMenu.opcion.length > 0) {
      this.opcionMenu.opcion.forEach((element) => {
        const codOpcion = element.codOpcion;
        switch (codOpcion) {
          case bandejaEvaluacion.txtNumeroSolicitud:
            this.txtNumeroSolicitud = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtEstadoActual:
            this.txtEstadoActual = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtCodigoMac:
            this.txtCodigoMac = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtDescripcionMac:
            this.txtDescripcionMac = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtRolResponsable:
            this.txtRolResponsable = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnInforme:
            this.btnInforme = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnActa:
            this.btnActa = Number(element.flagAsignacion);
            break;
        }
      });
    }
  }
}
