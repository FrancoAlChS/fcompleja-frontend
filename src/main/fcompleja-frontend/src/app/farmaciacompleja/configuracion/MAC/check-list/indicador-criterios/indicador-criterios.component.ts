import { Component, OnInit, forwardRef, Inject, ViewChild } from '@angular/core';
import { ParametroRequest } from 'src/app/dto/ParametroRequest';
import { GRUPO_PARAMETRO, MY_FORMATS_AUNA, CONFIGURACION, MENSAJES } from 'src/app/common';
import { ListaParametroservice } from 'src/app/service/lista.parametro.service';
import { ParametroResponse } from 'src/app/dto/ParametroResponse';
import { MACResponse } from 'src/app/dto/configuracion/MACResponse';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatPaginatorIntl,
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatTableDataSource,
  MatSort,
  MatPaginator
} from '@angular/material';
import { MatPaginatorIntlEspanol } from 'src/app/directives/matpaginator-translate';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { Parametro } from 'src/app/dto/Parametro';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MessageComponent } from 'src/app/core/message/message.component';
import { CheckListDTO } from 'src/app/dto/configuracion/CheckListDTO';
import { CriteriosComponent } from './criterios/criterios.component';
import { ConfiguracionService } from 'src/app/service/configuracion.service';
import { WsResponse } from 'src/app/dto/WsResponse';
import { WsResponseOnco } from 'src/app/dto/WsResponseOnco';
import { CriteriosDTO } from 'src/app/dto/configuracion/CriteriosDTO';

export interface IndicadorDialog {
  title: string;
  mac: MACResponse;
  indicador: CheckListDTO;
  grpDiagnostico: number;
  tipo: number;
  codigo: string;
}

@Component({
  selector: 'app-indicador-criterios',
  templateUrl: './indicador-criterios.component.html',
  styleUrls: ['./indicador-criterios.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS_AUNA },
    { provide: MatPaginatorIntl, useClass: forwardRef(() => MatPaginatorIntlEspanol) }
  ]
})
export class IndicadorCriteriosComponent implements OnInit {

  mensaje: string;
  request: CheckListDTO;

  modificado: boolean;

  indicadoresFrmGrp: FormGroup;

  // Tabla
  dataSourceIN: MatTableDataSource<CriteriosDTO>;
  listaCriteriosIN: CriteriosDTO[];
  isLoadingIN: boolean;
  displayedColumnsIN: string[];
  @ViewChild(MatSort) sortIN: MatSort;
  @ViewChild(MatPaginator) paginatorIN: MatPaginator;
  columnsGrillaIN = [{
    columnDef: 'codCriterioLargo',
    header: 'CÓDIGO',
    cell: (criterioIN: CriteriosDTO) => `${criterioIN.codCriterioLargo}`
  }, {
    columnDef: 'descripcion',
    header: 'CRITERIOS DE INCLUSIÓN',
    cell: (criterioIN: CriteriosDTO) => `${criterioIN.descripcion}`
  }, {
    columnDef: 'estado',
    header: 'ESTADO',
    cell: (criterioIN: CriteriosDTO) => `${criterioIN.estado}`
  }];

  dataSourceEX: MatTableDataSource<CriteriosDTO>;
  listaCriteriosEX: CriteriosDTO[];
  isLoadingEX: boolean;
  displayedColumnsEX: string[];
  @ViewChild(MatSort) sortEX: MatSort;
  @ViewChild(MatPaginator) paginatorEX: MatPaginator;
  columnsGrillaEX = [{
    columnDef: 'codCriterioLargo',
    header: 'CÓDIGO',
    cell: (criterioEX: CriteriosDTO) => `${criterioEX.codCriterioLargo}`
  }, {
    columnDef: 'descripcion',
    header: 'CRITERIOS DE EXCLUSIÓN',
    cell: (criterioEX: CriteriosDTO) => `${criterioEX.descripcion}`
  }, {
    columnDef: 'estado',
    header: 'ESTADO',
    cell: (criterioEX: CriteriosDTO) => `${criterioEX.estado}`
  }];

  nuevo: boolean;

