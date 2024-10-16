import {Component, ElementRef, forwardRef, Inject, Injectable, OnInit, ViewChild} from '@angular/core';
import {ControlGastoService} from '../../service/ControlGasto/control-gasto.service';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {MessageComponent} from '../../core/message/message.component';
import {ACCESO, FILEFTP, MENSAJES, MY_FORMATS_AUNA} from '../../common';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatDialog,
  MatPaginator,
  MatPaginatorIntl,
  MatSort,
  MatTableDataSource
} from '@angular/material';
import {ControlGasto} from '../../dto/ControlGasto';
import {Router} from '@angular/router';
import {ListaConsumosRequest} from '../../dto/controlGasto/ListaConsumosRequest';
import {MomentDateAdapter} from '@angular/material-moment-adapter';
import {MatPaginatorIntlEspanol} from '../../directives/matpaginator-translate';
import { DatePipe } from '@angular/common';
import {WsResponseGasto} from '../../dto/WsResponseGasto';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import {UsuarioService} from '../../dto/service/usuario.service';
import {ArchivoFTP} from '../../dto/bandeja-preliminar/detalle-preliminar/ArchivoFTP';
import {CoreService} from '../../service/core.service';
import {and} from '@angular/router/src/utils/collection';


@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-control-gasto',
  templateUrl: './control-gasto.component.html',
  styleUrls: ['./control-gasto.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS_AUNA },
    { provide: MatPaginatorIntl, useClass: forwardRef(() => MatPaginatorIntlEspanol) }
  ]
})
export class ControlGastoComponent implements OnInit {

  maxDateIni: Date;
  maxDateFin: Date;

  loadFile: boolean;
  isLoading: boolean;

  public columnsGrilla = [{
    columnDef: 'codigoControlGasto',
    header: 'N°',
    cell: (control: ControlGasto) => `${control.codigoControlGasto}`
  },
    {
    columnDef: 'fechaCarga',
    header: 'FECHA CARGA',
    cell: (control: ControlGasto) => `${control.fechaCarga}`
  }, {
    columnDef: 'horaCarga',
    header: 'HORA CARGA',
    cell: (control: ControlGasto) => `${control.horaCarga}`
  }, {
    columnDef: 'nombreUsuario',
    header: 'RESPONSABLE CARGA',
    cell: (control: ControlGasto) => `${control.nombreUsuario}`
  }, {
    columnDef: 'desEstadoCarga',
    header: 'ESTADO CARGA',
    cell: (control: ControlGasto) => `${control.desEstadoCarga}`
  }, {
    columnDef: 'registroTotal',
    header: 'N° TOTAL REGISTROS',
    cell: (control: ControlGasto) => `${control.registroTotal}`
  }, {
    columnDef: 'registroCargado',
    header: 'N° REGISTROS CARGADOS',
    cell: (control: ControlGasto) => `${control.registroCargado}`
  }, {
    columnDef: 'registroError',
    header: 'N° REGISTROS CON ERROR',
    cell: (control: ControlGasto) => `${control.registroError}`
  }];

  controlGastoFrmGrp: FormGroup;

  disableBuscar: boolean;

  @ViewChild('archivoCargado') archivoCargado: ElementRef;

  public displayedColumns: string[];
  public dataSource: MatTableDataSource<ControlGasto>;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;


  listaControlGasto: ControlGasto[];

  bloqInscripcion: boolean;
  mensaje: string;

  showDate: any;
  today;

  totalResultadoBandeja = 0;
  pageSize = 10;
  skip = 0;
  pageIndex = 0;

  param = 0;

  startDate;
  endDate;

  filtroConsumoRequest: ListaConsumosRequest;

  mac2FrmGrp: FormGroup = new FormGroup({
    nameFileFrmCtrl: new FormControl(null, [Validators.required])
  });

  constructor(private _ctrlGastoService: ControlGastoService,
              public dialog: MatDialog,
              private router: Router,
              private datePipe: DatePipe,
              private adapter: DateAdapter<any>,
              private spinnerService: Ng4LoadingSpinnerService,
              @Inject(UsuarioService) private usuarioService: UsuarioService,
              private coreService: CoreService) {
    this.adapter.setLocale('es-PE');
    this.param = JSON.parse(localStorage.getItem('param'));
  }

