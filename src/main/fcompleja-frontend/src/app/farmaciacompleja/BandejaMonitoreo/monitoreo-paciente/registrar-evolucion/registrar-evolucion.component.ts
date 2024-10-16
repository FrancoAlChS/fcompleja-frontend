import { Component, OnInit, forwardRef, Inject, ViewChild } from '@angular/core';
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
  MatPaginator
} from '@angular/material';
import { MatPaginatorIntlEspanol } from 'src/app/directives/matpaginator-translate';
import { MY_FORMATS_AUNA, CONFIGURACION, TIPO_FORM, ESTADO_MONITOREO, MENSAJES, GRUPO_PARAMETRO, ACCESO_EVALUACION, ACCESO_MONITOREO, TOLERANCIA_EVOLUCION } from 'src/app/common';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ListaParametroservice } from 'src/app/service/lista.parametro.service';
import { FormGroup, FormControl, Validators, AbstractControl, FormBuilder, FormArray } from '@angular/forms';
import { Parametro } from 'src/app/dto/Parametro';
import { MessageComponent } from 'src/app/core/message/message.component';
import { DatePipe } from '@angular/common';
import { BandejaMonitoreoService } from 'src/app/service/BandejaMonitoreo/bandeja.monitoreo.service';
import { MarcadorResponse } from 'src/app/dto/response/BandejaMonitoreo/MarcadorResponse';
import { WsResponse } from 'src/app/dto/WsResponse';
import { EvolucionResponse } from 'src/app/dto/response/BandejaMonitoreo/EvolucionResponse';
import { ParametroRequest } from 'src/app/dto/ParametroRequest';
import { CustomValidator } from 'src/app/directives/custom.validator';
import { EvolucionRequest } from 'src/app/dto/request/BandejaMonitoreo/EvolucionRequest';
import { EvolucionMarcadorRequest } from 'src/app/dto/request/BandejaMonitoreo/EvolucionMarcadorRequest';
import { LineaTratamientoResponse } from 'src/app/dto/response/BandejaMonitoreo/LineaTratamientoResponse';
import { LineaTratamiento } from 'src/app/dto/solicitudEvaluacion/bandeja/LineaTratamiento';
import { UsuarioService } from 'src/app/dto/service/usuario.service';
import { MarcadorRequest } from 'src/app/dto/request/BandejaMonitoreo/MarcadorRequest';
import { DetalleMarcadorResponse } from 'src/app/dto/response/BandejaMonitoreo/DetalleMarcadorResponse';
import { MonitoreoResponse } from 'src/app/dto/response/BandejaMonitoreo/MonitoreoResponse';
import { NullAstVisitor } from '@angular/compiler';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BOpcionMenuLocalStorage } from 'src/app/dto/core/BOpcionMenuLocalStorage';
import { ResultadosEvolucionComponent } from '../resultados-evolucion/resultados-evolucion.component';

export interface DataDialog {
  title: string;
  monitoreo: MonitoreoResponse;
  lineaTratamiento: LineaTratamientoResponse;
  listaEvolucion: EvolucionResponse[];
  evolucion: EvolucionResponse;
  tipo: number;
  user?:number
}

@Component({
  selector: 'app-registrar-evolucion',
  templateUrl: './registrar-evolucion.component.html',
  styleUrls: ['./registrar-evolucion.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS_AUNA },
    { provide: MatPaginatorIntl, useClass: forwardRef(() => MatPaginatorIntlEspanol) }
  ]
})
export class RegistrarEvolucionComponent implements OnInit {
  dataTablaToxicidad: any[]
  evolucionFrmGrp: FormGroup = new FormGroup({
    descMACFrmCtrl: new FormControl(null),
    lineaTrataFrmCtrl: new FormControl(null),
    fecInactFormControl: new FormControl(null),
    motivoInactFrmCtrl: new FormControl(null),
    fecProxMonFormControl: new FormControl(null),
    fIniLineaFormControl: new FormControl(null),
    resEvolFrmCtrl: new FormControl(null),
    pEstadoMonitoreo: new FormControl(null, [Validators.required]),
    observFormControl: new FormControl(null),
    nroEvolucionFrmCtrl: new FormControl(null),
    fMonitoreoFrmCtrl: new FormControl(null),
    toleranciaFrmCtrl: new FormControl(null),
    rptaClinicaFrmCtrl: new FormControl(null),
    gradoFrmCtrl: new FormControl(null),
    fecMonitFrmCtrl: new FormControl(null),
    atenAlertaFrmCtrl: new FormControl(null),
    existeToxFrmCtrl: new FormControl(1),
    toxicidadFrmCtrl: new FormControl(null),
    toxiGradoFrmCtrl: new FormArray([
      new FormGroup({
        tipo_toxicidad: new FormControl(""),
        grado: new FormControl("")
      })
    ]),
    //ADDED
    descripcionFrmCtrl: new FormControl(null)
  });
  //ADDED

  hideBotonMon: boolean = false;
  tableBasalFrmGrp: FormGroup = new FormGroup({});
  cmbSeleccionado: number;
  evolucionRequest: EvolucionRequest;
  maxDate: Date;
  TIPO_FORM = TIPO_FORM;

  estadoMarcador = new FormControl("1")

  @ViewChild(ResultadosEvolucionComponent) resultadosEvolucion: ResultadosEvolucionComponent;

  columnasTablaToxicidad = ["tipo_toxicidad", "grado_toxicidad"]

  get descMACFrmCtrl() { return this.evolucionFrmGrp.get('descMACFrmCtrl'); }
  get lineaTrataFrmCtrl() { return this.evolucionFrmGrp.get('lineaTrataFrmCtrl'); }
  get motivoInactFrmCtrl() { return this.evolucionFrmGrp.get('motivoInactFrmCtrl'); }
  get fIniLineaFormControl() { return this.evolucionFrmGrp.get('fIniLineaFormControl'); }
  get nroEvolucionFrmCtrl() { return this.evolucionFrmGrp.get('nroEvolucionFrmCtrl'); }
  get observFormControl() { return this.evolucionFrmGrp.get('observFormControl'); }
  get fMonitoreoFrmCtrl() { return this.evolucionFrmGrp.get('fMonitoreoFrmCtrl'); }
  get toleranciaFrmCtrl() { return this.evolucionFrmGrp.get('toleranciaFrmCtrl'); }
  get fecInactFormControl() { return this.evolucionFrmGrp.get('fecInactFormControl'); }
  get fecProxMonFormControl() { return this.evolucionFrmGrp.get('fecProxMonFormControl'); }
  get rptaClinicaFrmCtrl() { return this.evolucionFrmGrp.get('rptaClinicaFrmCtrl'); }
  get atenAlertaFrmCtrl() { return this.evolucionFrmGrp.get('atenAlertaFrmCtrl'); }
  get existeToxFrmCtrl() { return this.evolucionFrmGrp.get('existeToxFrmCtrl'); }
  get resEvolFrmCtrl() { return this.evolucionFrmGrp.get('resEvolFrmCtrl'); }
  get pEstadoMonitoreo() { return this.evolucionFrmGrp.get('pEstadoMonitoreo'); }
  get fecMonitFrmCtrl() { return this.evolucionFrmGrp.get('fecMonitFrmCtrl'); }
  get descripcionFrmCtrl() { return this.evolucionFrmGrp.get('descripcionFrmCtrl'); }
  get toxicidadFrmCtrl() { return this.evolucionFrmGrp.get('toxicidadFrmCtrl'); }
  get gradoFrmCtrl() { return this.evolucionFrmGrp.get('gradoFrmCtrl'); }
  get toxiGradoFrmCtrl() { return this.evolucionFrmGrp.get('toxiGradoFrmCtrl') as FormArray; }
  cmbResEvolucion: any[];

