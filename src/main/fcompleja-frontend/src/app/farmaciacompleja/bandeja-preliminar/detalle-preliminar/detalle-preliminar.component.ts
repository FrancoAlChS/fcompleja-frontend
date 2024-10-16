import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material';

// DTO
import { InfoSolben } from '../../../dto/bandeja-preliminar/detalle-preliminar/InfoSolben';
import { InformacionScgRequest } from '../../../dto/bandeja-preliminar/detalle-preliminar/InformacionScgRequest';

// Service
import { DetalleSolicitudPreliminarService } from '../../../service/BandejaPreliminar/detalle-preliminar.service';
import { MacService } from '../../../service/mac.service';

import { ApiResponse } from 'src/app/dto/bandeja-preliminar/detalle-preliminar/ApiResponse';
import { ESTADOPRELIMINAR, MENSAJES, MY_FORMATS_AUNA, FILEFTP, ACCESO, EMAIL } from '../../../common';
import { Router } from '@angular/router';
import { BuscarMacComponent } from 'src/app/modal/buscar-mac/buscar-mac.component';
import { ArchivoRequest } from 'src/app/dto/request/ArchivoRequest';
import { MessageComponent } from 'src/app/core/message/message.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { InfoSCGSolbenApi } from 'src/app/dto/bandeja-preliminar/detalle-preliminar/InfoSCGSolbenApi';
import { MACResponse } from 'src/app/dto/configuracion/MACResponse';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { BOpcionMenuLocalStorage } from 'src/app/dto/core/BOpcionMenuLocalStorage';
import { UsuarioService } from 'src/app/dto/service/usuario.service';
import { CorreosService } from 'src/app/service/cross/correos.service';
import { OncoWsResponse } from 'src/app/dto/response/OncoWsResponse';
import { EmailDTO } from 'src/app/dto/core/EmailDTO';
import { CoreService } from 'src/app/service/core.service';
import { WsResponse } from 'src/app/dto/WsResponse';
import { DatePipe } from '@angular/common';
import { ListUsrRol } from 'src/app/dto/ListUsrRol';
import { ListaFiltroUsuarioRolservice } from 'src/app/service/Lista.usuario.rol.service';
import { UsrRolRequest } from 'src/app/dto/UsrRolRequest';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { PreliminarService } from 'src/app/dto/service/preliminar.service';

export interface MacData {
  title: string;
}

@Component({
  selector: 'app-detalle-preliminar',
  templateUrl: './detalle-preliminar.component.html',
  styleUrls: ['./detalle-preliminar.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS_AUNA }
  ]
})

export class DetallePreliminarComponent implements OnInit {

  step: number;
  mensaje: string;
  codigoMac: number;

  correoRequest: EmailDTO;

  bloqInscripcion: boolean;

  mostrarBtn: boolean;

  preliminarFrmGrp: FormGroup = new FormGroup({
    nroSolPreFrmCtrl: new FormControl(null),
    estSolPreFrmCtrl: new FormControl(null)
  });

  get nroSolPreFrmCtrl() { return this.preliminarFrmGrp.get('nroSolPreFrmCtrl'); }
  get estSolPreFrmCtrl() { return this.preliminarFrmGrp.get('estSolPreFrmCtrl'); }

  detPreliminarFrmGrp: FormGroup = new FormGroup({
    nroSCGSolFrmCtrl: new FormControl(null),
    estSCGSolFrmCtrl: new FormControl(null),
    fecSCGSolFrmCtrl: new FormControl(null),
    tipSCGSolFrmCtrl: new FormControl(null),
    clinicaFrmCtrl: new FormControl(null),
    medicoFrmCtrl: new FormControl(null),
    cmpFrmCtrl: new FormControl(null),
    fecRecetaFrmCtrl: new FormControl(null),
    fecQuimioFrmCtrl: new FormControl(null),
    hospDesdeFrmCtrl: new FormControl(null),
    hospFinFrmCtrl: new FormControl(null),
    medicamentoFrmCtrl: new FormControl(null),
    esqQuimioFrmCtrl: new FormControl(null),
    personaFrmCtrl: new FormControl(null),
    totalPresFrmCtrl: new FormControl(null),
    pcteFrmCtrl: new FormControl(null),
    edadFrmCtrl: new FormControl(null),
    grupDiagFrmCtrl: new FormControl(null),
    diagFrmCtrl: new FormControl(null),
    cie10FrmCtrl: new FormControl(null),
    contraFrmCtrl: new FormControl(null),
    planFrmCtrl: new FormControl(null),
    codAfiliadoFrmCtrl: new FormControl(null),
    fecAfilacionFrmCtrl: new FormControl(null),
    estClinicoFrmCtrl: new FormControl(null),
    tnmFrmCtrl: new FormControl(null),
    obsvFrmCtrl: new FormControl(null),
    //codigo luis
    codHisFrmCtrl: new FormControl(null),
    descHisFrmCtrl: new FormControl(null)
  });

