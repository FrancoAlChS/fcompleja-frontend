import {
  Component,
  OnInit,
  Inject,
  Output,
  EventEmitter,
  NgZone,
  ViewChild,
} from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ResultadoBasalRequest } from "src/app/dto/request/ResultadoBasalRequest";
import { ResultadoBasalDetResponse } from "src/app/dto/response/BandejaEvaluacion/MedicamentoNuevo/ResultadoBasalDetResponse";
import { CondicionBasalPacienteRequest } from "src/app/dto/request/CondicionBasalPacienteRequest";
import { MetastasisResponse } from "src/app/dto/response/BandejaEvaluacion/MedicamentoNuevo/MetastasisResponse";
import { MatTableDataSource, DateAdapter, MatDialog } from "@angular/material";
import { ParametroRequest } from "src/app/dto/ParametroRequest";
import {
  GRUPO_PARAMETRO,
  PARAMETRO,
  MENSAJES,
  FLAG_REGLAS_EVALUACION,
  ACCESO_EVALUACION,
  TIPOSCGSOLBEN,
  FILEFTP,
} from "src/app/common";
import { ParametroResponse } from "src/app/dto/ParametroResponse";
import { ListaParametroservice } from "src/app/service/lista.parametro.service";
import { DetalleSolicitudEvaluacionService } from "src/app/service/detalle.solicitud.evaluacion.service";
import { CustomValidator } from "src/app/directives/custom.validator";
import { WsResponse } from "src/app/dto/WsResponse";
import { EvaluacionService } from "src/app/dto/service/evaluacion.service";
import { MessageComponent } from "src/app/core/message/message.component";
import { UsuarioService } from "src/app/dto/service/usuario.service";
import { DatePipe } from "@angular/common";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { BOpcionMenuLocalStorage } from "src/app/dto/core/BOpcionMenuLocalStorage";
import { InfoSolben } from "src/app/dto/bandeja-preliminar/detalle-preliminar/InfoSolben";
import { InformeSolEvaReporteRequest } from "src/app/dto/solicitudEvaluacion/detalle/InformacionScgEvaRequest";
import { CdkTextareaAutosize } from "@angular/cdk/text-field";
import { take } from "rxjs/operators";
import { CoreService } from "src/app/service/core.service";
import { BandejaEvaluacionService } from "src/app/service/bandeja.evaluacion.service";
import { ArchivoFTP } from "src/app/dto/bandeja-preliminar/detalle-preliminar/ArchivoFTP";

@Component({
  selector: "app-condicion-basal",
  templateUrl: "./condicion-basal.component.html",
  styleUrls: ["./condicion-basal.component.scss"],
})
export class CondicionBasalComponent implements OnInit {
  @ViewChild("autosize") autosize: CdkTextareaAutosize;
  archivoRqt: any;
  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.

