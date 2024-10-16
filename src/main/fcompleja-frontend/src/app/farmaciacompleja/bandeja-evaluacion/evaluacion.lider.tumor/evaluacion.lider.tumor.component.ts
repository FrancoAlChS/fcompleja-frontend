import { Component, OnInit, Inject } from "@angular/core";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";

import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_FORMATS,
} from "@angular/material-moment-adapter";

import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators,
} from "@angular/forms";
import {
  VALIDACION_PARAMETRO,
  GRUPO_PARAMETRO,
  MENSAJES,
  MY_FORMATS_AUNA,
} from "src/app/common";
import { MessageComponent } from "src/app/core/message/message.component";
import { ActivatedRoute, Router } from "@angular/router";

//service
import { ListaParametroservice } from "../../../service/lista.parametro.service";
//request
import { ParametroRequest } from "src/app/dto/ParametroRequest";
import { WsResponse } from "src/app/dto/WsResponse";
import { DetalleSolicitudEvaluacionService } from "src/app/service/detalle.solicitud.evaluacion.service";
import { RespuestEvaluacionRequest } from "src/app/dto/request/RespuestaEvaluacionRequest";
import { BEvaluacionLocalStorage } from "src/app/dto/solicitudEvaluacion/bandeja/BEvaluacionLocalStorage";
import { DatePipe } from "@angular/common";
import { Parametro } from "src/app/dto/Parametro";
import { EvaluacionService } from "src/app/dto/service/evaluacion.service";
import { UsuarioService } from "src/app/dto/service/usuario.service";
import { BOpcionMenuLocalStorage } from "src/app/dto/core/BOpcionMenuLocalStorage";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";

export interface DialogData {
  title: string;
}

@Component({
  selector: "app-evaluacion.lider.tumor",
  templateUrl: "./evaluacion.lider.tumor.component.html",
  styleUrls: ["./evaluacion.lider.tumor.component.scss"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS_AUNA },
  ],
})
export class EvaluacionLiderTumorComponent implements OnInit {
  liderTumorFrmGrp: FormGroup;
  parametroRequest: ParametroRequest = new ParametroRequest();
  evaLidFrmGrp: FormGroup;
  listaResultado: Parametro[];
  respuestaEvaluacion: string;
  mensajes: string;
  rptaEvaLiderTumorRequest: RespuestEvaluacionRequest = new RespuestEvaluacionRequest();
  enrutarPopUp: boolean = false;
  maxDate: Date;

  opcionMenu: BOpcionMenuLocalStorage;

  txtLiderTumor: number;
  txtFecEvaluacion: number;
  cbResEvaluacion: number;
  txtComentarios: number;
  btnGrabar: number;
  btnSalir: number;

  constructor(
    public dialogRef: MatDialogRef<EvaluacionLiderTumorComponent>,
    private adapter: DateAdapter<any>,
    public dialog: MatDialog,
    private datePipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    @Inject(EvaluacionService) private solicitud: EvaluacionService,
    @Inject(UsuarioService) private userService: UsuarioService,
    private listaParametroservice: ListaParametroservice,
    private detalleSolicitudEvaluacionService: DetalleSolicitudEvaluacionService,
    private spinnerService: Ng4LoadingSpinnerService,
    private router: Router
  ) {
    this.adapter.setLocale("es-PE");
  }

  ngOnInit() {
    this.createFormGroup();
    this.inicializarParametros();
    this.listarResultadoLiderTumor();
    this.accesoOpcionMenu();
    
  }

  public createFormGroup(): void {
    this.liderTumorFrmGrp = new FormGroup({
      liderTumorFrmCtrl: new FormControl(null),
      fechaEvaFrmCtrl: new FormControl(null),
      resLiderTumorFrmCtrl: new FormControl(null, [Validators.required]),
      cometarioFrmCtrl: new FormControl(null, [Validators.required]),
    });
  }

  get liderTumorFrmCtrl() {
    return this.liderTumorFrmGrp.get("liderTumorFrmCtrl");
  }
  get fechaEvaFrmCtrl() {
    return this.liderTumorFrmGrp.get("fechaEvaFrmCtrl");
  }
  get resLiderTumorFrmCtrl() {
    return this.liderTumorFrmGrp.get("resLiderTumorFrmCtrl");
  }
  get cometarioFrmCtrl() {
    return this.liderTumorFrmGrp.get("cometarioFrmCtrl");
  }

  public inicializarParametros(): void {
    this.maxDate = new Date();
    this.liderTumorFrmCtrl.setValue(this.data["nombreLiderTumor"]);
    this.fechaEvaFrmCtrl.setValue(new Date());
    this.listaResultado = [];
    this.resLiderTumorFrmCtrl.setValue(null);
  }

  public onNoClick(): void {
    this.dialogRef.close();
    this.router.navigate(["./app/detalle-evaluacion"]);
  }

  public obtenerCombo(lista: any[], valor: number, descripcion: string) {
    lista.unshift({
      codigoParametro: valor,
      nombreParametro: descripcion,
    });
  }