  get nroSCGSolFrmCtrl() { return this.detPreliminarFrmGrp.get('nroSCGSolFrmCtrl'); }
  get estSCGSolFrmCtrl() { return this.detPreliminarFrmGrp.get('estSCGSolFrmCtrl'); }
  get fecSCGSolFrmCtrl() { return this.detPreliminarFrmGrp.get('fecSCGSolFrmCtrl'); }
  get tipSCGSolFrmCtrl() { return this.detPreliminarFrmGrp.get('tipSCGSolFrmCtrl'); }
  get clinicaFrmCtrl() { return this.detPreliminarFrmGrp.get('clinicaFrmCtrl'); }
  get medicoFrmCtrl() { return this.detPreliminarFrmGrp.get('medicoFrmCtrl'); }
  get cmpFrmCtrl() { return this.detPreliminarFrmGrp.get('cmpFrmCtrl'); }
  get fecRecetaFrmCtrl() { return this.detPreliminarFrmGrp.get('fecRecetaFrmCtrl'); }
  get fecQuimioFrmCtrl() { return this.detPreliminarFrmGrp.get('fecQuimioFrmCtrl'); }
  get hospDesdeFrmCtrl() { return this.detPreliminarFrmGrp.get('hospDesdeFrmCtrl'); }
  get hospFinFrmCtrl() { return this.detPreliminarFrmGrp.get('hospFinFrmCtrl'); }
  get medicamentoFrmCtrl() { return this.detPreliminarFrmGrp.get('medicamentoFrmCtrl'); }
  get esqQuimioFrmCtrl() { return this.detPreliminarFrmGrp.get('esqQuimioFrmCtrl'); }
  get personaFrmCtrl() { return this.detPreliminarFrmGrp.get('personaFrmCtrl'); }
  get totalPresFrmCtrl() { return this.detPreliminarFrmGrp.get('totalPresFrmCtrl'); }
  get pcteFrmCtrl() { return this.detPreliminarFrmGrp.get('pcteFrmCtrl'); }
  get edadFrmCtrl() { return this.detPreliminarFrmGrp.get('edadFrmCtrl'); }
  get grupDiagFrmCtrl() { return this.detPreliminarFrmGrp.get('grupDiagFrmCtrl'); }
  get diagFrmCtrl() { return this.detPreliminarFrmGrp.get('diagFrmCtrl'); }
  get cie10FrmCtrl() { return this.detPreliminarFrmGrp.get('cie10FrmCtrl'); }
  get contraFrmCtrl() { return this.detPreliminarFrmGrp.get('contraFrmCtrl'); }
  get planFrmCtrl() { return this.detPreliminarFrmGrp.get('planFrmCtrl'); }
  get codAfiliadoFrmCtrl() { return this.detPreliminarFrmGrp.get('codAfiliadoFrmCtrl'); }
  get fecAfilacionFrmCtrl() { return this.detPreliminarFrmGrp.get('fecAfilacionFrmCtrl'); }
  get estClinicoFrmCtrl() { return this.detPreliminarFrmGrp.get('estClinicoFrmCtrl'); }
  get tnmFrmCtrl() { return this.detPreliminarFrmGrp.get('tnmFrmCtrl'); }
  get obsvFrmCtrl() { return this.detPreliminarFrmGrp.get('obsvFrmCtrl'); }

  //codigo luis
  get codHisFrmCtrl() {return this.detPreliminarFrmGrp.get('codHisFrmCtrl'); }
  get descHisFrmCtrl() {return this.detPreliminarFrmGrp.get('descHisFrmCtrl'); }
  //

  macFrmGrp: FormGroup = new FormGroup({
    codMacFrmCtrl: new FormControl(null, Validators.required),
    descMacFrmCtrl: new FormControl(null, Validators.required)
  });

  get codMacFrmCtrl() { return this.macFrmGrp.get('codMacFrmCtrl'); }
  get descMacFrmCtrl() { return this.macFrmGrp.get('descMacFrmCtrl'); }

  mac2FrmGrp: FormGroup = new FormGroup({
    descMacDigiFrmCtrl: new FormControl(null, [Validators.required]),
    nameFileFrmCtrl: new FormControl(null, [Validators.required])
  });

