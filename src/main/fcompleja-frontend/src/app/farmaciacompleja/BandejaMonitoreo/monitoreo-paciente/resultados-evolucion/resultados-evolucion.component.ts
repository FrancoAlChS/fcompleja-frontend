import { Component, OnInit, forwardRef, Inject } from '@angular/core';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MatPaginatorIntl,
  MAT_DATE_LOCALE,
  MatDialogRef,
  MatDialog,
  MAT_DIALOG_DATA
} from '@angular/material';
import { MatPaginatorIntlEspanol } from 'src/app/directives/matpaginator-translate';
import { MY_FORMATS_AUNA, ACCESO_MONITOREO } from 'src/app/common';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { ListaParametroservice } from 'src/app/service/lista.parametro.service';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { MessageComponent } from 'src/app/core/message/message.component';
import { DatePipe } from '@angular/common';
import { ParametroRequest } from 'src/app/dto/ParametroRequest';
import { WsResponse } from 'src/app/dto/WsResponse';
import { Parametro } from 'src/app/dto/Parametro';
import { LineaTratamiento } from 'src/app/dto/solicitudEvaluacion/bandeja/LineaTratamiento';
import { date } from 'ngx-custom-validators/src/app/date/validator';
import { EvolucionResponse } from 'src/app/dto/response/BandejaMonitoreo/EvolucionResponse';
import { EvolucionRequest } from 'src/app/dto/request/BandejaMonitoreo/EvolucionRequest';
import { BandejaMonitoreoService } from 'src/app/service/BandejaMonitoreo/bandeja.monitoreo.service';
import { UsuarioService } from 'src/app/dto/service/usuario.service';
import { MonitoreoResponse } from 'src/app/dto/response/BandejaMonitoreo/MonitoreoResponse';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { BOpcionMenuLocalStorage } from 'src/app/dto/core/BOpcionMenuLocalStorage';

export interface DataDialog {
  title: string;
  monitoreo: MonitoreoResponse,
  lineaTratamiento: LineaTratamiento,
  evolucion: EvolucionResponse
}

@Component({
  selector: 'app-resultados-evolucion',
  templateUrl: './resultados-evolucion.component.html',
  styleUrls: ['./resultados-evolucion.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS_AUNA },
    { provide: MatPaginatorIntl, useClass: forwardRef(() => MatPaginatorIntlEspanol) }
  ]
})
export class ResultadosEvolucionComponent implements OnInit {
  evolucionFrmGrp: FormGroup = new FormGroup({
    descMACFrmCtrl: new FormControl(null),
    resEvolFrmCtrl: new FormControl(null, [Validators.required]),
    lineaTrataFrmCtrl: new FormControl(null),
    fecMonitFrmCtrl: new FormControl(null),
    nroEvolucionFrmCtrl: new FormControl(null),
    fecProxMonFormControl: new FormControl(null),
    motivoInactFrmCtrl: new FormControl(null),
    fecInactFormControl: new FormControl(null),
    observFormControl: new FormControl(null)
  });
  get descMACFrmCtrl() { return this.evolucionFrmGrp.get('descMACFrmCtrl'); }
  get resEvolFrmCtrl() { return this.evolucionFrmGrp.get('resEvolFrmCtrl'); }
  get lineaTrataFrmCtrl() { return this.evolucionFrmGrp.get('lineaTrataFrmCtrl'); }
  get fecMonitFrmCtrl() { return this.evolucionFrmGrp.get('fecMonitFrmCtrl'); }
  get nroEvolucionFrmCtrl() { return this.evolucionFrmGrp.get('nroEvolucionFrmCtrl'); }
  get fecProxMonFormControl() { return this.evolucionFrmGrp.get('fecProxMonFormControl'); }
  get motivoInactFrmCtrl() { return this.evolucionFrmGrp.get('motivoInactFrmCtrl'); }
  get fecInactFormControl() { return this.evolucionFrmGrp.get('fecInactFormControl'); }
  get observFormControl() { return this.evolucionFrmGrp.get('observFormControl'); }
  cmbResEvolucion: any[];
  cmbMotInactivacion: any[];
  evolucionRequest: EvolucionRequest;
  minDate: Date;

  opcionMenu: BOpcionMenuLocalStorage;
  valorMostrarOpcion = ACCESO_MONITOREO.mostrarOpcion;

