import { Component, OnInit, Inject } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MatProgressButtonOptions } from "mat-progress-buttons";
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from "@angular/material";
import {
  GRUPO_PARAMETRO,
  PARAMETRO,
  MENSAJES,
  SOLO_LETRAS_ESPACIOS,
  SOLO_NUMEROS,
  TIPO_DOCUMENTO,
  SOLO_NUMEROS_LETRAS,
  REGEX_CLAVE,
  CODIGO_PERFIL,
  SOLO_NUMEROS_LETRAS_USUARIO,
} from "src/app/common";
import { MessageComponent } from "src/app/core/message/message.component";
import * as _moment from "moment";
import { UsrRolRequest } from "src/app/dto/UsrRolRequest";
import { UsrRolResponse } from "src/app/dto/UsrRolResponse";
import { ListaFiltroUsuarioRolservice } from "src/app/service/Lista.usuario.rol.service";
import { ParametroService } from "src/app/service/cross/parametro.service";
import { ParametroBeanRequest } from "src/app/dto/ParametroBeanRequest";
import { WsResponseOnco } from "src/app/dto/WsResponseOnco";
import { AplicacionBeanRequest } from "src/app/dto/AplicacionBeanRequest";
import { UsuarioMantenimientoService } from "src/app/service/Configuracion/usuario.service";
import { UsuarioRequest } from "src/app/dto/request/UsuarioRequest";
import { UsuarioService } from "src/app/dto/service/usuario.service";
import * as CryptoJS from "crypto-js";

const moment = _moment;

export interface DialogEditarData {
  usuario: any;
}

@Component({
  selector: "app-editar-usuario",
  templateUrl: "./editar.component.html",
})
export class EditarUsuarioComponent implements OnInit {
  marcadorForm: FormGroup;
  marcadorSubmitted = false;
  marcadorFormMessages = {
    numeroDocumento: [{ type: "pattern", message: "Solo números" }],
    telefono: [
      { type: "pattern", message: "Solo números" },
      { type: "minlength", message: "Longitud permitida de 6 a 20 números." },
      { type: "maxlength", message: "Longitud permitida de 6 a 20 números." },
    ],
    celular: [
      { type: "pattern", message: "Solo números" },
      { type: "minlength", message: "Longitud permitida de 9 a 20 números." },
      { type: "maxlength", message: "Longitud permitida de 9 a 20 números." },
    ],
    paterno: [
      { type: "pattern", message: "Solo letras" },
      { type: "minlength", message: "Longitud permitida de 2 a 20 letras." },
      { type: "maxlength", message: "Longitud permitida de 2 a 20 letras." },
    ],
    materno: [
      { type: "pattern", message: "Solo letras" },
      { type: "minlength", message: "Longitud permitida de 2 a 20 letras." },
      { type: "maxlength", message: "Longitud permitida de 2 a 20 letras." },
    ],
    nombre: [
      { type: "pattern", message: "Solo letras" },
      { type: "minlength", message: "Longitud permitida de 2 a 20 letras." },
      { type: "maxlength", message: "Longitud permitida de 2 a 20 letras." },
    ],
    correo: [
      {
        type: "maxlength",
        message: "Longitud máxima permitida de 50 caracteres.",
      },
    ],
    usuario: [
      { type: "pattern", message: "Solo números y letras en Mayúscula" },
      { type: "minlength", message: "Longitud mínima 4 caracteres" },
      { type: "maxlength", message: "Longitud máxima 20 caracteres" },
    ],
    clave: [
      {
        type: "pattern",
        message:
          "Al menos una Letra en Mayúscula, una Letra en Minúscula, un dígito y un caracter especial.",
      },
    ],
  };
  marcadorBtnOpts: MatProgressButtonOptions = {
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

  marcadorRequest: UsuarioRequest = new UsuarioRequest();
  flagRegistro: boolean = false;

  titulo: string;

  spinnerTipoDocumento: boolean = true;
  listaTipoDocumento: any[] = [];
  spinnerAplicacion: boolean = true;
  listaAplicacion: any[] = [];
  spinnerPerfil: boolean = false;
  listaPerfil: any[] = [];
  spinnerEstadoUsuario: boolean = true;
  listaEstadoUsuario: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<EditarUsuarioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogEditarData,
    public dialog: MatDialog,
    private parametroService: ParametroService,
    private rolService: ListaFiltroUsuarioRolservice,
    private usuarioService: UsuarioMantenimientoService,
    private userService: UsuarioService
  ) {}

