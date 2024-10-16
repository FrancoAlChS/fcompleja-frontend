import { Component, OnInit, Inject, forwardRef } from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MatProgressButtonOptions } from "mat-progress-buttons";
import {
  MatDialogRef,
  MatDialog,
  MAT_DIALOG_DATA,
  DateAdapter,
  MatPaginatorIntl,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
} from "@angular/material";
import { MarcadorService } from "src/app/service/Configuracion/marcador.service";
import { ListaParametroservice } from "src/app/service/lista.parametro.service";
import { ParametroRequest } from "src/app/dto/ParametroRequest";
import {
  GRUPO_PARAMETRO,
  PARAMETRO,
  MENSAJES,
  PAG_SIZ_SMALL,
  PAG_OBT_SMALL,
  CRITERIO_INCLUSION,
  CRITERIO_EXCLUSION,
  MY_FORMATS_AUNA,
} from "src/app/common";
import { ParametroResponse } from "src/app/dto/ParametroResponse";
import { MessageComponent } from "src/app/core/message/message.component";
import { ExamenMedico } from "src/app/dto/ExamenMedico";
import * as _moment from "moment";
import { UsuarioService } from "src/app/dto/service/usuario.service";
import { WsResponse } from "src/app/dto/WsResponse";
import { ExamenMedicoDetalle } from "src/app/dto/ExamenMedicoDetalle";
import { Indicador } from "src/app/dto/Indicador";
import { Criterio } from "src/app/dto/Criterio";
import { MACResponse } from "src/app/dto/configuracion/MACResponse";
import { CheckListDTO } from "src/app/dto/configuracion/CheckListDTO";
import { RegistrarCriterioComponent } from "../criterio/registrar.component";
import { MatPaginatorIntlEspanol } from "src/app/directives/matpaginator-translate";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { EditarCriterioComponent } from "../criterio/editar.component";
import { ConfiguracionService } from "src/app/service/configuracion.service";
import { WsResponseOnco } from "src/app/dto/WsResponseOnco";

const moment = _moment;

export interface DataIndicadorDialog {
  title: string;
  mac: MACResponse;
  indicador: CheckListDTO;
  grpDiagnostico: number;
  tipo: number;
  codigo: string;
}

