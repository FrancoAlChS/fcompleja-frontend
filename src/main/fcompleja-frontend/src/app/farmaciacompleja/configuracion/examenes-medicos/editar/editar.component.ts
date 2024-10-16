import { Component, OnInit, Inject } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MatProgressButtonOptions } from "mat-progress-buttons";
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from "@angular/material";
import { MarcadorService } from "src/app/service/Configuracion/marcador.service";
import { ListaParametroservice } from "src/app/service/lista.parametro.service";
import { ParametroRequest } from "src/app/dto/ParametroRequest";
import {
  GRUPO_PARAMETRO,
  PARAMETRO,
  MENSAJES,
  PAG_SIZ_SMALL,
  PAG_OBT_SMALL,
} from "src/app/common";
import { ParametroResponse } from "src/app/dto/ParametroResponse";
import { MessageComponent } from "src/app/core/message/message.component";
import { ExamenMedico } from "src/app/dto/ExamenMedico";
import * as _moment from "moment";
import { UsuarioService } from "src/app/dto/service/usuario.service";
import { WsResponse } from "src/app/dto/WsResponse";
import { ExamenMedicoDetalle } from "src/app/dto/ExamenMedicoDetalle";

const moment = _moment;

export interface ValorFijoElement {
  codigo: string;
  valor: string;
}

export interface DialogMarcadorData {
  examen: ExamenMedico;
}

@Component({
  selector: "app-editar-examen-medico",
  templateUrl: "./editar.component.html",
})
export class EditarExamenMedicoComponent implements OnInit {
  marcadorForm: FormGroup;
  marcadorSubmitted = false;
  marcadorFormMessages = {};
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

  marcadorRequest: ExamenMedico = new ExamenMedico();
  flagRegistro: boolean = false;

  titulo: string;

  listaExamen: any[] = [];
  spinnerExamen: boolean = true;
  listaIngreso: any[] = [];
  spinnerIngreso: boolean = true;
  listaEstado: any[] = [];
  spinnerEstado: boolean = true;

  flagIngresoNumerico: boolean = false;
  flagIngresoFijo: boolean = false;

  displayedColumns: string[] = ["valor", "eliminar"];
  dataSource: ValorFijoElement[] = [];

  resultsLength: number = 0;