  // POP-UP MENSAJES
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
        title: MENSAJES.liderTumor.TITLE,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (this.enrutarPopUp) {
        this.dialogRef.close();
        this.router.navigate(["./app/detalle-evaluacion"]);
      }
    });
  }

  public listarResultadoLiderTumor(): void {
    this.parametroRequest.codigoGrupo = GRUPO_PARAMETRO.estadoSolEva;
    this.parametroRequest.codigoParam = VALIDACION_PARAMETRO.perfilLiderTumor;
    this.listaParametroservice
      .consultarParametro(this.parametroRequest)
      .subscribe(
        (data: WsResponse) => {
          if (data.audiResponse.codigoRespuesta === "0") {
            this.listaResultado = data.data;
            this.obtenerCombo(
              this.listaResultado,
              null,
              "-- SELECCIONAR RESULTADO EVALUACIÓN --"
            );
          } else {
            console.error("No se encuentra data con el codigo de grupo");
          }
        },
        (error) => {
          console.error(error);
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            "Error al obtener filtro de evaluación",
            true,
            false,
            null
          );
        }
      );
  }

  public ValidacionForm(): boolean {
    this.mensajes = "";
    let validar = true;

    if (this.resLiderTumorFrmCtrl.invalid) {
      this.resLiderTumorFrmCtrl.markAsTouched();
      this.mensajes =
        this.mensajes + "\n*Ingresar el resultado de la evaluación.";
      validar = false;
    }

    if (this.cometarioFrmCtrl.invalid) {
      this.cometarioFrmCtrl.markAsTouched();
      this.mensajes =
        this.mensajes + "\n*Ingresar comentarios de la evaluación.";
      validar = false;
    }

    return validar;
  }

  public guardarParametros(): void {
    this.rptaEvaLiderTumorRequest.codSolEva = this.solicitud.codSolEvaluacion;
    this.rptaEvaLiderTumorRequest.rptaSolEva = this.resLiderTumorFrmCtrl.value;
    this.rptaEvaLiderTumorRequest.fechaSolEvaRpta = this.datePipe.transform(
      this.fechaEvaFrmCtrl.value,
      "dd/MM/yyyy"
    );
    this.rptaEvaLiderTumorRequest.comentarioSolEva = this.cometarioFrmCtrl.value;
    // this.rptaEvaLiderTumorRequest.codigoLiderTumor = 2547; // TO-DO
    //this.rptaEvaLiderTumorRequest.codigoLiderTumor = this.solicitud.codUsrLiderTum; // CODIGO LIDER TUMOR
    this.rptaEvaLiderTumorRequest.codigoLiderTumor = this.data["codLiderTumor"]; // CODIGO LIDER TUMOR
    this.rptaEvaLiderTumorRequest.codigoRolLiderTumor = 10; //8: EL ROL DE LIDER TUMOR

    //this.rptaEvaLiderTumorRequest.codigoRolLiderTumor = this.solicitud.codRolLiderTum; //8: EL ROL DE LIDER TUMOR
    this.rptaEvaLiderTumorRequest.codigoRolUsuario = this.userService.getCodRol; //2: TO-DO SEGUIMIENTO
    this.rptaEvaLiderTumorRequest.codigoUsuario = this.userService.getCodUsuario; //1003: TO-DO SEGUIMIENTO
  }

  public insertarEvaluacion(): void {
    this.spinnerService.show();
    
    if (this.ValidacionForm()) {
      this.guardarParametros();
      
      this.detalleSolicitudEvaluacionService
        .insertarRptaEva(this.rptaEvaLiderTumorRequest)
        .subscribe(
          (data: WsResponse) => {
            ;
            this.enrutarPopUp = true;
            this.respuestaEvaluacion = data.audiResponse.mensajeRespuesta;
            this.openDialogMensaje(
              this.respuestaEvaluacion,
              null,
              true,
              false,
              null
            );
            this.spinnerService.hide();
            this.router.navigate(["./app/detalle-evaluacion"])
          },
          (error) => {
            console.error("Error al insertar el resultado de la evaluacion");
            this.spinnerService.hide();
          }
        );
    } else {
      this.enrutarPopUp = false;
      this.mensajes = this.mensajes !== "" ? this.mensajes : null;
      this.openDialogMensaje(
        MENSAJES.ERROR_CAMPOS,
        this.mensajes,
        true,
        false,
        null
      );
      this.spinnerService.hide();
    }
  }

  public accesoOpcionMenu() {
    const data = require("src/assets/data/permisosRecursos.json");
    const evaluacionLiderTumor = data.bandejaEvaluacion.evaluacionLiderTumor;
    this.opcionMenu = JSON.parse(localStorage.getItem("opcionMenu"));

    if (this.opcionMenu.opcion.length > 0) {
      this.opcionMenu.opcion.forEach((element) => {
        const codOpcion = element.codOpcion;
        switch (codOpcion) {
          case evaluacionLiderTumor.txtLiderTumor:
            this.txtLiderTumor = Number(element.flagAsignacion);
            break;
          case evaluacionLiderTumor.txtFecEvaluacion:
            this.txtFecEvaluacion = Number(element.flagAsignacion);
            break;
          case evaluacionLiderTumor.cbResEvaluacion:
            this.cbResEvaluacion = Number(element.flagAsignacion);
            break;
          case evaluacionLiderTumor.txtComentarios:
            this.txtComentarios = Number(element.flagAsignacion);
            break;
          case evaluacionLiderTumor.btnGrabar:
            this.btnGrabar = Number(element.flagAsignacion);
            break;
          case evaluacionLiderTumor.btnSalir:
            this.btnSalir = Number(element.flagAsignacion);
            break;
        }
      });
    }
  }
}
