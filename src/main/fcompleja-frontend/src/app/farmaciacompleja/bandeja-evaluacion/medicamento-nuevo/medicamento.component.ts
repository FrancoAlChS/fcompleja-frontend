import {
  Component,
  OnInit,
  ViewChild,
  forwardRef,
  Inject,
  SimpleChanges,
  OnChanges,
} from "@angular/core";
import { FormControl } from "@angular/forms";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MatDialog, MatPaginatorIntl, MatStepper } from "@angular/material";

import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material/core";

import {
  MY_FORMATS_AUNA,
  MENSAJES,
  FILEFTP,
  FLAG_REGLAS_EVALUACION,
  ACCESO_EVALUACION,
  GRUPO_PARAMETRO,
} from "../../../common";
import * as _moment from "moment";
import { Router } from "@angular/router";
import { ParametroRequest } from "src/app/dto/ParametroRequest";
import { MessageComponent } from "src/app/core/message/message.component";

import { LineaTrataPrefeInstiRequest } from "src/app/dto/request/LineaTrataPrefeInstiRequest";
import { PreferenciaInstitucionalesComponent } from "./preferencia-institucionales/preferencia-institucionales.component";
import { MatPaginatorIntlEspanol } from "src/app/directives/matpaginator-translate";
import { CondicionBasalComponent } from "./condicion-basal/condicion-basal.component";
import { ChecklistPacienteComponent } from "./checklist-paciente/checklist-paciente.component";
import { AnalisisConclusionComponent } from "./analisis-conclusion/analisis-conclusion.component";
import { EvaluacionService } from "src/app/dto/service/evaluacion.service";
import { ChecklistRequisitosComponent } from "./checklist-requisitos/checklist-requisitos.component";
import { ArchivoFTP } from "src/app/dto/bandeja-preliminar/detalle-preliminar/ArchivoFTP";
import { UsuarioService } from "src/app/dto/service/usuario.service";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { WsResponse } from "src/app/dto/WsResponse";
import { CoreService } from "src/app/service/core.service";
import { BOpcionMenuLocalStorage } from "src/app/dto/core/BOpcionMenuLocalStorage";
import { ParametroBeanRequest } from "src/app/dto/ParametroBeanRequest";
import { ParametroService } from "src/app/service/cross/parametro.service";
import { WsResponseOnco } from "src/app/dto/WsResponseOnco";
import { ListaParametroservice } from "src/app/service/lista.parametro.service";
import { ParametroResponse } from "src/app/dto/ParametroResponse";
import { BandejaEvaluacionService } from "src/app/service/bandeja.evaluacion.service";
import { ObservacionesComponent } from "./observaciones/observaciones.component";

