import { Component, OnInit, ViewChild, forwardRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDialog, MatIconRegistry, MatPaginator, MatPaginatorIntl, MatSort, MatTableDataSource } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DomSanitizer } from '@angular/platform-browser';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { MY_FORMATS_AUNA } from 'src/app/common';
import { MessageComponent } from 'src/app/core/message/message.component';
import { MatPaginatorIntlEspanol } from 'src/app/directives/matpaginator-translate';
import { WsResponse } from 'src/app/dto/WsResponse';
import { ArchivoFTP } from 'src/app/dto/bandeja-preliminar/detalle-preliminar/ArchivoFTP';
import { GenerarReportesGeneralesMoniRequests } from 'src/app/dto/configuracion/GenerarReportesGeneralesMoniRequets';
import { generarReportesGeneralesAutRequest } from 'src/app/dto/configuracion/generarReportesGeneralesAutRequest';
import { Anho } from 'src/app/dto/reporte/Anho';
import { Meses } from 'src/app/dto/reporte/Meses';
import { EstadoReporte } from 'src/app/dto/response/Reportes-Indicadores/EstadoReporte';
import { ReportesGeneralesService } from 'src/app/service/Reportes/reportes-generales.service';
import { CoreService } from 'src/app/service/core.service';

export interface ReporteG {
  id: number;
  reportes: string;
  nombreFile: string;
}

const disableButton  = {
  'completed': false,
  'in progress': true,
  'pending': true,
  'download': false,
  'error': true
}

@Component({
  selector: 'app-reportes-generales',
  templateUrl: './reportes.generales.component.html',
  styleUrls: ['./reportes.generales.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE]
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: MY_FORMATS_AUNA
    },
    {
      provide: MatPaginatorIntl,
      useClass: forwardRef(() => MatPaginatorIntlEspanol)
    }
  ]
})
export class RepoGeneralesComponent implements OnInit {
  mensaje: String;
  verReportes: boolean;
  verReportesAut: boolean;
  isVerReportes: boolean;
  cmbMeses: Meses[];
  cmbAnhos: Anho[];
  fecha: String;
  year: Number;
  month: Number;

  reporteAutorizFrmGrp = new FormGroup({
    fechaInicioAutoriz: new FormControl(null, [Validators.required]),
    fechaFinAutoriz: new FormControl(null, [Validators.required])
  });

  reporteMonitFrmGrp = new FormGroup({
    fechaInicioMonit: new FormControl(null, [Validators.required]),
    fechaFinMonit: new FormControl(null, [Validators.required])
  });

  get fechaInicioAutoriz() { return this.reporteAutorizFrmGrp.get('fechaInicioAutoriz'); }
  get fechaFinAutoriz() { return this.reporteAutorizFrmGrp.get('fechaFinAutoriz'); }
  get fechaInicioMonit() { return this.reporteMonitFrmGrp.get('fechaInicioMonit'); }
  get fechaFinMonit() { return this.reporteMonitFrmGrp.get('fechaFinMonit'); }

