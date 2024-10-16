import { Component, OnInit, Inject } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MatProgressButtonOptions } from "mat-progress-buttons";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from "@angular/material";
import { MarcadorService } from "src/app/service/Configuracion/marcador.service";
import { ListaParametroservice } from "src/app/service/lista.parametro.service";
import { ParametroRequest } from "src/app/dto/ParametroRequest";
import { GRUPO_PARAMETRO, MENSAJES, SOLO_NUMEROS } from "src/app/common";
import { ParametroResponse } from "src/app/dto/ParametroResponse";
import { WsResponse } from "src/app/dto/WsResponse";
import { MessageComponent } from "src/app/core/message/message.component";
import { ProductoAsociado } from "src/app/dto/ProductoAsociado";

export interface DialogMarcadorData {
  mac: any;
  producto: ProductoAsociado;
}

@Component({
  selector: "app-editar-producto",
  templateUrl: "./editar.component.html",
})
export class EditarProductoAsociadoComponent implements OnInit {
  productoForm: FormGroup;
  productoSubmitted = false;
  productoFormMessages = {
    codigo: [
      { type: "pattern", message: "Solo dígitos." },
      { type: "minlength", message: "La longitud es de 8 dígitos." },
      { type: "maxlength", message: "La longitud es de 8 dígitos." },
    ],
  };
  productoBtnOpts: MatProgressButtonOptions = {
    active: false,
    text: "GUARDAR",
    spinnerSize: 19,
    raised: true,
    stroked: false,
    buttonColor: "primary",
    spinnerColor: "accent",
    fullWidth: false,
    disabled: false,
    mode: "indeterminate",
  };

  productoRequest: ProductoAsociado = new ProductoAsociado();
  flagRegistro: boolean = false;

  titulo: string;

  listaLaboratorio: any[] = [];
  spinnerLaboratorio: boolean = true;
  listaEstado: any[] = [];
  spinnerEstado: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<EditarProductoAsociadoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogMarcadorData,
    public dialog: MatDialog,
    private marcadorService: MarcadorService,
    private listaParametroservice: ListaParametroservice
  ) {}

  ngOnInit() {
    this.cargarParametro();

    this.titulo = "EDITAR PRODUCTO ASOCIADO";

    this.productoForm = new FormGroup({
      codigo: new FormControl(
        { value: this.data.producto.codigoProducto, disabled: true },
        [
          Validators.required,
          Validators.pattern(SOLO_NUMEROS),
          Validators.minLength(8),
          Validators.maxLength(8),
        ]
      ),
      estado: new FormControl(this.data.producto.codigoEstado, [
        Validators.required,
      ]),
      descripcionGenerica: new FormControl(
        this.data.producto.descripcionGenerica,
        [Validators.required]
      ),
      nombreComercial: new FormControl(this.data.producto.nombreComercial, [
        Validators.required,
      ]),
      laboratorio: new FormControl(this.data.producto.codigoLaboratorio, [
        Validators.required,
      ]),
    });
  }

  get fc() {
    return this.productoForm.controls;
  }

  onDialogClose(flag): void {
    this.dialogRef.close(flag);
  }

  cargarParametro() {
    var paramTipoRequest: ParametroRequest = new ParametroRequest();
    paramTipoRequest.codigoGrupo = GRUPO_PARAMETRO.laboratorio;
    this.listaParametroservice.listaParametro(paramTipoRequest).subscribe(
      (data: ParametroResponse) => {
        this.spinnerLaboratorio = false;
        if (data.codigoResultado === 0) {
          this.listaLaboratorio = data.filtroParametro;
        } else {
          console.error(data);
        }
      },
      (error) => {
        this.spinnerLaboratorio = false;
        console.error("Error al listar Laboratorio");
      }
    );

    var paramEstadoRequest: ParametroRequest = new ParametroRequest();
    paramEstadoRequest.codigoGrupo = GRUPO_PARAMETRO.estadoMac;
    this.listaParametroservice.listaParametro(paramEstadoRequest).subscribe(
      (data: ParametroResponse) => {
        this.spinnerEstado = false;
        if (data.codigoResultado === 0) {
          this.listaEstado = data.filtroParametro;
        } else {
          console.error(data);
        }
      },
      (error) => {
        this.spinnerEstado = false;
        console.error("Error al listar Estado");
      }
    );
  }

  accionProducto() {
    this.productoSubmitted = true;

    if (this.productoForm.invalid) {
      return;
    }

    this.productoBtnOpts.active = true;

    this.productoRequest.codigoProducto = this.productoForm.get("codigo").value;
    this.productoRequest.codigoMac = this.data.mac.codigo;
    this.productoRequest.descripcionGenerica = this.productoForm.get(
      "descripcionGenerica"
    ).value;
    this.productoRequest.nombreComercial =
      this.productoForm.get("nombreComercial").value;
    this.productoRequest.codigoEstado = this.productoForm.get("estado").value;
    this.productoRequest.codigoLaboratorio =
      this.productoForm.get("laboratorio").value;

    this.marcadorService
      .registrarProductoAsociado(this.productoRequest)
      .subscribe(
        (respuesta: WsResponse) => {
          this.productoBtnOpts.active = false;
          if (respuesta.audiResponse.codigoRespuesta != "0") {
            console.error("Error al Editar Producto Asociado");
            this.openDialogMensaje(
              MENSAJES.ERROR_SERVICIO,
              "Error al Editar Producto Asociado",
              true,
              false,
              null
            );
          } else {
            this.flagRegistro = true;
            this.openDialogMensaje(
              MENSAJES.INFO_ACEPTAR,
              "",
              true,
              false,
              null
            );
          }
        },
        (error) => {
          this.productoBtnOpts.active = false;
          console.error(error);
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            "Error al Editar Producto Asociado",
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
    dialogRef.afterClosed().subscribe((result) => {
      if (this.flagRegistro === true) {
        this.onDialogClose(true);
      }
    });
  }
}
