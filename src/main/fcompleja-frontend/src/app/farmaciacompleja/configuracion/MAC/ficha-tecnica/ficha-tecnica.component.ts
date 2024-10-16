import {
  Component,
  AfterViewInit,
  ViewChild,
  Inject,
  OnInit,
  forwardRef,
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
  MAT_DATE_FORMATS,
  MatPaginatorIntl,
} from "@angular/material";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MatProgressButtonOptions } from "mat-progress-buttons";
import { ConfiguracionService } from "src/app/service/configuracion.service";
import { MessageComponent } from "src/app/core/message/message.component";
import { WsResponse } from "src/app/dto/WsResponse";
import { RegistrarFichaTecnicaComponent } from "./registrar/registrar.component";
import { ComplicacionMedica } from "src/app/dto/ComplicacionMedica";
import { ArchivoFTP } from "src/app/dto/bandeja-preliminar/detalle-preliminar/ArchivoFTP";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { CoreService } from "src/app/service/core.service";
import { FichaTecnica } from "src/app/dto/configuracion/FichaTecnica";
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
  selector: "app-ficha-tecnica",
  templateUrl: "./ficha-tecnica.component.html",
  styleUrls: ["./ficha-tecnica.component.scss"],
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
export class FichaTecnicaComponent implements AfterViewInit, OnInit {
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

  complicacionRequest: FichaTecnica = new FichaTecnica();

