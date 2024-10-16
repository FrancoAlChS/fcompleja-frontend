import { Component, OnInit, Inject } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MatProgressButtonOptions } from "mat-progress-buttons";
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from "@angular/material";
import { ListaParametroservice } from "src/app/service/lista.parametro.service";
import { ParametroRequest } from "src/app/dto/ParametroRequest";
import { GRUPO_PARAMETRO, PARAMETRO, MENSAJES } from "src/app/common";
import { ParametroResponse } from "src/app/dto/ParametroResponse";
import { MessageComponent } from "src/app/core/message/message.component";
import * as _moment from "moment";
import { Criterio } from "src/app/dto/Criterio";
import { ConfiguracionService } from "src/app/service/configuracion.service";

const moment = _moment;

export interface DataIndicadorDialog {
  tipo: string;
  criterio: Criterio;
}

@Component({
  selector: "app-editar-criterio",
  templateUrl: "./editar.component.html",
})
export class EditarCriterioComponent implements OnInit {
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
    disabled: true,
    mode: "indeterminate",
  };

  marcadorRequest: Criterio = new Criterio();
  flagRegistro: boolean = false;

  titulo: string;

  listaEstado: any[] = [];
  spinnerEstado: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<EditarCriterioComponent>,
    public dialog: MatDialog,
    private listaParametroservice: ListaParametroservice,
    @Inject(MAT_DIALOG_DATA) public data: DataIndicadorDialog
  ) {}

  ngOnInit() {
    this.cargarParametro();

    this.titulo = "EDITAR CRITERIO";

    this.marcadorForm = new FormGroup({
      codigo: new FormControl(
        { value: this.data.criterio.codCriterioLargo, disabled: true },
        [Validators.required]
      ),
      estado: new FormControl(this.data.criterio.codEstado, [
        Validators.required,
      ]),
      descripcion: new FormControl(this.data.criterio.descripcion, [
        Validators.required,
      ]),
    });
  }

  get fc() {
    return this.marcadorForm.controls;
  }

  onDialogClose(flag): void {
    this.dialogRef.close(flag);
  }

  cargarParametro() {
    var paramPerioMaxRequest: ParametroRequest = new ParametroRequest();
    paramPerioMaxRequest.codigoGrupo = GRUPO_PARAMETRO.estadoMac;
    this.listaParametroservice.listaParametro(paramPerioMaxRequest).subscribe(
      (data: ParametroResponse) => {
        this.spinnerEstado = false;
        if (data.codigoResultado === 0) {
          this.listaEstado = data.filtroParametro;
          this.marcadorBtnOpts.disabled = false;
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

  accionMarcador() {
    this.marcadorSubmitted = true;

    if (this.marcadorForm.invalid) {
      return;
    }

    var auxCodEst = this.marcadorForm.get("estado").value;
    var auxEstado = this.listaEstado.find(function (o) {
      return o.codigoParametro === auxCodEst;
    });

    this.marcadorRequest.codCriterio = this.data.criterio.codCriterio;
    this.marcadorRequest.orden = Number(this.marcadorForm.get("codigo").value);
    this.marcadorRequest.codCriterioLargo =
      this.marcadorForm.get("codigo").value;
    this.marcadorRequest.descripcion =
      this.marcadorForm.get("descripcion").value;
    this.marcadorRequest.codEstado = this.marcadorForm.get("estado").value;
    this.marcadorRequest.estado = auxEstado.nombreParametro;

    this.marcadorSubmitted = false;

    this.onDialogClose({
      criterio: this.marcadorRequest,
      tipo: this.data.tipo,
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
        title: MENSAJES.CONF.CHECKLIST,
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