  paramRequest: ParametroRequest;
  cmbEstadoIndicador: Parametro[];

  constructor(public dialog: MatDialog,
    public dialogRef: MatDialogRef<IndicadorCriteriosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IndicadorDialog,
    private parametroService: ListaParametroservice,
    private confService: ConfiguracionService) {
    }

  ngOnInit() {
    this.indicadoresFrmGrp = new FormGroup({
      codigoFrmCtrl: new FormControl(this.data.codigo),
      estadoFrmCtrl: new FormControl(null, [Validators.required]),
      descripcionFrmCtrl: new FormControl(null, [Validators.required])
    });

    this.inicializarVariables();
    this.crearTablaCriterios();
  }

  get codigoFrmCtrl() { return this.indicadoresFrmGrp.get('codigoFrmCtrl'); }
  get estadoFrmCtrl() { return this.indicadoresFrmGrp.get('estadoFrmCtrl'); }
  get descripcionFrmCtrl() { return this.indicadoresFrmGrp.get('descripcionFrmCtrl'); }

  public inicializarVariables(): void {
    this.paramRequest = new ParametroRequest();
    this.cmbEstadoIndicador = [];
    this.listaCriteriosIN = [];
    this.listaCriteriosEX = [];
    this.dataSourceIN = null;
    this.dataSourceEX = null;
    this.isLoadingIN = false;
    this.isLoadingEX = false;

    if (this.data.tipo === 1) {
      this.obtenerListaEstadoIndicador(false);
      this.nuevo = true;
    } else {
      this.nuevo = false;
      this.actualizarIndicador();
    }
  }

  public actualizarIndicador(): void {
    this.request = new CheckListDTO();
    this.request.codChkListIndi = this.data.indicador.codChkListIndi;
    this.request.codGrpDiag = this.data.indicador.codGrpDiag;
    this.request.codMac = this.data.indicador.codMac;
    this.listarCriterioInclusion();
    this.listarCriterioExclusion();
    this.obtenerListaEstadoIndicador(true);
    this.codigoFrmCtrl.setValue(this.data.indicador.codChkListIndi);
    this.descripcionFrmCtrl.setValue(this.data.indicador.descripcion);
  }

  public crearTablaCriterios(): void {
    this.displayedColumnsIN = [];
    this.displayedColumnsEX = [];

    this.columnsGrillaIN.forEach(column => {
      this.displayedColumnsIN.push(column.columnDef);
    });

    this.columnsGrillaEX.forEach(column => {
      this.displayedColumnsEX.push(column.columnDef);
    });

    this.displayedColumnsIN.push('editarIN');
    this.displayedColumnsEX.push('editarEX');
  }

  public listarCriterioInclusion(): void {
    this.listaCriteriosIN = [];
    this.dataSourceIN = null;
    this.isLoadingIN = true;
    this.confService.listarCriterioInclusion(this.request).subscribe(
      (response: WsResponseOnco) => {
        if (response.audiResponse.codigoRespuesta === '0') {
          this.listaCriteriosIN = (response.dataList !== null) ? response.dataList : [];
          this.cargarTablaCriteriosIN();
        } else {
          this.openDialogMensaje(response.audiResponse.mensajeRespuesta, null, true, false, null);
        }
        this.isLoadingIN = false;
      }, (error) => {
        this.mensaje = 'Error al obtener la lista de Criterios de Inclusión.';
        this.openDialogMensaje(MENSAJES.ERROR_SERVICIO, this.mensaje, true, false, null);
        console.error(this.mensaje);
        this.isLoadingIN = false;
      });
  }

  public cargarTablaCriteriosIN(): void {
    if (this.listaCriteriosIN.length > 0) {
      this.dataSourceIN = new MatTableDataSource(this.listaCriteriosIN);
      this.dataSourceIN.sort = this.sortIN;
      this.dataSourceIN.paginator = this.paginatorIN;
    }
  }

