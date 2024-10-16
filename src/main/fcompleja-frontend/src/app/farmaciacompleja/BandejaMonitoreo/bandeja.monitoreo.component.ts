import {
  Component,
  OnInit,
  ViewChild,
  forwardRef,
  Inject,
} from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Parametro } from "src/app/dto/Parametro";
import {
  MatDialog,
  MatPaginator,
  MatSort,
  MatTableDataSource,
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
  MatPaginatorIntl,
  MatIconRegistry,
} from "@angular/material";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import {
  MY_FORMATS_AUNA,
  ROLES,
  GRUPO_PARAMETRO,
  ACCESO_MONITOREO,
  FLAG_REGLAS_MONITOREO,
  ESTADO_MONITOREO,
  MENSAJES,
} from "src/app/common";
import { MatPaginatorIntlEspanol } from "src/app/directives/matpaginator-translate";
import { DomSanitizer } from "@angular/platform-browser";
import { BandejaMonitoreoService } from "src/app/service/BandejaMonitoreo/bandeja.monitoreo.service";
import { BandejaMonitoreoRequest } from "src/app/dto/request/BandejaMonitoreo/BandejaMonitoreoRequest";
import { WsResponse } from "src/app/dto/WsResponse";
import { ListaFiltroUsuarioRolservice } from "src/app/service/Lista.usuario.rol.service";
import { ListaParametroservice } from "src/app/service/lista.parametro.service";
import { ParametroRequest } from "src/app/dto/ParametroRequest";
import { ExcelDownloadResponse } from "src/app/dto/ExcelDownloadResponse";
import { ExcelExportService } from "src/app/service/excel.bandeja.pre.service";
import { Router, ActivatedRoute } from "@angular/router";
import { BuscarPacienteComponent } from "src/app/modal/buscar-paciente/buscar-paciente.component";
import { Paciente } from "src/app/dto/Paciente";
import { BuscarClinicaComponent } from "src/app/modal/buscar-clinica/buscar-clinica.component";
import { Clinica } from "src/app/dto/Clinica";
import { DatePipe } from "@angular/common";
import { UsuarioService } from "src/app/dto/service/usuario.service";
import { MonitoreoResponse } from "src/app/dto/response/BandejaMonitoreo/MonitoreoResponse";
import { ParticipanteRequest } from "src/app/dto/request/BandejaEvaluacion/ParticipanteRequest";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { BOpcionMenuLocalStorage } from "src/app/dto/core/BOpcionMenuLocalStorage";
import * as _moment from "moment";
import { MessageComponent } from "src/app/core/message/message.component";

const moment = _moment;

@Component({
  selector: "app-bandeja.monitoreo",
  templateUrl: "./bandeja.monitoreo.component.html",
  styleUrls: ["./bandeja.monitoreo.component.scss"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: MY_FORMATS_AUNA,
    },
    {
      provide: MatPaginatorIntl,
      useClass: forwardRef(() => MatPaginatorIntlEspanol),
    },
  ],
})
export class BandejaMonitoreoComponent implements OnInit {
  banMonitoreoFrmGrp: FormGroup = new FormGroup({
    pacienteFrmCtrl: new FormControl(null),
    estadoMonitoreoFrmCtrl: new FormControl(null),
    clinicaFrmCtrl: new FormControl(null),
    fechaMonitoreoDesdeFrmCtrl: new FormControl(null),
    fechaMonitoreoHastaFrmCtrl: new FormControl(null),
    fechaAprobacionDesdeFrmCtrl: new FormControl(null),
    fechaAprobacionHastaFrmCtrl: new FormControl(null),
    responsableFrmCtrl: new FormControl(null),
    pEstSeguimientoFrmCtrl: new FormControl(null, [Validators.required]),
  });