  constructor(
    public dialogRef: MatDialogRef<EditarExamenMedicoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogMarcadorData,
    public dialog: MatDialog,
    private marcadorService: MarcadorService,
    private listaParametroservice: ListaParametroservice,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit() {
    this.titulo = "EDITAR EXÁMEN MÉDICO";
    this.marcadorForm = new FormGroup({
      codigo: new FormControl(this.data.examen.codExamenMedLargo, []),
      estado: new FormControl(this.data.examen.codEstado, [
        Validators.required,
      ]),
      descripcion: new FormControl(this.data.examen.descripcion, [
        Validators.required,
      ]),
      tipoExamen: new FormControl(this.data.examen.tipoExamen, [
        Validators.required,
      ]),
      tipoIngreso: new FormControl(
        this.data.examen.lExamenMedicoDetalle[0].codigoTipoIngresoResultado,
        [Validators.required]
      ),
      unidadMedida: new FormControl(
        this.data.examen.lExamenMedicoDetalle[0].unidadMedida,
        []
      ),
      rangoMin: new FormControl(
        this.data.examen.lExamenMedicoDetalle[0].rangoMinimo,
        []
      ),
      rangoMax: new FormControl(
        this.data.examen.lExamenMedicoDetalle[0].rangoMaximo,
        []
      ),
      fijo: new FormControl(null, []),
    });
    if (
      this.data.examen.lExamenMedicoDetalle[0].codigoTipoIngresoResultado ===
      PARAMETRO.tipoIngresoFijo
    ) {
      this.dataSource = this.data.examen.lExamenMedicoDetalle.map(function (o) {
        return {
          codigo: String(o.codExamenMedDet),
          valor: o.valorFijo,
        };
      });
      this.resultsLength = this.dataSource.length;
    }
    this.cargarParametro();
  }

  get fc() {
    return this.marcadorForm.controls;
  }

  onDialogClose(flag): void {
    this.dialogRef.close(flag);
  }

  parametro1(){
    var paramPerioMinRequest: ParametroRequest = new ParametroRequest();
    paramPerioMinRequest.codigoGrupo = GRUPO_PARAMETRO.tipoIngreso;
    this.listaParametroservice.listaParametro(paramPerioMinRequest).subscribe(
      (data: ParametroResponse) => {
        this.spinnerIngreso = false;
        if (data.codigoResultado === 0) {
          this.listaIngreso = data.filtroParametro;
          this.parametro2();
        } else {
          console.error(data);
        }
      },
      (error) => {
        this.spinnerIngreso = false;
        console.error("Error al listar Tipo Ingreso");
      }
    );
  }

  parametro2(){
    var paramPerioMaxRequest: ParametroRequest = new ParametroRequest();
    paramPerioMaxRequest.codigoGrupo = GRUPO_PARAMETRO.estadoMac;
    this.listaParametroservice.listaParametro(paramPerioMaxRequest).subscribe(
      (data: ParametroResponse) => {
        this.spinnerEstado = false;
        if (data.codigoResultado === 0) {
          this.listaEstado = data.filtroParametro;
          this.cambioTipIngreso();
        } else {
          console.error(data);
        }
      },
      (error) => {
        this.spinnerEstado = false;
        console.error("Error al listar Estado Exámen Médico");
      }
    );
  }

  cargarParametro() {
    var paramTipoRequest: ParametroRequest = new ParametroRequest();
    paramTipoRequest.codigoGrupo = GRUPO_PARAMETRO.tipoExamen;
    this.listaParametroservice.listaParametro(paramTipoRequest).subscribe(
      (data: ParametroResponse) => {
        this.spinnerExamen = false;
        if (data.codigoResultado === 0) {
          this.listaExamen = data.filtroParametro;
          this.parametro1();
        } else {
          console.error(data);
        }
      },
      (error) => {
        this.spinnerExamen = false;
        console.error("Error al listar Tipo Exámen");
      }
    );
  }

  accionMarcador() {
    this.marcadorSubmitted = true;

    if (this.marcadorForm.invalid) {
      return;
    } else {
      this.marcadorRequest.codExamenMed = this.data.examen.codExamenMed;
      this.marcadorRequest.descripcion =
        this.marcadorForm.get("descripcion").value;
      this.marcadorRequest.tipoExamen =
        this.marcadorForm.get("tipoExamen").value;
      this.marcadorRequest.codEstado = this.marcadorForm.get("estado").value;
      this.marcadorRequest.usuarioModif = String(
        this.usuarioService.getCodUsuario
      );

      var auxListaDetalle: ExamenMedicoDetalle[] = [];

      var tipDoc = this.marcadorForm.get("tipoIngreso").value;

      switch (tipDoc) {
        case PARAMETRO.tipoIngresoNumerico:
          var auxMin = this.marcadorForm.get("rangoMin").value;
          var auxMax = this.marcadorForm.get("rangoMax").value;

          if (auxMin >= 0 && auxMax >= 0 && auxMax > auxMin) {
            var auxDetalleExamen: ExamenMedicoDetalle =
              new ExamenMedicoDetalle();
            auxDetalleExamen.codigoTipoIngresoResultado = tipDoc;
            auxDetalleExamen.unidadMedida =
              this.marcadorForm.get("unidadMedida").value;
            auxDetalleExamen.codigoEstado =
              this.marcadorForm.get("estado").value;
            auxDetalleExamen.rangoMinimo =
              this.marcadorForm.get("rangoMin").value;
            auxDetalleExamen.rangoMaximo =
              this.marcadorForm.get("rangoMax").value;
            auxDetalleExamen.rango = `${auxMin}-${auxMax}`;
            auxDetalleExamen.usuarioCrea = String(
              this.usuarioService.getCodUsuario
            );

            auxListaDetalle.push(auxDetalleExamen);
          } else {
            this.openDialogMensaje(
              MENSAJES.ERROR_CAMPOS,
              "El Rango Max tiene que ser mayor al Rango Min. (Solo valores positivos)",
              true,
              false,
              null
            );
            return;
          }
          break;
        case PARAMETRO.tipoIngresoFijo:
          if (this.dataSource.length > 0) {
            var auxCod = this.marcadorForm.get("estado").value;
            var auxUsu = String(this.usuarioService.getCodUsuario);
            auxListaDetalle = this.dataSource.map(function (o) {
              var auxDetalleExamen: ExamenMedicoDetalle =
                new ExamenMedicoDetalle();
              auxDetalleExamen.codigoTipoIngresoResultado = tipDoc;
              auxDetalleExamen.valorFijo = o.valor;
              auxDetalleExamen.codigoEstado = auxCod;
              auxDetalleExamen.usuarioCrea = auxUsu;

              return auxDetalleExamen;
            });
          } else {
            this.openDialogMensaje(
              MENSAJES.ERROR_CAMPOS,
              "Debe registrar al menos un Valor Fijo",
              true,
              false,
              null
            );
            return;
          }
          break;
        case PARAMETRO.tipoIngresoTexto:
          var auxDetalleExamen: ExamenMedicoDetalle = new ExamenMedicoDetalle();
          auxDetalleExamen.codigoTipoIngresoResultado = tipDoc;
          auxDetalleExamen.codigoEstado = this.marcadorForm.get("estado").value;
          auxDetalleExamen.usuarioCrea = String(
            this.usuarioService.getCodUsuario
          );

          auxListaDetalle.push(auxDetalleExamen);
          break;
        default:
        // code block
      }

      this.marcadorRequest.lExamenMedicoDetalle = auxListaDetalle;

      this.marcadorBtnOpts.active = true;

      this.marcadorService
        .registrarExamenMedico(this.marcadorRequest)
        .subscribe(
          (respuesta: WsResponse) => {
            this.marcadorBtnOpts.active = false;
            if (respuesta.audiResponse.codigoRespuesta != "0") {
              console.error("Error al Registrar Exámen Médico");
              this.openDialogMensaje(
                MENSAJES.ERROR_SERVICIO,
                "Error al Registrar Exámen Médico",
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
              "Error al Registrar Exámen Médico",
              true,
              false,
              null
            );
          }
        );
    }
  }

  cambioTipIngreso() {
    this.flagIngresoNumerico = false;
    this.flagIngresoFijo = false;
    this.marcadorForm.get("unidadMedida").setValidators([]);
    this.marcadorForm.get("rangoMin").setValidators([]);
    this.marcadorForm.get("rangoMax").setValidators([]);

    var tipDoc = this.marcadorForm.get("tipoIngreso").value;
    switch (tipDoc) {
      case PARAMETRO.tipoIngresoNumerico:
        this.flagIngresoNumerico = true;
        this.marcadorForm
          .get("unidadMedida")
          .setValidators([Validators.required]);
        this.marcadorForm.get("rangoMin").setValidators([Validators.required]);
        this.marcadorForm.get("rangoMax").setValidators([Validators.required]);
        break;
      case PARAMETRO.tipoIngresoFijo:
        this.flagIngresoFijo = true;
        break;
      case PARAMETRO.tipoIngresoTexto:
        break;
      default:
      // code block
    }
    this.marcadorForm.get("unidadMedida").updateValueAndValidity();
    this.marcadorForm.get("rangoMin").updateValueAndValidity();
    this.marcadorForm.get("rangoMax").updateValueAndValidity();
  }

  agregarFijo() {
    var listaValores: ValorFijoElement[] = [];
    var nuevoValor: string = this.marcadorForm.get("fijo").value;
    nuevoValor = nuevoValor ? nuevoValor.toUpperCase().trim() : nuevoValor;
    if (nuevoValor) {
      nuevoValor = nuevoValor.toUpperCase();
      var validacion: boolean = true;
      this.dataSource.map(function (o) {
        if (nuevoValor === o.valor) {
          validacion = false;
        }
        listaValores.push(o);
      });
      if (validacion) {
        listaValores.push({
          codigo: String(moment().valueOf()),
          valor: this.marcadorForm.get("fijo").value.toUpperCase(),
        });
        this.marcadorForm.get("fijo").setValue(null);
      }
      this.dataSource = listaValores;
      this.resultsLength = this.dataSource.length;
    }
  }

  eliminarFijo(e) {
    var listaValores: ValorFijoElement[] = [];
    this.dataSource.map(function (o) {
      if (e.codigo !== o.codigo) {
        listaValores.push(o);
      }
    });
    this.dataSource = listaValores;
    this.resultsLength = this.dataSource.length;
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
        title: MENSAJES.CONF.EXAMEN_MEDICO,
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