  ngOnInit() {
    this.loadDate();
    this.inicializarVariables();
    this.crearFormularios();
    this.crearTablaPreliminar();
    this.listarTabla();
  }

  crearFormularios(): void {
    this.controlGastoFrmGrp = new FormGroup({
      fechaRegDesdeFrmCtrl: new FormControl(new Date(this.today.getFullYear(), this.today.getMonth(), 1), [Validators.required]),
      fechaRegHastaFrmCtrl: new FormControl(new Date(this.today.getFullYear(), this.today.getMonth(), this.param),[Validators.required]),
    });
  }

  get nameFileFrmCtrl() { return this.mac2FrmGrp.get('nameFileFrmCtrl'); }
  get fechaRegDesdeFrmCtrl() { return this.controlGastoFrmGrp.get('fechaRegDesdeFrmCtrl'); }
  get fechaRegHastaFrmCtrl() { return this.controlGastoFrmGrp.get('fechaRegHastaFrmCtrl'); }


  crearTablaPreliminar(): void {
    this.displayedColumns = [];

    this.columnsGrilla.forEach(c => {
          this.displayedColumns.push(c.columnDef);
    });

    this.displayedColumns.push('verLog', 'descargar');

  }

  loadDate() {
    this.today = new Date();
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    let month = meses[this.today.getMonth() - 1];
    let year = this.today.getFullYear();
    this.showDate = `${month} - ${year}`.toUpperCase();

    this.startDate = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
    this.endDate = new Date(this.today.getFullYear(), this.today.getMonth(), this.param+1);
  }

  inicializarVariables(): void {

  //  this.maxDateIni = new Date();
  //   this.maxDateFin = this.endDate;

    this.bloqInscripcion = true;
    this.nameFileFrmCtrl.disable();
    this.pageSize = 0;
  }

  openInput(): void {
    /*if ((this.today < this.endDate && this.startDate <= this.today)||true) {
      document.getElementById('fileInput').click();
    } */
    if ((this.today < this.endDate && this.startDate <= this.today)) {
      document.getElementById('fileInput').click();
    }
    else {
      this.openDialogMensaje(MENSAJES.GASTOS.VALIDA_MES, null, true, false, null);
    }
  }

  cargarArchivo() {

    if (this.archivoCargado.nativeElement.files.length === 0) {
      this.nameFileFrmCtrl.setValue(null);
      this.bloqInscripcion = true;
    } else {
      this.nameFileFrmCtrl.setValue(this.archivoCargado.nativeElement.files[0].name);
      this.bloqInscripcion = false;
    }

  }

  enviarArchivoConsumo() {
    this.openDialogMensaje(MENSAJES.GASTOS.CONFIRMACION, null, false, true, null)
      .subscribe(result => {
        if (result === 0) {
          this.cleanAttached();
          return 0;
        } else {
          // Valida que el archivo sea un excel
          if (!this.archivoCargado.nativeElement.files[0].name.toLowerCase().match(/(\.xlsx|\.xls)$/)) {
            // if (!this.archivoCargado.nativeElement.files[0].name.toLowerCase().match(/(\.xlsx|\.xls|\.csv)$/)) {
              this.openDialogMensaje(MENSAJES.GASTOS.VALIDA_EXCEL, null, true, false, null);
            this.cleanAttached();
            this._ctrlGastoService.importarArchivo(this.usuarioService.getCodUsuario, this.usuarioService.getNombres, null);
            return 0;
          }

          // Valida que el archivo no sea mayor de 50mb
          if (this.archivoCargado.nativeElement.files[0].size > 52428800) {
            this.openDialogMensaje(MENSAJES.GASTOS.VALIDA_50MB, null, true, false, null);
            this.cleanAttached();
            this._ctrlGastoService.importarArchivo(this.usuarioService.getCodUsuario, this.usuarioService.getNombres, null);
            return 0;
          }

          let validacion = [];
          let contador = 0;

          this.loadFile = true;
          this.spinnerService.show();

          let usuario = `${this.usuarioService.getNombres} ${this.usuarioService.getApelPaterno}`;

          this._ctrlGastoService.importarArchivo(this.usuarioService.getCodUsuario, usuario, this.archivoCargado.nativeElement.files[0])
            .subscribe(data => {
            // if (data.codResultado > 0 && data.msgResultado !== null) {
            if (data.codResultado === 0) {
              this.spinnerService.hide();
              this.loadFile = false;
              this.listarTabla();
              this.openDialogMensaje(MENSAJES.GASTOS.SUBTITULO_OK, null, true, false, null);
              this.cleanAttached();
              return 0;
            } else {

              if (data.listResponse.length > 0) {

                data.listResponse.forEach(l => {
                  contador = contador + 1;
                  validacion.push(`${contador}. ${l.msgResultado}.`);
                });
              }

              let errores = validacion.filter(value => typeof value !== 'undefined').join('\n').toString();

              if (contador > 0) {
                this.spinnerService.hide();
                this.loadFile = false;
                this.openDialogMensaje(MENSAJES.GASTOS.SUBTITULO_ERROR, errores, true, false, null);
                this.cleanAttached();
                return 0;
              }
            }
          }, error => {
              this.spinnerService.hide();
              this.cleanAttached();
              this.openDialogMensaje(MENSAJES.CONSUMO.SUBTITULO_OK, null, true, false, null);
            });
        }
      });
  }