  get pacienteFrmCtrl() {
    return this.banMonitoreoFrmGrp.get("pacienteFrmCtrl");
  }
  get estadoMonitoreoFrmCtrl() {
    return this.banMonitoreoFrmGrp.get("estadoMonitoreoFrmCtrl");
  }
  get clinicaFrmCtrl() {
    return this.banMonitoreoFrmGrp.get("clinicaFrmCtrl");
  }
  get fechaMonitoreoDesdeFrmCtrl() {
    return this.banMonitoreoFrmGrp.get("fechaMonitoreoDesdeFrmCtrl");
  }
  get fechaMonitoreoHastaFrmCtrl() {
    return this.banMonitoreoFrmGrp.get("fechaMonitoreoHastaFrmCtrl");
  }
  get fechaAprobacionDesdeFrmCtrl() {
    return this.banMonitoreoFrmGrp.get("fechaAprobacionDesdeFrmCtrl");
  }
  get fechaAprobacionHastaFrmCtrl() {
    return this.banMonitoreoFrmGrp.get("fechaAprobacionHastaFrmCtrl");
  }
  get responsableFrmCtrl() {
    return this.banMonitoreoFrmGrp.get("responsableFrmCtrl");
  }
  get pEstSeguimientoFrmCtrl() {
    return this.banMonitoreoFrmGrp.get("pEstSeguimientoFrmCtrl");
  }

  listaEstadosMonitoreo: Parametro[] = [];
  listaResponsableMonitoreo: any[] = [];
  listaMonitoreo: MonitoreoResponse[] = [];
  listaMonitoreoExcel = new BandejaMonitoreoRequest();
  ExportExcelBandMonitoreo: string;
  clinicaBusqueda: Clinica = new Clinica();
  pacienteBusqueda: Paciente = new Paciente();
  cmbEstadoSeguimiento: any[];

  //code luis
  tipoDoc: string;
  numDoc: string;
  nombre1: string;
  nombre2: string;
  apePaterno: string;
  apeMaterno: string;
  maxDate: Date;

  btnBuscarMoni: boolean

  public isLoading: boolean;
  public columnsGrilla = [
    {
      codAcceso: ACCESO_MONITOREO.bandeja.codigoTarea,
      columnDef: "codigoDescripcionMonitoreo",
      header: "CODIGO TAREA MONITOREO",
      cell: (monitoreo: MonitoreoResponse) =>
        `${monitoreo.codigoDescripcionMonitoreo}`,
    },
    {
      codAcceso: ACCESO_MONITOREO.bandeja.numeroSolicitud,
      columnDef: "codigoEvaluacion",
      header: "N° SOLICITUD EVALUACIÓN",
      cell: (monitoreo: MonitoreoResponse) => `${monitoreo.codigoEvaluacion}`,
    },
    {
      codAcceso: ACCESO_MONITOREO.bandeja.fechaAprobacion,
      columnDef: "fechAprobacion",
      header: "FECHA DE APROBACION",
      cell: (monitoreo: MonitoreoResponse) =>
        this.datePipe.transform(monitoreo.fechAprobacion, "dd/MM/yyyy"),
    },
    {
      codAcceso: ACCESO_MONITOREO.bandeja.numeroSGC,
      columnDef: "codigoScgSolben",
      header: "N° SCG SOLBEN",
      cell: (monitoreo: MonitoreoResponse) =>
        monitoreo.codigoScgSolben != null ? `${monitoreo.codigoScgSolben}` : "",
    },
    /*{
      codAcceso: ACCESO_MONITOREO.bandeja.medicamentoSolicitado,
      columnDef: 'nroCartaGarantia',
      header: 'N° CG SOLBEN',
      cell: (monitoreo: MonitoreoResponse) => monitoreo.nroCartaGarantia!=null?`${monitoreo.nroCartaGarantia}`:''
    },*/
    {
      codAcceso: ACCESO_MONITOREO.bandeja.medicamentoSolicitado,
      columnDef: "nomMedicamento",
      header: "MEDICAMENTO SOLICITADO",
      cell: (monitoreo: MonitoreoResponse) => `${monitoreo.nomMedicamento}`,
    },
    {
      codAcceso: ACCESO_MONITOREO.bandeja.lineaTratamiento,
      columnDef: "nomEstSeguimiento",
      header: "ESTADO DE SEGUIMIENTO",
      cell: (monitoreo: MonitoreoResponse) =>
        monitoreo.nomEstSeguimiento != null
          ? `${monitoreo.nomEstSeguimiento}`
          : "-",
    },
    //  {
    //   codAcceso: ACCESO_MONITOREO.bandeja.lineaTratamiento,
    //   columnDef: 'numeroLineaTratamiento',
    //   header: 'LINEA TRATAMIENTO ACTUAL',
    //   cell: (monitoreo: MonitoreoResponse) => monitoreo.numeroLineaTratamiento != null ? `L${monitoreo.numeroLineaTratamiento}` : ''
    // },
    {
      codAcceso: ACCESO_MONITOREO.bandeja.paciente,
      columnDef: "nombrePaciente",
      header: "PACIENTE",
      cell: (monitoreo: MonitoreoResponse) =>
        monitoreo.nombrePaciente != null ? `${monitoreo.nombrePaciente}` : "-",
    },
    {
      codAcceso: ACCESO_MONITOREO.bandeja.estado,
      columnDef: "nomEstadoMonitoreo",
      header: "ESTADO DE MONITOREO",
      cell: (monitoreo: MonitoreoResponse) => `${monitoreo.nomEstadoMonitoreo}`,
    },
    {
      codAcceso: ACCESO_MONITOREO.bandeja.resultado,
      columnDef: "nomResultMonitoreo",
      header: "RESULTADO DE MONITOREO",
      cell: (monitoreo: MonitoreoResponse) => `${monitoreo.nomResultMonitoreo}`,
    },
    {
      codAcceso: ACCESO_MONITOREO.bandeja.fechaProgramada,
      columnDef: "fechaProximoMonitoreo",
      header: "FECHA PRÓXIMO MONITOREO",
      cell: (monitoreo: MonitoreoResponse) =>
        this.datePipe.transform(monitoreo.fechaProximoMonitoreo, "dd/MM/yyyy"),

      /*{
        let time = new Date(monitoreo.fechAprobacion)
        time.setDate(time.getDate()+ 29)
        return this.datePipe.transform(time, 'dd/MM/yyyy')
      }*/
    },
    {
      codAcceso: ACCESO_MONITOREO.bandeja.responsable,
      columnDef: "nomResponsableMonitoreo",
      header: "RESPONSABLE DE MONITOREO",
      cell: (monitoreo: MonitoreoResponse) =>
        monitoreo.nomResponsableMonitoreo != null
          ? `${monitoreo.nomResponsableMonitoreo}`
          : "-",
    },
  ];