@Component({
  selector: "app-medicamento",
  templateUrl: "./medicamento.component.html",
  styleUrls: ["./medicamento.component.scss"],
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
export class MedicamentoNuevoComponent implements OnInit, OnChanges {
  @ViewChild("stepper") stepper: MatStepper;

  btnSiguiente: boolean;
  btnFinalizar: boolean;
  btnAtras: boolean;
  btnSalir: boolean;
  btnGrabar: boolean;

  stepperIndex: number;
  mensajes: string;

  @ViewChild(PreferenciaInstitucionalesComponent)
  prefComponent: PreferenciaInstitucionalesComponent;
  @ViewChild(ChecklistRequisitosComponent)
  chkListComponent: ChecklistRequisitosComponent;
  @ViewChild(CondicionBasalComponent)
  conBasalComponent: CondicionBasalComponent;
  @ViewChild(ChecklistPacienteComponent)
  chkPcteComponent: ChecklistPacienteComponent;
  @ViewChild(AnalisisConclusionComponent)
  anaConComponent: AnalisisConclusionComponent;
  @ViewChild(ObservacionesComponent) obserComponent: ObservacionesComponent;

  flagBtnAtras: boolean;
  flagBtnGrabar: boolean;
  flagBtnSiguiente: boolean;
  flagBtnSalir: boolean;
  flagBtnFinalizar: boolean;

  opcionMenu: BOpcionMenuLocalStorage;
  btnGrabarPaso1: number;
  btnSalirPaso1: number;
  btnSiguientePaso1: number;
  btnAtrasPaso2: number;
  btnGrabarPaso2: number;
  btnSalirPaso2: number;
  btnSiguientePaso2: number;
  btnAtrasPaso3: number;
  btnGrabarPaso3: number;
  btnSalirPaso3: number;
  btnSiguientePaso3: number;
  btnAtrasPaso4: number;
  btnGrabarPaso4: number;
  btnSalirPaso4: number;
  btnSiguientePaso4: number;
  btnAtrasPaso5: number;
  btnGrabarPaso5: number;
  btnSalirPaso5: number;
  btnFinalizarPaso5: number;
  btnAtrasPaso6: number;
  btnGrabarPaso6: number;
  btnSalirPaso6: number;
  btnFinalizarPaso6: number;
  flagEvaluacion = FLAG_REGLAS_EVALUACION;
  valorMostrarOpcion = ACCESO_EVALUACION.mostrarOpcion;

  listaGuias: any[] = [];

  constructor(
    private adapter: DateAdapter<any>,
    private listaParametroservice: ListaParametroservice,
    public dialog: MatDialog,
    private spinnerService: Ng4LoadingSpinnerService,
    private coreService: CoreService,
    private bandejaEvaluacionService: BandejaEvaluacionService,
    @Inject(UsuarioService) private userService: UsuarioService,
    @Inject(EvaluacionService) private solicitud: EvaluacionService,
    private router: Router
  ) {
    this.adapter.setLocale("es-PE");
  }

  public minDate: Date;
  public maxDate: Date;

  private titleMedicamento: string;

  public bloquearBtn: boolean;

  public showPrimero: boolean;
  public showUltimo: boolean;

  public section = new FormControl(0);

  parametroRequest: ParametroRequest;

  lineaTratRequest: LineaTrataPrefeInstiRequest;

  mensajesErrores: String[] = [];

  favoriteSeason: string;
  seasons: string[] = ["Si", "No"];
  favoriteSeason1: string;
  seasons1: string[] = ["Si", "No"];
  favoriteSeason2: string;
  seasons2: string[] = ["Si", "No"];
  favoriteSeason3: string;
  seasons3: string[] = ["Si", "No"];
  rgPrefInsti: any;

  btnVisible: boolean;

  /**Reutilizar para CheckButton */
  rbtExisteToxi: any[] = [
    {
      codigo: 1,
      titulo: "SI",
      selected: false,
    },
    {
      codigo: 0,
      titulo: "NO",
      selected: false,
    },
  ];

  rbtPertinencia: any[] = [
    {
      codigo: 1,
      titulo: "SI",
      selected: false,
    },
    {
      codigo: 0,
      titulo: "NO",
      selected: false,
    },
  ];

  rbtCriterios: any[] = [
    {
      codigo: 1,
      titulo: "SI",
      selected: false,
    },
    {
      codigo: 0,
      titulo: "NO",
      selected: false,
    },
  ];

  ngOnInit() {
    this.accesoOpcionMenu();

    this.inicializarVariables();
    this.cargarPaginaTab();
    this.rolesButton();
  }

  verGuiasFinal() {
    var paramPerioMaxRequest: ParametroRequest = new ParametroRequest();
    paramPerioMaxRequest.codigoGrupo = GRUPO_PARAMETRO.guias;
    this.listaParametroservice.listaParametro(paramPerioMaxRequest).subscribe(
      (data: ParametroResponse) => {
        if (data.codigoResultado === 0) {
          this.listaGuias = data.filtroParametro;
        } else {
        }
      },
      (error) => {
        console.error("Error al listar Guías");
      }
    );

    this.listaGuias.forEach(function (g) {
      window.open(g.valor1Parametro, "_blank");
    });
  }

  ngOnChanges(changes: SimpleChanges): void {}

  public inicializarVariables(): void {
    this.parametroRequest = new ParametroRequest();
    this.maxDate = new Date();
    if (typeof this.solicitud.codSolEvaluacion !== "undefined") {
      this.solicitud.setEvaluacion = this.solicitud;
    }
    this.btnVisible = localStorage.getItem("modeConsulta") ? true : false;
  }

  public evaluarBotones($event) {
    switch (this.stepperIndex) {
      case 0:
        this.showPrimero = true;
        this.showUltimo = false;
        this.btnSiguiente = $event ? true : false;
        break;
      case 1:
        this.showPrimero = false;
        this.showUltimo = false;
        this.btnSiguiente = $event ? true : false;
        break;
      case 2:
        this.showPrimero = false;
        this.showUltimo = false;
        this.btnSiguiente = $event ? true : false;
        break;
      case 3:
        this.showPrimero = false;
        this.showUltimo = false;
        this.btnSiguiente = $event ? true : false;
        break;
      case 4:
        this.showPrimero = false;
        this.showUltimo = false;
        this.btnFinalizar = $event ? true : false;
        break;
      case 5:
        this.showPrimero = false;
        this.showUltimo = true;
        this.btnFinalizar = $event ? true : false;
        break;
    }
  }

  public evaluador() {
    if (this.solicitud.estadoEvaluacion) {
      switch (this.stepperIndex) {
        case 0:
          this.stepperIndex = 0;
          this.evaluarBotones(false);
          this.prefComponent.iniciarNuevaLineaTrataPrefeInsti();
          break;
        case 1:
          this.stepperIndex = 1;
          this.evaluarBotones(false);
          this.chkListComponent.iniciarCheckListRequisito();
          break;
        case 2:
          this.stepperIndex = 2;
          this.evaluarBotones(false);
          this.conBasalComponent.iniciarCondicionBasalPaciente();
          break;
        case 3:
          this.stepperIndex = 3;
          this.evaluarBotones(false);
          this.chkPcteComponent.iniciarChkListPaciente();
          break;
        case 4:
          this.stepperIndex = 4;
          this.evaluarBotones(false);
          this.anaConComponent.iniciarAnalisisConclusion();
          break;
        case 5:
          this.stepperIndex = 5;
          this.evaluarBotones(false);
          this.obserComponent.iniciarObservaciones();
          break;
      }
    }
  }

  public salirSection() {
    //this.canDeactivate()
    this.router.navigate(["./app/bandeja-evaluacion"]);
    //this.openDialogMensaje(MENSAJES.medicNuevo.TITLE, MENSAJES.INFO_SALIR, MENSAJES.INFO_SALIR2, false, true, null, 'salir');
  }

  public atrasSection() {
    this.openDialogMensaje(
      MENSAJES.medicNuevo.TITLE,
      this.titleMedicamento,
      MENSAJES.INFO_ATRAS,
      false,
      true,
      null,
      "atras"
    );
  }

  public siguienteSection() {
    this.stepperIndex = this.stepperIndex + 1;
    if (this.stepperIndex > 0) {
      this.showPrimero = false;
    }
    if (this.stepperIndex > 3) {
      this.showUltimo = true;
    }
  }

  // POP-UP MENSAJES
  public openDialogMensaje(
    title: String,
    message: String,
    message2: String,
    alerta: boolean,
    confirmacion: boolean,
    valor: any,
    opcion: string
  ): void {
    const dialogRef = this.dialog.open(MessageComponent, {
      disableClose: true,
      width: "400px",
      data: {
        title: title,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((rspta) => {
      if (opcion === "salir" && rspta === 1) {
        // PARA SALIR
        this.router.navigate(["./app/bandeja-evaluacion"]);
      } else if (opcion === "atras" && rspta === 1) {
        // PARA ATRAS
        this.stepperIndex = this.stepperIndex - 1;
        if (this.stepperIndex < 1) {
          this.showPrimero = true;
          this.showUltimo = false;
        }
        if (this.stepperIndex < 4) {
          this.showUltimo = false;
        }
      }
    });
  }

  public guardarPaso() {
    switch (this.stepperIndex) {
      case 0:
        this.bloquearBotones(true);
        this.prefComponent.insertarCondicionBasal();
        break;
      case 1:
        this.bloquearBotones(true);
        this.chkListComponent.guardarChecklistRequisito();
        break;
      case 2:
        this.bloquearBotones(true);
        this.conBasalComponent.insertarLineaTratamiento();
        break;
      case 3:
        this.bloquearBotones(true);
        this.chkPcteComponent.guardarChkListPaciente();
        break;
      case 4:
        this.bloquearBotones(true);
        this.anaConComponent.guardarAnalisisConclusion(true);
        break;
      case 5:
        this.obserComponent.grabarPaso6(1);
        break;
    }
  }

  public capturarRegistroEval(): void {
    if (typeof this.solicitud.codSolEvaluacion === "undefined") {
      this.solicitud = this.solicitud.getEvaluacion;
    }
  }

  public cargarPaginaTab(): void {
    this.capturarRegistroEval();
    switch (this.solicitud.estadoEvaluacion) {
      case 13:
        this.stepperIndex = 0;
        this.stepper.selectedIndex = 0;
        this.prefComponent.iniciarNuevaLineaTrataPrefeInsti();
        break;
      case 15:
        this.stepperIndex = 1;
        this.stepper.selectedIndex = 1;
        this.prefComponent.grabarPaso = "1";
        this.chkListComponent.iniciarCheckListRequisito();
        break;
      case 16:
        this.stepperIndex = 2;
        this.stepper.selectedIndex = 2;
        this.prefComponent.grabarPaso = "1";
        this.chkListComponent.grabarPaso = "1";
        this.conBasalComponent.iniciarCondicionBasalPaciente();
        break;
      case 17:
        this.stepperIndex = 3;
        this.stepper.selectedIndex = 3;
        this.showPrimero = false;
        this.showUltimo = false;
        this.prefComponent.grabarPaso = "1";
        this.chkListComponent.grabarPaso = "1";
        this.conBasalComponent.grabarPaso = "1";

        this.chkPcteComponent.iniciarChkListPaciente();
        break;
      case 18:
        this.stepperIndex = 4;
        this.showPrimero = false;
        this.showUltimo = true;
        this.prefComponent.grabarPaso = "1";
        this.chkListComponent.grabarPaso = "1";
        this.conBasalComponent.grabarPaso = "1";
        this.chkPcteComponent.grabarPaso = "1";
        this.stepper.selectedIndex = 4;
        this.anaConComponent.iniciarAnalisisConclusion();
        break;
      case 19:
        this.stepperIndex = 4;
        this.showPrimero = false;
        this.showUltimo = true;
        this.prefComponent.grabarPaso = "1";
        this.chkListComponent.grabarPaso = "1";
        this.conBasalComponent.grabarPaso = "1";
        this.chkPcteComponent.grabarPaso = "1";
        this.anaConComponent.grabarPaso = "1";
        this.stepper.selectedIndex = 4;
        this.anaConComponent.iniciarAnalisisConclusion();
        break;
      case 505:
        this.stepperIndex = 5;
        this.showPrimero = false;
        this.showUltimo = true;
        this.prefComponent.grabarPaso = "1";
        this.chkListComponent.grabarPaso = "1";
        this.conBasalComponent.grabarPaso = "1";
        this.chkPcteComponent.grabarPaso = "1";
        this.anaConComponent.grabarPaso = "1";
        this.stepper.selectedIndex = 5;
        this.obserComponent.iniciarObservaciones();
        break;
      case 516:
        this.stepperIndex = 5;
        this.showPrimero = false;
        this.showUltimo = true;
        this.prefComponent.grabarPaso = "1";
        this.chkListComponent.grabarPaso = "1";
        this.conBasalComponent.grabarPaso = "1";
        this.chkPcteComponent.grabarPaso = "1";
        this.anaConComponent.grabarPaso = "1";
        this.stepper.selectedIndex = 5;
        this.obserComponent.iniciarObservaciones();
        break;
      default:
        this.stepperIndex = 0;
        this.showPrimero = true;
        this.showUltimo = false;
        this.prefComponent.iniciarNuevaLineaTrataPrefeInsti();
        break;
    }
  }

  public cambiarPaso(event): void {
    this.stepperIndex = event.selectedIndex;
    this.evaluador();
    this.rolesButton();
  }

  public botonGrabar(event) {
    this.btnGrabar = event ? true : false;
  }

  public bloquearBotones(bloquear: boolean): void {
    this.bloquearBtn = bloquear;
  }

  public finalizarMedicamento() {
    this.obserComponent.grabarPaso6(2);
  }

  public verFichaTecnica(): void {
    if (
      typeof this.solicitud.codArchFichaTec === "undefined" ||
      this.solicitud.codArchFichaTec === null
    ) {
      this.openDialogMensaje(
        MENSAJES.medicNuevo.TITLE,
        "Descarga de PDF Ficha Técnica.",
        "No se ha subido archivo de ficha técnica.",
        true,
        false,
        `${this.solicitud.codMac} - ${this.solicitud.descMAC}`,
        "otros"
      );
      return;
    }

    const archivoRqt = new ArchivoFTP();
    archivoRqt.codArchivo = this.solicitud.codArchFichaTec;
    archivoRqt.ruta = FILEFTP.rutaConfiguracion;
    this.spinnerService.show();
    this.coreService.descargarArchivoFTP(archivoRqt).subscribe(
      (response: WsResponse) => {
        if (response.audiResponse.codigoRespuesta === "0") {
          response.data.contentType = "application/pdf";
          const blob = this.coreService.crearBlobFile(response.data);
          const link = document.createElement("a");
          link.target = "_blank";
          link.href = window.URL.createObjectURL(blob);
          link.setAttribute("download", response.data.nomArchivo);
          link.click();
          this.spinnerService.hide();
        } else {
          this.mensajes = response.audiResponse.mensajeRespuesta;
          this.openDialogMensaje(
            MENSAJES.medicNuevo.TITLE,
            MENSAJES.ERROR_NOFUNCION,
            this.mensajes,
            true,
            false,
            null,
            "otros"
          );
          this.spinnerService.hide();
        }
      },
      (error) => {
        console.error(error);
        this.openDialogMensaje(
          MENSAJES.medicNuevo.TITLE,
          MENSAJES.ERROR_SERVICIO,
          this.mensajes,
          true,
          false,
          null,
          "otros"
        );
        this.spinnerService.hide();
      }
    );
  }

  public verComplicaciones(): void {
    if (
      typeof this.solicitud.codArchCompMed === "undefined" ||
      this.solicitud.codArchCompMed === null
    ) {
      this.openDialogMensaje(
        MENSAJES.medicNuevo.TITLE,
        "Descarga de PDF Complicaciones médicas.",
        "No se ha subido archivo de complicaiones",
        true,
        false,
        `${this.solicitud.codMac} - ${this.solicitud.descMAC}`,
        "otros"
      );
      return;
    }

    const archivoRqt = new ArchivoFTP();
    archivoRqt.codArchivo = this.solicitud.codArchCompMed;
    archivoRqt.ruta = FILEFTP.rutaConfiguracion;
    this.spinnerService.show();
    this.coreService.descargarArchivoFTP(archivoRqt).subscribe(
      (response: WsResponse) => {
        if (response.audiResponse.codigoRespuesta === "0") {
          response.data.contentType = "application/pdf";
          const blob = this.coreService.crearBlobFile(response.data);
          const link = document.createElement("a");
          link.target = "_blank";
          link.href = window.URL.createObjectURL(blob);
          link.setAttribute("download", response.data.nomArchivo);
          link.click();
          this.spinnerService.hide();
        } else {
          this.mensajes = response.audiResponse.mensajeRespuesta;
          this.openDialogMensaje(
            MENSAJES.medicNuevo.TITLE,
            MENSAJES.ERROR_NOFUNCION,
            this.mensajes,
            true,
            false,
            null,
            "otros"
          );
          this.spinnerService.hide();
        }
      },
      (error) => {
        console.error(error);
        this.openDialogMensaje(
          MENSAJES.medicNuevo.TITLE,
          MENSAJES.ERROR_SERVICIO,
          this.mensajes,
          true,
          false,
          null,
          "otros"
        );
        this.spinnerService.hide();
      }
    );
  }

  public verGuias(): void {
    if (
      typeof FILEFTP.codiGuias === "undefined" ||
      FILEFTP.codiGuias === null
    ) {
      this.openDialogMensaje(
        MENSAJES.medicNuevo.TITLE,
        "Descarga de PDF Ficha Técnica.",
        "No se ha subido archivo de ficha técnica.",
        true,
        false,
        `${this.solicitud.codMac} - ${this.solicitud.descMAC}`,
        "otros"
      );
      return;
    }

    const archivoRqt = new ArchivoFTP();
    archivoRqt.codArchivo = FILEFTP.codiGuias;
    archivoRqt.ruta = FILEFTP.rutaVacia;
    this.spinnerService.show();
    this.coreService.descargarArchivoFTP(archivoRqt).subscribe(
      (response: WsResponse) => {
        if (response.audiResponse.codigoRespuesta === "0") {
          response.data.contentType = "application/pdf";
          const blob = this.coreService.crearBlobFile(response.data);
          const link = document.createElement("a");
          link.target = "_blank";
          link.href = window.URL.createObjectURL(blob);
          link.setAttribute("download", response.data.nomArchivo);
          link.click();
          this.spinnerService.hide();
        } else {
          this.mensajes = response.audiResponse.mensajeRespuesta;
          this.openDialogMensaje(
            MENSAJES.medicNuevo.TITLE,
            MENSAJES.ERROR_NOFUNCION,
            this.mensajes,
            true,
            false,
            null,
            "otros"
          );
          this.spinnerService.hide();
        }
      },
      (error) => {
        console.error(error);
        this.openDialogMensaje(
          MENSAJES.medicNuevo.TITLE,
          MENSAJES.ERROR_SERVICIO,
          this.mensajes,
          true,
          false,
          null,
          "otros"
        );
        this.spinnerService.hide();
      }
    );
  }

  public rolesButton(): void {
    switch (this.stepperIndex) {
      case 0:
        this.flagBtnAtras = false || this.flagEvaluacion;
        this.flagBtnGrabar =
          this.btnGrabarPaso1 === this.valorMostrarOpcion ||
          this.flagEvaluacion;
        this.flagBtnSiguiente =
          this.btnSiguientePaso1 === this.valorMostrarOpcion ||
          this.flagEvaluacion;
        this.flagBtnSalir =
          this.btnSalirPaso1 === this.valorMostrarOpcion || this.flagEvaluacion;
        this.flagBtnFinalizar = false || this.flagEvaluacion;
        break;
      case 1:
        this.flagBtnAtras =
          this.btnAtrasPaso2 === this.valorMostrarOpcion || this.flagEvaluacion;
        this.flagBtnGrabar =
          this.btnGrabarPaso2 === this.valorMostrarOpcion ||
          this.flagEvaluacion;
        this.flagBtnSiguiente =
          this.btnSiguientePaso2 === this.valorMostrarOpcion ||
          this.flagEvaluacion;
        this.flagBtnSalir =
          this.btnSalirPaso2 === this.valorMostrarOpcion || this.flagEvaluacion;
        this.flagBtnFinalizar = false || this.flagEvaluacion;
        break;
      case 2:
        this.flagBtnAtras =
          this.btnAtrasPaso3 === this.valorMostrarOpcion || this.flagEvaluacion;
        this.flagBtnGrabar =
          this.btnGrabarPaso3 === this.valorMostrarOpcion ||
          this.flagEvaluacion;
        this.flagBtnSiguiente =
          this.btnSiguientePaso3 === this.valorMostrarOpcion ||
          this.flagEvaluacion;
        this.flagBtnSalir =
          this.btnSalirPaso3 === this.valorMostrarOpcion || this.flagEvaluacion;
        this.flagBtnFinalizar = false || this.flagEvaluacion;
        break;
      case 3:
        this.flagBtnAtras =
          this.btnAtrasPaso4 === this.valorMostrarOpcion || this.flagEvaluacion;
        this.flagBtnGrabar =
          this.btnGrabarPaso4 === this.valorMostrarOpcion ||
          this.flagEvaluacion;
        this.flagBtnSiguiente =
          this.btnSiguientePaso4 === this.valorMostrarOpcion ||
          this.flagEvaluacion;
        this.flagBtnSalir =
          this.btnSalirPaso4 === this.valorMostrarOpcion || this.flagEvaluacion;
        this.flagBtnFinalizar = false || this.flagEvaluacion;
        break;
      case 4:
        this.flagBtnAtras =
          this.btnAtrasPaso5 === this.valorMostrarOpcion || this.flagEvaluacion;
        this.flagBtnGrabar =
          this.btnGrabarPaso5 === this.valorMostrarOpcion ||
          this.flagEvaluacion;
        this.flagBtnSiguiente = false || this.flagEvaluacion;
        this.flagBtnSalir =
          this.btnSalirPaso5 === this.valorMostrarOpcion || this.flagEvaluacion;
        this.flagBtnFinalizar =
          this.btnFinalizarPaso5 === this.valorMostrarOpcion ||
          this.flagEvaluacion;
        break;
      case 5:
        this.flagBtnAtras =
          this.btnAtrasPaso6 === this.valorMostrarOpcion || this.flagEvaluacion;
        this.flagBtnGrabar =
          this.btnGrabarPaso6 === this.valorMostrarOpcion ||
          this.flagEvaluacion;
        this.flagBtnSiguiente = false || this.flagEvaluacion;
        this.flagBtnSalir =
          this.btnSalirPaso6 === this.valorMostrarOpcion || this.flagEvaluacion;
        this.flagBtnFinalizar =
          this.btnFinalizarPaso6 === this.valorMostrarOpcion ||
          this.flagEvaluacion;
        break;
    }
  }

  public accesoOpcionMenu() {
    const data = require("src/assets/data/permisosRecursos.json");
    const bandejaEvaluacion = data.bandejaEvaluacion.medicamento;
    this.opcionMenu = JSON.parse(localStorage.getItem("opcionMenu"));

    if (this.opcionMenu.opcion.length > 0) {
      this.opcionMenu.opcion.forEach((element) => {
        const codOpcion = element.codOpcion;
        switch (codOpcion) {
          case bandejaEvaluacion.btnGrabarPaso1:
            this.btnGrabarPaso1 = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnSalirPaso1:
            this.btnSalirPaso1 = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnSiguientePaso1:
            this.btnSiguientePaso1 = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnAtrasPaso2:
            this.btnAtrasPaso2 = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnGrabarPaso2:
            this.btnGrabarPaso2 = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnSalirPaso2:
            this.btnSalirPaso2 = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnSiguientePaso2:
            this.btnSiguientePaso2 = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnAtrasPaso3:
            this.btnAtrasPaso3 = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnGrabarPaso3:
            this.btnGrabarPaso3 = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnSalirPaso3:
            this.btnSalirPaso3 = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnSiguientePaso3:
            this.btnSiguientePaso3 = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnAtrasPaso4:
            this.btnAtrasPaso4 = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnGrabarPaso4:
            this.btnGrabarPaso4 = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnSalirPaso4:
            this.btnSalirPaso4 = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnSiguientePaso4:
            this.btnSiguientePaso4 = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnAtrasPaso5:
            this.btnAtrasPaso5 = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnGrabarPaso5:
            this.btnGrabarPaso5 = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnSalirPaso5:
            this.btnSalirPaso5 = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnFinalizarPaso5:
            this.btnFinalizarPaso5 = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnAtrasPaso6:
            this.btnAtrasPaso6 = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnGrabarPaso6:
            this.btnGrabarPaso6 = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnSalirPaso6:
            this.btnSalirPaso6 = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnFinalizarPaso6:
            this.btnFinalizarPaso6 = Number(element.flagAsignacion);
            break;
        }
      });
    }
  }

  // public openDialogMensaje(
  //   message: String,
  //   message2: String,
  //   alerta: boolean,
  //   confirmacion: boolean,
  //   valor: any): void {
  //   const dialogRef = this.dialog.open(MessageComponent, {
  //     disableClose: true,
  //     width: '400px',
  //     data: {
  //       title: MENSAJES.medicNuevo.lineTrataPrefInst.TITLE,
  //       message: message,
  //       message2: message2,
  //       alerta: alerta,
  //       confirmacion: confirmacion,
  //       valor: valor
  //     }
  //   });
  //   dialogRef.afterClosed().subscribe(rspta => {
  //   });
  // }

  async canDeactivate() {
    const result = await this.openDialogMensajeSalida(
      "Los cambios no guardados se perderán ¿Desea continuar?",
      null,
      false,
      true,
      null
    );
    //const result = await this.openDialogMensaje(MENSAJES.medicNuevo.TITLE, "Se perderan los cambios,¿esta seguro que desea salir?", MENSAJES.INFO_SALIR2, false, true, null, 'salir')

    return result;
  }

  public openDialogMensajeSalida(
    message: string,
    message2: string,
    alerta: boolean,
    confirmacion: boolean,
    valor: any
  ): any {
    const dialogRef = this.dialog.open(MessageComponent, {
      width: "400px",
      disableClose: true,
      data: {
        title: MENSAJES.ANTECEDENTES.TITULO,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    return dialogRef
      .afterClosed()
      .toPromise() // here you have a Promise instead an Observable
      .then((result) => {
        if (result == 1) {
          this.retirarBanderaSolicitud();
          return Promise.resolve(result == 1);
        }
        //return Promise.resolve(result == 1); // will return a Promise here
      });
  }

  retirarBanderaSolicitud() {
    let codSolEva = localStorage.getItem("codSolEva");

    var json = {
      codSolEva: codSolEva,
      tipo: "SALIENDO",
    };

    this.bandejaEvaluacionService.consultarBanderaEvaluacion(json).subscribe(
      (data) => {
        //return false
      },
      (error) => {
        console.error(error);
        this.mensajes = "ERROR CON EL SERVICIO BANDEJA EVALUACION.";
        this.openDialogMensajeSalida(this.mensajes, null, true, false, null);
        this.spinnerService.hide();
      }
    );
  }
}