  ngOnInit() {
    this.titulo = "EDITAR USUARIO";

    this.marcadorForm = new FormGroup({
      paterno: new FormControl(this.data.usuario.apePate, [
        Validators.required,
        Validators.pattern(SOLO_LETRAS_ESPACIOS),
        Validators.minLength(2),
        Validators.maxLength(20),
      ]),
      materno: new FormControl(this.data.usuario.apeMate, [
        Validators.required,
        Validators.pattern(SOLO_LETRAS_ESPACIOS),
        Validators.minLength(2),
        Validators.maxLength(20),
      ]),
      nombre: new FormControl(this.data.usuario.nombres, [
        Validators.required,
        Validators.pattern(SOLO_LETRAS_ESPACIOS),
        Validators.minLength(2),
        Validators.maxLength(20),
      ]),
      correo: new FormControl(this.data.usuario.correo, [
        Validators.required,
        Validators.email,
        Validators.maxLength(50),
      ]),
      tipoDocumento: new FormControl(
        this.data.usuario.tipoDoc ? Number(this.data.usuario.tipoDoc) : null,
        [Validators.required]
      ),
      numeroDocumento: new FormControl(this.data.usuario.numeroDoc, [
        Validators.required,
        Validators.pattern(SOLO_NUMEROS),
      ]),
      telefono: new FormControl(this.data.usuario.telefono, [
        Validators.pattern(SOLO_NUMEROS),
        Validators.minLength(6),
        Validators.maxLength(20),
      ]),
      celular: new FormControl(this.data.usuario.celular, [
        Validators.pattern(SOLO_NUMEROS),
        Validators.minLength(9),
        Validators.maxLength(20),
      ]),
      estado: new FormControl(this.data.usuario.estado, [Validators.required]),
      aplicacion: new FormControl(Number(this.data.usuario.codAplicacion), [
        Validators.required,
      ]),
      perfil: new FormControl(Number(this.data.usuario.codRol), [
        Validators.required,
      ]),
      usuario: new FormControl(this.data.usuario.usuario, [
        Validators.required,
        Validators.pattern(SOLO_NUMEROS_LETRAS_USUARIO),
        Validators.minLength(4),
        Validators.maxLength(20),
      ]),
      clave: new FormControl(null, [Validators.pattern(REGEX_CLAVE)]),
      claveRepetida: new FormControl(null, []),
    });

    this.marcadorRequest.codigoUsuario = this.data.usuario.codUsuario;
    this.marcadorRequest.usuarioOld = this.data.usuario.usuario;
    this.cargarParametro();
  }

  get fc() {
    return this.marcadorForm.controls;
  }

  onDialogClose(flag): void {
    this.dialogRef.close(flag);
  }

  buscarAplicacion(){
    var aplicacionRequest: AplicacionBeanRequest = new AplicacionBeanRequest();
    this.parametroService.buscarAplicacion(aplicacionRequest).subscribe(
      (respuesta: WsResponseOnco) => {
        this.spinnerAplicacion = false;
        if (respuesta.audiResponse.codigoRespuesta === "0") {
          this.listaAplicacion = respuesta.dataList;
        } else {
          console.error(respuesta.audiResponse.mensajeRespuesta);
        }
        this.buscarParametro();
      },
      (error) => {
        this.spinnerAplicacion = false;
        console.error("Error al Buscar Aplicaciones");
      }
    );
  }