  get descMacDigiFrmCtrl() { return this.mac2FrmGrp.get('descMacDigiFrmCtrl'); }
  get nameFileFrmCtrl() { return this.mac2FrmGrp.get('nameFileFrmCtrl'); }

  constructor(public dialog: MatDialog,
    private adapter: DateAdapter<any>,
    private macService: MacService,
    private coreService: CoreService,
    private correoService: CorreosService,
    private datePipe: DatePipe,
    private detalleSolicitudPreliminarService: DetalleSolicitudPreliminarService,
    private router: Router,
    private spinnerService: Ng4LoadingSpinnerService,
    @Inject(UsuarioService) private userService: UsuarioService,
    @Inject(PreliminarService) private preliminar: PreliminarService,
    private usuarioService: ListaFiltroUsuarioRolservice) {

      this.adapter.setLocale('es-PE');
    }

  fileupload: any;
  selectedFile: File;
  nombreMac: any;
  medicoTratante: any;
  nroScgSolben: any;
  medicoAuditor: any;
  estadoBoton: boolean;
  estadoBotonRechazarSol: boolean;
  estadoBotonGenerarSol: boolean;
  nombreMacRead: boolean;
  buscarMac: boolean;
  codEstadoPreliminar: any;

  rptaEstado = {};
  infoSolben: InfoSolben;

  request: InformacionScgRequest;
  nombreDoc: null;

  proBarTabla: boolean;

  mostrarMACDigitado: boolean;

  // DECLARAR VARIABLES OPCIONMENU ACCESO
  opcionMenu: BOpcionMenuLocalStorage;
  valorMostrarOpcion = ACCESO.mostrarOpcion;
  regresarPreliBtn = 0;
  rechazarPreliBtn = 0;
  generarSolPreBtn = 0;
  btnBuscarMac = 0;
  txtCodigoMac = 0;
  txtDescripcionMac = 0;
  btnBorrar = 0;
  txtDescricionMacReg = 0;
  txtArchivoSustento = 0;
  btnInscripcionMac = 0;

  listaUsuarios: ListUsrRol[] = [];

  ngOnInit() {
    this.capturarRegistroPre();
    this.accesoOpcion();
    this.inicializarVariables();
    this.getInfoScg();
  }

  public capturarRegistroPre(): void {
    if (typeof this.preliminar.codSolPre === 'undefined') {
      this.preliminar = this.preliminar.getPreliminar;
    }
  }

  public inicializarVariables(): void {
    this.step = 0;
    this.request = new InformacionScgRequest();
    this.request.codSol = this.preliminar.codSolPre;
    this.nombreMacRead = false;
    this.infoSolben = new InfoSolben();
    this.mostrarMACDigitado = false;
    this.nroSolPreFrmCtrl.setValue(this.preliminar.codSolPre);
    this.bloqInscripcion = false;
    this.nameFileFrmCtrl.disable();

    if (typeof this.preliminar.codSolPre !== 'undefined') {
      this.preliminar.setPreliminar = this.preliminar;
    }
  }

  public setStep(num: number) {
    this.step = num;
  }

  public estadoSolicEvaluacion(): void {
    if ((this.codMacFrmCtrl.value == null && this.descMacFrmCtrl.value == null) ||
      (this.codMacFrmCtrl.value === '' && this.descMacFrmCtrl.value === '')) {
      this.nombreMacRead = false;
      this.estadoBoton = false;
    } else {
      this.nombreMacRead = true;
      this.estadoBoton = true;
      this.descMacDigiFrmCtrl.setValue(null);
    }
  }

  public getInfoScg(): void {
    this.proBarTabla = true;
    this.detalleSolicitudPreliminarService
      .getInfoScg(this.request)
      .subscribe((response: InfoSCGSolbenApi) => {
        if (response !== null && response.audiResponse.codigoRespuesta === '0') {
          if (response.data !== null) {
            this.infoSolben = response.data;
            this.mostrarInformacionSCG();
            this.estadoBotonDetalle(response.data.codEstadoPre);
          } else {
            this.mensaje = MENSAJES.PRELIMINAR.ERROR_SIN_DATA;
            this.openDialogMensaje(this.mensaje, null, null);
          }
        } else {
          this.openDialogMensaje(MENSAJES.ERROR_NOFUNCION, response.audiResponse.mensajeRespuesta, null);
        }
        this.proBarTabla = false;
      },
        error => {
          console.error(error);
          this.mensaje = MENSAJES.ERROR_SERVICIO;
          this.openDialogMensaje(this.mensaje, 'Obtener Detalle Preliminar', null);
          this.proBarTabla = false;
        }
      );
  }

