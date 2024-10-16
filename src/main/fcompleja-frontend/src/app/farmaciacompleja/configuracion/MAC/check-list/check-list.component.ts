import { Component, OnInit, forwardRef, Inject, ViewChild } from '@angular/core';
import {
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
  MatPaginatorIntl,
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatTableDataSource,
  MatSort,
  MatPaginator
} from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MY_FORMATS_AUNA, MENSAJES } from 'src/app/common';
import { MatPaginatorIntlEspanol } from 'src/app/directives/matpaginator-translate';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { GrupoDiagnosticoDTO } from 'src/app/dto/configuracion/GrupoDiagnosticoDTO';
import { ParametroRequest } from 'src/app/dto/ParametroRequest';
import { MACResponse } from 'src/app/dto/configuracion/MACResponse';
import { CheckListDTO } from 'src/app/dto/configuracion/CheckListDTO';
import { DatePipe } from '@angular/common';
import { IndicadorCriteriosComponent } from './indicador-criterios/indicador-criterios.component';
import { MessageComponent } from 'src/app/core/message/message.component';
import { ConfiguracionService } from 'src/app/service/configuracion.service';
import { WsResponseOnco } from 'src/app/dto/WsResponseOnco';
import { CodigoCheckList } from 'src/app/dto/configuracion/CodigoCheckList';
import { RegistrarIndicadorComponent } from './indicador/registrar.component';
import { EditarIndicadorComponent } from './indicador/editar.component';
import { BuscarGrupoDiagnosticoComponent } from 'src/app/modal/buscar-diagnostico/buscar-diagnostico.component';

export interface DataDialog {
  title: string;
  mac: MACResponse;
}

@Component({
  selector: 'app-check-list',
  templateUrl: './check-list.component.html',
  styleUrls: ['./check-list.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS_AUNA },
    { provide: MatPaginatorIntl, useClass: forwardRef(() => MatPaginatorIntlEspanol) }
  ]
})
export class CheckListComponent implements OnInit {

  cmbGrupoDiagnostico: GrupoDiagnosticoDTO[];
  requestChkList: CodigoCheckList;
  mensaje: string;
  buscarActivo: boolean;

  // Tabla
  dataSource: MatTableDataSource<CheckListDTO>;
  listaCheckList: CheckListDTO[];
  isLoading: boolean;
  displayedColumns: string[];
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  columnsGrilla = [{
    columnDef: 'codIndicadorLargo',
    header: 'CÓDIGO',
    cell: (indicador: CheckListDTO) => `${indicador.codIndicadorLargo}`
  }, {
    columnDef: 'descripcion',
    header: 'INDICACIÓN',
    cell: (indicador: CheckListDTO) => `${indicador.descripcion}`
  }, {
    columnDef: 'fechaIniVigencia',
    header: 'FECHA INICIO VIGENCIA',
    cell: (indicador: CheckListDTO) => this.datePipe.transform(indicador.fechaIniVigencia, 'dd/MM/yyyy')
  }, {
    columnDef: 'fechaFinVigencia',
    header: 'FECHA FIN VIGENCIA',
    cell: (indicador: CheckListDTO) => this.datePipe.transform(indicador.fechaFinVigencia, 'dd/MM/yyyy')
  }, {
    columnDef: 'estado',
    header: 'ESTADO',
    cell: (indicador: CheckListDTO) => `${indicador.estado}`
  }];

  chkListFrmGrp: FormGroup = new FormGroup({
    codigoFrmCtrl: new FormControl(null),
    descripcionFrmCtrl: new FormControl(null),
    grupoDiagnosticoFrmCtrl: new FormControl(null, [Validators.required])
  });

  get codigoFrmCtrl() { return this.chkListFrmGrp.get('codigoFrmCtrl'); }
  get descripcionFrmCtrl() { return this.chkListFrmGrp.get('descripcionFrmCtrl'); }
  get grupoDiagnosticoFrmCtrl() { return this.chkListFrmGrp.get('grupoDiagnosticoFrmCtrl'); }

  codigoGrupoDiagnostico: string;
  descripcionGrupoDiagnostico: string;

  constructor(public datePipe: DatePipe,
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<CheckListComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DataDialog,
    public confService: ConfiguracionService
  ) {
  }

  ngOnInit() {
    this.inicializarVariables();
    this.crearTablaIndicadores();
  }

  public inicializarVariables(): void {
    this.buscarActivo = false;
    this.cmbGrupoDiagnostico = [];
    this.listaCheckList = [];
    this.dataSource = null;
    this.isLoading = false;
    this.codigoFrmCtrl.setValue(this.data.mac.codigoLargo);
    this.descripcionFrmCtrl.setValue(this.data.mac.descripcion);
    this.obtenerListaGrupoDiagnostico();
  }

  public crearTablaIndicadores(): void {
    this.displayedColumns = [];
    this.columnsGrilla.forEach(column => {
      this.displayedColumns.push(column.columnDef);
    });
    this.displayedColumns.push('editar');
  }