  cmbTolerancia: any[];
  cmbRptaClinica: any[];
  cmbGrado: any[];
  cmbAtenAlerta: any[];
  cmbToxicidad: any[];
  cmbEstMonitoreo: any[]

  opcionMenu: BOpcionMenuLocalStorage;
  valorMostrarOpcion = ACCESO_EVALUACION.mostrarOpcion;

  txtMedicamento: number;
  txtlineaTratamiento: number;
  txtNroEvolucion: number;
  cbTolerancia: number;
  cbRespClinica: number;
  cbAtenAlertas: number;
  txtFecInicioLinTrat: number;
  txtFecMonitoreo: number;
  btnExisteToxicidad: number;
  cbToxicidad: number;
  cbGrado: number;
  btnPendInformacion: number;
  btnGrabar: number;
  btnSalir: number;
  cmbMotInactivacion: any[];

  // Tabla
  dataSource: MatTableDataSource<MarcadorResponse>;
  listaMarcadores: MarcadorResponse[];
  listaDetalleMarcadores: EvolucionMarcadorRequest[];
  isLoading: boolean;
  displayedColumns: string[] = [];
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  columnsGrilla = [{
    columnDef: 'perioMin',
    header: 'PERIOCIDAD MINIMA',
    cell: (marcador: MarcadorResponse) => `${marcador.descPerMinima}`
  }, {
    columnDef: 'perioMax',
    header: 'PERIOCIDAD MAXIMA',
    cell: (marcador: MarcadorResponse) => `${marcador.descPerMaxima}`
  }];

  public columnsGrillaCasos = [{
    codAcceso: ACCESO_MONITOREO.tablaRegMarcadores.indice,
    columnDef: 'item',
  }, {
    codAcceso: ACCESO_MONITOREO.tablaRegMarcadores.marcador,
    columnDef: 'marcador',
  }, {
    codAcceso: ACCESO_MONITOREO.tablaRegMarcadores.periodicidadMin,
    columnDef: 'perioMin',
  }, {
    codAcceso: ACCESO_MONITOREO.tablaRegMarcadores.periodicidadMax,
    columnDef: 'perioMax',
  }, {
    codAcceso: ACCESO_MONITOREO.tablaRegMarcadores.sinRegHC,
    columnDef: 'sinRegistro',
  }, {
    codAcceso: ACCESO_MONITOREO.tablaRegMarcadores.resultado,
    columnDef: 'resultado',
  }, {
    codAcceso: ACCESO_MONITOREO.tablaRegMarcadores.fechaResultado,
    columnDef: 'fecResultado',
  }];

  rbtExisteToxi = [{
    codigo: 1,
    titulo: 'SI'
  }, {
    codigo: 0,
    titulo: 'NO'
  }];

  constructor(public dialog: MatDialog,
    public dialogRef: MatDialogRef<RegistrarEvolucionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DataDialog,
    private datePipe: DatePipe,
    private parametroService: ListaParametroservice,
    private bandejaMonitoreoService: BandejaMonitoreoService,
    private spinnerService: Ng4LoadingSpinnerService,
    @Inject(UsuarioService) private userService: UsuarioService) { }

  ngOnInit() {
    this.inicializarVariables();
    if (this.data.tipo == 1) {//REGISTRAR
      //this.inicializarVariables();
      this.descMACFrmCtrl.setValue(this.data.monitoreo.nomMedicamento);
      this.fMonitoreoFrmCtrl.setValue(new Date());
      this.fIniLineaFormControl.setValue(this.datePipe.transform(this.data.monitoreo.fecIniLineaTratamiento, 'dd/MM/yyyy'));
      this.lineaTrataFrmCtrl.setValue('L' + this.data.monitoreo.numeroLineaTratamiento);
      this.nroEvolucionFrmCtrl.setValue(this.data.listaEvolucion.length + 1);
      this.toleranciaFrmCtrl.setValue('');
      this.rptaClinicaFrmCtrl.setValue('');
      this.atenAlertaFrmCtrl.setValue('');
      //this.existeToxFrmCtrl.setValue(0);
      this.toxicidadFrmCtrl.setValue('');
      this.gradoFrmCtrl.setValue('');
      // this.toxiGradoFrmCtrl.disable()
      // this.existeToxFrmCtrl.disable();
      this.toxicidadFrmCtrl.disable();
      this.gradoFrmCtrl.disable();
      this.fecProxMonFormControl.setValue(new Date());
      this.listarMarcadores(CONFIGURACION.macVigencia); //64 => TODOS LOS ACTIVOS(AHORA:8)
    } else {
      if (this.data.tipo == 2) {
        //this.cargarComboMotInactivacion();
        //this.inicializarVariables();
        this.descMACFrmCtrl.setValue(this.data.evolucion.descMac);
        this.fMonitoreoFrmCtrl.setValue(new Date(this.datePipe.transform(this.data.evolucion.fecMonitoreo, 'yyyy/MM/dd')));
        this.fIniLineaFormControl.setValue(this.datePipe.transform(this.data.monitoreo.fecIniLineaTratamiento, 'dd/MM/yyyy'));
        this.lineaTrataFrmCtrl.setValue('L' + this.data.monitoreo.numeroLineaTratamiento);
        this.nroEvolucionFrmCtrl.setValue(this.data.evolucion.nroDescEvolucion);
        this.estadoMarcador.setValue(this.data.evolucion.existeMarcadores)
        this.existeToxFrmCtrl.setValue(this.data.evolucion.existeToxicidad);
        this.toleranciaFrmCtrl.setValue(this.data.evolucion.pTolerancia);
        this.rptaClinicaFrmCtrl.setValue(this.data.evolucion.pRespClinica);
        this.atenAlertaFrmCtrl.setValue(this.data.evolucion.pAtenAlerta);
        this.fecProxMonFormControl.setValue(this.data.evolucion.fecProxMonitoreo);
        this.motivoInactFrmCtrl.setValue(this.data.evolucion.pMotivoInactivacion);
        this.pEstadoMonitoreo.setValue(this.data.evolucion.pEstadoMonitoreo);
        this.resEvolFrmCtrl.setValue(this.data.evolucion.pResEvolucion+"");
        this.fecInactFormControl.setValue(this.data.evolucion.fecInactivacion);

        if(this.data.evolucion.observacion){
          this.observFormControl.setValue(this.data.evolucion.observacion);
        }

        if(this.data.evolucion.pEstadoMonitoreo == 119) {
            this.pEstadoMonitoreo.disable()
            this.resEvolFrmCtrl.disable()
        }

        if(this.data.evolucion.pEstadoMonitoreo == 120 || this.data.evolucion.pEstadoMonitoreo == 121) {
          if(this.data.evolucion.pResEvolucion == 226) {
            this.motivoInactFrmCtrl.enable()
            this.fecInactFormControl.enable()
            this.fecProxMonFormControl.disable()
          }
        }

        if (this.data.evolucion.existeToxicidad == '1') {
          this.existeToxFrmCtrl.setValue(1);
        } else {
          this.existeToxFrmCtrl.setValue(0);
          this.toxicidadFrmCtrl.disable();
        }
        this.cargarTablaToxicidad();
      } else {
        //MOSTRAR SOLO OBSERVACION

      }
    }

    this.accesoOpcionMenu()

    //@ts-ignore
    this.dataTablaToxicidad = this.toxiGradoFrmCtrl.value

  }

  // nuevas funciones de resultado evolucion

  public changeMotInac(event) {
    if (event.value == 231) {
      this.fecProxMonFormControl.enable()
    } else {
      this.fecProxMonFormControl.disable()
    }
  }