  public displayedColumns: string[];
  public dataSource: MatTableDataSource<MonitoreoResponse>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  opcionMenu: BOpcionMenuLocalStorage;
  txtPaciente: number;
  txtClinica: number;
  cmbResponsable: number;
  cmbEstado: number;
  txtFecha: number;
  btnBuscar: number;
  btnExportar: number;
  flagEvaluacion = FLAG_REGLAS_MONITOREO;
  valorMostrarOpcion = ACCESO_MONITOREO.mostrarOpcion;
  totalDisplayedColumns: number = 0;
  usuarioSeguimiento = true;
  labelUsuarioSeg = "FECHA DE PROXIMO MONITOREO DESDE";

  constructor(
    public dialog: MatDialog,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private bandejaMonitoreoService: BandejaMonitoreoService,
    private usuarioRolService: ListaFiltroUsuarioRolservice,
    private parametroService: ListaParametroservice,
    private excelExportService: ExcelExportService,
    private router: Router,
    private datePipe: DatePipe,
    private spinnerService: Ng4LoadingSpinnerService,
    @Inject(UsuarioService) private userService: UsuarioService
  ) {}

  ngOnInit() {
    this.accesoOpcionMenu();

    if (this.userService.getCodRol == 6) {
      this.usuarioSeguimiento = false;
      this.labelUsuarioSeg = "FECHA MONITOREO";
    }

    const validarIntervalo = setInterval(() => {
      if (this.userService.getCodRol) {
        this.inicializarVariables();
        this.definirTablaHistoria();
        this.iconRegistry.addSvgIcon(
          "excel-icon",
          this.sanitizer.bypassSecurityTrustResourceUrl(
            "./assets/img/icon-excel-2.svg"
          )
        );

        // if (this.userService.getCodRol == ROLES.responsableMonitoreo) {
        //   this.responsableFrmCtrl.disable();
        //   this.responsableFrmCtrl.setValue(this.userService.getCodUsuario);
        // }else{
        // }
        clearInterval(validarIntervalo);
      }
    }, 100);

    localStorage.removeItem("modeConsulta");
    localStorage.removeItem("modeConsultaEva");
    localStorage.removeItem("modeConsultCont");
  }