  txtMedicamento: number;
  cbResultadoEvolucion: number;
  txtLineaTratamiento: number;
  txtFechaMonitoreo: number;
  txtNroEvolucion: number;
  txtFechaProxMonitoreo: number;
  cbMotivoInactivacion: number;
  txtFechaInactivacion: number;
  txtComentarios: number;
  btnGrabar: number;
  btnSalir: number;

  constructor(public dialog: MatDialog,
    public dialogRef: MatDialogRef<ResultadosEvolucionComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DataDialog,
    private parametroService: ListaParametroservice,
    private datePipe: DatePipe,
    private bandejaMonitoreoService: BandejaMonitoreoService,
    private spinnerService: Ng4LoadingSpinnerService,
    @Inject(UsuarioService) private userService: UsuarioService) { }

  ngOnInit() {
    this.cargarComboResEvolucion();
    this.cargarComboMotInactivacion();
    this.inicializarVariables();
    this.accesoOpcionMenu();
  }

  public inicializarVariables(): void {
    this.cargarFechaProxMonitoreo();//PONER FECHA PROGRAMADA MONITOREO
    this.fecProxMonFormControl.disable();
    this.descMACFrmCtrl.setValue(this.data.monitoreo.nomMedicamento);
    this.lineaTrataFrmCtrl.setValue('L' + this.data.lineaTratamiento.lineaTratamiento);
    this.fecMonitFrmCtrl.setValue(this.datePipe.transform(new Date(), 'dd/MM/yyyy'));
    // this.nroEvolucionFrmCtrl.setValue(this.data.evolucion.nroDescEvolucion);
    this.motivoInactFrmCtrl.disable();
    this.fecInactFormControl.setValue(new Date());
    this.fecInactFormControl.disable();

    this.minDate = new Date();
  }

  public cargarFechaProxMonitoreo() {
    let request = new ParametroRequest();
    request.codigoParametro = '241';
    this.parametroService.consultarParametro(request).subscribe(
      (data: WsResponse) => {
        if (data.audiResponse.codigoRespuesta === '0') {
          let fecProxMonitoreo = new Date();
          fecProxMonitoreo.setDate(fecProxMonitoreo.getDate() + parseInt(data.data[0].valor1Parametro));
          this.fecProxMonFormControl.setValue(fecProxMonitoreo);
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
          this.cmbResEvolucion = data.data;
          this.cmbResEvolucion.unshift({ "codigoParametro": "", "nombreParametro": "SELECCIONE" });
        } else {
          console.error(data);
        }
        //SETEAR VALOR POR DEFECTO
        this.resEvolFrmCtrl.setValue('');
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
        this.motivoInactFrmCtrl.setValue('');
      },
      error => {
        console.error('Error al listar parametros');
      }
    );
  }

  public regResultadoEvolucion(): void {
    // const request = new EvolucionRequest();
    // request.codSolEvaluacion = this.data.codSolEvaluacion;
    // this.bandejaMonitoreoService.listarEvoluciones(request).subscribe(
    //   (data: WsResponse) => {
    //     if (data.audiResponse.codigoRespuesta === '0') {
    //       this.data = data.data;
    //     } else {
    //       console.error('RESPUESTA LISTA EVOLUCIONES:' + data.audiResponse.mensajeRespuesta);
    //     }

    //   },
    //   error => {
    //     console.error('Error al listar monitoreo');
    //   }
    // );
    if (this.evolucionFrmGrp.invalid) {
      this.fecProxMonFormControl.markAsTouched();
      this.resEvolFrmCtrl.markAsTouched();
      this.motivoInactFrmCtrl.markAsTouched();
      this.fecInactFormControl.markAsUntouched();
    } else {
      this.spinnerService.show();
      this.evolucionRequest = new EvolucionRequest();
      this.evolucionRequest.codEvolucion = this.data.evolucion.codEvolucion;
      this.evolucionRequest.codMonitoreo = this.data.monitoreo.codigoMonitoreo;
      this.evolucionRequest.pResEvolucion = this.resEvolFrmCtrl.value;
      this.evolucionRequest.fecMonitoreo = new Date();
      this.evolucionRequest.pEstadoMonitoreo = 119;
      if (this.evolucionRequest.pResEvolucion === 225) {
        //225 ACTIVO
        this.evolucionRequest.codSolEvaluacion = this.data.monitoreo.codSolEvaluacion;
        this.evolucionRequest.descCodSolEvaluacion = this.data.monitoreo.codigoEvaluacion;
        this.evolucionRequest.fecProxMonitoreo = this.fecProxMonFormControl.value;
        this.evolucionRequest.observacion = this.observFormControl.value;
      } else {
        //INACTIVO
        this.evolucionRequest.pMotivoInactivacion = this.motivoInactFrmCtrl.value;
        this.evolucionRequest.fecInactivacion = this.fecInactFormControl.value;
        this.evolucionRequest.observacion = this.observFormControl.value;
      }
      this.evolucionRequest.usuarioModif = this.userService.getCodUsuario + '';
      this.evolucionRequest.estado = 1;

      this.bandejaMonitoreoService.regResultadoEvolucion(this.evolucionRequest).subscribe(
        (data: WsResponse) => {
          if (data.audiResponse.codigoRespuesta === '0') {
            this.spinnerService.hide();
            this.dialogRef.close(data.data);
          } else {
            this.spinnerService.hide();
            console.error('ERROR:' + data.audiResponse.mensajeRespuesta);
          }
        },
        error => {
          this.spinnerService.hide();
          console.error('Error registro resultado evolucion');
        }
      );
    }
  }