  public cargarComboEstMonitoreo() {
    let request = new ParametroRequest();
    request.codigoGrupo = '45';
    this.parametroService.consultarParametro(request).subscribe(
      (data: WsResponse) => {
        if (data.audiResponse.codigoRespuesta === '0') {
          this.cmbEstMonitoreo = data.data.filter(el => el.codigoParametro != 118);
        } else {
          console.error(data);
        }
      },
      error => {
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
          this.cmbResEvolucion = data.data.filter(el => el.codigoParametro != 118);
          this.cmbResEvolucion.unshift({ "codigoParametro": "", "nombreParametro": "SELECCIONE" });
        } else {
          console.error(data);
        }
        this.cargarComboMotInactivacion();
        //SETEAR VALOR POR DEFECTO
        // this.resEvolFrmCtrl.setValue('');
      },
      error => {
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
          this.cmbMotInactivacion.unshift({ "codigoParametro": "", "nombreParametro": "SELECCIONE" });
        } else {
          console.error(data);
        }
        this.cargarComboEstMonitoreo()
      },
      error => {
        console.error('Error al listar parametros');
      }
    );
  }

  public cambResultEvolucion(val: any): void {
    if (val == 225) {
      this.fecProxMonFormControl.enable();
      this.fecProxMonFormControl.updateValueAndValidity();
      this.motivoInactFrmCtrl.disable();
      this.fecInactFormControl.disable();
      this.fecInactFormControl.setValue(null);
    } else {
      if (val == 226) {

        this.motivoInactFrmCtrl.enable();
        this.fecInactFormControl.enable();
        this.motivoInactFrmCtrl.updateValueAndValidity();
        this.fecInactFormControl.updateValueAndValidity();
        this.fecProxMonFormControl.disable();
        this.fecProxMonFormControl.setValue(null);
      } else {
        this.motivoInactFrmCtrl.disable();
        this.fecInactFormControl.disable();
        this.fecProxMonFormControl.disable();

      }

    }
  }


  // fin nuevas funciones de resultado evolucion

  public inicializarVariables(): void {
    this.cmbTolerancia = [];
    this.cmbRptaClinica = [];
    this.cmbGrado = [];
    this.cmbAtenAlerta = [];
    this.cmbToxicidad = [];
    this.cmbEstMonitoreo = [];

    this.listaMarcadores = [];

    this.maxDate = new Date();
    this.fecMonitFrmCtrl.setValue(this.datePipe.transform(new Date(), 'dd/MM/yyyy'));
    this.fecProxMonFormControl.disable();
    this.motivoInactFrmCtrl.disable();
    //this.fecInactFormControl.setValue(new Date());
    this.fecInactFormControl.disable();

    this.cargarComboTolerancia();
  }

  public pendienteInformacion(): void {
    let request = new EvolucionRequest();
    if (this.data.tipo == 1) {//REGISTRO
      request.codMonitoreo = this.data.monitoreo.codigoMonitoreo;
      request.pEstadoMonitoreo = ESTADO_MONITOREO.pendienteInformacion;// 121;
    } else {
      request.codMonitoreo = this.data.evolucion.codMonitoreo;
      request.pEstadoMonitoreo = ESTADO_MONITOREO.pendienteInformacion;//121;
    }

    this.spinnerService.show();
    this.bandejaMonitoreoService.actualizarMonitoreoPendInfo(request).subscribe(
      (data: WsResponse) => {
        if (data.audiResponse.codigoRespuesta === '0') {
          this.dialogRef.close(data.data);
          this.spinnerService.hide();
        } else {
          console.error('ERROR:' + data.audiResponse.mensajeRespuesta);
          this.spinnerService.hide();
          this.openDialogMensaje('Error al cambiar estado monitoreo', null, true, false, null);
        }
      },
      error => {
        this.spinnerService.hide();
        this.openDialogMensaje('Error al cambiar estado monitoreo', null, true, false, null);
      }
    );
  }



  public registrarEvolucion(): void {
    this.hideBotonMon = true;

    if ((this.evolucionFrmGrp.invalid || this.tableBasalFrmGrp.invalid) && false) {
      this.toleranciaFrmCtrl.markAsTouched();
      this.rptaClinicaFrmCtrl.markAsTouched();
      this.fecProxMonFormControl.markAsTouched();
      this.gradoFrmCtrl.markAsTouched();
      this.atenAlertaFrmCtrl.markAsTouched();
      this.existeToxFrmCtrl.markAsTouched();
      this.toxicidadFrmCtrl.markAsTouched();
      this.listaMarcadores.forEach((res: MarcadorResponse) => {
        if (res.tieneRegHc) {
          this.tableBasalFrmGrp.controls['r' + res.codMarcador].markAsTouched();
          this.tableBasalFrmGrp.controls['f' + res.codMarcador].markAsTouched();
        }
      });
    } else {
      this.spinnerService.show();
      this.evolucionRequest = new EvolucionRequest();
      this.evolucionRequest.nroEvolucion = this.nroEvolucionFrmCtrl.value;
      //
      this.evolucionRequest.existeMarcadores = this.estadoMarcador.value;
      this.evolucionRequest.codMonitoreo = this.data.monitoreo.codigoMonitoreo;
      this.evolucionRequest.codMac = this.data.monitoreo.codMedicamento;
      this.evolucionRequest.pResEvolucion = Number(this.resEvolFrmCtrl.value);
      this.pEstadoMonitoreo.markAsTouched();
      let time = new Date(this.fMonitoreoFrmCtrl.value)
      time.setHours(0,0,0,0);
      this.evolucionRequest.fecMonitoreo = time;
      this.evolucionRequest.pMotivoInactivacion = null;//CUANDO SE INACTIVA
      this.evolucionRequest.fecInactivacion = null;//CUANDO SE INACTIVA
      this.evolucionRequest.observacion = null;
      this.evolucionRequest.pTolerancia = this.toleranciaFrmCtrl.value;
      this.evolucionRequest.toxigrado = !this.toxiGradoFrmCtrl.value[0].tipo_toxicidad ? []:this.toxiGradoFrmCtrl.value;

      this.evolucionRequest.pRespClinica = this.rptaClinicaFrmCtrl.value;
      this.evolucionRequest.pAtenAlerta = this.atenAlertaFrmCtrl.value;

      if(!this.pEstadoMonitoreo.value){
        this.hideBotonMon=false;
        const dialogRef = this.dialog.open(MessageComponent, {
          width: '400px',
          disableClose: true,
          data: {
            title: "VALIDAR ESTADO DEL PROCESO DE MONITOREO",
            message: "VERIFICAR LLENAR EL CAMPO DE ESTADO DE PROCESO DE MONITOREO",
            message2: null,
            alerta: true,
            confirmacion: false,
            valor: null
          }
        });
        this.spinnerService.hide();

        return null;
      }

      if (this.existeToxFrmCtrl.value) {
        this.evolucionRequest.existeToxicidad = '1';
      } else {
        this.evolucionRequest.existeToxicidad = '0';
      }
      // new stuff

      if (this.evolucionFrmGrp.invalid && false) {
        this.fecProxMonFormControl.markAsTouched();
        this.resEvolFrmCtrl.markAsTouched();
        this.motivoInactFrmCtrl.markAsTouched();
        this.fecInactFormControl.markAsUntouched();
      } else {
        this.spinnerService.show();
        // this.evolucionRequest.codEvolucion = this.data.evolucion.codEvolucion;
        this.evolucionRequest.codMonitoreo = this.data.monitoreo.codigoMonitoreo;
        this.evolucionRequest.pResEvolucion = Number(this.resEvolFrmCtrl.value);
        this.evolucionRequest.pEstadoMonitoreo = this.pEstadoMonitoreo.value;
        this.evolucionRequest.fecMonitoreo = time;
        // this.evolucionRequest.fecMonitoreoR = new Date();
        // this.evolucionRequest.pEstadoMonitoreo = 119;
        this.evolucionRequest.fecProxMonitoreo = null
        this.evolucionRequest.pMotivoInactivacion = null;

        if (this.evolucionRequest.pResEvolucion == 225) {
          //225 ACTIVO
          this.evolucionRequest.codSolEvaluacion = this.data.monitoreo.codSolEvaluacion;
          this.evolucionRequest.descCodSolEvaluacion = this.data.monitoreo.codigoEvaluacion;
          this.evolucionRequest.fecProxMonitoreo = this.fecProxMonFormControl.value;
          this.evolucionRequest.observacion = this.observFormControl.value;
        } else if(this.evolucionRequest.pResEvolucion == 226) {
          //INACTIVO
          this.evolucionRequest.pMotivoInactivacion = this.motivoInactFrmCtrl.value;
          this.evolucionRequest.fecInactivacion = typeof this.fecInactFormControl.value=="string"? new Date(this.fecInactFormControl.value):this.fecInactFormControl.value ;
          this.evolucionRequest.observacion = this.observFormControl.value;
          this.evolucionRequest.fecProxMonitoreo = this.fecProxMonFormControl.value;
        }
        this.evolucionRequest.observacion = this.observFormControl.value;

        this.evolucionRequest.usuarioCrea = this.userService.getCodUsuario + '';
        this.evolucionRequest.estado = 1;
      }

      // end new stuff


      this.evolucionRequest.listaMarcadores = [];
      this.evolucionRequest.estado = 0;
      this.evolucionRequest.usuarioCrea = this.userService.getCodUsuario + '';
      // this.evolucionRequest.pEstadoMonitoreo = ESTADO_MONITOREO.pendienteRegResultado; // 120; //PENDIENTE DE RESULTADO EVOLUCION

      if(this.listaMarcadores.length<=0 && this.estadoMarcador.value == 1){

        this.hideBotonMon = false;
        const dialogRef = this.dialog.open(MessageComponent, {
          width: '400px',
          disableClose: true,
          data: {
            title: "VALIDAR LISTA DE MARCADORES",
            message: "MARCAR NO APLICA SI LA LISTA ESTÁ VACÍA",
            message2: null,
            alerta: true,
            confirmacion: false,
            valor: null
          }
        });
        this.spinnerService.hide();

        return null;
      }


        this.listaMarcadores.forEach((res: MarcadorResponse) => {
          const evolucionMarcador: EvolucionMarcadorRequest = new EvolucionMarcadorRequest();
          evolucionMarcador.codMarcador = res.codMarcador;
          evolucionMarcador.pTipoIngresoRes = res.pTipoIngresoRes;
          evolucionMarcador.pPerMinima = res.pPerMinima;
          evolucionMarcador.pPerMaxima = res.pPerMaxima;
          evolucionMarcador.descPerMinima = res.descPerMinima;
          evolucionMarcador.descPerMaxima = res.descPerMaxima;
          evolucionMarcador.descripcion = res.descripcion;
          evolucionMarcador.unidadMedida = res.unidadMedida;

          let estado = this.tableBasalFrmGrp.controls['c' + res.codMarcador].value;
          if (estado) {
            //CHECK = SIN REGISTRO EN HC
            evolucionMarcador.tieneRegHc = '1';
            this.evolucionRequest.listaMarcadores.push(evolucionMarcador);
          }
          else {
            if (evolucionMarcador.pTipoIngresoRes === TIPO_FORM.formNumero) {//122
              evolucionMarcador.codResultado = this.tableBasalFrmGrp.controls['r' + res.codMarcador].value;
            } else {
              if (evolucionMarcador.pTipoIngresoRes === TIPO_FORM.formCombo) {//123
                evolucionMarcador.codResultado = this.tableBasalFrmGrp.controls['r' + res.codMarcador].value.codDetMarcador;
                evolucionMarcador.resultado = this.tableBasalFrmGrp.controls['r' + res.codMarcador].value.valorFijo;
              } else {
                evolucionMarcador.resultado = this.tableBasalFrmGrp.controls['r' + res.codMarcador].value;
              }
            }
            const fechaTemp = this.tableBasalFrmGrp.controls['f' + res.codMarcador].value;
            evolucionMarcador.fecResultado = fechaTemp;
            evolucionMarcador.tieneRegHc = '0';

            this.evolucionRequest.listaMarcadores.push(evolucionMarcador);
          }
        });


      if(this.existeToxFrmCtrl.value && this.toxiGradoFrmCtrl.value.filter(el=>!el.tipo_toxicidad).length>0){
        this.hideBotonMon = false;
        const dialogRef = this.dialog.open(MessageComponent, {
          width: '400px',
          disableClose: true,
          data: {
            title: "VALIDAR TOXICIDAD",
            message: "VERIFICAR LLENAR TODOS LOS CAMPOS DE TOXICIDAD GRADO",
            message2: null,
            alerta: true,
            confirmacion: false,
            valor: null
          }
        });
        this.spinnerService.hide();

        return null;
      }
      this.listaMarcadores.forEach((res: MarcadorResponse) => {
        if (res.tieneRegHc) {
          this.tableBasalFrmGrp.controls['r' + res.codMarcador].markAsTouched();
          this.tableBasalFrmGrp.controls['f' + res.codMarcador].markAsTouched();
        }
      });


      // CONTINUA FLUJO DE REGISTRO EN DB

      // if (this.evolucionRequest.listaMarcadores.length > 0) {
        if(!this.listaDetalleMarcadores && !this.estadoMarcador.value){
          this.hideBotonMon = false;
          const dialogRef = this.dialog.open(MessageComponent, {
            width: '400px',
            disableClose: true,
            data: {
              title: "VALIDAR LISTA DE MARCADORES",
              message: "MARCAR NO APLICA SI LA LISTA ESTÁ VACÍA",
              message2: null,
              alerta: true,
              confirmacion: false,
              valor: null
            }
          });
          this.spinnerService.hide();

          return null;
        }

        this.evolucionRequest.codAfiliado = this.data.monitoreo.codigoAfiliado
        this.evolucionRequest.cie10 = this.data.monitoreo.codDiagnostico

      this.bandejaMonitoreoService.registrarDatosEvolucion(this.evolucionRequest).subscribe(
        (data: WsResponse) => {
          if (data.audiResponse.codigoRespuesta == '0') {
            this.dialogRef.close(data.audiResponse);
            this.spinnerService.hide();
            this.openDialogMensaje(data.audiResponse.mensajeRespuesta, null, true, false, null);
          } else {
            console.error('ERROR:' + data.audiResponse.mensajeRespuesta);
            this.spinnerService.hide();
            this.openDialogMensaje('Error al registrar datos de evolucion', null, true, false, null);
          }
        },
        error => {
          console.error('Error registro datos evolucion: ' + error);
          this.spinnerService.hide();
          this.openDialogMensaje('Error al cambiar estado monitoreo', null, true, false, null);
        }
      );
      // } else {
      //   console.error('Error, no se registro ningun marcador');
      //   this.spinnerService.hide();
      //   this.openDialogMensaje('No se cargo la lista de marcadores', null, true, false, null);
      // }
    }

  }


  public cargarTablaToxicidad(): void {
    let request = new EvolucionRequest();
    request.codEvolucion = this.data.evolucion.codEvolucion;
    this.bandejaMonitoreoService.listarEvoToxiGrado(request).subscribe(
      (data: WsResponse) => {

        // this.dataTablaToxicidad = data.data;
        if(data.data.length>0){
          window["tabla"]=this.toxiGradoFrmCtrl
          window["tabla2"]=this.dataTablaToxicidad
          // data.data.map(el=>{
          //   return new FormGroup({
          //     tipo_toxicidad:new FormControl(el.tipo_toxicidad),
          //     grado:new FormControl(el.grado)
          //   })
          // })

          data.data.map(el=>{
            this.toxiGradoFrmCtrl.push(new FormGroup({
              tipo_toxicidad:new FormControl(el.tipo_toxicidad),
              grado:new FormControl(el.grado)
            }))
            this.dataTablaToxicidad.push("")
          })
          this.dataTablaToxicidad.pop()
          this.toxiGradoFrmCtrl.removeAt(0)

        }this.listarMarcadores(CONFIGURACION.macVigencia); //64 => TODOS LOS ACTIVOS(AHORA:8)

      },
      error => {
        this.spinnerService.hide();
        console.error('Error registro datos evolucion');
      }
    );

  }

  public actualizarEvolucion(): void {

    if ((this.evolucionFrmGrp.invalid || this.tableBasalFrmGrp.invalid) && false) {
      this.toleranciaFrmCtrl.markAsTouched();
      this.rptaClinicaFrmCtrl.markAsTouched();
      this.gradoFrmCtrl.markAsTouched();
      this.atenAlertaFrmCtrl.markAsTouched();
      this.existeToxFrmCtrl.markAsTouched();


      this.toxicidadFrmCtrl.markAsTouched();
      this.listaMarcadores.forEach((res: MarcadorResponse) => {
        if (res.tieneRegHc) {
          this.tableBasalFrmGrp.controls['r' + res.codMarcador].markAsTouched();
          this.tableBasalFrmGrp.controls['f' + res.codMarcador].markAsTouched();
        }
      });
    } else {
      this.spinnerService.show();
      this.evolucionRequest = new EvolucionRequest();
      this.evolucionRequest.codEvolucion = this.data.evolucion.codEvolucion;
      this.evolucionRequest.codMonitoreo = this.data.evolucion.codMonitoreo;
      this.evolucionRequest.fecMonitoreo = this.fMonitoreoFrmCtrl.value;
      // this.evolucionRequest.fecMonitoreoR = new Date();
      this.evolucionRequest.existeMarcadores = this.estadoMarcador.value;

      this.evolucionRequest.pTolerancia = this.toleranciaFrmCtrl.value;
      this.evolucionRequest.toxigrado = !this.toxiGradoFrmCtrl.value[0].tipo_toxicidad ? []:this.toxiGradoFrmCtrl.value;

      this.evolucionRequest.pRespClinica = this.rptaClinicaFrmCtrl.value;
      this.evolucionRequest.pAtenAlerta = this.atenAlertaFrmCtrl.value;
      this.evolucionRequest.pEstadoMonitoreo = this.data.evolucion.pEstadoMonitoreo;
      if (this.existeToxFrmCtrl.value) {
        this.evolucionRequest.existeToxicidad = '1';
      } else {
        this.evolucionRequest.existeToxicidad = '0';
      }
      this.evolucionRequest.listaMarcadores = [];
      this.evolucionRequest.estado = 0;
      this.evolucionRequest.usuarioModif = this.userService.getCodUsuario + '';
           // new stuff

           if (this.evolucionFrmGrp.invalid && false) {
            this.fecProxMonFormControl.markAsTouched();
            this.resEvolFrmCtrl.markAsTouched();
            this.motivoInactFrmCtrl.markAsTouched();
            this.fecInactFormControl.markAsUntouched();
          } else {
            this.spinnerService.show();
            // this.evolucionRequest.codEvolucion = this.data.evolucion.codEvolucion;
            this.evolucionRequest.codMonitoreo = this.data.monitoreo.codigoMonitoreo;
            this.evolucionRequest.pResEvolucion = Number(this.resEvolFrmCtrl.value);
            this.evolucionRequest.pEstadoMonitoreo = this.pEstadoMonitoreo.value;
            // this.evolucionRequest.fecMonitoreo = new Date();
            // this.evolucionRequest.fecMonitoreoR = new Date();
            // this.evolucionRequest.pEstadoMonitoreo = 119;
            if (this.evolucionRequest.pResEvolucion == 225) {
              //225 ACTIVO
              this.evolucionRequest.codSolEvaluacion = this.data.monitoreo.codSolEvaluacion;
              this.evolucionRequest.descCodSolEvaluacion = this.data.monitoreo.codigoEvaluacion;

               //this.evolucionRequest.fecProxMonitoreo = this.fecProxMonFormControl.value;
              this.evolucionRequest.fecProxMonitoreo = typeof this.fecProxMonFormControl.value=="string"? new Date(this.fecProxMonFormControl.value):this.fecProxMonFormControl.value;

              this.evolucionRequest.observacion = this.observFormControl.value;


              //INACTIVO
              this.evolucionRequest.pMotivoInactivacion = this.motivoInactFrmCtrl.value;
              this.evolucionRequest.fecInactivacion = typeof this.fecInactFormControl.value=="string"? new Date(this.fecInactFormControl.value):this.fecInactFormControl.value ;


            } else {
              //225 ACTIVO
              this.evolucionRequest.codSolEvaluacion = this.data.monitoreo.codSolEvaluacion;
              this.evolucionRequest.descCodSolEvaluacion = this.data.monitoreo.codigoEvaluacion;
              //this.evolucionRequest.fecProxMonitoreo = this.fecProxMonFormControl.value;
              this.evolucionRequest.fecProxMonitoreo = typeof this.fecProxMonFormControl.value=="string"? new Date(this.fecProxMonFormControl.value):this.fecProxMonFormControl.value;
              this.evolucionRequest.observacion = this.observFormControl.value;


              //INACTIVO
              this.evolucionRequest.pMotivoInactivacion = this.motivoInactFrmCtrl.value;
              //this.evolucionRequest.fecInactivacion = typeof this.fecInactFormControl.value=="string"? new Date(this.fecInactFormControl.value):this.fecInactFormControl.value ;
              this.evolucionRequest.fecInactivacion = typeof this.fecInactFormControl.value=="string"? new Date(this.fecInactFormControl.value):this.fecInactFormControl.value ;

            }
            this.evolucionRequest.usuarioModif = this.userService.getCodUsuario + '';
            // this.evolucionRequest.estado = 1;
          }
          if(!this.listaDetalleMarcadores && !this.estadoMarcador.value){
            const dialogRef = this.dialog.open(MessageComponent, {
              width: '400px',
              disableClose: true,
              data: {
                title: "VALIDAR LISTA DE MARCADORES",
                message: "MARCAR NO APLICA SI LA LISTA ESTÁ VACÍA",
                message2: null,
                alerta: true,
                confirmacion: false,
                valor: null
              }
            });
            this.spinnerService.hide();

            return null;
          }
          // end new stuff

          if(this.listaMarcadores.length<=0 && this.estadoMarcador.value == 1){
            const dialogRef = this.dialog.open(MessageComponent, {
              width: '400px',
              disableClose: true,
              data: {
                title: "VALIDAR LISTA DE MARCADORES",
                message: "MARCAR NO APLICA SI LA LISTA ESTÁ VACÍA",
                message2: null,
                alerta: true,
                confirmacion: false,
                valor: null
              }
            });
            this.spinnerService.hide();

            return null;
          }

          if(this.listaDetalleMarcadores && this.listaMarcadores.length>0 && this.estadoMarcador.value == 1){

            this.listaDetalleMarcadores.forEach((res: EvolucionMarcadorRequest) => {
              let marcador = new EvolucionMarcadorRequest();
              marcador.codEvolucionMarcador = res.codEvolucionMarcador;

              let estado = this.tableBasalFrmGrp.controls['c' + res.codMarcador]?this.tableBasalFrmGrp.controls['c' + res.codMarcador].value:null;
              if (estado) {
                //NO HAY REGISTROS
                marcador.tieneRegHc = '1';
                this.evolucionRequest.listaMarcadores.push(marcador);
              }
              else {
                if (res.pTipoIngresoRes === TIPO_FORM.formNumero) {//122
                  marcador.codResultado = this.tableBasalFrmGrp.controls['r' + res.codMarcador].value;
                } else {
                  if (res.pTipoIngresoRes === TIPO_FORM.formCombo) {//123
                    marcador.codResultado = this.tableBasalFrmGrp.controls['r' + res.codMarcador].value.codDetMarcador;
                    marcador.resultado = this.tableBasalFrmGrp.controls['r' + res.codMarcador].value.valorFijo;
                  } else {
                    marcador.resultado = this.tableBasalFrmGrp.controls['r' + res.codMarcador]?this.tableBasalFrmGrp.controls['r' + res.codMarcador].value:null;
                  }
                }
                const fechaTemp = this.tableBasalFrmGrp.controls['f' + res.codMarcador]?this.tableBasalFrmGrp.controls['f' + res.codMarcador].value:null;
                marcador.fecResultado = fechaTemp;
                marcador.tieneRegHc = '0';

                this.evolucionRequest.listaMarcadores.push(marcador);
              }
            });
          }
      // CONTINUA FLUJO DE REGISTRO EN DB
        this.bandejaMonitoreoService.actualizarDatosEvolucion(this.evolucionRequest).subscribe(
          (data: WsResponse) => {
            if (data.audiResponse.codigoRespuesta === '0') {
              this.dialogRef.close(data.data);
              this.spinnerService.hide();
            } else {
              console.error('ERROR:' + data.audiResponse.mensajeRespuesta);
              this.spinnerService.hide();
              this.openDialogMensaje('Error al actualizar datos de evolucion', null, true, false, null);
            }
          },
          error => {
            console.error('Error actualizar datos evolucion');
            this.spinnerService.hide();
            this.openDialogMensaje('Error al actualizar datos de evolucion', null, true, false, null);
          }
        );

    }
  }

  public onClose(): void {
    this.dialogRef.close(null);
  }

  public enableFrmExistToxicidad() {
    let tol = this.toleranciaFrmCtrl.value;
    if (tol === TOLERANCIA_EVOLUCION.favorable) { // 155
      this.existeToxFrmCtrl.setValue('');

      // this.existeToxFrmCtrl.disable();
      this.toxiGradoFrmCtrl.enable();
      this.toxicidadFrmCtrl.disable();
      this.gradoFrmCtrl.disable();
    } else {
      this.existeToxFrmCtrl.setValue(0);
      this.toxicidadFrmCtrl.setValue('');
      this.gradoFrmCtrl.setValue('');

      this.existeToxFrmCtrl.enable();
      this.toxiGradoFrmCtrl.disable();
      this.toxicidadFrmCtrl.disable();
      this.gradoFrmCtrl.disable();
    }
  }

  public enableFrmToxicidad() {
    if (this.existeToxFrmCtrl.value == 1) {
      this.toxiGradoFrmCtrl.enable();
      this.toxicidadFrmCtrl.enable();
      this.gradoFrmCtrl.enable();
    } else {
      this.toxiGradoFrmCtrl.disable();
      this.toxicidadFrmCtrl.disable();
      this.gradoFrmCtrl.disable();
      this.toxicidadFrmCtrl.disable();

    }
  }

  public agregarToxigrado() {
    //@ts-ignore
    this.toxiGradoFrmCtrl.push(
      new FormGroup({
        tipo_toxicidad: new FormControl(""),
        grado: new FormControl("")
      })
    )
    this.dataTablaToxicidad.push({
      tipo_toxicidad: "",
      grado: ""
    })

  }

  public quitarToxigrado(i) {

    //@ts-ignore
    this.toxiGradoFrmCtrl.removeAt(i)

    this.dataTablaToxicidad.pop()

  }

  // POP-UP MENNullAstVisitor
  public verConfirmacion(message: string, marc: MarcadorResponse): void {
    const dialogRef = this.dialog.open(MessageComponent, {
      width: '400px',
      disableClose: true,
      data: {
        title: this.data.title,
        message: message,
        message2: null,
        alerta: false,
        confirmacion: true,
        valor: null
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        if (result == 1) {//DESEA MANTENER SIN REGISTRO EL MARCADOR 1=>SI 0=>NO
          this.habilitarCampos(false, marc);//OCULTA INPUTS
        } else {
          this.habilitarCampos(true, marc);//MUESTRA INPUTS
          this.tableBasalFrmGrp.controls['c' + marc.codMarcador].setValue(false);
        }
      }
    });
  }

  listarMarcadores(pEstado: number) {
    //SPINNER
    this.isLoading = true;
    let request = new MarcadorRequest();
    request.codMac = this.data.monitoreo.codMedicamento;
    request.codGrpDiag = this.data.monitoreo.codGrupoDiagnostico;
    request.pEstado = pEstado;

    this.bandejaMonitoreoService.listarMarcadores(request).subscribe(
      (data: WsResponse) => {
        if (data.audiResponse.codigoRespuesta === '0' ) {
          // ANTES DE FORMAR LA GRILLA SE DEBE FILTAR DE ACUERDO AL TIPO
          if (this.data.tipo === 1 ) { // REGISTRO
            this.listaMarcadores = data.data;
            this.listaMarcadores.forEach(elem => { elem.tieneRegHc = true; }); // HACE QUE TODOS SE MUESTREN CON ESTADO DE REGISTRO
            this.cargarDatosTabla();
            this.isLoading = false;
          }
          else {
            let request: EvolucionMarcadorRequest = new EvolucionMarcadorRequest();
            request.codEvolucion = this.data.evolucion.codEvolucion;

            this.bandejaMonitoreoService.listarDetalleEvolucion(request).subscribe(
              (dato: WsResponse) => {
                if (dato.audiResponse.codigoRespuesta === '0') {
                  this.listaDetalleMarcadores = dato.data;
                  let list = data.data;

                  list.forEach(mar => {
                    let marcRegistrado = this.listaDetalleMarcadores.filter(detMar => detMar.codMarcador == mar.codMarcador)[0];
                    if (marcRegistrado) {
                      mar.tieneRegHc = (marcRegistrado.tieneRegHc == '0') ? true : false;
                    } else {
                      mar.tieneRegHc = true;//PARA AQUELLOS MARCADORES RECIEN AGREGADOS
                    }

                    if (mar.pEstado == CONFIGURACION.macVigencia) {//64 (AHORA 8)//AGREGA TODOS LOS QUE ESTAN EN ESTADO ACTIVO
                      this.listaMarcadores.push(mar);
                    } else {//VERIFICA SI ALGUNO DE LOS QUE ESTAN INACTIVOS, SE REGISTRO EN UNA ANTERIOR
                      if (marcRegistrado) {
                        this.listaMarcadores.push(mar);
                      }
                    }
                  });
                } else {
                  console.error('RESPUESTA DETALLE MARCADOR:' + data.audiResponse.mensajeRespuesta);
                }
                this.cargarDatosTabla();
                this.isLoading = false;
              },
              error => {
                console.error('Error al listar monitoreo');
                this.isLoading = false;
              }
            );
            this.isLoading = false;

          }
        } else {
          this.isLoading = false;
        }
      },
      error => {
        console.error('Error al listar monitoreo');
        this.isLoading = false;
      }
    );
  }

  public imprimir(i, element) {


  }

  public cargarDatosTabla(): void {
    if (this.listaMarcadores.length > 0) {
      //AGREGA A LOS MARCADORES UN SELECCIONE

      this.dataSource = new MatTableDataSource(this.listaMarcadores);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      const frmCtrl = {};
      this.listaMarcadores.forEach((resultado: MarcadorResponse) => {
        frmCtrl[`c${resultado.codMarcador}`] = new FormControl(null);
        if (resultado.tieneRegHc) {//CREA FORMS CON VALIDACIONES COMPLETAS => PARA LOS VISIBLES
          frmCtrl[`f${resultado.codMarcador}`] = new FormControl(null);
          switch (resultado.pTipoIngresoRes) {
            case TIPO_FORM.formNumero://122:
              frmCtrl[`r${resultado.codMarcador}`] =
                new FormControl(null, [CustomValidator.checkLimit(resultado.rangoMinimo, resultado.rangoMaximo)]);
              break;
            case TIPO_FORM.formCombo://123:
              frmCtrl[`r${resultado.codMarcador}`] = new FormControl(null);
              break;
            case TIPO_FORM.formTexto://124:
              frmCtrl[`r${resultado.codMarcador}`] = new FormControl(null);
              break;
          }
        } else {//CREA FORM SIN VALIDATOS => PARA LOS NO VISIBLES
          frmCtrl[`f${resultado.codMarcador}`] = new FormControl(null);
          switch (resultado.pTipoIngresoRes) {
            case TIPO_FORM.formNumero://122:
              frmCtrl[`r${resultado.codMarcador}`] = new FormControl(null);
              break;
            case TIPO_FORM.formCombo://123:
              frmCtrl[`r${resultado.codMarcador}`] = new FormControl(null);
              break;
            case TIPO_FORM.formTexto://124:
              frmCtrl[`r${resultado.codMarcador}`] = new FormControl(null);
              break;
          }
        }
      });

      this.tableBasalFrmGrp = new FormGroup(frmCtrl);

      this.completarDatosMarcador();
    }
  }

  public completarDatosMarcador() {
    //COMPLETA LOS FORMULARIOS
    if (this.data.tipo == 1) {//REGISTRO
      this.listaMarcadores.forEach((mar: MarcadorResponse) => {
        //this.tableBasalFrmGrp.controls['f' + mar.codMarcador].setValue(new Date());
        this.tableBasalFrmGrp.controls[`f${mar.codMarcador}`].setValue(new Date(this.datePipe.transform(new Date(), 'yyyy/MM/dd')));
        /*  if (mar.pTipoIngresoRes == 123) {
            this.tableBasalFrmGrp.controls['r' + mar.codMarcador].setValue('');
          }*/
      });
    } else {//ACTUALIZAR
      this.listaDetalleMarcadores.forEach((resultado: EvolucionMarcadorRequest) => {
        let noTieneRegHc = (resultado.tieneRegHc == '1') ? true : false;
        this.tableBasalFrmGrp.controls['c' + resultado.codMarcador].setValue(noTieneRegHc);
        this.tableBasalFrmGrp.controls['f' + resultado.codMarcador].setValue(noTieneRegHc ? new Date(this.datePipe.transform(new Date(), 'yyyy/MM/dd')) : new Date(this.datePipe.transform(resultado.fecResultado, 'yyyy/MM/dd')));
        if (!noTieneRegHc) {
          switch (resultado.pTipoIngresoRes) {
            case TIPO_FORM.formNumero:// 122:
              this.tableBasalFrmGrp.controls['r' + resultado.codMarcador].setValue(resultado.codResultado);
              break;
            case TIPO_FORM.formCombo://123:
              var marc = this.listaMarcadores.filter(mar => mar.codMarcador == resultado.codMarcador)[0];
              var obj = marc.listaDetalleMarcador.filter(dm => dm.codDetMarcador == resultado.codResultado)[0];
              this.tableBasalFrmGrp.controls['r' + resultado.codMarcador].setValue(obj);
              break;
            case TIPO_FORM.formTexto://124:
              this.tableBasalFrmGrp.controls['r' + resultado.codMarcador].setValue(resultado.resultado);
              break;
          }
        }
      });
      if(this.estadoMarcador.value ==0){
        this.deshabilitarMarcadores();
      }

      /*if(this.estadoMarcador.value ==1){

        this.listaDetalleMarcadores.forEach((resultado: EvolucionMarcadorRequest) => {
          let noTieneRegHc = (resultado.tieneRegHc == '1') ? true : false;
          this.tableBasalFrmGrp.controls['c' + resultado.codMarcador].setValue(noTieneRegHc);
          this.tableBasalFrmGrp.controls['f' + resultado.codMarcador].setValue(noTieneRegHc ? new Date(this.datePipe.transform(new Date(), 'yyyy/MM/dd')) : new Date(this.datePipe.transform(resultado.fecResultado, 'yyyy/MM/dd')));
          if (!noTieneRegHc) {
            switch (resultado.pTipoIngresoRes) {
              case TIPO_FORM.formNumero:// 122:
                this.tableBasalFrmGrp.controls['r' + resultado.codMarcador].setValue(resultado.codResultado);
                break;
              case TIPO_FORM.formCombo://123:
                var marc = this.listaMarcadores.filter(mar => mar.codMarcador == resultado.codMarcador)[0];
                var obj = marc.listaDetalleMarcador.filter(dm => dm.codDetMarcador == resultado.codResultado)[0];
                this.tableBasalFrmGrp.controls['r' + resultado.codMarcador].setValue(obj);
                break;
              case TIPO_FORM.formTexto://124:
                this.tableBasalFrmGrp.controls['r' + resultado.codMarcador].setValue(resultado.resultado);
                break;
            }
          }
        });
      }else{
        this.deshabilitarMarcadores()
      }*/

    }
  }

  public cambiarEstadoMarcadores(event) {
    if (event.value == "1") {
      this.habilitarMarcadores()
    } else {
      this.deshabilitarMarcadores()
    }
  }

  private deshabilitarMarcadores() {

    this.tableBasalFrmGrp.disable()
  }
  private habilitarMarcadores() {

    this.tableBasalFrmGrp.enable()
  }

  public cargarComboTolerancia() {
    let request = new ParametroRequest();
    request.codigoGrupo = GRUPO_PARAMETRO.tolerancia;//'56';
    this.parametroService.consultarParametro(request).subscribe(
      (data: WsResponse) => {
        if (data.audiResponse.codigoRespuesta === '0') {
          this.cmbTolerancia = data.data;
          this.cmbTolerancia.unshift({ "codigoParametro": "", "nombreParametro": "SELECCIONE" });
        } else {
          console.error(data);
        }
        this.cargarComboAtenAlertas();
      },
      error => {
        console.error('Error al listar parametros');
      }
    );
  }

  public cargarComboToxicidad() {
    let request = new ParametroRequest();
    request.codigoGrupo = GRUPO_PARAMETRO.toxicidad;//'57';
    this.parametroService.consultarParametro(request).subscribe(
      (data: WsResponse) => {
        if (data.audiResponse.codigoRespuesta === '0') {
          this.cmbToxicidad = data.data;
          this.cmbToxicidad.unshift({ "codigoParametro": "", "nombreParametro": "SELECCIONE" });
        } else {
          console.error(data);
        }
        this.cargarComboRespClinica();
      },
      error => {
        console.error('Error al listar parametros');
      }
    );
  }

  public cargarComboGrado() {
    let request = new ParametroRequest();
    request.codigoGrupo = GRUPO_PARAMETRO.grado;//'58';
    this.parametroService.consultarParametro(request).subscribe(
      (data: WsResponse) => {
        if (data.audiResponse.codigoRespuesta === '0') {
          this.cmbGrado = data.data;
          this.cmbGrado.unshift({ "codigoParametro": "", "nombreParametro": "SELECCIONE" });
        } else {
          console.error(data);
        }
        this.cargarComboToxicidad();
      },
      error => {
        console.error('Error al listar parametros');
      }
    );
  }

  public cargarComboRespClinica() {
    let request = new ParametroRequest();
    request.codigoGrupo = GRUPO_PARAMETRO.respuestaClinica;//'59';
    this.parametroService.consultarParametro(request).subscribe(
      (data: WsResponse) => {
        if (data.audiResponse.codigoRespuesta === '0') {
          this.cmbRptaClinica = data.data;
          this.cmbRptaClinica.unshift({ "codigoParametro": "", "nombreParametro": "SELECCIONE" });
        } else {
          console.error(data);
        }
        this.cargarComboResEvolucion()
      },
      error => {
        console.error('Error al listar parametros');
      }
    );
  }

  public cargarComboAtenAlertas() {
    let request = new ParametroRequest();
    request.codigoGrupo = GRUPO_PARAMETRO.atencionAlertas;//'60';
    this.parametroService.consultarParametro(request).subscribe(
      (data: WsResponse) => {
        if (data.audiResponse.codigoRespuesta === '0') {
          this.cmbAtenAlerta = data.data;
          this.cmbAtenAlerta.unshift({ "codigoParametro": "", "nombreParametro": "SELECCIONE" });
        } else {
          console.error(data);
        }
        this.cargarComboGrado();
      },
      error => {
        console.error('Error al listar parametros');
      }
    );
  }

  public ocultar(evt: any, marc: MarcadorResponse) {
    let check = this.tableBasalFrmGrp.controls['c' + marc.codMarcador].value;
    if (check) {
      marc.tieneRegHc = false;//TEMPORAL
      this.revisarDiasSinRegistro(marc);
    } else {
      this.habilitarCampos(true, marc);
    }
  }

  public revisarDiasSinRegistro(marc: MarcadorResponse): void {
    //VERIFICAR SI TIENE EVOLUCIONES ANTERIORES
    let dias = 0;
    if (this.data.listaEvolucion.length > 0) {//HAY REGISTROS DE EVOLUCION????
      //REQUEST PARA TRAER PARAMETROS
      let request = new EvolucionMarcadorRequest();
      request.codMarcador = marc.codMarcador;
      request.codSolEva = this.data.monitoreo.codSolEvaluacion;
      if (this.data.evolucion) {
        request.codEvolucion = this.data.evolucion.codEvolucion;
      } else {
        request.codEvolucion = null;
      }

      this.bandejaMonitoreoService.getUltRegistroMarcador(request).subscribe(
        (data: WsResponse) => {
          if (data.audiResponse.codigoRespuesta === '0') {
            dias = this.diff(new Date(), new Date(this.datePipe.transform(data.data.fecResultado, 'yyyy/MM/dd')));
          } else {
            // TOMA LINEA TRAT Y CALCULA FECHA
            dias = this.diff(new Date(), new Date(this.datePipe.transform(this.data.lineaTratamiento.fecAprobacion, 'yyyy/MM/dd')));
          }
          this.mostrarCondicional(dias, marc);
        },
        error => {
          console.error('Error al obtener marcador');
          dias = 0;
          this.mostrarCondicional(dias, marc);
        }
      );
    } else {//TOMA LA LINEA DE TRATAMIENTO
      dias = this.diff(new Date(), new Date(this.datePipe.transform(this.data.lineaTratamiento.fecAprobacion, 'yyyy/MM/dd')));
      this.mostrarCondicional(dias, marc);
    }
  }

  public mostrarCondicional(dias: number, marc: MarcadorResponse): void {
    if (dias > marc.valPerMinima) {
      this.verConfirmacion('Han transcurrido ' + dias + ' dias desde el ultimo registro del marcador, superando la periodicidad minima del seguimiento del marcador.\n¿Desea mantener el marcador sin registro?', marc);
    } else {
      this.habilitarCampos(false, marc);
    }
  }

  public diff(fecFin: Date, fecInicio: Date): number {
    var diff = Math.round(((fecFin.getTime() - fecInicio.getTime()) / (1000 * 60 * 60 * 24)));
    return diff;
  }

  public habilitarCampos(habilitar: boolean, marc: MarcadorResponse): void {
    if (habilitar) {
      if (marc.pTipoIngresoRes == TIPO_FORM.formNumero) {//122
        marc.tieneRegHc = true;
        this.tableBasalFrmGrp.controls['r' + marc.codMarcador].setValidators([ CustomValidator.checkLimit(marc.rangoMinimo, marc.rangoMaximo)]);
        this.tableBasalFrmGrp.controls['r' + marc.codMarcador].updateValueAndValidity();
        this.tableBasalFrmGrp.controls['f' + marc.codMarcador].updateValueAndValidity();
      } else {
        marc.tieneRegHc = true;
        this.tableBasalFrmGrp.controls['r' + marc.codMarcador].updateValueAndValidity();
        this.tableBasalFrmGrp.controls['f' + marc.codMarcador].updateValueAndValidity();
      }
    } else {
      marc.tieneRegHc = false;
      this.tableBasalFrmGrp.controls['r' + marc.codMarcador].clearValidators();
      this.tableBasalFrmGrp.controls['r' + marc.codMarcador].updateValueAndValidity();
      this.tableBasalFrmGrp.controls['f' + marc.codMarcador].clearValidators();
      this.tableBasalFrmGrp.controls['f' + marc.codMarcador].updateValueAndValidity();
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
        valor: valor
      }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  public accesoOpcionMenu() {
    const data = require('src/assets/data/permisosRecursos.json');
    const regDatosEvolucion = data.bandejaMonitoreo.regDatosEvolucion;
    this.opcionMenu = JSON.parse(localStorage.getItem('opcionMenu'));

    if (this.opcionMenu.opcion.length > 0) {
      this.opcionMenu.opcion.forEach(element => {
        const codOpcion = element.codOpcion;
        switch (codOpcion) {
          case regDatosEvolucion.txtMedicamento:
            this.txtMedicamento = Number(element.flagAsignacion);
            break;
          case regDatosEvolucion.txtlineaTratamiento:
            this.txtlineaTratamiento = Number(element.flagAsignacion);
            break;
          case regDatosEvolucion.txtNroEvolucion:
            this.txtNroEvolucion = Number(element.flagAsignacion);
            break;
          case regDatosEvolucion.cbTolerancia:
            this.cbTolerancia = Number(element.flagAsignacion);
            break;
          case regDatosEvolucion.cbRespClinica:
            this.cbRespClinica = Number(element.flagAsignacion);
            break;
          case regDatosEvolucion.cbAtenAlertas:
            this.cbAtenAlertas = Number(element.flagAsignacion);
            break;
          case regDatosEvolucion.txtFecInicioLinTrat:
            this.txtFecInicioLinTrat = Number(element.flagAsignacion);
            break;
          case regDatosEvolucion.txtFecMonitoreo:
            this.txtFecMonitoreo = Number(element.flagAsignacion);
            break;
          case regDatosEvolucion.btnExisteToxicidad:
            this.btnExisteToxicidad = Number(element.flagAsignacion);
            break;
          case regDatosEvolucion.cbToxicidad:
            this.cbToxicidad = Number(element.flagAsignacion);
            break;
          case regDatosEvolucion.cbGrado:
            this.cbGrado = Number(element.flagAsignacion);
            break;
          case regDatosEvolucion.btnPendInformacion:
            this.btnPendInformacion = Number(element.flagAsignacion);
            break;
          case regDatosEvolucion.btnGrabar:
            this.btnGrabar = Number(element.flagAsignacion);
            break;
          case regDatosEvolucion.btnSalir:
            this.btnSalir = Number(element.flagAsignacion);
            break;
        }
      });
    }

    this.crearTablaMarcadores();
    // this.displayedColumns.push('item', 'marcador', 'perioMin', 'perioMax', 'sinRegistro', 'resultado', 'fecResultado');
  }

  public crearTablaMarcadores() {
    this.columnsGrillaCasos.forEach(c => {
      this.displayedColumns.push(c.columnDef);
    });
  }

}