  guardarFiltrosBusqueda(): void {
    this.filtroConsumoRequest = new ListaConsumosRequest();
    this.filtroConsumoRequest.fechaInicio = this.fechaRegDesdeFrmCtrl.value;
    this.filtroConsumoRequest.fechaFinal = this.fechaRegHastaFrmCtrl.value;
  }

  public listarTabla() {

    if (this.controlGastoFrmGrp.invalid) {
      if (this.fechaRegDesdeFrmCtrl.invalid && this.fechaRegHastaFrmCtrl.invalid ) {
        this.openDialogMensaje('Debe ingresar un rango de fechas valido', null, true, false, null);
        return 0;
      } else if (this.fechaRegDesdeFrmCtrl.invalid) {
        this.openDialogMensaje('Debe ingresar una fecha inicio valida', null, true, false, null);
        return 0;
      } else if (this.fechaRegHastaFrmCtrl.invalid) {
        this.openDialogMensaje('Debe ingresar una fecha fin valida', null, true, false, null);
        return 0;
      }
    }

    this.disableBuscar = true;
    this.fechaRegDesdeFrmCtrl.disable();
    this.fechaRegHastaFrmCtrl.disable();
    this.listaControlGasto = [];
    this.isLoading = true;
    this.dataSource = null;
    this.guardarFiltrosBusqueda();
    this.filtroConsumoRequest.index = 0;
    this.filtroConsumoRequest.size = this.pageSize;
    this._ctrlGastoService.listarArchivos(this.filtroConsumoRequest)
      .subscribe(
        (data: WsResponseGasto) => {
          if (data.codResultado === 0 ) {
            this.listaControlGasto = (data.dataList != null) ? data.dataList : [];

            this.totalResultadoBandeja = (data.total != null) ? data.total : 0;
            this.cargarTablaGastos();
          } else {
            this.mensaje = MENSAJES.ERROR_NOFUNCION;
            this.openDialogMensaje(this.mensaje, data.msgResultado, true, false, null);
          }
          this.isLoading = false;
          this.disableBuscar = false;
          this.fechaRegDesdeFrmCtrl.enable();
          this.fechaRegHastaFrmCtrl.enable();
        },
        error => {
          this.isLoading = false;
          this.mensaje = MENSAJES.ERROR_SERVICIO;
          this.openDialogMensaje(this.mensaje, 'Listar Historial de consumo', true, false, null);
          console.error(error);
          this.disableBuscar = false;
          this.fechaRegDesdeFrmCtrl.enable();
          this.fechaRegHastaFrmCtrl.enable();
        }
      );
  }

  public cambiarPagina(event) {
    if (event.pageSize !== this.pageSize) {
      this.pageSize = event.pageSize;
      this.skip = event.pageSize * event.pageIndex;
      this.listarTabla();
      event.length = this.totalResultadoBandeja;
    } else {
      if (this.totalResultadoBandeja > this.dataSource.data.length) {
        this.skip = event.pageSize * event.pageIndex;
        this.pageSize = event.pageSize;
        this.listarTabla();
      }
    }
  }

