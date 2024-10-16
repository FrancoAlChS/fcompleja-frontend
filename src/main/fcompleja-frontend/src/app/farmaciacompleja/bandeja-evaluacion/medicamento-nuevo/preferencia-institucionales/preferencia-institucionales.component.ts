import {
  Component,
  OnInit,
  Inject,
  Input,
  SimpleChanges,
  OnChanges,
  Output,
  EventEmitter,
} from "@angular/core";
import { FormGroup, FormControl, Validators, FormArray } from "@angular/forms";
import { Parametro } from "src/app/dto/Parametro";
import {
  PREFERENCIAINSTI,
  LINEATRATAMIENTO,
  GRUPO_PARAMETRO,
  TIPOSCGSOLBEN,
  MENSAJES,
  FLAG_REGLAS_EVALUACION,
  ACCESO_EVALUACION,
  ESTADOEVALUACION,
  EMAIL,
  ROLES,
  FILEFTP,
} from "src/app/common";

import { DateAdapter, MatDialog, MatTableDataSource } from "@angular/material";
import { ListaParametroservice } from "src/app/service/lista.parametro.service";
import { DetalleSolicitudEvaluacionService } from "src/app/service/detalle.solicitud.evaluacion.service";
import { DatePipe } from "@angular/common";
import { LineaTrataPrefeInstiRequest } from "src/app/dto/request/LineaTrataPrefeInstiRequest";
import { ParametroRequest } from "src/app/dto/ParametroRequest";
import { ParametroResponse } from "src/app/dto/ParametroResponse";
import { WsResponse } from "src/app/dto/WsResponse";
import { ApiOutResponse } from "src/app/dto/response/ApiOutResponse";
import { EvaluacionService } from "src/app/dto/service/evaluacion.service";
import { MessageComponent } from "src/app/core/message/message.component";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { UsuarioService } from "src/app/dto/service/usuario.service";
import { BOpcionMenuLocalStorage } from "src/app/dto/core/BOpcionMenuLocalStorage";
import { ResultadoBasalRequest } from "src/app/dto/request/ResultadoBasalRequest";
import { MetastasisResponse } from "src/app/dto/response/BandejaEvaluacion/MedicamentoNuevo/MetastasisResponse";
import { InfoSolben } from "src/app/dto/bandeja-preliminar/detalle-preliminar/InfoSolben";
import { BandejaEvaluacionService } from "src/app/service/bandeja.evaluacion.service";
import { EvaluacionAutorizadorRequest } from "src/app/dto/request/EvaluacionAutorizadorRequest";
import { InformeSolEvaReporteRequest } from "src/app/dto/solicitudEvaluacion/detalle/InformacionScgEvaRequest";
import { listaLineaTratamientoRequest } from "src/app/dto/solicitudEvaluacion/bandeja/ListaHisLineaTratamientoRequest";
import { EmailDTO } from "src/app/dto/core/EmailDTO";
import { CorreosService } from "src/app/service/cross/correos.service";
import * as _moment from "moment";
import { OncoWsResponse } from "src/app/dto/response/OncoWsResponse";
import { EnvioCorreoRequest } from "src/app/dto/core/EnvioCorreoRequest";
import { CoreService } from "src/app/service/core.service";
import { ArchivoFTP } from "src/app/dto/bandeja-preliminar/detalle-preliminar/ArchivoFTP";

@Component({
  selector: "app-preferencia-institucionales",
  templateUrl: "./preferencia-institucionales.component.html",
  styleUrls: ["./preferencia-institucionales.component.scss"],
})
export class PreferenciaInstitucionalesComponent implements OnInit, OnChanges {
  rbtExisteMeta: any[] = [
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
    {
      codigo: 2,
      titulo: "NA",
      selected: false,
    },
  ];

  seasons: string[] = ["Winter", "Spring", "Summer", "Autumn"];
  correoRequest: EmailDTO;

  toxiFrmArray = new FormArray([]);
  resBasalMarcFrmArray = new FormArray([]);
  proBarTabla: boolean;
  flagVerActaCmac: number;
  cmbTipoToxicidad: any[] = [];
  cmbgradoToxicidad: any[] = [];
  codArchFichaTec: number;
  public mostrarBoton: boolean;
  public evaAutorizadorRequest: EvaluacionAutorizadorRequest =
    new EvaluacionAutorizadorRequest();
  request: InformeSolEvaReporteRequest = new InformeSolEvaReporteRequest();
  listaLineaTratamientoRequest: listaLineaTratamientoRequest =
    new listaLineaTratamientoRequest();

  cmbLugarMetastasis: any[] = [];
  cmbLugarMetastasisRol: number;
  public step: number;
  public step2: number;

  envioCorreoRequest: EnvioCorreoRequest;
  dataRequest = [];
  resultadoToxicidad = [];
  marvaVacio: any;
  flagVerInforme: number;
  reportePdf: string;
  mostrarCampoDetalle: number;
  codMac: string;

  infoSolben: InfoSolben;
  primeraVez: boolean = true;
  // DECLARACION DE LAS VARIABLES FORMGROUP Y FORMCONTROL DETALLE EVALUACION
  detEvaluacionFrmGrp: FormGroup = new FormGroup({
    codSolEvaluacionFrmCtrl: new FormControl(null),
    estadoDescripFrmCtrl: new FormControl(null),
    descripCodMacFrmCtrl: new FormControl(null),
    descripMacFrmCtrl: new FormControl(null),
    codScgSolbenFrmCtrl: new FormControl(null),
    estadoScgSolbenFrmCtrl: new FormControl(null),
    fechaScgSolbenFrmCtrl: new FormControl(null),
    tipoScgSolbenFrmCtrl: new FormControl(null),
    nroCartaGarantiaFrmCtrl: new FormControl(null),
    clinicaFrmCtrl: new FormControl(null),
    medicoTrataPrescripFrmCtrl: new FormControl(null),
    cmpMedicoFrmCtrl: new FormControl(null),
    fechaRecetaFrmCtrl: new FormControl(null),
    fechaQuimioterapiaFrmCtrl: new FormControl(null),
    fechaHospitalInicioFrmCtrl: new FormControl(null),
    fechaHospitalFinFrmCtrl: new FormControl(null),
    descripMedicamentoFrmCtrl: new FormControl(null),
    esquemaFrmCtrl: new FormControl(null),
    personaContactoFrmCtrl: new FormControl(null),
    totalPresupuestoFrmCtrl: new FormControl(null),
    pacienteFrmCtrl: new FormControl(null),
    edadFrmCtrl: new FormControl(null),
    descripDiagFrmCtrl: new FormControl(null),
    codDiagFrmCtrl: new FormControl(null),
    descripGrupoDiagFrmCtrl: new FormControl(null),
    contratanteFrmCtrl: new FormControl(null),
    planFrmCtrl: new FormControl(null),
    codAfiliadoFrmCtrl: new FormControl(null),
    fechaAfiliacionFrmCtrl: new FormControl(null),
    estadioClinicoFrmCtrl: new FormControl(null),
    tnmFrmCtrl: new FormControl(null),
    observacionFrmCtrl2: new FormControl(null),
    //codigo luis
    codHisFrmCtrl: new FormControl(null),
    descHisFrmCtrl: new FormControl(null),
  });
  archivoRqt: any;

