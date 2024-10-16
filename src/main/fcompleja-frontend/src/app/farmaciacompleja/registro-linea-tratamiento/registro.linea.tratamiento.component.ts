import {
  Component,
  OnInit,
  ViewChild,
  forwardRef,
  Inject,
} from "@angular/core";
import { Observable } from "rxjs/Observable";

// Others
import { Router } from "@angular/router";
import { SolbenRequest } from "src/app/dto/request/SolbenRequest";
import {
  ESTADOMONITOREOMED,
  ESTADOEVALUACION,
  TIPOSCGSOLBEN,
  MENSAJES,
  MY_FORMATS_AUNA,
  MY_FORMATS_MONTH,
  EMAIL,
  PARAMETRO,
  FILEFTP,
  ROLES,
  TIPO_SOL_EVA,
  ACCESO_EVALUACION,
  FLAG_REGLAS_EVALUACION,
  ESTADO_LINEA_TRAT,
} from "src/app/common";
import { ListaParametroservice } from "src/app/service/lista.parametro.service";
import { EvaluacionAutorizadorRequest } from "src/app/dto/request/EvaluacionAutorizadorRequest";
import { WsResponse } from "src/app/dto/WsResponse";
import { LineaTratamiento } from "src/app/dto/solicitudEvaluacion/bandeja/LineaTratamiento";
import { FormGroup, FormControl, FormArray } from "@angular/forms";
import { MatPaginatorIntlEspanol } from "src/app/directives/matpaginator-translate";
const Swal = require("sweetalert2");

import {
  MatPaginatorIntl,
  MatTableDataSource,
  MatPaginator,
  MatSort,
  MatDialog,
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
} from "@angular/material";
import { InformeSolEvaReporteRequest } from "src/app/dto/solicitudEvaluacion/detalle/InformacionScgEvaRequest";
import { listaLineaTratamientoRequest } from "src/app/dto/solicitudEvaluacion/bandeja/ListaHisLineaTratamientoRequest";
import { DetalleSolicitudEvaluacionService } from "src/app/service/detalle.solicitud.evaluacion.service";
import { BandejaEvaluacionService } from "src/app/service/bandeja.evaluacion.service";
import { ApiResponse } from "src/app/dto/bandeja-preliminar/detalle-preliminar/ApiResponse";
import { InfoSolben } from "src/app/dto/bandeja-preliminar/detalle-preliminar/InfoSolben";
import { MessageComponent } from "src/app/core/message/message.component";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MatDatepicker } from "@angular/material/datepicker";
import { EvaluacionService } from "src/app/dto/service/evaluacion.service";
import { DatePipe } from "@angular/common";
import { EmailDTO } from "src/app/dto/core/EmailDTO";

import * as _moment from "moment";

/* tslint:disable */
// tslint:disable-next-line
import { default as _rollupMoment, Moment } from "moment";

import { CorreosService } from "src/app/service/cross/correos.service";
import { OncoWsResponse } from "src/app/dto/response/OncoWsResponse";
import { UsuarioService } from "src/app/dto/service/usuario.service";
import { EnvioCorreoRequest } from "src/app/dto/core/EnvioCorreoRequest";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { CoreService } from "src/app/service/core.service";
import { ArchivoFTP } from "src/app/dto/bandeja-preliminar/detalle-preliminar/ArchivoFTP";
import { SolicitudEvaluacionRequest } from "src/app/dto/request/SolicitudEvaluacionRequest";
import { BOpcionMenuLocalStorage } from "src/app/dto/core/BOpcionMenuLocalStorage";
import { MacService } from "src/app/service/mac.service";
import { MACResponse } from "src/app/dto/configuracion/MACResponse";

const moment = _rollupMoment || _moment;

@Component({
  selector: "app-registro-linea-tratamiento",
  templateUrl: "./registro.linea.tratamiento.component.html",
  styleUrls: ["./registro.linea.tratamiento.component.scss"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: MY_FORMATS_MONTH,
    },
  ],
})
export class RegistroLineaTratamientoComponent implements OnInit {
  antecedentesFrmGrp: FormGroup;
  antecedentesPatPersonalesFrmGrp: FormGroup;
  antecedentesOncoPersonalesFrmGrp: FormGroup;
  antecedentesOncoFamFrmGrp: FormGroup;
  antecedentesOtros: FormGroup;
  // previo
  tratamientoPrevioCirugia: FormGroup;
  tpCirugiaArray: FormArray;
  tpCirugiaFecha: FormControl;
  tpCirugiaTipo: FormControl;
  tpCirugiaHallazgo: FormControl;
  tratamientoPrevioRadioterapia: FormGroup;
  tratamientoPrevioPaliativo: FormGroup;
  tratamientoPrevioAntineoplasica: FormGroup;
  menarquia: FormControl;
  gestaciones: FormControl;
  nro_hijos: FormControl;
  fur: FormControl;
  abortos: FormControl;
  anticoceptivo: FormControl;
  observaciones: FormControl;
  hta: FormControl;
  ima_icc: FormControl;
  reumatologicas: FormControl;
  dim: FormControl;
  epoc_epid: FormControl;
  endocrinopatias: FormControl;
  asma: FormControl;
  otros: FormControl;
  ram: FormControl;
  habitos_nocivos: FormControl;
  aplica1: FormControl;
  noAplica1: FormControl;
  aplica2: FormControl;
  noAplica2: FormControl;
  aplica3: FormControl;
  noAplica3: FormControl;
  aplica4: FormControl;
  noAplica4: FormControl;
  aplica5: FormControl;
  noAplica5: FormControl;
  aplica6: FormControl;
  noAplica6: FormControl;
  aplica7: FormControl;
  noAplica7: FormControl;
  aplica8: FormControl;
  noAplica8: FormControl;
  solido: FormControl;
  noSolido: FormControl;
  otros_onco_fami: FormControl;

  sampleArray = ["e"];
  sampleArray2 = ["e"];
  sampleArray3 = ["e"];
  sampleArray4 = ["e"];
  sampleArray5 = ["e"];

  fieldArray = new FormArray([]);
  fieldFamiliar1erGrado = new FormArray([]);
  private fieldFamiliar2doGrado = new FormArray([]);

  dataGlobal: any = {};
  isRequired = false;
  isRequired2 = false;
  confirmarSalida: boolean = false;
  proBarTabla: boolean;
  mostrarBtnAlertMon: boolean = false;

  datosFrmGroup: FormGroup;
  detalleFrmGroup: FormGroup;

  fam1btnAdd: boolean = true;
  fam2btnAdd: boolean = true;

  chkFamiliar1 = new FormControl(false);
  chkFamiliar2 = new FormControl(false);

  public codSolEvaluacion: any;
  public flagLiderTumor: string;
  public step: number;
  public step2: number;

  public solbenRequest: SolbenRequest = new SolbenRequest();
  public evaAutorizadorRequest: EvaluacionAutorizadorRequest =
    new EvaluacionAutorizadorRequest();

  public mostrarBoton: boolean;

  request: InformeSolEvaReporteRequest = new InformeSolEvaReporteRequest();
  listaLineaTratamientoRequest: listaLineaTratamientoRequest =
    new listaLineaTratamientoRequest();
  rpta = {};
  listaHistoriaLineaTrata: LineaTratamiento[] = [];
  linea: String;

  codMac: any;
  codAfiliado: any;

  mostraEvaluacion: boolean;

  resultadoEvaluacionLiderTumor: any[] = [];
  correoRequest: EmailDTO;
  envioCorreoRequest: EnvioCorreoRequest;
  archivoRqt: ArchivoFTP;

