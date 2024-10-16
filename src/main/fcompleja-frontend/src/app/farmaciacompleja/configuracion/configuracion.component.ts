import { Component, OnInit, ViewChild, Renderer2, forwardRef, Inject, ElementRef } from '@angular/core';
import {
  MatDialog,
  MatSort,
  MatTableDataSource,
  MatPaginator,
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
  MatPaginatorIntl
} from '@angular/material';

import { FiltroMACRequest } from 'src/app/dto/configuracion/FiltroMACRequest';
import { MACResponse } from 'src/app/dto/configuracion/MACResponse';
import { ConfiguracionService } from 'src/app/service/configuracion.service';
import { FiltroMACResponse } from 'src/app/dto/configuracion/FiltroMACResponse';
import { MacComponent } from './MAC/mac.dialog.component';
import { MENSAJES, MY_FORMATS_AUNA } from 'src/app/common';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatPaginatorIntlEspanol } from 'src/app/directives/matpaginator-translate';
import { DatePipe } from '@angular/common';
import { CheckListComponent } from './MAC/check-list/check-list.component';
import { MessageComponent } from 'src/app/core/message/message.component';
import { FichaTecnicaComponent } from './MAC/ficha-tecnica/ficha-tecnica.component';
import { UsuarioService } from 'src/app/dto/service/usuario.service';
import { MarcadoresComponent } from './MAC/marcadores/marcadores.component';
import { ProductoAsociadoComponent } from './MAC/productos-asociados/productos-asociados.component';
import { ComplicacionesMedicasComponent } from './MAC/complicaciones-medicas/complicaciones-medicas.component';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';


@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS_AUNA },
    { provide: MatPaginatorIntl, useClass: forwardRef(() => MatPaginatorIntlEspanol) }
  ]
})

export class ConfiguracionComponent implements OnInit {

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild("archivoCargado") archivoCargado: ElementRef;


  listaMedicamentos: MACResponse[];
  dataSource: MatTableDataSource<MACResponse> = new MatTableDataSource([]);
  filtroMac: MACResponse = new MACResponse();

  isLoading: boolean;
  mensajes: string;
  loadFile: boolean;
  bloqInscripcion: boolean;
  btnBuscar: boolean;

  mac2FrmGrp: FormGroup = new FormGroup({
    nameFileFrmCtrl: new FormControl(null, [Validators.required]),
  });

  get nameFileFrmCtrl() {
    return this.mac2FrmGrp.get("nameFileFrmCtrl");
  }

  configuracionFrmGrp: FormGroup = new FormGroup({
    filtroCodMACFrmCtrl: new FormControl(null),
    filtroDescMACFrmCtrl: new FormControl(null)
  });

  get filtroCodMACFrmCtrl() { return this.configuracionFrmGrp.get('filtroCodMACFrmCtrl'); }
  get filtroDescMACFrmCtrl() { return this.configuracionFrmGrp.get('filtroDescMACFrmCtrl'); }

  displayedColumns: string[];
  columnsGrilla = [{
    columnDef: 'codigoLargo',
    header: 'CÓDIGO',
    cell: (macResponse: MACResponse) => `${macResponse.codigoLargo}`
  }, {
    columnDef: 'descripcion',
    header: 'DESCRIPCIÓN',
    cell: (macResponse: MACResponse) => `${macResponse.descripcion}`
  }, {
    columnDef: 'tipo',
    header: 'TIPO',
    cell: (macResponse: MACResponse) => `${macResponse.tipo}`
  }, {
    columnDef: 'fechaInscripcion',
    header: 'FECHA INSCRIPCIÓN',
    cell: (macResponse: MACResponse) => this.datePipe.transform(macResponse.fechaInscripcion, 'dd/MM/yyyy','en-US')
  }, {
    columnDef: 'usuarioCreacion',
    header: 'USUARIO INSCRIPCIÓN',
    cell: (macResponse: MACResponse) => `${macResponse.usuarioCreacion}`
  }, {
    columnDef: 'fechaInicioVigencia',
    header: 'FECHA INICIO VIGENCIA',
    cell: (macResponse: MACResponse) => this.datePipe.transform(macResponse.fechaInicioVigencia, 'dd/MM/yyyy','en-US')
  }, {
    columnDef: 'fechaFinVigencia',
    header: 'FECHA FIN VIGENCIA',
    cell: (macResponse: MACResponse) => this.datePipe.transform(macResponse.fechaFinVigencia, 'dd/MM/yyyy','en-US')
  }, {
    columnDef: 'estado',
    header: 'ESTADO',
    cell: (macResponse: MACResponse) => `${macResponse.estado}`
  }];

  constructor(
    private datePipe: DatePipe,
    private configuracionService: ConfiguracionService,
    public dialog: MatDialog,
    private spinnerService: Ng4LoadingSpinnerService,
    @Inject(UsuarioService) private userService: UsuarioService) { }

  ngOnInit() {
    this.inicializarVariables();
    this.createTablaMedicamentos();
    this.eventoFiltrarMAC();
    window["time"]=this.datePipe
  }

