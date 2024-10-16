import {
  Component,
  AfterViewInit,
  ViewChild,
  Inject,
  forwardRef,
  OnInit,
} from "@angular/core";
import { Marcador } from "src/app/dto/Marcador";
import {
  PAG_SIZ_SMALL,
  PAG_OBT_SMALL,
  MENSAJES,
  MY_FORMATS_AUNA,
} from "src/app/common";
import {
  MatPaginator,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
  MatTableDataSource,
  DateAdapter,
  MAT_DATE_FORMATS,
  MatPaginatorIntl,
  MAT_DATE_LOCALE,
} from "@angular/material";
import { MarcadorService } from "src/app/service/Configuracion/marcador.service";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MatProgressButtonOptions } from "mat-progress-buttons";
import { ConfiguracionService } from "src/app/service/configuracion.service";
import { MessageComponent } from "src/app/core/message/message.component";
import { WsResponse } from "src/app/dto/WsResponse";
import { RegistrarProductoAsociadoComponent } from "./registrar/registrar.component";
import { EditarProductoAsociadoComponent } from "./editar/editar.component";
import { ProductoAsociado } from "src/app/dto/ProductoAsociado";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MatPaginatorIntlEspanol } from "src/app/directives/matpaginator-translate";

export interface DialogProductoAsociadoData {
  title: any;
  mac: any;
}

@Component({
  selector: "app-productos-asociados",
  templateUrl: "./productos-asociados.component.html",
  styleUrls: ["./productos-asociados.component.scss"],
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
export class ProductoAsociadoComponent implements AfterViewInit, OnInit {
  // TABLA
  pageSize: number = PAG_SIZ_SMALL;
  pageSizeOptions: number[] = PAG_OBT_SMALL;

  displayedColumns: string[] = [
    "codigo",
    "descripcionGenerica",
    "nombreComercial",
    "laboratorio",
    "estado",
    "opciones",
  ];
  //dataSource: Marcador[] = [];
  dataSource = new MatTableDataSource<Marcador>([]);

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  // FORMULARIO
  productoForm: FormGroup;
  productoSubmitted = false;
  productoFormMessages = {};
  productoBtnOpts: MatProgressButtonOptions = {
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

  productoRequest: ProductoAsociado = new ProductoAsociado();

  constructor(
    public dialogRef: MatDialogRef<ProductoAsociadoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogProductoAsociadoData,
    public dialog: MatDialog,
    private marcadorService: MarcadorService,
    public confService: ConfiguracionService
  ) {
    this.productoForm = new FormGroup({
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

  ngOnInit() {
    this.cargarParametro();
  }

  ngAfterViewInit(): void {
    /*merge(this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          this.marcadorRequest.codigoMac = this.data.mac.codigo;
          this.marcadorRequest.codigoGrupoDiag = this.marcadorForm.get('codigoGrupoDiagnostico').value;
          this.marcadorRequest.index = this.paginator.pageIndex.toString();
          this.marcadorRequest.longitud = this.pageSize.toString();
          return this.marcadorService.buscarMarcador(this.marcadorRequest);
        }),
        map(respuesta => {
          this.isLoadingResults = false;
          this.resultsLength = respuesta.data.length;

          return respuesta.data;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          this.openDialogMensaje(MENSAJES.ERROR_SERVICIO, 'Error al listar los Marcador', true, false, null);
          return observableOf([]);
        })
      ).subscribe(data => this.dataSource = data);*/
  }

  get fc() {
    return this.productoForm.controls;
  }

  public onClose(): void {
    this.dialogRef.close(null);
  }

  public cargarParametro(): void {
    this.isLoadingResults = true;

    this.productoRequest.codigoMac = this.data.mac.codigo;

    this.dataSource.data = [];

    this.marcadorService.buscarProductoAsociado(this.productoRequest).subscribe(
      (respuesta: WsResponse) => {
        this.productoBtnOpts.active = false;
        this.isLoadingResults = false;
        if (respuesta.audiResponse.codigoRespuesta != "0") {
          console.error("Error al listar Producto Asociado");
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            "Error al listar Producto Asociado",
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
        this.productoBtnOpts.active = false;
        this.isLoadingResults = false;
        console.error(error);
        this.openDialogMensaje(
          MENSAJES.ERROR_SERVICIO,
          "Error al listar Producto Asociado",
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
        title: MENSAJES.CONF.PRODUCTO_ASOCIADO,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }

  accionMarcador() {
    /*this.productoSubmitted = true;

    if (this.productoForm.invalid) {
        return;
    }

    this.productoBtnOpts.active = true;

    this.productoRequest.codigoMac = this.data.mac.codigo;

    this.isLoadingResults = true;

    this.dataSource.data = [];

    this.marcadorService.
    buscarProductoAsociado(this.productoRequest)
    .subscribe(
      (respuesta: WsResponse) => {
        this.productoBtnOpts.active = false;
        this.isLoadingResults = false;
        if (respuesta.audiResponse.codigoRespuesta != '0'){
          console.error('Error al listar Producto Asociado');
          this.openDialogMensaje(MENSAJES.ERROR_SERVICIO, 'Error al listar Producto Asociado', true, false, null);
        }else{
          this.dataSource.data = respuesta.data;
          this.dataSource.paginator = this.paginator;
          this.resultsLength = respuesta.data.length;
        }
      },
      error => {
        this.productoBtnOpts.active = false;
        this.isLoadingResults = false;
        console.error(error);
        this.openDialogMensaje(MENSAJES.ERROR_SERVICIO, 'Error al listar Producto Asociado', true, false, null);
      }
    );*/
  }

  openRegistrarProducto(): void {
    const dialogRef = this.dialog.open(RegistrarProductoAsociadoComponent, {
      width: "640px",
      disableClose: true,
      autoFocus: false,
      data: {
        mac: this.data.mac,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.cargarParametro();
      }
    });
  }

  openEditarProducto(producto): void {
    const dialogRef = this.dialog.open(EditarProductoAsociadoComponent, {
      width: "640px",
      disableClose: true,
      autoFocus: false,
      data: {
        producto: producto,
        mac: this.data.mac,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.cargarParametro();
      }
    });
  }
}
