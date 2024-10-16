import {
  Component,
  OnInit,
  Inject,
  forwardRef,
  ViewChild,
} from '@angular/core';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MatPaginatorIntl,
  MAT_DATE_LOCALE,
  MatDialogRef,
  MatDialog,
  MAT_DIALOG_DATA,
  MatTableDataSource,
  MatSort,
  MatPaginator,
} from '@angular/material';
import { MatPaginatorIntlEspanol } from 'src/app/directives/matpaginator-translate';
import {
  MY_FORMATS_AUNA,
  FILEFTP,
  CONFIGURACION,
  TIPO_FORM,
  GRUPO_PARAMETRO,
  ESTADO_SEGUIMIENTO,
  ESTADO_MONITOREO,
  MENSAJES,
  ACCESO_MONITOREO,
} from 'src/app/common';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { MessageComponent } from 'src/app/core/message/message.component';
import { DatePipe } from '@angular/common';
import { WsResponse } from 'src/app/dto/WsResponse';
import { date } from 'ngx-custom-validators/src/app/date/validator';
import { BandejaMonitoreoService } from 'src/app/service/BandejaMonitoreo/bandeja.monitoreo.service';
import { ListaParametroservice } from 'src/app/service/lista.parametro.service';
import { ParametroRequest } from 'src/app/dto/ParametroRequest';
import { UsuarioService } from 'src/app/dto/service/usuario.service';
import { SegEjecutivoRequest } from 'src/app/dto/request/BandejaMonitoreo/SegEjecutivoRequest';
import { SegEjecutivoResponse } from 'src/app/dto/response/BandejaMonitoreo/SegEjecutivoResponse';
import { MonitoreoResponse } from 'src/app/dto/response/BandejaMonitoreo/MonitoreoResponse';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BOpcionMenuLocalStorage } from 'src/app/dto/core/BOpcionMenuLocalStorage';
import { EvolucionResponse } from 'src/app/dto/response/BandejaMonitoreo/EvolucionResponse';
import { EvolucionRequest } from 'src/app/dto/request/BandejaMonitoreo/EvolucionRequest';
import { ToxicidadResponse } from 'src/app/dto/response/BandejaMonitoreo/ToxicidadResponse';
import { MarcadorResponse } from 'src/app/dto/response/BandejaMonitoreo/MarcadorResponse';
import { MarcadorRequest } from 'src/app/dto/request/BandejaMonitoreo/MarcadorRequest';
import { EvolucionMarcadorRequest } from 'src/app/dto/request/BandejaMonitoreo/EvolucionMarcadorRequest';
import { CustomValidator } from 'src/app/directives/custom.validator';
import { CoreService } from 'src/app/service/core.service';
import { ArchivoRequest } from 'src/app/dto/request/ArchivoRequest';
import { ArchivoFTP } from 'src/app/dto/bandeja-preliminar/detalle-preliminar/ArchivoFTP';

export interface DataDialog {
  title: string;
  monitoreo: MonitoreoResponse;
  tipo: number;
  listaEvolucion: EvolucionResponse;
  evolucion: EvolucionResponse;
  user?: 5;
}

declare var $: any;