  buscarParametro(){
    var parametroRequest: ParametroBeanRequest = new ParametroBeanRequest();
    parametroRequest.codGrupoParametro = GRUPO_PARAMETRO.estadoUsuario;
    this.parametroService.buscarParametro(parametroRequest).subscribe(
      (respuesta: WsResponseOnco) => {
        this.spinnerEstadoUsuario = false;
        if (respuesta.audiResponse.codigoRespuesta === "0") {
          this.listaEstadoUsuario = respuesta.dataList;
        } else {
          console.error(respuesta.audiResponse.mensajeRespuesta);
        }
        this.cambioTipoAplicacion();
      },
      (error) => {
        this.spinnerEstadoUsuario = false;
        console.error("Error al Buscar Tipo Documento");
      }
    );
  }

  cargarParametro() {
    var parametroRequest: ParametroBeanRequest = new ParametroBeanRequest();
    parametroRequest.codGrupoParametro = GRUPO_PARAMETRO.tipoDocumento;
    this.parametroService.buscarParametro(parametroRequest).subscribe(
      (respuesta: WsResponseOnco) => {
        this.spinnerTipoDocumento = false;
        if (respuesta.audiResponse.codigoRespuesta === "0") {
          this.listaTipoDocumento = respuesta.dataList;
        } else {
          console.error(respuesta.audiResponse.mensajeRespuesta);
        }
        this.buscarAplicacion();
      },
      (error) => {
        this.spinnerTipoDocumento = false;
        console.error("Error al Buscar Tipo Documento");
      }
    );
  }

  cambioTipoAplicacion() {
    const codigoAplicacion = this.marcadorForm.get("aplicacion").value;
    if (codigoAplicacion) {
      const rolRequest = new UsrRolRequest();
      rolRequest.codAplicacion = codigoAplicacion;
      this.spinnerPerfil = true;
      this.rolService.listarRoles(rolRequest).subscribe(
        (data: UsrRolResponse) => {
          this.spinnerPerfil = false;
          if (data.audiResponse.codigoRespuesta === "0") {
            var auxList: any[] = [];
            data.dataList.map(function (o) {
              if (
                !(
                  o.codRol === CODIGO_PERFIL.LT || o.codRol === CODIGO_PERFIL.MC
                )
              ) {
                auxList.push(o);
              }
            });
            this.listaPerfil = auxList;
          } else {
            this.openDialogMensaje(
              MENSAJES.ERROR_NOFUNCION,
              data.audiResponse.mensajeRespuesta,
              true,
              false,
              null
            );
          }
          this.cambioTipDoc();
        },
        (error) => {
          this.spinnerPerfil = false;
          console.error("Error al listar Pefiles");
          this.openDialogMensaje(
            MENSAJES.ERROR_NOFUNCION,
            "Error al listar Pefiles",
            true,
            false,
            null
          );
        }
      );
    }
  }

