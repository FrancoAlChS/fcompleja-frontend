import { Component, OnInit, Inject } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MatProgressButtonOptions } from "mat-progress-buttons";
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from "@angular/material";
import { MarcadorService } from "src/app/service/Configuracion/marcador.service";
import { ListaParametroservice } from "src/app/service/lista.parametro.service";
import { ParametroRequest } from "src/app/dto/ParametroRequest";
import { GRUPO_PARAMETRO, MENSAJES } from "src/app/common";
import { ParametroResponse } from "src/app/dto/ParametroResponse";
import { WsResponse } from "src/app/dto/WsResponse";
import { Marcador } from "src/app/dto/Marcador";
import { MessageComponent } from "src/app/core/message/message.component";
import { ExamenMedico } from "src/app/dto/ExamenMedico";

export interface DialogMarcadorData {
  marcador: Marcador;
  mac: any;
  grupo: any;
}

@Component({
  selector: "app-editar",
  templateUrl: "./editar.component.html",
})
export class EditarMarcadorComponent implements OnInit {
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

  marcadorRequest: Marcador = new Marcador();
  flagRegistro: boolean = false;

  titulo: string;

  listaTipo: any[] = [];
  spinnerTipo: boolean = true;
  listaMarcador: any[] = [];
  spinnerMarcador: boolean = true;
  listaPerioMin: any[] = [];
  spinnerPerioMin: boolean = true;
  listaPerioMax: any[] = [];
  spinnerPerioMax: boolean = true;
  listaEstado: any[] = [];
  spinnerEstado: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<EditarMarcadorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogMarcadorData,
    public dialog: MatDialog,
    private marcadorService: MarcadorService,
    private listaParametroservice: ListaParametroservice
  ) {}

  ngOnInit() {
    this.titulo = "EDITAR MARCADOR";

    this.marcadorForm = new FormGroup({
      codigo: new FormControl(
        { value: this.data.marcador.codigoConfigMarcaLargo, disabled: true },
        [Validators.required]
      ),
      mac: new FormControl(
        { value: this.data.mac.descripcion, disabled: true },
        [Validators.required]
      ),
      grupoDiagnostico: new FormControl(
        { value: this.data.grupo.descripcion, disabled: true },
        [Validators.required]
      ),
      tipoMarcador: new FormControl(this.data.marcador.codigoTipoMarcador, [
        Validators.required,
      ]),
      marcador: new FormControl(this.data.marcador.codigoExamenMed, [
        Validators.required,
      ]),
      periodicidadMinima: new FormControl(this.data.marcador.codigoPerMinima, [
        Validators.required,
      ]),
      periodicidadMaxima: new FormControl(this.data.marcador.codigoPerMaxima, [
        Validators.required,
      ]),
      estado: new FormControl(this.data.marcador.codigoEstado, [
        Validators.required,
      ]),
    });
    this.cargarParametro();
  }

  get fc() {
    return this.marcadorForm.controls;
  }

  onDialogClose(flag): void {
    this.dialogRef.close(flag);
  }

  listarExamenMedico(){
    var examenRequest: ExamenMedico = new ExamenMedico();
    this.marcadorService.listarExamenMedico(examenRequest).subscribe(
      (data: WsResponse) => {
        this.spinnerMarcador = false;
        if (data.audiResponse.codigoRespuesta === "0") {
          this.listaMarcador = data.data;
          this.parametro1();
        } else {
          console.error(data);
        }
      },
      (error) => {
        this.spinnerMarcador = false;
        console.error("Error al listar Marcador");
      }
    );
  }

  parametro1(){
    var paramPerioMinRequest: ParametroRequest = new ParametroRequest();
    paramPerioMinRequest.codigoGrupo = GRUPO_PARAMETRO.periodoMin;
    this.listaParametroservice.listaParametro(paramPerioMinRequest).subscribe(
      (data: ParametroResponse) => {
        this.spinnerPerioMin = false;
        if (data.codigoResultado === 0) {
          this.listaPerioMin = data.filtroParametro;
          this.parametro2();
        } else {
          console.error(data);
        }
      },
      (error) => {
        this.spinnerPerioMin = false;
        console.error("Error al listar Periodicidad Minima");
      }
    );
  }

  parametro2(){
    var paramPerioMaxRequest: ParametroRequest = new ParametroRequest();
    paramPerioMaxRequest.codigoGrupo = GRUPO_PARAMETRO.periodoMax;
    this.listaParametroservice.listaParametro(paramPerioMaxRequest).subscribe(
      (data: ParametroResponse) => {
        this.spinnerPerioMax = false;
        if (data.codigoResultado === 0) {
          this.listaPerioMax = data.filtroParametro;
          this.parametro3();
        } else {
          console.error(data);
        }
      },
      (error) => {
        this.spinnerPerioMax = false;
        console.error("Error al listar Periodicidad Maxima");
      }
    );
  }

  parametro3(){
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

  cargarParametro() {
    var paramTipoRequest: ParametroRequest = new ParametroRequest();
    paramTipoRequest.codigoGrupo = GRUPO_PARAMETRO.tipoMarcador;
    this.listaParametroservice.listaParametro(paramTipoRequest).subscribe(
      (data: ParametroResponse) => {
        this.spinnerTipo = false;
        if (data.codigoResultado === 0) {
          this.listaTipo = data.filtroParametro;
          this.listarExamenMedico();
        } else {
          console.error(data);
        }
      },
      (error) => {
        this.spinnerTipo = false;
        console.error("Error al listar Tipo Marcador");
      }
    );
  }

  accionMarcador() {
    this.marcadorSubmitted = true;

    if (this.marcadorForm.invalid) {
      return;
    } else {
      var valueMinima: number =
        this.marcadorForm.get("periodicidadMinima").value;
      var paramMinima = this.listaPerioMin.find(function (o) {
        return o.codigoParametro === valueMinima;
      });
      var valueMaxima: number =
        this.marcadorForm.get("periodicidadMaxima").value;
      var paramMaxima = this.listaPerioMax.find(function (o) {
        return o.codigoParametro === valueMaxima;
      });

      if (
        !paramMinima.valor1Parametro ||
        !paramMaxima.valor1Parametro ||
        Number(paramMaxima.valor1Parametro) >
          Number(paramMinima.valor1Parametro)
      ) {
        this.marcadorBtnOpts.active = true;

        this.marcadorRequest.codigoConfigMarca =
          this.data.marcador.codigoConfigMarca;
        this.marcadorRequest.codigoConfigMarcaLargo =
          this.data.marcador.codigoConfigMarcaLargo;
        this.marcadorRequest.codigoExamenMed =
          this.marcadorForm.get("marcador").value;
        this.marcadorRequest.codigoMac = this.data.mac.codigo;
        this.marcadorRequest.codigoGrupoDiag = this.data.grupo.codigo;
        this.marcadorRequest.codigoTipoMarcador =
          this.marcadorForm.get("tipoMarcador").value;
        this.marcadorRequest.codigoPerMaxima =
          this.marcadorForm.get("periodicidadMaxima").value;
        this.marcadorRequest.codigoPerMinima =
          this.marcadorForm.get("periodicidadMinima").value;
        this.marcadorRequest.codigoEstado =
          this.marcadorForm.get("estado").value;

        this.marcadorService.registrarMarcador(this.marcadorRequest).subscribe(
          (respuesta: WsResponse) => {
            this.marcadorBtnOpts.active = false;
            if (respuesta.audiResponse.codigoRespuesta != "0") {
              console.error("Error al Editar Marcador");
              this.openDialogMensaje(
                MENSAJES.ERROR_SERVICIO,
                "Error al Editar Marcador",
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
              "Error al Editar Marcador",
              true,
              false,
              null
            );
          }
        );
      } else {
        this.openDialogMensaje(
          MENSAJES.ERROR_CAMPOS,
          "La Periodicidad Máxima tiene que ser mayor a la Periocidad Mínima",
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
        title: MENSAJES.CONF.MARCADORES,
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
