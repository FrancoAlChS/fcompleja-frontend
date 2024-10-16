import {
  Component,
  AfterViewInit,
  ViewChild,
  Inject,
  forwardRef,
  OnInit,
} from "@angular/core";
import {
  PAG_SIZ_SMALL,
  PAG_OBT_SMALL,
  MENSAJES,
  FILEFTP,
  MY_FORMATS_AUNA,
} from "src/app/common";
import {
  MatPaginator,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
  MatTableDataSource,
  DateAdapter,
  MAT_DATE_LOCALE,
  MatPaginatorIntl,
  MAT_DATE_FORMATS,
} from "@angular/material";
import { MarcadorService } from "src/app/service/Configuracion/marcador.service";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MatProgressButtonOptions } from "mat-progress-buttons";
import { ConfiguracionService } from "src/app/service/configuracion.service";
import { MessageComponent } from "src/app/core/message/message.component";
import { WsResponse } from "src/app/dto/WsResponse";
import { RegistrarComplicacionMedicaComponent } from "./registrar/registrar.component";
import { ComplicacionMedica } from "src/app/dto/ComplicacionMedica";
import { WsResponseOnco } from "src/app/dto/WsResponseOnco";
import { ArchivoFTP } from "src/app/dto/bandeja-preliminar/detalle-preliminar/ArchivoFTP";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { CoreService } from "src/app/service/core.service";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MatPaginatorIntlEspanol } from "src/app/directives/matpaginator-translate";

export interface DialogProductoAsociadoData {
  title: any;
  mac: any;
}

export interface DialogMarcadoresData {
  title: any;
  mac: any;
}
@Component({
  selector: "app-complicaciones-medicas",
  templateUrl: "./complicaciones-medicas.component.html",
  styleUrls: ["./complicaciones-medicas.component.scss"],
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
export class ComplicacionesMedicasComponent implements AfterViewInit, OnInit {
  // TABLA
  pageSize: number = PAG_SIZ_SMALL;
  pageSizeOptions: number[] = PAG_OBT_SMALL;

  displayedColumns: string[] = [
    "codigoVersion",
    "nombreArchivo",
    "fechaInicio",
    "estado",
    "descargarFicha",
  ];

  dataSource = new MatTableDataSource<ComplicacionMedica>([]);

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  // FORMULARIO
  complicacionForm: FormGroup;
  complicacionSubmitted = false;
  complicacionFormMessages = {};
  complicacionBtnOpts: MatProgressButtonOptions = {
    active: false,
    text: "BUSCAR",
    spinnerSize: 19,
    raised: true,
    stroked: false,
    buttonColor: "primary",
    spinnerColor: "accent",
    fullWidth: false,
    disabled: false,
    mode: "indeterminate",
  };

  spinnerGrupo: boolean = true;
  listaGrupo: any[] = [];

  complicacionRequest: ComplicacionMedica = new ComplicacionMedica();

  constructor(
    private spinnerService: Ng4LoadingSpinnerService,
    private coreService: CoreService,
    public dialogRef: MatDialogRef<ComplicacionesMedicasComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogProductoAsociadoData,
    public dialog: MatDialog,
    private marcadorService: MarcadorService,
    public confService: ConfiguracionService
  ) {
    this.complicacionForm = new FormGroup({
      codigoMac: new FormControl(
        { value: this.data.mac.codigoLargo, disabled: true },
        [Validators.required]
      ),
      descripcionMac: new FormControl(
        { value: this.data.mac.descripcion, disabled: true },
        [Validators.required]
      ),
    });
  }

  ngAfterViewInit(): void {}

  ngOnInit() {
    this.cargarParametro();
  }

  get fc() {
    return this.complicacionForm.controls;
  }

  public onClose(): void {
    this.dialogRef.close(null);
  }

  public cargarParametro(): void {
    this.isLoadingResults = true;

    this.complicacionRequest.codMac = this.data.mac.codigo;

    this.dataSource.data = [];

    this.marcadorService
      .buscarComplicacionesMedicas(this.complicacionRequest)
      .subscribe(
        (respuesta: WsResponseOnco) => {
          this.complicacionBtnOpts.active = false;
          this.isLoadingResults = false;
          if (respuesta.audiResponse.codigoRespuesta != "0") {
            console.error("Error al listar Complicacion Medica");
            this.openDialogMensaje(
              MENSAJES.ERROR_SERVICIO,
              "Error al listar Complicacion Medica",
              true,
              false,
              null
            );
          } else {
            this.dataSource.data = respuesta.dataList;
            this.dataSource.paginator = this.paginator;
            this.resultsLength = respuesta.dataList.length;
          }
        },
        (error) => {
          this.complicacionBtnOpts.active = false;
          this.isLoadingResults = false;
          console.error(error);
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            "Error al listar Complicacion Medica",
            true,
            false,
            null
          );
        }
      );
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
        title: MENSAJES.CONF.COMPLICACION_MEDICA,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }

  accionComplicacion() {}

  openRegistrarComplicacion(): void {
    const dialogRef = this.dialog.open(RegistrarComplicacionMedicaComponent, {
      width: "640px",
      disableClose: true,
      autoFocus: false,
      data: {
        mac: this.data.mac,
        version: (this.resultsLength + 1).toString().padStart(2, "0"),
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.cargarParametro();
      }
    });
  }

  public descargarDocumento(documento: ComplicacionMedica): void {
    const archivoRqt = new ArchivoFTP();
    archivoRqt.codArchivo = documento.codigoArchivoComp;
    archivoRqt.nomArchivo = documento.nombreArchivo;
    archivoRqt.ruta = FILEFTP.rutaConfiguracionComplicaciones;
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
          this.openDialogMensaje(
            MENSAJES.ERROR_NOFUNCION,
            response.audiResponse.mensajeRespuesta,
            true,
            false,
            null
          );
          this.spinnerService.hide();
        }
      },
      (error) => {
        console.error(error);
        this.openDialogMensaje(MENSAJES.ERROR_NOFUNCION, "", true, false, null);
        this.spinnerService.hide();
      }
    );
  }
}