  public cargarTablaIndicadores(): void {
    if (this.listaCheckList.length > 0) {
      this.dataSource = new MatTableDataSource(this.listaCheckList);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  public onClose(): void {
    this.dialogRef.close(null);
  }

  public ValidarForm(): boolean {
    let valido = true;

    if (this.chkListFrmGrp.invalid) {
      this.grupoDiagnosticoFrmCtrl.markAsTouched();
      this.mensaje = 'Validar campos requeridos';
      return false;
    }

    valido = true;

    return valido;
  }

  public nuevaIndicacion(): void {

    if (this.ValidarForm()) {
      const dialogRef = this.dialog.open(RegistrarIndicadorComponent, {
        width: '800px',
        disableClose: true,
        data: {
          title: MENSAJES.CONF.NUEVO_INDICADOR,
          mac: this.data.mac,
          // grpDiagnostico: this.grupoDiagnosticoFrmCtrl.value,
          grpDiagnostico: this.codigoGrupoDiagnostico,
          indicador: null,
          tipo: 1,
          codigo: (this.dataSource) ? (this.dataSource.data.length + 1).toString().padStart(2, '0') : '01'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result === true) {
          this.obtenerListaIndicadores(null);
        }
      });
    } else {
      this.openDialogMensaje(this.mensaje, null, true, false, null);
    }

  }

  public verEditar(row: CheckListDTO) {
    const dialogRef = this.dialog.open(EditarIndicadorComponent, {
      width: '800px',
      disableClose: true,
      data: {
        title: MENSAJES.CONF.EDITAR_INDICADOR,
        mac: this.data.mac,
        // grpDiagnostico: this.grupoDiagnosticoFrmCtrl.value,
        grpDiagnostico: this.codigoGrupoDiagnostico,
        indicador: row,
        tipo: 2
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.obtenerListaIndicadores(null);
      }
    });
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
        title: MENSAJES.CONF.NUEVO_INDICADOR,
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

  public obtenerListaGrupoDiagnostico(): void {
    this.confService.listarGrupoDiagnostico().subscribe(
      (dataResponse: WsResponseOnco) => {
        if (dataResponse.audiResponse.codigoRespuesta === '0') {
          this.cmbGrupoDiagnostico = [];
          this.cmbGrupoDiagnostico = dataResponse.dataList;

        } else {
          this.openDialogMensaje(MENSAJES.ERROR_NOFUNCION, dataResponse.audiResponse.mensajeRespuesta, true, false, null);
        }
      },
      error => {
        console.error('Error al listar el grupo diagnostico');
        this.openDialogMensaje(MENSAJES.ERROR_SERVICIO, 'Error al listar el grupo diagnostico', true, false, null);
      }
    );
  }

  public guardarCheckListRequest(): boolean {
    if (this.chkListFrmGrp.invalid) {
      this.grupoDiagnosticoFrmCtrl.markAsTouched();
      this.mensaje = MENSAJES.ERROR_CAMPOS;
      return false;
    }

    this.requestChkList = new CodigoCheckList();
    this.requestChkList.codMac = this.data.mac.codigo;
    // this.requestChkList.codGrpDiag = this.grupoDiagnosticoFrmCtrl.value;
    this.requestChkList.codGrpDiag = this.codigoGrupoDiagnostico;

    return true;
  }

  public obtenerListaIndicadores($event: Event): void {
    if (this.guardarCheckListRequest()) {
      this.dataSource = null;
      this.listaCheckList = [];
      this.isLoading = true;
      this.confService.listCheckListConfig(this.requestChkList).subscribe(
        (dataResponse: WsResponseOnco) => {
          if (dataResponse.audiResponse.codigoRespuesta === '0') {
            this.listaCheckList = dataResponse.dataList;
            this.cargarTablaIndicadores();
          } else {
            this.openDialogMensaje(MENSAJES.ERROR_NOFUNCION, dataResponse.audiResponse.mensajeRespuesta, true, false, null);
          }
          this.isLoading = false;
        },
        error => {
          this.isLoading = false;
          this.mensaje = 'Error al listar los indicadores del grupo diagnostico';
          console.error(this.mensaje);
          // this.openDialogMensaje(MENSAJES.ERROR_SERVICIO, this.mensaje, true, false, this.grupoDiagnosticoFrmCtrl.value);
          this.openDialogMensaje(MENSAJES.ERROR_SERVICIO, this.mensaje, true, false, this.codigoGrupoDiagnostico);
        }
      );
    } else {
      this.openDialogMensaje(this.mensaje, null, true, false, null);
    }
  }

  openBuscarGrupoDiagnostico(): void {
    const dialogRef = this.dialog.open(BuscarGrupoDiagnosticoComponent, {
        width: '640px',
        disableClose: true,
        autoFocus: false,
        data: {
            title : 'BÚSQUEDA GRUPO DIAGNOSTICO'
        }
    });
    dialogRef.afterClosed().subscribe(result => {
        if (result) {
            this.chkListFrmGrp.get('grupoDiagnosticoFrmCtrl').setValue(result.nomDiagnostico);
            this.codigoGrupoDiagnostico = result.codDiagnostico;
            this.descripcionGrupoDiagnostico = result.nomDiagnostico;
            /*this.marcadorRequest.codUsuario = result.codUsuario;
            this.marcadorForm.get('codigoUsuario').setValue(result.usuario);
            this.marcadorForm.get('nombreUsuario').setValue(`${result.apePate} ${result.apeMate}, ${result.nombres}`);
            this.marcadorForm.get('correoUsuario').setValue(result.correo);*/
        }
    });
}
}
