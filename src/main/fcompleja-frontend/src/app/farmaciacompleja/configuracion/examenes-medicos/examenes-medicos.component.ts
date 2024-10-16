import { Component, AfterViewInit, ViewChild, forwardRef, OnInit } from '@angular/core';
import { PAG_SIZ_SMALL, PAG_OBT_SMALL, MENSAJES, MY_FORMATS_AUNA } from 'src/app/common';
import { MatPaginator, MatDialog, MatTableDataSource, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatPaginatorIntl, MatSort } from '@angular/material';
import { MarcadorService } from 'src/app/service/Configuracion/marcador.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { ConfiguracionService } from 'src/app/service/configuracion.service';
import { MessageComponent } from 'src/app/core/message/message.component';
import { WsResponse } from 'src/app/dto/WsResponse';
import { ExamenMedico } from 'src/app/dto/ExamenMedico';
import { RegistrarExamenMedicoComponent } from './registrar/registrar.component';
import { EditarExamenMedicoComponent } from './editar/editar.component';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { MatPaginatorIntlEspanol } from 'src/app/directives/matpaginator-translate';


@Component({
  selector: 'app-examenes-medicos',
  templateUrl: './examenes-medicos.component.html',
  styleUrls: ['./examenes-medicos.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS_AUNA },
    { provide: MatPaginatorIntl, useClass: forwardRef(() => MatPaginatorIntlEspanol) }
  ]
})
export class ExamenesMedicosComponent implements AfterViewInit, OnInit {

  // TABLA
  pageSize:number = PAG_SIZ_SMALL;
  pageSizeOptions:number[] = PAG_OBT_SMALL;

  displayedColumns: string[] = ['codExamenMedLargo', 'descripcion', 'examen', 'tipoIngreso',
                                'unidadMedida', 'rango', 'estado', 'opciones'];
  //dataSource: Marcador[] = [];
  dataSource = new MatTableDataSource<ExamenMedico>([]);

  resultsLength = 0;
  isLoadingResults = false;
  isRateLimitReached = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;


  // FORMULARIO
  marcadorForm: FormGroup;
  marcadorSubmitted = false;
  marcadorFormMessages = {};
  marcadorBtnOpts: MatProgressButtonOptions = {
    active: false,
    text: 'BUSCAR',
    spinnerSize: 19,
    raised: true,
    stroked: false,
    buttonColor: 'primary',
    spinnerColor: 'accent',
    fullWidth: false,
    disabled: false,
    mode: 'indeterminate',
  };

  spinnerGrupo:boolean = true;
  listaGrupo: any[] = [];
  btnBuscar: boolean;


  marcadorRequest: ExamenMedico = new ExamenMedico();

  constructor(
    //public dialogRef: MatDialogRef<ExamenesMedicosComponent>,
    //@Inject(MAT_DIALOG_DATA) public data: DialogMarcadoresData,
    public dialog: MatDialog,
    private marcadorService: MarcadorService,
    public confService: ConfiguracionService
  ) {
    this.marcadorForm = new FormGroup({
      'descripcion': new FormControl(null, [])
    });
    
  }

  ngAfterViewInit(): void { }

  ngOnInit(){
    this.cargarParametro();
  }

  get fc() { return this.marcadorForm.controls; }

  /*public onClose(): void {
    this.dialogRef.close(null);
  }*/

  public cargarParametro(): void {
    this.btnBuscar = true;
    this.marcadorBtnOpts.active = true;

    this.isLoadingResults = true;

    this.dataSource.data = [];

    var examenRequest:ExamenMedico = new ExamenMedico;
    examenRequest.descripcion = this.marcadorForm.get('descripcion').value;

    this.marcadorService.
    listarExamenMedico(examenRequest)
    .subscribe(
      (respuesta: WsResponse) => {
        this.marcadorBtnOpts.active = false;
        this.isLoadingResults = false;
        if (respuesta.audiResponse.codigoRespuesta != '0'){
          console.error('Error al listar Exámen Médico');
          this.openDialogMensaje(MENSAJES.ERROR_SERVICIO, 'Error al listar Exámen Médico', true, false, null);
        }else{
          var auxData = respuesta.data;
          auxData = auxData.map(function(obj){
            obj.tipoIngreso = (obj.lExamenMedicoDetalle[0])?obj.lExamenMedicoDetalle[0].tipoIngresoResultado:null;
            obj.unidadMedida = (obj.lExamenMedicoDetalle[0] && obj.lExamenMedicoDetalle[0].unidadMedida)?obj.lExamenMedicoDetalle[0].unidadMedida:null;
            obj.rango = (obj.lExamenMedicoDetalle[0] && obj.lExamenMedicoDetalle[0].rango)?obj.lExamenMedicoDetalle[0].rango:null;
            return obj;
          });
          this.dataSource.data = auxData;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.resultsLength = auxData.length;
          this.btnBuscar = false;
        }
      },
      error => {
        this.marcadorBtnOpts.active = false;
        this.isLoadingResults = false;
        console.error(error);
        this.openDialogMensaje(MENSAJES.ERROR_SERVICIO, 'Error al listar Exámen Médico', true, false, null);
      }
    );
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
        title: MENSAJES.CONF.EXAMEN_MEDICO,
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

  accionMarcador() {
    this.marcadorSubmitted = true;

    if (this.marcadorForm.invalid) {
      return;
    }

    this.cargarParametro();
  }

  openRegistrarMarcador(): void {
    const dialogRef = this.dialog.open(RegistrarExamenMedicoComponent, {
      width: '640px',
      disableClose: true,
      autoFocus: false,
      data: { }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.accionMarcador();
      }
    });
  }

  openEditarMarcador(marcador): void {
    const dialogRef = this.dialog.open(EditarExamenMedicoComponent, {
      width: '640px',
      disableClose: true,
      autoFocus: false,
      data: {
        examen: marcador
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.accionMarcador();
      }
    });
  }

}