  public listarCriterioExclusion(): void {
    this.listaCriteriosEX = [];
    this.dataSourceEX = null;
    this.isLoadingEX = true;
    this.confService.listarCriterioExclusion(this.request).subscribe(
      (response: WsResponseOnco) => {
        if (response.audiResponse.codigoRespuesta === '0') {
          this.listaCriteriosEX = (response.dataList !== null) ? response.dataList : [];
          this.cargarTablaCriteriosEX();
        } else {
          this.openDialogMensaje(response.audiResponse.mensajeRespuesta, null, true, false, null);
        }
        this.isLoadingEX = false;
      }, (error) => {
        this.mensaje = 'Error al obtener la lista de Criterios de Exclusión.';
        this.openDialogMensaje(MENSAJES.ERROR_SERVICIO, this.mensaje, true, false, null);
        console.error(this.mensaje);
        this.isLoadingEX = false;
      });
  }

  public cargarTablaCriteriosEX(): void {
    if (this.listaCriteriosEX.length > 0) {
      this.dataSourceEX = new MatTableDataSource(this.listaCriteriosEX);
      this.dataSourceEX.sort = this.sortEX;
      this.dataSourceEX.paginator = this.paginatorEX;
    }
  }

  public obtenerListaEstadoIndicador(editar: boolean): void {
    this.paramRequest.codigoGrupo = `${GRUPO_PARAMETRO.estadoMac}`;
    this.parametroService.listaParametro(this.paramRequest).subscribe(
      (data: ParametroResponse) => {
        this.cmbEstadoIndicador = (data.filtroParametro !== null) ? data.filtroParametro : null;
        this.cmbEstadoIndicador.unshift({
          codigoParametro: null,
          nombreParametro: '-- Seleccione el Estado del Indicador --',
          valor1Parametro: '',
          codigoExterno: null
        });
        if (editar) {
          this.estadoFrmCtrl.setValue(Number(this.data.indicador.estado));
        } else {
          this.estadoFrmCtrl.setValue(CONFIGURACION.macVigencia);
        }
      },
      error => {
        console.error('Error al listar el Tipo de SCG SOLBEN');
      }
    );
  }

  public validarForm(): boolean {
    if (this.indicadoresFrmGrp.invalid) {
      this.descripcionFrmCtrl.markAsTouched();
      this.estadoFrmCtrl.markAsTouched();
      this.mensaje = MENSAJES.ERROR_CAMPOS;
      return false;
    }

    return true;
  }

  public agregarCriterioIN($event: Event): void {
    if (this.validarForm()) {
      if (this.codigoFrmCtrl.value === null || this.codigoFrmCtrl.value === '') {
        this.mensaje = 'Falta grabar la indicación para agregar criterios de inclusión.';
        this.openDialogMensaje(this.mensaje, 'Código indicador no ha sido generado.', true, false, null);
        return;
      }

      this.guardarValorRequest();

      const dialogRef = this.dialog.open(CriteriosComponent, {
        width: '600px',
        disableClose: true,
        data: {
          title: MENSAJES.CONF.CRITERIOS_INCLUSION,
          indicador: this.data.indicador,
          tipo: 1,
          criterioIN: null,
          criterioEX: null,
          codigo: (this.dataSourceIN)?(this.dataSourceIN.data.length + 1).toString().padStart(2, '0'):'01'
        }
      });

      dialogRef.afterClosed().subscribe((result: CriteriosDTO) => {
        this.listarCriterioInclusion();
      });
    } else {
      this.openDialogMensaje(this.mensaje, null, true, false, null);
    }
  }

  public agregarCriterioEX($event: Event): void {
    if (this.validarForm()) {

      if (this.codigoFrmCtrl.value === null || this.codigoFrmCtrl.value === '') {
        this.mensaje = 'Falta grabar la indicación para agregar criterios de exclusión.';
        this.openDialogMensaje(this.mensaje, 'Código indicador no ha sido generado.', true, false, null);
        return;
      }

      this.guardarValorRequest();

      const dialogRef = this.dialog.open(CriteriosComponent, {
        width: '600px',
        disableClose: true,
        data: {
          title: MENSAJES.CONF.CRITERIOS_EXCLUSION,
          indicador: this.request,
          tipo: 2,
          criterioIN: null,
          criterioEX: null
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result !== null) {
          this.listarCriterioExclusion();
        }
      });
    } else {
      this.openDialogMensaje(this.mensaje, null, true, false, null);
    }
  }