  cargarTablaGastos(): void {
    if (this.listaControlGasto.length > 0) {
      this.dataSource = new MatTableDataSource(this.listaControlGasto);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    }
  }

  cleanAttached() {
    this.archivoCargado.nativeElement.value = '';
    this.nameFileFrmCtrl.setValue(null);
    this.bloqInscripcion = true;
  }

   openDialogMensaje(message: string, message2: string, alerta: boolean, confirmacion: boolean, valor: any) {
    const dialogRef = this.dialog.open(MessageComponent, {
      width: '400px',
      disableClose: true,
      data: {
        title: MENSAJES.GASTOS.TITLE,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor
      }
    });
       return dialogRef.afterClosed();
  }

  public validarFechaInicio() {
    const dateInicio = this.fechaRegDesdeFrmCtrl.value;
    const dateFin = this.fechaRegHastaFrmCtrl.value;
    if (dateInicio != null && dateFin != null) {
      if (dateInicio > dateFin) {
        this.openDialogMensaje('Fecha inicial debe ser menor que la fecha final', null, true, false, null);
        this.fechaRegDesdeFrmCtrl.setValue(null);
      }
    }
  }

  public validarFechaFin() {
    const dateInicio = this.fechaRegDesdeFrmCtrl.value;
    const dateFin = this.fechaRegHastaFrmCtrl.value;
    if (dateInicio != null && dateFin != null) {
      if (dateInicio > dateFin) {
        this.openDialogMensaje('Fecha final debe ser mayor a la fecha inicial', null, true, false, null);
        this.fechaRegHastaFrmCtrl.setValue(null);
      }
    }
  }

  descargar(codigo) {
    this.loadFile = true;
    this.spinnerService.show();
    let request = new ArchivoFTP();

    request.usrApp = FILEFTP.usrApp;
    request.codArchivo = codigo;
    request.nomArchivo = '';
    request.ruta = '';

    this._ctrlGastoService.getArchivoXls(request)
      .subscribe((data) => {
          if (data.audiResponse.codigoRespuesta === '0') {
            this.spinnerService.hide();
            this.loadFile = false;
            data.data.contentType = 'application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            const blob = this.coreService.crearBlobFile(data.data);

            const link = document.createElement('a');
            // link.target = '_blank';
            link.href = window.URL.createObjectURL(blob);
            link.setAttribute('download', data.data.nomArchivo);
            link.click();
            // window.open(window.URL.createObjectURL(blob), '_blank');
          } else {
            this.spinnerService.hide();
            this.loadFile = false;
            this.openDialogMensaje('No se logro descargar el archivo', null, true, false, null);
          }
        },
        error => {
          console.error(error);
          this.spinnerService.hide();
          this.loadFile = false;
          this.openDialogMensaje('No se logro descargar el archivo', null, true, false, null);
        });
  }

  verLog(codigo) {
    this.loadFile = true;
    this.spinnerService.show();
    let request = new ArchivoFTP();

    request.usrApp = FILEFTP.usrApp;
    request.codArchivo = codigo;
    request.nomArchivo = '';
    request.ruta = '';

    this._ctrlGastoService.getArchivoLog(request)
      .subscribe((data) => {

          if (data.audiResponse.codigoRespuesta === '0') {
            this.spinnerService.hide();
            this.loadFile = false;
            data.data.contentType = 'text/plain';
            const blob = this.coreService.crearBlobFile(data.data);

            const link = document.createElement('a');
            // link.target = '_blank';
            link.href = window.URL.createObjectURL(blob);
            link.setAttribute('download', data.data.nomArchivo);
            link.click();
            // window.open(window.URL.createObjectURL(blob), '_blank');
          } else {
            this.spinnerService.hide();
            this.loadFile = false;
            this.openDialogMensaje('No se logro descargar el archivo', null, true, false, null);
          }
        },
        error => {
          console.error(error);
          this.spinnerService.hide();
          this.loadFile = false;
          this.openDialogMensaje('No se logro descargar el archivo', null, true, false, null);
        });
  }
}
