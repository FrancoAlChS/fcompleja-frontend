import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatDialog,
  MatIconRegistry,
  MatPaginator,
  MatSort,
  MatTableDataSource
} from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { DomSanitizer } from '@angular/platform-browser';
import { MENSAJES, MY_FORMATS_AUNA } from 'src/app/common';
import { MessageComponent } from 'src/app/core/message/message.component';
import { ReportePacienteRequest } from 'src/app/dto/configuracion/ReportePacienteRequest';
import { Paciente } from 'src/app/dto/Paciente';
import { CoreService } from 'src/app/service/core.service';

import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ArchivoFTP } from 'src/app/dto/bandeja-preliminar/detalle-preliminar/ArchivoFTP';
import { EstadoReporte } from 'src/app/dto/response/Reportes-Indicadores/EstadoReporte';
import { WsResponse } from 'src/app/dto/WsResponse';
import { BuscarPacienteComponent } from 'src/app/modal/buscar-paciente/buscar-paciente.component';
import { ReporteConsumoService } from 'src/app/service/Reportes/reporte-consumo.service';
import { ReportesGeneralesService } from 'src/app/service/Reportes/reportes-generales.service';
import { ReporteC } from '../reportes-consumo/reportes.consumo.component';


const disableButton  = {
  'completed': false,
  'in progress': true,
  'pending': true,
  'download': false,
  'error': true
}

@Component({
  selector: 'app-reportes-paciente',
  templateUrl: './reportes-paciente.component.html',
  styleUrls: ['./reportes-paciente.component.scss'],
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
  ],
})
export class ReportesPacienteComponent implements OnInit {
  isGenerarReporte: boolean;
  mensaje: String;

  tipoDoc: string;
  numDoc: string;
  nombre1: string;
  nombre2: string;
  apePaterno: string;
  apeMaterno: string;

  reporteFrmGrp: FormGroup = new FormGroup({
    pacienteFrmCtrl: new FormControl(null),
    codPacienteFrmCtrl: new FormControl(null),
    fechaRegistroFrmCtrl: new FormControl(null),
    fechaRegistroAlFrmCtrl: new FormControl(null),
  });

  get pacienteFrmCtrl() {
    return this.reporteFrmGrp.get('pacienteFrmCtrl');
  }
  get codPacienteFrmCtrl() {
    return this.reporteFrmGrp.get('codPacienteFrmCtrl');
  }
  get fechaRegistroFrmCtrl() {
    return this.reporteFrmGrp.get('fechaRegistroFrmCtrl');
  }
  get fechaRegistroAlFrmCtrl() {
    return this.reporteFrmGrp.get('fechaRegistroAlFrmCtrl');
  }

  dataSourceReporteC: MatTableDataSource<EstadoReporte>;
  displayColumnsReporteC = ['reportes', 'verExcel'];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  reportes: EstadoReporte[] = [];
  verReportes: boolean;

  constructor(
    private coreService: CoreService,
    public dialog: MatDialog,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private repoGeneralesService: ReportesGeneralesService,
    private repoConsumoService: ReporteConsumoService,
    private spinnerService: Ng4LoadingSpinnerService
  ) {
    this.dataSourceReporteC = new MatTableDataSource(this.reportes);
  }

  ngOnInit() {
    this.verReportes = true;
    this.isGenerarReporte = true;
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

    this.repoGeneralesService.verificarEstadoArchivo().subscribe({
      next: (response: WsResponse)=>{
        response.data.map((reporte:EstadoReporte) => {
          if(reporte !== null){
            if(reporte.type == 'pacientes'){
              this.reportes.push({...reporte, id:1})
              this.dataSourceReporteC = new MatTableDataSource(this.reportes);
              this.verReportes = disableButton[reporte.status]
            }
          }
        })
      },
    })
    
  }

  public abrirBuscarPaciente(): void {
    const dialogRef = this.dialog.open(BuscarPacienteComponent, {
      width: '640px',
      disableClose: true,
    });
    dialogRef.afterClosed().subscribe((result: Paciente) => {
      if (result !== null) {
        const nombre2 = result.nombr2 != null ? ` ${result.nombr2}` : '';
        const nombreCom = `${result.apepat} ${result.apemat}, ${result.nombr1} ${nombre2}`;
        this.pacienteFrmCtrl.setValue(nombreCom);
        // this.listEvaRequest.codigoPaciente = null;
        // this.codigoAfiliado = result.codafir;
        this.tipoDoc = result.tipdoc;
        this.numDoc = result.numdoc + '';
        this.nombre1 = result.nombr1;
        this.nombre2 = result.nombr2;
        this.apePaterno = result.apepat;
        this.apeMaterno = result.apemat;
        this.isGenerarReporte = false;
        // this.BusquedaEvaluacion();
      } else {
        this.pacienteFrmCtrl.setValue(null);
        this.isGenerarReporte = true;
        // this.codigoAfiliado = null;
        // this.listEvaRequest.codigoPaciente = null;
      }
    });
  }

