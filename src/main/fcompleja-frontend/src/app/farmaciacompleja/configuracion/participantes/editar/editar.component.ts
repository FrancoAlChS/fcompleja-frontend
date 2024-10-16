import { Component, OnInit, Inject } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MatProgressButtonOptions } from "mat-progress-buttons";
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from "@angular/material";
import { ListaParametroservice } from "src/app/service/lista.parametro.service";
import { ParametroRequest } from "src/app/dto/ParametroRequest";
import {
  GRUPO_PARAMETRO,
  MENSAJES,
  CODIGO_PERFIL,
  FILEFTP,
  COD_APLICACION_FC,
  PARAMETRO,
  SOLO_NUMEROS,
} from "src/app/common";
import { ParametroResponse } from "src/app/dto/ParametroResponse";
import { MessageComponent } from "src/app/core/message/message.component";
import * as _moment from "moment";
import { WsResponse } from "src/app/dto/WsResponse";
import { ListaFiltroUsuarioRolservice } from "src/app/service/Lista.usuario.rol.service";
import { UsrRolRequest } from "src/app/dto/UsrRolRequest";
import { UsrRolResponse } from "src/app/dto/UsrRolResponse";
import { ArchivoRequest } from "src/app/dto/request/ArchivoRequest";
import { CoreService } from "src/app/service/core.service";
import { Participante } from "src/app/dto/Participante";
import { BuscarUsuarioComponent } from "../buscar/buscar.component";
import { ConfiguracionService } from "src/app/service/configuracion.service";
import { WsResponseOnco } from "src/app/dto/WsResponseOnco";
import { ParticipanteDetalle } from "src/app/dto/ParticipanteDetalle";
import { MarcadorService } from "src/app/service/Configuracion/marcador.service";
import { BuscarGrupoDiagnosticoComponent } from "src/app/modal/buscar-diagnostico/buscar-diagnostico.component";

const moment = _moment;

export interface DialogMarcadorData {
  participante: Participante;
}

export interface ValorFijoElement {
  codigo: string;
  valor: string;
}

export interface GrupoElement {
  codigoGrupo: string;
  valorGrupo: string;
  codigoEdad: string;
  valorEdad: string;
}

@Component({
  selector: "app-editar-participante",
  templateUrl: "./editar.component.html",
  styleUrls: ["./editar.component.scss"],
})
export class EditarParticipanteComponent implements OnInit {
  fileupload: File;
  spinnerCargarArchivo: boolean = false;
  flagEstadoFirma = true;