  public inicializarVariables(): void {
    this.dataSource = null;
    this.isLoading = false;
    this.maxDate = new Date();
    this.cmbEstadoSeguimiento = [];
    this.cargarComboResponsableMonit();
    
    this.responsableFrmCtrl.setValue(0);

    /*if (this.userService.getCodRol == ROLES.ejecutivoSeguimiento) {
      this.banMonitoreoFrmGrp.get('estadoMonitoreoFrmCtrl').setValue(ESTADO_MONITOREO.pendienteInformacion);
    } else {*/
    this.banMonitoreoFrmGrp
      .get("estadoMonitoreoFrmCtrl")
      .setValue(ESTADO_MONITOREO.pendienteMonitoreo);
    //}
    this.busquedaMonitoreo();
  }

  public definirTablaHistoria(): void {
    this.displayedColumns = [];
    if (this.opcionMenu.opcion.length > 0) {
      this.opcionMenu.opcion.push({
        codOpcion: 13001,
        tipoOpcion: "132",
        nombreCorto: "RESULTADO MONITOREO",
        flagAsignacion: "1",
      });
    }
    this.columnsGrilla.forEach((c) => {
      this.opcionMenu.opcion.forEach((element) => {
        if (
          c.codAcceso &&
          c.codAcceso === element.codOpcion &&
          Number(element.flagAsignacion) === ACCESO_MONITOREO.mostrarOpcion
        ) {
          this.displayedColumns.push(c.columnDef);
        }
      });
    });
    this.opcionMenu.opcion.forEach((element) => {
      if (element.codOpcion === ACCESO_MONITOREO.bandeja.revisarDetalle) {
        this.displayedColumns.push("verDetalle");
      }
    });
    this.totalDisplayedColumns = this.displayedColumns.length;
  }