@Component({
  selector: "app-editar-indicador",
  templateUrl: "./editar.component.html",
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
export class EditarIndicadorComponent implements OnInit {
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

  marcadorRequest: Indicador = new Indicador();
  flagRegistro: boolean = false;

  titulo: string;

  listaEstado: any[] = [];
  spinnerEstado: boolean = true;

  displayedColumnsI: string[] = ["codigo", "criterio", "estado", "editar"];
  dataSourceI: Criterio[] = [];
  resultsLengthI: number = 0;
  isLoadingI: boolean = true;

  displayedColumnsE: string[] = ["codigo", "criterio", "estado", "editar"];
  dataSourceE: Criterio[] = [];
  resultsLengthE: number = 0;
  isLoadingE: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<EditarIndicadorComponent>,
    public dialog: MatDialog,
    private listaParametroservice: ListaParametroservice,
    @Inject(MAT_DIALOG_DATA) public data: DataIndicadorDialog,
    public confService: ConfiguracionService,
    private marcadorService: MarcadorService
  ) {}

  ngOnInit() {
    this.cargarParametro();

    this.titulo = "EDITAR INDICACIÓN";

    this.marcadorForm = new FormGroup({
      codigo: new FormControl(
        { value: this.data.indicador.codIndicadorLargo, disabled: true },
        []
      ),
      estado: new FormControl(this.data.indicador.codEstado, [
        Validators.required,
      ]),
      descripcion: new FormControl(this.data.indicador.descripcion, [
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

    this.isLoadingI = true;
    this.confService.listarCriterioInclusion(this.data.indicador).subscribe(
      (respuesta: WsResponseOnco) => {
        this.isLoadingI = false;
        if (respuesta.audiResponse.codigoRespuesta === "0") {
          this.dataSourceI = respuesta.dataList;
          this.resultsLengthI = this.dataSourceI.length;
          this.marcadorBtnOpts.disabled = false;
        } else {
          console.error(respuesta);
        }
      },
      (error) => {
        this.isLoadingI = false;
        console.error("Error al listar Criterios de Inclusión");
      }
    );

    this.isLoadingE = true;
    this.confService.listarCriterioExclusion(this.data.indicador).subscribe(
      (respuesta: WsResponseOnco) => {
        this.isLoadingE = false;
        if (respuesta.audiResponse.codigoRespuesta === "0") {
          this.dataSourceE = respuesta.dataList;
          this.resultsLengthE = this.dataSourceE.length;
          this.marcadorBtnOpts.disabled = false;
        } else {
          console.error(respuesta);
        }
      },
      (error) => {
        this.isLoadingE = false;
        console.error("Error al listar Criterios de Exclusión");
      }
    );
  }

  accionMarcador() {
    this.marcadorSubmitted = true;

    if (this.marcadorForm.invalid) {
      return;
    }

    this.marcadorRequest.codChkListIndi = this.data.indicador.codChkListIndi;
    this.marcadorRequest.codEstado = this.marcadorForm.get("estado").value;
    this.marcadorRequest.codGrpDiag = this.data.grpDiagnostico;
    this.marcadorRequest.codMac = this.data.mac.codigo;
    this.marcadorRequest.descripcion =
      this.marcadorForm.get("descripcion").value;
    this.marcadorRequest.codIndicadorLargo =
      this.marcadorForm.get("codigo").value;

    this.marcadorRequest.listaCriterioInclusion = this.dataSourceI.map((o) => {
      o.codMac = this.data.mac.codigo;
      o.codGrpDiag = this.data.grpDiagnostico;
      return o;
    });
    this.marcadorRequest.listaCriterioExclusion = this.dataSourceE.map((o) => {
      o.codMac = this.data.mac.codigo;
      o.codGrpDiag = this.data.grpDiagnostico;
      return o;
    });

    this.marcadorBtnOpts.active = true;

    this.marcadorService.registrarIndicador(this.marcadorRequest).subscribe(
      (respuesta: WsResponse) => {
        this.marcadorBtnOpts.active = false;
        if (respuesta.audiResponse.codigoRespuesta != "0") {
          console.error("Error al Registrar Indicador");
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            "Error al Registrar Indicador",
            true,
            false,
            null
          );
        } else {
          this.flagRegistro = true;
          this.openDialogMensaje(MENSAJES.INFO_ACEPTAR, "", true, false, null);
        }
      },
      (error) => {
        this.marcadorBtnOpts.active = false;
        console.error(error);
        this.openDialogMensaje(
          MENSAJES.ERROR_SERVICIO,
          "Error al Registrar Indicador",
          true,
          false,
          null
        );
      }
    );
  }

  openCriterioI() {
    this.openCriterioRegistrar(CRITERIO_INCLUSION);
  }

  openCriterioE() {
    this.openCriterioRegistrar(CRITERIO_EXCLUSION);
  }

  openCriterioRegistrar(tipo: string): void {
    var auxCodTip = "";
    if (tipo === CRITERIO_INCLUSION) {
      auxCodTip = this.dataSourceI
        ? (this.dataSourceI.length + 1).toString().padStart(2, "0")
        : "01";
    } else {
      auxCodTip = this.dataSourceE
        ? (this.dataSourceE.length + 1).toString().padStart(2, "0")
        : "01";
    }
    const dialogRef = this.dialog.open(RegistrarCriterioComponent, {
      width: "640px",
      disableClose: true,
      autoFocus: false,
      data: {
        tipo: tipo,
        codigo: auxCodTip,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      var auxDataCriterio: Criterio[] = [];
      if (result.tipo && result.tipo === CRITERIO_INCLUSION) {
        auxDataCriterio = this.dataSourceI.map(function (o) {
          return o;
        });
        auxDataCriterio.push(result.criterio);
        this.dataSourceI = auxDataCriterio;
        this.resultsLengthI = this.dataSourceI.length;
      } else if (result.tipo && result.tipo === CRITERIO_EXCLUSION) {
        auxDataCriterio = this.dataSourceE.map(function (o) {
          return o;
        });
        auxDataCriterio.push(result.criterio);
        this.dataSourceE = auxDataCriterio;
        this.resultsLengthE = this.dataSourceE.length;
      }
    });
  }

  openCriterioEditarI(criterio: Criterio) {
    this.openCriterioEditar(criterio, CRITERIO_INCLUSION);
  }

  openCriterioEditarE(criterio: Criterio) {
    this.openCriterioEditar(criterio, CRITERIO_EXCLUSION);
  }

  openCriterioEditar(criterio: Criterio, tipo: string): void {
    var auxCodTip = "";
    const dialogRef = this.dialog.open(EditarCriterioComponent, {
      width: "640px",
      disableClose: true,
      autoFocus: false,
      data: {
        tipo: tipo,
        criterio: criterio,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      var auxDataCriterio: Criterio[] = [];
      if (result.tipo && result.tipo === CRITERIO_INCLUSION) {
        auxDataCriterio = this.dataSourceI.map(function (o) {
          if (
            (o.codCriterio && o.codCriterio === result.criterio.codCriterio) ||
            o.codCriterioLargo === result.criterio.codCriterioLargo
          ) {
            return result.criterio;
          } else {
            return o;
          }
        });
        this.dataSourceI = auxDataCriterio;
        this.resultsLengthI = this.dataSourceI.length;
      } else if (result.tipo && result.tipo === CRITERIO_EXCLUSION) {
        auxDataCriterio = this.dataSourceE.map(function (o) {
          if (
            (o.codCriterio && o.codCriterio === result.criterio.codCriterio) ||
            o.codCriterioLargo === result.criterio.codCriterioLargo
          ) {
            return result.criterio;
          } else {
            return o;
          }
        });
        this.dataSourceE = auxDataCriterio;
        this.resultsLengthE = this.dataSourceE.length;
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