  public verEditarIN(row: CriteriosDTO) {
    this.guardarValorRequest();
    const dialogRef = this.dialog.open(CriteriosComponent, {
      width: '600px',
      disableClose: true,
      data: {
        title: MENSAJES.CONF.CRITERIOS_INCLUSION,
        indicador: this.request,
        tipo: 1,
        criterioIN: row,
        criterioEX: null
      }
    });

    dialogRef.afterClosed().subscribe((result: CriteriosDTO) => {
      if (result !== null) {
        row.codChkListIndi = result.codChkListIndi;
        row.codCriterio = result.codCriterio;
        row.descripcion = result.descripcion;
        row.estado = result.estado;
      }
    });
  }

  public verEditarEX(row: CriteriosDTO) {
    this.guardarValorRequest();
    const dialogRef = this.dialog.open(CriteriosComponent, {
      width: '600px',
      disableClose: true,
      data: {
        title: MENSAJES.CONF.CRITERIOS_EXCLUSION,
        indicador: this.request,
        tipo: 2,
        criterioIN: null,
        criterioEX: row
      }
    });

    dialogRef.afterClosed().subscribe((result: CriteriosDTO) => {
      if (result !== null) {
        row.codChkListIndi = result.codChkListIndi;
        row.codCriterio = result.codCriterio;
        row.descripcion = result.descripcion;
        row.estado = result.estado;
      }
    });
  }

  public validarIndicador(): boolean {
    if (this.indicadoresFrmGrp.invalid) {
      this.descripcionFrmCtrl.markAsTouched();
      this.estadoFrmCtrl.markAsTouched();
      this.mensaje = MENSAJES.ERROR_CAMPOS;
      return false;
    }

    return true;
  }

  public guardarValorRequest(): void {
    this.request = new CheckListDTO();

    this.request.codMac = this.data.mac.codigo;
    this.request.codGrpDiag = this.data.grpDiagnostico;
    this.request.descripcion = this.descripcionFrmCtrl.value;
    this.request.codEstado = this.estadoFrmCtrl.value;

    if (this.nuevo) {
      this.request.fechaIniVigencia = new Date();
      this.request.codChkListIndi = null;
    } else {
      if (this.data.indicador.codEstado !== this.estadoFrmCtrl.value && this.estadoFrmCtrl.value === CONFIGURACION.macInactivo) {
        this.request.fechaFinVigencia = new Date();
      }
    }
  }

  public grabarIndicacion(): void {
    if (this.validarIndicador()) {
      this.guardarValorRequest();
      this.confService.registroCheckListConfig(this.request).subscribe(
        (response: WsResponse) => {
          if (response.audiResponse.codigoRespuesta === '0') {
            this.request.codChkListIndi = response.data.codChkListIndi;
            this.request.codIndicadorLargo = response.data.codIndicadorLargo;
            this.codigoFrmCtrl.setValue(this.request.codIndicadorLargo);
            this.openDialogMensaje(response.audiResponse.mensajeRespuesta, null, false, true, null);
            this.modificado = true;
            this.data.indicador = this.request;
          } else {
            this.openDialogMensaje(response.audiResponse.mensajeRespuesta, null, true, false, null);
          }
        }, (error) => {
          this.mensaje = 'Error al registrar/editar el indicador.';
          this.openDialogMensaje(MENSAJES.ERROR_SERVICIO, this.mensaje, true, false, null);
          console.error(this.mensaje);
          this.data.indicador = this.request;
        });
    } else {
      this.openDialogMensaje(this.mensaje, null, true, false, null);
    }
  }

  public onClose(): void {
    if (this.modificado) {
      this.dialogRef.close(null);
    } else {
      this.dialogRef.close(null);
    }
  }

  // POP-UP MENSAJES
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
        title: this.data.title,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        this.data.indicador.codChkListIndi = this.codigoFrmCtrl.value;
        this.data.indicador.descripcion = this.descripcionFrmCtrl.value;
        this.data.indicador.estado = this.estadoFrmCtrl.value;
        this.dialogRef.close(this.data.indicador);
      }
    });
  }

}