  public mostrarInformacionSCG(): void {

    this.estSolPreFrmCtrl.setValue(this.infoSolben.estadoSolPre);
    this.nroSCGSolFrmCtrl.setValue(this.infoSolben.nroSCGSolben);
    this.estSCGSolFrmCtrl.setValue(this.infoSolben.estadoSCGSolben);
    this.fecSCGSolFrmCtrl.setValue(this.infoSolben.fecSCGSolben);
    this.tipSCGSolFrmCtrl.setValue(this.infoSolben.tipoSolben);
    this.clinicaFrmCtrl.setValue((this.infoSolben.clinica.trim() === '') ? '[NO DISPONIBLE]' : this.infoSolben.clinica );
    this.medicoFrmCtrl.setValue(this.infoSolben.medicoTratante);
    this.cmpFrmCtrl.setValue(this.infoSolben.cmpMedico);
    this.fecRecetaFrmCtrl.setValue(this.infoSolben.fechaReceta);
    this.fecQuimioFrmCtrl.setValue(this.infoSolben.fechaQuimio);
    this.hospDesdeFrmCtrl.setValue(this.infoSolben.hospitalDesde);
    this.hospFinFrmCtrl.setValue(this.infoSolben.hospitalHasta);
    this.medicamentoFrmCtrl.setValue((this.infoSolben.medicamentos !== null) ? this.infoSolben.medicamentos.replace(/\|/gi, ',') : null);
    this.esqQuimioFrmCtrl.setValue((this.infoSolben.esquemaQuimio !== null) ? this.infoSolben.esquemaQuimio.replace(/\|/gi, ',') : null);
    this.personaFrmCtrl.setValue(this.infoSolben.personaContacto);
    this.totalPresFrmCtrl.setValue(this.infoSolben.totalPresupuesto);
    this.codAfiliadoFrmCtrl.setValue(this.infoSolben.codAfiliado);
    this.pcteFrmCtrl.setValue((this.infoSolben.paciente.trim() === '') ? '[NO DISPONIBLE]' : this.infoSolben.paciente);
    this.fecAfilacionFrmCtrl.setValue(this.infoSolben.fechaAfiliado);
    this.edadFrmCtrl.setValue(this.infoSolben.edad);
    this.grupDiagFrmCtrl.setValue(
      (this.infoSolben.grupoDiagnostico.trim() === '') ? '[NO DISPONIBLE]' : this.infoSolben.grupoDiagnostico);
    this.diagFrmCtrl.setValue(( this.infoSolben.diagnostico.trim() === '') ? '[NO DISPONIBLE]' :  this.infoSolben.diagnostico);
    this.cie10FrmCtrl.setValue(this.infoSolben.cie10);
    this.contraFrmCtrl.setValue(this.infoSolben.contratante);
    this.planFrmCtrl.setValue(this.infoSolben.plan);
    this.estClinicoFrmCtrl.setValue((this.infoSolben.estadoClinico !== null) ? this.infoSolben.estadoClinico : '-----');
    this.tnmFrmCtrl.setValue((this.infoSolben.tnm !== null) ? this.infoSolben.tnm : '-----');
    this.obsvFrmCtrl.setValue(this.infoSolben.observacion);

    //codigo luis
    this.codHisFrmCtrl.setValue(this.infoSolben.codHis);
    this.descHisFrmCtrl.setValue(this.infoSolben.descHis);
    //

    if (this.infoSolben.codEstadoPre === ESTADOPRELIMINAR.estadoPendiente ||
      this.infoSolben.codEstadoPre === ESTADOPRELIMINAR.estadoPendienteInscMac) {
      this.bloqInscripcion = false;
    } else {
      this.bloqInscripcion = true;
    }

    this.step = 0;

    this.validarClaseEstadioClinico();
    this.validarClaseTnm();
  }

  validarClaseEstadioClinico(){
    if(this.infoSolben.estadoClinico == ""){
      let idEstadioClinico = document.getElementById("idEstadioClinico");
      idEstadioClinico.classList.add("formPersonal");
    }
  }

  validarClaseTnm(){
    if(this.infoSolben.tnm == ""){
      let idTnm = document.getElementById("idTnm");
      idTnm.classList.add("formPersonal");
    }
  }

  public validarEstadoPendiente(): boolean {
    if (this.infoSolben.codEstadoPre !== ESTADOPRELIMINAR.estadoPendiente) {
      this.mensaje = 'Ya no se puede modificar el estado de solicitud preliminar';
      this.openDialogMensaje(this.mensaje, null, null);
      return false;
    }
    return true;
  }