  ESTADOEVALUACION: any = ESTADOEVALUACION;

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
    observacionFrmCtrl: new FormControl(null),
    //codigo luis
    codHisFrmCtrl: new FormControl(null),
    descHisFrmCtrl: new FormControl(null),
  });
  listaTumorLiquido;
  listaTumorLiquidoMielo;

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
  get observacionFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("observacionFrmCtrl");
  }

  //codigo luis
  get codHisFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("codHisFrmCtrl");
  }
  get descHisFrmCtrl() {
    return this.detEvaluacionFrmGrp.get("descHisFrmCtrl");
  }
  //

  infoSolben: InfoSolben;
  mostrarCampoDetalle: number;
  mostrarFechaReceta: number;
  mostrarFechaQuimio: number;
  mostrarFechaHospital: number;

  flagVerActaCmac: number;
  reporteActaCmac: string;
  flagVerInforme: number;
  reportePdf: string;
  mensaje: string;
  codRolLiderTum: number;
  codUsrLiderTum: number;
  usrLiderTum: string;
  codArchFichaTec: number;
  codArchCompMed: number;

  public isLoading: boolean;
  public dataSource: MatTableDataSource<LineaTratamiento>;

  public displayedColumns: string[];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  opcionMenu: BOpcionMenuLocalStorage;
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
  txtGrupoDiagnostico: number;
  txtContratante: number;
  txtPlan: number;
  txtCodigoAfiliado: number;
  txtFechaAfiliacion: number;
  txtEstadioClinico: number;
  txtTNM: number;
  txtObservacion: number;
  btnEnviarAlertaMonitoreo: number;
  btnRegistrarEvaAutorizador: number;
  btnRegistrarEvaLiderTumor: number;
  listaMedicamentos;
  listaRespuesta;
  listaLugar;
  listaLugarMieldi;
  listaLugarLin;
  listaLugarMielo;
  listaLugarLeu;
  listaLinea;
  listaMotivo;
  flagEvaluacion = FLAG_REGLAS_EVALUACION;
  valorMostrarOpcion = ACCESO_EVALUACION.mostrarOpcion;
  tipoDoc: string;
  numDoc: string;

  constructor(
    public dialog: MatDialog,
    private adapter: DateAdapter<any>,
    private detalleServicioSolEva: DetalleSolicitudEvaluacionService,
    private bandejaEvaluacionService: BandejaEvaluacionService,
    private router: Router,
    private listaParametroservice: ListaParametroservice,
    private datePipe: DatePipe,
    private macService: MacService,
    private correoService: CorreosService,
    private coreService: CoreService,
    private spinnerService: Ng4LoadingSpinnerService,
    @Inject(EvaluacionService) private solicitud: EvaluacionService,
    @Inject(UsuarioService) private userService: UsuarioService
  ) {
    this.adapter.setLocale("es-PE");
    this.listaRespuesta = {};
  }

  lecturaFormAntecPersGine() {
    this.antecedentesFrmGrp.get("menarquia").disable();
    this.antecedentesFrmGrp.get("gestaciones").disable();
    this.antecedentesFrmGrp.get("nro_hijos").disable();
    this.antecedentesFrmGrp.get("fur").disable();
    this.antecedentesFrmGrp.get("abortos").disable();
    this.antecedentesFrmGrp.get("anticoceptivo").disable();
    this.antecedentesFrmGrp.get("observaciones").disable();
    this.antecedentesPatPersonalesFrmGrp.get("hta").disable();
    this.antecedentesPatPersonalesFrmGrp.get("ima_icc").disable();
    this.antecedentesPatPersonalesFrmGrp.get("reumatologicas").disable();
    this.antecedentesPatPersonalesFrmGrp.get("dim").disable();
    this.antecedentesPatPersonalesFrmGrp.get("epoc_epid").disable();
    this.antecedentesPatPersonalesFrmGrp.get("endocrinopatias").disable();
    this.antecedentesPatPersonalesFrmGrp.get("asma").disable();
    this.antecedentesPatPersonalesFrmGrp.get("ram").disable();
    this.antecedentesPatPersonalesFrmGrp.get("otros").disable();
    this.antecedentesPatPersonalesFrmGrp.get("habitos_nocivos").disable();
    this.otros_onco_fami.disable();

    for (let field of this.fieldArray.controls) {
      field.disable();
    }

    this.fieldFamiliar1erGrado.controls.forEach((e) => {
      e.disable();
    });
    this.fieldFamiliar2doGrado.controls.forEach((e) => {
      e.disable();
    });
    //
  }

  ngOnInit() {
    this.accesoOpcionMenu();

    this.createFormControls();
    this.createForm();
    this.capturarRegistroEval();
    this.inicializarVariables();
    this.consultarInformacionScgEva();
    this.addFieldValue();
    this.addFieldValue1erGrado();
    this.addFieldValue2doGrado();
    this.chkFamiliar1.disable();
    this.chkFamiliar2.disable();
    const macRequest = new MACResponse();
    macRequest.descripcion = "";
    macRequest.nombreComercial = "";
    macRequest.busqueda = "1";

    this.macService.getBusquedaMac(macRequest).subscribe((response) => {
      this.listaMedicamentos = response.dataList;
    });
    this.listaParametroservice
      .listaParametro({ codigoGrupo: "81" })
      .subscribe((response) => {
        this.listaLinea = response.filtroParametro;
      });
    this.listaParametroservice
      .listaParametro({ codigoGrupo: "82" })
      .subscribe((response) => {
        this.listaRespuesta.solido = response.filtroParametro.filter(
          (el) => el.codigoExterno == "367"
        );
        this.listaRespuesta.linfoma = response.filtroParametro.filter(
          (el) => el.codigoExterno == "372"
        );
        this.listaRespuesta.mieloma = response.filtroParametro.filter(
          (el) => el.codigoExterno == "373"
        );
        this.listaRespuesta.leucemia = response.filtroParametro.filter(
          (el) => el.codigoExterno == "374"
        );
        this.listaRespuesta.mielodisplasico = response.filtroParametro.filter(
          (el) => el.codigoExterno == "375"
        );
        this.listaRespuesta.mieloprofilerativoTrombo =
          response.filtroParametro.filter((el) => el.codigoExterno == "386");
        this.listaRespuesta.mieloprofilerativoTrombo2 =
          response.filtroParametro.filter((el) => el.codigoExterno == "387");
        this.listaRespuesta.mieloprofilerativoFibrosis =
          response.filtroParametro.filter((el) => el.codigoExterno == "388");
        this.listaRespuesta.mieloprofilerativoLeucemia =
          response.filtroParametro.filter((el) => el.codigoExterno == "389");
      });
    this.listaParametroservice
      .listaParametro({ codigoGrupo: "83" })
      .subscribe((response) => {
        this.listaLugarMieldi = response.filtroParametro.filter(
          (el) => el.codigoExterno == "375"
        );
        this.listaLugarLin = response.filtroParametro.filter(
          (el) => el.codigoExterno == "372"
        );
        this.listaLugarMielo = response.filtroParametro.filter(
          (el) => el.codigoExterno == "373"
        );
        this.listaLugarLeu = response.filtroParametro.filter(
          (el) => el.codigoExterno == "374"
        );
      });
    this.listaParametroservice
      .listaParametro({ codigoGrupo: "84" })
      .subscribe((response) => {
        this.listaMotivo = response.filtroParametro;
      });
    this.listaParametroservice
      .listaParametro({ codigoGrupo: "76" })
      .subscribe((response) => {
        this.listaTumorLiquido = response.filtroParametro;
      });
    this.listaParametroservice
      .listaParametro({ codigoGrupo: "80" })
      .subscribe((response) => {
        this.listaTumorLiquidoMielo = response.filtroParametro;
      });

    this.desactivarTratamientos();
    this.lecturaFormAntecPersGine();
  }

  desactivarTratamientos() {
    this.desactivarArray(this.tpCirugiaArray);
    this.desactivarArray(this.tratamientoPrevioRadioterapia.controls.adyuvante);
    this.desactivarArray(
      this.tratamientoPrevioRadioterapia.controls.neoAdyuvante
    );
    this.desactivarArray(this.tratamientoPrevioRadioterapia.controls.paliativa);
    this.desactivarArray(this.tratamientoPrevioPaliativo.controls.dolor);
    this.desactivarArray(this.tratamientoPrevioPaliativo.controls.compasivo);
    this.desactivarArray(
      this.tratamientoPrevioAntineoplasica.controls.adyuvante
    );
    this.desactivarArray(
      this.tratamientoPrevioAntineoplasica.controls.neoAdyuvante
    );
    this.desactivarArray(
      this.tratamientoPrevioAntineoplasica.controls.metastasico
    );

    this.tratamientoPrevioAntineoplasica.controls.solido.disable();
    this.tratamientoPrevioAntineoplasica.controls.noSolido.disable();
    // @ts-ignore
    // prettier-ignore
    this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls.mantenimiento);
    // @ts-ignore
    // prettier-ignore
    this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls.lineas_tto);
    // @ts-ignore
    // prettier-ignore
    this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.induccion);
    // @ts-ignore
    // prettier-ignore
    this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.mantenimiento);
    // @ts-ignore
    // prettier-ignore
    this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.relapso);
    // @ts-ignore
    // prettier-ignore
    this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.induccion);
    // @ts-ignore
    // prettier-ignore
    this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.mantenimiento);
    // @ts-ignore
    // prettier-ignore
    this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.consolidacion);
    // @ts-ignore
    // prettier-ignore
    this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.relapso);
    // @ts-ignore
    // prettier-ignore
    this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttMielodisplasico.controls.lineas_tto);
    // @ts-ignore
    // prettier-ignore
    this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloprofilerativo.controls.lineas_tto);
  }

  existsInArray(arr = [], item) {
    if (arr) {
      return arr.includes(item + "");
    }
    return false;
  }

  desactivarGrupo(form: FormGroup) {
    const keys = Object.keys(form.value);
    keys.forEach((el) => {
      form.get(el).disable();
    });
  }
  desactivarGrupo2(form: FormGroup) {
    const keys = Object.keys(form.value);
    keys.forEach((el) => {
      form.get(el).disable();
    });
  }

  desactivarArray(arr) {
    arr.controls.forEach((el) => {
      this.desactivarGrupo(el);
    });
  }
  activarArray(arr) {
    arr.controls.forEach((el) => {
      ////
      ///"---------------------------------------------------------------------------"
      ///);
      ///
      ///
      if (el.value.aplica === true || el.value.aplica == undefined) {
        this.activarGrupo(el);
      } else {
        el.controls.aplica.enable();
      }
    });
  }

  activarGrupo(form: FormGroup) {
    const keys = Object.keys(form.value);
    keys.forEach((el) => {
      form.get(el).enable();
    });
  }

  imprimir(msg) {
    this.onSubmitTratamiento();
  }

  createForm() {
    this.antecedentesFrmGrp = new FormGroup({
      menarquia: this.menarquia,
      gestaciones: this.gestaciones,
      nro_hijos: this.nro_hijos,
      fur: this.fur,
      abortos: this.abortos,
      anticoceptivo: this.anticoceptivo,
      observaciones: this.observaciones,
      aplica1: this.aplica1,
      noAplica1: this.noAplica1,
    });

    // previo
    this.tpCirugiaArray = new FormArray([
      new FormGroup({
        fecha: new FormControl(""),
        tipo: new FormControl(""),
        hallazgo: new FormControl(""),
      }),
    ]);

    this.tratamientoPrevioCirugia = new FormGroup({
      aplica5: this.aplica5,
      noAplica5: this.noAplica5,
      datos_cirugia: this.tpCirugiaArray,
    });

    this.tratamientoPrevioRadioterapia = new FormGroup({
      aplica: this.aplica6,
      noAplica: this.noAplica6,
      adyuvante: new FormArray([
        new FormGroup({
          region: new FormControl(""),
          fecha_inicio: new FormControl(""),
          tipo_dosis: new FormControl(""),
          fecha_fin: new FormControl(""),
          aplica: new FormControl(false),
          observaciones: new FormControl(""),
        }),
      ]),
      neoAdyuvante: new FormArray([
        new FormGroup({
          region: new FormControl(""),
          fecha_inicio: new FormControl(""),
          tipo_dosis: new FormControl(""),
          fecha_fin: new FormControl(""),
          aplica: new FormControl(false),
          observaciones: new FormControl(""),
        }),
      ]),
      paliativa: new FormArray([
        new FormGroup({
          region: new FormControl(""),
          fecha_inicio: new FormControl(""),
          tipo_dosis: new FormControl(""),
          fecha_fin: new FormControl(""),
          aplica: new FormControl(false),
          observaciones: new FormControl(""),
        }),
      ]),
    });

    this.tratamientoPrevioPaliativo = new FormGroup({
      aplica: this.aplica7,
      noAplica: this.noAplica7,
      dolor: new FormArray([
        new FormGroup({
          dosis: new FormControl(""),
          tipo: new FormControl(""),
          fecha_inicio: new FormControl(""),
          fecha_fin: new FormControl(""),
          aplica: new FormControl(false),
          observaciones: new FormControl(""),
        }),
      ]),
      compasivo: new FormArray([
        new FormGroup({
          tipo: new FormControl(""),
          fecha_inicio: new FormControl(""),
          dosis: new FormControl(""),
          fecha_fin: new FormControl(""),
          aplica: new FormControl(false),
          observaciones: new FormControl(""),
        }),
      ]),
    });
    this.tratamientoPrevioAntineoplasica = new FormGroup({
      aplica: this.aplica8,
      noAplica: this.noAplica8,
      solido: this.solido,
      noSolido: this.noSolido,
      tipo: new FormControl(null),
      adyuvante: new FormArray([
        new FormGroup({
          fecha_inicio: new FormControl(""),
          fecha_fin: new FormControl(""),
          aplica: new FormControl(false),
          medicamento: new FormControl(""),
          otros: new FormControl(""),
          n_cursos: new FormControl(""),
          respuesta_alcanzada: new FormControl(""),
          lugar: new FormControl(""),
          mot_inac: new FormControl(""),
          medico_tratante: new FormControl(""),
          observaciones: new FormControl(""),
        }),
      ]),
      neoAdyuvante: new FormArray([
        new FormGroup({
          fecha_inicio: new FormControl(""),
          fecha_fin: new FormControl(""),
          aplica: new FormControl(false),
          medicamento: new FormControl(""),
          respuesta_alcanzada: new FormControl(""),
          otros: new FormControl(""),
          n_cursos: new FormControl(""),
          lugar: new FormControl(""),
          mot_inac: new FormControl(""),
          medico_tratante: new FormControl(""),
          observaciones: new FormControl(""),
        }),
      ]),
      metastasico: new FormArray([
        new FormGroup({
          fecha_inicio: new FormControl(""),
          fecha_fin: new FormControl(""),
          aplica: new FormControl(false),
          respuesta_alcanzada: new FormControl(""),
          medicamento: new FormControl(""),
          lineas_tratamiento: new FormControl(""),
          otros: new FormControl(""),
          n_cursos: new FormControl(""),
          lugar: new FormControl(""),
          mot_inac: new FormControl(""),
          medico_tratante: new FormControl(""),
          observaciones: new FormControl(""),
        }),
      ]),
      ttLinfoma: new FormGroup({
        mantenimiento: new FormArray([
          new FormGroup({
            fecha_inicio: new FormControl(""),
            fecha_fin: new FormControl(""),
            aplica: new FormControl(false),
            medicamento: new FormControl(""),
            respuesta_alcanzada: new FormControl(""),
            otros: new FormControl(""),
            organo: new FormControl(""),
            n_cursos: new FormControl(""),
            lugar: new FormControl(""),
            mot_inac: new FormControl(""),
            medico_tratante: new FormControl(""),
            observaciones: new FormControl(""),
          }),
        ]),
        lineas_tto: new FormArray([
          new FormGroup({
            lineas_tratamiento: new FormControl(""),
            fecha_inicio: new FormControl(""),
            fecha_fin: new FormControl(""),
            aplica: new FormControl(false),
            medicamento: new FormControl(""),
            respuesta_alcanzada: new FormControl(""),
            otros: new FormControl(""),
            organo: new FormControl(""),
            n_cursos: new FormControl(""),
            lugar: new FormControl(""),
            mot_inac: new FormControl(""),
            medico_tratante: new FormControl(""),
            observaciones: new FormControl(""),
          }),
        ]),
      }),
      ttMieloma: new FormGroup({
        induccion: new FormArray([
          new FormGroup({
            fecha_inicio: new FormControl(""),
            fecha_fin: new FormControl(""),
            aplica: new FormControl(false),
            respuesta_alcanzada: new FormControl(""),
            medicamento: new FormControl(""),
            otros: new FormControl(""),
            n_cursos: new FormControl(""),
            organo: new FormControl(""),
            lugar: new FormControl(""),
            mot_inac: new FormControl(""),
            medico_tratante: new FormControl(""),
            observaciones: new FormControl(""),
          }),
        ]),
        mantenimiento: new FormArray([
          new FormGroup({
            fecha_inicio: new FormControl(""),
            fecha_fin: new FormControl(""),
            aplica: new FormControl(false),
            medicamento: new FormControl(""),
            respuesta_alcanzada: new FormControl(""),
            otros: new FormControl(""),
            n_cursos: new FormControl(""),
            organo: new FormControl(""),
            lugar: new FormControl(""),
            mot_inac: new FormControl(""),
            medico_tratante: new FormControl(""),
            observaciones: new FormControl(""),
          }),
        ]),
        relapso: new FormArray([
          new FormGroup({
            fecha_inicio: new FormControl(""),
            fecha_fin: new FormControl(""),
            aplica: new FormControl(false),
            medicamento: new FormControl(""),
            otros: new FormControl(""),
            n_cursos: new FormControl(""),
            respuesta_alcanzada: new FormControl(""),
            organo: new FormControl(""),
            lugar: new FormControl(""),
            mot_inac: new FormControl(""),
            medico_tratante: new FormControl(""),
            observaciones: new FormControl(""),
          }),
        ]),
      }),
      ttLeucemia: new FormGroup({
        induccion: new FormArray([
          new FormGroup({
            fecha_inicio: new FormControl(""),
            fecha_fin: new FormControl(""),
            aplica: new FormControl(false),
            medicamento: new FormControl(""),
            otros: new FormControl(""),
            n_cursos: new FormControl(""),
            respuesta_alcanzada: new FormControl(""),
            lugar: new FormControl(""),
            organo: new FormControl(""),
            mot_inac: new FormControl(""),
            medico_tratante: new FormControl(""),
            observaciones: new FormControl(""),
          }),
        ]),
        mantenimiento: new FormArray([
          new FormGroup({
            fecha_inicio: new FormControl(""),
            fecha_fin: new FormControl(""),
            aplica: new FormControl(false),
            medicamento: new FormControl(""),
            respuesta_alcanzada: new FormControl(""),
            otros: new FormControl(""),
            n_cursos: new FormControl(""),
            organo: new FormControl(""),
            lugar: new FormControl(""),
            mot_inac: new FormControl(""),
            medico_tratante: new FormControl(""),
            observaciones: new FormControl(""),
          }),
        ]),
        consolidacion: new FormArray([
          new FormGroup({
            fecha_inicio: new FormControl(""),
            fecha_fin: new FormControl(""),
            respuesta_alcanzada: new FormControl(""),
            aplica: new FormControl(false),
            medicamento: new FormControl(""),
            organo: new FormControl(""),
            otros: new FormControl(""),
            n_cursos: new FormControl(""),
            lugar: new FormControl(""),
            mot_inac: new FormControl(""),
            medico_tratante: new FormControl(""),
            observaciones: new FormControl(""),
          }),
        ]),
        relapso: new FormArray([
          new FormGroup({
            fecha_inicio: new FormControl(""),
            fecha_fin: new FormControl(""),
            aplica: new FormControl(false),
            medicamento: new FormControl(""),
            respuesta_alcanzada: new FormControl(""),
            otros: new FormControl(""),
            n_cursos: new FormControl(""),
            organo: new FormControl(""),
            lugar: new FormControl(""),
            mot_inac: new FormControl(""),
            medico_tratante: new FormControl(""),
            observaciones: new FormControl(""),
          }),
        ]),
      }),
      ttMielodisplasico: new FormGroup({
        lineas_tto: new FormArray([
          new FormGroup({
            n_lineas: new FormControl(""),
            fecha_inicio: new FormControl(""),
            fecha_fin: new FormControl(""),
            aplica: new FormControl(false),
            medicamento: new FormControl(""),
            otros: new FormControl(""),
            lugar: new FormControl(""),
            organo: new FormControl(""),
            n_cursos: new FormControl(""),
            respuesta_alcanzada: new FormControl(""),
            transformacion_leucemia: new FormControl(false),
            mot_inac: new FormControl(""),
            medico_tratante: new FormControl(""),
            observaciones: new FormControl(""),
          }),
        ]),
      }),
      ttMieloprofilerativo: new FormGroup({
        tipo_terapia: new FormControl("386"),
        lineas_tto: new FormArray([
          new FormGroup({
            n_lineas: new FormControl(""),
            lugar: new FormControl(""),
            fecha_inicio: new FormControl(""),
            fecha_fin: new FormControl(""),
            aplica: new FormControl(false),
            medicamento: new FormControl(""),
            otros: new FormControl(""),
            organo: new FormControl(""),
            n_cursos: new FormControl(""),
            respuesta_alcanzada: new FormControl(""),
            transformacion_leucemia: new FormControl(false),
            mot_inac: new FormControl(""),
            medico_tratante: new FormControl(""),
            observaciones: new FormControl(""),
          }),
        ]),
      }),
    });

    // fin previo

    this.antecedentesPatPersonalesFrmGrp = new FormGroup({
      hta: this.hta,
      ima_icc: this.ima_icc,
      reumatologicas: this.reumatologicas,
      dim: this.dim,
      epoc_epid: this.epoc_epid,
      endocrinopatias: this.endocrinopatias,
      asma: this.asma,
      ram: this.ram,
      otros: this.otros,
      habitos_nocivos: this.habitos_nocivos,
      aplica2: this.aplica2,
      noAplica2: this.noAplica2,
    });

    this.antecedentesOncoPersonalesFrmGrp = new FormGroup({
      aplica3: this.aplica3,
      noAplica3: this.noAplica3,
    });

    this.antecedentesOncoFamFrmGrp = new FormGroup({
      aplica4: this.aplica4,
      noAplica4: this.noAplica4,
    });

    this.antecedentesOtros = new FormGroup({
      otros_onco_fami: this.otros_onco_fami,
    });
  }
  createFormControls() {
    this.menarquia = new FormControl("");
    this.gestaciones = new FormControl("");
    this.nro_hijos = new FormControl("");
    this.fur = new FormControl("");
    this.abortos = new FormControl("");
    this.anticoceptivo = new FormControl("");
    this.observaciones = new FormControl("");
    this.hta = new FormControl("");
    this.ima_icc = new FormControl("");
    this.reumatologicas = new FormControl("");
    this.dim = new FormControl("");
    this.epoc_epid = new FormControl("");
    this.endocrinopatias = new FormControl("");
    this.asma = new FormControl("");
    this.ram = new FormControl("");
    this.otros = new FormControl("");
    this.habitos_nocivos = new FormControl("");
    this.aplica1 = new FormControl(false);
    this.noAplica1 = new FormControl(true);
    this.aplica2 = new FormControl(false);
    this.noAplica2 = new FormControl(true);
    this.aplica3 = new FormControl(false);
    this.noAplica3 = new FormControl(true);

    this.aplica4 = new FormControl(false);
    this.noAplica4 = new FormControl(true);
    this.aplica5 = new FormControl(false);
    this.noAplica5 = new FormControl(true);
    this.aplica6 = new FormControl(false);
    this.noAplica6 = new FormControl(true);
    this.aplica7 = new FormControl(false);
    this.noAplica7 = new FormControl(true);
    this.aplica8 = new FormControl(false);
    this.noAplica8 = new FormControl(true);
    this.solido = new FormControl(false);
    this.noSolido = new FormControl(true);
    this.otros_onco_fami = new FormControl("");
  }

  changeAdyuvante(event, adyuvante) {
    ///
    ///
    if (event.checked) {
      adyuvante.enable();
    } else {
      this.desactivarGrupo2(adyuvante);
    }
    adyuvante.controls.aplica.enable();
  }

  public onSubmitTratamiento() {
    const radioterapiaItems = {
      condicion: this.tratamientoPrevioRadioterapia.value.aplica,
      modificado: false,
      trat_radio_adyuvante: [],
      trat_radio_neoadyuvante: [],
      trat_radio_paliativa: [],
    };
    const paleativaItems = {
      condicion: this.tratamientoPrevioPaliativo.value.aplica,
      modificado: false,

      trat_paliativo_dolor: [],
      trat_paliativo_compasivo: [],
    };
    const antineoplasicoItems = {
      condicion: this.tratamientoPrevioAntineoplasica.value.aplica,
      modificado: false,

      trat_ta_tum_solido: [],
      trat_ta_tum_liquido: {
        terap_antineo_tipo_tumor: 368,
        trat_ta_tl_linfoma: [],
        trat_ta_tl_mieloma: [],
        trat_ta_tl_leucemia: [],
        trat_ta_tl_sindmielodisplasico: [],
        trat_ta_tl_sindmieloproliferativo: [],
      },
    };
    if (
      !this.tratamientoPrevioCirugia.value.aplica5 &&
      !this.tratamientoPrevioRadioterapia.value.aplica &&
      !this.tratamientoPrevioPaliativo.value.aplica &&
      !this.tratamientoPrevioAntineoplasica.value.aplica
    ) {
      this.mensaje = "LOS FORMULARIOS ESTAN SIN DATOS";
      this.openDialogMensaje(this.mensaje, null, true, false, null);
      return false;
    }

    if (this.tratamientoPrevioRadioterapia.value.aplica) {
      if (
        this.revisarArrayVacio(
          this.tratamientoPrevioRadioterapia.value.adyuvante
        ) ||
        this.revisarArrayVacio(
          this.tratamientoPrevioRadioterapia.value.neoAdyuvante
        ) ||
        this.revisarArrayVacio(
          this.tratamientoPrevioRadioterapia.value.paliativa
        )
      ) {
        this.mensaje = "LOS FORMULARIOS EN RADIOTERAPIA ESTAN SIN DATOS";
        this.openDialogMensaje(this.mensaje, null, true, false, null);
        return false;
      } else {
        this.tratamientoPrevioRadioterapia.value.adyuvante.forEach((el) => {
          if (el.aplica) {
            radioterapiaItems.trat_radio_adyuvante.push({
              tipoRad: 362,
              regionTrat: el.region,
              fechIni: el.fecha_inicio,
              tipoDosis: el.tipo_dosis,
              fechFin: el.fecha_fin,
              observaciones: el.observaciones,
            });
          }
        });
        this.tratamientoPrevioRadioterapia.value.neoAdyuvante.forEach((el) => {
          if (el.aplica) {
            radioterapiaItems.trat_radio_neoadyuvante.push({
              tipoRad: 363,
              regionTrat: el.region,
              tipoDosis: el.tipo_dosis,
              fechIni: el.fecha_inicio,
              fechFin: el.fecha_fin,
              observaciones: el.observaciones,
            });
          }
        });
        this.tratamientoPrevioRadioterapia.value.paliativa.forEach((el) => {
          if (el.aplica) {
            radioterapiaItems.trat_radio_paliativa.push({
              tipoRad: 364,
              regionTrat: el.region,
              fechIni: el.fecha_inicio,
              tipoDosis: el.tipo_dosis,
              fechFin: el.fecha_fin,
              observaciones: el.observaciones,
            });
          }
        });
      }
    }

    if (this.tratamientoPrevioPaliativo.value.aplica) {
      if (
        this.revisarArrayVacio(this.tratamientoPrevioPaliativo.value.dolor) ||
        this.revisarArrayVacio(this.tratamientoPrevioPaliativo.value.compasivo)
      ) {
        this.mensaje = "LOS FORMULARIOS EN PALEATIVO ESTAN SIN DATOS";
        this.openDialogMensaje(this.mensaje, null, true, false, null);
        return false;
      }
    }

    const some = this.tpCirugiaArray.value.filter((el) => {
      if (
        !el.fecha &&
        !el.tipo &&
        !el.hallazgo &&
        this.tratamientoPrevioCirugia.value.aplica5 == true
      ) {
        return false;
      }
      return true;
    });
    if (some.length == 0) {
      this.mensaje = "CIRUGIA TIENE CAMPOS INCOMPLETOS";
      this.openDialogMensaje(this.mensaje, null, true, false, null);
      this.spinnerService.hide();
      return false;
    }

    if (
      this.tratamientoPrevioRadioterapia.value.aplica &&
      this.tratamientoPrevioRadioterapia.value.adyuvante.filter(
        (el) => el.aplica == true
      ).length == 0 &&
      this.tratamientoPrevioRadioterapia.value.neoAdyuvante.filter(
        (el) => el.aplica == true
      ).length == 0 &&
      this.tratamientoPrevioRadioterapia.value.paliativa.filter(
        (el) => el.aplica == true
      ).length == 0
    ) {
      this.mensaje = "NO SE SELECCIONO NINGUN TRATAMIENTO EN RADIOTERAPIA";
      this.openDialogMensaje(this.mensaje, null, true, false, null);
      this.spinnerService.hide();
      return false;
    }
    if (this.tratamientoPrevioPaliativo.value.aplica) {
      if (
        this.tratamientoPrevioPaliativo.value.dolor.filter(
          (el) => el.aplica == true
        ).length == 0 &&
        this.tratamientoPrevioPaliativo.value.compasivo.filter(
          (el) => el.aplica == true
        ).length == 0
      ) {
        this.mensaje = "NO SE SELECCIONO NINGUN TRATAMIENTO EN PALIATIVO";
        this.openDialogMensaje(this.mensaje, null, true, false, null);
        this.spinnerService.hide();
        return false;
      } else {
        this.tratamientoPrevioPaliativo.value.dolor.forEach((el) => {
          if (el.aplica) {
            paleativaItems.trat_paliativo_dolor.push({
              tipPali: 365,
              fechIni: el.fecha_inicio,
              fechFin: el.fecha_fin,
              tipo: el.tipo,
              dosis: el.dosis,
              observaciones: el.observaciones,
            });
          }
        });
        this.tratamientoPrevioPaliativo.value.compasivo.forEach((el) => {
          if (el.aplica) {
            paleativaItems.trat_paliativo_compasivo.push({
              tipPali: 366,
              fechIni: el.fecha_inicio,
              fechFin: el.fecha_fin,
              tipo: el.tipo,
              dosis: el.dosis,
              observaciones: el.observaciones,
            });
          }
        });
      }
    }

    // radioterapia

    if (this.tratamientoPrevioAntineoplasica.value.aplica) {
      if (this.tratamientoPrevioAntineoplasica.value.solido) {
        if (
          this.tratamientoPrevioAntineoplasica.value.solido &&
          !this.validarAplicas(
            this.tratamientoPrevioAntineoplasica.value.adyuvante
          ) &&
          !this.validarAplicas(
            this.tratamientoPrevioAntineoplasica.value.neoAdyuvante
          ) &&
          !this.validarAplicas(
            this.tratamientoPrevioAntineoplasica.value.metastasico
          )
        ) {
          this.mensaje =
            "LOS FORMULARIOS EN ANTINEOPLASICO ESTAN SIN DATOS (TUMOR SOLIDO)";
          this.openDialogMensaje(this.mensaje, null, true, false, null);
          return false;
        }
        if (
          this.revisarArrayVacio(
            this.tratamientoPrevioAntineoplasica.value.adyuvante
          ) ||
          this.revisarArrayVacio(
            this.tratamientoPrevioAntineoplasica.value.neoAdyuvante
          ) ||
          this.revisarArrayVacio(
            this.tratamientoPrevioAntineoplasica.value.metastasico
          )
        ) {
          this.mensaje = "LOS FORMULARIOS EN ANTINEOPLASICO ESTAN SIN DATOS";
          this.openDialogMensaje(this.mensaje, null, true, false, null);
          return false;
        }
        this.tratamientoPrevioAntineoplasica.value.adyuvante.forEach((el) => {
          if (el.aplica) {
            antineoplasicoItems.trat_ta_tum_solido.push({
              fechIni: el.fecha_inicio,
              fechFin: el.fecha_fin,
              terap_antineo_tipo_solido: "369",
              terap_antineo_tipo_tumor: "367",
              medicamento: el.medicamento,
              espc_otros: el.otros,
              num_cursos: el.n_cursos,
              lug_recu: el.lugar,
              estado_trat: true,
              mot_inac: el.mot_inac,
              med_trat: el.medico_tratante,
              observaciones: el.observaciones,
              resp_alc: el.respuesta_alcanzada,
            });
          }
        });
        this.tratamientoPrevioAntineoplasica.value.neoAdyuvante.forEach(
          (el) => {
            if (el.aplica) {
              antineoplasicoItems.trat_ta_tum_solido.push({
                fechIni: el.fecha_inicio,
                fechFin: el.fecha_fin,
                estado_trat: true,
                medicamento: el.medicamento,
                espc_otros: el.otros,
                terap_antineo_tipo_solido: "370",
                terap_antineo_tipo_tumor: "367",
                num_cursos: el.n_cursos,
                lug_recu: el.lugar,
                resp_alc: el.respuesta_alcanzada,
                mot_inac: el.mot_inac,
                med_trat: el.medico_tratante,
                observaciones: el.observaciones,
              });
            }
          }
        );
        this.tratamientoPrevioAntineoplasica.value.metastasico.forEach((el) => {
          if (el.aplica) {
            antineoplasicoItems.trat_ta_tum_solido.push({
              fechIni: el.fecha_inicio,
              estado_trat: true,
              fechFin: el.fecha_fin,
              medicamento: el.medicamento,
              espc_otros: el.otros,
              lin_tratamiento: el.lineas_tratamiento,
              num_cursos: el.n_cursos,
              lug_recu: el.lugar,
              terap_antineo_tipo_solido: "371",
              terap_antineo_tipo_tumor: "367",
              resp_alc: el.respuesta_alcanzada,
              mot_inac: el.mot_inac,
              med_trat: el.medico_tratante,
              observaciones: el.observaciones,
            });
          }
        });
      } else {
        if (
          !this.tratamientoPrevioAntineoplasica.value.solido &&
          !this.tratamientoPrevioAntineoplasica.value.tipo
        ) {
          this.mensaje =
            "LOS FORMULARIOS EN ANTINEOPLASICO ESTAN SIN DATOS (TUMOR LIQUIDO)";
          this.openDialogMensaje(this.mensaje, null, true, false, null);
          return false;
        }
        switch (this.tratamientoPrevioAntineoplasica.value.tipo) {
          case "372": {
            if (
              !this.tratamientoPrevioAntineoplasica.value.solido &&
              !this.validarAplicas(
                this.tratamientoPrevioAntineoplasica.value.ttLinfoma
                  .mantenimiento
              ) &&
              !this.validarAplicas(
                this.tratamientoPrevioAntineoplasica.value.ttLinfoma.lineas_tto
              )
            ) {
              this.mensaje =
                "LOS FORMULARIOS EN ANTINEOPLASICO ESTAN SIN DATOS (TUMOR LIQUIDO)";
              this.openDialogMensaje(this.mensaje, null, true, false, null);
              return false;
            }
            if (
              this.revisarArrayVacio(
                this.tratamientoPrevioAntineoplasica.value.ttLinfoma
                  .mantenimiento
              ) ||
              this.revisarArrayVacio(
                this.tratamientoPrevioAntineoplasica.value.ttLinfoma.lineas_tto
              )
            ) {
              this.mensaje =
                "LOS FORMULARIOS TRATAMIENTO DE LINFOMA ESTAN SIN DATOS";
              this.openDialogMensaje(this.mensaje, null, true, false, null);
              return false;
            }

            this.tratamientoPrevioAntineoplasica.value.ttLinfoma.mantenimiento.forEach(
              (el) => {
                if (el.aplica) {
                  antineoplasicoItems.trat_ta_tum_liquido.trat_ta_tl_linfoma.push(
                    {
                      fechIni: el.fecha_inicio,
                      fechFin: el.fecha_fin,
                      terap_antineo_tipo_liquido: "372",
                      terap_antineo_tipo_linfo: "377",
                      medicamento: el.medicamento,
                      estado_trat: true,
                      resp_alc: el.respuesta_alcanzada,
                      espc_otros: el.otros,
                      espc_org: el.organo,
                      num_cursos: el.n_cursos,
                      lug_recu: el.lugar,
                      mot_inac: el.mot_inac,
                      med_trat: el.medico_tratante,
                      observaciones: el.observaciones,
                    }
                  );
                }
              }
            );
            this.tratamientoPrevioAntineoplasica.value.ttLinfoma.lineas_tto.forEach(
              (el) => {
                if (el.aplica) {
                  antineoplasicoItems.trat_ta_tum_liquido.trat_ta_tl_linfoma.push(
                    {
                      lin_tratamiento: el.lineas_tratamiento,
                      fechIni: el.fecha_inicio,
                      espc_org: el.organo,
                      terap_antineo_tipo_liquido: "372",
                      terap_antineo_tipo_linfo: "378",
                      estado_trat: true,

                      fechFin: el.fecha_fin,
                      medicamento: el.medicamento,
                      resp_alc: el.respuesta_alcanzada,
                      espc_otros: el.otros,
                      num_cursos: el.n_cursos,
                      lug_recu: el.lugar,
                      mot_inac: el.mot_inac,
                      med_trat: el.medico_tratante,
                      observaciones: el.observaciones,
                    }
                  );
                }
              }
            );
            break;
          }
          case "373": {
            if (
              this.tratamientoPrevioAntineoplasica.value.noSolido &&
              !this.validarAplicas(
                this.tratamientoPrevioAntineoplasica.value.ttMieloma.induccion
              ) &&
              !this.validarAplicas(
                this.tratamientoPrevioAntineoplasica.value.ttMieloma
                  .mantenimiento
              ) &&
              !this.validarAplicas(
                this.tratamientoPrevioAntineoplasica.value.ttMieloma.relapso
              )
            ) {
              this.mensaje =
                "LOS FORMULARIOS EN ANTINEOPLASICO ESTAN SIN DATOS (TUMOR LIQUIDO)";
              this.openDialogMensaje(this.mensaje, null, true, false, null);
              return false;
            }
            if (
              this.revisarArrayVacio(
                this.tratamientoPrevioAntineoplasica.value.ttMieloma.induccion
              ) ||
              this.revisarArrayVacio(
                this.tratamientoPrevioAntineoplasica.value.ttMieloma
                  .mantenimiento
              ) ||
              this.revisarArrayVacio(
                this.tratamientoPrevioAntineoplasica.value.ttMieloma.relapso
              )
            ) {
              this.mensaje =
                "LOS FORMULARIOS TRATAMIENTO DE MIELOMA ESTAN SIN DATOS";
              this.openDialogMensaje(this.mensaje, null, true, false, null);
              return false;
            }
            this.tratamientoPrevioAntineoplasica.value.ttMieloma.induccion.forEach(
              (el) => {
                if (el.aplica) {
                  antineoplasicoItems.trat_ta_tum_liquido.trat_ta_tl_mieloma.push(
                    {
                      fechIni: el.fecha_inicio,
                      fechFin: el.fecha_fin,
                      estado_trat: true,
                      medicamento: el.medicamento,
                      resp_alc: el.respuesta_alcanzada,
                      espc_org: el.organo,
                      espc_otros: el.otros,
                      num_cursos: el.n_cursos,
                      terap_antineo_tipo_liquido: "373",
                      terap_antineo_tipo_mielo: "379",
                      lug_recu: el.lugar,
                      mot_inac: el.mot_inac,
                      med_trat: el.medico_tratante,
                      observaciones: el.observaciones,
                    }
                  );
                }
              }
            );
            this.tratamientoPrevioAntineoplasica.value.ttMieloma.mantenimiento.forEach(
              (el) => {
                if (el.aplica) {
                  antineoplasicoItems.trat_ta_tum_liquido.trat_ta_tl_mieloma.push(
                    {
                      fechIni: el.fecha_inicio,
                      fechFin: el.fecha_fin,
                      medicamento: el.medicamento,
                      resp_alc: el.respuesta_alcanzada,
                      estado_trat: true,
                      espc_org: el.organo,
                      espc_otros: el.otros,
                      num_cursos: el.n_cursos,
                      terap_antineo_tipo_liquido: "373",
                      terap_antineo_tipo_mielo: "380",
                      lug_recu: el.lugar,
                      mot_inac: el.mot_inac,
                      med_trat: el.medico_tratante,
                      observaciones: el.observaciones,
                    }
                  );
                }
              }
            );
            this.tratamientoPrevioAntineoplasica.value.ttMieloma.relapso.forEach(
              (el) => {
                if (el.aplica) {
                  antineoplasicoItems.trat_ta_tum_liquido.trat_ta_tl_mieloma.push(
                    {
                      fechIni: el.fecha_inicio,
                      fechFin: el.fecha_fin,
                      medicamento: el.medicamento,
                      resp_alc: el.respuesta_alcanzada,
                      estado_trat: true,
                      espc_otros: el.otros,
                      num_cursos: el.n_cursos,
                      espc_org: el.organo,
                      terap_antineo_tipo_liquido: "373",
                      terap_antineo_tipo_mielo: "381",
                      lug_recu: el.lugar,
                      mot_inac: el.mot_inac,
                      med_trat: el.medico_tratante,
                      observaciones: el.observaciones,
                    }
                  );
                }
              }
            );
            break;
          }
          case "374": {
            if (
              this.tratamientoPrevioAntineoplasica.value.noSolido &&
              !this.validarAplicas(
                this.tratamientoPrevioAntineoplasica.value.ttLeucemia.induccion
              ) &&
              !this.validarAplicas(
                this.tratamientoPrevioAntineoplasica.value.ttLeucemia
                  .mantenimiento
              ) &&
              !this.validarAplicas(
                this.tratamientoPrevioAntineoplasica.value.ttLeucemia
                  .consolidacion
              ) &&
              !this.validarAplicas(
                this.tratamientoPrevioAntineoplasica.value.ttLeucemia.relapso
              )
            ) {
              this.mensaje =
                "LOS FORMULARIOS EN ANTINEOPLASICO ESTAN SIN DATOS (TUMOR LIQUIDO)";
              this.openDialogMensaje(this.mensaje, null, true, false, null);
              return false;
            }
            if (
              this.revisarArrayVacio(
                this.tratamientoPrevioAntineoplasica.value.ttLeucemia.induccion
              ) ||
              this.revisarArrayVacio(
                this.tratamientoPrevioAntineoplasica.value.ttLeucemia
                  .mantenimiento
              ) ||
              this.revisarArrayVacio(
                this.tratamientoPrevioAntineoplasica.value.ttLeucemia
                  .consolidacion
              ) ||
              this.revisarArrayVacio(
                this.tratamientoPrevioAntineoplasica.value.ttLeucemia.relapso
              )
            ) {
              this.mensaje =
                "LOS FORMULARIOS TRATAMIENTO DE LEUCEMIA ESTAN SIN DATOS";
              this.openDialogMensaje(this.mensaje, null, true, false, null);
              return false;
            }
            this.tratamientoPrevioAntineoplasica.value.ttLeucemia.induccion.forEach(
              (el) => {
                if (el.aplica) {
                  antineoplasicoItems.trat_ta_tum_liquido.trat_ta_tl_leucemia.push(
                    {
                      fechIni: el.fecha_inicio,
                      fechFin: el.fecha_fin,
                      estado_trat: true,
                      medicamento: el.medicamento,
                      resp_alc: el.respuesta_alcanzada,
                      espc_otros: el.otros,
                      num_cursos: el.n_cursos,
                      lug_recu: el.lugar,
                      terap_antineo_tipo_liquido: "374",
                      terap_antineo_tipo_leuce: "382",
                      mot_inac: el.mot_inac,
                      med_trat: el.medico_tratante,
                      observaciones: el.observaciones,
                    }
                  );
                }
              }
            );
            this.tratamientoPrevioAntineoplasica.value.ttLeucemia.mantenimiento.forEach(
              (el) => {
                if (el.aplica) {
                  antineoplasicoItems.trat_ta_tum_liquido.trat_ta_tl_leucemia.push(
                    {
                      fechIni: el.fecha_inicio,
                      fechFin: el.fecha_fin,
                      estado_trat: true,
                      medicamento: el.medicamento,
                      resp_alc: el.respuesta_alcanzada,
                      espc_otros: el.otros,
                      num_cursos: el.n_cursos,
                      lug_recu: el.lugar,
                      terap_antineo_tipo_liquido: "374",
                      terap_antineo_tipo_leuce: "383",
                      mot_inac: el.mot_inac,
                      med_trat: el.medico_tratante,
                      observaciones: el.observaciones,
                    }
                  );
                }
              }
            );
            this.tratamientoPrevioAntineoplasica.value.ttLeucemia.consolidacion.forEach(
              (el) => {
                if (el.aplica) {
                  antineoplasicoItems.trat_ta_tum_liquido.trat_ta_tl_leucemia.push(
                    {
                      fechIni: el.fecha_inicio,
                      fechFin: el.fecha_fin,
                      medicamento: el.medicamento,
                      resp_alc: el.respuesta_alcanzada,
                      estado_trat: true,
                      espc_otros: el.otros,
                      terap_antineo_tipo_liquido: "374",
                      terap_antineo_tipo_leuce: "384",
                      espc_org: el.organo,
                      num_cursos: el.n_cursos,
                      lug_recu: el.lugar,
                      mot_inac: el.mot_inac,
                      med_trat: el.medico_tratante,
                      observaciones: el.observaciones,
                    }
                  );
                }
              }
            );
            this.tratamientoPrevioAntineoplasica.value.ttLeucemia.relapso.forEach(
              (el) => {
                if (el.aplica) {
                  antineoplasicoItems.trat_ta_tum_liquido.trat_ta_tl_leucemia.push(
                    {
                      fechIni: el.fecha_inicio,
                      fechFin: el.fecha_fin,
                      medicamento: el.medicamento,
                      resp_alc: el.respuesta_alcanzada,
                      estado_trat: true,
                      espc_otros: el.otros,
                      terap_antineo_tipo_liquido: "374",
                      terap_antineo_tipo_leuce: "385",
                      num_cursos: el.n_cursos,
                      lug_recu: el.lugar,
                      espc_org: el.organo,
                      mot_inac: el.mot_inac,
                      med_trat: el.medico_tratante,
                      observaciones: el.observaciones,
                    }
                  );
                }
              }
            );
            break;
          }
          case "375": {
            if (
              this.tratamientoPrevioAntineoplasica.value.noSolido &&
              !this.validarAplicas(
                this.tratamientoPrevioAntineoplasica.value.ttMielodisplasico
                  .lineas_tto
              )
            ) {
              this.mensaje =
                "LOS FORMULARIOS EN ANTINEOPLASICO ESTAN SIN DATOS (TUMOR LIQUIDO)";
              this.openDialogMensaje(this.mensaje, null, true, false, null);
              return false;
            }
            if (
              this.revisarArrayVacio(
                this.tratamientoPrevioAntineoplasica.value.ttMielodisplasico
                  .lineas_tto
              )
            ) {
              this.mensaje =
                "LOS FORMULARIOS TRATAMIENTO DE MIELODISPLASICO ESTAN SIN DATOS";
              this.openDialogMensaje(this.mensaje, null, true, false, null);
              return false;
            }
            this.tratamientoPrevioAntineoplasica.value.ttMielodisplasico.lineas_tto.forEach(
              (el) => {
                if (el.aplica) {
                  antineoplasicoItems.trat_ta_tum_liquido.trat_ta_tl_sindmielodisplasico.push(
                    {
                      lin_tratamiento: el.n_lineas,
                      fechIni: el.fecha_inicio,
                      fechFin: el.fecha_fin,
                      medicamento: el.medicamento,
                      resp_alc: el.respuesta_alcanzada,
                      terap_antineo_tipo_liquido: "375",
                      trat_ta_tl_sindmielodisplasico: "",
                      estado_trat: true,
                      espc_otros: el.otros,
                      lug_recu: el.lugar,
                      num_cursos: el.n_cursos,
                      trans_leuc_aguda: el.transformacion_leucemia ? 1 : 0,
                      mot_inac: el.mot_inac,
                      med_trat: el.medico_tratante,
                      observaciones: el.observaciones,
                    }
                  );
                }
              }
            );
            break;
          }
          case "376": {
            if (
              this.tratamientoPrevioAntineoplasica.value.noSolido &&
              !this.validarAplicas(
                this.tratamientoPrevioAntineoplasica.value.ttMieloprofilerativo
                  .lineas_tto
              )
            ) {
              this.mensaje =
                "LOS FORMULARIOS EN ANTINEOPLASICO ESTAN SIN DATOS (TUMOR LIQUIDO)";
              this.openDialogMensaje(this.mensaje, null, true, false, null);
              return false;
            }
            if (
              this.revisarArrayVacio(
                this.tratamientoPrevioAntineoplasica.value.ttMieloprofilerativo
                  .lineas_tto
              )
            ) {
              this.mensaje =
                "LOS FORMULARIOS TRATAMIENTO DE MIELOPROFILERATIVO-OTROS ESTAN SIN DATOS";
              this.openDialogMensaje(this.mensaje, null, true, false, null);
              return false;
            }
            this.tratamientoPrevioAntineoplasica.value.ttMieloprofilerativo.lineas_tto.forEach(
              (el) => {
                if (el.aplica) {
                  antineoplasicoItems.trat_ta_tum_liquido.trat_ta_tl_sindmieloproliferativo.push(
                    {
                      lin_tratamiento: el.n_lineas,
                      fechIni: el.fecha_inicio,
                      fechFin: el.fecha_fin,
                      terap_antineo_tipo_mieloproliferativo:
                        this.tratamientoPrevioAntineoplasica.value
                          .ttMieloprofilerativo.tipo_terapia,
                      estado_trat: true,
                      medicamento: el.medicamento,
                      terap_antineo_tipo_liquido: "376",
                      resp_alc: el.respuesta_alcanzada,
                      espc_otros: el.otros,
                      num_cursos: el.n_cursos,
                      lug_recu: el.lugar,
                      trans_leuc_aguda: el.transformacion_leucemia,
                      mot_inac: el.mot_inac,
                      med_trat: el.medico_tratante,
                      observaciones: el.observaciones,
                    }
                  );
                }
              }
            );
            break;
          }
        }
      }
    }

    // paliativa

    const datosCirugia = this.tpCirugiaArray.value.map((el) => {
      return {
        condicion: this.tratamientoPrevioCirugia.value.aplica5,
        fecha: el.fecha,
        tipo_cirugia: el.tipo,
        hallazgos: el.hallazgo,
        modificado: false,
      };
    });

    const dataS = {
      trat_ciru: datosCirugia,
      trat_radio: radioterapiaItems,
      trat_paliativo: paleativaItems,
      trat_terap_antineoplasica: antineoplasicoItems,
      codigo_usu_trat: {
        estadoTrat: true,
        cod_evaluacion_trat: this.codSolEvaluacionFrmCtrl.value,
        cod_solben_trat: this.codScgSolbenFrmCtrl.value,
        cod_usuario_trat: this.userService.getCodUsuario,
        nombres_trat: this.userService.getNombres,
        apellido_paterno_trat: this.userService.getApelPaterno,
        apellido_materno_trat: this.userService.getApelMaterno,
        codigo_afiliado_trat: this.detEvaluacionFrmGrp.get("codAfiliadoFrmCtrl").value,
        nombClinica: this.infoSolben.clinica,
        diagnostico: this.infoSolben.diagnostico,
        tipoDoc: this.tipoDoc,
        numDoc: this.numDoc,
      },
    };

    if (localStorage.getItem("existeTratamientosPrevios") == "1") {
      this.mensaje = "Ya existe tratamientos previos.";
      this.openDialogMensaje(this.mensaje, null, true, false, null);
    } else {
      this.detalleServicioSolEva
        .registrarTratamientosPacientes(dataS)
        .subscribe(
          (data) => {
            this.mensaje = data["msgResultado"];

            this.openDialogMensaje(this.mensaje, null, true, false, null);

            // if (data.status === '0') {

            // } else {
            //   console.error(data);
            //   this.mensaje = 'No se logró obtener la información correctamente.';
            //   this.openDialogMensaje(this.mensaje, null, true, false, null);
            //   this.spinnerService.hide();
            // }
          },
          (error) => {
            console.error(error);

            this.mensaje = error;
            this.openDialogMensaje(this.mensaje, null, true, false, null);
            this.spinnerService.hide();
          }
        );
    }
  }

  public inicializarVariables(): void {
    this.step = 0;
    this.step2 = 0;

    this.codSolEvaluacion = this.solicitud.numeroSolEvaluacion;
    this.codMac = this.solicitud.codMac;
    this.request.codSolEva = this.solicitud.codSolEvaluacion;
    this.flagLiderTumor = this.solicitud.flagLiderTumor;
    this.dataSource = null;
    this.isLoading = false;
    this.infoSolben = new InfoSolben();
    this.mostrarCampoDetalle = TIPOSCGSOLBEN.mostrarCampoDetalle;
    this.estadioClinicoFrmCtrl.setValue("---");
    this.tnmFrmCtrl.setValue("---");

    if (typeof this.solicitud.codSolEvaluacion !== "undefined") {
      this.solicitud.setEvaluacion = this.solicitud;
    }

    this.verificarTipoEvaluacion();
  }

  public verificarTipoEvaluacion() {
    switch (this.solicitud.estadoEvaluacion + "") {
      case PARAMETRO.aprobadoEstado:
      case PARAMETRO.aprobadoTumorEstado:
      case PARAMETRO.aprobadoCMACEstado:
      case PARAMETRO.rechazadoEstado:
      case PARAMETRO.rechazadoTumorEstado:
      case PARAMETRO.rechazadoCMACEstado:
        this.mostraEvaluacion = false;
        break;
      default:
        this.mostraEvaluacion = true;
        break;
    }
  }

  public capturarRegistroEval(): void {
    if (typeof this.solicitud.codSolEvaluacion === "undefined") {
      this.solicitud = this.solicitud.getEvaluacion;
    }
  }

  public cargarDatosTabla(): void {
    if (this.listaHistoriaLineaTrata.length > 0) {
      this.dataSource = new MatTableDataSource(this.listaHistoriaLineaTrata);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  // public registrarEvaluacionAutorizador() {
  //   this.openDialogRegHistorico();
  // }

  // public openDialogRegHistorico(): void {

  //   if (this.validarEstadoSolicitud()) {
  //     const dialogRef = this.dialog.open(PreguntaLineaTratComponent, {
  //       disableClose: true,
  //       width: '500px',
  //       data: { codMacEvaluacion: this.codMac, codAfiliado: this.solicitud.codAfiliado }
  //     });
  //     dialogRef.afterClosed().subscribe(result => {
  //       if (result === 1) {
  //         this.router.navigate(['./app/registro-linea-tratamiento']);
  //       } else {
  //         const codMacEvaluacion = this.solicitud.codMac;
  //         const codAfiliado = this.solicitud.codAfiliado;
  //         this.consultar(codAfiliado, codMacEvaluacion);
  //       }
  //     });
  //   }
  // }

  public validarEstadoSolicitud(): boolean {
    if (
      this.solicitud.estadoEvaluacion ===
      ESTADOEVALUACION.estadoAprobadoAutorizador
    ) {
      this.mensaje = "La solicitud de evaluación ya fue aprobada.";
      this.openDialogMensaje(
        this.mensaje,
        null,
        true,
        false,
        this.solicitud.numeroSolEvaluacion
      );
      return false;
    }

    if (
      this.solicitud.estadoEvaluacion ===
      ESTADOEVALUACION.estadoRechazadoAutorizador
    ) {
      this.mensaje = "La solicitud de evaluación fue rechazada.";
      this.openDialogMensaje(
        this.mensaje,
        null,
        true,
        false,
        this.solicitud.numeroSolEvaluacion
      );
      return false;
    }

    if (
      this.solicitud.estadoEvaluacion ===
      ESTADOEVALUACION.estadoObservadoAutorizador
    ) {
      this.mensaje = "La solicitud de evaluación se encuentra observada.";
      this.openDialogMensaje(
        this.mensaje,
        null,
        true,
        false,
        this.solicitud.numeroSolEvaluacion
      );
      return false;
    }

    if (
      this.solicitud.estadoEvaluacion ===
      ESTADOEVALUACION.estadoAprobadoLiderTumor
    ) {
      this.mensaje = "La solicitud de evaluación se encuentra observada.";
      this.openDialogMensaje(
        this.mensaje,
        null,
        true,
        false,
        this.solicitud.numeroSolEvaluacion
      );
      return false;
    }

    if (
      this.solicitud.estadoEvaluacion ===
      ESTADOEVALUACION.estadoRechazadoLiderTumor
    ) {
      this.mensaje = "La solicitud de evaluación se encuentra observada.";
      this.openDialogMensaje(
        this.mensaje,
        null,
        true,
        false,
        this.solicitud.numeroSolEvaluacion
      );
      return false;
    }

    if (
      this.solicitud.estadoEvaluacion ===
      ESTADOEVALUACION.estadoObservadoLiderTumor
    ) {
      this.mensaje =
        "La solicitud de evaluación se encuentra observada por Lider Tumor.";
      this.openDialogMensaje(
        this.mensaje,
        null,
        true,
        false,
        this.solicitud.numeroSolEvaluacion
      );
      return false;
    }

    if (
      this.solicitud.estadoEvaluacion === ESTADOEVALUACION.estadoAprobadoCMAC
    ) {
      this.mensaje =
        "La solicitud de evaluación se encuentra aprobada por Autorizador CMAC.";
      this.openDialogMensaje(
        this.mensaje,
        null,
        true,
        false,
        this.solicitud.numeroSolEvaluacion
      );
      return false;
    }

    if (
      this.solicitud.estadoEvaluacion === ESTADOEVALUACION.estadoRechazadoCMAC
    ) {
      this.mensaje =
        "La solicitud de evaluación se encuentra rechazada por CMAC.";
      this.openDialogMensaje(
        this.mensaje,
        null,
        true,
        false,
        this.solicitud.numeroSolEvaluacion
      );
      return false;
    }

    if (this.descripGrupoDiagFrmCtrl.value === null) {
      this.mensaje =
        "Error de comunicacion con el Servicio Oncosys, no se obtiene el Grupo de Diagnostico";
      return false;
    }

    return true;
  }

  public consultar(codAfiliado: any, codMacEvaluacion: any) {
    this.solbenRequest.codAfiliado = codAfiliado;
    this.spinnerService.show();
    this.detalleServicioSolEva
      .consultarEvaluacionAutorizador(this.solbenRequest)
      .subscribe(
        (data: ApiResponse) => {
          if (data.status === "0") {
            if (data.response.length > 0) {
              const codMacHistorico = data.response[0].codMac;
              const estadoMonitoreoMed = data.response[0].estadoMonitoreoMedic;
              this.solicitud.nroLineaTratamiento =
                data.response[0].nroLineaTratamiento;
              if (codMacEvaluacion === codMacHistorico) {
                this.solicitud.codLineaTratamiento =
                  //this.solicitud.fechaSolEva = data.response[0].fecSolEva;
                  this.solicitud.codGrupoDiagnostico =
                    data.response[0].codGrpDiag;
                // insertar parametro P_ESTADO = MEDICAMENTO CONTINUADOR
                this.router.navigate(["/app/medicamento-continuador"]);
                this.actualizarTipoSolEvaluacion(
                  this.solicitud.numeroSolEvaluacion,
                  false
                ); // FALSE MED-CONTINUADOR
                this.spinnerService.hide();
                // P_TIPO_EVA
              } else if (
                ESTADOMONITOREOMED.estadoInactivo === estadoMonitoreoMed
              ) {
                this.router.navigate(["./app/medicamento-nuevo"]);
                this.actualizarTipoSolEvaluacion(
                  this.solicitud.numeroSolEvaluacion,
                  true
                ); // FALSE MED-NUEVO
                this.spinnerService.hide();
                // INSERTAR parametro P_ESTADO = MED NUEVO
              } else if (
                codMacEvaluacion !== codMacHistorico &&
                ESTADOMONITOREOMED.estadoActivo === estadoMonitoreoMed
              ) {
                this.enviarEmailMonitoreoImplicito();
              }
            } else {
              this.solicitud.nroLineaTratamiento = 0;
              this.actualizarTipoSolEvaluacion(
                this.solicitud.numeroSolEvaluacion,
                true
              ); // FALSE MED-NUEVO
              this.spinnerService.hide();
              this.router.navigate(["./app/medicamento-nuevo"]);
            }
          } else {
            console.error(data);
            this.mensaje = "No se logró obtener la información correctamente.";
            this.openDialogMensaje(this.mensaje, null, true, false, null);
            this.spinnerService.hide();
          }
        },
        (error) => {
          console.error(error);
          this.mensaje =
            "Error al consultar el tipo de evaluación del autorizador.";
          this.openDialogMensaje(this.mensaje, null, true, false, null);
          this.spinnerService.hide();
        }
      );
  }

  // public openDialogRegEvaluacionLTumor(): void {
  //   const dialogRef = this.dialog.open(PreguntaLineaTratComponent, {
  //     disableClose: true,
  //     width: '600px',
  //     data: { codMacEvaluacion: this.codMac, codAfiliado: this.solicitud.codAfiliado }
  //   });
  //   dialogRef.afterClosed().subscribe(result => {
  //   });
  // }

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
    this.tipoDoc = this.infoSolben.tipoDoc;
    this.numDoc = this.infoSolben.numDoc;
  }

  /**Funcionalidad de Detalle Solicitud Evaluacion */
  public consultarInformacionScgEva() {
    this.proBarTabla = true;
    this.detalleServicioSolEva
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
            this.guardarDetalleEvaluacion();
            if (this.infoSolben.codAfiliado != null) {
              this.listaLineaTratamientoRequest.codigoAfiliado =
                this.infoSolben.codAfiliado;
            }

            if (
              this.infoSolben.estadoSolEva ===
              ESTADOEVALUACION.estadoObservadoAutorizador
            ) {
              this.validacionLiderTumor();
            }

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

  public mostrarInformacionSCG(): void {
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
    this.estadioClinicoFrmCtrl.setValue("---");
    this.tnmFrmCtrl.setValue("---");
    this.observacionFrmCtrl.setValue(this.infoSolben.observacion);
    this.codHisFrmCtrl.setValue(this.infoSolben.codHis);
    this.descHisFrmCtrl.setValue(this.infoSolben.descHis);
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

  // public openDialog(): void {
  //   if (this.solicitud.codUsrLiderTum === null || this.solicitud.usrLiderTum === null) {
  //     this.mensaje = 'No se encuentra configurado los datos del Líder de Tumor para el Grupo de Diagnóstico.';
  //     this.openDialogMensaje(MENSAJES.ERROR_NOFUNCION, this.mensaje, true, false, this.solicitud.descGrupoDiagnostico);
  //     return;
  //   } else if (this.solicitud.usrLiderTum === null || this.solicitud.usrLiderTum.trim() === '') {
  //     this.mensaje = 'No se encuentra el nombre del usuario Líder de Tumor asignado al Grupo de Diagnóstico.';
  //     this.openDialogMensaje(MENSAJES.ERROR_NOFUNCION, this.mensaje, true, false, this.solicitud.descGrupoDiagnostico);
  //     return;
  //   }
  //   const dialogRef = this.dialog.open(EvaluacionLiderTumorComponent, {
  //     disableClose: true,
  //     width: '550px',
  //     data: { title: 'EVALUACION DEL LIDER TUMOR' }
  //   });

  //   dialogRef.afterClosed().subscribe(result => {

  //   });
  // }

  public setStep(index: number): void {
    this.step = index;
  }

  public setStep2(index: number): void {
    this.step2 = index;
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

  public descargarDocumento(): void {
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
    this.descargarDocumento();
  }

  public visualizarInformeAutorizador(): void {
    this.archivoRqt = new ArchivoFTP();
    this.archivoRqt.codArchivo = this.solicitud.codInformePDF;
    this.archivoRqt.ruta = FILEFTP.rutaInformeAutorizador;
    this.descargarDocumento();
  }

  public openDialogMensaje(
    message: string,
    message2: string,
    alerta: boolean,
    confirmacion: boolean,
    valor: any,
    callback = (result) => {}
  ): void {
    const dialogRef = this.dialog.open(MessageComponent, {
      width: "400px",
      disableClose: true,
      data: {
        title: MENSAJES.EVALUACION.DETALLE,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      callback(result);
    });
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
    let codSolEva = this.codSolEvaluacionFrmCtrl.value;
    localStorage.setItem("codSolEva", codSolEva);
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

  public openDialogMensajeEstadoSolicitud(
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
        title: MENSAJES.EVALUACION.DETALLE,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.consultarInformacionScgEva();
    });
  }

  public enviarEmailMonitoreo() {
    this.spinnerService.show();
    const date = new Date();
    this.correoRequest = new EmailDTO();
    this.correoRequest.codPlantilla =
      EMAIL.EVALUACION_MONITOREO.codigoPlantilla;
    this.correoRequest.fechaProgramada =
      _moment(date).format("DD/MM/YYYY HH:mm");
    this.correoRequest.flagAdjunto = EMAIL.EVALUACION_MONITOREO.flagAdjunto;
    this.correoRequest.tipoEnvio = EMAIL.EVALUACION_MONITOREO.tipoEnvio;
    this.correoRequest.usrApp = EMAIL.usrApp;

    this.correoService.generarCorreo(this.correoRequest).subscribe(
      (response: OncoWsResponse) => {
        let result = "";
        let codigoEnvio;
        const lista: any = response.dataList;

        result += lista[0].cuerpo
          .toString()
          .replace(
            "{{paciente}}",
            this.pacienteFrmCtrl.value != null
              ? this.pacienteFrmCtrl.value
              : " "
          )
          .replace(
            "{{descripcionMac}}",
            this.descripMacFrmCtrl.value != null
              ? this.descripMacFrmCtrl.value
              : " "
          )
          .replace(
            "{{nroScgSolben}}",
            this.codScgSolbenFrmCtrl.value != null
              ? this.codScgSolbenFrmCtrl.value
              : " "
          )
          .replace(
            "{{codSolEvaluacion}}",
            this.codSolEvaluacionFrmCtrl.value != null
              ? this.codSolEvaluacionFrmCtrl.value
              : " "
          )
          .replace(
            "{{medicoAutorizador}}",
            this.userService.getNombres +
              " " +
              this.userService.getApelPaterno +
              " " +
              this.userService.getApelMaterno
          );
        codigoEnvio = lista[0].codigoEnvio;

        this.correoRequest.asunto = EMAIL.EVALUACION_MONITOREO.asunto.concat(
          this.pacienteFrmCtrl.value != null ? this.pacienteFrmCtrl.value : " "
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
        this.envioCorreoRequest.codSolicitudEvaluacion =
          this.codSolEvaluacionFrmCtrl.value;
        this.envioCorreoRequest.codigoEnvio = codigoEnvio;
        this.envioCorreoRequest.usrApp = EMAIL.usrApp;

        this.correoService.finalizarEnvioCorreo(this.correoRequest).subscribe(
          (response: OncoWsResponse) => {
            if (response.audiResponse.codigoRespuesta == "0") {
              this.spinnerService.hide();
              this.verConfirmacion(
                "Envio de correo",
                "su correo está en proceso de envio",
                null
              );
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
              this.verConfirmacion(
                "Envio de correo",
                response.audiResponse.mensajeRespuesta,
                null
              );
            }
          },
          (error) => {
            this.spinnerService.hide();
            console.error(error);
            this.verConfirmacion(
              "Envio de correo",
              "Error al enviar correo",
              null
            );
          }
        );
      },
      (error) => {
        this.spinnerService.hide();
        console.error(error);
        this.verConfirmacion("Envio de correo", "Error al enviar correo", null);
      }
    );
  }

  public verConfirmacion(
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
  }

  public enviarEmailMonitoreoImplicito() {
    const date = new Date();
    this.correoRequest = new EmailDTO();
    this.correoRequest.codPlantilla =
      EMAIL.EVALUACION_MONITOREO.codigoPlantilla;
    this.correoRequest.fechaProgramada =
      _moment(date).format("DD/MM/YYYY HH:mm");
    this.correoRequest.flagAdjunto = EMAIL.EVALUACION_MONITOREO.flagAdjunto;
    this.correoRequest.tipoEnvio = EMAIL.EVALUACION_MONITOREO.tipoEnvio;
    this.correoRequest.usrApp = EMAIL.usrApp;

    this.correoService.generarCorreo(this.correoRequest).subscribe(
      (response: OncoWsResponse) => {
        let result = "";
        let codigoEnvio;
        const lista: any = response.dataList;

        result += lista[0].cuerpo
          .toString()
          .replace(
            "{{paciente}}",
            this.pacienteFrmCtrl.value != null
              ? this.pacienteFrmCtrl.value
              : " "
          )
          .replace(
            "{{descripcionMac}}",
            this.descripMacFrmCtrl.value != null
              ? this.descripMacFrmCtrl.value
              : " "
          )
          .replace(
            "{{nroScgSolben}}",
            this.codScgSolbenFrmCtrl.value != null
              ? this.codScgSolbenFrmCtrl.value
              : " "
          )
          .replace(
            "{{codSolEvaluacion}}",
            this.codSolEvaluacionFrmCtrl.value != null
              ? this.codSolEvaluacionFrmCtrl.value
              : " "
          )
          .replace(
            "{{medicoAutorizador}}",
            this.userService.getNombres +
              " " +
              this.userService.getApelPaterno +
              " " +
              this.userService.getApelMaterno
          );
        codigoEnvio = lista[0].codigoEnvio;

        this.correoRequest.asunto = EMAIL.EVALUACION_MONITOREO.asunto.concat(
          this.pacienteFrmCtrl.value != null ? this.pacienteFrmCtrl.value : " "
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
        this.envioCorreoRequest.codSolicitudEvaluacion =
          this.codSolEvaluacionFrmCtrl.value;
        this.envioCorreoRequest.codigoEnvio = codigoEnvio;
        this.envioCorreoRequest.usrApp = EMAIL.usrApp;

        this.correoService.finalizarEnvioCorreo(this.correoRequest).subscribe(
          (response: OncoWsResponse) => {
            if (response.audiResponse.codigoRespuesta == "0") {
              this.spinnerService.hide();
              this.verConfirmacion(
                "Envio de correo",
                null,
                "*Existe un monitoreo pendiente de registro de resultado.\n*Se envio un correo al Responsable de Monitoreo (verifique el estado de envio del email con el boton 'VER ESTADO DE CORREO')"
              );
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
              this.verConfirmacion(
                "Envio de correo",
                null,
                "*Existe un monitoreo pendiente de registro de resultado.\n*" +
                  response.audiResponse.mensajeRespuesta
              );
            }
          },
          (error) => {
            this.spinnerService.hide();
            console.error(error);
            this.verConfirmacion(
              "Envio de correo",
              null,
              "*Existe un monitoreo pendiente de registro de resultado.\n*" +
                response.audiResponse.mensajeRespuesta
            );
          }
        );
      },
      (error) => {
        this.spinnerService.hide();
        console.error(error);
        this.verConfirmacion(
          "Envio de correo",
          null,
          "*Existe un monitoreo pendiente de registro de resultado.\n*Error de generacion de correo para envio al Responsable de Monitoreo"
        );
      }
    );
  }

  public refrescarEstadoSolicitud() {
    this.spinnerService.show();
    this.envioCorreoRequest = new EnvioCorreoRequest();
    this.envioCorreoRequest.codSolicitudEvaluacion =
      this.codSolEvaluacionFrmCtrl.value;
    this.envioCorreoRequest.usrApp = EMAIL.usrApp;
    this.correoService.verificarCodigoEnvio(this.envioCorreoRequest).subscribe(
      (response: OncoWsResponse) => {
        if (response.audiResponse.codigoRespuesta === "0") {
          this.mensaje = MENSAJES.EVALUACION.CORREO_ENVIADO;
          this.openDialogMensajeEstadoSolicitud(
            this.mensaje,
            null,
            true,
            false,
            null
          );
        } else {
          this.openDialogMensajeEstadoSolicitud(
            response.audiResponse.mensajeRespuesta,
            "",
            true,
            false,
            null
          );
        }
        this.spinnerService.hide();
      },
      (error) => {
        this.spinnerService.hide();
        this.openDialogMensajeEstadoSolicitud(
          MENSAJES.EVALUACION.ERROR_VERIFICAR_CORREO,
          null,
          true,
          false,
          null
        );
        console.error(error);
      }
    );
  }

  public actualizarTipoSolEvaluacion(codSolEva: string, tipo: boolean) {
    let solEvaRequest = new SolicitudEvaluacionRequest();
    solEvaRequest.codSolicitudEvaluacion = Number(codSolEva);
    if (tipo) {
      //SI IGUAL TRUE => NUEVO   -   FALSE=> CONTINUADOR
      solEvaRequest.pTipoEva = TIPO_SOL_EVA.medicamentoNuevo;
    } else {
      solEvaRequest.pTipoEva = TIPO_SOL_EVA.continuador;
    }

    this.detalleServicioSolEva
      .actualizarTipoSolEvaluacion(solEvaRequest)
      .subscribe(
        (response: WsResponse) => {},
        (error) => {
          console.error(error);
        }
      );
  }

  public accesoOpcionMenu() {
    const data = require("src/assets/data/permisosRecursos.json");
    const bandejaEvaluacion = data.bandejaEvaluacion.detalle;
    this.opcionMenu = JSON.parse(localStorage.getItem("opcionMenu"));

    if (this.opcionMenu.opcion.length > 0) {
      this.opcionMenu.opcion.forEach((element) => {
        const codOpcion = element.codOpcion;
        switch (codOpcion) {
          case bandejaEvaluacion.txtCodigoSolicitud:
            this.txtCodigoSolicitud = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtEstadoSolicitud:
            this.txtEstadoSolicitud = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtCodigoMac:
            this.txtCodigoMac = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtDescripcionMac:
            this.txtDescripcionMac = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnInforme:
            this.btnInforme = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnActaMac:
            this.btnActaMac = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtNroSCG:
            this.txtNroSCG = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtEstadoSCG:
            this.txtEstadoSCG = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtFechaSCG:
            this.txtFechaSCG = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtTipoSCG:
            this.txtTipoSCG = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtNroCartaGarantiaDet:
            this.txtNroCartaGarantiaDet = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtClinicaDet:
            this.txtClinicaDet = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtMedicoTratante:
            this.txtMedicoTratante = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtCMP:
            this.txtCMP = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtFechaReceta:
            this.txtFechaReceta = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtFechaQuimioterapia:
            this.txtFechaQuimioterapia = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtFechaHospitalizacion:
            this.txtFechaHospitalizacion = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtMedicamentos:
            this.txtMedicamentos = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtEsquemaQuimioterapia:
            this.txtEsquemaQuimioterapia = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtPersonaContacto:
            this.txtPersonaContacto = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtTotalPresupuesto:
            this.txtTotalPresupuesto = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtPacienteDet:
            this.txtPacienteDet = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtEdad:
            this.txtEdad = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtDiagnostico:
            this.txtDiagnostico = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtCie10:
            this.txtCie10 = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtGrupoDiagnostico:
            this.txtGrupoDiagnostico = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtContratante:
            this.txtContratante = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtPlan:
            this.txtPlan = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtCodigoAfiliado:
            this.txtCodigoAfiliado = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtFechaAfiliacion:
            this.txtFechaAfiliacion = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtEstadioClinico:
            this.txtEstadioClinico = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtTNM:
            this.txtTNM = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtObservacion:
            this.txtObservacion = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnEnviarAlertaMonitoreo:
            this.btnEnviarAlertaMonitoreo = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnRegistrarEvaAutorizador:
            this.btnRegistrarEvaAutorizador = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnRegistrarEvaLiderTumor:
            this.btnRegistrarEvaLiderTumor = Number(element.flagAsignacion);
            break;
        }
      });
    }
  }

  public validarFechaInicio() {}

  addFieldValue() {
    this.fieldArray.push(
      new FormGroup({
        diagnostico: new FormControl(""),
        fecha: new FormControl(""),
      })
    );
  }

  deleteFieldValue(index) {
    this.fieldArray.removeAt(index);
  }

  chosenYearHandler(normalizedYear: Moment, index) {
    const ctrlValue = this.fieldArray[index].fecha.value;

    ctrlValue.year(normalizedYear.year());
    this.fieldArray[index].fecha.setValue(ctrlValue);
  }

  chosenMonthHandler(
    normalizedMonth: Moment,
    dpDdesde: MatDatepicker<any>,
    index
  ) {
    const ctrlValue = this.fieldArray[index].fecha.value;
    ctrlValue.month(normalizedMonth.month());
    ctrlValue.day(1);
    ctrlValue.month(5);
    this.fieldArray[index].fecha.setValue(ctrlValue);
    dpDdesde.close();
  }

  addFieldValue1erGrado() {
    this.fieldFamiliar1erGrado.push(
      new FormGroup({
        diagnostico: new FormControl(""),
        fecha: new FormControl(""),
      })
    );
  }

  deleteFieldValue1erGrado(index) {
    this.fieldFamiliar1erGrado.removeAt(index);
  }

  addFieldValue2doGrado() {
    this.fieldFamiliar2doGrado.push(
      new FormGroup({
        diagnostico: new FormControl(""),
        fecha: new FormControl(""),
      })
    );
  }

  deleteFieldValue2doGrado(index) {
    this.fieldFamiliar2doGrado.removeAt(index);
  }

  activar1() {
    if (this.antecedentesFrmGrp.get("aplica1").value == false) {
      this.antecedentesFrmGrp.patchValue({
        noAplica1: false,
        aplica1: false,
      });
      this.antecedentesFrmGrp.get("menarquia").enable();
      this.antecedentesFrmGrp.get("gestaciones").enable();
      this.antecedentesFrmGrp.get("nro_hijos").enable();
      this.antecedentesFrmGrp.get("fur").enable();
      this.antecedentesFrmGrp.get("abortos").enable();
      this.antecedentesFrmGrp.get("anticoceptivo").enable();
      this.antecedentesFrmGrp.get("observaciones").enable();
      this.antecedentesFrmGrp.get("menarquia").enable();
    } else {
      this.antecedentesFrmGrp.patchValue({
        noAplica1: true,
        aplica1: true,
        menarquia: "",
        gestaciones: "",
        nro_hijos: "",
        fur: "",
        abortos: "",
        anticoceptivo: "",
        observaciones: "",
      });
      this.antecedentesFrmGrp.get("menarquia").disable();
      this.antecedentesFrmGrp.get("gestaciones").disable();
      this.antecedentesFrmGrp.get("nro_hijos").disable();
      this.antecedentesFrmGrp.get("fur").disable();
      this.antecedentesFrmGrp.get("abortos").disable();
      this.antecedentesFrmGrp.get("anticoceptivo").disable();
      this.antecedentesFrmGrp.get("observaciones").disable();
    }
  }

  desactivar1() {
    if (this.antecedentesFrmGrp.get("noAplica1").value == false) {
      this.antecedentesFrmGrp.patchValue({
        aplica1: false,
        menarquia: "",
        gestaciones: "",
        nro_hijos: "",
        fur: "",
        abortos: "",
        anticoceptivo: "",
        observaciones: "",
      });
      this.antecedentesFrmGrp.get("menarquia").disable();
      this.antecedentesFrmGrp.get("gestaciones").disable();
      this.antecedentesFrmGrp.get("nro_hijos").disable();
      this.antecedentesFrmGrp.get("fur").disable();
      this.antecedentesFrmGrp.get("abortos").disable();
      this.antecedentesFrmGrp.get("anticoceptivo").disable();
      this.antecedentesFrmGrp.get("observaciones").disable();
      this.antecedentesFrmGrp.get("menarquia").disable();
    } else {
      this.antecedentesFrmGrp.patchValue({
        noAplica1: true,
        aplica1: true,
      });
      this.antecedentesFrmGrp.get("menarquia").enable();
      this.antecedentesFrmGrp.get("gestaciones").enable();
      this.antecedentesFrmGrp.get("nro_hijos").enable();
      this.antecedentesFrmGrp.get("fur").enable();
      this.antecedentesFrmGrp.get("abortos").enable();
      this.antecedentesFrmGrp.get("anticoceptivo").enable();
      this.antecedentesFrmGrp.get("observaciones").enable();
      this.antecedentesFrmGrp.get("menarquia").enable();
    }
  }

  activar2() {
    if (this.antecedentesPatPersonalesFrmGrp.get("aplica2").value == false) {
      this.antecedentesPatPersonalesFrmGrp.patchValue({
        noAplica2: false,
      });
      this.antecedentesPatPersonalesFrmGrp.get("hta").enable();
      this.antecedentesPatPersonalesFrmGrp.get("ima_icc").enable();
      this.antecedentesPatPersonalesFrmGrp.get("reumatologicas").enable();
      this.antecedentesPatPersonalesFrmGrp.get("dim").enable();
      this.antecedentesPatPersonalesFrmGrp.get("epoc_epid").enable();
      this.antecedentesPatPersonalesFrmGrp.get("endocrinopatias").enable();
      this.antecedentesPatPersonalesFrmGrp.get("asma").enable();
      this.antecedentesPatPersonalesFrmGrp.get("ram").enable();
      this.antecedentesPatPersonalesFrmGrp.get("otros").enable();
      this.antecedentesPatPersonalesFrmGrp.get("habitos_nocivos").enable();
    } else {
      this.antecedentesPatPersonalesFrmGrp.patchValue({
        noAplica2: true,
        aplica2: true,
        hta: "",
        ima_icc: "",
        reumatologicas: "",
        dim: "",
        epoc_epid: "",
        endocrinopatias: "",
        asma: "",
        ram: "",
        otros: "",
        habitos_nocivos: "",
      });
      this.antecedentesPatPersonalesFrmGrp.get("hta").disable();
      this.antecedentesPatPersonalesFrmGrp.get("ima_icc").disable();
      this.antecedentesPatPersonalesFrmGrp.get("reumatologicas").disable();
      this.antecedentesPatPersonalesFrmGrp.get("dim").disable();
      this.antecedentesPatPersonalesFrmGrp.get("epoc_epid").disable();
      this.antecedentesPatPersonalesFrmGrp.get("endocrinopatias").disable();
      this.antecedentesPatPersonalesFrmGrp.get("asma").disable();
      this.antecedentesPatPersonalesFrmGrp.get("ram").disable();
      this.antecedentesPatPersonalesFrmGrp.get("otros").disable();
      this.antecedentesPatPersonalesFrmGrp.get("habitos_nocivos").disable();
    }
  }

  desactivar2() {
    if (this.antecedentesPatPersonalesFrmGrp.get("noAplica2").value == false) {
      this.antecedentesPatPersonalesFrmGrp.patchValue({
        aplica2: false,
        hta: "",
        ima_icc: "",
        reumatologicas: "",
        dim: "",
        epoc_epid: "",
        endocrinopatias: "",
        asma: "",
        ram: "",
        otros: "",
        habitos_nocivos: "",
      });
      this.antecedentesPatPersonalesFrmGrp.get("hta").disable();
      this.antecedentesPatPersonalesFrmGrp.get("ima_icc").disable();
      this.antecedentesPatPersonalesFrmGrp.get("reumatologicas").disable();
      this.antecedentesPatPersonalesFrmGrp.get("dim").disable();
      this.antecedentesPatPersonalesFrmGrp.get("epoc_epid").disable();
      this.antecedentesPatPersonalesFrmGrp.get("endocrinopatias").disable();
      this.antecedentesPatPersonalesFrmGrp.get("asma").disable();
      this.antecedentesPatPersonalesFrmGrp.get("ram").disable();
      this.antecedentesPatPersonalesFrmGrp.get("otros").disable();
      this.antecedentesPatPersonalesFrmGrp.get("habitos_nocivos").disable();
    } else {
      this.antecedentesPatPersonalesFrmGrp.patchValue({
        noAplica2: true,
        aplica2: true,
      });
      this.antecedentesPatPersonalesFrmGrp.get("hta").enable();
      this.antecedentesPatPersonalesFrmGrp.get("ima_icc").enable();
      this.antecedentesPatPersonalesFrmGrp.get("reumatologicas").enable();
      this.antecedentesPatPersonalesFrmGrp.get("dim").enable();
      this.antecedentesPatPersonalesFrmGrp.get("epoc_epid").enable();
      this.antecedentesPatPersonalesFrmGrp.get("endocrinopatias").enable();
      this.antecedentesPatPersonalesFrmGrp.get("asma").enable();
      this.antecedentesPatPersonalesFrmGrp.get("ram").enable();
      this.antecedentesPatPersonalesFrmGrp.get("otros").enable();
      this.antecedentesPatPersonalesFrmGrp.get("habitos_nocivos").enable();
    }
  }

  activar3() {
    if (this.antecedentesOncoPersonalesFrmGrp.get("aplica3").value == false) {
      this.antecedentesOncoPersonalesFrmGrp.patchValue({
        noAplica3: false,
      });
      this.fieldArray.controls.forEach((e) => {
        e.enable();
      });
    } else {
      this.antecedentesOncoPersonalesFrmGrp.patchValue({
        noAplica3: true,
        aplica3: true,
      });
      this.fieldArray.controls.forEach((e) => {
        e.setValue({
          diagnostico: "",
          fecha: "",
        });
        e.disable();
      });
    }
  }

  desactivar3() {
    if (this.antecedentesOncoPersonalesFrmGrp.get("noAplica3").value == false) {
      this.antecedentesOncoPersonalesFrmGrp.patchValue({
        aplica3: false,
      });
      this.fieldArray.controls.forEach((e) => {
        e.setValue({
          diagnostico: "",
          fecha: "",
        });
        e.disable();
      });
    } else {
      this.antecedentesOncoPersonalesFrmGrp.patchValue({
        noAplica3: true,
        aplica3: true,
      });
      this.fieldArray.controls.forEach((e) => {
        e.enable();
      });
    }
  }

  activar4() {
    if (this.antecedentesOncoFamFrmGrp.get("aplica4").value == false) {
      this.chkFamiliar1.setValue(true);
      this.chkFamiliar2.setValue(true);
      if (this.chkFamiliar1.value) {
        this.required1ck(this.chkFamiliar1.value);
      }
      if (this.chkFamiliar2.value) {
        this.required2ck(this.chkFamiliar2.value);
      }
      this.antecedentesOncoFamFrmGrp.patchValue({
        noAplica4: false,
      });
      if (this.isRequired) {
        this.fieldFamiliar1erGrado.controls.forEach((e) => {
          e.enable();
        });
      }
      if (this.isRequired2) {
        this.fieldFamiliar2doGrado.controls.forEach((e) => {
          e.enable();
        });
      }
      this.chkFamiliar1.enable();
      this.chkFamiliar2.enable();
      this.antecedentesOtros.get("otros_onco_fami").enable();
    } else {
      this.antecedentesOncoFamFrmGrp.patchValue({
        noAplica4: true,
        aplica4: true,
      });
      this.fieldFamiliar1erGrado.controls.forEach((e) => {
        e.setValue({
          diagnostico: "",
          fecha: "",
        });
        e.disable();
      });
      this.chkFamiliar1.disable();
      this.chkFamiliar2.disable();
      this.fieldFamiliar2doGrado.controls.forEach((e) => {
        e.setValue({
          diagnostico: "",
          fecha: "",
        });
        e.disable();
      });
      this.antecedentesOtros.get("otros_onco_fami").disable();
    }
  }

  desactivar5() {
    this.mensaje = "SE BORRARAN TODOS LOS DATOS AL GUARDAR";
    this.openDialogMensaje(
      "ALERTA",
      this.mensaje,
      false,
      true,
      null,
      (result) => {
        if (result == 1) {
          this.tratamientoPrevioCirugia.reset();

          this.tratamientoPrevioCirugia.patchValue({
            noAplica5: true,
            aplica5: false,
          });
          this.desactivarArray(this.tpCirugiaArray);
        } else {
          this.tratamientoPrevioCirugia.patchValue({
            aplica5: true,
            noAplica5: false,
          });
        }
      }
    );
  }

  activar5() {
    this.activarArray(this.tpCirugiaArray);
    this.tratamientoPrevioCirugia.patchValue({
      aplica5: true,
      noAplica5: false,
    });
  }

  desactivar6() {
    this.mensaje = "SE BORRARAN TODOS LOS DATOS AL GUARDAR";
    this.openDialogMensaje(
      "ALERTA",
      this.mensaje,
      false,
      true,
      null,
      (result) => {
        if (result == 1) {
          this.tratamientoPrevioRadioterapia.reset();

          this.tratamientoPrevioRadioterapia.patchValue({
            noAplica: true,
            aplica: false,
          });
          this.desactivarArray(
            this.tratamientoPrevioRadioterapia.controls.adyuvante
          );
          this.desactivarArray(
            this.tratamientoPrevioRadioterapia.controls.neoAdyuvante
          );
          this.desactivarArray(
            this.tratamientoPrevioRadioterapia.controls.paliativa
          );
        } else {
          this.tratamientoPrevioRadioterapia.patchValue({
            aplica: true,
            noAplica: false,
          });
          this.activarArray(
            this.tratamientoPrevioRadioterapia.controls.adyuvante
          );
          this.activarArray(
            this.tratamientoPrevioRadioterapia.controls.neoAdyuvante
          );
          this.activarArray(
            this.tratamientoPrevioRadioterapia.controls.paliativa
          );
        }
      }
    );
  }

  activar6() {
    this.tratamientoPrevioRadioterapia.patchValue({
      noAplica: false,
    });
    this.activarArray(this.tratamientoPrevioRadioterapia.controls.adyuvante);
    this.activarArray(this.tratamientoPrevioRadioterapia.controls.neoAdyuvante);
    this.activarArray(this.tratamientoPrevioRadioterapia.controls.paliativa);
  }

  desactivar7() {
    this.mensaje = "SE BORRARAN TODOS LOS DATOS AL GUARDAR";
    this.openDialogMensaje(
      "ALERTA",
      this.mensaje,
      false,
      true,
      null,
      (result) => {
        if (result == 1) {
          this.tratamientoPrevioPaliativo.reset();
          this.tratamientoPrevioPaliativo.patchValue({
            aplica: false,
            noAplica: true,
          });

          this.desactivarArray(this.tratamientoPrevioPaliativo.controls.dolor);
          this.desactivarArray(
            this.tratamientoPrevioPaliativo.controls.compasivo
          );
        } else {
          this.tratamientoPrevioPaliativo.patchValue({
            aplica: true,
            noAplica: false,
          });
          this.activarArray(this.tratamientoPrevioPaliativo.controls.dolor);
          this.activarArray(this.tratamientoPrevioPaliativo.controls.compasivo);
        }
      }
    );
  }

  activar7() {
    this.tratamientoPrevioPaliativo.patchValue({
      noAplica: false,
    });
    this.activarArray(this.tratamientoPrevioPaliativo.controls.dolor);
    this.activarArray(this.tratamientoPrevioPaliativo.controls.compasivo);
  }

  desactivar8() {
    this.mensaje = "SE BORRARAN TODOS LOS DATOS AL GUARDAR";
    this.openDialogMensaje(
      "ALERTA",
      this.mensaje,
      false,
      true,
      null,
      (result) => {
        if (result == 1) {
          this.tratamientoPrevioAntineoplasica.reset();

          this.tratamientoPrevioAntineoplasica.patchValue({
            aplica: false,
            noAplica: true,
          });
          this.desactivarArray(
            this.tratamientoPrevioAntineoplasica.controls.adyuvante
          );
          this.desactivarArray(
            this.tratamientoPrevioAntineoplasica.controls.neoAdyuvante
          );
          this.desactivarArray(
            this.tratamientoPrevioAntineoplasica.controls.metastasico
          );
          this.tratamientoPrevioAntineoplasica.controls.tipo.disable();
          this.tratamientoPrevioAntineoplasica.controls.solido.disable();
          this.tratamientoPrevioAntineoplasica.controls.noSolido.disable();
          // @ts-ignore
          // prettier-ignore
          this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls.mantenimiento);
          // @ts-ignore
          // prettier-ignore
          this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls.lineas_tto);
          // @ts-ignore
          // prettier-ignore
          this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.induccion);
          // @ts-ignore
          // prettier-ignore
          this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.mantenimiento);
          // @ts-ignore
          // prettier-ignore
          this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.relapso);
          // @ts-ignore
          // prettier-ignore
          this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.induccion);
          // @ts-ignore
          // prettier-ignore
          this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.mantenimiento);
          // @ts-ignore
          // prettier-ignore
          this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.consolidacion);
          // @ts-ignore
          // prettier-ignore
          this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.relapso);
          // @ts-ignore
          // prettier-ignore
          this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttMielodisplasico.controls.lineas_tto);
          // @ts-ignore
          // prettier-ignore
          this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloprofilerativo.controls.lineas_tto);
        } else {
          this.tratamientoPrevioAntineoplasica.patchValue({
            aplica: true,
            noAplica: false,
          });
          this.activarArray(
            this.tratamientoPrevioAntineoplasica.controls.adyuvante
          );
          this.activarArray(
            this.tratamientoPrevioAntineoplasica.controls.neoAdyuvante
          );
          this.activarArray(
            this.tratamientoPrevioAntineoplasica.controls.metastasico
          );
          this.tratamientoPrevioAntineoplasica.controls.tipo.enable();

          this.tratamientoPrevioAntineoplasica.controls.solido.enable();
          this.tratamientoPrevioAntineoplasica.controls.noSolido.enable();
          // @ts-ignore
          // prettier-ignore
          this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls.mantenimiento);
          // @ts-ignore
          // prettier-ignore
          this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls.lineas_tto);
          // @ts-ignore
          // prettier-ignore
          this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.induccion);
          // @ts-ignore
          // prettier-ignore
          this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.mantenimiento);
          // @ts-ignore
          // prettier-ignore
          this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.relapso);
          // @ts-ignore
          // prettier-ignore
          this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.induccion);
          // @ts-ignore
          // prettier-ignore
          this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.mantenimiento);
          // @ts-ignore
          // prettier-ignore
          this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.consolidacion);
          // @ts-ignore
          // prettier-ignore
          this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.relapso);
          // @ts-ignore
          // prettier-ignore
          this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttMielodisplasico.controls.lineas_tto);
          // @ts-ignore
          // prettier-ignore
          this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloprofilerativo.controls.lineas_tto);
        }
      }
    );
  }

  activar9() {
    this.tratamientoPrevioAntineoplasica.patchValue({
      noSolido: false,
    });
  }
  desactivar9() {
    this.tratamientoPrevioAntineoplasica.patchValue({
      solido: false,
    });
  }
  activar8() {
    if (this.tratamientoPrevioAntineoplasica.get("aplica").value == false) {
      this.tratamientoPrevioAntineoplasica.patchValue({
        noAplica: false,
      });

      this.activarArray(
        this.tratamientoPrevioAntineoplasica.controls.adyuvante
      );
      this.activarArray(
        this.tratamientoPrevioAntineoplasica.controls.neoAdyuvante
      );
      this.activarArray(
        this.tratamientoPrevioAntineoplasica.controls.metastasico
      );
      this.tratamientoPrevioAntineoplasica.controls.tipo.enable();

      this.tratamientoPrevioAntineoplasica.controls.solido.enable();
      this.tratamientoPrevioAntineoplasica.controls.noSolido.enable();
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls.mantenimiento);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls.lineas_tto);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.induccion);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.mantenimiento);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.relapso);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.induccion);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.mantenimiento);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.consolidacion);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.relapso);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttMielodisplasico.controls.lineas_tto);
      // @ts-ignore
      // prettier-ignore
      this.activarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloprofilerativo.controls.lineas_tto);
    } else {
      this.tratamientoPrevioAntineoplasica.patchValue({
        noAplica: false,
        aplica: true,
      });
      this.desactivarArray(
        this.tratamientoPrevioAntineoplasica.controls.adyuvante
      );
      this.desactivarArray(
        this.tratamientoPrevioAntineoplasica.controls.neoAdyuvante
      );
      this.desactivarArray(
        this.tratamientoPrevioAntineoplasica.controls.metastasico
      );
      // @ts-ignore
      // prettier-ignore
      this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls.mantenimiento);
      // @ts-ignore
      // prettier-ignore
      this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls.lineas_tto);
      // @ts-ignore
      // prettier-ignore
      this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.induccion);
      // @ts-ignore
      // prettier-ignore
      this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.mantenimiento);
      // @ts-ignore
      // prettier-ignore
      this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.relapso);
      // @ts-ignore
      // prettier-ignore
      this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.induccion);
      // @ts-ignore
      // prettier-ignore
      this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.mantenimiento);
      // @ts-ignore
      // prettier-ignore
      this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.consolidacion);
      // @ts-ignore
      // prettier-ignore
      this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.relapso);
      // @ts-ignore
      // prettier-ignore
      this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttMielodisplasico.controls.lineas_tto);
      // @ts-ignore
      // prettier-ignore
      this.desactivarArray(this.tratamientoPrevioAntineoplasica.controls.ttMieloprofilerativo.controls.lineas_tto);
    }
  }
  desactivar4() {
    if (this.antecedentesOncoFamFrmGrp.get("noAplica4").value == false) {
      this.chkFamiliar1.setValue(false);
      this.chkFamiliar2.setValue(false);
      if (!this.chkFamiliar1.value) {
        this.required1ck(this.chkFamiliar1.value);
      }
      if (!this.chkFamiliar2.value) {
        this.required2ck(this.chkFamiliar2.value);
      }
      this.antecedentesOncoFamFrmGrp.patchValue({
        aplica4: false,
      });
      this.fieldFamiliar1erGrado.controls.forEach((e) => {
        e.setValue({
          diagnostico: "",
          fecha: "",
        });
        e.disable();
      });
      this.fieldFamiliar2doGrado.controls.forEach((e) => {
        e.setValue({
          diagnostico: "",
          fecha: "",
        });
        e.disable();
      });
      this.chkFamiliar1.disable();
      this.chkFamiliar2.disable();
      this.antecedentesOtros.get("otros_onco_fami").disable();
    } else {
      this.antecedentesOncoFamFrmGrp.patchValue({
        noAplica4: true,
        aplica4: true,
      });
      if (this.isRequired) {
        this.fieldFamiliar1erGrado.controls.forEach((e) => {
          e.enable();
        });
      }
      if (this.isRequired2) {
        this.fieldFamiliar2doGrado.controls.forEach((e) => {
          e.enable();
        });
      }
      this.chkFamiliar1.enable();
      this.chkFamiliar2.enable();
      this.antecedentesOtros.get("otros_onco_fami").enable();
    }
  }

  /*required1() {
    this.isRequired = !this.isRequired;

    if(this.isRequired){
      this.fieldFamiliar1erGrado.controls.forEach((e) => {
        e.enable();
      });
      this.fam1btnAdd = false;
    }else{
      this.fieldFamiliar1erGrado.controls.forEach((e) => {
        e.disable();
      });
      this.fam1btnAdd = true;
    }
  }

  required2() {
    this.isRequired2 = !this.isRequired2;
    if(this.isRequired2){
      this.fieldFamiliar2doGrado.controls.forEach((e) => {
        e.enable();
      });
      this.fam2btnAdd = false;
    }else{
      this.fieldFamiliar2doGrado.controls.forEach((e) => {
        e.disable();
      });
      this.fam2btnAdd = true;
    }
  }*/

  required1() {
    if (this.antecedentesOncoFamFrmGrp.get("aplica4").value == true) {
      if (!this.chkFamiliar1.value) {
        this.chkFamiliar1.setValue(false);
        this.fieldFamiliar1erGrado.controls.forEach((e) => {
          e.enable();
        });
        this.fam1btnAdd = false;
      } else {
        this.chkFamiliar1.setValue(true);
        this.fieldFamiliar1erGrado.controls.forEach((e) => {
          e.setValue({
            diagnostico: null,
            fecha: null,
          });
          e.disable();
        });
        this.fam1btnAdd = true;
      }
    }
  }

  required1ck(valor) {
    if (valor) {
      this.fieldFamiliar1erGrado.controls.forEach((e) => {
        e.enable();
      });
      this.fam1btnAdd = false;
    } else {
      this.fieldFamiliar1erGrado.controls.forEach((e) => {
        e.disable();
      });
      this.fam1btnAdd = true;
    }
  }

  required2() {
    if (this.antecedentesOncoFamFrmGrp.get("aplica4").value == true) {
      if (!this.chkFamiliar2.value) {
        this.chkFamiliar2.setValue(false);
        this.fieldFamiliar2doGrado.controls.forEach((e) => {
          e.enable();
        });
        this.fam2btnAdd = false;
      } else {
        this.chkFamiliar2.setValue(true);
        this.fieldFamiliar2doGrado.controls.forEach((e) => {
          e.setValue({
            diagnostico: null,
            fecha: null,
          });
          e.disable();
        });
        this.fam2btnAdd = true;
      }
    }
  }

  required2ck(valor) {
    if (valor) {
      this.fieldFamiliar2doGrado.controls.forEach((e) => {
        e.enable();
      });
      this.fam2btnAdd = false;
    } else {
      this.fieldFamiliar2doGrado.controls.forEach((e) => {
        e.disable();
      });
      this.fam2btnAdd = true;
    }
  }

  private revisarObjVacio(obj) {
    if (!obj.aplica) return true;
    for (let i in obj) {
      if (
        (typeof obj[i] == "string" || typeof obj[i] == "number") &&
        obj[i] != "" &&
        obj.aplica
      )
        return true;
    }
    return false;
  }

  public validarAplicas(arr) {
    const len = arr.filter((element) => {
      return element.aplica;
    });
    if (len.length > 0) return true;
    return false;
  }

  private revisarArrayVacio(array) {
    const newArr = array.filter((el) => {
      return this.revisarObjVacio(el);
    });

    return newArr.length == 0;
  }

  onSubmit() {
    var aplica1 = this.antecedentesFrmGrp.get("aplica1").value;
    var aplica2 = this.antecedentesPatPersonalesFrmGrp.get("aplica2").value;
    var aplica3_ = this.antecedentesOncoPersonalesFrmGrp.get("aplica3").value;
    var aplica4_ = this.antecedentesOncoFamFrmGrp.get("aplica4").value;

    if (
      aplica1 == false &&
      aplica2 == false &&
      aplica3_ == false &&
      aplica4_ == false
    ) {
    }

    var data_extra = {
      cod_evaluacion: this.codSolEvaluacionFrmCtrl.value,
      cod_solben: this.codScgSolbenFrmCtrl.value,
      cod_usuario: this.userService.getCodUsuario,
      nombres: this.userService.getNombres,
      apellido_paterno: this.userService.getApelPaterno,
      apellido_materno: this.userService.getApelMaterno,
      codigo_afiliado: this.detEvaluacionFrmGrp.get("codAfiliadoFrmCtrl").value,
      tipo_doc: this.tipoDoc,
      num_doc: this.numDoc,
      nombClinica: this.infoSolben.clinica,
      diagnostico: this.infoSolben.diagnostico,
    };

    this.dataGlobal["codigos"] = data_extra;

    // antecedentesFrmGrp
    var abortos = this.antecedentesFrmGrp.get("abortos").value;
    var anticoceptivo = this.antecedentesFrmGrp.get("anticoceptivo").value;
    var fur = this.antecedentesFrmGrp.get("fur").value;
    var gestaciones = this.antecedentesFrmGrp.get("gestaciones").value;
    var menarquia = this.antecedentesFrmGrp.get("menarquia").value;
    var nro_hijos = this.antecedentesFrmGrp.get("nro_hijos").value;
    var observaciones = this.antecedentesFrmGrp.get("observaciones").value;

    if (aplica1 == true) {
      if (
        abortos == "" &&
        anticoceptivo == "" &&
        fur == "" &&
        gestaciones == "" &&
        menarquia == "" &&
        nro_hijos == "" &&
        observaciones == ""
      ) {
        this.mensaje =
          "NO HAY REGISTRO EN ANTECEDENTES PERSONALES GINECOLOGICOS";
        this.openDialogMensaje(this.mensaje, null, true, false, null);
        return false;
      }
    }

    var ant_per_gine = {
      aplica: aplica1,
      abortos: abortos,
      anticoceptivo: anticoceptivo,
      fur: fur,
      gestaciones: gestaciones,
      menarquia: menarquia,
      nro_hijos: nro_hijos,
      observaciones: observaciones,
    };

    // antecedentesPatPersonalesFrmGrp
    var asma = this.antecedentesPatPersonalesFrmGrp.get("asma").value;
    var dim = this.antecedentesPatPersonalesFrmGrp.get("dim").value;
    var endocrinopatias =
      this.antecedentesPatPersonalesFrmGrp.get("endocrinopatias").value;
    var epoc_epid = this.antecedentesPatPersonalesFrmGrp.get("epoc_epid").value;
    var habitos_nocivos =
      this.antecedentesPatPersonalesFrmGrp.get("habitos_nocivos").value;
    var hta = this.antecedentesPatPersonalesFrmGrp.get("hta").value;
    var ima_icc = this.antecedentesPatPersonalesFrmGrp.get("ima_icc").value;
    var otros = this.antecedentesPatPersonalesFrmGrp.get("otros").value;
    var ram = this.antecedentesPatPersonalesFrmGrp.get("ram").value;
    var reumatologicas =
      this.antecedentesPatPersonalesFrmGrp.get("reumatologicas").value;

    if (aplica2 == true) {
      if (
        asma == "" &&
        dim == "" &&
        endocrinopatias == "" &&
        epoc_epid == "" &&
        habitos_nocivos == "" &&
        hta == "" &&
        ima_icc == "" &&
        otros == "" &&
        ram == "" &&
        reumatologicas == ""
      ) {
        this.mensaje = "NO HAY REGISTRO EN ANTECEDENTES PATOLÓGICOS PERSONALES";
        this.openDialogMensaje(this.mensaje, null, true, false, null);
        return false;
      }
    }

    var ant_pat_per = {
      aplica: aplica2,
      asma: asma,
      dim: dim,
      endocrinopatias: endocrinopatias,
      epoc_epid: epoc_epid,
      habitos_nocivos: habitos_nocivos,
      hta: hta,
      ima_icc: ima_icc,
      otros: otros,
      ram: ram,
      reumatologicas: reumatologicas,
    };

    this.dataGlobal["ant_per_gine"] = ant_per_gine;
    this.dataGlobal["ant_pat_per"] = ant_pat_per;

    var ant_onc_per = this.fieldArray.value.map((el) => {
      return {
        diagnostico: el.diagnostico,
        fecha: el.fecha,
        aplica: this.antecedentesOncoPersonalesFrmGrp.get("aplica3").value,
      };
    });

    var array1 = [];
    var array2 = [];

    for (let index = 0; index < ant_onc_per.length; index++) {
      if (
        ant_onc_per[index]["diagnostico"] == "" &&
        ant_onc_per[index]["fecha"] == ""
      ) {
        array1.push(1);
      }
    }

    for (let index = 0; index < ant_onc_per.length; index++) {
      array2.push(index);
    }

    if (aplica3_ == true) {
      if (array1.length == array2.length) {
        this.mensaje = "NO HAY REGISTRO EN ANTECEDENTES ONCOLOGICOS PERSONALES";
        this.openDialogMensaje(this.mensaje, null, true, false, null);
        return false;
      }
    }
    this.dataGlobal["ant_onc_per"] = ant_onc_per;

    var familiar_1er_grado = this.fieldFamiliar1erGrado.value.map((el) => {
      return {
        diagnostico: el.diagnostico,
        fecha: el.fecha,
      };
    });

    var familiar_2do_grado = this.fieldFamiliar2doGrado.value.map((el) => {
      return {
        diagnostico: el.diagnostico,
        fecha: el.fecha,
      };
    });

    var array3 = [];
    var array4 = [];
    var array5 = [];
    var array6 = [];

    for (let index = 0; index < familiar_1er_grado.length; index++) {
      if (
        familiar_1er_grado[index]["diagnostico"] == "" &&
        familiar_1er_grado[index]["fecha"] == ""
      ) {
        array3.push(1);
      }
    }

    for (let index = 0; index < familiar_1er_grado.length; index++) {
      array4.push(index);
    }

    for (let index = 0; index < familiar_2do_grado.length; index++) {
      if (
        familiar_2do_grado[index]["diagnostico"] == "" &&
        familiar_2do_grado[index]["fecha"] == ""
      ) {
        array5.push(1);
      }
    }

    for (let index = 0; index < familiar_2do_grado.length; index++) {
      array6.push(index);
    }

    if (aplica4_ == true) {
      if (array3.length == array4.length && array5.length == array6.length) {
        this.mensaje = "NO HAY REGISTRO EN ANTECEDENTES ONCOLOGICOS FAMILIARES";
        this.openDialogMensaje(this.mensaje, null, true, false, null);
        return false;
      }
    }

    var familiares = {
      familiar_1er_grado: familiar_1er_grado,
      familiar_2do_grado: familiar_2do_grado,
      aplica: this.antecedentesOncoFamFrmGrp.get("aplica4").value,
      otros: this.antecedentesOtros.get("otros_onco_fami").value,
    };
    this.dataGlobal["ant_onc_fam"] = familiares;
    this.detalleServicioSolEva
      .registrarAntecedentesPacientes(this.dataGlobal)
      .subscribe(
        (data) => {
          this.mensaje = data["msgResultado"];
          this.openDialogMensaje(this.mensaje, null, true, false, null);

          // if (data.status === '0') {

          // } else {
          //   console.error(data);
          //   this.mensaje = 'No se logró obtener la información correctamente.';
          //   this.openDialogMensaje(this.mensaje, null, true, false, null);
          //   this.spinnerService.hide();
          // }
        },
        (error) => {
          console.error(error);
          this.mensaje = "ERROR AL REGISTRAR EL ANTECEDENTE.";
          this.openDialogMensaje(this.mensaje, null, true, false, null);
          this.spinnerService.hide();
        }
      );
  }
  pushCirugia() {
    this.tpCirugiaArray.push(
      new FormGroup({
        fecha: new FormControl(""),
        tipo: new FormControl(""),
        hallazgo: new FormControl(""),
      })
    );
  }

  deleteArr(arr, index) {
    arr.removeAt(index);
  }

  pushRadioAyuvante() {
    // @ts-ignore
    this.tratamientoPrevioRadioterapia.controls.adyuvante.push(
      new FormGroup({
        region: new FormControl(""),
        fecha_inicio: new FormControl(""),
        tipo_dosis: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        observaciones: new FormControl(""),
      })
    );

    //@ts-ignore
    this.desactivarGrupo(
       //@ts-ignore
      this.tratamientoPrevioRadioterapia.controls.adyuvante.controls[
         //@ts-ignore
        this.tratamientoPrevioRadioterapia.controls.adyuvante.controls.length -
          1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioRadioterapia.controls.adyuvante.controls[
      //@ts-ignore
      this.tratamientoPrevioRadioterapia.controls.adyuvante.controls.length - 1
    ].controls.aplica.enable();
  }
  pushRadioNeoadyuvante() {
    // @ts-ignore

    this.tratamientoPrevioRadioterapia.controls.neoAdyuvante.push(
      new FormGroup({
        region: new FormControl(""),
        fecha_inicio: new FormControl(""),
        tipo_dosis: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioRadioterapia.controls.neoAdyuvante.controls[
        //@ts-ignore
        this.tratamientoPrevioRadioterapia.controls.neoAdyuvante.controls
          .length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioRadioterapia.controls.neoAdyuvante.controls[
      //@ts-ignore
      this.tratamientoPrevioRadioterapia.controls.neoAdyuvante.controls.length -
        1
    ].controls.aplica.enable();
  }
  pushRadioPaliativa() {
    // @ts-ignore
    this.tratamientoPrevioRadioterapia.controls.paliativa.push(
      new FormGroup({
        region: new FormControl(""),
        fecha_inicio: new FormControl(""),
        tipo_dosis: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioRadioterapia.controls.paliativa.controls[
        //@ts-ignore
        this.tratamientoPrevioRadioterapia.controls.paliativa.controls.length -
          1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioRadioterapia.controls.paliativa.controls[
      //@ts-ignore
      this.tratamientoPrevioRadioterapia.controls.paliativa.controls.length - 1
    ].controls.aplica.enable();
  }
  pushPalioDolor() {
    // @ts-ignore
    this.tratamientoPrevioPaliativo.controls.dolor.push(
      new FormGroup({
        dosis: new FormControl(""),
        tipo: new FormControl(""),
        fecha_inicio: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioPaliativo.controls.dolor.controls[
        //@ts-ignore
        this.tratamientoPrevioPaliativo.controls.dolor.controls.length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioPaliativo.controls.dolor.controls[
      //@ts-ignore
      this.tratamientoPrevioPaliativo.controls.dolor.controls.length - 1
    ].controls.aplica.enable();
  }
  pushPalioCompasivo() {
    // @ts-ignore
    this.tratamientoPrevioPaliativo.controls.compasivo.push(
      new FormGroup({
        tipo: new FormControl(""),
        fecha_inicio: new FormControl(""),
        dosis: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioPaliativo.controls.compasivo.controls[
        //@ts-ignore
        this.tratamientoPrevioPaliativo.controls.compasivo.controls.length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioPaliativo.controls.compasivo.controls[
      //@ts-ignore
      this.tratamientoPrevioPaliativo.controls.compasivo.controls.length - 1
    ].controls.aplica.enable();
  }

  pushSolidoAdyuvante() {
    // @ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.adyuvante.push(
      new FormGroup({
        fecha_inicio: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        medicamento: new FormControl(""),
        otros: new FormControl(""),
        n_cursos: new FormControl(""),
        respuesta_alcanzada: new FormControl(0),
        lugar: new FormControl(""),
        mot_inac: new FormControl(0),
        medico_tratante: new FormControl(""),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.adyuvante.controls[
        //@ts-ignore
        this.tratamientoPrevioAntineoplasica.controls.adyuvante.controls
          .length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.adyuvante.controls[
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.adyuvante.controls.length -
        1
    ].controls.aplica.enable();
  }
  pushSolidoNeoadyuvante() {
    // @ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.neoAdyuvante.push(
      new FormGroup({
        fecha_inicio: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        medicamento: new FormControl(""),
        respuesta_alcanzada: new FormControl(0),
        otros: new FormControl(""),
        n_cursos: new FormControl(""),
        lugar: new FormControl(""),
        mot_inac: new FormControl(0),
        medico_tratante: new FormControl(""),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.neoAdyuvante.controls[
        //@ts-ignore
        this.tratamientoPrevioAntineoplasica.controls.neoAdyuvante.controls
          .length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.neoAdyuvante.controls[
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.neoAdyuvante.controls
        .length - 1
    ].controls.aplica.enable();
  }
  pushSolidoMetastasico() {
    // @ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.metastasico.push(
      new FormGroup({
        fecha_inicio: new FormControl(""),
        fecha_fin: new FormControl(""),
        lineas_tratamiento: new FormControl(""),
        aplica: new FormControl(false),
        respuesta_alcanzada: new FormControl(0),
        medicamento: new FormControl(""),
        otros: new FormControl(""),
        n_cursos: new FormControl(""),
        lugar: new FormControl(""),
        mot_inac: new FormControl(0),
        medico_tratante: new FormControl(""),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.metastasico.controls[
        //@ts-ignore
        this.tratamientoPrevioAntineoplasica.controls.metastasico.controls
          .length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.metastasico.controls[
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.metastasico.controls
        .length - 1
    ].controls.aplica.enable();
  }
  pushTtlinfomaMantenimiento() {
    // @ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls.mantenimiento.push(
      new FormGroup({
        fecha_inicio: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        medicamento: new FormControl(""),
        respuesta_alcanzada: new FormControl(0),
        otros: new FormControl(""),
        organo: new FormControl(""),
        n_cursos: new FormControl(""),
        lugar: new FormControl(""),
        mot_inac: new FormControl(0),
        medico_tratante: new FormControl(""),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
       //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls
        .mantenimiento.controls[
           //@ts-ignore
        this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls
          .mantenimiento.controls.length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls.mantenimiento.controls[
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls
        .mantenimiento.controls.length - 1
    ].controls.aplica.enable();
  }

  pushTtlinfomaLineas() {
    // @ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls.lineas_tto.push(
      new FormGroup({
        lineas_tratamiento: new FormControl(""),
        fecha_inicio: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        medicamento: new FormControl(""),
        respuesta_alcanzada: new FormControl(0),
        otros: new FormControl(""),
        organo: new FormControl(""),
        n_cursos: new FormControl(""),
        lugar: new FormControl(""),
        mot_inac: new FormControl(0),
        medico_tratante: new FormControl(""),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls
        .lineas_tto.controls[
        //@ts-ignore
        this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls
          .lineas_tto.controls.length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls.lineas_tto.controls[
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttLinfoma.controls
        .lineas_tto.controls.length - 1
    ].controls.aplica.enable();
  }
  pushTtMielomaInduccion() {
    // @ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.induccion.push(
      new FormGroup({
        fecha_inicio: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        respuesta_alcanzada: new FormControl(0),
        medicamento: new FormControl(""),
        otros: new FormControl(""),
        n_cursos: new FormControl(""),
        organo: new FormControl(""),
        lugar: new FormControl(""),
        mot_inac: new FormControl(0),
        medico_tratante: new FormControl(""),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.induccion
        .controls[
        //@ts-ignore
        this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls
          .induccion.controls.length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.induccion.controls[
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.induccion
        .controls.length - 1
    ].controls.aplica.enable();
  }
  pushTtMielomaMantenimiento() {
    // @ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.mantenimiento.push(
      new FormGroup({
        fecha_inicio: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        medicamento: new FormControl(""),
        respuesta_alcanzada: new FormControl(0),
        otros: new FormControl(""),
        n_cursos: new FormControl(""),
        organo: new FormControl(""),
        lugar: new FormControl(""),
        mot_inac: new FormControl(0),
        medico_tratante: new FormControl(""),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls
        .mantenimiento.controls[
        //@ts-ignore
        this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls
          .mantenimiento.controls.length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.mantenimiento.controls[
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls
        .mantenimiento.controls.length - 1
    ].controls.aplica.enable();
  }
  pushTtMielomaRelapso() {
    // @ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.relapso.push(
      new FormGroup({
        fecha_inicio: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        medicamento: new FormControl(""),
        otros: new FormControl(""),
        n_cursos: new FormControl(""),
        respuesta_alcanzada: new FormControl(0),
        organo: new FormControl(""),
        lugar: new FormControl(""),
        mot_inac: new FormControl(0),
        medico_tratante: new FormControl(""),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.relapso
        .controls[
        //@ts-ignore
        this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.relapso
          .controls.length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.relapso.controls[
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttMieloma.controls.relapso
        .controls.length - 1
    ].controls.aplica.enable();
  }
  pushTtLeucemiaInduccion() {
    // @ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.induccion.push(
      new FormGroup({
        fecha_inicio: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        medicamento: new FormControl(""),
        otros: new FormControl(""),
        n_cursos: new FormControl(""),
        respuesta_alcanzada: new FormControl(0),
        lugar: new FormControl(""),
        mot_inac: new FormControl(0),
        medico_tratante: new FormControl(""),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls
        .induccion.controls[
        //@ts-ignore
        this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls
          .induccion.controls.length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.induccion.controls[
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls
        .induccion.controls.length - 1
    ].controls.aplica.enable();
  }
  pushTtLeucemiaMantenimiento() {
    // @ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.mantenimiento.push(
      new FormGroup({
        fecha_inicio: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        medicamento: new FormControl(""),
        respuesta_alcanzada: new FormControl(0),
        otros: new FormControl(""),
        n_cursos: new FormControl(""),
        organo: new FormControl(""),
        lugar: new FormControl(""),
        mot_inac: new FormControl(0),
        medico_tratante: new FormControl(""),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls
        .mantenimiento.controls[
        //@ts-ignore
        this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls
          .mantenimiento.controls.length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.mantenimiento.controls[
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls
        .mantenimiento.controls.length - 1
    ].controls.aplica.enable();
  }
  pushTtLeucemiaConsolidacion() {
    // @ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.consolidacion.push(
      new FormGroup({
        fecha_inicio: new FormControl(""),
        fecha_fin: new FormControl(""),
        respuesta_alcanzada: new FormControl(0),
        aplica: new FormControl(false),
        medicamento: new FormControl(""),
        otros: new FormControl(""),
        organo: new FormControl(""),
        n_cursos: new FormControl(""),
        lugar: new FormControl(""),
        mot_inac: new FormControl(0),
        medico_tratante: new FormControl(""),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls
        .consolidacion.controls[
        //@ts-ignore
        this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls
          .consolidacion.controls.length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.consolidacion.controls[
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls
        .consolidacion.controls.length - 1
    ].controls.aplica.enable();
  }
  pushTtLeucemiaRelapso() {
    // @ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.relapso.push(
      new FormGroup({
        fecha_inicio: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        medicamento: new FormControl(""),
        respuesta_alcanzada: new FormControl(0),
        organo: new FormControl(""),
        otros: new FormControl(""),
        n_cursos: new FormControl(""),
        lugar: new FormControl(""),
        mot_inac: new FormControl(0),
        medico_tratante: new FormControl(""),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.relapso
        .controls[
        //@ts-ignore
        this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls
          .relapso.controls.length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.relapso.controls[
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttLeucemia.controls.relapso
        .controls.length - 1
    ].controls.aplica.enable();
  }
  pushTtMielodisplasicoLineas() {
    // @ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttMielodisplasico.controls.lineas_tto.push(
      new FormGroup({
        n_lineas: new FormControl(""),
        fecha_inicio: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        medicamento: new FormControl(""),
        otros: new FormControl(""),
        n_cursos: new FormControl(""),
        respuesta_alcanzada: new FormControl(0),
        lugar: new FormControl(""),
        transformacion_leucemia: new FormControl(false),
        mot_inac: new FormControl(0),
        medico_tratante: new FormControl(""),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttMielodisplasico.controls
        .lineas_tto.controls[
        //@ts-ignore
        this.tratamientoPrevioAntineoplasica.controls.ttMielodisplasico.controls
          .lineas_tto.controls.length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttMielodisplasico.controls.lineas_tto.controls[
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttMielodisplasico.controls
        .lineas_tto.controls.length - 1
    ].controls.aplica.enable();
  }
  pushTtMieloprofilerativoLineas() {
    // @ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttMieloprofilerativo.controls.lineas_tto.push(
      new FormGroup({
        n_lineas: new FormControl(""),
        fecha_inicio: new FormControl(""),
        fecha_fin: new FormControl(""),
        aplica: new FormControl(false),
        medicamento: new FormControl(""),
        otros: new FormControl(""),
        lugar: new FormControl(""),
        n_cursos: new FormControl(""),
        respuesta_alcanzada: new FormControl(0),
        transformacion_leucemia: new FormControl(false),
        mot_inac: new FormControl(0),
        medico_tratante: new FormControl(""),
        observaciones: new FormControl(""),
      })
    );
    //@ts-ignore
    this.desactivarGrupo(
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttMieloprofilerativo
       //@ts-ignore
        .controls.lineas_tto.controls[
        //@ts-ignore
        this.tratamientoPrevioAntineoplasica.controls.ttMieloprofilerativo
         //@ts-ignore
          .controls.lineas_tto.controls.length - 1
      ]
    );
    //@ts-ignore
    this.tratamientoPrevioAntineoplasica.controls.ttMieloprofilerativo.controls.lineas_tto.controls[
      //@ts-ignore
      this.tratamientoPrevioAntineoplasica.controls.ttMieloprofilerativo
       //@ts-ignore
        .controls.lineas_tto.controls.length - 1
    ].controls.aplica.enable();
  }
}