  marcadorForm: FormGroup;
  marcadorSubmitted = false;
  marcadorFormMessages = {
    cmpUsuario: [
      { type: "pattern", message: "Solo números" },
      { type: "maxlength", message: "Solo 10 números" },
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

  flagAP: boolean = false;
  flagLT: boolean = false;
  flagRM: boolean = false;
  flagMC: boolean = false;
  flagRIM: boolean = false;
  flagCAP: boolean = false;
  flagAC: boolean = false;
  flagES: boolean = false;
  flagAS: boolean = false;

  marcadorRequest: Participante = new Participante();
  flagRegistro: boolean = false;

  titulo: string;

  listaPerfil: any[] = [];
  spinnerPerfil: boolean = true;
  listaEstado: any[] = [];
  spinnerEstado: boolean = true;
  listaEdad: any[] = [];
  spinnerEdad: boolean = true;

  spinnerGrupo: boolean = true;
  listaGrupo: any[] = [];

  flagIngresoNumerico: boolean = false;
  flagIngresoFijo: boolean = false;

  // LT GRUPOS
  displayedColumns: string[] = ["valor", "eliminar"];
  dataSource: ValorFijoElement[] = [];
  resultsLength: number = 0;

  // RM GRUPOS
  displayedColumnsGrupoDiagnostico: string[] = [
    "valorGrupo",
    "valorEdad",
    "eliminar",
  ];
  dataSourceGrupoDiagnostico: GrupoElement[] = [];
  resultsLengthGrupoDiagnostico: number = 0;

  codigoGrupoDiagnostico: string;
  descripcionGrupoDiagnostico: string;

  constructor(
    public dialogRef: MatDialogRef<EditarParticipanteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogMarcadorData,
    public dialog: MatDialog,
    private listaParametroservice: ListaParametroservice,
    private rolService: ListaFiltroUsuarioRolservice,
    private coreService: CoreService,
    public confService: ConfiguracionService,
    private marcadorService: MarcadorService
  ) {}

  ngOnInit() {
      this.titulo = "EDITAR PARTICIPANTE";

    this.marcadorForm = new FormGroup({
      codigo: new FormControl(
        { value: this.data.participante.codParticipanteLargo, disabled: true },
        []
      ),
      estado: new FormControl(this.data.participante.pEstado, [
        Validators.required,
      ]),
      perfil: new FormControl(this.data.participante.codRol, [
        Validators.required,
      ]),
      codigoUsuario: new FormControl(this.data.participante.codUsuario, []),
      nombreUsuario: new FormControl(
        `${this.data.participante.apellidos} ${this.data.participante.nombres}`,
        []
      ),
      cmpUsuario: new FormControl(this.data.participante.cmpMedico, [
        Validators.pattern(SOLO_NUMEROS),
        Validators.maxLength(10),
      ]),
      correoUsuario: new FormControl(
        this.data.participante.correoElectronico,
        []
      ),
      firmaUsuario: new FormControl(null, []),
      apellidos: new FormControl(this.data.participante.apellidos, []),
      nombres: new FormControl(this.data.participante.nombres, []),
      codigoGrupoDiagnostico: new FormControl(
        { value: null, disabled: true },
        []
      ),
      codigoRangoEdad: new FormControl(null, []),
      // 'coordinador': new FormControl((this.data.participante.coordinador === 1)?true:false, [])
    });

    this.marcadorRequest.codUsuario = this.data.participante.codUsuario;
    this.marcadorRequest.codigoArchivoFirma =
      this.data.participante.codigoArchivoFirma;

    if (
      this.data.participante.codigoArchivoFirma === null ||
      this.data.participante.codigoArchivoFirma === 0
    ) {
      this.flagEstadoFirma = false;
    }
    this.cargarParametro();
  }

  cargarListaGrupo() {
    var tipDoc = this.marcadorForm.get("perfil").value;
    switch (tipDoc) {
      case CODIGO_PERFIL.LT:
        var auxListaGrupo = this.listaGrupo;
        this.dataSource = this.data.participante.gruposDiagnosticos.map(
          function (ob) {
            var auxGrupo = auxListaGrupo.find(function (o) {
              return o.codigo === ob.codGrupoDiagnostico;
            });
            return {
              codigo: ob.codGrupoDiagnostico,
              valor: auxGrupo.descripcion,
            };
          }
        );
        this.resultsLength = this.dataSource.length;
        break;
      case CODIGO_PERFIL.RM:
        if (this.data.participante.gruposDiagnosticos) {
          var auxListaGrupo = this.listaGrupo;
          var auxListaEdad = this.listaEdad;
          this.dataSourceGrupoDiagnostico =
            this.data.participante.gruposDiagnosticos.map(function (ob) {
              var auxGrupo = auxListaGrupo.find(function (o) {
                return o.codigo === ob.codGrupoDiagnostico;
              });
              var auxEdad = auxListaEdad.find(function (o) {
                return o.codigoParametro === ob.pRangoEdad;
              });
              return {
                codigoGrupo: ob.codGrupoDiagnostico,
                valorGrupo: auxGrupo.descripcion,
                codigoEdad: String(ob.pRangoEdad),
                valorEdad: auxEdad.nombreParametro,
              };
            });
          this.resultsLengthGrupoDiagnostico =
            this.dataSourceGrupoDiagnostico.length;
        }
        break;
      default:
      // code block
    }
  }

  get fc() {
    return this.marcadorForm.controls;
  }

  onDialogClose(flag): void {
    this.dialogRef.close(flag);
  }

  parametro1(){
    var paramPerioMaxRequest: ParametroRequest = new ParametroRequest();
    paramPerioMaxRequest.codigoGrupo = GRUPO_PARAMETRO.estadoMac;
    this.listaParametroservice.listaParametro(paramPerioMaxRequest).subscribe(
      (data: ParametroResponse) => {
        this.spinnerEstado = false;
        if (data.codigoResultado === 0) {
          this.listaEstado = data.filtroParametro;
        } else {
          this.openDialogMensaje(
            MENSAJES.ERROR_NOFUNCION,
            data.mensageResultado,
            true,
            false,
            null
          );
        }
        this.parametro2();
      },
      (error) => {
        this.spinnerEstado = false;
        console.error("Error al listar Estado Participante");
        this.openDialogMensaje(
          MENSAJES.ERROR_NOFUNCION,
          "Error al listar Estado Participante",
          true,
          false,
          null
        );
      }
    );
  }

  parametro2(){
    this.confService.listarGrupoDiagnostico().subscribe(
      (dataResponse: WsResponseOnco) => {
        this.spinnerGrupo = false;
        if (dataResponse.audiResponse.codigoRespuesta === "0") {
          this.listaGrupo = dataResponse.dataList;
          if (!(this.spinnerGrupo || this.spinnerEdad)) {
            this.cargarListaGrupo();
          }
        } else {
          this.openDialogMensaje(
            MENSAJES.ERROR_NOFUNCION,
            dataResponse.audiResponse.mensajeRespuesta,
            true,
            false,
            null
          );
        }
        this.parametro3();
      },
      (error) => {
        this.spinnerGrupo = false;
        console.error("Error al listar el grupo diagnostico");
        this.openDialogMensaje(
          MENSAJES.ERROR_SERVICIO,
          "Error al listar el grupo diagnostico",
          true,
          false,
          null
        );
      }
    );
  }

  parametro3(){
    var paramPerioMaxRequest: ParametroRequest = new ParametroRequest();
    paramPerioMaxRequest.codigoGrupo = GRUPO_PARAMETRO.rangoEdad;
    this.listaParametroservice.listaParametro(paramPerioMaxRequest).subscribe(
      (data: ParametroResponse) => {
        this.spinnerEdad = false;
        if (data.codigoResultado === 0) {
          this.listaEdad = data.filtroParametro;
          if (!(this.spinnerGrupo || this.spinnerEdad)) {
            this.cargarListaGrupo();
          }
        } else {
          this.openDialogMensaje(
            MENSAJES.ERROR_NOFUNCION,
            data.mensageResultado,
            true,
            false,
            null
          );
        }
        this.cambioTipoPerfil();
      },
      (error) => {
        this.spinnerEdad = false;
        console.error("Error al listar Rango Edad");
        this.openDialogMensaje(
          MENSAJES.ERROR_NOFUNCION,
          "Error al listar Rango Edad",
          true,
          false,
          null
        );
      }
    );
  }

  cargarParametro() {
    const rolRequest = new UsrRolRequest();
    rolRequest.codAplicacion = COD_APLICACION_FC;
    this.rolService.listarRoles(rolRequest).subscribe(
      (data: UsrRolResponse) => {
        this.spinnerPerfil = false;
        if (data.audiResponse.codigoRespuesta === "0") {
          this.listaPerfil = data.dataList;
        } else {
          this.openDialogMensaje(
            MENSAJES.ERROR_NOFUNCION,
            data.audiResponse.mensajeRespuesta,
            true,
            false,
            null
          );
        }
        this.parametro1();
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

  accionMarcador() {
    this.marcadorSubmitted = true;

    if (this.marcadorForm.invalid) {
      return;
    } else {
      this.marcadorRequest.codParticipante =
        this.data.participante.codParticipante;
      this.marcadorRequest.pEstado = this.marcadorForm.get("estado").value;
      this.marcadorRequest.codRol = this.marcadorForm.get("perfil").value;

      var tipDoc = this.marcadorForm.get("perfil").value;

      switch (tipDoc) {
        case CODIGO_PERFIL.AP:
        case CODIGO_PERFIL.CAP:
          if (this.marcadorRequest.codUsuario) {
            if (this.marcadorRequest.codigoArchivoFirma) {
              this.marcadorRequest.cmpMedico =
                this.marcadorForm.get("cmpUsuario").value;
              //this.marcadorRequest.coordinador = (this.marcadorForm.get('coordinador').value)?1:0;
            } else {
              this.openDialogMensaje(
                MENSAJES.ERROR_CAMPOS,
                "Debe realizar la carga de la Firma",
                true,
                false,
                null
              );
              return;
            }
          } else {
            this.openDialogMensaje(
              MENSAJES.ERROR_CAMPOS,
              "Debe realizar la búsqueda de un Usuario",
              true,
              false,
              null
            );
            return;
          }
          break;
        case CODIGO_PERFIL.LT:
          if (this.resultsLength > 0) {
            this.marcadorRequest.apellidos =
              this.marcadorForm.get("apellidos").value;
            this.marcadorRequest.nombres =
              this.marcadorForm.get("nombres").value;
            this.marcadorRequest.cmpMedico =
              this.marcadorForm.get("cmpUsuario").value;
            this.marcadorRequest.correoElectronico =
              this.marcadorForm.get("correoUsuario").value;

            var auxlistGrupo: ParticipanteDetalle[] = [];
            auxlistGrupo = this.dataSource.map(function (o) {
              var auxDetalle: ParticipanteDetalle = new ParticipanteDetalle();
              auxDetalle.codGrupoDiagnostico = o.codigo;

              return auxDetalle;
            });
            this.marcadorRequest.gruposDiagnosticos = auxlistGrupo;
          } else {
            this.openDialogMensaje(
              MENSAJES.ERROR_CAMPOS,
              "Debe registrar al menos un Grupo de Diagnostico",
              true,
              false,
              null
            );
            return;
          }
          break;
        case CODIGO_PERFIL.MC:
          this.marcadorRequest.apellidos =
            this.marcadorForm.get("apellidos").value;
          this.marcadorRequest.nombres = this.marcadorForm.get("nombres").value;
          this.marcadorRequest.cmpMedico =
            this.marcadorForm.get("cmpUsuario").value;
          this.marcadorRequest.correoElectronico =
            this.marcadorForm.get("correoUsuario").value;
          break;
        case CODIGO_PERFIL.RM:
          if (this.marcadorRequest.codUsuario) {
            if (this.resultsLengthGrupoDiagnostico > 0) {
              this.marcadorRequest.cmpMedico =
                this.marcadorForm.get("cmpUsuario").value;

              var auxlistGrupo: ParticipanteDetalle[] = [];
              auxlistGrupo = this.dataSourceGrupoDiagnostico.map(function (o) {
                var auxDetalle: ParticipanteDetalle = new ParticipanteDetalle();
                auxDetalle.codGrupoDiagnostico = o.codigoGrupo;
                auxDetalle.pRangoEdad = Number(o.codigoEdad);

                return auxDetalle;
              });
              this.marcadorRequest.gruposDiagnosticos = auxlistGrupo;
            } else {
              this.openDialogMensaje(
                MENSAJES.ERROR_CAMPOS,
                "Debe registrar al menos un Grupo de Diagnostico",
                true,
                false,
                null
              );
              return;
            }
          } else {
            this.openDialogMensaje(
              MENSAJES.ERROR_CAMPOS,
              "Debe realizar la búsqueda de un Usuario",
              true,
              false,
              null
            );
            return;
          }
          break;
        case CODIGO_PERFIL.RIM:
        case CODIGO_PERFIL.AC:
        case CODIGO_PERFIL.ES:
        case CODIGO_PERFIL.AS:
          if (!this.marcadorRequest.codUsuario) {
            this.openDialogMensaje(
              MENSAJES.ERROR_CAMPOS,
              "Debe realizar la búsqueda de un Usuario",
              true,
              false,
              null
            );
            return;
          }
          break;
        default:
        // code block
      }

      this.marcadorBtnOpts.active = true;

      this.marcadorService
        .registrarParticipante(this.marcadorRequest)
        .subscribe(
          (respuesta: WsResponse) => {
            this.marcadorBtnOpts.active = false;
            if (respuesta.audiResponse.codigoRespuesta != "0") {
              console.error("Error al Registrar PARTICIPANTE");
              this.openDialogMensaje(
                MENSAJES.ERROR_SERVICIO,
                "Error al Registrar PARTICIPANTE",
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
              "Error al Registrar PARTICIPANTE",
              true,
              false,
              null
            );
          }
        );
    }
  }

  eliminarFirma() {
    this.marcadorRequest.codigoArchivoFirma = null;
    this.flagEstadoFirma = false;
  }

  cambioTipoPerfil() {
    // AP
    this.flagAP = false;
    this.flagLT = false;
    this.flagRM = false;
    this.flagMC = false;
    this.flagRIM = false;
    this.flagCAP = false;
    this.flagAC = false;
    this.flagES = false;
    this.flagAS = false;
    this.marcadorForm.get("codigoUsuario").setValidators([]);
    this.marcadorForm.get("nombreUsuario").setValidators([]);
    this.marcadorForm.get("cmpUsuario").setValidators([]);
    this.marcadorForm.get("correoUsuario").setValidators([]);
    // LT
    this.marcadorForm.get("apellidos").setValidators([]);
    this.marcadorForm.get("nombres").setValidators([]);

    this.marcadorForm.get("codigoUsuario").enable();
    this.marcadorForm.get("nombreUsuario").enable();
    this.marcadorForm.get("correoUsuario").enable();

    var tipPerfil = this.marcadorForm.get("perfil").value;

    switch (tipPerfil) {
      case CODIGO_PERFIL.AP:
      case CODIGO_PERFIL.CAP:
        this.flagAP = true;
        this.marcadorForm.get("codigoUsuario").disable();
        this.marcadorForm
          .get("codigoUsuario")
          .setValidators([Validators.required]);
        this.marcadorForm.get("nombreUsuario").disable();
        this.marcadorForm
          .get("nombreUsuario")
          .setValidators([Validators.required]);
        this.marcadorForm
          .get("cmpUsuario")
          .setValidators([
            Validators.required,
            Validators.pattern(SOLO_NUMEROS),
            Validators.maxLength(10),
          ]);
        this.marcadorForm.get("correoUsuario").disable();
        this.marcadorForm
          .get("correoUsuario")
          .setValidators([Validators.required]);
        break;
      case CODIGO_PERFIL.LT:
        this.flagLT = true;
        this.marcadorForm
          .get("correoUsuario")
          .setValidators([Validators.required, Validators.email]);
        this.marcadorForm.get("apellidos").setValidators([Validators.required]);
        this.marcadorForm.get("nombres").setValidators([Validators.required]);
        this.marcadorForm
          .get("cmpUsuario")
          .setValidators([
            Validators.required,
            Validators.pattern(SOLO_NUMEROS),
            Validators.maxLength(10),
          ]);
        break;
      case CODIGO_PERFIL.RM:
        this.flagRM = true;
        this.marcadorForm.get("codigoUsuario").disable();
        this.marcadorForm
          .get("codigoUsuario")
          .setValidators([Validators.required]);
        this.marcadorForm.get("nombreUsuario").disable();
        this.marcadorForm
          .get("nombreUsuario")
          .setValidators([Validators.required]);
        this.marcadorForm
          .get("cmpUsuario")
          .setValidators([
            Validators.required,
            Validators.pattern(SOLO_NUMEROS),
            Validators.maxLength(10),
          ]);
        this.marcadorForm.get("correoUsuario").disable();
        this.marcadorForm
          .get("correoUsuario")
          .setValidators([Validators.required]);
        break;
      case CODIGO_PERFIL.MC:
        this.flagMC = true;
        this.marcadorForm
          .get("correoUsuario")
          .setValidators([Validators.required, Validators.email]);
        this.marcadorForm.get("apellidos").setValidators([Validators.required]);
        this.marcadorForm.get("nombres").setValidators([Validators.required]);
        this.marcadorForm
          .get("cmpUsuario")
          .setValidators([
            Validators.required,
            Validators.pattern(SOLO_NUMEROS),
            Validators.maxLength(10),
          ]);
        break;
      case CODIGO_PERFIL.RIM:
      case CODIGO_PERFIL.AC:
      case CODIGO_PERFIL.ES:
      case CODIGO_PERFIL.AS:
        this.flagRIM = true;
        this.marcadorForm.get("codigoUsuario").disable();
        this.marcadorForm
          .get("codigoUsuario")
          .setValidators([Validators.required]);
        this.marcadorForm.get("nombreUsuario").disable();
        this.marcadorForm
          .get("nombreUsuario")
          .setValidators([Validators.required]);
        this.marcadorForm.get("correoUsuario").disable();
        this.marcadorForm
          .get("correoUsuario")
          .setValidators([Validators.required]);
        break;
      default:
      // code block
    }

    this.marcadorForm.get("codigoUsuario").updateValueAndValidity();
    this.marcadorForm.get("nombreUsuario").updateValueAndValidity();
    this.marcadorForm.get("cmpUsuario").updateValueAndValidity();
    this.marcadorForm.get("correoUsuario").updateValueAndValidity();

    this.marcadorForm.get("apellidos").updateValueAndValidity();
    this.marcadorForm.get("nombres").updateValueAndValidity();
  }

  agregarGrupo() {
    const listaValores: ValorFijoElement[] = [];
    // var nuevoValor: string = this.marcadorForm.get('codigoGrupoDiagnostico').value;
    // var auxGrupo = this.listaGrupo.find(function(o) { return o.codigo === nuevoValor; });
    // if (nuevoValor && auxGrupo) {
    let auxCodigo = this.codigoGrupoDiagnostico;
    let auxDescripcion = this.descripcionGrupoDiagnostico;
    if (auxCodigo && auxDescripcion) {
      let validacion: boolean = true;
      this.dataSource.map(function (o) {
        if (auxCodigo === o.codigo) {
          validacion = false;
        }
        listaValores.push(o);
      });
      if (validacion) {
        listaValores.push({
          codigo: auxCodigo,
          valor: auxDescripcion,
        });
        this.marcadorForm.get("codigoGrupoDiagnostico").setValue(null);
        this.codigoGrupoDiagnostico = null;
        this.descripcionGrupoDiagnostico = null;
      }
      this.dataSource = listaValores;
      this.resultsLength = this.dataSource.length;
    }
  }

  agregarGrupoDiagnostico() {
    let listaValores: GrupoElement[] = [];
    let auxCodigo = this.codigoGrupoDiagnostico;
    let auxDescripcion = this.descripcionGrupoDiagnostico;
    // var nuevoValorGrupo: string = this.marcadorForm.get('codigoGrupoDiagnostico').value;
    const nuevoValorEdad: string =
      this.marcadorForm.get("codigoRangoEdad").value;
    // var auxGrupo = this.listaGrupo.find(function(o){return o.codigo === nuevoValorGrupo});
    const auxEdad = this.listaEdad.find(function (o) {
      return o.codigoParametro === nuevoValorEdad;
    });
    let validacion: boolean = true;
    if (auxCodigo && nuevoValorEdad && auxDescripcion && auxEdad) {
      this.dataSourceGrupoDiagnostico.map(function (o) {
        if (
          (auxCodigo === o.codigoGrupo &&
            auxEdad.codigoParametro === o.codigoEdad) ||
          (auxCodigo === o.codigoGrupo &&
            auxEdad.codigoParametro === PARAMETRO.rangoEdadTodos) ||
          (auxCodigo === o.codigoGrupo &&
            Number(o.codigoEdad) === PARAMETRO.rangoEdadTodos)
        ) {
          validacion = false;
        }
        listaValores.push(o);
      });
      if (validacion) {
        listaValores.push({
          codigoGrupo: auxCodigo,
          valorGrupo: auxDescripcion,
          codigoEdad: auxEdad.codigoParametro,
          valorEdad: auxEdad.nombreParametro,
        });
        this.marcadorForm.get("codigoGrupoDiagnostico").setValue(null);
        this.codigoGrupoDiagnostico = null;
        this.descripcionGrupoDiagnostico = null;
        this.marcadorForm.get("codigoRangoEdad").setValue(null);
      }
      this.dataSourceGrupoDiagnostico = listaValores;
      this.resultsLengthGrupoDiagnostico =
        this.dataSourceGrupoDiagnostico.length;
    }
  }

  eliminarGrupo(e) {
    var listaValores: ValorFijoElement[] = [];
    this.dataSource.map(function (o) {
      if (e.codigo !== o.codigo) {
        listaValores.push(o);
      }
    });
    this.dataSource = listaValores;
    this.resultsLength = this.dataSource.length;
  }

  eliminarGrupoDiagnostico(e) {
    var listaValores: GrupoElement[] = [];
    this.dataSourceGrupoDiagnostico.map(function (o) {
      if (e.codigoGrupo !== o.codigoGrupo) {
        listaValores.push(o);
      }
    });
    this.dataSourceGrupoDiagnostico = listaValores;
    this.resultsLengthGrupoDiagnostico = this.dataSourceGrupoDiagnostico.length;
  }

  openBuscarUsuario(): void {
    var tipPerfil = this.marcadorForm.get("perfil").value;
    const dialogRef = this.dialog.open(BuscarUsuarioComponent, {
      width: "640px",
      disableClose: true,
      autoFocus: false,
      data: {
        codRol: tipPerfil,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.marcadorRequest.codUsuario = result.codUsuario;
        this.marcadorForm.get("codigoUsuario").setValue(result.usuario);
        this.marcadorForm
          .get("nombreUsuario")
          .setValue(`${result.apePate} ${result.apeMate}, ${result.nombres}`);
        this.marcadorForm.get("correoUsuario").setValue(result.correo);
      }
    });
  }

  openBuscarGrupoDiagnostico(): void {
    const dialogRef = this.dialog.open(BuscarGrupoDiagnosticoComponent, {
      width: "640px",
      disableClose: true,
      autoFocus: false,
      data: {
        title: "BÚSQUEDA GRUPO DIAGNOSTICO",
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.marcadorForm
          .get("codigoGrupoDiagnostico")
          .setValue(result.nomDiagnostico);
        this.codigoGrupoDiagnostico = result.codDiagnostico;
        this.descripcionGrupoDiagnostico = result.nomDiagnostico;
        /*this.marcadorRequest.codUsuario = result.codUsuario;
                this.marcadorForm.get('codigoUsuario').setValue(result.usuario);
                this.marcadorForm.get('nombreUsuario').setValue(`${result.apePate} ${result.apeMate}, ${result.nombres}`);
                this.marcadorForm.get('correoUsuario').setValue(result.correo);*/
      }
    });
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
        title: MENSAJES.CONF.PARTICIPANTE_SISTEMA,
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

  // SUBIDA DE ARCHIVOS

  public openFileRequerido(event) {
    this.fileupload = event.target.files[0];

    if (this.fileupload.size > FILEFTP.tamMaxFirma) {
      this.openDialogMensaje(
        "Validación del tamaño de archivo",
        "Solo se permiten archivos de 50KB como máximo",
        true,
        false,
        "Tamaño archivo: " + this.fileupload.size / 1024 / 1024 + "MB"
      );
      return false;
    } else if (
      !(
        this.fileupload.type === FILEFTP.fileJpeg ||
        this.fileupload.type === FILEFTP.filePng
      )
    ) {
      this.openDialogMensaje(
        "Validación del tipo de archivo",
        "Solo se permiten archivos JPEG o PNG",
        true,
        false,
        "Tipo de archivo: " + this.fileupload.type
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
      this.flagEstadoFirma = false;

      const archivoRequest = new ArchivoRequest();

      archivoRequest.archivo = this.fileupload;
      archivoRequest.nomArchivo = `${String(moment().valueOf())}.jpg`;
      archivoRequest.ruta = FILEFTP.rutaConfiguracionFirma;

      this.coreService.subirArchivo(archivoRequest).subscribe(
        (response: WsResponse) => {
          this.spinnerCargarArchivo = false;
          if (response.audiResponse.codigoRespuesta === "0") {
            this.flagEstadoFirma = true;
            this.marcadorRequest.codigoArchivoFirma = response.data.codArchivo;
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
          this.flagEstadoFirma = false;
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