  public rechazadoSolicPrel() {
    this.request = new InformacionScgRequest();
    this.request.codSol = this.preliminar.codSolPre;
    this.request.estadoSolPre = ESTADOPRELIMINAR.estadoRechazado;
    this.request.codUsuario = Number(this.userService.getCodUsuario);
    this.request.fechaActual = new Date();
    this.spinnerService.show();
    this.detalleSolicitudPreliminarService.updateEstadoSolicitudPreliminar(this.request).subscribe(
      (data: ApiResponse) => {
        if (data.status === '0' && data.response !== null) {
          this.request.estadoSol = data.response;
          this.mensaje = MENSAJES.PRELIMINAR.OK_PRELIMINAR;
          this.openDialogMensaje(this.mensaje, null, null);
          this.estadoBotonDetalle(ESTADOPRELIMINAR.estadoRechazado);
          this.spinnerService.hide();
          this.getInfoScg();
        } else {
          this.mensaje = MENSAJES.ERROR_NOFUNCION;
          this.openDialogMensaje(this.mensaje, data.message, null);
          this.estadoBotonRechazarSol = false;
          this.spinnerService.hide();
        }
      }, error => {
        this.mensaje = MENSAJES.ERROR_SERVICIO;
        this.openDialogMensaje(this.mensaje, 'Error al rechazar Solicitud Preliminar', null);
        console.error(error);
        this.spinnerService.hide();
      }
    );
  }

  public estadoBotonDetalle(codEstadoPreliminar: any) {
    if (codEstadoPreliminar === ESTADOPRELIMINAR.estadoRechazado ||
      codEstadoPreliminar === ESTADOPRELIMINAR.estadoAtendido) {
      this.estadoBotonRechazarSol = true;
      this.estadoBotonGenerarSol = true;
      this.nombreMacRead = true;
      this.buscarMac = true;
    } else {
      this.estadoBotonRechazarSol = false;
      this.estadoBotonGenerarSol = false;
      this.nombreMacRead = false;
      this.buscarMac = false;
    }
  }


  public validarCambioEstado(): boolean {
    this.mensaje = '';
    if (this.infoSolben.codEstadoPre === ESTADOPRELIMINAR.estadoPendiente ||
      this.infoSolben.codEstadoPre === ESTADOPRELIMINAR.estadoPendienteInscMac) {
      if (this.macFrmGrp.invalid) {
        this.step = 1;
        this.mensaje = MENSAJES.PRELIMINAR.FALTA_MAC;
        this.openDialogMensaje(this.mensaje, null, null);
        return false;
      }
    } else {
      this.mensaje = MENSAJES.PRELIMINAR.ERROR_DETALLE_MODIFICADO;
      this.openDialogMensaje(this.mensaje, null, null);
      return false;
    }
    return true;
  }

  public atendidoSolicPrel(): void {
    this.estadoBotonGenerarSol = true;
    this.request = new InformacionScgRequest();
    this.request.codMac = this.codigoMac;
    this.request.codSol = this.preliminar.codSolPre;
    this.request.estadoSolPre = ESTADOPRELIMINAR.estadoAtendido;
    this.request.codUsuario = Number(this.userService.getCodUsuario);
    this.spinnerService.show();
    this.detalleSolicitudPreliminarService.updateEstadoSolicitudPreliminar(this.request).subscribe(
      (data: ApiResponse) => {
        this.rptaEstado = data.status;
        if (this.rptaEstado === '0') {
          this.request.estadoSol = data.response;
          this.mensaje = MENSAJES.PRELIMINAR.OK_PRELIMINAR;
          this.openDialogMensaje(this.mensaje, null, null);
          this.estadoBotonDetalle(ESTADOPRELIMINAR.estadoAtendido);
          this.spinnerService.hide();
          this.getInfoScg();
        } else {
          this.mensaje = MENSAJES.ERROR_NOFUNCION;
          this.openDialogMensaje(this.mensaje, data.message, data.status);
          this.spinnerService.hide();
          this.estadoBotonGenerarSol = false;
        }
      }, error => {
        this.mensaje = MENSAJES.ERROR_SERVICIO;
        this.openDialogMensaje(this.mensaje, 'Error al actualizar Solicitud Preliminar', null);
        console.error(error);
        this.spinnerService.hide();
        this.estadoBotonGenerarSol = false;
      }
    );

  }

