import { Component, OnInit, ViewChild, forwardRef } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatIconRegistry, MatPaginatorIntl } from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_FORMATS_AUNA, MENSAJES } from 'src/app/common';
import { Meses } from 'src/app/dto/reporte/Meses';
import { Anho } from 'src/app/dto/reporte/Anho';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { WsResponse } from 'src/app/dto/WsResponse';
import { ReporteIndicadoresRequest } from 'src/app/dto/configuracion/ReporteIndicadoresRequest';
import { MatDialog } from '@angular/material';
import { MessageComponent } from 'src/app/core/message/message.component';
import { MatPaginatorIntlEspanol } from 'src/app/directives/matpaginator-translate';
import { CoreService } from 'src/app/service/core.service';
import { ArchivoFTP } from 'src/app/dto/bandeja-preliminar/detalle-preliminar/ArchivoFTP';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ReporteConsumoService } from 'src/app/service/Reportes/reporte-consumo.service';
import { ReporteAntecTrat } from 'src/app/dto/configuracion/ReporteAntecTrat';

export interface ReporteC {
  reportes: string;
  id: number;
  nombreFile: string;
}

@Component({
  selector: 'app-reportes-consumo',
  templateUrl: './reportes.consumo.component.html',
  styleUrls: ['./reportes.consumo.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: MY_FORMATS_AUNA,
    }
  ],
})
export class RepoConsumoComponent implements OnInit {
  mensaje: String;
  generarReport: Boolean;
  verReportes: boolean;
  cmbMeses: Meses[];
  cmbAnhos: Anho[];
  fecha: String;
  year: Number;
  month: Number;

  reporteFrmGrp: FormGroup = new FormGroup({
    mesesPreFrmCtrl: new FormControl(null, Validators.required),
    anhosPreFrmCtrl: new FormControl(null, Validators.required)
  });

  reporteFrmGrpMensaje = {
    'mesesPreFrmCtrl': [{ type: 'required', message: 'Indicar el Mes' }],
    'anhosPreFrmCtrl': [{ type: 'required', message: 'Indicar el Año' }]
  };

  get anhosPreFrmCtrl() { return this.reporteFrmGrp.get('anhosPreFrmCtrl'); }
  get mesesPreFrmCtrl() { return this.reporteFrmGrp.get('mesesPreFrmCtrl'); }