  cambioTipDoc() {
    var tipDoc = this.marcadorForm.get("tipoDocumento").value;
    switch (tipDoc) {
      case TIPO_DOCUMENTO.COD_DNI:
        this.marcadorForm
          .get("numeroDocumento")
          .setValidators([
            Validators.required,
            Validators.pattern(SOLO_NUMEROS),
            Validators.minLength(8),
            Validators.maxLength(8),
          ]);
        this.marcadorFormMessages.numeroDocumento = [
          { type: "pattern", message: "Solo números" },
          { type: "minlength", message: "Solo 8 números" },
          { type: "maxlength", message: "Solo 8 números" },
        ];
        break;
      case TIPO_DOCUMENTO.COD_PAS:
        this.marcadorForm
          .get("numeroDocumento")
          .setValidators([
            Validators.required,
            Validators.pattern(SOLO_NUMEROS_LETRAS),
            Validators.maxLength(12),
          ]);
        this.marcadorFormMessages.numeroDocumento = [
          { type: "pattern", message: "Solo números y letras" },
          { type: "maxlength", message: "Solo 12 caracteres como máximo" },
        ];
        break;
      case TIPO_DOCUMENTO.COD_CE:
        this.marcadorForm
          .get("numeroDocumento")
          .setValidators([
            Validators.required,
            Validators.pattern(SOLO_NUMEROS_LETRAS),
            Validators.maxLength(12),
          ]);
        this.marcadorFormMessages.numeroDocumento = [
          { type: "pattern", message: "Solo números y letras" },
          { type: "maxlength", message: "Solo 12 caracteres como máximo" },
        ];
        break;
      case TIPO_DOCUMENTO.COD_PN:
        this.marcadorForm
          .get("numeroDocumento")
          .setValidators([
            Validators.required,
            Validators.pattern(SOLO_NUMEROS_LETRAS),
            Validators.maxLength(15),
          ]);
        this.marcadorFormMessages.numeroDocumento = [
          { type: "pattern", message: "Solo números y letras" },
          { type: "maxlength", message: "Solo 15 caracteres como máximo" },
        ];
        break;
      default:
      // code block
    }
    this.marcadorForm.get("numeroDocumento").updateValueAndValidity();
  }

  accionMarcador() {
    this.marcadorSubmitted = true;

    if (this.marcadorForm.invalid) {
      return;
    } else {
      const clave1: string = this.marcadorForm.get("clave").value;
      const clave2: string = this.marcadorForm.get("claveRepetida").value;

      if (clave1 === clave2) {
        this.marcadorBtnOpts.active = true;

        this.marcadorRequest.nombre = this.marcadorForm.get("nombre").value;
        this.marcadorRequest.apellidoPaterno =
          this.marcadorForm.get("paterno").value;
        this.marcadorRequest.apellidoMaterno =
          this.marcadorForm.get("materno").value;
        this.marcadorRequest.correo = this.marcadorForm.get("correo").value;
        this.marcadorRequest.codigoTipoDocumento =
          this.marcadorForm.get("tipoDocumento").value;
        this.marcadorRequest.numeroDocumento =
          this.marcadorForm.get("numeroDocumento").value;
        this.marcadorRequest.telefono = this.marcadorForm.get("telefono").value;
        this.marcadorRequest.celular = this.marcadorForm.get("celular").value;
        this.marcadorRequest.codigoAplicacion =
          this.marcadorForm.get("aplicacion").value;
        this.marcadorRequest.codigoRol = this.marcadorForm.get("perfil").value;
        this.marcadorRequest.usuarioNew =
          this.marcadorForm.get("usuario").value;
        if (this.marcadorForm.get("clave").value) {
          this.marcadorRequest.clave = CryptoJS.SHA256(
            this.marcadorForm.get("clave").value
          ).toString(CryptoJS.enc.Hex);
        }
        this.marcadorRequest.codigoEstado =
          this.marcadorForm.get("estado").value;
        this.marcadorRequest.usuario = this.userService.getCodUsuario;

        this.usuarioService.editarUsuario(this.marcadorRequest).subscribe(
          (respuesta: WsResponseOnco) => {
            this.marcadorBtnOpts.active = false;
            if (respuesta.audiResponse.codigoRespuesta != "0") {
              console.error("Error al Actualizar Usuario");
              this.openDialogMensaje(
                MENSAJES.ERROR_SERVICIO,
                respuesta.audiResponse.mensajeRespuesta,
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
            this.marcadorBtnOpts.active = false;
            console.error(error);
            this.openDialogMensaje(
              MENSAJES.ERROR_SERVICIO,
              "Error al Actualizar Usuario",
              true,
              false,
              null
            );
          }
        );
      } else {
        this.openDialogMensaje(
          MENSAJES.ERROR_CAMPOS,
          "Por favor las contraseñas deben coincidir",
          true,
          false,
          null
        );
        return;
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
        title: MENSAJES.CONF.USUARIO,
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