  public inicializarVariables(): void {
    this.isLoading = false;
    this.nameFileFrmCtrl.disable();
    this.listaMedicamentos = [];
    this.filtroMac = new MACResponse();
  }

  public createTablaMedicamentos(): void {
    this.displayedColumns = [];
    this.columnsGrilla.forEach(column => {
      this.displayedColumns.push(column.columnDef);
    });
    this.displayedColumns.push(
      'detalleCheckList',
      'detalleFichaTecnica',
      'detalleComplicacionesMedicas',
      'detalleProductosAsociados',
      'detalleMarcadores',
      'editar');
  }

  public guardarFiltros(): void {
    this.filtroMac = new MACResponse();
    this.filtroMac.codigoLargo = this.filtroCodMACFrmCtrl.value;
    this.filtroMac.descripcion = this.filtroDescMACFrmCtrl.value;
  }

  ////////////////////////////////// EVENTOS ITEM GRILLA
  public verDetalleCheckList(macRow: MACResponse): void {
    const dialogRef = this.dialog.open(CheckListComponent, {
      width: '800px',
      disableClose: true,
      data: {
        title: MENSAJES.CONF.CHECKLIST,
        mac: macRow
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        this.eventoFiltrarMAC();
      } else {

      }
    });
  }

  public verDetalleFichaTecnica(macRow: MACResponse): void {
    const dialogRef = this.dialog.open(FichaTecnicaComponent, {
      width: '700px',
      disableClose: true,
      data: {
        title: MENSAJES.CONF.FICHA_TECNICA,
        mac: macRow
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        this.eventoFiltrarMAC();
      } else {

      }
    });
  }

  public verDetalleComplicacionesMedicas(macRow: MACResponse): void {
    const dialogRef = this.dialog.open(ComplicacionesMedicasComponent, {
      width: '700px',
      disableClose: true,
      data: {
        title: MENSAJES.CONF.COMPLICACION_MEDICA,
        mac: macRow
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        this.eventoFiltrarMAC();
      } else {

      }
    });
  }

  public verDetalleProductosAsociados(macRow: MACResponse): void {
    const dialogRef = this.dialog.open(ProductoAsociadoComponent, {
      width: '700px',
      disableClose: true,
      data: {
        title: MENSAJES.CONF.PRODUCTO_ASOCIADO,
        mac: macRow
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        this.eventoFiltrarMAC();
      } else {

      }
    });
  }

  public verDetalleMarcadores(macRow: MACResponse): void {
    const dialogRef = this.dialog.open(MarcadoresComponent, {
      width: '700px',
      disableClose: true,
      data: {
        title: MENSAJES.CONF.MARCADORES,
        mac: macRow
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result != null) {
        this.eventoFiltrarMAC();
      } else {

      }
    });
  }

  public verEditar(macRow: MACResponse): void {
    const dialogRef = this.dialog.open(MacComponent, {
      width: '500px',
      disableClose: true,
      data: {
        title: MENSAJES.CONF.EDITAR_MAC,
        mac: macRow
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== null) {
        macRow = result;
        this.eventoFiltrarMAC();
      }
    });
  }