  cambiarEstadoCodPaciente(value) {
    if (value != null) {
      this.isGenerarReporte = false;
    }
  }

  public validarFormulario(): boolean {
    // if (this.reporteFrmGrp.invalid) {
    //   this.anhosPreFrmCtrl.markAsTouched();
    //   this.mesesPreFrmCtrl.markAsTouched();
    //   this.openDialogMensaje(MENSAJES.ERROR_CAMPOS, null, true, false, null);
    //   return false;
    // }
    if (
      this.fechaRegistroFrmCtrl.value != null &&
      this.fechaRegistroAlFrmCtrl.value == null
    ) {
      this.mensaje = 'Agregar Fecha Correspondiente.';
      this.fechaRegistroAlFrmCtrl.setValue(null);
      this.fechaRegistroFrmCtrl.setValue(null);
      //this.mesesPreFrmCtrl.markAsTouched();
      this.openDialogMensaje(
        MENSAJES.ERROR_CAMPOS,
        this.mensaje,
        true,
        false,
        null
      );
      return false;
    }

    if (
      this.fechaRegistroFrmCtrl.value == null &&
      this.fechaRegistroAlFrmCtrl.value != null
    ) {
      this.mensaje = 'Agregar Fecha Correspondiente.';
      this.fechaRegistroAlFrmCtrl.setValue(null);
      this.fechaRegistroFrmCtrl.setValue(null);
      //this.mesesPreFrmCtrl.markAsTouched();
      this.openDialogMensaje(
        MENSAJES.ERROR_CAMPOS,
        this.mensaje,
        true,
        false,
        null
      );
      return false;
    }

    if (
      this.fechaRegistroFrmCtrl.value != null &&
      this.fechaRegistroAlFrmCtrl.value != null &&
      new Date(this.fechaRegistroFrmCtrl.value) >
        new Date(this.fechaRegistroAlFrmCtrl.value)
    ) {
      this.mensaje = 'La Fecha de inicio no debe ser mayor.';
      this.fechaRegistroAlFrmCtrl.setValue(null);
      this.fechaRegistroFrmCtrl.setValue(null);
      //this.mesesPreFrmCtrl.markAsTouched();
      this.openDialogMensaje(
        MENSAJES.ERROR_CAMPOS,
        this.mensaje,
        true,
        false,
        null
      );
      return false;
    }

    if (
      this.pacienteFrmCtrl.value == null &&
      this.codPacienteFrmCtrl.value == null &&
      this.fechaRegistroFrmCtrl.value == null &&
      this.fechaRegistroAlFrmCtrl.value == null
    ) {
      this.mensaje = 'los cambios estan vacios';
      //this.mesesPreFrmCtrl.markAsTouched();
      this.openDialogMensaje(
        MENSAJES.ERROR_CAMPOS,
        this.mensaje,
        true,
        false,
        null
      );
      return false;
    }

    // if(new Date(this.fechaRegistroFrmCtrl.value) > new Date(this.fechaRegistroAlFrmCtrl.value)){
    //   this.mensaje = 'La Fecha de inicio no debe ser mayor';
    //     this.fechaRegistroAlFrmCtrl.setValue(null);
    //     //this.mesesPreFrmCtrl.markAsTouched();
    //     this.openDialogMensaje(MENSAJES.ERROR_CAMPOS, this.mensaje, true, false, null);
    //     return false;
    // }

    return true;
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
      width: '400px',
      data: {
        title: 'REPORTES DE PACIENTE',
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((rspta) => {});
  }

  public verReporteIndicador(reporte: ReporteC): void {
    switch (reporte.id) {
      case 1:
        this.generarReporteAntecedentesTratamientos(reporte);
        break;
      default:
        break;
    }
  }

  visualizarCamposPre() {
    if (this.validarFormulario()) {
      this.openDialogMensaje(
        'Listo!. Haga clic en los iconos de Excel para visualizar los reportes',
        null,
        true,
        false,
        null
      );
      this.verReportes = false;
    }
  }

  public crearLinkDescarga(blob: Blob, file: ArchivoFTP): void {
    const link = document.createElement('a');
    link.target = '_blank';
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', file.nomArchivo);
    link.click();
  }

  generarReporteAntecedentesTratamientos(reporte: ReporteC) {
    let request = new ReportePacienteRequest();
    request.codigoPaciente = this.codPacienteFrmCtrl.value
      ? this.codPacienteFrmCtrl.value
      : null;
    request.fecFin = this.fechaRegistroFrmCtrl.value
      ? this.fechaRegistroFrmCtrl.value
      : null;
    request.fecIni = this.fechaRegistroAlFrmCtrl.value
      ? this.fechaRegistroAlFrmCtrl.value
      : null;
    request.tipoDoc = this.tipoDoc ? this.tipoDoc : null;
    request.numDoc = this.numDoc ? this.numDoc : null;
    request.nombre1 = this.nombre1 ? this.nombre1 : null;
    request.nombre2 = this.nombre2 ? this.nombre2 : null;
    request.apePaterno = this.apePaterno ? this.apePaterno : null;
    request.apeMaterno = this.apeMaterno ? this.apeMaterno : null;
    this.spinnerService.show();
    this.repoConsumoService.generarReportePaciente(request).subscribe(
      (response) => {
        // let file: ArchivoFTP = new ArchivoFTP();
        // file.archivo = data.data;
        // file.contentType = 'application/vnd.ms-excel';
        // file.nomArchivo = `Reporte-Paciente.xlsx`;
        // this.crearLinkDescarga(this.coreService.crearBlobFile(file), file);
        this.openDialogMensaje(
          response.audiResponse.mensajeRespuesta,
          null,
          true,
          false,
          null
        );

          const date = new Date();
          const fechaCreacion = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

        this.reportes = [{status: "pending", type: "pacientes", fechaIni:`${this.reporteFrmGrp.get('fechaInicioAutoriz') || ""}`, fechaFin: `${this.reporteFrmGrp.get('fechaFinAutoriz') || ""}`, fechaCreacion: fechaCreacion}]
        this.dataSourceReporteC = new MatTableDataSource(this.reportes);
        this.verReportes = false;
        this.spinnerService.hide();
      },
      (error) => {
        console.error(error);
        this.mensaje = 'Error al obtener el reporte de ' + reporte.reportes;
        this.openDialogMensaje(this.mensaje, null, true, false, null);
        this.spinnerService.hide();
      }
    );
  }

  descargarReporte(){
    this.repoConsumoService.descargarReportePacientes()
      .subscribe(
        (blob: Blob) => {
          const blobUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = 'archivo_descargado.xlsx'; // Nombre del archivo
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(blobUrl);
          this.spinnerService.hide();
      },
        error => {
          console.error(error);
          this.mensaje = 'Error al obtener el reporte de pacientes' ;
          this.openDialogMensaje(this.mensaje, null, true, false, null);
          this.spinnerService.hide();
        }
      );
  }

  public limpiarControl($event: Event, tipo: string, codigo: string) {
    //this.bandejaEvaFrmGrp.get(tipo).setValue(null);
    this.pacienteFrmCtrl.setValue(null);
    this.tipoDoc = null;
    this.numDoc = null;
    this.nombre1 = null;
    this.nombre2 = null;
    this.apePaterno = null;
    this.apeMaterno = null;
  }

  public validarFechaFinal() {
    const dateInicio = this.fechaRegistroFrmCtrl.value;
    const dateFin = this.fechaRegistroAlFrmCtrl.value;
    if (dateInicio != null && dateFin != null) {
      this.isGenerarReporte = false;
    }
  }

  public reloadPatientReport(){
    this.spinnerService.show()
     this.repoGeneralesService.verificarEstadoArchivo().subscribe({
      next: (response: WsResponse)=>{
        try {
          response.data.map((reporte:EstadoReporte) => {
          if(reporte !== null){
            if(reporte.type == 'pacientes'){
              this.reportes.push({...reporte})
              this.dataSourceReporteC = new MatTableDataSource([{...reporte}]);
              this.verReportes = disableButton[reporte.status]
            }
          }
        })
        this.spinnerService.hide()
        } catch (error) {
          this.spinnerService.hide()
        }
      },
    })
  }

  public downloadPatientActivityLog() {
    this.repoConsumoService.downloadPatientActivityLog()
      .subscribe(
        (blob: Blob) => {
          const blobUrl = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = 'actividades reporte pacientes.txt'; // Nombre del archivo
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(blobUrl);
          this.spinnerService.hide();
      },
        error => {
          console.error(error);
          this.mensaje = 'Error al obtener el reporte de pacientes' ;
          this.openDialogMensaje(this.mensaje, null, true, false, null);
          this.spinnerService.hide();
        }
      );
  }
}