  // call modal MAC
  openDialogMAC($event: Event): void {
    $event.preventDefault();
    this.codMacFrmCtrl.markAsUntouched();
    this.descMacFrmCtrl.markAsUntouched();
    const dialogRef = this.dialog.open(BuscarMacComponent, {
      width: '500px',
      disableClose: true,
      data: {
        title: 'BÚSQUEDA MAC'
      }
    });

    dialogRef.afterClosed().subscribe((result: MACResponse) => {
      if (result != null) {
        this.codMacFrmCtrl.setValue(result.codigoLargo);
        this.descMacFrmCtrl.setValue(result.descripcion);
        this.codigoMac = result.codigo;
        this.estadoSolicEvaluacion();
        this.mostrarBtn = true;
        this.limpiarMACInscripcion();
      }
    });
  }

  public limpiarMACInscripcion(): void {
    this.descMacDigiFrmCtrl.setValue(null);
    this.nameFileFrmCtrl.setValue(null);
    this.descMacDigiFrmCtrl.disable();
    this.nameFileFrmCtrl.disable();
    this.bloqInscripcion = true;
  }

  public cleanFieldsMac($event: Event) {
    this.codMacFrmCtrl.setValue(null);
    this.descMacFrmCtrl.setValue(null);
    this.estadoBoton = false;
    this.mostrarBtn = false;
    this.descMacDigiFrmCtrl.enable();
    this.nameFileFrmCtrl.enable();
    this.bloqInscripcion = false;
  }

  public cargarArchivo(event) {// NO SIRVE POR QUE NO DEBE SUBIRSE EL ARCHIVO INMEDIATAMENTE
    this.fileupload = event.target.files[0];
    if (typeof event === 'undefined' || typeof this.fileupload === 'undefined' || typeof this.fileupload.name === 'undefined') {
      this.nameFileFrmCtrl.setValue(null);
    } else {
      if (this.fileupload.size > FILEFTP.tamanioMax) {
        this.mensaje = 'Validación del tamaño de archivo';
        this.openDialogMensaje(
          this.mensaje,
          'Solo se permiten archivos de 2MB como máximo',
          'Tamaño archivo: ' + parseFloat((this.fileupload.size / 1024 / 1024) + '').toFixed(2) + 'MB'
        );
        this.fileupload = null;
        return false;
      }
      const nombreArchivo =
        'INSCRIPCION-MAC-' + this.datePipe.transform(new Date(), 'yyyyMMddHHmmss') + '.' + this.fileupload.name.split('.').pop();
      this.nameFileFrmCtrl.setValue(nombreArchivo);
    }
  }

  public openInput(): void {
    document.getElementById('fileInput').click();
  }

  public validarEnvioCorreo(): boolean {
    // VALIDACIONES
    if (typeof this.fileupload === 'undefined' || this.fileupload === null) {
      this.mensaje = 'Falta adjunta el documento';
      this.openDialogMensaje(this.mensaje, null, null);
      return false;
    }

    if (this.descMacDigiFrmCtrl.invalid) {
      this.nombreMac = null;
      this.mensaje = 'Falta ingresar la descripción de la Mac.';
      this.openDialogMensaje(this.mensaje, null, null);
      return false;
    }

    return true;
  }