  get codSolEvaluacionFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("codSolEvaluacionFrmCtrl");
  }
  get estadoDescripFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("estadoDescripFrmCtrl");
  }
  get descripCodMacFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("descripCodMacFrmCtrl");
  }
  get descripMacFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("descripMacFrmCtrl");
  }
  get codScgSolbenFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("codScgSolbenFrmCtrl");
  }
  get estadoScgSolbenFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("estadoScgSolbenFrmCtrl");
  }
  get fechaScgSolbenFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("fechaScgSolbenFrmCtrl");
  }
  get tipoScgSolbenFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("tipoScgSolbenFrmCtrl");
  }
  get nroCartaGarantiaFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("nroCartaGarantiaFrmCtrl");
  }
  get clinicaFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("clinicaFrmCtrl");
  }
  get medicoTrataPrescripFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("medicoTrataPrescripFrmCtrl");
  }
  get cmpMedicoFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("cmpMedicoFrmCtrl");
  }
  get fechaRecetaFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("fechaRecetaFrmCtrl");
  }
  get fechaQuimioterapiaFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("fechaQuimioterapiaFrmCtrl");
  }
  get fechaHospitalInicioFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("fechaHospitalInicioFrmCtrl");
  }
  get fechaHospitalFinFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("fechaHospitalFinFrmCtrl");
  }
  get descripMedicamentoFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("descripMedicamentoFrmCtrl");
  }
  get esquemaFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("esquemaFrmCtrl");
  }
  get personaContactoFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("personaContactoFrmCtrl");
  }
  get totalPresupuestoFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("totalPresupuestoFrmCtrl");
  }
  get pacienteFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("pacienteFrmCtrl");
  }
  get edadFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("edadFrmCtrl");
  }
  get descripDiagFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("descripDiagFrmCtrl");
  }
  get codDiagFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("codDiagFrmCtrl");
  }
  get descripGrupoDiagFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("descripGrupoDiagFrmCtrl");
  }
  get contratanteFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("contratanteFrmCtrl");
  }
  get planFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("planFrmCtrl");
  }
  get codAfiliadoFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("codAfiliadoFrmCtrl");
  }
  get fechaAfiliacionFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("fechaAfiliacionFrmCtrl");
  }
  get estadioClinicoFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("estadioClinicoFrmCtrl");
  }
  get tnmFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("tnmFrmCtrl");
  }
  get observacionFrmCtrl2() {
    return this.detEvaluacionFrmGrp.get("observacionFrmCtrl2");
  }
  get codHisFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("codHisFrmCtrl");
  }
  get descHisFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("descHisFrmCtrl");
  }

  public prefInstFrmGrp: FormGroup = new FormGroup({
    lineaTratamientoFrmCtrl: new FormControl(null, Validators.required),
    nroLineaTrataFrmCtrl: new FormControl(null, Validators.required),
    nroCursoFrmCtrl: new FormControl(null, Validators.required),
    tipoTumorFrmCtrl: new FormControl(null, Validators.required),
    respAlcanzadaFrmCtrl: new FormControl(null, Validators.required),
    lugarProgresionFrmCtrl: new FormControl(null, Validators.required),
    grupoDiagFrmCtrl: new FormControl(null, Validators.required),
    condicionCancerFrmCtrl: new FormControl(null, Validators.required),
    detalleCondicionFrmCtrl: new FormControl(null),
    tratamientoFrmCtrl: new FormControl(null, Validators.required),
    presentaNoPermitidaFrmCtrl: new FormControl(null, Validators.required),
    tipoTratamientoFrmCtrl: new FormControl(null, Validators.required),
    rgPrefInstiFrmCtrl: new FormControl(null, Validators.required),
    observacionFrmCtrl: new FormControl(null, []),
    // 'observacionFrmCtrl': new FormControl(null, Validators.required)
  });

  get lineaTratamientoFrmCtrl() {
    return this.prefInstFrmGrp.get("lineaTratamientoFrmCtrl");
  }
  get nroLineaTrataFrmCtrl() {
    return this.prefInstFrmGrp.get("nroLineaTrataFrmCtrl");
  }
  get nroCursoFrmCtrl() {
    return this.prefInstFrmGrp.get("nroCursoFrmCtrl");
  }
  get tipoTumorFrmCtrl() {
    return this.prefInstFrmGrp.get("tipoTumorFrmCtrl");
  }
  get respAlcanzadaFrmCtrl() {
    return this.prefInstFrmGrp.get("respAlcanzadaFrmCtrl");
  }
  get lugarProgresionFrmCtrl() {
    return this.prefInstFrmGrp.get("lugarProgresionFrmCtrl");
  }
  get grupoDiagFrmCtrl() {
    return this.prefInstFrmGrp.get("grupoDiagFrmCtrl");
  }
  get condicionCancerFrmCtrl() {
    return this.prefInstFrmGrp.get("condicionCancerFrmCtrl");
  }
  get detalleCondicionFrmCtrl() {
    return this.prefInstFrmGrp.get("detalleCondicionFrmCtrl");
  }
  get tratamientoFrmCtrl() {
    return this.prefInstFrmGrp.get("tratamientoFrmCtrl");
  }
  get presentaNoPermitidaFrmCtrl() {
    return this.prefInstFrmGrp.get("presentaNoPermitidaFrmCtrl");
  }
  get tipoTratamientoFrmCtrl() {
    return this.prefInstFrmGrp.get("tipoTratamientoFrmCtrl");
  }
  get rgPrefInstiFrmCtrl() {
    return this.prefInstFrmGrp.get("rgPrefInstiFrmCtrl");
  }
  get observacionFrmCtrl() {
    return this.prefInstFrmGrp.get("observacionFrmCtrl");
  }

  mensajes: string;
  resultadoBasalRequest: ResultadoBasalRequest;
  resultadoBasalData: any;

  rbtPrefInsti: any[] = [
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
    {
      codigo: 2,
      titulo: "NO APLICA",
      selected: false,
    },
  ];

  listaTipoTumor: Parametro[] = [];
  listaNroCursos: Parametro[] = [];
  listaRespAlcanzada: Parametro[] = [];
  listaLugarProgresion: Parametro[] = [];
  listaCondicionCancer: Parametro[] = [];
  listaSubCondicionCancer: Parametro[] = [];
  txtLineaTratamiento: string;
  detalleSubcondicion: string;
  verPrefInstitucionales: boolean;
  existeLineaTrata: boolean;
  tratamientoLabel: string;
  tipoTratamientoLabel: string;
  cumplePrefeDesaLabel: string;
  mensaje: string;
  reporteActaCmac: string;
  lineaTratRequest: LineaTrataPrefeInstiRequest;
  parametroRequest: ParametroRequest;

  grabarPaso: string;

  flagObservacions: Boolean;

  @Output() btnSiguiente = new EventEmitter<boolean>();

  opcionMenu: BOpcionMenuLocalStorage;
  txtNumeroLinea: number;
  cmbNumeroCurso: number;
  cmbTipoTumor: number;
  cmbRespuestaAlcanzada: number;
  cmbLugarProgresion: number;
  txtGrupoDiagnostico: number;
  cmbCondicion: number;
  cmbDetalleCondicion: number;
  txtTratamiento: number;
  txtPresentacion: number;
  txtTipoTratamiento: number;
  txtReferencia: number;
  txtObservacion: number;
  btnGrabar: number;
  btnSalir: number;
  btnSiguientePaso1: number;

  flagEvaluacion = FLAG_REGLAS_EVALUACION;
  valorMostrarOpcion = ACCESO_EVALUACION.mostrarOpcion;

  cmbEcog: any[] = [];
  cmbCondicionList: any[] = [];
  cmbEcogRol: number;
  codArchCompMed: number;
  medSolValue: any;
  mostrarFechaReceta: number;
  mostrarFechaQuimio: number;
  mostrarFechaHospital: number;
  public codSolEvaluacion: any;
  txtCodigoSolicitud: number;
  txtEstadoSolicitud: number;
  txtCodigoMac: number;
  txtDescripcionMac: number;
  btnInforme: number;
  btnActaMac: number;
  txtNroSCG: number;
  txtEstadoSCG: number;
  txtFechaSCG: number;
  txtTipoSCG: number;
  txtNroCartaGarantiaDet: number;
  txtClinicaDet: number;
  txtMedicoTratante: number;
  txtCMP: number;
  txtFechaReceta: number;
  txtFechaQuimioterapia: number;
  txtFechaHospitalizacion: number;
  txtMedicamentos: number;
  txtEsquemaQuimioterapia: number;
  txtPersonaContacto: number;
  txtTotalPresupuesto: number;
  txtPacienteDet: number;
  txtEdad: number;
  txtDiagnostico: number;
  txtCie10: number;
  //txtGrupoDiagnostico: number;
  txtContratante: number;
  txtPlan: number;
  txtCodigoAfiliado: number;
  txtFechaAfiliacion: number;
  txtEstadioClinico: number;
  txtTNM: number;
  //txtObservacion: number;
  btnEnviarAlertaMonitoreo: number;
  btnRegistrarEvaAutorizador: number;
  btnRegistrarEvaLiderTumor: number;

  toxicidadFrmGroup: FormGroup;

  detPacFrmGrp: FormGroup = new FormGroup({
    pacFrmCtrl: new FormControl(null),
    grpDiagFrmCtrl: new FormControl(null),
    medSolFrmCtrl: new FormControl(null),
    tipTmrFrmCtrl: new FormControl(null),
  });

  get pacFrmCtrl() {
    return this.detPacFrmGrp.get("pacFrmCtrl");
  }
  get grpDiagFrmCtrl() {
    return this.detPacFrmGrp.get("grpDiagFrmCtrl");
  }
  get medSolFrmCtrl() {
    return this.detPacFrmGrp.get("medSolFrmCtrl");
  }
  get tipTmrFrmCtrl() {
    return this.detPacFrmGrp.get("tipTmrFrmCtrl");
  }

  elegirCondicFrmGrp: FormGroup = new FormGroup({
    tipoCondicFrmCtrl: new FormControl(null),
  });
  get tipoCondicFrmCtrl() {
    return this.elegirCondicFrmGrp.get("tipoCondicFrmCtrl");
  }

  condBasalFrmGrp: FormGroup = new FormGroup({
    pesPacFrmCtrl: new FormControl(null),
    dosMedFrmCtrl: new FormControl(null),
    ecogFrmCtrl: new FormControl(null),
    existeMetaFrmCtrl: new FormControl(null),
    lugarMetaFrmCtrl: new FormControl(null),
    existeToxiFrmCtrl: new FormControl(null),
    //'tipoToxicidadFrmCtrl': new FormControl(null),
    //'gradoToxicidadFrmCtrl': new FormControl(null),
  });

  get pesPacFrmCtrl() {
    return this.condBasalFrmGrp.get("pesPacFrmCtrl");
  }
  get dosMedFrmCtrl() {
    return this.condBasalFrmGrp.get("dosMedFrmCtrl");
  }
  get ecogFrmCtrl() {
    return this.condBasalFrmGrp.get("ecogFrmCtrl");
  }
  get existeMetaFrmCtrl() {
    return this.condBasalFrmGrp.get("existeMetaFrmCtrl");
  }
  get lugarMetaFrmCtrl() {
    return this.condBasalFrmGrp.get("lugarMetaFrmCtrl");
  }
  get existeToxiFrmCtrl() {
    return this.condBasalFrmGrp.get("existeToxiFrmCtrl");
  }
  //get tipoToxicidadFrmCtrl() { return this.condBasalFrmGrp.get('tipoToxicidadFrmCtrl'); }
  //get gradoToxicidadFrmCtrl() { return this.condBasalFrmGrp.get('gradoToxicidadFrmCtrl'); }

  constructor(
    private adapter: DateAdapter<any>,
    public dialog: MatDialog,
    private spinnerService: Ng4LoadingSpinnerService,
    private listaParametroservice: ListaParametroservice,
    private detalleSolicitudEvaluacionService: DetalleSolicitudEvaluacionService,
    private detalleServicioSolEva: DetalleSolicitudEvaluacionService,
    private datePipe: DatePipe,
    private correoService: CorreosService,
    private coreService: CoreService,
    private bandejaEvaluacionService: BandejaEvaluacionService,
    @Inject(UsuarioService) private userService: UsuarioService,
    @Inject(EvaluacionService) private solicitud: EvaluacionService
  ) {
    this.adapter.setLocale("es-PE");
  }

  ngOnInit() {
    this.accesoOpcionMenu();
    this.iniciarVariables();
  }

  ngOnChanges(changes: SimpleChanges): void {}

  public iniciarBasal() {
    var data = {
      codSolEva: this.solicitud.codSolEvaluacion,
      codAfiliado: this.solicitud.codAfiliado,
    };

    this.detalleSolicitudEvaluacionService
      .consultarCondicionBasal(data)
      .subscribe(
        (resp) => {
          this.codMac = resp["response"].codMac;
          this.medSolValue = resp["response"].medicamento;
          this.pacFrmCtrl.setValue(resp["response"].nombre_paciente);
          this.grpDiagFrmCtrl.setValue(resp["response"].diagnostico);
          this.medSolFrmCtrl.setValue(resp["response"].medicamento);
          this.tipTmrFrmCtrl.setValue(localStorage.getItem("tipo_tumor"));
        },
        (error) => {
          console.error(error);
        }
      );
  }

  public descargarDocumento2(): void {
    this.spinnerService.show();
    this.coreService.descargarArchivoFTP(this.archivoRqt).subscribe(
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
          this.mensaje = response.audiResponse.mensajeRespuesta;
          this.openDialogMensaje(
            MENSAJES.ERROR_NOFUNCION,
            this.mensaje,
            true,
            false,
            null
          );
          this.spinnerService.hide();
        }
      },
      (error) => {
        console.error(error);
        this.openDialogMensaje(
          MENSAJES.ERROR_NOFUNCION,
          this.mensaje,
          true,
          false,
          null
        );
        this.spinnerService.hide();
      }
    );
  }

  public visualizarActaPDF() {
    this.archivoRqt = new ArchivoFTP();
    this.archivoRqt.codArchivo = this.solicitud.codCmacPDF;
    this.archivoRqt.ruta = FILEFTP.rutaInformeAutorizador;
    this.descargarDocumento2();
  }

  public iniciarVariables(): void {
    this.step = 0;
    this.step2 = 0;
    this.codSolEvaluacion = this.solicitud.numeroSolEvaluacion;
    this.request.codSolEva = this.solicitud.codSolEvaluacion;
    this.infoSolben = new InfoSolben();
    this.lineaTratRequest = new LineaTrataPrefeInstiRequest();
    this.parametroRequest = new ParametroRequest();
    this.respAlcanzadaFrmCtrl.disable();
    this.tratamientoLabel = "TRATAMIENTO";
    this.tipoTratamientoLabel = "TIPO TRATAMIENTO";
    this.cumplePrefeDesaLabel = "CUMPLE PREFERENCIA INSTITUCIONAL";
    this.mostrarCampoDetalle = TIPOSCGSOLBEN.mostrarCampoDetalle;
    this.datosPrevios();
    this.mostrarCondicionBasalData();
    this.existeMetaFrmCtrl.setValue(1);
    this.existeToxiFrmCtrl.setValue(1);
    this.toxiFrmArray.controls.forEach((e) => {
      e.disable();
    });
  }

  public iniciarLlenadoParametros() {
    this.consultarTipoToxicidad();
  }

  public iniciarCondicionPreferenciaIntitucional() {
    this.parametroRequest = new ParametroRequest();
    this.resultadoBasalRequest = new ResultadoBasalRequest();
    this.resultadoBasalRequest.codSolEva = this.solicitud.codSolEvaluacion;
    this.resultadoBasalRequest.codMac = this.solicitud.codMac;
    this.resultadoBasalRequest.codGrpDiag = this.solicitud.codGrupoDiagnostico;

    // this.consultarTipoToxicidad();
    // this.consultarLugarMetastasis();
    // this.consultarEcog();
    // this.consultarGradoToxicidad();
    // this.addValue();
    // this.addValue2();
  }

  public mostrarInformacionSCG(): void {
    this.validarClaseEstadioClinico();
    this.validarClaseTnm();
    this.mostrarInformacionRestSolben();
  }

  mostrarInformacionRestSolben(){
    let infoSolbenRequest = new InfoSolben();

    infoSolbenRequest.codDiagnostico = this.infoSolben.codDiagnostico;
    infoSolbenRequest.codAfiliado = this.infoSolben.codAfiliado;
    infoSolbenRequest.codClinica = this.infoSolben.codClinica;

    this.detalleServicioSolEva
      .consultarInformacionScgEvaRest(infoSolbenRequest)
      .subscribe(
        (data: WsResponse) => {
          if (data.audiResponse.codigoRespuesta === "0") {
            this.infoSolben.codDiagnostico = data.data.codDiagnostico;
            this.infoSolben.diagnostico = data.data.diagnostico;
            this.infoSolben.codGrupoDiagnostico = data.data.codGrupoDiagnostico;
            this.infoSolben.grupoDiagnostico = data.data.grupoDiagnostico;
            this.infoSolben.paciente = data.data.paciente;
            this.infoSolben.sexoPaciente = data.data.sexoPaciente;
            this.infoSolben.clinica = data.data.clinica;

            this.codSolEvaluacionFrmCtrl.setValue(this.codSolEvaluacion);
            this.estadoDescripFrmCtrl.setValue(this.infoSolben.descripEstadoSolEva);
            this.descripCodMacFrmCtrl.setValue(this.infoSolben.descripCodMac);
            this.descripMacFrmCtrl.setValue(this.infoSolben.descripcionMac);
            this.codScgSolbenFrmCtrl.setValue(this.infoSolben.nroSCGSolben);
            this.estadoScgSolbenFrmCtrl.setValue(this.infoSolben.estadoSCGSolben);
            this.fechaScgSolbenFrmCtrl.setValue(
              this.datePipe.transform(this.infoSolben.fecSCGSolben, "dd/MM/yyyy") +
                " " +
                this.infoSolben.horaSCGSolben
            );
            this.tipoScgSolbenFrmCtrl.setValue(this.infoSolben.tipoSolben);
            this.nroCartaGarantiaFrmCtrl.setValue(this.infoSolben.nroCartaGarantia);
            this.clinicaFrmCtrl.setValue(this.infoSolben.clinica);
            this.medicoTrataPrescripFrmCtrl.setValue(this.infoSolben.medicoTratante);
            this.cmpMedicoFrmCtrl.setValue(this.infoSolben.cmpMedico);
            this.mostrarFechaReceta =
              this.infoSolben.codTipoSolben === TIPOSCGSOLBEN.farmaciaCompleja ||
              this.infoSolben.codTipoSolben === TIPOSCGSOLBEN.quimioAmbulatoria
                ? TIPOSCGSOLBEN.mostrarCampoDetalle
                : TIPOSCGSOLBEN.ocultarCampoDetalle;
            this.fechaRecetaFrmCtrl.setValue(this.infoSolben.fechaReceta);
            this.mostrarFechaQuimio =
              this.infoSolben.codTipoSolben === TIPOSCGSOLBEN.quimioAmbulatoria
                ? TIPOSCGSOLBEN.mostrarCampoDetalle
                : TIPOSCGSOLBEN.ocultarCampoDetalle;
            this.fechaQuimioterapiaFrmCtrl.setValue(this.infoSolben.fechaQuimio);
            this.mostrarFechaHospital =
              this.infoSolben.codTipoSolben === TIPOSCGSOLBEN.hospitalizacion
                ? TIPOSCGSOLBEN.mostrarCampoDetalle
                : TIPOSCGSOLBEN.ocultarCampoDetalle;
            this.fechaHospitalInicioFrmCtrl.setValue(
              this.infoSolben.fechaHospitalInicio
            );
            this.fechaHospitalFinFrmCtrl.setValue(this.infoSolben.fechaHospitalFin);
            this.descripMedicamentoFrmCtrl.setValue(
              this.infoSolben.medicamentos !== null
                ? this.infoSolben.medicamentos.replace(/\|/g, ",")
                : null
            );
            this.esquemaFrmCtrl.setValue(
              this.infoSolben.esquemaQuimio !== null
                ? this.infoSolben.esquemaQuimio.replace(/\|/g, ",")
                : null
            );
            this.personaContactoFrmCtrl.setValue(this.infoSolben.personaContacto);
            this.totalPresupuestoFrmCtrl.setValue(this.infoSolben.totalPresupuesto); // TO-DO FALTA DECIMAL
            this.pacienteFrmCtrl.setValue(this.infoSolben.paciente);
            this.edadFrmCtrl.setValue(this.infoSolben.edad);
            this.descripDiagFrmCtrl.setValue(this.infoSolben.diagnostico);
            this.codDiagFrmCtrl.setValue(this.infoSolben.codDiagnostico);
            this.descripGrupoDiagFrmCtrl.setValue(this.infoSolben.grupoDiagnostico);
            this.contratanteFrmCtrl.setValue(this.infoSolben.contratante);
            this.planFrmCtrl.setValue(this.infoSolben.plan);
            this.codAfiliadoFrmCtrl.setValue(this.infoSolben.codAfiliado);
            this.fechaAfiliacionFrmCtrl.setValue(this.infoSolben.fechaAfiliado);
            this.estadioClinicoFrmCtrl.setValue(
              this.infoSolben.estadoClinico == ""
                ? "---"
                : this.infoSolben.estadoClinico
            );
            this.tnmFrmCtrl.setValue(
              this.infoSolben.tnm != "" ? this.infoSolben.tnm : "---"
            );
            this.observacionFrmCtrl2.setValue(this.infoSolben.observacion);
            this.codHisFrmCtrl.setValue(this.infoSolben.codHis);
            this.descHisFrmCtrl.setValue(this.infoSolben.descHis);
            this.guardarDetalleEvaluacion();
          } else {
            this.mensaje =
              "Error al consultar la información de la Evaluación.";
            this.openDialogMensaje(
              MENSAJES.INFO_NO_DATA,
              this.mensaje,
              true,
              false,
              null
            );
          }
          this.proBarTabla = false;
        },
        (error) => {
          console.error(error);
          this.mensaje = "Error al obtener el detalle de la Evaluacion.";
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            this.mensaje,
            true,
            false,
            null
          );
          this.proBarTabla = false;
        }
      );

  }

  validarClaseEstadioClinico() {
    if (this.infoSolben.estadoClinico == "") {
      let idEstadioClinico = document.getElementById("idEstadioClinico");
      idEstadioClinico.classList.add("formPersonal");
    }
  }

  validarClaseTnm() {
    if (this.infoSolben.tnm == "") {
      let idTnm = document.getElementById("idTnm");
      idTnm.classList.add("formPersonal");
    }
  }

  /**Parametro Ecog */
  public consultarEcog() {
    this.parametroRequest.codigoGrupo = GRUPO_PARAMETRO.ecog;
    this.listaParametroservice.listaParametro(this.parametroRequest).subscribe(
      (data: ParametroResponse) => {
        if (data.codigoResultado === 0) {
          this.cmbEcog = data.filtroParametro;
          this.obtenerCombo(this.cmbEcog, null, "-- Seleccionar Ecog --");
          this.consultarGradoToxicidad();
        } else {
          console.error(data);
        }
      },
      (error) => {
        console.error("Error al listar Ecog");
      }
    );
  }

  /**Parametro Tipo Toxicidad */
  public consultarTipoToxicidad() {
    this.parametroRequest.codigoGrupo = GRUPO_PARAMETRO.tipoToxicidad;
    /*var da = {
      codigoGrupo: 58,
    };*/
    this.listaParametroservice.listaParametro(this.parametroRequest).subscribe(
      (data: ParametroResponse) => {
        this.iniciarBasal();

        if (data.codigoResultado === 0) {
          this.cmbTipoToxicidad = data.filtroParametro;
          this.obtenerCombo(
            this.cmbTipoToxicidad,
            null,
            "--Seleccionar Tipo Toxicidad--"
          );
          this.consultarLugarMetastasis();
        } else {
        }
      },
      (error) => {
        console.error("Error al listar Tipo Toxicidad");
      }
    );
  }

  /**Parametro gradp Toxicidad */
  public consultarGradoToxicidad() {
    this.parametroRequest.codigoGrupo = GRUPO_PARAMETRO.tipoToxicidad;

    var cod = {
      codigoGrupo: 58,
    };
    this.listaParametroservice.listaParametro(cod).subscribe(
      (data: ParametroResponse) => {
        if (data.codigoResultado === 0) {
          this.cmbgradoToxicidad = data.filtroParametro;
          this.obtenerCombo(
            this.cmbgradoToxicidad,
            null,
            "--Seleccionar Grado Toxicidad--"
          );
        } else {
        }
      },
      (error) => {
        console.error("Error al listar Tipo Toxicidad");
      }
    );
  }

  public verificarToxicidad(event): void {
    if (
      this.existeToxiFrmCtrl.value === 0 ||
      this.existeToxiFrmCtrl.value === 2
    ) {
      this.toxiFrmArray.controls.forEach((e) => {
        e.setValue({
          tipoToxicidadFrmCtrl: null,
          gradoToxicidadFrmCtrl: null,
          comFrmCtrl: null,
        });
        e.disable();
      });
    } else {
      this.toxiFrmArray.controls.forEach((e) => {
        e.setValue({
          tipoToxicidadFrmCtrl: null,
          gradoToxicidadFrmCtrl: null,
          comFrmCtrl: null,
        });
        e.enable();
      });
    }
  }

  public consultarLugarMetastasis() {
    this.parametroRequest.codigoGrupo = GRUPO_PARAMETRO.lugarMetastasis;
    this.listaParametroservice.listaParametro(this.parametroRequest).subscribe(
      (data: ParametroResponse) => {
        if (data.codigoResultado === 0) {
          this.cmbLugarMetastasis = data.filtroParametro;
          this.obtenerCombo(
            this.cmbLugarMetastasis,
            null,
            "-- Seleccionar Lugar Metástasis --"
          );
          this.consultarEcog();
        } else {
          console.error(data);
        }
      },
      (error) => {
        console.error("Error al listar Lugar Metástasis");
      }
    );
  }

  public verificarMetastasis(event): void {
    if (this.existeMetaFrmCtrl.value === 0) {
      this.lugarMetaFrmCtrl.setValue(null);
      this.lugarMetaFrmCtrl.disable();
    } else {
      this.lugarMetaFrmCtrl.setValue(null);
      this.lugarMetaFrmCtrl.enable();
    }
  }

  public grabarParametros(): boolean {
    if (this.prefInstFrmGrp.invalid) {
      this.lineaTratamientoFrmCtrl.markAsTouched();
      this.lineaTratamientoFrmCtrl.markAsTouched();
      this.nroLineaTrataFrmCtrl.markAsTouched();
      this.nroCursoFrmCtrl.markAsTouched();
      this.tipoTumorFrmCtrl.markAsTouched();
      this.respAlcanzadaFrmCtrl.markAsTouched();
      this.lugarProgresionFrmCtrl.markAsTouched();
      this.grupoDiagFrmCtrl.markAsTouched();
      this.condicionCancerFrmCtrl.markAsTouched();
      this.detalleCondicionFrmCtrl.markAsTouched();
      this.tratamientoFrmCtrl.markAsTouched();
      this.presentaNoPermitidaFrmCtrl.markAsTouched();
      this.tipoTratamientoFrmCtrl.markAsTouched();
      this.rgPrefInstiFrmCtrl.markAsTouched();
      this.observacionFrmCtrl.markAsTouched();
      this.mensajes = "Completar los campos en rojo";
      this.openDialogMensaje(
        MENSAJES.ERROR_CAMPOS,
        this.mensajes,
        true,
        false,
        null
      );
      return false;
    }

    if (
      this.flagObservacions &&
      (this.observacionFrmCtrl.value === null ||
        this.observacionFrmCtrl.value.trim() === "")
    ) {
      this.mensajes =
        "Se cambio la preferencia institucional, agregar observaciones.";
      this.observacionFrmCtrl.markAsTouched();
      this.openDialogMensaje(
        MENSAJES.ERROR_CAMPOS,
        this.mensajes,
        true,
        false,
        null
      );
      return false;
    }

    /*if (this.observacionFrmCtrl.enabled && (this.observacionFrmCtrl.value === null || this.observacionFrmCtrl.value.trim() === '')) {
      this.mensajes = 'Se cambio la preferencia institucional, agregar observaciones.';
      this.observacionFrmCtrl.markAsTouched();
      this.openDialogMensaje(MENSAJES.ERROR_CAMPOS, this.mensajes, true, false, null);
      return false;
    }*/

    this.lineaTratRequest = {
      codSolEva: this.solicitud.codSolEvaluacion,
      nroLineaTrata: this.nroLineaTrataFrmCtrl.value,
      nroCurso: this.nroCursoFrmCtrl.value,
      tipoTumor: this.tipoTumorFrmCtrl.value,
      lugarProgresion: this.lugarProgresionFrmCtrl.value,
      respAlcanzada: this.respAlcanzadaFrmCtrl.value,
      cumplePrefeInsti: this.rgPrefInstiFrmCtrl.value,
      condicionCancer: this.condicionCancerFrmCtrl.value,
      observacion: this.observacionFrmCtrl.value,
      codMac: this.lineaTratRequest.codMac,
      codGrupoDiag: this.solicitud.codGrupoDiagnostico,
      lineaTratamiento: this.lineaTratRequest.lineaTratamiento,
      codigoRolUsuario: this.userService.getCodRol,
      fechaEstado: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      codigoUsuario: this.userService.getCodUsuario,
    };

    return true;
  }

  public obtenerCombo(lista: any[], valor: number, descripcion: string) {
    if (lista !== null) {
      lista.unshift({
        codigoParametro: valor,
        nombreParametro: descripcion,
      });
    }
  }

  public generarReportePaso1(vista: boolean): void {
    //this.guardarRequestInforme();
    var data = {
      codSolEva: this.solicitud.codSolEvaluacion,
    };

    this.detalleSolicitudEvaluacionService.generarReportePaso1(data).subscribe(
      (response: WsResponse) => {
        if (response.audiResponse.codigoRespuesta === "0") {
          response.data.contentType = "application/pdf";
          const blob = this.coreService.crearBlobFile(response.data);
          if (!vista) {
            this.mensaje += "\n*El reporte fue generado correctamente.";
            response.data.nomArchivo = `${response.data.nomArchivo}.pdf`;
            response.data.archivoFile = new File(
              [blob],
              `${response.data.nomArchivo}`,
              {
                type: response.data.contentType,
                lastModified: Date.now(),
              }
            );
            //this.subirArchivoFTP(response.data);
          } else {
            this.spinnerService.hide();
            const link = document.createElement("a");
            link.target = "_blank";
            link.href = window.URL.createObjectURL(blob);
            link.setAttribute("download", response.data.nomArchivo);
            link.click();
          }
        } else {
          this.mensaje = response.audiResponse.mensajeRespuesta;
          this.openDialogMensaje(
            MENSAJES.ERROR_NOFUNCION,
            this.mensaje,
            true,
            false,
            null
          );
          this.spinnerService.hide();
        }
      },
      (error) => {
        this.spinnerService.hide();
        console.error(error);
        const mensaje = MENSAJES.ERROR_SERVICIO;
        this.openDialogMensaje(
          mensaje,
          "Error al generar el Informe Autorizador.",
          true,
          false,
          null
        );
      }
    );
  }

  public iniciarNuevaLineaTrataPrefeInsti() {
    if (this.primeraVez) {
      this.request.codSolEva = this.solicitud.codSolEvaluacion;

      this.consultarInformacionScgEva();
      this.primeraVez = false;
    }
    this.flagObservacions = false;
    this.rgPrefInstiFrmCtrl.disable();
    this.verPrefInstitucionales =
      this.solicitud.descGrupoDiagnostico === "" ||
      this.solicitud.descGrupoDiagnostico === null
        ? false
        : true;
    this.cargarVariablesLineaTrataPrefInst();
  }

  public datosPrevios(){
    this.request.codSolEva = this.solicitud.codSolEvaluacion;
    this.detalleSolicitudEvaluacionService
      .consultarInformacionScgEva(this.request)
      .subscribe(
        (data: WsResponse) => {
          if (data.audiResponse.codigoRespuesta === "0") {
            this.infoSolben = data.data.solbenBean;
          } else {
            this.mensaje =
              "Error al consultar la información de la Evaluación.";
            this.openDialogMensaje(
              MENSAJES.INFO_NO_DATA,
              this.mensaje,
              true,
              false,
              null
            );
          }
        },
        (error) => {
          console.error(error);
          this.mensaje = "Error al obtener el detalle de la Evaluacion.";
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            this.mensaje,
            true,
            false,
            null
          );
        }
      );

  }

  public cargarVariablesLineaTrataPrefInst(): void {
    this.lineaTratRequest = new LineaTrataPrefeInstiRequest();
    this.lineaTratRequest.nroLineaTrata =
      this.solicitud.nroLineaTratamiento == null
        ? 1
        : this.solicitud.nroLineaTratamiento + 1;
    this.nroLineaTrataFrmCtrl.setValue(this.lineaTratRequest.nroLineaTrata);

    this.consultarNroLineaTrata();

    this.lineaTratRequest.codGrupoDiag =
      this.solicitud.codGrupoDiagnostico === null
        ? null
        : this.solicitud.codGrupoDiagnostico;
    this.grupoDiagFrmCtrl.setValue(
      this.solicitud.descGrupoDiagnostico === ""
        ? null
        : this.solicitud.descGrupoDiagnostico
    );
  }

  public consultarNroLineaTrata() {
    switch (this.lineaTratRequest.nroLineaTrata) {
      case 1:
        this.txtLineaTratamiento = LINEATRATAMIENTO.primeraLineaTxt;
        this.lineaTratRequest.lineaTratamiento = LINEATRATAMIENTO.primeraLinea;
        this.existeLineaTrata = true;
        break;
      case 2:
        this.txtLineaTratamiento = LINEATRATAMIENTO.segundaLineaTxt;
        this.lineaTratRequest.lineaTratamiento = LINEATRATAMIENTO.segundaLinea;
        this.existeLineaTrata = true;
        break;
      case 3:
        this.txtLineaTratamiento = LINEATRATAMIENTO.terceraLineaTxt;
        this.lineaTratRequest.lineaTratamiento = LINEATRATAMIENTO.terceraLinea;
        this.existeLineaTrata = true;
        break;
      default:
        this.existeLineaTrata = false;
        this.rgPrefInstiFrmCtrl.setValue(2);
        this.rgPrefInstiFrmCtrl.disable();
      // this.descripcionMacFrmCtrl.setValue('No existen preferencias registradas para la línea de tratamiento');
    }

    this.lineaTratamientoFrmCtrl.setValue(this.txtLineaTratamiento);
  }

  public consultarTipoTumor(
    precargar: boolean,
    valor: any,
    valorRptaAlcanzada: any
  ) {
    this.parametroRequest.codigoGrupo = GRUPO_PARAMETRO.codGrupoTipoTumor;
    this.listaParametroservice.listaParametro(this.parametroRequest).subscribe(
      (data: ParametroResponse) => {
        if (data.codigoResultado === 0) {
          this.listaTipoTumor =
            data.filtroParametro != null ? data.filtroParametro : [];
          this.obtenerCombo(
            this.listaTipoTumor,
            null,
            "-- Seleccionar Tipo Tumor --"
          );
          if (precargar) {
            this.tipoTumorFrmCtrl.setValue(valor);
            if (valorRptaAlcanzada !== null) {
              this.consultarRespuestaAlcanzada(true, valorRptaAlcanzada);
            }
          }
        } else {
          console.error(data);
        }
      },
      (error) => {
        console.error("Error al listar el Tipo de Tumor");
      }
    );
  }

  public consultarNroCursos(precargar: boolean, valor: any) {
    this.parametroRequest.codigoGrupo = GRUPO_PARAMETRO.nroCursos;
    this.listaParametroservice.listaParametro(this.parametroRequest).subscribe(
      (data: ParametroResponse) => {
        if (data.codigoResultado === 0) {
          this.listaNroCursos =
            data.filtroParametro != null ? data.filtroParametro : [];
          this.obtenerCombo(
            this.listaNroCursos,
            null,
            "-- Seleccionar Nro. Cursos --"
          );
          if (precargar) {
            this.nroCursoFrmCtrl.setValue(valor);
          }
        } else {
          console.error(data);
        }
      },
      (error) => {
        console.error("Error al listar Nro de Cursos");
      }
    );
  }

  addValue(resultadoToxicidad) {
    if (resultadoToxicidad.length == 0) {
      this.existeToxiFrmCtrl.setValue(1);
      this.toxiFrmArray.push(
        new FormGroup({
          tipoToxicidadFrmCtrl: new FormControl(null),
          gradoToxicidadFrmCtrl: new FormControl(null),
          comFrmCtrl: new FormControl(null),
        })
      );
    } else {
      var existeResultadoToxicidad = resultadoToxicidad[0].existe_toxicidad;
      this.existeToxiFrmCtrl.setValue(existeResultadoToxicidad);
      for (let index = 0; index < resultadoToxicidad.length; index++) {
        this.toxiFrmArray.push(
          new FormGroup({
            tipoToxicidadFrmCtrl: new FormControl(
              resultadoToxicidad[index].tipo_toxicidad
            ),
            gradoToxicidadFrmCtrl: new FormControl(
              Number(resultadoToxicidad[index].grado)
            ),
            comFrmCtrl: new FormControl(resultadoToxicidad[index].comentario),
          })
        );
      }
    }
  }

  addValue2(resultadoBasal, info) {
    if (resultadoBasal.length == 0) {
      // this.openDialogMensaje(info, null, true, false, null);
      this.resBasalMarcFrmArray.push(
        new FormGroup({
          examMedFrmCtrl: new FormControl(""),
          rangoFrmCtrl: new FormControl(""),
          resFrmCtrl: new FormControl(""),
          fechaFrmCtrl: new FormControl(""),
          codResultadoBasal: new FormControl(""),
        })
      );
    } else {
      for (let index = 0; index < resultadoBasal.length; index++) {
        this.resBasalMarcFrmArray.push(
          new FormGroup({
            examMedFrmCtrl: new FormControl(
              resultadoBasal[index].descripcionExamenMed
            ),
            rangoFrmCtrl: new FormControl(resultadoBasal[index].rango),
            resFrmCtrl: new FormControl(resultadoBasal[index].resultado===" "?"":resultadoBasal[index].resultado),
            fechaFrmCtrl: new FormControl(resultadoBasal[index].fecResultado===" "?"":resultadoBasal[index].fecResultado),
            codResultadoBasal: new FormControl(
              resultadoBasal[index].codResultadoBasal
            ),
          })
        );
      }
    }
  }

  public cargarRptaAlcanzada(event: Event): void {
    this.listaRespAlcanzada = [];
    this.consultarRespuestaAlcanzada(false, null);
  }

  public consultarRespuestaAlcanzada(precargar: boolean, valor: number) {
    if (
      typeof this.tipoTumorFrmCtrl.value === "undefined" &&
      this.tipoTumorFrmCtrl.value !== null
    ) {
      return;
    }

    this.parametroRequest.codigoGrupo = GRUPO_PARAMETRO.respuestaAlcanzada;
    this.parametroRequest.codigoParam = this.tipoTumorFrmCtrl.value;
    this.listaParametroservice
      .consultarParametro(this.parametroRequest)
      .subscribe(
        (data: WsResponse) => {
          if (data.audiResponse.codigoRespuesta === "0") {
            this.listaRespAlcanzada = data.data != null ? data.data : [];
            this.obtenerCombo(
              this.listaRespAlcanzada,
              null,
              "-- Seleccionar Respuesta Alcanzada --"
            );
            if (precargar) {
              this.respAlcanzadaFrmCtrl.setValue(valor);
            }
            this.respAlcanzadaFrmCtrl.enable();
          } else {
            console.error(data);
            this.openDialogMensaje(
              MENSAJES.ERROR_NOFUNCION,
              data.audiResponse.mensajeRespuesta,
              true,
              false,
              null
            );
          }
        },
        (error) => {
          console.error(error);
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            "Error al cargar respuesta alcanzada.",
            true,
            false,
            null
          );
        }
      );
  }

  public consultarLugarProgresion(precargar: boolean, valor: any) {
    this.parametroRequest.codigoGrupo = GRUPO_PARAMETRO.lugarProgresion;
    this.listaParametroservice.listaParametro(this.parametroRequest).subscribe(
      (data: ParametroResponse) => {
        if (data.codigoResultado === 0) {
          this.listaLugarProgresion = data.filtroParametro;
          this.obtenerCombo(
            this.listaLugarProgresion,
            null,
            "-- Seleccionar Lugar Progresion --"
          );
          if (precargar) {
            this.lugarProgresionFrmCtrl.setValue(valor);
          }
        } else {
          console.error(data);
        }
      },
      (error) => {
        console.error("Error al listar el Lugar Progresion");
      }
    );
  }
  // Guardar Linea de Tratamiento / Preferencia Institucional Paso 1
  public insertarCondicionBasal() {
    // tipoToxicidadFrmCtrl: null,
    //       gradoToxicidadFrmCtrl: null,
    //       comFrmCtrl: null

    var toxiArrayForm = this.toxiFrmArray.value.map((el) => {
      return {
        existe_toxicidad: this.existeToxiFrmCtrl.value,
        tipo_toxicidad: el.tipoToxicidadFrmCtrl,
        grado: el.gradoToxicidadFrmCtrl,
        comentario: el.comFrmCtrl,
      };
    });

    var resBasalMarc = this.resBasalMarcFrmArray.value.map((el) => {
      return {
        codResultadoBasal: el.codResultadoBasal,
        rango: el.rangoFrmCtrl,
        resultado: el.resFrmCtrl,
        fecResultado: el.fechaFrmCtrl,
      };
    });

    var dataRequestArray = [
      {
        codSolEvaluacion: this.solicitud.codSolEvaluacion,
        pesoPaciente: this.pesPacFrmCtrl.value,
        dosisMedicamento: this.dosMedFrmCtrl.value,
        ecog: this.ecogFrmCtrl.value,
        existenciaMetastasis: this.existeMetaFrmCtrl.value,
        lugarMetastasis: this.lugarMetaFrmCtrl.value,
        toxicidadBasal: toxiArrayForm,
        resultadoBasal:
          resBasalMarc[0].codResultadoBasal == "" &&
          resBasalMarc[0].rango == "" &&
          resBasalMarc[0].resultado == "" &&
          resBasalMarc[0].fecResultado == ""
            ? []
            : resBasalMarc,
        condicion: this.tipoCondicFrmCtrl.value,
        codigoRolUsuario: this.userService.getCodRol,
        codigoUsuario: this.userService.getCodUsuario,
        fechaEstado: new Date(),
      },
    ];

    this.dataRequest.push({
      codSolEvaluacion: this.solicitud.codSolEvaluacion,
      pesoPaciente: this.pesPacFrmCtrl.value,
      dosisMedicamento: this.dosMedFrmCtrl.value,
      ecog: this.ecogFrmCtrl.value,
      existenciaMetastasis: this.existeMetaFrmCtrl.value,
      lugarMetastasis: this.lugarMetaFrmCtrl.value,
      toxicidadBasal: toxiArrayForm,
      resultadoBasal: resBasalMarc,
      condicion: this.tipoCondicFrmCtrl.value,
      codigoRolUsuario: this.userService.getCodRol,
      codigoUsuario: this.userService.getCodUsuario,
      fechaEstado: new Date(),
    });

    this.spinnerService.show();
    this.detalleSolicitudEvaluacionService
      .insActCondicionBasalPac(dataRequestArray)
      .subscribe(
        (data) => {
          if (data["audiResponse"]["codigoRespuesta"] === "0") {
            this.openDialogMensaje(
              MENSAJES.INFO_SUCCESS2,
              null,
              true,
              false,
              null
            );
            this.grabarPaso = "1";
            this.btnSiguiente.emit(false);
          } else {
            this.openDialogMensaje(
              "Hubo un problema, por favor volver a intentar.",
              data["msgResultado"],
              true,
              false,
              null
            );
            console.error(data);
            this.grabarPaso = "0";
            this.btnSiguiente.emit(true);
          }
          this.spinnerService.hide();
        },
        (error) => {
          console.error(error);
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            "Hubo un problema, por favor volver a intentar.",
            true,
            false,
            null
          );
          this.spinnerService.hide();
          this.btnSiguiente.emit(true);
        }
      );
  }

  public consultarMacTratamiento(precargar: boolean, valor: any) {
    this.lineaTratRequest.condicionCancer = this.condicionCancerFrmCtrl.value;
    this.listaSubCondicionCancer = [];
    if (!precargar) {
      this.observacionFrmCtrl.setValue(null);
      this.flagObservacions = false; // this.observacionFrmCtrl.disable();
    }
    this.buscarPreferenciaInsti(precargar);
  }

  // // PRECARGAR DATOS SI EXISTEN EN FARMACIA COMPLEJA PASO 1
  // public precargaLineaTrataPrefInst(existeLinea: boolean) {
  //   this.lineaTratRequest.codSolEva = this.solicitud.codSolEvaluacion;
  //   this.lineaTratRequest.codGrupoDiag = this.solicitud.codGrupoDiagnostico;
  //   let json = {
  //     "codSolEva": this.solicitud.codSolEvaluacion,
  //     "codGrupoDiag": this.solicitud.codGrupoDiagnostico,
  //     "codigoUsuario": this.userService.getCodUsuario
  //   }
  //   this.spinnerService.show();
  //   this.detalleSolicitudEvaluacionService.
  //     conInsActPreferenciaInstiPre(json).subscribe(
  //       (data: WsResponse) => {
  //
  //         // if (data.data !== null) {

  //         //   this.lineaTratRequest.nroCurso = data.data.nroCurso;
  //         //   this.consultarNroCursos(true, this.lineaTratRequest.nroCurso);

  //         //   this.lineaTratRequest.tipoTumor = data.data.tipoTumor;
  //         //   this.lineaTratRequest.respAlcanzada = data.data.respuestaAlcanzada;

  //         //   this.consultarTipoTumor(true, data.data.tipoTumor, data.data.respuestaAlcanzada);

  //         //   this.lineaTratRequest.lugarProgresion = data.data.lugarProgresion;
  //         //   this.consultarLugarProgresion(true, data.data.lugarProgresion);

  //         //   this.listaCondicionCancer = data.data.cmbCondicion;

  //         //   this.lineaTratRequest.cumplePrefeInsti = data.data.cumplePrefInsti;
  //         //   this.lineaTratRequest.observacion = data.data.observacion;
  //         //   this.rgPrefInstiFrmCtrl.setValue(data.data.cumplePrefInsti);

  //         //   this.grabarPaso = data.data.grabar;

  //         //   if (this.grabarPaso === '1') {
  //         //     this.btnSiguiente.emit(false);
  //         //   }

  //         //   this.spinnerService.hide();
  //         // } else {
  //         //   this.consultarNroCursos(false, null);
  //         //   this.consultarTipoTumor(false, null, null);
  //         //   this.consultarLugarProgresion(false, null);
  //         //   this.spinnerService.hide();
  //         // }
  //         // // this.consultarMacTratamiento(true, null);

  //         // if (existeLinea && data.data !== null && data.data.condicion !== null) {
  //         //   this.lineaTratRequest.condicionCancer = data.data.condicion;
  //         //   this.condicionCancerFrmCtrl.setValue(data.data.condicion);
  //         //   this.consultarMacTratamiento(true, null);
  //         // }
  //         // this.spinnerService.hide();
  //       }, error => {
  //         console.error(error);
  //         this.openDialogMensaje(MENSAJES.ERROR_SERVICIO, 'Error al cargar data inicial grabada.', true, false, null);
  //         this.spinnerService.hide();
  //       }
  //     );
  // }

  public mostrarCondicionBasalData() {
    var json = {
      codSolEva: this.solicitud.codSolEvaluacion,
      codGrpDiag: this.solicitud.codGrupoDiagnostico,
      codMac: this.solicitud.codMac,
    };

    this.spinnerService.show();
    this.detalleSolicitudEvaluacionService
      .consultarResultadoBasal(json)
      .subscribe((res) => {
        this.iniciarLlenadoParametros();
        if (res["audiResponse"]["codigoRespuesta"] === "0") {
          this.resultadoToxicidad = res["data"]["toxicidadBasal"];
          //var existeResultadoToxicidad = res["data"]["toxicidadBasal"][0].existe_toxicidad
          this.marvaVacio = res["data"]["marvaVacio"];
          var resultadoBasal = res["data"]["resultadoBasal"];
          this.resultadoBasalData = res["data"]["resultadoBasal"];
          this.addValue(this.resultadoToxicidad);
          this.addValue2(resultadoBasal, res["data"]["marvaVacio"]);
          this.pesPacFrmCtrl.setValue(res["data"]["pesoPaciente"]);
          this.dosMedFrmCtrl.setValue(res["data"]["dosis"]);
          this.ecogFrmCtrl.setValue(res["data"]["ecog"]);
          this.existeMetaFrmCtrl.setValue(
            res["data"]["existenciaMetastasis"] == null
              ? 1
              : res["data"]["existenciaMetastasis"]
          );
          this.lugarMetaFrmCtrl.setValue(res["data"]["lugarMetastasis"]);
          this.tipoCondicFrmCtrl.setValue(res["data"]["condicion"]);
          this.cmbCondicionList = res["data"]["cmbCondicion"];

          this.grabarPaso = res["data"].grabar;
          if (res["data"]["enviar_correo"] === 1) {
            this.enviarEmail();
          }

          if (this.grabarPaso === "1") {
            this.btnSiguiente.emit(false);
          } else {
            this.btnSiguiente.emit(true);
          }
          this.spinnerService.hide();
        } else {
          this.openDialogMensaje(
            MENSAJES.ERROR_NOFUNCION,
            res["audiResponse"]["mensajeRespuesta"],
            true,
            false,
            null
          );
        }
      });
  }

  public logicaPreferenciaInstitucional(response: WsResponse): void {
    if (
      this.solicitud.codMac !== response.data[0].codTratamiento &&
      response.data[0].tipoTratamiento === PREFERENCIAINSTI.codPreferencia &&
      response.data[0].presentacNoPermitida === null
    ) {
      this.rgPrefInstiFrmCtrl.setValue(0);
    } else if (
      this.solicitud.codMac === response.data[0].codTratamiento &&
      response.data[0].tipoTratamiento === PREFERENCIAINSTI.codPreferencia &&
      response.data[0].presentacNoPermitida === null
    ) {
      this.rgPrefInstiFrmCtrl.setValue(1);
    } else if (
      this.solicitud.codMac !== response.data[0].codTratamiento &&
      response.data[0].tipoTratamiento === PREFERENCIAINSTI.codDesaprobacion &&
      response.data[0].presentacNoPermitida === null
    ) {
      this.rgPrefInstiFrmCtrl.setValue(1);
    } else if (
      this.solicitud.codMac === response.data[0].codTratamiento &&
      response.data[0].tipoTratamiento === PREFERENCIAINSTI.codDesaprobacion &&
      response.data[0].presentacNoPermitida === null
    ) {
      this.rgPrefInstiFrmCtrl.setValue(0);
    } else if (
      this.solicitud.codMac != null &&
      response.data[0].codTratamiento === null &&
      response.data[0].tipoTratamiento === 240 &&
      response.data[0].presentacNoPermitida === null
    ) {
      this.rgPrefInstiFrmCtrl.setValue(2);
    } else if (
      this.solicitud.codMac !== response.data[0].codTratamiento &&
      response.data[0].tipoTratamiento === PREFERENCIAINSTI.codPreferencia &&
      response.data[0].presentacNoPermitida != null
    ) {
      this.rgPrefInstiFrmCtrl.setValue(0);
    } else if (
      this.solicitud.codMac === response.data[0].codTratamiento &&
      response.data[0].tipoTratamiento === PREFERENCIAINSTI.codPreferencia &&
      response.data[0].presentacNoPermitida != null
    ) {
      this.rgPrefInstiFrmCtrl.setValue(0);
    } else if (
      this.solicitud.codMac !== response.data[0].codTratamiento &&
      response.data[0].tipoTratamiento === PREFERENCIAINSTI.codDesaprobacion &&
      response.data[0].presentacNoPermitida != null
    ) {
      this.rgPrefInstiFrmCtrl.setValue(0);
    } else if (
      this.solicitud.codMac === response.data[0].codTratamiento &&
      response.data[0].tipoTratamiento === PREFERENCIAINSTI.codDesaprobacion &&
      response.data[0].presentacNoPermitida != null
    ) {
      this.rgPrefInstiFrmCtrl.setValue(0);
    } else if (
      this.solicitud.codMac != null &&
      response.data[0].codTratamiento === null &&
      response.data[0].tipoTratamiento === 240 &&
      response.data[0].presentacNoPermitida != null
    ) {
      this.rgPrefInstiFrmCtrl.setValue(2);
    } else if (
      this.lineaTratRequest.condicionCancer === PREFERENCIAINSTI.codCondicion &&
      (response.data[0].codTratamiento === null ||
        response.data[0].codTratamiento === 0)
    ) {
      this.rgPrefInstiFrmCtrl.setValue(2);
    } else {
      this.rgPrefInstiFrmCtrl.setValue(null);
    }
  }

  public buscarPreferenciaInsti(precargar: boolean) {
    this.tratamientoLabel = PREFERENCIAINSTI.tratamiento;
    this.tipoTratamientoLabel = PREFERENCIAINSTI.tipoTratamiento;
    this.cumplePrefeDesaLabel = PREFERENCIAINSTI.cumplePrefe;
    this.lineaTratRequest.codSolEva = this.solicitud.codSolEvaluacion;
    this.lineaTratRequest.codGrupoDiag = this.solicitud.codGrupoDiagnostico;
    this.spinnerService.show();
    this.detalleSolicitudEvaluacionService
      .consultarPreferenciaInsti(this.lineaTratRequest)
      .subscribe(
        (response: WsResponse) => {
          this.rgPrefInstiFrmCtrl.enable();
          if (response.data.length === 1) {
            this.detalleCondicionFrmCtrl.setValue(
              response.data[0].detalleCondicion !== null
                ? response.data[0].detalleCondicion
                : PREFERENCIAINSTI.noRegistrado
            );
            this.tratamientoFrmCtrl.setValue(
              response.data[0].descripTratamiento !== null
                ? response.data[0].descripTratamiento
                : PREFERENCIAINSTI.noRegistrado
            );
            this.presentaNoPermitidaFrmCtrl.setValue(
              response.data[0].presentacNoPermitida === null
                ? PREFERENCIAINSTI.noRegistrado
                : response.data[0].presentacNoPermitida
            );
            this.tipoTratamientoFrmCtrl.setValue(
              response.data[0].descripTipoTratamiento !== null
                ? response.data[0].descripTipoTratamiento
                : PREFERENCIAINSTI.noRegistrado
            );

            if (!precargar) {
              // CONTIENE LA LOGICA SI CUMPLE O NO CUMPLE
              this.logicaPreferenciaInstitucional(response);
            } else {
              this.condicionCancerFrmCtrl.setValue(
                this.lineaTratRequest.condicionCancer
              );
            }

            this.lineaTratRequest.cumplePrefeInsti =
              this.rgPrefInstiFrmCtrl.value;
            this.lineaTratRequest.codMac = this.solicitud.codMac;
            // this.rgPrefInsti = this.rgPrefInstiFrmCtrl.value;
          } else if (response.data.length > 1) {
            let descripcionTratamiento = "";
            let presentacionNoPermitida = "";
            let descripcionTipoTratamiento = "";
            this.tratamientoLabel = PREFERENCIAINSTI.tratamientoGuia;
            this.tipoTratamientoLabel = PREFERENCIAINSTI.tipoTratamientoGuia;
            this.cumplePrefeDesaLabel = PREFERENCIAINSTI.cumplePrefeGuia;

            this.detalleCondicionFrmCtrl.setValue(
              response.data[0].detalleCondicion
            );
            this.tipoTratamientoFrmCtrl.setValue(
              response.data[0].descripTipoTratamiento
            );

            response.data.forEach((element) => {
              if (element.presentacNoPermitida !== null) {
                presentacionNoPermitida =
                  presentacionNoPermitida +
                  element.presentacNoPermitida +
                  " / ";
              } else {
                presentacionNoPermitida =
                  presentacionNoPermitida +
                  PREFERENCIAINSTI.noRegistrado +
                  " / ";
              }

              descripcionTratamiento =
                descripcionTratamiento +
                (element.descripTratamiento !== null
                  ? element.descripTratamiento
                  : PREFERENCIAINSTI.noRegistrado) +
                " / ";

              descripcionTipoTratamiento =
                descripcionTipoTratamiento +
                (element.descripTipoTratamiento !== null
                  ? element.descripTipoTratamiento
                  : PREFERENCIAINSTI.noRegistrado) +
                " / ";
            });
            descripcionTratamiento = descripcionTratamiento.substring(
              0,
              descripcionTratamiento.length - 3
            );
            presentacionNoPermitida = presentacionNoPermitida.substring(
              0,
              presentacionNoPermitida.length - 3
            );
            descripcionTipoTratamiento = descripcionTipoTratamiento.substring(
              0,
              descripcionTipoTratamiento.length - 3
            );
            this.tratamientoFrmCtrl.setValue(descripcionTratamiento);
            this.presentaNoPermitidaFrmCtrl.setValue(presentacionNoPermitida);
            this.tipoTratamientoFrmCtrl.setValue(descripcionTipoTratamiento);
            this.rgPrefInstiFrmCtrl.setValue(null);
          } else {
            this.detalleCondicionFrmCtrl.setValue(
              PREFERENCIAINSTI.noRegistrado
            );
            this.tratamientoFrmCtrl.setValue(PREFERENCIAINSTI.noRegistrado);
            this.presentaNoPermitidaFrmCtrl.setValue(
              PREFERENCIAINSTI.noRegistrado
            );
            this.tipoTratamientoFrmCtrl.setValue(PREFERENCIAINSTI.noRegistrado);
            this.rgPrefInstiFrmCtrl.setValue(2);
            this.lineaTratRequest.cumplePrefeInsti =
              this.rgPrefInstiFrmCtrl.value;
          }

          if (precargar) {
            this.rgPrefInstiFrmCtrl.setValue(
              this.lineaTratRequest.cumplePrefeInsti
            );
            this.observacionFrmCtrl.setValue(this.lineaTratRequest.observacion);
          }

          this.spinnerService.hide();

          if (this.grabarPaso === "1") {
            this.observacionFrmCtrl.enable();
          }
        },
        (error) => {
          console.error(error);
          this.spinnerService.hide();
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            "Error al buscar preferencias.",
            true,
            false,
            null
          );
        }
      );
  }

  public visualizarInformeAutorizador(): void {
    this.archivoRqt = new ArchivoFTP();
    this.archivoRqt.codArchivo = this.solicitud.codInformePDF;
    this.archivoRqt.ruta = FILEFTP.rutaInformeAutorizador;
    this.descargarDocumento2();
  }

  public preferenciaIntitucional(cambioCumplePrefeInsti: number) {
    if (
      this.condicionCancerFrmCtrl.value !== null &&
      cambioCumplePrefeInsti !== this.lineaTratRequest.cumplePrefeInsti
    ) {
      this.flagObservacions = true; // this.observacionFrmCtrl.enable();
    } else {
      this.observacionFrmCtrl.setValue(null);
      this.flagObservacions = false; // this.observacionFrmCtrl.disable();
    }
  }

  // POP-UP MENSAJES
  public openDialogMensaje(
    message: String,
    message2: String,
    alerta: boolean,
    confirmacion: boolean,
    valor: any
  ): void {
    const dialogRef = this.dialog.open(MessageComponent, {
      disableClose: true,
      width: "400px",
      data: {
        title: MENSAJES.medicNuevo.lineTrataPrefInst.TITLE,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((rspta) => {});
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
        this.mensaje = "ERROR CON EL SERVICIO BANDEJA EVALUACION.";
        this.openDialogMensaje(this.mensaje, null, true, false, null);
        this.spinnerService.hide();
      }
    );
  }

  addLineaToxicidad() {}

  public accesoOpcionMenu() {
    const data = require("src/assets/data/permisosRecursos.json");
    const bandejaEvaluacion = data.bandejaEvaluacion.paso1;
    const bandejaEvaluacion2 = data.bandejaEvaluacion.detalle;
    this.opcionMenu = JSON.parse(localStorage.getItem("opcionMenu"));

    if (this.opcionMenu.opcion.length > 0) {
      this.opcionMenu.opcion.forEach((element) => {
        const codOpcion = element.codOpcion;
        switch (codOpcion) {
          case bandejaEvaluacion.txtNumeroLinea:
            this.txtNumeroLinea = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.cmbNumeroCurso:
            this.cmbNumeroCurso = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.cmbTipoTumor:
            this.cmbTipoTumor = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.cmbRespuestaAlcanzada:
            this.cmbRespuestaAlcanzada = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.cmbLugarProgresion:
            this.cmbLugarProgresion = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtGrupoDiagnostico:
            this.txtGrupoDiagnostico = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.cmbCondicion:
            this.cmbCondicion = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.cmbDetalleCondicion:
            this.cmbDetalleCondicion = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtTratamiento:
            this.txtTratamiento = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtPresentacion:
            this.txtPresentacion = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtTipoTratamiento:
            this.txtTipoTratamiento = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtReferencia:
            this.txtReferencia = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtObservacion:
            this.txtObservacion = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnGrabar:
            this.btnGrabar = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnSalir:
            this.btnSalir = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnSiguientePaso1:
            this.btnSiguientePaso1 = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.cmbEcogRol:
            this.cmbEcogRol = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.cmbLugarMetastasisRol:
            this.cmbLugarMetastasisRol = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtCodigoSolicitud:
            this.txtCodigoSolicitud = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtEstadoSolicitud:
            this.txtEstadoSolicitud = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtCodigoMac:
            this.txtCodigoMac = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtDescripcionMac:
            this.txtDescripcionMac = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.btnInforme:
            this.btnInforme = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.btnActaMac:
            this.btnActaMac = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtNroSCG:
            this.txtNroSCG = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtEstadoSCG:
            this.txtEstadoSCG = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtFechaSCG:
            this.txtFechaSCG = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtTipoSCG:
            this.txtTipoSCG = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtNroCartaGarantiaDet:
            this.txtNroCartaGarantiaDet = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtClinicaDet:
            this.txtClinicaDet = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtMedicoTratante:
            this.txtMedicoTratante = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtCMP:
            this.txtCMP = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtFechaReceta:
            this.txtFechaReceta = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtFechaQuimioterapia:
            this.txtFechaQuimioterapia = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtFechaHospitalizacion:
            this.txtFechaHospitalizacion = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtMedicamentos:
            this.txtMedicamentos = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtEsquemaQuimioterapia:
            this.txtEsquemaQuimioterapia = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtPersonaContacto:
            this.txtPersonaContacto = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtTotalPresupuesto:
            this.txtTotalPresupuesto = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtPacienteDet:
            this.txtPacienteDet = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtEdad:
            this.txtEdad = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtDiagnostico:
            this.txtDiagnostico = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtCie10:
            this.txtCie10 = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtGrupoDiagnostico:
            this.txtGrupoDiagnostico = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtContratante:
            this.txtContratante = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtPlan:
            this.txtPlan = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtCodigoAfiliado:
            this.txtCodigoAfiliado = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtFechaAfiliacion:
            this.txtFechaAfiliacion = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtEstadioClinico:
            this.txtEstadioClinico = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtTNM:
            this.txtTNM = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.txtObservacion:
            this.txtObservacion = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.btnEnviarAlertaMonitoreo:
            this.btnEnviarAlertaMonitoreo = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.btnRegistrarEvaAutorizador:
            this.btnRegistrarEvaAutorizador = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion2.btnRegistrarEvaLiderTumor:
            this.btnRegistrarEvaLiderTumor = Number(element.flagAsignacion);
            break;
        }
      });
    }
  }

  addValueData() {
    this.toxiFrmArray.push(
      new FormGroup({
        tipoToxicidadFrmCtrl: new FormControl(null),
        gradoToxicidadFrmCtrl: new FormControl(null),
        comFrmCtrl: new FormControl(null),
      })
    );
  }

  async canDeactivate() {
    const result = await this.openDialogMensajeSalida(
      "Los cambios no guardados se perderán ¿Desea continuar?",
      null,
      false,
      true,
      null
    );

    return result;
  }

  /**Funcionalidad de Detalle Solicitud Evaluacion */
  public consultarInformacionScgEva() {
    this.proBarTabla = true;
    this.detalleSolicitudEvaluacionService
      .consultarInformacionScgEva(this.request)
      .subscribe(
        (data: WsResponse) => {
          if (data.audiResponse.codigoRespuesta === "0") {
            this.infoSolben = data.data.solbenBean;
            this.flagVerActaCmac = data.data.flagVerActaCmac;
            this.reporteActaCmac = data.data.reporteActaCmac;
            this.flagVerInforme = data.data.flagVerInforme;
            this.reportePdf = data.data.reportePdf;
            this.codArchCompMed = data.data.codArchComplMed;
            this.codArchFichaTec = data.data.codArchFichaTec;
            if (this.infoSolben.codAfiliado != null) {
              this.listaLineaTratamientoRequest.codigoAfiliado =
                this.infoSolben.codAfiliado;
            }

            /*if (
              this.infoSolben.estadoSolEva ===
              ESTADOEVALUACION.estadoObservadoAutorizador
            ) {
              this.validacionLiderTumor();
            }*/

            this.mostrarInformacionSCG();
          } else {
            this.mensaje =
              "Error al consultar la información de la Evaluación.";
            this.openDialogMensaje(
              MENSAJES.INFO_NO_DATA,
              this.mensaje,
              true,
              false,
              null
            );
          }
          this.proBarTabla = false;
        },
        (error) => {
          console.error(error);
          this.mensaje = "Error al obtener el detalle de la Evaluacion.";
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            this.mensaje,
            true,
            false,
            null
          );
          this.proBarTabla = false;
        }
      );
  }

  public validacionLiderTumor() {
    if (
      this.solicitud.estadoEvaluacion ===
        ESTADOEVALUACION.estadoAprobadoLiderTumor ||
      this.solicitud.estadoEvaluacion ===
        ESTADOEVALUACION.estadoRechazadoLiderTumor ||
      this.solicitud.estadoEvaluacion ===
        ESTADOEVALUACION.estadoObservadoLiderTumor
    ) {
      this.mostrarBoton = false;
      return;
    }

    this.evaAutorizadorRequest.cmpMedico = this.infoSolben.cmpMedico;
    this.evaAutorizadorRequest.codGrpDiag = this.infoSolben.codGrupoDiagnostico;
    const estadoEvaluacion = this.solicitud.estadoEvaluacion;

    this.listaParametroservice
      .consultarPValidacionAutorizador(this.evaAutorizadorRequest)
      .subscribe(
        (response: WsResponse) => {
          if (
            estadoEvaluacion === ESTADOEVALUACION.estadoObservadoAutorizador
          ) {
            if (response.audiResponse.codigoRespuesta === "0") {
              this.mostrarBoton = true;
              this.solicitud.codRolLiderTum = response.data.codigoRol;
              this.solicitud.codUsrLiderTum = response.data.codUsuario;
              this.solicitud.usrLiderTum = response.data.nombreUsuarioRol;
            } else if (
              response.audiResponse.codigoRespuesta === "2" ||
              response.audiResponse.codigoRespuesta === "3" ||
              response.audiResponse.codigoRespuesta === "4"
            ) {
              this.mensaje = response.audiResponse.mensajeRespuesta;
              this.mostrarBoton = false;
              this.openDialogMensaje(
                MENSAJES.ERROR_SERVICIO,
                this.mensaje,
                true,
                false,
                null
              );
            } else {
              this.mensaje = response.audiResponse.mensajeRespuesta;
              this.mostrarBoton = false;
              this.openDialogMensaje(
                MENSAJES.ERROR_SERVICIO,
                this.mensaje,
                true,
                false,
                null
              );
            }
          } else {
            this.mostrarBoton = false;
          }
        },
        (error) => {
          console.error(error);
          this.mensaje =
            "Error al obtener la validación para Evaluación del Lider Tumor";
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            this.mensaje,
            true,
            false,
            null
          );
        }
      );
  }

  public guardarDetalleEvaluacion(): void {
    this.solicitud.codDiagnostico = this.infoSolben.codDiagnostico;
    this.solicitud.descDiagnostico = this.infoSolben.diagnostico;
    this.solicitud.codAfiliado = this.infoSolben.codAfiliado;
    this.solicitud.paciente = this.infoSolben.paciente;
    this.solicitud.sexoPaciente = this.infoSolben.sexoPaciente;
    this.solicitud.descDiagnostico = this.infoSolben.diagnostico;
    this.solicitud.codGrupoDiagnostico = this.infoSolben.codGrupoDiagnostico;
    this.solicitud.descGrupoDiagnostico = this.infoSolben.grupoDiagnostico;
    this.solicitud.edad = this.infoSolben.edad;
    this.solicitud.codArchFichaTec = this.codArchFichaTec;
    this.solicitud.codArchCompMed = this.codArchCompMed;
    this.solicitud.codInformePDF = Number(this.reportePdf);
    this.solicitud.codCmacPDF = Number(this.reporteActaCmac);
    this.solicitud.codCmp = this.infoSolben.cmpMedico;
    this.solicitud.fechaSolEva = this.infoSolben.fecSolEva;
  }

  public setStep(index: number): void {
    this.step = index;
  }

  public setStep2(index: number): void {
    this.step2 = index;
  }

  deleteFieldValue(index) {
    this.toxiFrmArray.removeAt(index);
  }

  public enviarEmail() {
    this.spinnerService.show();
    const date = new Date();
    this.correoRequest = new EmailDTO();
    this.correoRequest.codPlantilla =
      EMAIL.EVALUACION_CONFIGURACION_MARCADORES.codigoPlantilla;
    this.correoRequest.fechaProgramada =
      _moment(date).format("DD/MM/YYYY HH:mm");
    this.correoRequest.flagAdjunto =
      EMAIL.EVALUACION_CONFIGURACION_MARCADORES.flagAdjunto;
    this.correoRequest.tipoEnvio =
      EMAIL.EVALUACION_CONFIGURACION_MARCADORES.tipoEnvio;
    this.correoRequest.usrApp = EMAIL.usrApp;

    var medAuditor = this.userService.getNombres;

    this.correoService.generarCorreo(this.correoRequest).subscribe(
      (response: OncoWsResponse) => {
        let result = "";
        let codigoEnvio;
        const lista: any = response.dataList;

        result += lista[0].cuerpo
          .toString()
          .replace(
            "{{codSolEva}}",
            this.codSolEvaluacion != null ? " :"+this.codSolEvaluacion : " : - "
          )
          .replace(
            "{{grpDiag}}",
            this.infoSolben.grupoDiagnostico != null
              ? " :"+this.infoSolben.grupoDiagnostico
              : " : - "
          )
          .replace(
            "{{tipTumor}}",
            this.tipoTumorFrmCtrl.value != null
              ? " :"+this.tipoTumorFrmCtrl.value
              : " : - "
          )
          .replace(
            "{{codMac}}",
            this.infoSolben.descripCodMac != null
              ? " :"+this.infoSolben.descripCodMac
              : " : - "
          )
          .replace(
            "{{DescrpMac}}",
            this.infoSolben.descripcionMac != null
              ? " :"+this.infoSolben.descripcionMac
              : " : - "
          )
          .replace("{{medAuditor}}", medAuditor != null ? medAuditor : " : - ");

        codigoEnvio = lista[0].codigoEnvio;

        this.correoRequest.asunto = EMAIL.EVALUACION_MONITOREO.asunto.concat(
          this.infoSolben.paciente != null ? this.infoSolben.paciente : " : - "
        );
        this.correoRequest.cuerpo = result;
        this.correoRequest.codigoEnvio = codigoEnvio;
        this.correoRequest.ruta = "";
        this.correoRequest.codigoPlantilla = this.correoRequest.codPlantilla;
        this.correoRequest.codigoGrupoDiagnostico =
          this.infoSolben.codGrupoDiagnostico;
        this.correoRequest.edadPaciente = this.infoSolben.edad;
        this.correoRequest.codRol = ROLES.responsableMonitoreo;
        this.envioCorreoRequest = new EnvioCorreoRequest();
        this.envioCorreoRequest.codSolicitudEvaluacion = this.codSolEvaluacion;
        this.envioCorreoRequest.codigoEnvio = codigoEnvio;
        this.envioCorreoRequest.usrApp = EMAIL.usrApp;

        this.correoService
          .enviarCorreoAdmiSistema(this.correoRequest)
          .subscribe(
            (response: OncoWsResponse) => {
              if (response.audiResponse.codigoRespuesta == "0") {
                this.spinnerService.hide();
                /*this.verConfirmacion(
                  "Envio de correo",
                  "su correo está en proceso de envio",
                  null
                );*/
                this.correoService
                  .actualizarCodigoEnvio(this.envioCorreoRequest)
                  .subscribe(
                    (response: OncoWsResponse) => {},
                    (error) => {
                      console.error(error);
                    }
                  );
              } else {
                this.spinnerService.hide();
                /*this.verConfirmacion(
                  "Envio de correo",
                  response.audiResponse.mensajeRespuesta,
                  null
                );*/
              }
            },
            (error) => {
              this.spinnerService.hide();
              console.error(error);
              /*this.verConfirmacion(
                "Envio de correo",
                "Error al enviar correo",
                null
              );*/
            }
          );
      },
      (error) => {
        this.spinnerService.hide();
        console.error(error);
        //this.verConfirmacion("Envio de correo", "Error al enviar correo", null);
      }
    );
  }

  /* public verConfirmacion(
    titulo: string,
    message: string,
    message2: string
  ): void {
    const dialogRef = this.dialog.open(MessageComponent, {
      width: "400px",
      disableClose: true,
      data: {
        title: titulo,
        message: message,
        message2: message2,
        alerta: true,
        confirmacion: false,
        valor: null,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result != null) {
        if (result == 1) {
          //DESEA MANTENER SIN REGISTRO EL MARCADOR 1=>SI 0=>NO
        } else {
        }
      }
    });
  }*/

  public imprimirPdf() {
    var resultadoBasal: ResultadoBasalRequest = new ResultadoBasalRequest();

    resultadoBasal.codAfiliado = this.solicitud.codAfiliado;
    resultadoBasal.codCondBasal = 0;
    resultadoBasal.codMac = this.solicitud.codMac;
    resultadoBasal.codSolEva = this.solicitud.codSolEvaluacion;
    resultadoBasal.codGrpDiag = this.solicitud.codGrupoDiagnostico;

    this.bandejaEvaluacionService
      .reportePasoUno(resultadoBasal)
      .subscribe((resp) => {});
  }
}