  // TABLA INDICADORES
  dataSourceReporteC: MatTableDataSource<ReporteC>;
  displayColumnsReporteC = ['reportes', 'verExcel'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  reportes: ReporteC[];

  constructor(
    private coreService: CoreService,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private repoConsumoService: ReporteConsumoService,
    private dialog: MatDialog,
    private spinnerService: Ng4LoadingSpinnerService
  ) {
    this.reportes = require('src/assets/data/reportes/reporteConsumo.json');
    this.dataSourceReporteC = new MatTableDataSource(this.reportes);
  }

  ngOnInit() {
    this.inicializarVariables();
    this.verReportes = true;
    this.fecha = '';
    this.iconRegistry.addSvgIcon(
      'excel-icon',
      this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/icon-excel-2.svg')
    );
  }

  inicializarVariables() {
    this.cmbMeses = require('src/assets/data/constantes/meses.json');
    this.cmbAnhos = require('src/assets/data/constantes/anios.json');
    this.dataSourceReporteC.paginator = this.paginator;
    this.dataSourceReporteC.sort = this.sort;
  }

  mostrarAnioMes() {
    let monthName: string;
    this.verReportes = true;
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
    if (this.reporteFrmGrp.invalid) {
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
  }

  public visualizarReportesPreCargados(): void {
    if (this.validarFormulario()) {
      this.openDialogMensaje('Listo!. Haga clic en los iconos de Excel para visualizar los reportes', null, true, false, null);
      this.verReportes = false;
    }
  }

  public verReporteAntecTrat(): void {
    let request = new ReporteAntecTrat();
    request.fechaDel = new Date("01/01/2021")
    request.fechaAl =  new Date("01/30/2021")
    this.spinnerService.show();
    this.repoConsumoService.generarReporteAntecTrat(request)
      .subscribe(
        (data) => {
          
          const elem = window.document.createElement('a');
          elem.id = 'planillasId1';
          elem.href = window.URL.createObjectURL(data);
          elem.download = `prueba.xlsx`;
          // elem.download = 'indicadores.xlsx';
          document.body.appendChild(elem);
          
          elem.click();
          this.spinnerService.hide();
        },
        error => {
          console.error(error);
          this.spinnerService.hide();
        }
      );

  }

  public verReporteIndicador(reporte: ReporteC): void {
    switch (reporte.id) {
      case 1:
        this.generarReporteConsumoPorMac(reporte);
        break;
      case 2:
        this.generarReporteConsumoPorGrpDiagMac(reporte);
        break;
      case 3:
        this.generarReporteConsumoPorGrpDiagMacLT(reporte);
        break;
      case 4:
        this.generarReporteConsumoPorGrpDiagMacLTTUso(reporte);
        break;
      default:
        break;
    }
  }

  public generarReporteConsumoPorMac(reporte: ReporteC): void {
    let request = new ReporteIndicadoresRequest();
    request.ano = this.reporteFrmGrp.get('anhosPreFrmCtrl').value;
    request.mes = this.reporteFrmGrp.get('mesesPreFrmCtrl').value;
    this.spinnerService.show();
    this.repoConsumoService.generarReporteConsumoPorMac(request)
      .subscribe(
        (data) => {
          
          const elem = window.document.createElement('a');
          elem.id = 'planillasId1';
          elem.href = window.URL.createObjectURL(data);
          elem.download = `${reporte.nombreFile}_${(this.fecha.replace(/ - /gi, '').replace(/ /gi, '_'))}.xlsx`;
          // elem.download = 'indicadores.xlsx';
          document.body.appendChild(elem);
          elem.click();
          this.spinnerService.hide();
        },
        /*(response: WsResponse) => {
          
          if (response.audiResponse.codigoRespuesta === '0') {
            let file: ArchivoFTP = new ArchivoFTP();
            file.archivo = response.data;
            file.contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            file.nomArchivo = `${reporte.nombreFile}_${(this.fecha.replace(/ - /gi, '').replace(/ /gi, '_'))}`;
            this.crearLinkDescarga(this.coreService.crearBlobFile(file), file);
          } else {
            this.mensaje = response.audiResponse.mensajeRespuesta;
            this.openDialogMensaje(this.mensaje, null, true, false, null);
            this.spinnerService.hide();
          }
        },*/
        error => {
          console.error(error);
          this.mensaje = 'Error al obtener el reporte de ' + reporte.reportes;
          this.openDialogMensaje(this.mensaje, null, true, false, null);
          this.spinnerService.hide();
        }
      );
  }

  public generarReporteConsumoPorGrpDiagMac(reporte: ReporteC): void {
    let request = new ReporteIndicadoresRequest();
    request.ano = this.reporteFrmGrp.get('anhosPreFrmCtrl').value;
    request.mes = this.reporteFrmGrp.get('mesesPreFrmCtrl').value;
    this.spinnerService.show();
    this.repoConsumoService.generarReporteConsumoPorGrpDiagMac(request)
      .subscribe(
        (data) => {
          const elem = window.document.createElement('a');
          elem.id = 'planillasId1';
          elem.href = window.URL.createObjectURL(data);
          elem.download = `${reporte.nombreFile}_${(this.fecha.replace(/ - /gi, '').replace(/ /gi, '_'))}.xlsx`;
          // elem.download = 'indicadores.xlsx';
          document.body.appendChild(elem);
          elem.click();
          this.spinnerService.hide();
        },
        /*(response: WsResponse) => {
          if (response.audiResponse.codigoRespuesta === '0') {
            let file: ArchivoFTP = new ArchivoFTP();
            file.archivo = response.data;
            file.contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            file.nomArchivo = `${reporte.nombreFile}_${(this.fecha.replace(/ - /gi, '').replace(/ /gi, '_'))}`;
            this.crearLinkDescarga(this.coreService.crearBlobFile(file), file);
            this.spinnerService.hide();
          } else {
            this.mensaje = response.audiResponse.mensajeRespuesta;
            this.openDialogMensaje(this.mensaje, null, true, false, null);
            this.spinnerService.hide();
          }
        },*/
        error => {
          console.error(error);
          this.mensaje = 'Error al obtener el reporte de ' + reporte.reportes;
          this.openDialogMensaje(this.mensaje, null, true, false, null);
          this.spinnerService.hide();
        }
      );
  }

  public generarReporteConsumoPorGrpDiagMacLT(reporte: ReporteC): void {
    let request = new ReporteIndicadoresRequest();
    request.ano = this.reporteFrmGrp.get('anhosPreFrmCtrl').value;
    request.mes = this.reporteFrmGrp.get('mesesPreFrmCtrl').value;
    this.spinnerService.show();
    this.repoConsumoService.generarReporteConsumoPorGrpDiagMacLT(request)
      .subscribe(
        (data) => {
          const elem = window.document.createElement('a');
          elem.id = 'planillasId1';
          elem.href = window.URL.createObjectURL(data);
          elem.download = `${reporte.nombreFile}_${(this.fecha.replace(/ - /gi, '').replace(/ /gi, '_'))}.xlsx`;
          // elem.download = 'indicadores.xlsx';
          document.body.appendChild(elem);
          elem.click();
          this.spinnerService.hide();
        },
        /*(response: WsResponse) => {
          if (response.audiResponse.codigoRespuesta === '0') {
            let file: ArchivoFTP = new ArchivoFTP();
            file.archivo = response.data;
            file.contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            file.nomArchivo = `${reporte.nombreFile}_${(this.fecha.replace(/ - /gi, '').replace(/ /gi, '_'))}`;
            this.crearLinkDescarga(this.coreService.crearBlobFile(file), file);
            this.spinnerService.hide();
          } else {
            this.mensaje = response.audiResponse.mensajeRespuesta;
            this.openDialogMensaje(this.mensaje, null, true, false, null);
            this.spinnerService.hide();
          }
        },*/
        error => {
          console.error(error);
          this.mensaje = 'Error al obtener el reporte de ' + reporte.reportes;
          this.openDialogMensaje(this.mensaje, null, true, false, null);
          this.spinnerService.hide();
        }
      );
  }

  public generarReporteConsumoPorGrpDiagMacLTTUso(reporte: ReporteC): void {
    let request = new ReporteIndicadoresRequest();
    request.ano = this.reporteFrmGrp.get('anhosPreFrmCtrl').value;
    request.mes = this.reporteFrmGrp.get('mesesPreFrmCtrl').value;
    this.spinnerService.show();
    this.repoConsumoService.generarReporteConsumoPorGrpDiagMacLTTUso(request)
      .subscribe(
        (data) => {
          const elem = window.document.createElement('a');
          elem.id = 'planillasId1';
          elem.href = window.URL.createObjectURL(data);
          elem.download = `${reporte.nombreFile}_${(this.fecha.replace(/ - /gi, '').replace(/ /gi, '_'))}.xlsx`;
          // elem.download = 'indicadores.xlsx';
          document.body.appendChild(elem);
          elem.click();
          this.spinnerService.hide();
        },
        /*(response: WsResponse) => {
          if (response.audiResponse.codigoRespuesta === '0') {
            let file: ArchivoFTP = new ArchivoFTP();
            file.archivo = response.data;
            file.contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            file.nomArchivo = `${reporte.nombreFile}_${(this.fecha.replace(/ - /gi, '').replace(/ /gi, '_'))}`;
            this.crearLinkDescarga(this.coreService.crearBlobFile(file), file);
            this.spinnerService.hide();
          } else {
            this.mensaje = response.audiResponse.mensajeRespuesta;
            this.openDialogMensaje(this.mensaje, null, true, false, null);
            this.spinnerService.hide();
          }
        },*/
        error => {
          console.error(error);
          this.mensaje = 'Error al obtener el reporte de ' + reporte.reportes;
          this.openDialogMensaje(this.mensaje, null, true, false, null);
          this.spinnerService.hide();
        }
      );
  }

  public crearLinkDescarga(blob: Blob, file: ArchivoFTP): void {
    this.spinnerService.show();
    const link = document.createElement('a');
    link.target = '_blank';
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', file.nomArchivo);
    link.click();
    this.spinnerService.hide();
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

}