  // TABLA INDICADORES
  dataSourceReporteG: MatTableDataSource<EstadoReporte>;
  dataSourceReporteAutorizador: MatTableDataSource<EstadoReporte>;
  displayColumnsReporteG = ['reportes', 'verExcel'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  reportes: EstadoReporte[] = [];
  reportesAutorizador: EstadoReporte[] = [];

  constructor(
    private adapter: DateAdapter<any>,
    private coreService: CoreService,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private repoGeneralesService: ReportesGeneralesService,
    private dialog: MatDialog,
    private spinnerService: Ng4LoadingSpinnerService
  ) {
    this.adapter.setLocale('es-PE');
    // this.reportes = require('src/assets/data/reportes/reportesGenerales.json');
    // this.reportesAutorizador = require('src/assets/data/reportes/reporteSolicitudAutorizador.json');
    this.dataSourceReporteG = new MatTableDataSource(this.reportes);
    this.dataSourceReporteAutorizador = new MatTableDataSource(this.reportesAutorizador);
  }

  ngOnInit() {
    this.inicializarVariables();
    this.verReportes = true;
    this.verReportesAut = true;
    this.fecha = '';
    this.iconRegistry.addSvgIcon(
      'excel-icon',
      this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/icon-excel-2.svg')
    );

    this.iconRegistry.addSvgIcon(
      'reload-icon',
      this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/reload.svg')
    );

    this.iconRegistry.addSvgIcon(
      'activity-log',
      this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/activitylog.svg')
    );

    // Ejecución de servicio
    this.repoGeneralesService.verificarEstadoArchivo().subscribe({
      next: (response: WsResponse)=>{
        response.data.map((reporte:EstadoReporte) => {
          if(reporte !== null){
            
            if(reporte.type == 'autorizaciones'){
              this.reportesAutorizador.push({...reporte, id:1})
              this.dataSourceReporteAutorizador = new MatTableDataSource(this.reportesAutorizador);
              this.verReportesAut = disableButton[reporte.status]
            }
            if(reporte.type == 'monitoreo'){
              this.reportes.push({...reporte, id:2})
              this.dataSourceReporteG = new MatTableDataSource(this.reportes);
              this.verReportes = disableButton[reporte.status]
            }
          }
        })
      },
    })
  }

  public inicializarVariables(): void {
    this.cmbMeses = require('src/assets/data/constantes/meses.json');
    this.cmbAnhos = require('src/assets/data/constantes/anios.json');
    this.dataSourceReporteG.paginator = this.paginator;
    this.dataSourceReporteG.sort = this.sort;
  }

  /*public mostrarFechaTabla(): void {
    let monthName: string;
    this.year = this.anhosPreFrmCtrl.value;
    this.month = this.mesesPreFrmCtrl.value;
    this.cmbMeses.forEach((elemnt: Meses) => {
      if (elemnt.IdMes === this.month) {
        monthName = elemnt.Mes;
        return;
      }
    });

    let mes = (this.month == null || this.month === undefined) ? '' : monthName;
    let anio = (this.year == null || this.year === undefined) ? '' : this.year + '';
    this.fecha = ' - ' + mes + ' ' + anio;
  }

  public validarFormulario(): boolean {
    if (this.reporteAutorizFrmGrp.invalid) {
      this.anhosPreFrmCtrl.markAsTouched();
      this.mesesPreFrmCtrl.markAsTouched();
      this.openDialogMensaje(MENSAJES.ERROR_CAMPOS, null, true, false, null);
      return false;
    }

    let anioActual: number = new Date().getFullYear();
    let mesActual: number = new Date().getMonth() + 1;
    if (anioActual === this.anhosPreFrmCtrl.value && mesActual < this.mesesPreFrmCtrl.value) {
      this.mensaje = 'El Mes seleccionado es mayor al actual.';
      this.mesesPreFrmCtrl.setValue(null);
      this.mesesPreFrmCtrl.markAsTouched();
      this.openDialogMensaje(MENSAJES.ERROR_CAMPOS, this.mensaje, true, false, null);
      return false;
    }

    return true;
  }*/

  public visualizarReportesPreCargados(): void {
    let reporteRequest = new GenerarReportesGeneralesMoniRequests();
    // reporteRequest.ano = null;
    // reporteRequest.mes = null;
    // reporteRequest.tipo = null;
    reporteRequest.fecIni = this.fechaInicioMonit.value;
    reporteRequest.fecFin = this.fechaFinMonit.value;

    

    this.repoGeneralesService.generarReportesGeneralesMoni(reporteRequest).subscribe((resp) => {
      
      
      if(resp.audiResponse.codigoRespuesta === "0"){
        this.verReportes = false;
        this.mensaje = 'Se genero el filtro exitosamente.';
        this.openDialogMensajeMoni(this.mensaje, null, true, false, null);
        this.spinnerService.hide();
        const date = new Date();
        const fechaCreacion = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
        this.reportes = [{fechaFin: `${this.reporteAutorizFrmGrp.get('fechaInicioMonit').value}`, fechaIni: `${this.reporteAutorizFrmGrp.get('fechaFinMonit').value}`,type:"autorizaciones" ,fechaCreacion: fechaCreacion, status: "pending", id:2}];
        this.dataSourceReporteG = new MatTableDataSource(this.reportes);
      }else if(resp.audiResponse.codigoRespuesta === "1"){
            this.verReportes = false;
            this.mensaje = "Reporte de monitoreo - Generando";
            this.openDialogMensajeMoni(this.mensaje, null, true, false, null);
            this.spinnerService.hide();
          }
    }, (err) => {
      //this.isVerReportes = true;
      
    })
  }

  public generarReportesGeneralesAut(reporte: ReporteG): void {
    let reporteRequest = new generarReportesGeneralesAutRequest();
    reporteRequest.fecIni = this.fechaInicioAutoriz.value;
    reporteRequest.fecFin = this.fechaFinAutoriz.value;
    //reporteRequest.ano = this.anhosPreFrmCtrl.value;
    //reporteRequest.mes = this.mesesPreFrmCtrl.value;
    

    this.spinnerService.show();
    this.repoGeneralesService.generarReportesGeneralesAut(reporteRequest)
      .subscribe(
        (response) => {
          
          if(response.audiResponse.codigoRespuesta === "0"){
            this.verReportesAut = false;
            this.mensaje = response.audiResponse.mensajeRespuesta;
            this.openDialogMensajeAuto(this.mensaje, null, true, false, null);
            this.spinnerService.hide();
            const date = new Date();
            const fechaCreacion = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
            this.reportesAutorizador = [{status: "pending", type: "autorizaciones", fechaIni:`${this.reporteAutorizFrmGrp.get('fechaInicioAutoriz').value() || ""}`, fechaFin: `${this.reporteAutorizFrmGrp.get('fechaFinAutoriz').value || ""}`, fechaCreacion: fechaCreacion}]
            this.dataSourceReporteAutorizador = new MatTableDataSource(this.reportesAutorizador);
          }
          else if(response.audiResponse.codigoRespuesta === "1"){
            this.verReportesAut = false;
            this.mensaje = response.audiResponse.mensajeRespuesta;
            this.openDialogMensajeAuto(this.mensaje, null, true, false, null);
            this.spinnerService.hide();
          }else{
            this.spinnerService.hide();
          }
        },
        error => {
          console.error(error);
          this.mensaje = 'Error en el filtro ' + reporte.reportes;
          this.openDialogMensaje(this.mensaje, null, true, false, null);
          this.spinnerService.hide();
        }
      );
  }


  public crearLinkDescarga(blob: Blob, file: ArchivoFTP): void {
    const link = document.createElement('a');
    link.target = '_blank';
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', file.nomArchivo);
    link.click();
  }

  public verReporteGeneral(reporte: ReporteG): void {
    switch (reporte.id) {
      case 1:
        this.generarReporteSolicitudAutorizaciones(reporte);
        break;
      case 2:
        this.generarReporteMonitoreo(reporte);
        break;
      default:
        break;
    }
  }

  public generarReporteSolicitudAutorizaciones(reporte: ReporteG): void {
    let reporteRequest = new generarReportesGeneralesAutRequest();
    reporteRequest.fecIni = this.fechaInicioAutoriz.value;
    reporteRequest.fecFin = this.fechaFinAutoriz.value;
    //reporteRequest.ano = this.anhosPreFrmCtrl.value;
    //reporteRequest.mes = this.mesesPreFrmCtrl.value;
    

    this.spinnerService.show();
    this.repoGeneralesService.generarReporteSolicitudAutorizaciones(reporteRequest)
      .subscribe(
        (blob: Blob) => {
          const blobUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = 'reporteAutorizaciones.xlsx'; // Nombre del archivo
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(blobUrl);
          this.spinnerService.hide();
      },
        error => {
          console.error(error);
          this.mensaje = 'Error al obtener el reporte de ' + reporte.reportes;
          this.openDialogMensaje(this.mensaje, null, true, false, null);
          this.spinnerService.hide();
        }
      );
  }

  public generarReporteMonitoreo(reporte: ReporteG): void {
    let reporteRequest = new GenerarReportesGeneralesMoniRequests();
    reporteRequest.fecIni = this.fechaInicioMonit.value;
    reporteRequest.fecFin = this.fechaFinMonit.value;
    //reporteRequest.ano = this.anhosPreFrmCtrl.value;
    //reporteRequest.mes = this.mesesPreFrmCtrl.value;

    this.spinnerService.show();
    this.repoGeneralesService.generarReporteMonitoreo(reporteRequest)
      .subscribe(
        (blob: Blob) => {
          const blobUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = 'reporteMonitoreo.xlsx'; // Nombre del archivo
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(blobUrl);
          this.spinnerService.hide();
      },
        error => {
          console.error(error);
          this.mensaje = 'Error al obtener el reporte de ' + reporte.reportes;
          this.openDialogMensaje(this.mensaje, null, true, false, null);
          this.spinnerService.hide();
        }
      );
  }

 

  // POP-UP MENSAJES
  public openDialogMensaje(
    message: String,
    message2: String,
    alerta: boolean,
    confirmacion: boolean,
    valor: any): void {
    const dialogRef = this.dialog.open(MessageComponent, {
      disableClose: true,
      width: '400px',
      data: {
        title: 'REPORTES DE CONSUMO',
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor
      }
    });
    dialogRef.afterClosed().subscribe(rspta => {
    });
  }

  public openDialogMensajeAuto(
    message: String,
    message2: String,
    alerta: boolean,
    confirmacion: boolean,
    valor: any): void {
    const dialogRef = this.dialog.open(MessageComponent, {
      disableClose: true,
      width: '400px',
      data: {
        title: 'REPORTES DE SOLICITUDES DE AUTORIZACIONES',
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor
      }
    });
    dialogRef.afterClosed().subscribe(rspta => {
    });
  }

  public openDialogMensajeMoni(
    message: String,
    message2: String,
    alerta: boolean,
    confirmacion: boolean,
    valor: any): void {
    const dialogRef = this.dialog.open(MessageComponent, {
      disableClose: true,
      width: '400px',
      data: {
        title: 'REPORTES GENERAL DE MONITOREO',
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor
      }
    });
    dialogRef.afterClosed().subscribe(rspta => {
    });
  }

  public reloadAuthorizationsReport(){
    this.spinnerService.show()
    this.repoGeneralesService.verificarEstadoArchivo().subscribe({
      next: (response: WsResponse)=>{
        try {
          const status = {
          'completed': false,
          'in progress': true,
          'pending': true,
          'download': false,
          'error': false
        }
        response.data.map((reporte:EstadoReporte) => {
          if(reporte !== null){
            if(reporte.type == 'autorizaciones'){
              this.reportesAutorizador.push({...reporte, id:1})
              this.dataSourceReporteAutorizador = new MatTableDataSource([{...reporte, id:1}]);
              this.verReportesAut = status[reporte.status]
            }
          }
        })
        this.spinnerService.hide()
        } catch (error) {
          this.spinnerService.hide()
        }
      },
      error: (error) => {
          console.error(error);
          this.mensaje = 'Error al obtener el progreso del reporte de autorizaciones';
          this.openDialogMensaje(this.mensaje, null, true, false, null);
          this.spinnerService.hide();
        }
    })
  }

   public reloadMonitoringReport(){
    this.spinnerService.show()
    this.repoGeneralesService.verificarEstadoArchivo().subscribe({
      next: (response: WsResponse)=>{
        try {
          response.data.map((reporte:EstadoReporte) => {
          if(reporte !== null){
            if(reporte.type == 'monitoreo'){
              this.reportes.push({...reporte, id:2})
              this.dataSourceReporteG = new MatTableDataSource([{...reporte, id:2}]);
              this.verReportes = disableButton[reporte.status]
            }
          }
        })
        this.spinnerService.hide()
        } catch (error) {
          this.spinnerService.hide()
        }
      },
      error: error => {
          console.error(error);
          this.mensaje = 'Error al obtener el progreso del reporte de monitoreo';
          this.openDialogMensaje(this.mensaje, null, true, false, null);
          this.spinnerService.hide();
        }
    })
  }

  

  public downloadLogAuthorizationActivities(){
    this.repoGeneralesService.downloadLogAuthorizationActivities()
      .subscribe(
        (blob: Blob) => {
          const blobUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = 'activity log autorizaciones.txt'; // Nombre del archivo
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(blobUrl);
          this.spinnerService.hide();
      },
        error => {
          console.error(error);
          this.mensaje = 'Error al obtener las actividades del reporte de autorizaciones';
          this.openDialogMensaje(this.mensaje, null, true, false, null);
          this.spinnerService.hide();
        }
      );
  }

  public downloadLogMonitoringActivities(){
    this.repoGeneralesService.downloadLogMonitoringActivities()
      .subscribe(
        (blob: Blob) => {
          const blobUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = 'activity log monitoreo.txt'; // Nombre del archivo
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(blobUrl);
          this.spinnerService.hide();
      },
        error => {
          console.error(error);
          this.mensaje = 'Error al obtener las actividades del reporte de monitoreo';
          this.openDialogMensaje(this.mensaje, null, true, false, null);
          this.spinnerService.hide();
        }
      );
  }
}