  public enviarSolicInscripMac() {
    this.spinnerService.show();
    const archivoRequest: ArchivoRequest = new ArchivoRequest();
    const nombreArchivo = this.fileupload.name;
    archivoRequest.nomArchivo = nombreArchivo;
    archivoRequest.archivo = this.fileupload;
    archivoRequest.ruta = FILEFTP.rutaPreliminar;

    const request = new UsrRolRequest();
    request.codRol = 1;
    request.codAplicacion = 1;

    this.usuarioService.listaUsuarioPorRol(request).subscribe(
      (resp: OncoWsResponse) => {
        if (resp.audiResponse.codigoRespuesta === '0') {
          this.listaUsuarios = resp.dataList;

          this.coreService.subirArchivo(archivoRequest).subscribe(
            (response: WsResponse) => {
              if (response.audiResponse.codigoRespuesta === '0') {
                const rutaDoc = response.data.codArchivo;
                this.nombreMac = this.descMacDigiFrmCtrl.value != null ? this.descMacDigiFrmCtrl.value : 'NO INGRESO';

                this.correoRequest = new EmailDTO();
                this.correoRequest.codPlantilla = EMAIL.PRELIMINAR.codigoPlantilla;
                this.correoRequest.fechaProgramada = this.datePipe.transform(new Date(), 'dd/MM/yyyy HH:mm:ss');
                this.correoRequest.flagAdjunto = EMAIL.PRELIMINAR.flagAdjunto;
                this.correoRequest.tipoEnvio = EMAIL.PRELIMINAR.tipoEnvio;
                this.correoRequest.usrApp = EMAIL.usrApp;

                this.correoService.generarCorreo(this.correoRequest).subscribe(
                  (responseGenerar: OncoWsResponse) => {
                    if (responseGenerar.audiResponse.codigoRespuesta === '0') {
                      let result = '';
                      const nombreUsuario =
                        (this.userService.getNombres != null ? this.userService.getNombres + ' ' : '') +
                        (this.userService.getApelPaterno != null ? this.userService.getApelPaterno + ' ' : '') +
                        (this.userService.getApelMaterno != null ? this.userService.getApelMaterno : '');
                      result += responseGenerar.dataList[0].cuerpo.toString()
                        .replace('{{medicoTratante}}', this.medicoFrmCtrl.value != null ? this.medicoFrmCtrl.value : '-----')
                        .replace('{{descripcionMac}}', this.nombreMac != null ? this.nombreMac : '-----')
                        .replace('{{nroSolCartaSolben}}', this.nroSCGSolFrmCtrl.value != null ? this.nroSCGSolFrmCtrl.value : '-----')
                        .replace('{{medicoAuditor}}', nombreUsuario);
                      this.listaUsuarios.forEach(usu => {
                        this.correoRequest.asunto = EMAIL.PRELIMINAR.asunto + this.nombreMac;
                        this.correoRequest.cuerpo = result;
                        this.correoRequest.codigoEnvio = responseGenerar.dataList[0].codigoEnvio;
                        this.correoRequest.destinatario = usu.correo;
                        this.correoRequest.ruta = rutaDoc;
                        this.correoRequest.codigoPlantilla = this.correoRequest.codPlantilla;
                        this.correoService.enviarCorreoGenerico(this.correoRequest).subscribe(
                          (responseEnvio: OncoWsResponse) => {
                          }, error => {
                            console.error('Error envio correo: ' + error);
                          });
                      });
                      this.cambiarEstadoAPendienteSolpre(MENSAJES.PRELIMINAR.EXITO_ENVIAR_CORREO);
                      // this.openDialogConfirmMensaje(MENSAJES.PRELIMINAR.EXITO_ENVIAR_CORREO, null, true, false, null);
                    } else {
                      this.spinnerService.hide();
                      this.openDialogMensaje(MENSAJES.PRELIMINAR.ERROR_ENVIAR_CORREO, 'Enviar correo', null);
                    }
                  }, error => {
                    console.error(error);
                    this.spinnerService.hide();
                    this.openDialogMensaje(MENSAJES.PRELIMINAR.ERROR_ENVIAR_CORREO, 'Enviar correo', null);
                  }
                );
              } else {
                this.spinnerService.hide();
                this.openDialogMensaje(MENSAJES.PRELIMINAR.ERROR_CARGA_ARCHIVO, 'Cargar Archivo FTP', null);
              }
            },
            error => {
              console.error(error);
              this.spinnerService.hide();
              this.openDialogMensaje(MENSAJES.PRELIMINAR.ERROR_CARGA_ARCHIVO, 'Cargar Archivo FTP', null);
            }
          );
        } else {
          this.spinnerService.hide();
          this.mensaje = 'No se pudo obtener los email de los Responsables de Inscripcion MAC';
          this.openDialogMensaje(this.mensaje, null, null);
        }
      }, error => {
        this.spinnerService.hide();
        console.error(error);
        this.mensaje = 'No se pudo obtener los email de los Responsables de Inscripcion MAC';
        this.openDialogMensaje(this.mensaje, null, null);
      });
  }

  public actualizarEstado() {
    this.macService.actualizarEstadoPreliminar(this.request).subscribe(
      (data) => {
        if (data.status === '0') {
          this.mensaje = data.message;
          this.openDialogMensaje(this.mensaje, null, null);
        } else if (data.status === '1') {
          this.mensaje = data.message;
          this.openDialogMensaje(this.mensaje, null, null);
          this.router.navigate(['./app/bandeja-preliminar']);
        }
      },
      error => {
        console.error(error);
        this.mensaje = MENSAJES.ERROR_SERVICIO;
        this.openDialogMensaje(this.mensaje, 'Enviar solicitud de inscripción', null);
        console.error(error);
      }
    );
  }

  public openDialogMensaje(
    message: string,
    message2: string,
    valor: any
  ): void {
    const dialogRef = this.dialog.open(MessageComponent, {
      width: '400px',
      disableClose: true,
      data: {
        title: MENSAJES.PRELIMINAR.DETALLE,
        message: message,
        message2: message2,
        alerta: true,
        confirmacion: false,
        valor: valor
      }
    });
    dialogRef.afterClosed().subscribe(result => {
    });
  }

