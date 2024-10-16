import { Component, forwardRef, ViewChild, OnInit } from '@angular/core';
import {
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
  MatPaginatorIntl,
  MatTableDataSource,
  MatPaginator,
  MatSort,
  MatIconRegistry,
  MatDialog
} from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_FORMATS_AUNA, MENSAJES } from 'src/app/common';
import { MatPaginatorIntlEspanol } from 'src/app/directives/matpaginator-translate';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { Meses } from 'src/app/dto/reporte/Meses';
import { Anho } from 'src/app/dto/reporte/Anho';
import { ReporteIndicadoresRequest } from 'src/app/dto/configuracion/ReporteIndicadoresRequest';
import { CoreService } from 'src/app/service/core.service';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ReportesIndicadoresService } from 'src/app/service/Reportes/reportes-indicadores.service';
import { WsResponse } from 'src/app/dto/WsResponse';
import { MessageComponent } from 'src/app/core/message/message.component';
import { ArchivoFTP } from 'src/app/dto/bandeja-preliminar/detalle-preliminar/ArchivoFTP';

export interface Indicadores {
  id: number;
  reportes: string;
  nombreFile: string;
}

@Component({
  selector: 'app-indicador-proceso',
  templateUrl: './indicador-proceso.component.html',
  styleUrls: ['./indicador-proceso.component.scss'],
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
export class IndicadorProcesoComponent implements OnInit {
  mensaje: String;
  generarReport: Boolean;
  verReportes: boolean;
  cmbMeses: Meses[];
  cmbAnhos: Anho[];
  fecha: String;
  year: Number;
  month: Number;

  reporteFrmGrp = new FormGroup({
    mesesPreFrmCtrl: new FormControl(null, [Validators.required]),
    anhosPreFrmCtrl: new FormControl(null, [Validators.required])
  });

  get mesesPreFrmCtrl() { return this.reporteFrmGrp.get('mesesPreFrmCtrl'); }
  get anhosPreFrmCtrl() { return this.reporteFrmGrp.get('anhosPreFrmCtrl'); }

  reporteFrmGrpMensaje = {
    'mesesPreFrmCtrl': [{ type: 'required', message: 'Indicar el Mes' }],
    'anhosPreFrmCtrl': [{ type: 'required', message: 'Indicar el Año' }]
  };

  // TABLA INDICADORES
  dataSourceIndicadores: MatTableDataSource<Indicadores>;
  displayColumnsIndicadores = ['reportes', 'verExcel'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  indicadores: Indicadores[];

  constructor(
    private adapter: DateAdapter<any>,
    private coreService: CoreService,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private repoIndicadorService: ReportesIndicadoresService,
    private dialog: MatDialog,
    private spinnerService: Ng4LoadingSpinnerService
  ) {
    this.adapter.setLocale('es-PE');
    this.indicadores = require('src/assets/data/reportes/indicador-proceso.json');
    this.dataSourceIndicadores = new MatTableDataSource(this.indicadores);
  }

  ngOnInit() {
    this.inicializarVariables();
    this.generarReport = false;
    this.verReportes = false;
    this.iconRegistry.addSvgIcon(
      'excel-icon',
      this.sanitizer.bypassSecurityTrustResourceUrl('./assets/img/icon-excel-2.svg')
    );
  }

  public inicializarVariables(): void {
    this.cmbMeses = require('src/assets/data/constantes/meses.json');
    this.cmbAnhos = require('src/assets/data/constantes/anios.json');
    this.dataSourceIndicadores.paginator = this.paginator;
    this.dataSourceIndicadores.sort = this.sort;
  }

  public mostrarFechaIndicador(): void {
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
    if (this.reporteFrmGrp.invalid) {
      this.anhosPreFrmCtrl.markAsTouched();
      this.mesesPreFrmCtrl.markAsTouched();
      this.openDialogMensaje(MENSAJES.ERROR_CAMPOS, null, true, false, null);
      return false;
    }

    let anioActual: number = new Date().getFullYear();
    let mesActual: number = new Date().getMonth() + 1;
    if (anioActual === this.anhosPreFrmCtrl.value && mesActual <= this.mesesPreFrmCtrl.value) {
      this.mensaje = 'La generación de los indicadores es para meses ya finalizados.';
      this.mesesPreFrmCtrl.setValue(null);
      this.mesesPreFrmCtrl.markAsTouched();
      this.openDialogMensaje(MENSAJES.ERROR_CAMPOS, this.mensaje, true, false, null);
      return false;
    }

    return true;
  }

  public visualizarReportesPreCargados(): void {
    if (this.validarFormulario()) {
      let reporteRequest = new ReporteIndicadoresRequest();
      reporteRequest.ano = this.anhosPreFrmCtrl.value;
      reporteRequest.mes = this.mesesPreFrmCtrl.value;
      this.spinnerService.show();
      this.repoIndicadorService.generarIndicador(reporteRequest).subscribe(
        (response: WsResponse) => {
          if (response.audiResponse.codigoRespuesta === '0') {
            this.openDialogMensaje(response.audiResponse.mensajeRespuesta, null, true, false, null);
            this.verReportes = true;
            this.spinnerService.hide();
          } else {
            this.mensaje = response.audiResponse.mensajeRespuesta;
            this.openDialogMensaje(MENSAJES.ERROR_NOFUNCION, this.mensaje, true, false, null);
            this.spinnerService.hide();
          }
        }, (error) => {
          console.error(error);
          this.mensaje = 'Error en para visualizar los indicadores';
          this.openDialogMensaje(MENSAJES.ERROR_SERVICIO, this.mensaje, true, false, null);
          this.spinnerService.hide();
        }
      );
    }
  }

  public crearLinkDescarga(blob: Blob, file: ArchivoFTP): void {
    const link = document.createElement('a');
    link.target = '_blank';
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', file.nomArchivo);
    link.click();
  }

  public verReporteIndicador(indicador: Indicadores): void {
    switch (indicador.id) {
      case 1:
        this.descargarIndicadorExcel(indicador);
        break;
      default:
        break;
    }
  }

  public descargarIndicadorExcel(indicador: Indicadores): void {
    let reporteRequest = new ReporteIndicadoresRequest();
    reporteRequest.ano = this.anhosPreFrmCtrl.value;
    reporteRequest.mes = this.mesesPreFrmCtrl.value;

    this.spinnerService.show();
    this.repoIndicadorService.descargarIndicadorExcel(reporteRequest)
      .subscribe(
        (response: WsResponse) => {
          if (response.audiResponse.codigoRespuesta === '0') {
            let file: ArchivoFTP = new ArchivoFTP();
            file.archivo = response.data;
            file.contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            file.nomArchivo = `${indicador.nombreFile}_${(this.fecha.replace(/ - /gi, '').replace(/ /gi, '_'))}`;
            this.crearLinkDescarga(this.coreService.crearBlobFile(file), file);
            this.spinnerService.hide();
          } else {
            this.mensaje = response.audiResponse.mensajeRespuesta;
            this.openDialogMensaje(this.mensaje, null, true, false, null);
            this.spinnerService.hide();
          }
        },
        error => {
          console.error(error);
          this.mensaje = 'Error al obtener el reporte de ' + indicador.reportes;
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
}