  public cambResultEvolucion(val: any): void {
    if (val === 225) {
      this.fecProxMonFormControl.enable();
      this.fecProxMonFormControl.setValidators([Validators.required]);
      this.fecProxMonFormControl.updateValueAndValidity();
      this.motivoInactFrmCtrl.disable();
      this.fecInactFormControl.disable();
    } else {
      if (val === 226) {
        this.motivoInactFrmCtrl.enable();
        this.fecInactFormControl.enable();
        this.motivoInactFrmCtrl.setValidators([Validators.required]);
        this.fecInactFormControl.setValidators([Validators.required]);
        this.motivoInactFrmCtrl.updateValueAndValidity();
        this.fecInactFormControl.updateValueAndValidity();
        this.fecProxMonFormControl.disable();
      } else {
        this.motivoInactFrmCtrl.disable();
        this.fecInactFormControl.disable();
        this.fecProxMonFormControl.disable();
      }

    }
  }

  public onClose(): void {
    this.dialogRef.close(null);
  }

  public accesoOpcionMenu() {
    const data = require('src/assets/data/permisosRecursos.json');
    const regResultadoEvolucion = data.bandejaMonitoreo.regResultadoEvolucion;
    this.opcionMenu = JSON.parse(localStorage.getItem('opcionMenu'));

    if (this.opcionMenu.opcion.length > 0) {
      this.opcionMenu.opcion.forEach(element => {
        const codOpcion = element.codOpcion;
        switch (codOpcion) {
          case regResultadoEvolucion.txtMedicamento:
            this.txtMedicamento = Number(element.flagAsignacion);
            break;
          case regResultadoEvolucion.cbResultadoEvolucion:
            this.cbResultadoEvolucion = Number(element.flagAsignacion);
            break;
          case regResultadoEvolucion.txtLineaTratamiento:
            this.txtLineaTratamiento = Number(element.flagAsignacion);
            break;
          case regResultadoEvolucion.txtFechaMonitoreo:
            this.txtFechaMonitoreo = Number(element.flagAsignacion);
            break;
          case regResultadoEvolucion.txtNroEvolucion:
            this.txtNroEvolucion = Number(element.flagAsignacion);
            break;
          case regResultadoEvolucion.txtFechaProxMonitoreo:
            this.txtFechaProxMonitoreo = Number(element.flagAsignacion);
            break;
          case regResultadoEvolucion.cbMotivoInactivacion:
            this.cbMotivoInactivacion = Number(element.flagAsignacion);
            break;
          case regResultadoEvolucion.txtFechaInactivacion:
            this.txtFechaInactivacion = Number(element.flagAsignacion);
            break;
          case regResultadoEvolucion.txtComentarios:
            this.txtComentarios = Number(element.flagAsignacion);
            break;
          case regResultadoEvolucion.btnGrabar:
            this.btnGrabar = Number(element.flagAsignacion);
            break;
          case regResultadoEvolucion.btnSalir:
            this.btnSalir = Number(element.flagAsignacion);
            break;
        }
      });
    }
  }

}