  public openDialogConfirmMensaje(proceso: string): void {

    let mensaje: string,
      mensaje2: string,
      valor: any;

    switch (proceso) {
      case 'inscripcion':
        if (!this.validarEnvioCorreo()) { return; }
        mensaje = '¿Desea solicitar la inscripción de la MAC?';
        mensaje2 = null;
        valor = `MAC Solicitada: ${this.descMacDigiFrmCtrl.value}`;
        break;
      case 'atendido':
        if (!this.validarCambioEstado()) { return; }
        mensaje = '¿Confirmar que desea atender la Solicitud Preliminar del paciente?';
        mensaje2 = null;
        valor = `MAC Seleccionada: ${this.descMacFrmCtrl.value}`;
        break;
      case 'rechazado':
        if (!this.validarEstadoPendiente()) { return; }
        mensaje = '¿Confirma que desea rechazar la Solicitud Preliminar?';
        mensaje2 = null;
        valor = `Paciente: ${this.infoSolben.paciente}`;
        break;
    }

    const dialogRef = this.dialog.open(MessageComponent, {
      width: '400px',
      disableClose: true,
      data: {
        title: MENSAJES.PRELIMINAR.DETALLE,
        message: mensaje,
        message2: mensaje2,
        alerta: false,
        confirmacion: true,
        valor: valor
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        switch (proceso) {
          case 'inscripcion':
            this.enviarSolicInscripMac();
            break;
          case 'atendido':
            this.atendidoSolicPrel();
            break;
          case 'rechazado':
            this.rechazadoSolicPrel();
            break;
        }
      }
    });
  }

  public accesoOpcion() {
    const data = require('src/assets/data/permisosRecursos.json');
    const bandejaPreliminar = data.bandejaPremiliminar;
    this.opcionMenu = JSON.parse(localStorage.getItem('opcionMenu'));
    if (this.opcionMenu.opcion.length > 0) {
      this.opcionMenu.opcion.forEach(element => {
        const codOpcion = element.codOpcion;
        switch (codOpcion) {
          case bandejaPreliminar.btnBuscarMac:
            this.btnBuscarMac = Number(element.flagAsignacion);
            break;
          case bandejaPreliminar.txtCodigoMac:
            this.txtCodigoMac = Number(element.flagAsignacion);
            break;
          case bandejaPreliminar.txtDescripcionMac:
            this.txtDescripcionMac = Number(element.flagAsignacion);
            break;
          case bandejaPreliminar.btnBorrar:
            this.btnBorrar = Number(element.flagAsignacion);
            break;
          case bandejaPreliminar.txtDescricionMacReg:
            this.txtDescricionMacReg = Number(element.flagAsignacion);
            break;
          case bandejaPreliminar.txtArchivoSustento:
            this.txtArchivoSustento = Number(element.flagAsignacion);
            break;
          case bandejaPreliminar.btnInscripcionMac:
            this.btnInscripcionMac = Number(element.flagAsignacion);
            break;
          case bandejaPreliminar.btnRegresar:
            this.regresarPreliBtn = Number(element.flagAsignacion);
            break;
          case bandejaPreliminar.btnRechazarSolPre:
            this.rechazarPreliBtn = Number(element.flagAsignacion);
            break;
          case bandejaPreliminar.btnGenerarSolEva:
            this.generarSolPreBtn = Number(element.flagAsignacion);
            break;
        }
      });
    }
  }

  public cambiarEstadoAPendienteSolpre(msg: string) {
    this.request.estadoSolPre = ESTADOPRELIMINAR.estadoPendienteInscMac;
    this.request.codUsuario = Number(this.userService.getCodUsuario);

    this.detalleSolicitudPreliminarService.updateEstadoPendInscripcionMAC(this.request).subscribe(
      (data: ApiResponse) => {
        if (data.status === '0' && data.response !== null) {
          this.spinnerService.hide();
          this.openDialogMensaje(msg, MENSAJES.PRELIMINAR.OK_PRELIMINAR, null);
          this.getInfoScg();
        } else {
          this.spinnerService.hide();
          this.openDialogMensaje('Ocurrio un error al actualizar el estado de la solicitud', data.message, null);
          this.estadoBotonRechazarSol = true;
        }
      }, error => {
        this.spinnerService.hide();
        this.mensaje = MENSAJES.ERROR_SERVICIO;
        this.openDialogMensaje(this.mensaje, 'Error al actualizar Solicitud Preliminar', null);
        console.error(error);
      }
    );
  }
}