  public cargarTablaMedicamentos(): void {
    if (this.listaMedicamentos.length > 0) {
      this.dataSource = new MatTableDataSource(this.listaMedicamentos);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
    this.btnBuscar=false;
  }

  ///////////////////////////////////// Servicios
  public eventoFiltrarMAC(): void {
    this.isLoading = true;
    this.dataSource = null;
    this.guardarFiltros();
    this.btnBuscar=true;
    this.configuracionService
      .filtrarMAC(this.filtroMac)
      .subscribe(
        (response: FiltroMACResponse) => {
          if (response.audiResponse.codigoRespuesta === '0') {
            this.listaMedicamentos = (response.dataList != null) ? response.dataList : [] ;
            this.cargarTablaMedicamentos();
          } else {
            this.mensajes = response.audiResponse.mensajeRespuesta;
            this.openDialogMensaje(MENSAJES.ERROR_NOFUNCION, this.mensajes, true, false, null);
          }

          this.isLoading = false;
        },
        error => {
          this.mensajes = MENSAJES.ERROR_SERVICIO;
          console.error('Error al filtrar MAC');
          this.openDialogMensaje(this.mensajes, 'Error al filtrar MAC', true, false, null);
          this.isLoading = false;
        }
      );

  }

  public nuevoMac(): void {
    const dialogRef = this.dialog.open(MacComponent, {
      width: '500px',
      disableClose: true,
      data: {
        title: MENSAJES.CONF.NUEVO_MAC,
        mac: null
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== null) {
        this.filtroMac = new MACResponse();
        this.filtroCodMACFrmCtrl.setValue(null);
        this.filtroDescMACFrmCtrl.setValue(null);
        this.eventoFiltrarMAC();
      } else {

      }
    });
  }

  //////////////////////////////////////
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
        title: 'CONFIGURACIÓN DEL SISTEMA',
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
  /////////////////////////////////////

  openInput(): void {
    // if (this.today < this.endDate && this.startDate <= this.today) {
    document.getElementById("fileInput").click();
    // }
    // else {
    //   this.openDialogMensaje(MENSAJES.CONSUMO.VALIDA_MES, null, true, false, null);
    // }
  }

  cargarArchivo() {
    if (this.archivoCargado.nativeElement.files.length === 0) {
      this.nameFileFrmCtrl.setValue(null);
      this.bloqInscripcion = true;
    } else {
      this.nameFileFrmCtrl.setValue(
        this.archivoCargado.nativeElement.files[0].name
      );
      this.bloqInscripcion = false;
    }
  }

  importarArchivoMac() {
    this.openDialogMensaje2(
      MENSAJES.CONSUMO.CONFIRMACION,
      null,
      false,
      true,
      null
    ).subscribe((result) => {
      if (result === 0) {
        this.cleanAttached();
        return 0;
      } else {
        // Valida que el archivo sea un excel
        if (
          !this.archivoCargado.nativeElement.files[0].name
            .toLowerCase()
            .match(/(\.xlsx|\.xls)$/)
        ) {
          // if (!this.archivoCargado.nativeElement.files[0].name.toLowerCase().match(/(\.xlsx|\.xls|\.csv)$/)) {
          this.openDialogMensaje2(
            MENSAJES.CONSUMO.VALIDA_EXCEL,
            null,
            true,
            false,
            null
          );
          this.cleanAttached();
          this.configuracionService.importarArchivo(
            this.userService.getCodUsuario,
            this.userService.getNombres,
            null
          );
          return 0;
        }

        // Valida que el archivo no sea mayor de 50mb
        if (this.archivoCargado.nativeElement.files[0].size > 52428800) {
          this.openDialogMensaje2(
            MENSAJES.CONSUMO.VALIDA_50MB,
            null,
            true,
            false,
            null
          );
          this.cleanAttached();
          this.configuracionService.importarArchivo(
            this.userService.getCodUsuario,
            this.userService.getNombres,
            null
          );
          return 0;
        }

        this.loadFile = true;
        this.spinnerService.show();

        let usuario = `${this.userService.getNombres} ${this.userService.getApelPaterno}`;
        
        this.configuracionService
          .importarArchivo(
            this.userService.getCodUsuario,
            usuario,
            this.archivoCargado.nativeElement.files[0]
          )
          .subscribe(
            (data) => {
              
              
              //this.spinnerService.show();
              
              if (data["codResultado"] === 0) {
                this.spinnerService.hide();
                this.loadFile = false;
                this.eventoFiltrarMAC();
                this.openDialogMensaje(
                  MENSAJES.CONSUMO.SUBTITULO_OK,
                  null,
                  true,
                  false,
                  null
                );
                this.cleanAttached();
                return 0;
              } else {
                this.mensajes = data["msgResultado"];
                this.spinnerService.hide();
                this.loadFile = false;
                this.openDialogMensaje(
                  MENSAJES.ERROR_NOFUNCION,
                  this.mensajes,
                  true,
                  false,
                  null
                );
                this.cleanAttached();
                return 0;
              }

              // // if (data.codResultado > 0 && data.msgResultado !== null) {
              // if (data.codResultado === 0) {
              //   this.spinnerService.hide();
              //   this.loadFile = false;
              //   //this.listarTabla();
              //   this.openDialogMensaje2(MENSAJES.CONSUMO.SUBTITULO_OK, null, true, false, null);
              //   this.cleanAttached();
              //   return 0;
              // } else {

              //   if (data.listResponse.length > 0) {

              //     data.listResponse.forEach(l => {
              //       contador = contador + 1;
              //       validacion.push(`${contador}. ${l.msgResultado}.`);
              //     });
              //   }

              //   let errores = validacion.filter(value => typeof value !== 'undefined').join('\n').toString();

              //   if (contador > 0) {
              //     this.spinnerService.hide();
              //     this.loadFile = false;
              //     this.openDialogMensaje2(MENSAJES.CONSUMO.SUBTITULO_ERROR, errores, true, false, null);
              //     this.cleanAttached();
              //     return 0;
              //   }
              // }
            },
            (error) => {
              
              this.spinnerService.hide();
              this.cleanAttached();
              this.openDialogMensaje2(
                MENSAJES.RecAccount.error404,
                null,
                true,
                false,
                null
              );
            }
          );
      }
    });
  }

  openDialogMensaje2(
    message: string,
    message2: string,
    alerta: boolean,
    confirmacion: boolean,
    valor: any
  ) {
    const dialogRef = this.dialog.open(MessageComponent, {
      width: "400px",
      disableClose: true,
      data: {
        title: MENSAJES.CONSUMO.TITLE,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    return dialogRef.afterClosed();
  }

  cleanAttached() {
    this.archivoCargado.nativeElement.value = "";
    this.nameFileFrmCtrl.setValue(null);
    this.bloqInscripcion = true;
  }

}