@Component({
  selector: 'app-seguimiento-ejecutivo',
  templateUrl: './seguimiento-ejecutivo.component.html',
  styleUrls: ['./seguimiento-ejecutivo.component.scss'],
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
export class SeguimientoEjecutivoComponent implements OnInit {
  marcadorFrmGrp: FormGroup = new FormGroup({
    descMACFrmCtrl: new FormControl(null),
    lineaTrataFrmCtrl: new FormControl(null),
    fecInicioFrmCtrl: new FormControl(null),
    nroEvolucionFrmCtrl: new FormControl(null),
    fMonitoreoFrmCtrl: new FormControl(null),
    toleranciaFrmCtrl: new FormControl(null, [Validators.required]),
    rptaClinicaFrmCtrl: new FormControl(null, [Validators.required]),
    gradoFrmCtrl: new FormControl(null, [Validators.required]),
    atenAlertaFrmCtrl: new FormControl(null, [Validators.required]),
    existeToxFrmCtrl: new FormControl(null, [Validators.required]),
    toxicidadFrmCtrl: new FormControl(null),
  });

  pendienteInformacionFrmGrp: FormGroup = new FormGroup({
    resEvolFrmCtrl: new FormControl(null),
    fecInactFormControl: new FormControl(null),
    motivoInactFrmCtrl: new FormControl(null),
    fecProxMonFormControl: new FormControl(null),
    pendienteInfoFrmCtrl: new FormControl({ value: null, disabled: true }),
    comentarioFrmCtrl: new FormControl(null),
  });

  segEjecutivoFrmGrp: FormGroup = new FormGroup({
    codMonitoreoFrmCtrl: new FormControl(null),
    ejecutMonitoreoFrmCtrl: new FormControl(null),
    fecRegistroFrmCtrl: new FormControl(null),
    pEstSeguimientoFrmCtrl: new FormControl(null, [Validators.required]),
    detalleEventoFrmCtrl: new FormControl(null, [Validators.required]),
  });

  tableBasalFrmGrp: FormGroup = new FormGroup({});

  get descMACFrmCtrl() {
    return this.marcadorFrmGrp.get('descMACFrmCtrl');
  }
  get lineaTrataFrmCtrl() {
    return this.marcadorFrmGrp.get('lineaTrataFrmCtrl');
  }
  get fecInicioFrmCtrl() {
    return this.marcadorFrmGrp.get('fecInicioFrmCtrl');
  }
  get nroEvolucionFrmCtrl() {
    return this.marcadorFrmGrp.get('nroEvolucionFrmCtrl');
  }
  get fMonitoreoFrmCtrl() {
    return this.marcadorFrmGrp.get('fMonitoreoFrmCtrl');
  }
  get toleranciaFrmCtrl() {
    return this.marcadorFrmGrp.get('toleranciaFrmCtrl');
  }
  get rptaClinicaFrmCtrl() {
    return this.marcadorFrmGrp.get('rptaClinicaFrmCtrl');
  }
  get atenAlertaFrmCtrl() {
    return this.marcadorFrmGrp.get('atenAlertaFrmCtrl');
  }
  get existeToxFrmCtrl() {
    return this.marcadorFrmGrp.get('existeToxFrmCtrl');
  }
  get toxicidadFrmCtrl() {
    return this.marcadorFrmGrp.get('toxicidadFrmCtrl');
  }

  get pendienteInfoFrmCtrl() {
    return this.pendienteInformacionFrmGrp.get('pendienteInfoFrmCtrl');
  }
  get resEvolFrmCtrl() {
    return this.pendienteInformacionFrmGrp.get('resEvolFrmCtrl');
  }
  get motivoInactFrmCtrl() {
    return this.pendienteInformacionFrmGrp.get('motivoInactFrmCtrl');
  }
  get fecProxMonFormControl() {
    return this.pendienteInformacionFrmGrp.get('fecProxMonFormControl');
  }
  get fecInactFormControl() {
    return this.pendienteInformacionFrmGrp.get('fecInactFormControl');
  }
  get comentarioFrmCtrl() {
    return this.pendienteInformacionFrmGrp.get('comentarioFrmCtrl');
  }

  get codMonitoreoFrmCtrl() {
    return this.segEjecutivoFrmGrp.get('codMonitoreoFrmCtrl');
  }
  get ejecutMonitoreoFrmCtrl() {
    return this.segEjecutivoFrmGrp.get('ejecutMonitoreoFrmCtrl');
  }
  get fecRegistroFrmCtrl() {
    return this.segEjecutivoFrmGrp.get('fecRegistroFrmCtrl');
  }
  get pEstSeguimientoFrmCtrl() {
    return this.segEjecutivoFrmGrp.get('pEstSeguimientoFrmCtrl');
  }
  get detalleEventoFrmCtrl() {
    return this.segEjecutivoFrmGrp.get('detalleEventoFrmCtrl');
  }

  cmbTolerancia: any[];
  cmbRptaClinica: any[];
  cmbGrado: any[];
  cmbAtenAlerta: any[];
  cmbToxicidad: any[];
  cmbResEvolucion: any[];
  cmbEstadoSeguimiento: any[];
  json: JSON;

  request: SegEjecutivoRequest = new SegEjecutivoRequest();
  dataSourceToxicidad: MatTableDataSource<ToxicidadResponse>;
  dataSource: MatTableDataSource<SegEjecutivoResponse>;
  dataSources: MatTableDataSource<MarcadorResponse>;
  listaSegEjecutivo: SegEjecutivoResponse[];
  listaToxicidad: ToxicidadResponse[];
  isLoading: boolean;
  displayedColumns: string[];
  displayedColumns2: string[] = [];
  displayedTablaToxicidad: string[];
  listaMarcadores: MarcadorResponse[];
  listaDetalleMarcadores: EvolucionMarcadorRequest[];

  opcionMenu: BOpcionMenuLocalStorage;
  valorMostrarOpcion = ACCESO_MONITOREO.mostrarOpcion;

  txtCodTareaMonit: number;
  txtEjecutivoMonit: number;
  txtFechaRegistro: number;
  cbEstadoSeguimiento: number;
  txtDetalleEvento: number;
  btnGrabar: number;
  btnSalir: number;
  cmbMotInactivacion: any[];
  TIPO_FORM = TIPO_FORM;
  fileupload: File;
  mensajes: string;
  spinnerCargarArchivo: boolean = false;
  desDocuNuevo: any;
  disabIconPdf: boolean = false;
  codEvolucion: number;

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  columnsToxicidad = [
    {
      columnDef: 'tipoToxicidad',
      header: 'TIPO TOXICIDAD',
      cell: (toxicidad: ToxicidadResponse) => `${toxicidad.nomTipo_Toxicidad}`,
    },
    {
      columnDef: 'gradoToxicidad',
      header: 'GRADO TOXICIDAD',
      cell: (toxicidad: ToxicidadResponse) => `${toxicidad.grado}`,
    },
  ];

  columnsGrillas = [
    {
      codAcceso: ACCESO_MONITOREO.tablaRegMarcadores.indice,
      columnDef: 'perioMin',
      header: 'PERIOCIDAD MINIMA',
      cell: (marcador: MarcadorResponse) => `${marcador.descPerMinima}`,
    },
    {
      codAcceso: ACCESO_MONITOREO.tablaRegMarcadores.indice,
      columnDef: 'perioMax',
      header: 'PERIOCIDAD MAXIMA',
      cell: (marcador: MarcadorResponse) => `${marcador.descPerMaxima}`,
    },
  ];

  columnsGrilla = [
    {
      columnDef: 'nomEjecutivoMonitoreo',
      header: 'EJECUTIVO DE MONITOREO',
      cell: (segEjecutivo: SegEjecutivoResponse) =>
        `${segEjecutivo.nomEjecutivoMonitoreo}`,
    },
    {
      columnDef: 'fechaRegistro',
      header: 'FECHA REGISTRO',
      cell: (segEjecutivo: SegEjecutivoResponse) =>
        this.datePipe.transform(segEjecutivo.fechaRegistro, 'dd/MM/yyyy'),
    },
    {
      columnDef: 'horaRegistro',
      header: 'HORA REGISTRO',
      cell: (segEjecutivo: SegEjecutivoResponse) =>
        `${segEjecutivo.horaRegistro}`,
    },
    {
      columnDef: 'detalleEvento',
      header: 'DETALLE DEL EVENTO',
      cell: (segEjecutivo: SegEjecutivoResponse) =>
        `${segEjecutivo.detalleEvento} `,
    },
    {
      columnDef: 'descEstadoSeguimiento',
      header: 'ESTADO DEL CASO',
      cell: (segEjecutivo: SegEjecutivoResponse) =>
        `${segEjecutivo.descEstadoSeguimiento}`,
    },
  ];

  /*public columnsGrillaCasos = [{
    codAcceso: ACCESO_MONITOREO.tablaSegEjecutivo.indice,
    columnDef: 'no',
  }, {
    codAcceso: ACCESO_MONITOREO.tablaSegEjecutivo.ejecutivoMonitoreo,
    columnDef: 'nomEjecutivoMonitoreo',
  }, {
    codAcceso: ACCESO_MONITOREO.tablaSegEjecutivo.detalleEvento,
    columnDef: 'detalleEvento',
  }, {
    codAcceso: ACCESO_MONITOREO.tablaSegEjecutivo.fechaRegistro,
    columnDef: 'fechaRegistro',
  }, {
    codAcceso: ACCESO_MONITOREO.tablaSegEjecutivo.horaRegistro,
    columnDef: 'horaRegistro',
  }, {
    codAcceso: ACCESO_MONITOREO.tablaSegEjecutivo.estadoCaso,
    columnDef: 'descEstadoSeguimiento',
  }];*/

  rbtExisteToxi = [
    {
      codigo: 1,
      titulo: 'SI',
    },
    {
      codigo: 0,
      titulo: 'NO',
    },
  ];

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<SeguimientoEjecutivoComponent>,
    private datePipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) public data: DataDialog,
    private bandejaMonitoreoService: BandejaMonitoreoService,
    private parametroService: ListaParametroservice,
    private spinnerService: Ng4LoadingSpinnerService,
    @Inject(UsuarioService) private user: UsuarioService,
    private coreService: CoreService
  ) {}

  ngOnInit() {
    this.inicializarVariables();
    this.accesoOpcionMenu();
    this.validarRol();
  }

  public onClose(): void {
    this.dialogRef.close(null);
  }

  public inicializarVariables() {
    this.dataSource = null;
    this.dataSourceToxicidad = null;
    this.cmbTolerancia = [];
    this.cmbRptaClinica = [];
    this.cmbGrado = [];
    this.cmbAtenAlerta = [];
    this.cmbToxicidad = [];
    this.cmbEstadoSeguimiento = [];
    this.listaMarcadores = [];

    this.cargarComboEstadoSeguimiento();
    this.cargarComboRespClinica();
    this.cargarComboAtenAlertas();
    this.cargarComboTolerancia();
    this.cargarComboToxicidad();
    this.cargarComboResEvolucion();
    this.cargarComboMotInactivacion();

    this.codMonitoreoFrmCtrl.setValue(
      this.data.monitoreo.codigoDescripcionMonitoreo
    );

    if (this.data.user != 5) {
      this.codEvolucion = this.data.listaEvolucion['codEvolucion'];
      this.descMACFrmCtrl.setValue(this.data.monitoreo.nomMedicamento);
      this.lineaTrataFrmCtrl.setValue(
        'L' + this.data.monitoreo.numeroLineaTratamiento
      );
      this.fecInicioFrmCtrl.setValue(
        this.datePipe.transform(
          this.data.monitoreo.fecIniLineaTratamiento,
          'dd/MM/yyyy'
        )
      );
      this.nroEvolucionFrmCtrl.setValue(
        this.data.listaEvolucion['nroDescEvolucion']
      );
      this.fMonitoreoFrmCtrl.setValue(
        this.datePipe.transform(
          this.data.listaEvolucion['fecMonitoreo'],
          'dd/MM/yyyy'
        )
      );
      this.toleranciaFrmCtrl.setValue(this.data.listaEvolucion['pTolerancia']);
      this.rptaClinicaFrmCtrl.setValue(
        this.data.listaEvolucion['pRespClinica']
      );
      this.toxicidadFrmCtrl.setValue(this.data.listaEvolucion['pToxicidad']);
      this.atenAlertaFrmCtrl.setValue(this.data.listaEvolucion['pAtenAlerta']);

      this.resEvolFrmCtrl.setValue(this.data.listaEvolucion['pResEvolucion']);
      this.motivoInactFrmCtrl.setValue(
        this.data.listaEvolucion['pMotivoInactivacion']
      );
      this.fecProxMonFormControl.setValue(
        this.data.listaEvolucion['fecProxMonitoreo']
      );
      this.comentarioFrmCtrl.setValue(this.data.listaEvolucion['observacion']);

      this.fecInactFormControl.setValue(
        this.data.listaEvolucion['fecInactivacion']
      );
      this.codMonitoreoFrmCtrl.setValue(
        this.data.monitoreo.codigoDescripcionMonitoreo
      );
      this.ejecutMonitoreoFrmCtrl.setValue(
        this.user.getApelPaterno +
          ' ' +
          this.user.getApelMaterno +
          ', ' +
          this.user.getNombres
      );
      this.fecRegistroFrmCtrl.setValue(new Date());
      //@ts-ignore
      if (this.data.listaEvolucion.existeToxicidad == '1') {
        this.existeToxFrmCtrl.setValue(1);

        // this.toxiGradoFrmCtrl.setValue(this.data.evolucion.Toxigrado);
        this.listarTablaToxicidad();
      } else {
        this.existeToxFrmCtrl.setValue(0);
        this.toxicidadFrmCtrl.disable();
      }
      if (this.data.listaEvolucion.pEstadoMonitoreo == 121) {
        this.pendienteInfoFrmCtrl.setValue(1);
      }
    }

    this.listarSeguimientoEjecutivo();
  }

  public validarRol() {
    if (this.user.getCodRol === 5) {
    }
  }

  public cargarComboRespClinica() {
    let request = new ParametroRequest();
    request.codigoGrupo = GRUPO_PARAMETRO.respuestaClinica; //'59';
    this.parametroService.consultarParametro(request).subscribe(
      (data: WsResponse) => {
        if (data.audiResponse.codigoRespuesta === '0') {
          this.cmbRptaClinica = data.data;
          this.cmbRptaClinica.unshift({
            codigoParametro: '',
            nombreParametro: 'SELECCIONE',
          });
        } else {
          console.error(data);
        }
      },
      (error) => {
        console.error('Error al listar parametros');
      }
    );
  }

  public cargarComboAtenAlertas() {
    let request = new ParametroRequest();
    request.codigoGrupo = GRUPO_PARAMETRO.atencionAlertas; //'60';
    this.parametroService.consultarParametro(request).subscribe(
      (data: WsResponse) => {
        if (data.audiResponse.codigoRespuesta === '0') {
          this.cmbAtenAlerta = data.data;
          this.cmbAtenAlerta.unshift({
            codigoParametro: '',
            nombreParametro: 'SELECCIONE',
          });
        } else {
          console.error(data);
        }
      },
      (error) => {
        console.error('Error al listar parametros');
      }
    );
  }

  public cargarComboTolerancia() {
    let request = new ParametroRequest();
    request.codigoGrupo = GRUPO_PARAMETRO.tolerancia; //'56';
    this.parametroService.consultarParametro(request).subscribe(
      (data: WsResponse) => {
        if (data.audiResponse.codigoRespuesta === '0') {
          this.cmbTolerancia = data.data;
          this.cmbTolerancia.unshift({
            codigoParametro: '',
            nombreParametro: 'SELECCIONE',
          });
        } else {
          console.error(data);
        }
      },
      (error) => {
        console.error('Error al listar parametros');
      }
    );
  }

  public cargarComboToxicidad() {
    let request = new ParametroRequest();
    request.codigoGrupo = GRUPO_PARAMETRO.toxicidad; //'57';
    this.parametroService.consultarParametro(request).subscribe(
      (data: WsResponse) => {
        if (data.audiResponse.codigoRespuesta === '0') {
          this.cmbToxicidad = data.data;
          this.cmbToxicidad.unshift({
            codigoParametro: '',
            nombreParametro: 'SELECCIONE',
          });
        } else {
          console.error(data);
        }
      },
      (error) => {
        console.error('Error al listar parametros');
      }
    );
  }

  public cargarComboResEvolucion() {
    let request = new ParametroRequest();
    request.codigoGrupo = '62';
    this.parametroService.consultarParametro(request).subscribe(
      (data: WsResponse) => {
        if (data.audiResponse.codigoRespuesta === '0') {
          this.cmbResEvolucion = data.data;
          this.cmbResEvolucion.unshift({
            codigoParametro: '',
            nombreParametro: 'SELECCIONE',
          });
        } else {
          console.error(data);
        }
      },
      (error) => {
        console.error('Error al listar parametros');
      }
    );
  }

  public cargarComboMotInactivacion() {
    let request = new ParametroRequest();
    request.codigoGrupo = '63';
    this.parametroService.consultarParametro(request).subscribe(
      (data: WsResponse) => {
        if (data.audiResponse.codigoRespuesta === '0') {
          this.cmbMotInactivacion = data.data;
          this.cmbMotInactivacion.unshift({
            codigoParametro: '',
            nombreParametro: 'SELECCIONE',
          });
        } else {
          console.error(data);
        }
      },
      (error) => {
        console.error('Error al listar parametros');
      }
    );
  }

  public cargarComboEstadoSeguimiento() {
    let request = new ParametroRequest();
    request.codigoGrupo = GRUPO_PARAMETRO.estadoSeguimiento; //'65';
    this.parametroService.consultarParametro(request).subscribe(
      (data: WsResponse) => {
        if (data.audiResponse.codigoRespuesta === '0') {
          this.cmbEstadoSeguimiento = data.data;
          this.cmbEstadoSeguimiento.unshift({
            codigoParametro: '',
            nombreParametro: 'SELECCIONE',
          });
        } else {
          console.error(data);
        }
        //SETEAR VALOR POR DEFECTO
        this.pEstSeguimientoFrmCtrl.setValue('');
      },
      (error) => {
        console.error('Error al listar parametros');
      }
    );
  }

  public enableFrmToxicidad() {
    if (this.existeToxFrmCtrl.value) {
      this.toxicidadFrmCtrl.enable();
    } else {
      this.toxicidadFrmCtrl.disable();
      this.toxicidadFrmCtrl.setValue('');
    }
  }

  public listarSeguimientoEjecutivo(): void {
    this.isLoading = true;
    let request = new SegEjecutivoRequest();
    request.codMonitoreo = this.data.monitoreo.codigoMonitoreo;

    this.bandejaMonitoreoService.listarSeguimientoEjecutivo(request).subscribe(
      (data: WsResponse) => {
        if (data.audiResponse.codigoRespuesta === '0') {
          this.listaSegEjecutivo = data.data;
          this.cargarDatosTabla();
        } else {
          console.error('ERROR:' + data.audiResponse.mensajeRespuesta);
        }
        this.isLoading = false;
      },
      (error) => {
        console.error('Error no se pudo obtener registros');
        this.isLoading = false;
      }
    );
  }

  public listarTablaToxicidad() {
    let request = new EvolucionRequest();
    request.codEvolucion = this.data.listaEvolucion.codEvolucion;

    this.listaToxicidad = this.data.listaEvolucion['toxigrado'];
    this.cargarTablaToxicidad();
  }

  public cargarDatosTabla(): void {
    if (this.listaSegEjecutivo.length > 0) {
      this.dataSource = new MatTableDataSource(this.listaSegEjecutivo);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  public cargarTablaToxicidad(): void {
    if (this.listaToxicidad.length > 0) {
      this.dataSourceToxicidad = new MatTableDataSource(this.listaToxicidad);
      this.dataSourceToxicidad.paginator = this.paginator;
      this.dataSourceToxicidad.sort = this.sort;
    }
  }

  public regSeguimientoEjecutivo() {
    if (this.segEjecutivoFrmGrp.invalid) {
      this.pEstSeguimientoFrmCtrl.markAsTouched();
      this.detalleEventoFrmCtrl.markAsTouched();
    } else {
      this.spinnerService.show();
      //let request = new SegEjecutivoRequest();
      this.request.codEvolucion = this.codEvolucion;
      this.request.codMonitoreo = this.data.monitoreo.codigoMonitoreo;
      this.request.codEjecutivoMonitoreo = this.user.getCodUsuario;
      this.request.nomEjecutivoMonitoreo = this.ejecutMonitoreoFrmCtrl.value;
      this.request.pEstadoSeguimiento = this.pEstSeguimientoFrmCtrl.value;
      this.request.detalleEvento = this.detalleEventoFrmCtrl.value;
      this.request.vistoRespMonitoreo = 0;
      this.request.usuariocrea = this.user.getCodUsuario + '';
      this.request.codigoArchivo = this.request.codigoArchivo;
      this.request.fechaRegistro = this.fecRegistroFrmCtrl.value;
      if (this.request.pEstadoSeguimiento == ESTADO_SEGUIMIENTO.atendido) {
        //243 => ATENDIDO
        this.request.pEstadoMonitoreo = ESTADO_MONITOREO.pendienteMonitoreo; // 118 => SE VUELVE A PENDIENTE DE MONITOREO
      }

      this.bandejaMonitoreoService
        .regSeguimientoEjecutivo(this.request)
        .subscribe((data: WsResponse) => {
          if (data.audiResponse.codigoRespuesta === '0') {
            this.spinnerService.hide();
            this.dialogRef.close(data.data);
          } else {
            this.spinnerService.hide();
            this.openDialogMensaje(
              'Error al registrar seguimiento ejecutivo',
              null,
              true,
              false,
              null
            );
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
      width: '400px',
      disableClose: true,
      data: {
        title: MENSAJES.MONITOREO.TITLE,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }

  public accesoOpcionMenu() {
    const data = require('src/assets/data/permisosRecursos.json');
    const regSeguimientoEjec = data.bandejaMonitoreo.regSeguimientoEjec;
    this.opcionMenu = JSON.parse(localStorage.getItem('opcionMenu'));

    if (this.opcionMenu.opcion.length > 0) {
      this.opcionMenu.opcion.forEach((element) => {
        const codOpcion = element.codOpcion;
        switch (codOpcion) {
          case regSeguimientoEjec.txtCodTareaMonit:
            this.txtCodTareaMonit = Number(element.flagAsignacion);
            break;
          case regSeguimientoEjec.txtEjecutivoMonit:
            this.txtEjecutivoMonit = Number(element.flagAsignacion);
            break;
          case regSeguimientoEjec.txtFechaRegistro:
            this.txtFechaRegistro = Number(element.flagAsignacion);
            break;
          case regSeguimientoEjec.cbEstadoSeguimiento:
            this.cbEstadoSeguimiento = Number(element.flagAsignacion);
            break;
          case regSeguimientoEjec.txtDetalleEvento:
            this.txtDetalleEvento = Number(element.flagAsignacion);
            break;
          case regSeguimientoEjec.btnGrabar:
            this.btnGrabar = Number(element.flagAsignacion);
            break;
          case regSeguimientoEjec.btnSalir:
            this.btnSalir = Number(element.flagAsignacion);
            break;
        }
      });
    }

    this.crearTablaToxicidad();
    this.crearTablaLineaTratamiento();
    this.crearTablaMarcadores();
    // this.displayedColumns.push('item', 'marcador', 'perioMin', 'perioMax', 'sinRegistro', 'resultado', 'fecResultado');
  }

  public crearTablaToxicidad(): void {
    this.displayedTablaToxicidad = [];

    this.displayedTablaToxicidad.push('no');
    this.columnsToxicidad.forEach((c) => {
      this.displayedTablaToxicidad.push(c.columnDef);
    });
  }

  public crearTablaLineaTratamiento(): void {
    this.displayedColumns = [];

    this.displayedColumns.push('no');
    this.columnsGrilla.forEach((c) => {
      this.displayedColumns.push(c.columnDef);
    });
    this.displayedColumns.push('vistaPreliminarDelInforme');
  }

  public crearTablaMarcadores() {
    this.displayedColumns2 = [];

    this.displayedColumns2.push('item', 'marcador');
    this.columnsGrillas.forEach((c) => {
      this.displayedColumns2.push(c.columnDef);
    });
    this.displayedColumns2.push('sinRegistro', 'resultado');
  }

  public ocultar(evt: any, marc: MarcadorResponse) {
    let check = this.tableBasalFrmGrp.controls['c' + marc.codMarcador].value;
    if (check) {
      marc.tieneRegHc = false; //TEMPORAL
      //this.revisarDiasSinRegistro(marc);
    } else {
      //this.habilitarCampos(true, marc);
    }
  }

  public cargarArchivo(event) {
    this.fileupload = event.target.files[0];

    if (this.fileupload.size > FILEFTP.tamanioMax) {
      this.mensajes = 'Validación del tamaño de archivo';
      this.openDialogMensaje(
        this.mensajes,

        "El archivo supera la cantidad permitidad '4MB', no se puede cargar el documento.",
        true,
        false,
        'Tamaño archivo: ' + this.fileupload.size / 1024 / 1024 + 'MB'
      );
      return false;
    } else if (this.fileupload.type != FILEFTP.filePdf) {
      this.openDialogMensaje(
        'Validación del tipo de archivo',
        'Solo se permiten archivos PDF',
        true,
        false,
        'Tipo de archivo: ' + this.fileupload.type + ' MB'
      );
      return false;
    }
    this.subirArchivoFTP();
  }

  public subirArchivoFTP(): void {
    if (
      typeof this.fileupload === 'undefined' ||
      typeof this.fileupload.name === 'undefined'
    ) {
      this.openDialogMensaje(
        'Subida de archivos al FTP',
        'Falta seleccionar el archivo a subir.',
        true,
        false,
        null
      );
    } else {
      const archivoRequest = new ArchivoRequest();

      archivoRequest.archivo = this.fileupload;
      /*archivoRequest.nomArchivo =documento.descripcionDocumento.replace(/ /gi, "_") + "_" + this.data.evolucion.codEvolucion".pdf";*/
      archivoRequest.nomArchivo = archivoRequest.archivo.name.replace(
        '(*)',
        ''
      );
      archivoRequest.ruta = FILEFTP.rutaEvaluacionRequisitos;

      this.spinnerService.show();

      this.coreService.subirArchivo(archivoRequest).subscribe(
        (response: WsResponse) => {
          if (response.audiResponse.codigoRespuesta === '0') {
            this.mensajes = 'El archivo se cargó correctamente';
            this.openDialogMensaje('', this.mensajes, true, false, null);
            this.request.codigoArchivo = response.data.codArchivo;
          } else {
            this.mensajes =
              response.audiResponse.mensajeRespuesta +
              '. No se logró eliminar el archivo';
            this.openDialogMensaje(
              MENSAJES.ERROR_NOFUNCION,
              this.mensajes,
              true,
              false,
              null
            );
          }
          this.spinnerService.hide();
        },
        (error) => {
          this.spinnerService.hide();
          console.error(error);
          this.mensajes = 'Error al enviar archivo FTP.';
          this.openDialogMensaje(
            MENSAJES.ERROR_CARGA_SERVICIO,
            this.mensajes,
            true,
            false,
            null
          );
        }
      );
    }
  }

  public descargarDocumento(documento: SegEjecutivoRequest): void {
    const archivoRqt = new ArchivoFTP();
    archivoRqt.codArchivo = documento.codigoArchivo;
    archivoRqt.nomArchivo = documento.nameFile;
    archivoRqt.ruta = FILEFTP.rutaEvaluacionRequisitos;
    this.spinnerService.show();

    this.coreService.descargarArchivoFTP(archivoRqt).subscribe(
      (response: WsResponse) => {
        if (response.audiResponse.codigoRespuesta === '0') {
          //response.data.contentType = "application/pdf";
          const blob = this.coreService.crearBlobFile(response.data);
          const link = document.createElement('a');
          link.target = '_blank';
          link.href = window.URL.createObjectURL(blob);
          link.setAttribute('download', response.data.nomArchivo);
          link.click();
          this.spinnerService.hide();
        } else {
          /*this.mensajes = response.audiResponse.mensajeRespuesta;
          this.openDialogMensaje(
            MENSAJES.ERROR_NOFUNCION,
            this.mensajes,
            true,
            false,
            null
          );*/

          this.spinnerService.hide();
        }
      },
      (error) => {
        this.mensajes = error;
        this.openDialogMensaje(
          MENSAJES.ERROR_NOFUNCION,
          this.mensajes,
          true,
          false,
          null
        );
      }
    );
  }
}