  public cargarDatosTabla(): void {
    if (this.listaMonitoreo.length > 0) {
      this.dataSource = new MatTableDataSource(this.listaMonitoreo);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
    this.btnBuscarMoni=false;
  }

  public busquedaMonitoreo(): void {
    this.btnBuscarMoni=true;
    this.isLoading = true;
    this.dataSource = null;
    this.listaMonitoreo = [];
    const request = new BandejaMonitoreoRequest();
    //request.codigoPaciente = this.pacienteBusqueda.codafir;
    request.estadoMonitoreo = this.banMonitoreoFrmGrp.get(
      "estadoMonitoreoFrmCtrl"
    ).value;
    request.codigoClinica =
      this.clinicaBusqueda.codcli != undefined
        ? this.clinicaBusqueda.codcli
        : (this.clinicaBusqueda.codcli = null);
    request.fechaMonitoreo = this.banMonitoreoFrmGrp.get(
      "fechaMonitoreoDesdeFrmCtrl"
    ).value;
    request.codigoResponsableMonitoreo =
      this.banMonitoreoFrmGrp.get("responsableFrmCtrl").value;
    request.tipoDoc =
      this.tipoDoc != undefined ? this.tipoDoc : (this.tipoDoc = null);
    request.nroDoc =
      this.numDoc != undefined ? this.numDoc : (this.numDoc = null);
    request.nombre1 =
      this.nombre1 != undefined ? this.nombre1 : (this.nombre1 = null);
    request.nombre2 =
      this.nombre2 != undefined ? this.nombre2 : (this.nombre2 = null);
    request.apePaterno =
      this.apePaterno != undefined ? this.apePaterno : (this.apePaterno = null);
    request.apeMaterno =
      this.apeMaterno != undefined ? this.apeMaterno : (this.apeMaterno = null);
    request.fecProxMonHasta = this.banMonitoreoFrmGrp.get(
      "fechaMonitoreoHastaFrmCtrl"
    ).value;

    request.fecAprovaDesde = this.banMonitoreoFrmGrp.get(
      "fechaAprobacionDesdeFrmCtrl"
    ).value;

    request.fecAprovaHasta = this.banMonitoreoFrmGrp.get(
      "fechaAprobacionHastaFrmCtrl"
    ).value;

    request.estSeguimiento =
      this.pEstSeguimientoFrmCtrl.value != 0
        ? this.pEstSeguimientoFrmCtrl.value
        : null;

    this.bandejaMonitoreoService.consultarMonitoreo(request).subscribe(
      (data: WsResponse) => {
        if (data.audiResponse.codigoRespuesta == "0") {
          this.listaMonitoreo = data.data;
          this.listaMonitoreoExcel = request;
        }
        this.cargarDatosTabla();
        this.isLoading = false;
      },
      (error) => {
        console.error("Error al listar monitoreo");
        this.isLoading = false;
      }
    );
  }

  public exportExcelMonitoreo(): void {
    this.spinnerService.show();
    const request = new BandejaMonitoreoRequest();
    request.codigoClinica = this.listaMonitoreoExcel.codigoClinica;
    request.codigoPaciente = this.listaMonitoreoExcel.codigoPaciente;
    request.codigoResponsableMonitoreo =
      this.listaMonitoreoExcel.codigoResponsableMonitoreo;
    request.estadoMonitoreo = this.listaMonitoreoExcel.estadoMonitoreo;
    request.fechaMonitoreo = this.listaMonitoreoExcel.fechaMonitoreo;
    this.excelExportService.ExportExcelBandejaMonitoreo(request).subscribe(
      (data: ExcelDownloadResponse) => {
        this.spinnerService.hide();
        this.ExportExcelBandMonitoreo = data.url;
        const urlMonitoreo = this.ExportExcelBandMonitoreo;
        const win = window.open(urlMonitoreo);
        win.blur();
      },
      (error) => {
        this.spinnerService.hide();
        console.error();
      }
    );
  }

  public verDetalleMonitoreo(row: MonitoreoResponse): void {
    localStorage.setItem(
      "codigoTareaMonitoreo",
      String(row.codigoDescripcionMonitoreo)
    );
    localStorage.setItem("monitoreo", JSON.stringify(row));
    this.router.navigate(["/app/monitoreo-paciente"]);
  }

  public cargarComboEstadoMonit() {
    let request = new ParametroRequest();
    request.codigoGrupo = GRUPO_PARAMETRO.estadoMonitoreo;
    this.parametroService.consultarParametro(request).subscribe(
      (data: WsResponse) => {
        if (data.audiResponse.codigoRespuesta === "0") {
          //SIN FILTRO
          let param = new Parametro();
          param.codigoParametro = "";
          param.nombreParametro = "TODOS";
          this.listaEstadosMonitoreo.push(param);

          data.data.forEach((elem) => {
            this.listaEstadosMonitoreo.push(elem);
          });

          //GUARDAR VARIABLE LISTA MONITOREO
          localStorage.setItem(
            "listaEstadosMonitoreo",
            JSON.stringify(this.listaEstadosMonitoreo)
          );
          this.cargarComboEstadoSeguimiento();
          //ESTABLECE DATO PENDIENTE Y LISTA MONITOREOS
          //const toSelect = this.listaEstadosMonitoreo.find(c => c.codigoParametro == 118);
        } else {
          console.error(data);
        }
      },
      (error) => {
        console.error("Error al listar parametros");
      }
    );
  }

  public cargarComboEstadoSeguimiento() {
    let request = new ParametroRequest();
    request.codigoGrupo = GRUPO_PARAMETRO.estadoSeguimiento; //'65';
    this.parametroService.consultarParametro(request).subscribe(
      (data: WsResponse) => {
        if (data.audiResponse.codigoRespuesta === "0") {
          this.cmbEstadoSeguimiento = data.data;
          this.cmbEstadoSeguimiento.unshift({
            codigoParametro: "",
            nombreParametro: "SELECCIONE",
          });
        } else {
          console.error(data);
        }
        //SETEAR VALOR POR DEFECTO
        //this.pEstSeguimientoFrmCtrl.setValue('');
      },
      (error) => {
        console.error("Error al listar parametros");
      }
    );
  }

  public cargarComboResponsableMonit() {
    let request = new ParticipanteRequest();
    request.codRol = ROLES.responsableMonitoreo;

    this.usuarioRolService.listarUsuarioFarmacia(request).subscribe(
      (data: WsResponse) => {
        if (data.audiResponse.codigoRespuesta == "0") {
          this.listaResponsableMonitoreo = data.data;
          this.listaResponsableMonitoreo.forEach((element) => {
            element.nombrecompleto = element.apellidos + ", " + element.nombres;
          });
          this.listaResponsableMonitoreo.unshift({
            codUsuario: 0,
            nombrecompleto: "TODOS",
          });
          this.cargarComboEstadoMonit();
        } else {
          console.error(data);
        }
      },
      (error) => {
        console.error(
          "Error al listar el Usuario del Rol Responsable monitoreo"
        );
      }
    );
  }

  // POPPUP PACIENTE
  public abrirBuscarPaciente(): void {
    const dialogRef = this.dialog.open(BuscarPacienteComponent, {
      width: "640px",
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result: Paciente) => {
      if (result !== null) {
        this.pacienteFrmCtrl.setValue(
          (result.apepat ? result.apepat : "") +
            " " +
            (result.apemat ? result.apemat : "") +
            ", " +
            (result.nombr1 ? result.nombr1 : "") +
            " " +
            (result.nombr2 ? result.nombr2 : "")
        );
        this.pacienteBusqueda = result;
        this.tipoDoc = result.tipdoc;
        this.numDoc = result.numdoc;
        this.nombre1 = result.nombr1;
        this.nombre2 = result.nombr2;
        this.apePaterno = result.apepat;
        this.apeMaterno = result.apemat;
        this.busquedaMonitoreo();
      } else {
        this.pacienteFrmCtrl.setValue(null);
        this.pacienteBusqueda = new Paciente();
      }
    });
  }

  public limpiarControl(evt: any, form: string) {
    if (form == "pacienteFrmCtrl") {
      this.banMonitoreoFrmGrp.get(form).setValue(null);
      this.pacienteBusqueda = new Paciente();
      this.tipoDoc = null;
      this.numDoc = null;
      this.nombre1 = null;
      this.nombre2 = null;
      this.apePaterno = null;
      this.apeMaterno = null;
    }

    if (form == "clinicaFrmCtrl") {
      this.banMonitoreoFrmGrp.get(form).setValue(null);
      this.clinicaBusqueda = new Clinica();
    }
  }

  // POPPUP CLINICA
  public abrirBuscarClinica(): void {
    const dialogRef = this.dialog.open(BuscarClinicaComponent, {
      width: "640px",
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result: Clinica) => {
      if (result !== null) {
        this.clinicaFrmCtrl.setValue(result.nomcli);
        this.clinicaBusqueda = result;
      } else {
        this.clinicaFrmCtrl.setValue(null);
        this.clinicaBusqueda = new Clinica();
      }
    });
  }

  public accesoOpcionMenu() {
    const data = require("src/assets/data/permisosRecursos.json");
    const bandejaMonitoreo = data.bandejaMonitoreo.busqueda;
    this.opcionMenu = JSON.parse(localStorage.getItem("opcionMenu"));

    if (this.opcionMenu.opcion.length > 0) {
      this.opcionMenu.opcion.forEach((element) => {
        const codOpcion = element.codOpcion;
        switch (codOpcion) {
          case bandejaMonitoreo.txtPaciente:
            this.txtPaciente = Number(element.flagAsignacion);
            break;
          case bandejaMonitoreo.txtClinica:
            this.txtClinica = Number(element.flagAsignacion);
            break;
          case bandejaMonitoreo.cmbResponsable:
            this.cmbResponsable = Number(element.flagAsignacion);
            break;
          case bandejaMonitoreo.cmbEstado:
            this.cmbEstado = Number(element.flagAsignacion);
            break;
          case bandejaMonitoreo.txtFecha:
            this.txtFecha = Number(element.flagAsignacion);
            break;
          case bandejaMonitoreo.btnBuscar:
            this.btnBuscar = Number(element.flagAsignacion);
            break;
          case bandejaMonitoreo.btnExportar:
            this.btnExportar = Number(element.flagAsignacion);
            break;
        }
      });
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
        title: MENSAJES.PRELIMINAR.TITLE,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }

  validarFechaMonitoreoDesde() {
    const dateMonitoreoInicio = this.fechaMonitoreoDesdeFrmCtrl.value;
    const dateMonitoreoFin = this.fechaMonitoreoHastaFrmCtrl.value;
    const dateActual = new Date();
    if (this.fechaMonitoreoHastaFrmCtrl.value !== null) {
      if (
        this.datePipe.transform(dateMonitoreoInicio, "dd/MM/yyyy") ===
        this.datePipe.transform(dateMonitoreoFin, "dd/MM/yyyy")
      ) {
        this.openDialogMensaje(
          "Fecha inicial debe ser distinta a la fecha final",
          null,
          true,
          false,
          null
        );
        this.fechaMonitoreoDesdeFrmCtrl.setValue(null);
        return;
      }
      if (dateMonitoreoInicio > dateMonitoreoFin) {
        this.openDialogMensaje(
          "Fecha inicial debe ser menor que la fecha final",
          null,
          true,
          false,
          null
        );
        this.fechaMonitoreoDesdeFrmCtrl.setValue(null);
      }
      // else if (dateMonitoreoInicio > dateActual) {
      //   this.openDialogMensaje('Fecha no debe de ser mayor al actual', null, true, false, null);
      //   this.fechaMonitoreoDesdeFrmCtrl.setValue(null);
      // }
    }
  }

  public validarFechaMonitoreoHasta() {
    const dateMonitoreoInicio = this.fechaMonitoreoDesdeFrmCtrl.value;
    const dateMonitoreoFin = this.fechaMonitoreoHastaFrmCtrl.value;
    const dateActual = new Date();
    if (this.fechaMonitoreoDesdeFrmCtrl.value !== null) {
      if (
        this.datePipe.transform(dateMonitoreoInicio, "dd/MM/yyyy") ===
        this.datePipe.transform(dateMonitoreoFin, "dd/MM/yyyy")
      ) {
        this.openDialogMensaje(
          "Fecha final debe ser distinta a la fecha inicial",
          null,
          true,
          false,
          null
        );
        this.fechaMonitoreoHastaFrmCtrl.setValue(null);
        return;
      }
      if (dateMonitoreoInicio > dateMonitoreoFin) {
        this.openDialogMensaje(
          "Fecha final debe ser mayor a la fecha inicial",
          null,
          true,
          false,
          null
        );
        this.fechaMonitoreoHastaFrmCtrl.setValue(null);
      }
      // else if (dateMonitoreoFin > dateActual) {
      //   this.openDialogMensaje('Fecha no debe de ser mayor al actual', null, true, false, null);
      //   this.fechaMonitoreoHastaFrmCtrl.setValue(null);
      // }
    }
  }

  validarFechaAprobacionDesde() {
    const dateAprobacionInicio = this.fechaAprobacionDesdeFrmCtrl.value;
    const dateAprobacionFin = this.fechaAprobacionHastaFrmCtrl.value;
    const dateActual = new Date();
    if (this.fechaAprobacionHastaFrmCtrl.value !== null) {
      if (
        this.datePipe.transform(dateAprobacionInicio, "dd/MM/yyyy") ===
        this.datePipe.transform(dateAprobacionFin, "dd/MM/yyyy")
      ) {
        this.openDialogMensaje(
          "Fecha inicial debe ser distinta a la fecha final",
          null,
          true,
          false,
          null
        );
        this.fechaAprobacionDesdeFrmCtrl.setValue(null);
        return;
      }
      if (dateAprobacionInicio > dateAprobacionFin) {
        this.openDialogMensaje(
          "Fecha inicial debe ser menor que la fecha final",
          null,
          true,
          false,
          null
        );
        this.fechaAprobacionDesdeFrmCtrl.setValue(null);
      } else if (dateAprobacionInicio > dateActual) {
        this.openDialogMensaje(
          "Fecha no debe de ser mayor al actual",
          null,
          true,
          false,
          null
        );
        this.fechaAprobacionDesdeFrmCtrl.setValue(null);
      }
    }
  }

  public validarFechaAprobacionHasta() {
    const dateAprobacionInicio = this.fechaAprobacionDesdeFrmCtrl.value;
    const dateAprobacionFin = this.fechaAprobacionHastaFrmCtrl.value;
    const dateActual = new Date();
    if (this.fechaAprobacionDesdeFrmCtrl.value !== null) {
      if (
        this.datePipe.transform(dateAprobacionInicio, "dd/MM/yyyy") ===
        this.datePipe.transform(dateAprobacionFin, "dd/MM/yyyy")
      ) {
        this.openDialogMensaje(
          "Fecha final debe ser distinta a la fecha inicial",
          null,
          true,
          false,
          null
        );
        this.fechaAprobacionHastaFrmCtrl.setValue(null);
        return;
      }
      if (dateAprobacionInicio > dateAprobacionFin) {
        this.openDialogMensaje(
          "Fecha final debe ser mayor a la fecha inicial",
          null,
          true,
          false,
          null
        );
        this.fechaAprobacionHastaFrmCtrl.setValue(null);
      } else if (dateAprobacionFin > dateActual) {
        this.openDialogMensaje(
          "Fecha no debe de ser mayor al actual",
          null,
          true,
          false,
          null
        );
        this.fechaAprobacionHastaFrmCtrl.setValue(null);
      }
    }
  }
}