  constructor(
    private spinnerService: Ng4LoadingSpinnerService,
    private coreService: CoreService,
    public dialogRef: MatDialogRef<FichaTecnicaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogProductoAsociadoData,
    public dialog: MatDialog,
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

    this.confService.listarFichasTecnicas(this.complicacionRequest).subscribe(
      (respuesta: WsResponse) => {
        this.complicacionBtnOpts.active = false;
        this.isLoadingResults = false;
        if (respuesta.audiResponse.codigoRespuesta != "0") {
          console.error("Error al listar Ficha Técnica");
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            "Error al listar Ficha Técnica",
            true,
            false,
            null
          );
        } else {
          this.dataSource.data = respuesta.data;
          this.dataSource.paginator = this.paginator;
          this.resultsLength = respuesta.data.length;
        }
      },
      (error) => {
        this.complicacionBtnOpts.active = false;
        this.isLoadingResults = false;
        console.error(error);
        this.openDialogMensaje(
          MENSAJES.ERROR_SERVICIO,
          "Error al listar Ficha Técnica",
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
    const dialogRef = this.dialog.open(RegistrarFichaTecnicaComponent, {
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

  public descargarDocumento(documento: FichaTecnica): void {
    const archivoRqt = new ArchivoFTP();
    archivoRqt.codArchivo = documento.codFichaTecnica;
    archivoRqt.nomArchivo = documento.nombreArchivo;
    archivoRqt.ruta = FILEFTP.rutaConfiguracionFicha;
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

/*import { Component, OnInit, forwardRef, ViewChild, Inject } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import {
  DateAdapter,
  MAT_DATE_LOCALE,
  MatPaginatorIntl,
  MAT_DATE_FORMATS,
  MatTableDataSource,
  MatSort,
  MatPaginator,
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material';
import { MY_FORMATS_AUNA, MENSAJES } from 'src/app/common';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatPaginatorIntlEspanol } from 'src/app/directives/matpaginator-translate';
import { FichaTecnica } from 'src/app/dto/configuracion/FichaTecnica';
import { DatePipe } from '@angular/common';
import { MACResponse } from 'src/app/dto/configuracion/MACResponse';
import { ConfiguracionService } from 'src/app/service/configuracion.service';
import { MessageComponent } from 'src/app/core/message/message.component';
import { WsResponse } from 'src/app/dto/WsResponse';
import { MntoFichaComponent } from './mnto-ficha/mnto-ficha.component';

export interface DataDialog {
  title: string;
  mac: MACResponse;
}

@Component({
  selector: 'app-ficha-tecnica',
  templateUrl: './ficha-tecnica.component.html',
  styleUrls: ['./ficha-tecnica.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS_AUNA },
    { provide: MatPaginatorIntl, useClass: forwardRef(() => MatPaginatorIntlEspanol) }
  ]
})
export class FichaTecnicaComponent implements OnInit {

  mensaje: string;
  fichaTecnica: FichaTecnica;

  fichaTecFrmGrp: FormGroup = new FormGroup({
    codigoFrmCtrl: new FormControl(null),
    descripcionFrmCtrl: new FormControl(null)
  });

  get codigoFrmCtrl() { return this.fichaTecFrmGrp.get('codigoFrmCtrl'); }
  get descripcionFrmCtrl() { return this.fichaTecFrmGrp.get('descripcionFrmCtrl'); }

  // Tabla
  dataSource: MatTableDataSource<FichaTecnica>;
  listaFichaTecnicas: FichaTecnica[];
  isLoading: boolean;
  displayedColumns: string[];
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  columnsGrilla = [{
    columnDef: 'codVersion',
    header: 'CÓDIGO VERSIÓN',
    cell: (ficha: FichaTecnica) => `${ficha.codVersion}`
  }, {
    columnDef: 'nombreArchivo',
    header: 'NOMBRE ARCHIVO',
    cell: (ficha: FichaTecnica) => `${ficha.nombreArchivo}`
  }, {
    columnDef: 'fechaIniVigencia',
    header: 'FECHA INICIO VIGENCIA',
    cell: (ficha: FichaTecnica) => this.datePipe.transform(ficha.fechaIniVigencia, 'dd/MM/yyyy')
  }, {
    columnDef: 'fechaFinVigencia',
    header: 'FECHA FIN VIGENCIA',
    cell: (ficha: FichaTecnica) => this.datePipe.transform(ficha.fechaFinVigencia, 'dd/MM/yyyy')
  }, {
    columnDef: 'estado',
    header: 'ESTADO',
    cell: (ficha: FichaTecnica) => `${ficha.estado}`
  }];

  constructor(public datePipe: DatePipe,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<FichaTecnicaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DataDialog,
    public confService: ConfiguracionService) { }

  ngOnInit() {
    this.inicializarVariables();
    this.crearTablaFichaTecnica();
  }

  public inicializarVariables(): void {
    this.listaFichaTecnicas = [];
    this.dataSource = null;
    this.isLoading = false;
    this.codigoFrmCtrl.setValue(this.data.mac.codigoLargo);
    this.descripcionFrmCtrl.setValue(this.data.mac.descripcion);

    this.obtenerListaFichaTecnica();
  }

  public crearTablaFichaTecnica(): void {
    this.displayedColumns = [];
    this.columnsGrilla.forEach(column => {
      this.displayedColumns.push(column.columnDef);
    });
    this.displayedColumns.push('descargar');
  }

  public cargarTablaFichasTecnicas(): void {
    if (this.listaFichaTecnicas.length > 0) {
      this.dataSource = new MatTableDataSource(this.listaFichaTecnicas);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  public obtenerListaFichaTecnica(): void {
    if (this.data.mac.codigo === null) {
      this.openDialogMensaje('CODIGO MAC NO PRESENTE', 'Error al obtener el código MAC, Salir del Formulario', true, false, null);
      return;
    }

    this.fichaTecnica = new FichaTecnica();
    this.fichaTecnica.codMac = this.data.mac.codigo;

    this.dataSource = null;
    this.isLoading = false;
    this.listaFichaTecnicas = [];

    this.confService.listarFichasTecnicas(this.fichaTecnica).subscribe(
      (response: WsResponse) => {
        if (response.audiResponse.codigoRespuesta === '0') {
          this.listaFichaTecnicas = (response.data.listadoFichaTecnica != null) ? response.data.listadoFichaTecnica : [];
          this.cargarTablaFichasTecnicas();
        } else {
          this.listaFichaTecnicas = [];
          this.mensaje = response.audiResponse.mensajeRespuesta;
          this.openDialogMensaje(MENSAJES.ERROR_NOFUNCION, this.mensaje, true, false, this.data.mac.descripcion);
        }
        this.isLoading = false;
      }, error => {
        console.error(error);
        this.listaFichaTecnicas = [];
        this.mensaje = 'Error al obtener el listado de Ficha(s) de la MAC';
        this.openDialogMensaje(MENSAJES.ERROR_SERVICIO, this.mensaje, true, false, this.data.mac.descripcion);
        this.isLoading = false;
      }
    );
  }

  public onClose(): void {
    this.dialogRef.close(null);
  }

  public nuevaFicha(): void {
    const dialogRef = this.dialog.open(MntoFichaComponent, {
      width: '800px',
      disableClose: true,
      data: {
        title: MENSAJES.CONF.FICHA_TECNICA,
        mac: this.data.mac,
        ficha: null,
        total: this.listaFichaTecnicas.length
      }
    });

    dialogRef.afterClosed().subscribe((result: FichaTecnica) => {
      if (result !== null) {
      } else {
        this.obtenerListaFichaTecnica();
      }
    });
  }

  public verFichaTecnica(row: FichaTecnica): void {
    this.mensaje = 'Error al obtener la Ficha Técnica';
    this.openDialogMensaje(MENSAJES.ERROR_SERVICIO, this.mensaje, true, false, row.nombreArchivo);
  }

  public openDialogMensaje(
    message: string,
    message2: string,
    alerta: boolean,
    confirmacion: boolean,
    valor: any
  ): void {
    const dialogRef = this.dialog.open(MessageComponent, {
      width: '400px',
      disableClose: true,
      data: {
        title: MENSAJES.CONF.FICHA_TECNICA,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor
      }
    });
    dialogRef.afterClosed().subscribe(result => {

    });
  }

}*/
