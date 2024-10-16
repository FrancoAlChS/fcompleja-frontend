import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  forwardRef,
} from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
  MatTableDataSource,
  MatPaginator,
  MatSort,
  MatDialog,
  MatPaginatorIntl,
} from '@angular/material';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ListaEvaluaciones } from 'src/app/dto/solicitudEvaluacion/bandeja/ListaEvaluaciones';
import { DetalleSolicitudEvaluacionService } from 'src/app/service/detalle.solicitud.evaluacion.service';
import { ListaEvaluacionesRequest } from 'src/app/dto/solicitudEvaluacion/bandeja/ListaEvaluacionesRequest';
import { WsResponse } from 'src/app/dto/WsResponse';
import { MessageComponent } from 'src/app/core/message/message.component';
import { ProgramacionCmacRequest } from 'src/app/dto/request/ProgramacionCmacRequest';
import { BandejaEvaluacionService } from 'src/app/service/bandeja.evaluacion.service';
import {
  MY_FORMATS_AUNA,
  MENSAJES,
  EMAIL,
  FILEFTP,
  ROLES,
  FLAG_REGLAS_EVALUACION,
  ACCESO_EVALUACION,
} from 'src/app/common';
import { ListaCasosEvaluacion } from 'src/app/dto/solicitudEvaluacion/bandeja/ListaCasosEvaluacion';

//Servios
import { CasosEvaluar } from 'src/app/dto/solicitudEvaluacion/bandeja/CasosEvaluar';
import { MatPaginatorIntlEspanol } from 'src/app/directives/matpaginator-translate';
import { EmailDTO } from 'src/app/dto/core/EmailDTO';
import * as _moment from 'moment';
import { CorreosService } from 'src/app/service/cross/correos.service';
import { OncoWsResponse } from 'src/app/dto/response/OncoWsResponse';
import { UsuarioService } from 'src/app/dto/service/usuario.service';
import { ParticipanteRequest } from 'src/app/dto/request/BandejaEvaluacion/ParticipanteRequest';
import { ListaFiltroUsuarioRolservice } from 'src/app/service/Lista.usuario.rol.service';
import { CoreService } from 'src/app/service/core.service';
import { DatePipe } from '@angular/common';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { ReporteEvaluacionService } from 'src/app/service/Reportes/Evaluacion/reporte-evaluacion.service';
import { ArchivoFTP } from 'src/app/dto/bandeja-preliminar/detalle-preliminar/ArchivoFTP';
import { ArchivoRequest } from 'src/app/dto/request/ArchivoRequest';
import { BOpcionMenuLocalStorage } from 'src/app/dto/core/BOpcionMenuLocalStorage';
import { ListUsrRol } from 'src/app/dto/ListUsrRol';
import { SelectionModel } from '@angular/cdk/collections';
import { UsrRolRequest } from 'src/app/dto/UsrRolRequest';
import { RegistroParticipantesComponent } from '../evaluacion.cmac/registro-participantes/registro-participantes.component';

export interface ProgramaCMAC {
  title: string;
  listaEvaluaciones: ListaEvaluaciones[];
  listaSeleccionadas: ListaEvaluaciones[];
}

@Component({
  selector: 'app-programa-cmac',
  templateUrl: './programa.cmac.component.html',
  styleUrls: ['./programa.cmac.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS_AUNA },
    {
      provide: MatPaginatorIntl,
      useClass: forwardRef(() => MatPaginatorIntlEspanol),
    },
  ],
})
export class ProgramaCmacComponent implements OnInit {
  displayedColumns: string[] = [];

  dataSourceParticipantes: MatTableDataSource<ListUsrRol>;
  selectionParticipante: SelectionModel<ListUsrRol> =
    new SelectionModel<ListUsrRol>(true, []);
  displayedColumnsParticipantes: string[];
  registroGrabado: boolean;
  isLoadingParticipantes: boolean;
  usrRolRequest: UsrRolRequest = new UsrRolRequest();
  listaParticipantes: ListUsrRol[] = [];
  listaParticipantesResponse: [];

  public columnsGrillaParticipantes = [
    {
      codAcceso: ACCESO_EVALUACION.resultadoCMAC.asistio,
      columnDef: 'select',
    },
    {
      codAcceso: ACCESO_EVALUACION.resultadoCMAC.nombres,
      columnDef: 'nombreUsuarioRol',
    },
  ];

