import { Component, OnInit, Inject } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MatProgressButtonOptions } from "mat-progress-buttons";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from "@angular/material";
import { MarcadorService } from "src/app/service/Configuracion/marcador.service";
import { ListaParametroservice } from "src/app/service/lista.parametro.service";
import {
  MENSAJES,
  SOLO_NUMEROS,
  FILEFTP,
  GRUPO_PARAMETRO,
  PARAMETRO,
} from "src/app/common";
import { MessageComponent } from "src/app/core/message/message.component";
import { ComplicacionMedica } from "src/app/dto/ComplicacionMedica";
import { ArchivoRequest } from "src/app/dto/request/ArchivoRequest";
import { WsResponse } from "src/app/dto/WsResponse";
import { CoreService } from "src/app/service/core.service";
import { ParametroRequest } from "src/app/dto/ParametroRequest";
import { ParametroResponse } from "src/app/dto/ParametroResponse";

export interface DialogProductoData {
  mac: any;
  version: string;
}

@Component({
  selector: "app-registrar-complicacion",
  templateUrl: "./registrar.component.html",
})
export class RegistrarComplicacionMedicaComponent implements OnInit {
  fileupload: File;

  complicacionForm: FormGroup;
  complicacionSubmitted = false;
  complicacionFormMessages = {};
  complicacionBtnOpts: MatProgressButtonOptions = {
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

  complicacionRequest: ComplicacionMedica = new ComplicacionMedica();
  flagRegistro: boolean = false;

  listaEstado: any[] = [];
  spinnerEstado: boolean = true;

  spinnerCargarArchivo: boolean = false;

  titulo: string;

  constructor(
    public dialogRef: MatDialogRef<RegistrarComplicacionMedicaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogProductoData,
    public dialog: MatDialog,
    private marcadorService: MarcadorService,
    private listaParametroservice: ListaParametroservice,
    private coreService: CoreService
  ) {
    var auxNombre =
      `COMPLICACIONES_${this.data.mac.descripcion}_${this.data.version}.pdf`.replace(
        / /gi,
        "_"
      );
    this.complicacionForm = new FormGroup({
      codigo: new FormControl({ value: this.data.version, disabled: true }, [
        Validators.required,
        Validators.pattern(SOLO_NUMEROS),
        Validators.minLength(8),
        Validators.maxLength(8),
      ]),
      nombre: new FormControl({ value: auxNombre, disabled: true }, [
        Validators.required,
      ]),
      //'estado': new FormControl(PARAMETRO.estadoMacVigente, [Validators.required]),
      archivo: new FormControl(null, []),
    });
  }

  ngOnInit() {
    //this.cargarParametro();
    this.titulo = "REGISTRAR NUEVA VERSIÓN";
  }

  get fc() {
    return this.complicacionForm.controls;
  }

  onDialogClose(flag): void {
    this.dialogRef.close(flag);
  }

  cargarParametro() {
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

  accionComplicacion() {
    this.complicacionSubmitted = true;

    if (this.complicacionForm.invalid) {
      return;
    }

    if (this.complicacionRequest.codigoArchivoComp) {
      this.complicacionBtnOpts.active = true;

      this.complicacionRequest.codVersion =
        this.complicacionForm.get("codigo").value;
      this.complicacionRequest.nombreArchivo =
        this.complicacionForm.get("nombre").value;
      this.complicacionRequest.codEstado = PARAMETRO.estadoMacVigente;
      this.complicacionRequest.codMac = this.data.mac.codigo;

      this.marcadorService
        .registrarComplicacionesMedicas(this.complicacionRequest)
        .subscribe(
          (respuesta: WsResponse) => {
            this.complicacionBtnOpts.active = false;
            if (respuesta.audiResponse.codigoRespuesta != "0") {
              console.error("Error al Registrar Complicación Médica");
              this.openDialogMensaje(
                MENSAJES.ERROR_SERVICIO,
                "Error al Registrar Complicación Médica",
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
            this.complicacionBtnOpts.active = false;
            console.error(error);
            this.openDialogMensaje(
              MENSAJES.ERROR_SERVICIO,
              "Error al Registrar Complicación Médica",
              true,
              false,
              null
            );
          }
        );
    } else {
      this.openDialogMensaje(
        "Subida de archivos",
        "Falta seleccionar el archivo a subir.",
        true,
        false,
        null
      );
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
        title: MENSAJES.CONF.COMPLICACION_MEDICA,
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

  public openFileRequerido(event) {
    this.fileupload = event.target.files[0];

    if (this.fileupload.size > FILEFTP.tamanioMax) {
      this.openDialogMensaje(
        "Validación del tamaño de archivo",
        "Solo se permiten archivos de 2MB como máximo",
        true,
        false,
        "Tamaño archivo: " + this.fileupload.size / 1024 / 1024 + "MB"
      );
      return false;
    } else if (this.fileupload.type !== FILEFTP.filePdf) {
      this.openDialogMensaje(
        "Validación del tipo de archivo",
        "Solo se permiten archivos PDF",
        true,
        false,
        "Tipo de archivo: " + this.fileupload.type + "MB"
      );
      return false;
    }

    this.subirArchivoFTP();
  }

  public subirArchivoFTP(): void {
    if (
      typeof this.fileupload === "undefined" ||
      typeof this.fileupload.name === "undefined"
    ) {
      this.openDialogMensaje(
        "Subida de archivos al FTP",
        "Falta seleccionar el archivo a subir.",
        true,
        false,
        null
      );
    } else {
      this.spinnerCargarArchivo = true;

      const archivoRequest = new ArchivoRequest();

      archivoRequest.archivo = this.fileupload;
      archivoRequest.nomArchivo = this.complicacionForm.get("nombre").value;
      archivoRequest.nomArchivo = archivoRequest.nomArchivo.replace("(*)", "");
      archivoRequest.ruta = FILEFTP.rutaConfiguracionComplicaciones;

      this.coreService.subirArchivo(archivoRequest).subscribe(
        (response: WsResponse) => {
          this.spinnerCargarArchivo = false;
          if (response.audiResponse.codigoRespuesta === "0") {
            this.complicacionRequest.codigoArchivoComp =
              response.data.codArchivo;
            this.openDialogMensaje(
              MENSAJES.INFO_ARCHIVO,
              "El archivo fue cargado.",
              true,
              false,
              null
            );
          } else {
            this.openDialogMensaje(
              MENSAJES.ERROR_NOFUNCION,
              response.audiResponse.mensajeRespuesta,
              true,
              false,
              null
            );
          }
        },
        (error) => {
          this.spinnerCargarArchivo = false;
          console.error(error);
          this.openDialogMensaje(
            MENSAJES.ERROR_CARGA_SERVICIO,
            "Error al enviar archivo FTP.",
            true,
            false,
            null
          );
        }
      );
    }
  }
}