    this._ngZone.onStable
      .pipe(take(1))
      .subscribe(() => this.autosize.resizeToFitContent(true));
  }

  componenteCargado: boolean;
  mostrarColumnaRango: boolean;

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

  cumplePrefInst: any[] = [
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

  formGroup1Mensaje = {
    antResulBasalFrmCtrl: [
      { type: "maxlength", message: "M\u00e1ximo 4000 caracteres" },
      { type: "required", message: "Requerido *" },
    ],
  };

  mensaje: string;
  mensajeResultadoBasal: string;
  grabarPaso: string;
  maxDate: Date;
  primeraVez: boolean = true;

  @Output() btnSiguiente = new EventEmitter<boolean>();

  parametroRequest: ParametroRequest;

  condBasalFrmGrp: FormGroup = new FormGroup({
    antResulBasalFrmCtrl: new FormControl(null, [
      Validators.required,
      Validators.maxLength(4000),
    ]),
    lineaMetaFrmCtrl: new FormControl(null, Validators.required),
    lugarMetaFrmCtrl: new FormControl(null, Validators.required),
    ecogFrmCtrl: new FormControl(null, Validators.required),
    rgbExisteToxiFrmCtrl: new FormControl(null, Validators.required),
    tipoToxicidadFrmCtrl: new FormControl(
      { value: null, disabled: true },
      Validators.required
    ),
    existeToxiFrmCtrl: new FormControl(null, Validators.required),
  });

  tableBasalFrmGrp: FormGroup;

  get antResulBasalFrmCtrl() {
    return this.condBasalFrmGrp.get("antResulBasalFrmCtrl");
  }
  get lineaMetaFrmCtrl() {
    return this.condBasalFrmGrp.get("lineaMetaFrmCtrl");
  }
  get lugarMetaFrmCtrl() {
    return this.condBasalFrmGrp.get("lugarMetaFrmCtrl");
  }
  get ecogFrmCtrl() {
    return this.condBasalFrmGrp.get("ecogFrmCtrl");
  }
  get rgbExisteToxiFrmCtrl() {
    return this.condBasalFrmGrp.get("rgbExisteToxiFrmCtrl");
  }
  get tipoToxicidadFrmCtrl() {
    return this.condBasalFrmGrp.get("tipoToxicidadFrmCtrl");
  }
  get existeToxiFrmCtrl() {
    return this.condBasalFrmGrp.get("existeToxiFrmCtrl");
  }

  resultadoBasalRequest: ResultadoBasalRequest;
  resultadoBasalDetalle: ResultadoBasalDetResponse[];

  condicionBasalRequest: CondicionBasalPacienteRequest;

  metastasisLista: MetastasisResponse[];
  tablaBasal: ResultadoBasalDetResponse[];

  cmbLineaMetastasis: any[] = [];
  cmbLugarMetastasis: any[] = [];
  cmbEcog: any[] = [];
  cmbTipoToxicidad: any[] = [];

  nroMaxFilaLineaMeta: any;
  resultadoBasal: boolean;
  barResultBasal: boolean;
  cmbSeleccionado: number;
  tipoToxicidadValue: number;

  columnsMetastasis = [
    {
      codAcceso: ACCESO_EVALUACION.paso3.lineaMetastasis,
      columnDef: "descripcionLineaMetastasis",
      header: "LINEA METASTASIS",
      cell: (metasColum: MetastasisResponse) =>
        `${metasColum.descripcionLineaMetastasis}`,
    },
    {
      codAcceso: ACCESO_EVALUACION.paso3.lugarMetastasis,
      columnDef: "descripcionLugarMetastasis",
      header: "LUGAR METASTASIS",
      cell: (metasColum: MetastasisResponse) =>
        `${metasColum.descripcionLugarMetastasis}`,
    },
  ];

  columnsResBasal = [
    {
      codAcceso: ACCESO_EVALUACION.paso3.colMarcador,
      columnDef: "descripcionExamenMed",
    },
    {
      codAcceso: ACCESO_EVALUACION.paso3.colRango,
      columnDef: "rango",
    },
    {
      codAcceso: ACCESO_EVALUACION.paso3.colResultado,
      columnDef: "resultado",
    },
    {
      codAcceso: ACCESO_EVALUACION.paso3.colFechaResultado,
      columnDef: "fecResultado",
    },
  ];

  dataSourceMetas: MatTableDataSource<MetastasisResponse>;
  displayedColumnsMetas: string[];
  isLoadingMetas: boolean;

  dataSourceResBasal: MatTableDataSource<ResultadoBasalDetResponse>;
  displayedColumnsResBasal: string[];
  isLoadingBasal: boolean;

  resultadoNumberFrmCtrl: FormControl = new FormControl(
    null,
    Validators.required
  );
  resultadoTextFrmCtrl: FormControl = new FormControl(
    null,
    Validators.required
  );
  resultadoCmbFrmCtrl: FormControl = new FormControl(null, Validators.required);

  opcionMenu: BOpcionMenuLocalStorage;
  txtAntecedentes: number;
  cmbLineaMetastasisRol: number;
  cmbLugarMetastasisRol: number;
  btnAgregar: number;
  cmbEcogRol: number;
  txtExisteToxicidad: number;
  cmbTipoToxicidadRol: number;
  flagEvaluacion = FLAG_REGLAS_EVALUACION;
  flagEvaluacion_ = true;
  valorMostrarOpcion = ACCESO_EVALUACION.mostrarOpcion;

  prefInstituFrmGrp: FormGroup = new FormGroup({
    grpDiagFrmCtrl: new FormControl(null),
    condiFrmCtrl: new FormControl(null),
    tratSegGuiaFrmCtrl: new FormControl(null),
    presNoPermiFrmCtrl: new FormControl(null),
    tipTratSegGuiaFrmCtrl: new FormControl(null),
    cumpleFrmCtrl: new FormControl(null),
    sobMedFrmCtrl: new FormControl(null),
    sobGloFrmCtrl: new FormControl(null),
    sobLibProgFrmCtrl: new FormControl(null),
    observacionFrmCtrl: new FormControl(null),
  });

  get grpDiagFrmCtrl() {
    return this.prefInstituFrmGrp.get("grpDiagFrmCtrl");
  }
  get condiFrmCtrl() {
    return this.prefInstituFrmGrp.get("condiFrmCtrl");
  }
  get tratSegGuiaFrmCtrl() {
    return this.prefInstituFrmGrp.get("tratSegGuiaFrmCtrl");
  }
  get presNoPermiFrmCtrl() {
    return this.prefInstituFrmGrp.get("presNoPermiFrmCtrl");
  }
  get tipTratSegGuiaFrmCtrl() {
    return this.prefInstituFrmGrp.get("tipTratSegGuiaFrmCtrl");
  }
  get cumpleFrmCtrl() {
    return this.prefInstituFrmGrp.get("cumpleFrmCtrl");
  }
  get sobMedFrmCtrl() {
    return this.prefInstituFrmGrp.get("sobMedFrmCtrl");
  }
  get sobGloFrmCtrl() {
    return this.prefInstituFrmGrp.get("sobGloFrmCtrl");
  }
  get sobLibProgFrmCtrl() {
    return this.prefInstituFrmGrp.get("sobLibProgFrmCtrl");
  }
  get observacionFrmCtrl() {
    return this.prefInstituFrmGrp.get("observacionFrmCtrl");
  }

  infoSolben: InfoSolben;
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

  request: InformeSolEvaReporteRequest = new InformeSolEvaReporteRequest();
  public step: number;
  public step2: number;
  public codSolEvaluacion: any;
  mostrarCampoDetalle: number;
  mostrarFechaReceta: number;
  mostrarFechaQuimio: number;
  mostrarFechaHospital: number;
  proBarTabla: boolean;
  flagVerActaCmac: number;
  reporteActaCmac: string;
  flagVerInforme: number;
  reportePdf: string;
  codArchCompMed: number;
  codArchFichaTec: number;

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
  //txtGrupoDiagnostico: number;
  txtContratante: number;
  txtPlan: number;
  txtCodigoAfiliado: number;
  txtFechaAfiliacion: number;
  txtEstadioClinico: number;
  txtTNM: number;
  txtObservacion: number;
  //txtObservacion: number;
  btnEnviarAlertaMonitoreo: number;
  btnRegistrarEvaAutorizador: number;
  btnRegistrarEvaLiderTumor: number;

  constructor(
    private listaParametroservice: ListaParametroservice,
    private spinerService: Ng4LoadingSpinnerService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private detalleSolicitudEvaluacionService: DetalleSolicitudEvaluacionService,
    private _ngZone: NgZone,
    private adapter: DateAdapter<any>,
    private coreService: CoreService,
    private bandejaEvaluacionService: BandejaEvaluacionService,
    private spinnerService: Ng4LoadingSpinnerService,
    private detalleServicioSolEva: DetalleSolicitudEvaluacionService,
    @Inject(UsuarioService) private userService: UsuarioService,
    @Inject(EvaluacionService) private solicitud: EvaluacionService
  ) {
    this.componenteCargado = false;
    this.adapter.setLocale("es-PE");
  }

  ngOnInit() {
    this.accesoOpcionMenu();
    this.iniciarVariables();
  }

  public iniciarVariables() {
    this.step = 0;
    this.step2 = 0;
    this.codSolEvaluacion = this.solicitud.numeroSolEvaluacion;
    this.request.codSolEva = this.solicitud.codSolEvaluacion;
    this.infoSolben = new InfoSolben();
    this.mostrarCampoDetalle = TIPOSCGSOLBEN.mostrarCampoDetalle;
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

  /**Funcionalidad de Detalle Solicitud Evaluacion */
  public consultarInformacionScgEva() {
    this.request.codSolEva = this.solicitud.codSolEvaluacion;
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
            // this.guardarDetalleEvaluacion();
            // if (this.infoSolben.codAfiliado != null) {
            //   this.listaLineaTratamientoRequest.codigoAfiliado = this.infoSolben.codAfiliado;
            // }

            // if (
            //   this.infoSolben.estadoSolEva ===
            //   ESTADOEVALUACION.estadoObservadoAutorizador
            // ) {
            //   this.validacionLiderTumor();
            // }

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

  get fc1() {
    return this.condBasalFrmGrp.controls;
  }

  public definirTablaCondicionBasalMetas(): void {
    this.metastasisLista = [];
    this.displayedColumnsMetas = [];
    this.columnsMetastasis.forEach((c) => {
      if (this.flagEvaluacion) {
        this.displayedColumnsMetas.push(c.columnDef);
      } else {
        this.opcionMenu.opcion.forEach((element) => {
          if (
            c.codAcceso &&
            c.codAcceso === element.codOpcion &&
            Number(element.flagAsignacion) === ACCESO_EVALUACION.mostrarOpcion
          ) {
            this.displayedColumnsMetas.push(c.columnDef);
          }
        });
      }
    });
    if (this.flagEvaluacion) {
      this.displayedColumnsMetas.push("accion");
    } else {
      this.opcionMenu.opcion.forEach((element) => {
        if (element.codOpcion === ACCESO_EVALUACION.paso3.eliminar) {
          this.displayedColumnsMetas.push("accion");
        }
      });
    }
    this.dataSourceMetas = null;

    this.displayedColumnsResBasal = ["position"];
    this.columnsResBasal.forEach((c) => {
      if (this.flagEvaluacion) {
        this.displayedColumnsResBasal.push(c.columnDef);
      } else {
        this.opcionMenu.opcion.forEach((element) => {
          if (
            c.codAcceso &&
            c.codAcceso === element.codOpcion &&
            Number(element.flagAsignacion) === ACCESO_EVALUACION.mostrarOpcion
          ) {
            this.displayedColumnsResBasal.push(c.columnDef);
          }
        });
      }
    });
  }

  public definirTablaCondicionBasalResultado(): void {
    this.resultadoBasalDetalle = [];
    this.dataSourceResBasal = null;
    this.resultadoBasal = false;

    this.existeToxiFrmCtrl.setValue(0);
    this.tipoToxicidadFrmCtrl.disable();
  }

  public iniciarCondicionBasalPaciente() {
    if (this.primeraVez) {
      this.consultarInformacionScgEva();
      this.primeraVez = false;
    }
    this.maxDate = new Date();
    this.parametroRequest = new ParametroRequest();
    this.resultadoBasalRequest = new ResultadoBasalRequest();
    this.resultadoBasalRequest.codSolEva = this.solicitud.codSolEvaluacion;
    this.resultadoBasalRequest.codMac = this.solicitud.codMac;
    this.resultadoBasalRequest.codGrpDiag = this.solicitud.codGrupoDiagnostico;
    this.precargaLineaTrataPrefInst();
  }

  public cargarTablaMetastasis() {
    if (this.metastasisLista.length > 0) {
      this.dataSourceMetas = new MatTableDataSource(this.metastasisLista);
    }
  }

  public crearFormControlBasal(): void {
    if (this.resultadoBasalDetalle.length > 0) {
      const frmCtrl = {};
      this.resultadoBasalDetalle.forEach(
        (resultado: ResultadoBasalDetResponse) => {
          const fechaTemp: Date =
            resultado.fecResultado != null ? resultado.fecResultado : null;

          frmCtrl[`f${resultado.codResultadoBasal}`] = new FormControl(null, [
            Validators.required,
          ]);
          frmCtrl[`f${resultado.codResultadoBasal}`].setValue(
            fechaTemp !== null
              ? new Date(this.datePipe.transform(fechaTemp, "yyyy/MM/dd"))
              : new Date(this.datePipe.transform(new Date(), "yyyy/MM/dd"))
          );
          switch (resultado.tipoIngresoResul) {
            case 122:
              frmCtrl[`r${resultado.codResultadoBasal}`] = new FormControl(
                resultado.resultado,
                [
                  Validators.required,
                  CustomValidator.checkLimit(
                    resultado.minLength,
                    resultado.maxLength
                  ),
                ]
              );
              this.mostrarColumnaRango = true;
              break;
            case 123:
              if (resultado.resultado != null) {
                this.cmbSeleccionado = Number(resultado.resultado);
              }
              frmCtrl[`r${resultado.codResultadoBasal}`] = new FormControl(
                this.cmbSeleccionado,
                [Validators.required]
              );
              break;
            case 124:
              frmCtrl[`r${resultado.codResultadoBasal}`] = new FormControl(
                resultado.resultado,
                [Validators.required]
              );
              break;
          }
        }
      );

      if (this.mostrarColumnaRango) {
        this.displayedColumnsResBasal = [
          "position",
          "descripcionExamenMed",
          "rango",
          "resultado",
          "fecResultado",
        ];
      } else {
        this.displayedColumnsResBasal = [
          "position",
          "descripcionExamenMed",
          "resultado",
          "fecResultado",
        ];
      }

      this.tableBasalFrmGrp = new FormGroup(frmCtrl);
      this.resultadoBasal = true;
    } else {
    }
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

  public Validacion(): boolean {
    let valido = true;
    this.mensaje = "";
    const auxAntecendente =
      this.antResulBasalFrmCtrl.value === null
        ? 0
        : this.antResulBasalFrmCtrl.value.length;
    if (auxAntecendente === 0 || auxAntecendente > 4000) {
      valido = false;
      this.mensaje = this.mensaje + "*Corregir antecendetes de importancia";
      this.antResulBasalFrmCtrl.markAsTouched();
    }

    // if (this.metastasisLista.length === 0) {
    //   valido = false;
    //   this.lineaMetaFrmCtrl.markAsTouched();
    //   this.lugarMetaFrmCtrl.markAsTouched();
    //   this.mensaje = this.mensaje + '\n*Agregar linea y lugar de metástasis.';
    // }

    if (this.ecogFrmCtrl.value === null) {
      valido = false;
      this.ecogFrmCtrl.markAsTouched();
      this.mensaje = this.mensaje + "\n*Seleccionar ECOG.";
    }

    if (this.existeToxiFrmCtrl.value === null) {
      valido = false;
      this.existeToxiFrmCtrl.markAsTouched();
      this.mensaje = this.mensaje + "\n*Indicar si existe toxicidad.";
    }

    if (
      this.existeToxiFrmCtrl.value === 1 &&
      this.tipoToxicidadFrmCtrl.value === null
    ) {
      valido = false;
      this.tipoToxicidadFrmCtrl.markAsTouched();
      this.mensaje = this.mensaje + "\n*Seleccionar tipo de toxicidad.";
    }

    if (this.resultadoBasalDetalle.length == 0) {
      valido = false;
      this.mensaje =
        this.mensaje +
        "\n*No existe la configuracion de condicion basal para " +
        this.solicitud.descMAC +
        " y " +
        this.solicitud.descGrupoDiagnostico +
        ", solicite la configuracion al administrador.";
    } else {
      if (this.tableBasalFrmGrp.invalid) {
        valido = false;
        this.resultadoBasalDetalle.forEach(
          (resultado: ResultadoBasalDetResponse) => {
            this.tableBasalFrmGrp.controls[
              "r" + resultado.codResultadoBasal
            ].markAsTouched();
            this.tableBasalFrmGrp.controls[
              "f" + resultado.codResultadoBasal
            ].markAsTouched();
          }
        );
        this.mensaje =
          this.mensaje + "\n*Llenar y/o corregir los resultados de la tabla.";
      }
    }

    return valido;
  }

  // // Guardar Linea de Tratamiento / Preferencia Institucional Paso 1
  public insertarLineaTratamiento() {
    var request = {
      codSolEva: this.solicitud.codSolEvaluacion,
      cumplePrefeInsti: this.cumpleFrmCtrl.value,
      observacion: this.observacionFrmCtrl.value,
      codigoRolUsuario: this.userService.getCodRol,
      codigoUsuario: this.userService.getCodUsuario,
    };

    this.spinnerService.show();
    this.detalleSolicitudEvaluacionService
      .insertarLineaTratamiento(request)
      .subscribe(
        (data) => {
          if (data["codResultado"] === 0) {
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

  public visualizarInformeAutorizador(): void {
    this.archivoRqt = new ArchivoFTP();
    this.archivoRqt.codArchivo = this.solicitud.codInformePDF;
    this.archivoRqt.ruta = FILEFTP.rutaInformeAutorizador;
    this.descargarDocumento2();
  }

  public insActCondicionBasalPac() {
    this.spinerService.show();
    this.detalleSolicitudEvaluacionService
      .insActCondicionBasalPac(this.condicionBasalRequest)
      .subscribe(
        (data: WsResponse) => {
          if (data.audiResponse.codigoRespuesta === "0") {
            this.grabarPaso = "1";
            this.btnSiguiente.emit(false);
            this.openDialogMensaje(
              data.audiResponse.mensajeRespuesta,
              null,
              true,
              false,
              null
            );
          } else {
            this.grabarPaso = "1";
            this.btnSiguiente.emit(true);
            this.mensaje = data.audiResponse.mensajeRespuesta;
            this.openDialogMensaje(
              MENSAJES.ERROR_NOFUNCION,
              this.mensaje,
              true,
              false,
              null
            );
          }
          this.spinerService.hide();
        },
        (error) => {
          console.error(error);
          this.grabarPaso = "1";
          this.btnSiguiente.emit(true);
          this.mensaje =
            "Error al grabar/modificar Condición basal del Paciente.";
          this.openDialogMensaje(
            MENSAJES.ERROR_NOFUNCION,
            this.mensaje,
            true,
            false,
            null
          );
          this.spinerService.hide();
        }
      );
  }

  public guardarCondicionBasal() {
    // if (this.Validacion()) {
    //   this.guardarParametros();
    this.insertarLineaTratamiento();
    // } else {
    //   this.openDialogMensaje(MENSAJES.ERROR_CAMPOS, this.mensaje, true, false, null);
    // }
  }

  public obtenerCombo(lista: any[], valor: number, descripcion: string) {
    if (lista !== null) {
      lista.unshift({
        codigoParametro: valor,
        nombreParametro: descripcion,
      });
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
        title: MENSAJES.medicNuevo.condBasalPcte.TITLE,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((rspta) => {});
  }

  public accesoOpcionMenu() {
    const data = require("src/assets/data/permisosRecursos.json");
    const bandejaEvaluacion = data.bandejaEvaluacion.paso3;
    const bandejaEvaluacion2 = data.bandejaEvaluacion.detalle;
    this.opcionMenu = JSON.parse(localStorage.getItem("opcionMenu"));

    if (this.opcionMenu.opcion.length > 0) {
      this.opcionMenu.opcion.forEach((element) => {
        const codOpcion = element.codOpcion;
        switch (codOpcion) {
          case bandejaEvaluacion.txtAntecedentes:
            this.txtAntecedentes = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.cmbLineaMetastasisRol:
            this.cmbLineaMetastasisRol = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.cmbLugarMetastasisRol:
            this.cmbLugarMetastasisRol = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.btnAgregar:
            this.btnAgregar = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.cmbEcogRol:
            this.cmbEcogRol = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.txtExisteToxicidad:
            this.txtExisteToxicidad = Number(element.flagAsignacion);
            break;
          case bandejaEvaluacion.cmbTipoToxicidadRol:
            this.cmbTipoToxicidadRol = Number(element.flagAsignacion);
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

  public precargaLineaTrataPrefInst() {
    // this.lineaTratRequest.codSolEva = this.solicitud.codSolEvaluacion;
    // this.lineaTratRequest.codGrupoDiag = this.solicitud.codGrupoDiagnostico;
    let json = {
      codSolEva: this.solicitud.codSolEvaluacion,
      codGrupoDiag: this.solicitud.codGrupoDiagnostico,
      codigoUsuario: this.userService.getCodUsuario,
    };

    this.spinnerService.show();
    this.detalleSolicitudEvaluacionService
      .conInsActPreferenciaInstiPre(json)
      .subscribe(
        (data: WsResponse) => {
          if (data.data !== null) {
            if (data.data["preferenciaInsti"].length == 0) {
              this.grpDiagFrmCtrl.setValue("");
              this.condiFrmCtrl.setValue("");
              this.tratSegGuiaFrmCtrl.setValue(null);
              this.presNoPermiFrmCtrl.setValue("");
              this.tipTratSegGuiaFrmCtrl.setValue("");
              this.cumpleFrmCtrl.setValue(data.data["cumplePrefeInsti"]);
              this.sobMedFrmCtrl.setValue("");
              this.sobGloFrmCtrl.setValue("");
              this.sobLibProgFrmCtrl.setValue("");
              this.observacionFrmCtrl.setValue(data.data["observacion"]);
            } else {
              this.mostrarInformacionPrefeInstitu(
                data.data["preferenciaInsti"],
                data.data["observacion"],
                data.data["cumplePrefeInsti"]
              );
            }

            // this.lineaTratRequest.nroCurso = data.data.nroCurso;
            // this.consultarNroCursos(true, this.lineaTratRequest.nroCurso);

            // this.lineaTratRequest.tipoTumor = data.data.tipoTumor;
            // this.lineaTratRequest.respAlcanzada = data.data.respuestaAlcanzada;

            // this.consultarTipoTumor(true, data.data.tipoTumor, data.data.respuestaAlcanzada);

            // this.lineaTratRequest.lugarProgresion = data.data.lugarProgresion;
            // this.consultarLugarProgresion(true, data.data.lugarProgresion);

            // this.listaCondicionCancer = data.data.cmbCondicion;

            // this.lineaTratRequest.cumplePrefeInsti = data.data.cumplePrefInsti;
            // this.lineaTratRequest.observacion = data.data.observacion;
            // this.rgPrefInstiFrmCtrl.setValue(data.data.cumplePrefInsti);

            this.grabarPaso = data.data.grabar;

            if (this.grabarPaso === "1") {
              this.btnSiguiente.emit(false);
            } else {
              this.btnSiguiente.emit(true);
            }
            this.spinnerService.hide();
          } else {
            // this.consultarNroCursos(false, null);
            // this.consultarTipoTumor(false, null, null);
            // this.consultarLugarProgresion(false, null);
            this.btnSiguiente.emit(true);
            this.spinnerService.hide();
          }
          // this.consultarMacTratamiento(true, null);

          // if (existeLinea && data.data !== null && data.data.condicion !== null) {
          //   this.lineaTratRequest.condicionCancer = data.data.condicion;
          //   this.condicionCancerFrmCtrl.setValue(data.data.condicion);
          //   this.consultarMacTratamiento(true, null);
          // }
          this.spinnerService.hide();
        },
        (error) => {
          console.error(error);
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            "Error al cargar data inicial grabada.",
            true,
            false,
            null
          );
          this.spinnerService.hide();
        }
      );
  }

  mostrarInformacionPrefeInstitu(
    preferenciaInsti,
    observacion,
    cumplePrefeInsti
  ) {
    this.grpDiagFrmCtrl.setValue(preferenciaInsti[0].nombreDiagnostico);
    this.condiFrmCtrl.setValue(preferenciaInsti[0].condicion);
    this.tratSegGuiaFrmCtrl.setValue(preferenciaInsti[0].tratamiento);
    this.presNoPermiFrmCtrl.setValue(preferenciaInsti[0].presentacNoPermitida);
    this.tipTratSegGuiaFrmCtrl.setValue(preferenciaInsti[0].strTipoTratamiento);
    this.cumpleFrmCtrl.setValue(cumplePrefeInsti);
    this.sobMedFrmCtrl.setValue(preferenciaInsti[0].sobrevidamedia);
    this.sobGloFrmCtrl.setValue(preferenciaInsti[0].sobrevidaglobal);
    this.sobLibProgFrmCtrl.setValue(
      preferenciaInsti[0].sobrevidalibredeprogresion
    );
    this.observacionFrmCtrl.setValue(observacion);
  }

  public setStep(index: number): void {
    this.step = index;
  }

  public setStep2(index: number): void {
    this.step2 = index;
  }

  public generarReportePaso3(vista: boolean): void {
    //this.guardarRequestInforme();
    var data = {
      codSolEva: this.solicitud.codSolEvaluacion,
    };

    this.detalleSolicitudEvaluacionService.generarReportePaso3(data).subscribe(
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
}