  columnsGrilla = [
    {
      codAcceso: ACCESO_EVALUACION.tablaProgramacionCmac.nroSolicitudEva,
      columnDef: 'numeroSolEvaluacion',
    },
    {
      codAcceso: ACCESO_EVALUACION.tablaProgramacionCmac.paciente,
      columnDef: 'paciente',
    },
    {
      codAcceso: ACCESO_EVALUACION.tablaProgramacionCmac.diagnostico,
      columnDef: 'diagnostico',
    },
    {
      codAcceso: ACCESO_EVALUACION.tablaProgramacionCmac.codigoMedicamento,
      columnDef: 'codMac',
    },
    {
      codAcceso: ACCESO_EVALUACION.tablaProgramacionCmac.medicamentoSolicitado,
      columnDef: 'descripcionCmac',
    },
    {
      codAcceso: ACCESO_EVALUACION.tablaProgramacionCmac.eliminar,
      columnDef: 'accion',
    },
  ];

  dataSource: MatTableDataSource<ListaEvaluaciones>;

  txtFechaReunion: number;
  txtHoraReunion: number;
  btnAgregarSolEva: number;
  btnImprimirCasos: number;
  btnGrabar: number;
  btnSalir: number;
  agregarSolicitudBtn: boolean = false;
  nombComite: string;
  disableGrabarReunion: boolean;
  disableRegistrarPartc: boolean;

  flagEvaluacion = FLAG_REGLAS_EVALUACION;
  valorMostrarOpcion = ACCESO_EVALUACION.mostrarOpcion;

  opcionMenu: BOpcionMenuLocalStorage;
  minDate: Date;
  grabarOk: boolean;

  public isLoading: boolean;

  public programarCmacFrmGrp: FormGroup = new FormGroup({
    dateCmacFrmCtrl: new FormControl(null, [Validators.required]),
    horaCmacFrmCtrl: new FormControl(null, [Validators.required]),
  });

  get dateCmacFrmCtrl() {
    return this.programarCmacFrmGrp.get('dateCmacFrmCtrl');
  }
  get horaCmacFrmCtrl() {
    return this.programarCmacFrmGrp.get('horaCmacFrmCtrl');
  }

  public codSolicitudFrmCtrl: FormControl = new FormControl(null, [
    Validators.required,
  ]);

  public disableBtn: boolean;
  public abrirPanel: boolean;
  ListaEvaluacionesRequest: ListaEvaluacionesRequest =
    new ListaEvaluacionesRequest();
  progCmacRequest: ProgramacionCmacRequest = new ProgramacionCmacRequest();
  listaEvaluaciones: ListaEvaluaciones = new ListaEvaluaciones();
  titleInsertar = 'PROGRAMACION CMAC';
  public bloquearBoton: boolean = false;
  numeroSolEvaluacion: string;
  DetalleEvaluacion: ListaEvaluaciones[] = [];
  nrosSolicitudEvaluacion = [];
  // MENSAJES
  mensajes: string;
  mensajes2: string;
  valores: any;
  evaluaciones: ListaEvaluaciones;

  correoRequest: EmailDTO;
  html: any;
  codPaciente;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    private adapter: DateAdapter<any>,
    private coreService: CoreService,
    public dialogRef: MatDialogRef<ProgramaCmacComponent>,
    public dialog: MatDialog,
    private reporteService: ReporteEvaluacionService,
    private detalleSolicitudEvaluacionService: DetalleSolicitudEvaluacionService,
    private bandejaEvaluacionService: BandejaEvaluacionService,
    private correoService: CorreosService,
    private participanteService: ListaFiltroUsuarioRolservice,
    private datePipe: DatePipe,
    private spinnerService: Ng4LoadingSpinnerService,
    @Inject(MAT_DIALOG_DATA) public data: ProgramaCMAC,
    @Inject(UsuarioService) private userService: UsuarioService
  ) {
    this.adapter.setLocale('es-PE');
    this.displayedColumnsParticipantes = [];
  }

  ngOnInit() {
    this.minDate = new Date(this.datePipe.transform(new Date(), 'yyyy/MM/dd'));
    this.isLoading = false;
    this.disableBtn = false;
    this.abrirPanel = false;
    this.grabarOk = false;
    this.isLoadingParticipantes = false;
    this.accesoOpcionMenu();
    this.cargarDatosTabla();
    this.cargarFrmGroup();
    this.listaParticipantesCmac();
    this.definirTablas();
  }
  public crearTablaProgCmac() {
    this.columnsGrilla.forEach((c) => {
      this.opcionMenu.opcion.forEach((element) => {
        if (
          c.codAcceso &&
          c.codAcceso === element.codOpcion &&
          Number(element.flagAsignacion) === ACCESO_EVALUACION.mostrarOpcion
        ) {
          this.displayedColumns.push(c.columnDef);
        }
      });
    });
  }

  public isAllSelected(): boolean {
    const numSelected: number = this.selectionParticipante.selected.length;
    const numRows: number = this.dataSourceParticipantes.data.length;
    return numSelected === numRows;
  }

  public definirTablas(): void {
    this.displayedColumnsParticipantes = [];
    this.columnsGrillaParticipantes.forEach((c) => {
      if (this.flagEvaluacion) {
        this.displayedColumnsParticipantes.push(c.columnDef);
      } else {
        this.opcionMenu.opcion.forEach((element) => {
          if (
            c.codAcceso &&
            c.codAcceso === element.codOpcion &&
            Number(element.flagAsignacion) === ACCESO_EVALUACION.mostrarOpcion
          ) {
            this.displayedColumnsParticipantes.push(c.columnDef);
          }
        });
      }
    });
  }

  public cargarListaParticipantes(): void {
    if (this.listaParticipantes.length > 0) {
      this.dataSourceParticipantes = new MatTableDataSource(
        this.listaParticipantes
      );
    }
  }

  public listaParticipantesCmac() {
    this.dataSourceParticipantes = null;
    this.selectionParticipante = new SelectionModel<ListUsrRol>(true, []);
    this.listaParticipantes = [];

    this.isLoadingParticipantes = true;

    this.usrRolRequest = new UsrRolRequest();
    this.usrRolRequest.codRol = 9;

    let json = {
      codComite: localStorage.getItem('tipoComite'),
    };

    this.participanteService.consultarParticipantesFrecuentes(json).subscribe(
      (data) => {
        if (data['codResultado'] === 0) {
          this.listaParticipantes =
            data['response'] != null ? data['response'] : [];
          this.cargarListaParticipantes();
        } else {
          this.openDialogMensaje(
            MENSAJES.ERROR_NOFUNCION,
            'No se pudo listar a los participantes',
            true,
            false,
            null
          );
        }
        this.isLoadingParticipantes = false;
      },
      (error) => {
        console.error(error);
        this.mensajes =
          'Error al listar el Usuario del Rol Auditor de Pertenencia';
        this.openDialogMensaje(
          MENSAJES.ERROR_SERVICIO,
          this.mensajes,
          true,
          false,
          null
        );
        this.isLoadingParticipantes = false;
      }
    );
  }

  public cargarDatosTabla(): void {
    //this.dataSource = new MatTableDataSource(this.data.listaSeleccionadas);
    this.dataSource = new MatTableDataSource(this.data.listaSeleccionadas);

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  public cargarFrmGroup(): void {
    this.dateCmacFrmCtrl.setValue(
      new Date(this.datePipe.transform(new Date(), 'yyyy/MM/dd'))
    );
    this.horaCmacFrmCtrl.setValue('00:00');
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  public generarListaCasosPDF(vista: boolean): void {
    // TRUE: Imprimir casos - FALSE: Grabar Pdf
    if (this.dateCmacFrmCtrl.invalid) {
      this.mensajes = 'Ingresar fecha para generar el reporte';
      this.openDialogMensaje(
        MENSAJES.ERROR_CAMPOS,
        this.mensajes,
        true,
        false,
        null
      );
      this.dateCmacFrmCtrl.markAsTouched();
      this.isLoading = false;
      this.disableGrabarReunion = false;
      this.disableRegistrarPartc = false;
      return;
    }

    if (this.horaCmacFrmCtrl.invalid) {
      this.mensajes = 'Ingresar la hora para generar el reporte';
      this.openDialogMensaje(
        MENSAJES.ERROR_CAMPOS,
        this.mensajes,
        true,
        false,
        null
      );
      this.horaCmacFrmCtrl.markAsTouched();
      this.isLoading = false;
      this.disableGrabarReunion = false;
      this.disableRegistrarPartc = false;
      return;
    }

    let lista: CasosEvaluar[];

    lista = [];

    for (const i of this.data.listaSeleccionadas) {
      this.nrosSolicitudEvaluacion.push(i.codSolEvaluacion);
      lista.push({
        numSolicitudEvaluacion: i.codSolEvaluacion,
        paciente: i.nombrePaciente,
        diagnostico: i.nombreDiagnostico,
        codigoMedicamento: i.codMac,
        medicamentoSolicitado: i.descripcionCmac,
        fechaMac: i.fechaCmac,
        codAfipaciente: i.codigoPaciente,
      });
    }

    const requestCasosPDF: ListaCasosEvaluacion = {
      fecha: this.datePipe.transform(this.dateCmacFrmCtrl.value, 'dd/MM/yyyy'),
      hora: this.horaCmacFrmCtrl.value,
      listaCasosEvaluar: lista,
    };

    this.bloquearBtn(true);
    this.mensajes = '';
    this.spinnerService.show();
    this.reporteService.getListaCasosEvaluacion(requestCasosPDF).subscribe(
      (response: WsResponse) => {
        if (response.audiResponse.codigoRespuesta === '0') {
          response.data.contentType = 'application/pdf';
          const blob = this.coreService.crearBlobFile(response.data);
          if (!vista) {
            //CUANDO ES FALSE ENVIA EL EMAIL
            this.mensajes += '*El archivo pdf fue generado correctamente.';
            response.data.nomArchivo = `${response.data.nomArchivo}.pdf`;
            response.data.archivoFile = new File(
              [blob],
              `${response.data.nomArchivo}`,
              {
                type: response.data.contentType,
                lastModified: Date.now(),
              }
            );
            this.subirArchivoFTP(response.data);
          } else {
            const link = document.createElement('a');
            link.target = '_blank';
            link.href = window.URL.createObjectURL(blob);
            link.setAttribute('download', response.data.nomArchivo);
            link.click();
          }
          this.spinnerService.hide();
        } else {
          this.bloquearBtn(false);
          this.mensajes = response.audiResponse.mensajeRespuesta;
          this.openDialogMensaje(
            MENSAJES.ERROR_NOFUNCION,
            this.mensajes,
            true,
            false,
            null
          );
          this.spinnerService.hide();
          this.isLoading = false;
        }
      },
      (error) => {
        this.bloquearBtn(false);
        console.error(error);
        const mensaje = MENSAJES.ERROR_SERVICIO;
        this.openDialogMensaje(
          mensaje,
          'Error al generar el Informe Autorizador.',
          true,
          false,
          null
        );
        this.isLoading = false;
      }
    );
  }

  public subirArchivoFTP(archivo: ArchivoFTP) {
    const archivoRequest = new ArchivoRequest();

    archivoRequest.archivo = archivo.archivoFile;
    archivoRequest.nomArchivo = archivo.nomArchivo;
    archivoRequest.ruta = FILEFTP.rutaInformeAutorizador;

    this.spinnerService.show();

    this.coreService.subirArchivo(archivoRequest).subscribe(
      (response: WsResponse) => {
        if (response.audiResponse.codigoRespuesta === '0') {
          this.mensajes +=
            '\n*El Reporte de Casos a Evaluar fue subido correctamente';
          this.registrarProgramacion(response.data);
        } else {
          this.bloquearBtn(false);
          this.mensajes = response.audiResponse.mensajeRespuesta;
          this.openDialogMensaje(
            MENSAJES.ERROR_NOFUNCION,
            this.mensajes,
            true,
            false,
            null
          );
          this.isLoading = false;
        }
        this.spinnerService.hide();
      },
      (error) => {
        this.bloquearBtn(false);
        this.spinnerService.hide();
        console.error(error);
        this.openDialogMensaje(
          MENSAJES.ERROR_SERVICIO,
          'Error al subir el archivo FTP.',
          true,
          false,
          null
        );
        this.isLoading = false;
      }
    );
  }

  public agregarSolicitud(): void {
    this.bloquearBtn(true);
    this.abrirPanel = true;
  }

  public addSolicitud($event): void {
    $event.preventDefault();
    if (this.codSolicitudFrmCtrl.invalid) {
      this.codSolicitudFrmCtrl.markAsTouched();
      return;
    }

    const codigoIngresado = this.codSolicitudFrmCtrl.value;
    let agregado = false;

    this.data.listaSeleccionadas.forEach((evaluacion: ListaEvaluaciones) => {
      if (
        evaluacion.codSolEvaluacion === codigoIngresado ||
        evaluacion.numeroSolEvaluacion === codigoIngresado
      ) {
        this.openDialogMensaje(
          'Evaluación ya se encuentra en la lista:',
          codigoIngresado,
          true,
          false,
          null
        );
        agregado = true;
        return;
      }
    });

    if (agregado) {
      this.codSolicitudFrmCtrl.setValue(null);
      return;
    }
    this.agregarSolicitudBtn = true;
    this.BusquedaXCodigo();
  }

  public cancelar() {
    this.codSolicitudFrmCtrl.setValue(null);
    this.abrirPanel = false;
    this.bloquearBtn(false);
  }

  public bloquearBtn(disable: boolean) {
    this.disableBtn = disable;
    if (disable) {
      this.dateCmacFrmCtrl.disable();
      this.horaCmacFrmCtrl.disable();
    } else {
      this.dateCmacFrmCtrl.enable();
      this.horaCmacFrmCtrl.enable();
    }
  }

  public eliminarEvaluacion(row: ListaEvaluaciones) {
    const index: number = this.data.listaSeleccionadas.findIndex(
      (d) => d === row
    );
    this.data.listaSeleccionadas.splice(index, 1);
    this.cargarDatosTabla();
  }

  public grabarReunionCMAC() {
  this.disableGrabarReunion = true;
  this.disableRegistrarPartc = true;
  this.isLoading = true;
    const dateCmac = this.datePipe.transform(
      this.dateCmacFrmCtrl.value,
      'dd/MM/yyyy'
    );
    const dateActual = this.datePipe.transform(new Date(), 'dd/MM/yyyy');

    var isSomeSelected = this.isSomeSelected();

    if (!isSomeSelected) {
      this.openDialogMensaje(
        'DEBES SELECCIONAR MINIMO A UN PARTICIPANTE',
        null,
        true,
        false,
        null
      );
      this.isLoading = false;
      this.disableGrabarReunion = false;
      this.disableRegistrarPartc = false;
      return;
    }

    if (this.programarCmacFrmGrp.invalid) {
      this.dateCmacFrmCtrl.markAsTouched();
      this.horaCmacFrmCtrl.markAsTouched();
      this.disableGrabarReunion = false;
      this.disableRegistrarPartc = false;
      this.openDialogMensaje(MENSAJES.ERROR_CAMPOS, null, true, false, null);
      return;
      this.isLoading = false;
    }

    this.generarListaCasosPDF(false);
  }

  public registrarProgramacion(archivo: ArchivoFTP) {
    this.progCmacRequest = new ProgramacionCmacRequest();
    this.progCmacRequest.fecha = this.datePipe.transform(
      this.dateCmacFrmCtrl.value,
      'dd/MM/yyyy'
    );
    var codUsuarioValue = this.selectionParticipante.selected.map((e) => {
      return {
        codUsuario: e.codUsuario,
      };
    });

    this.progCmacRequest.hora = this.horaCmacFrmCtrl.value;
    this.progCmacRequest.listaEvaluacion = this.data.listaSeleccionadas;
    this.progCmacRequest.codArchivo = archivo.codArchivo;
    this.progCmacRequest.codComite = localStorage.getItem('tipoComite');
    this.progCmacRequest.listaParticipante = codUsuarioValue;
    this.progCmacRequest.listadoSolEvaluacion = this.nrosSolicitudEvaluacion;

    this.spinnerService.show();

    this.detalleSolicitudEvaluacionService
      .insertarProgramacionCmac(this.progCmacRequest)
      .subscribe(
        (data: WsResponse) => {
          if (data.audiResponse.codigoRespuesta === '0') {
            this.grabarOk = true;
            this.mensajes += '\n*' + data.audiResponse.mensajeRespuesta;

            this.enviarEmailReunionMac(this.data.listaSeleccionadas);
            this.bloquearBtn(true);
          } else if (data.audiResponse.codigoRespuesta !== '0') {
            this.openDialogMensaje(
              data.audiResponse.mensajeRespuesta,
              null,
              true,
              false,
              null
            );
            this.spinnerService.hide();
            this.bloquearBtn(false);
            this.isLoading = false;
          }
        },
        (error) => {
          console.error(error);
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            'Error al listar el Estado de Evaluacion CMAC',
            true,
            false,
            null
          );
          this.spinnerService.hide();
          this.bloquearBtn(false);
          this.isLoading = false;
        }
      );
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
        title: `PROGRAMA COMITE ${localStorage.getItem('nombComite')}`,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }

  public BusquedaXCodigo(): void {
    this.ListaEvaluacionesRequest.codigoEvaluacion =
      this.codSolicitudFrmCtrl.value;
    this.ListaEvaluacionesRequest.codComite =
      localStorage.getItem('tipoComite');
    this.spinnerService.show();
    this.bandejaEvaluacionService
      .consultarXCodigo(this.ListaEvaluacionesRequest)
      .subscribe(
        (response: WsResponse) => {
          if (
            response.audiResponse !== null &&
            response.audiResponse.codigoRespuesta === '0'
          ) {
            this.agregarSolicitudBtn = false;
            this.evaluaciones = new ListaEvaluaciones();
            this.evaluaciones = response.data;
            this.codPaciente = response.data;
            if (response.data.aplCana == 1 && response.data.insCana ==506) {
              if(response.data.codComite == localStorage.getItem('tipoComite')){
                this.data.listaSeleccionadas.push(response.data); // = data.listabandeja;
                this.cargarDatosTabla();
                this.codSolicitudFrmCtrl.setValue(null);
                this.codSolicitudFrmCtrl.markAsUntouched();
              }else{
                this.openDialogMensaje(
                  "Advertencia",
                  `La solicitud ${response.data.numeroSolEvaluacion} no pertenece al mismo comité`,
                  true,
                  false,
                  this.valores
                );
              }
              // if (this.verificarEstadosSolicitudesCMAC()) {

            } else {
              this.openDialogMensaje(
                "Advertencia",
                `La solicitud ${response.data.numeroSolEvaluacion} no ha sido canalizada`,
                true,
                false,
                this.valores
              );
            }
          } else if (response.audiResponse.codigoRespuesta === '1') {
            this.agregarSolicitudBtn = false;
            this.openDialogMensaje(
              '',
              response.audiResponse.mensajeRespuesta,
              true,
              false,
              null
            );
            this.cargarDatosTabla();
          }
          this.spinnerService.hide();
        },
        (error) => {
          console.error(error);
          this.agregarSolicitudBtn = false;
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            'Error al listar las Solicitudes de Evaluacion',
            true,
            false,
            null
          );
          this.spinnerService.hide();
        }
      );
  }

  public verificarEstadosSolicitudesCMAC(): boolean {
    let valido = true;

    let noCtaFechaCMAC = false;
    let noValSolicitud = false;

    if (
      !(
        this.data.listaSeleccionadas[0] &&
        this.data.listaSeleccionadas[0].numeroSolEvaluacion
      )
    ) {
      return;
    }
    const codigoIngresado = this.data.listaSeleccionadas[0].numeroSolEvaluacion;
    if (
      this.evaluaciones.numeroSolEvaluacion === codigoIngresado ||
      this.evaluaciones.numeroSolEvaluacion === codigoIngresado
    ) {
      this.mensajes = MENSAJES.CMAC.ERROR_EVALUACION;
      this.valores = codigoIngresado.substring(0, codigoIngresado.length - 2);
      valido = false;
      return;
    }

    this.mensajes = null;
    this.valores = '';

    let valoresFecha = '';
    if (
      (this.evaluaciones.codigoEstadoEvaluacion === '22' &&
        this.evaluaciones.codigoP === '1') ||
      this.evaluaciones.codigoEstadoEvaluacion === '25'
    ) {
      if (
        this.evaluaciones.fechaCmac === null ||
        this.evaluaciones.fechaCmac.trim() === ''
      ) {
        this.valores = this.valores;
      } else {
        valoresFecha =
          valoresFecha + this.evaluaciones.numeroSolEvaluacion + ', ';
        noCtaFechaCMAC = true;
      }
    } else {
      this.valores =
        this.valores + this.evaluaciones.numeroSolEvaluacion + ', ';
      noValSolicitud = true;
    }

    if (noValSolicitud && noCtaFechaCMAC) {
      this.mensajes = `${MENSAJES.CMAC.ERROR_VALID_SOLIC} y ${MENSAJES.CMAC.ERROR_FECHA_SOLIC}`;
      valoresFecha = valoresFecha.substring(0, valoresFecha.length - 2);
      this.valores = this.valores.substring(0, this.valores.length - 2);
      this.valores = `${this.valores} y ${valoresFecha}`;
      valido = false;
    } else if (noValSolicitud) {
      this.mensajes = MENSAJES.CMAC.ERROR_VALID_SOLIC;
      this.valores = this.valores.substring(0, this.valores.length - 2);
      valido = false;
    } else if (noCtaFechaCMAC) {
      this.mensajes = MENSAJES.CMAC.ERROR_FECHA_SOLIC;
      this.valores = valoresFecha.substring(0, valoresFecha.length - 2);
      valido = false;
    }

    return valido;
  }

  public enviarEmailReunionMac(lista: ListaEvaluaciones[]) {
    let listaSeleccionadaEvaluacion: CasosEvaluar[] = [];
    const req = new ParticipanteRequest();
    req.codRol = ROLES.miembroMac; // MIEMBROS MAC

    const fechaFormato = this.datePipe.transform(
      this.dateCmacFrmCtrl.value,
      'dd/MM/yyyy'
    );
    const hora = this.horaCmacFrmCtrl.value;
    const fechaHora = fechaFormato;
    // + " " + hora

    this.participanteService.listarUsuarioFarmacia(req).subscribe(
      (response: WsResponse) => {
        if (response.audiResponse.codigoRespuesta === '0') {
          // CONSULTO SERVICE QUE TRAE LA DATA
          const correoRequest = new EmailDTO();
          correoRequest.codPlantilla =
            EMAIL.EVALUACION_PROGRAMAR_CMAC.codigoPlantilla;
          correoRequest.fechaProgramada = _moment(new Date()).format(
            'DD/MM/YYYY HH:mm'
          );
          correoRequest.flagAdjunto =
            EMAIL.EVALUACION_PROGRAMAR_CMAC.flagAdjunto;
          correoRequest.tipoEnvio = EMAIL.EVALUACION_PROGRAMAR_CMAC.tipoEnvio;
          correoRequest.usrApp = EMAIL.usrApp;

          this.correoService.generarCorreo(correoRequest).subscribe(
            // DEBERIA A LA VEZ REGISTRAR LA TABLA DE ENVIOS DE CORREOS Y ACTUALIZAR LA TABLA CON ESTADO DE ENVIADO
            (respCorreo: OncoWsResponse) => {
              if (respCorreo.audiResponse.codigoRespuesta === '0') {
                let nomComite = '';
                nomComite = this.data.listaSeleccionadas[0].nombComite;
                let result = '';
                let asuntoNew = '';
                const lista: any = respCorreo.dataList;

                this.html =
                  "<table border='0' cellpadding='0' cellspacing='0' class='grilla'>";
                this.html +=
                  '<tr><th>N° Solicitud de Evaluación</th><th>Paciente</th><th>Diagnóstico</th><th>Código Medicamento</th><th>Medicamento Solicitado</th><th>Fecha Programada de comité</th></tr>';
                for (const i of this.data.listaSeleccionadas) {
                  listaSeleccionadaEvaluacion.push({
                    numSolicitudEvaluacion: i.codSolEvaluacion,
                    paciente: i.nombrePaciente,
                    diagnostico: i.nombreDiagnostico,
                    codigoMedicamento: i.codMac,
                    medicamentoSolicitado: i.descripcionCmac,
                    fechaMac: i.fechaCmac,
                    codAfipaciente: i.codigoPaciente,
                  });
                  this.html +=
                    '<tr><td>' +
                    i.numeroSolEvaluacion +
                    '</td><td>' +
                    i.nombrePaciente +
                    '</td><td>' +
                    i.nombreDiagnostico +
                    '</td><td>' +
                    i.codMac +
                    '</td><td>' +
                    i.descripcionCmac +
                    '</td><td>' +
                    this.datePipe.transform(
                      this.dateCmacFrmCtrl.value,
                      'dd/MM/yyyy'
                    ) +
                    ' ' +
                    this.horaCmacFrmCtrl.value +
                    '</td></tr>';
                }

                this.html += '</table>';
                result += lista[0].cuerpo
                  .toString()
                  .replace('{{grilla}}', this.html)
                  .replace('{{fechaProgramada}}', fechaFormato)
                  .replace('{{nombreComite}}', nomComite);

                asuntoNew += lista[0].asunto
                  .toString()
                  .replace('{{nombreComite}}', nomComite);

                correoRequest.asunto = asuntoNew + ' ' + fechaHora;
                correoRequest.cuerpo = result;
                correoRequest.ruta = '';
                correoRequest.codigoPlantilla = correoRequest.codPlantilla + '';
                correoRequest.codigoEnvio = lista[0].codigoEnvio;
                correoRequest.listaCasosEvaluar = listaSeleccionadaEvaluacion;

                const listaUsuarios = response.data;
                let destinatarioTodos = '';
                // listaUsuarios.forEach((usu) => {
                //   destinatarioTodos += usu.correoElectronico;
                // });

                this.selectionParticipante.selected.forEach((usu) => {
                  destinatarioTodos += usu.correo;
                });

                // listaUsuarios.forEach((usu) => {

                this.selectionParticipante.selected.forEach((usu) => {
                  if (usu.correo != null) {
                    correoRequest.destinatario = usu.correo;
                    this.correoService
                      .finalizarEnvioCorreoReunionMac(correoRequest)
                      .subscribe(
                        (response: OncoWsResponse) => {
                          //this.verConfirmacion("su correo está en proceso de envio", "Envio de correo");
                        },
                        (error) => {
                          console.error(error);
                          this.isLoading = false;
                        }
                      );
                  } else {
                  }
                });
                this.actualizarEstCorreoSolEvaluacion(
                  correoRequest,
                  destinatarioTodos
                );
                //this.openDialogConfirmMensaje(MENSAJES.EVALUACION.EXITO_ENVIAR_CORREO, null, true, false, null);
                this.mensajes += '\n*Se envio los email a los miembros Comite';
                this.openDialogMensaje(
                  'Registro generado',
                  this.mensajes,
                  true,
                  false,
                  null
                );
                this.spinnerService.hide();
                this.isLoading = false;
              } else {
                console.error('Error al generar email' + respCorreo);
                this.mensajes +=
                  '\n*Email miembros MAC: Error al generar correo';
                this.openDialogMensaje(
                  'Registro generado',
                  this.mensajes,
                  true,
                  false,
                  null
                );
                this.spinnerService.hide();
                this.isLoading = false;
              }
            },
            (error) => {
              this.mensajes += '\n*Email miembros MAC: Error al generar correo';
              this.openDialogMensaje(
                'Registro generado',
                this.mensajes,
                true,
                false,
                null
              );
              this.spinnerService.hide();
              this.isLoading = false;
            }
          );
        } else {
          this.mensajes += '\n*Email miembros MAC: Error al listar miembros';
          this.openDialogMensaje(
            'Registro generado',
            this.mensajes,
            true,
            false,
            null
          );
          this.spinnerService.hide();
          this.isLoading = false;
        }
      },
      (error) => {
        console.error(error);
        this.mensajes += '\n*Email miembros MAC: Error al listar miembros';
        this.openDialogMensaje(
          'Registro generado',
          this.mensajes,
          true,
          false,
          null
        );
        this.spinnerService.hide();
        this.isLoading = false;
      }
    );
  }

  public masterToggle(): void {
    if (this.isSomeSelected()) {
      this.selectionParticipante.clear();
    } else {
      this.isAllSelected()
        ? this.selectionParticipante.clear()
        : this.dataSourceParticipantes.data.forEach((row: ListUsrRol) =>
            this.selectionParticipante.select(row)
          );
    }
  }

  public isSomeSelected(): boolean {
    return this.selectionParticipante.selected.length > 0;
  }

  public verConfirmacion(message: string, titulo: string): void {
    const dialogRef = this.dialog.open(MessageComponent, {
      width: '400px',
      disableClose: true,
      data: {
        title: titulo,
        message: message,
        message2: null,
        alerta: true,
        confirmacion: false,
        valor: null,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result != null) {
        if (result === 1) {
          //DESEA MANTENER SIN REGISTRO EL MARCADOR 1=>SI 0=>NO
        } else {
        }
      }
    });
  }

  public actualizarEstCorreoSolEvaluacion(req: EmailDTO, dest: string) {
    let reqCorreoPart: EmailDTO = JSON.parse(JSON.stringify(req));
    reqCorreoPart.destinatario = dest;

    this.correoService
      .actualizarEstCorreoSolEvaluacion(reqCorreoPart)
      .subscribe(
        (response: WsResponse) => {},
        (error) => {
          console.error(error);
        }
      );
  }

  public accesoOpcionMenu() {
    const data = require('src/assets/data/permisosRecursos.json');
    const programcionCmac = data.bandejaEvaluacion.programacionCmac;
    this.opcionMenu = JSON.parse(localStorage.getItem('opcionMenu'));

    if (this.opcionMenu.opcion.length > 0) {
      this.opcionMenu.opcion.forEach((element) => {
        const codOpcion = element.codOpcion;
        switch (codOpcion) {
          case programcionCmac.txtFechaReunion:
            this.txtFechaReunion = Number(element.flagAsignacion);
            break;
          case programcionCmac.txtHoraReunion:
            this.txtHoraReunion = Number(element.flagAsignacion);
            break;
          case programcionCmac.btnAgregarSolEva:
            this.btnAgregarSolEva = Number(element.flagAsignacion);
            break;
          case programcionCmac.btnImprimirCasos:
            this.btnImprimirCasos = Number(element.flagAsignacion);
            break;
          case programcionCmac.btnGrabar:
            this.btnGrabar = Number(element.flagAsignacion);
            break;
          case programcionCmac.btnSalir:
            this.btnSalir = Number(element.flagAsignacion);
            break;
        }
      });
    }

    this.crearTablaProgCmac();
  }

  openDiaRegistroParticipantes($event: Event) {
    $event.preventDefault();
    const dialogEvaCmac = this.dialog.open(RegistroParticipantesComponent, {
      disableClose: true,
      width: '850px',
      data: {
        title: 'REGISTRAR RESULTADO EVALUACIÓN COMITE',
      },
    });
    dialogEvaCmac.afterClosed().subscribe((result) => {
      if (result === 1) {
        this.dialogRef.close();
      } else if (result !== undefined) {
        this.listaParticipantes.push(result);
        this.cargarListaParticipantes();
        this.selectionParticipante.select(
          this.dataSourceParticipantes.data[
            this.dataSourceParticipantes.data.length - 1
          ]
        );
      }
    });
  }
}
