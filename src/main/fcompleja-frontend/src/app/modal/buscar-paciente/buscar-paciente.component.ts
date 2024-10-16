import { Component, OnInit, ViewChild, forwardRef } from '@angular/core';
import { MatDialogRef, MatSort, MatPaginator, MatTableDataSource, MatDialog, MatPaginatorIntl } from '@angular/material';
import { PacienteService } from 'src/app/service/paciente.service';
import { PacienteRequest } from 'src/app/dto/PacienteRequest';
import { Paciente } from 'src/app/dto/Paciente';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { WsResponseOnco } from 'src/app/dto/WsResponseOnco';
import { TIPOBUSQUEDA, MENSAJES, GRUPO_PARAMETRO, SOLO_NUMEROS,SOLO_NUMEROS_LETRAS, TIPO_DOCUMENTO } from '../../common';
import { MessageComponent } from 'src/app/core/message/message.component';
import { Parametro } from 'src/app/dto/Parametro';
import { MatPaginatorIntlEspanol } from 'src/app/directives/matpaginator-translate';
import { ListaPcteRequest } from 'src/app/dto/ListaPcteRequest';
import { ParametroBeanRequest } from 'src/app/dto/ParametroBeanRequest';
import { ParametroService } from 'src/app/service/cross/parametro.service';

@Component({
  selector: 'app-buscar-paciente',
  templateUrl: './buscar-paciente.component.html',
  styleUrls: ['./buscar-paciente.component.scss'],
  providers: [{
    provide: MatPaginatorIntl, useClass: forwardRef(() => MatPaginatorIntlEspanol)
  }]
})
export class BuscarPacienteComponent implements OnInit {

  pacienteRequest: ListaPcteRequest;
  cmbTipoDocumento: Parametro[];
  mensaje: string;
  mensaje2: string;

  mensajeApePate: string;

  nroPcteFrmGrp: FormGroup = new FormGroup({
    tipoDocFrmCtrl: new FormControl(null, [Validators.required]),
    nroDocuFrmCtrl: new FormControl(null, [Validators.required])
  });

  datosPcteFrmGrp: FormGroup = new FormGroup({
    apelPateFrmCtrl: new FormControl(null,[Validators.required]),
    apelMateFrmCtrl: new FormControl(null),
    nombresFrmCtrl: new FormControl(null,[Validators.required])
  });

  get tipoDocFrmCtrl() { return this.nroPcteFrmGrp.get('tipoDocFrmCtrl'); }
  get nroDocuFrmCtrl() { return this.nroPcteFrmGrp.get('nroDocuFrmCtrl'); }
  get apelPateFrmCtrl() { return this.datosPcteFrmGrp.get('apelPateFrmCtrl'); }
  get apelMateFrmCtrl() { return this.datosPcteFrmGrp.get('apelMateFrmCtrl'); }
  get nombresFrmCtrl() { return this.datosPcteFrmGrp.get('nombresFrmCtrl'); }

  // Tabla
  dataSource: MatTableDataSource<Paciente>;
  listaPacientes: Paciente[];
  listaPac: Paciente = new Paciente();
  isLoading: boolean;
  displayedColumns: string[];
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  columnsGrilla = [{
    columnDef: 'rn',
    header: 'N°',
    cell: (pcte: Paciente) => `${pcte.rn}`
  },
  {
    columnDef: 'tipdoc',
    header: 'Tipo Documento',
    cell: (pcte: Paciente) => `${pcte.tipdoc}`
  }, {
    columnDef: 'numdoc',
    header: 'Nro Documento',
    cell: (pcte: Paciente) => `${pcte.numdoc}`
  },
  // {
  //   columnDef: 'codafir',
  //   header: 'CÓDIGO',
  //   cell: (pcte: Paciente) => `${pcte.codafir}`
  // }, 
  {
    columnDef: 'apepat',
    header: 'APELLIDO PATERNO',
    cell: (pcte: Paciente) => `${pcte.apepat}`
  }, {
    columnDef: 'apemat',
    header: 'APELLIDO MATERNO',
    cell: (pcte: Paciente) => `${pcte.apemat}`
  }, {
    columnDef: 'nombr1',
    header: 'NOMBRES',
    cell: (pcte: Paciente) => `${pcte.nombr1}` + ((pcte.nombr2 !== null) ? ` ${pcte.nombr2}` : '')
  }];
  btnBuscarPaciente: boolean;
  spinnerTipoDocumento:boolean = true;
  listaTipoDocumento:any[] = [];
  pacienteFormMessages = {
    'numeroDocumento': [],
    'apellidoPaterno': [],
    'apellidoMaterno': [],
    'nombres': []
  }

  constructor(private dialog: MatDialog,
    private dialogRef: MatDialogRef<BuscarPacienteComponent>,
    private pacienteService: PacienteService,
    private parametroService: ParametroService) { }

  nombreCompleto: string;
  ngOnInit() {
    this.inicializarVariables();
    this.crearTablaPacientes();
    this.cargarParametro();
  }

  get fc() { return this.nroPcteFrmGrp.controls; }

  get fc2() { return this.datosPcteFrmGrp.controls; }

  cargarParametro() {
    var parametroRequest : ParametroBeanRequest = new ParametroBeanRequest();
    parametroRequest.codGrupoParametro = GRUPO_PARAMETRO.tipoDocumento;
    this.parametroService.buscarParametro(parametroRequest).subscribe(
        (respuesta: WsResponseOnco) => {
            
            this.spinnerTipoDocumento = false;
            if (respuesta.audiResponse.codigoRespuesta === '0') {
                this.listaTipoDocumento = respuesta.dataList;
            } else {
                console.error(respuesta.audiResponse.mensajeRespuesta);
            }
        },
        error => {
            this.spinnerTipoDocumento = false;
            console.error('Error al Buscar Tipo Documento');
        }
    );
  }

  cambioInputApelPate(){
    this.datosPcteFrmGrp.get('apelPateFrmCtrl').setValidators([
      Validators.required,
      //Validators.pattern(MINIMO_LETRAS),
      Validators.minLength(3),
    ]);
    this.pacienteFormMessages.apellidoPaterno = [
      { type: 'pattern', message: 'mínimo 3 caracteres' },
      { type: 'minlength', message: 'mínimo 3 caracteres' },
    ];

  }

  cambioInputApelMate(){
    this.datosPcteFrmGrp.get('apelMateFrmCtrl').setValidators([
      //Validators.pattern(MINIMO_LETRAS),
      Validators.minLength(3),
    ]);
    this.pacienteFormMessages.apellidoMaterno = [
      { type: 'pattern', message: 'mínimo 3 caracteres' },
      { type: 'minlength', message: 'mínimo 3 caracteres' },
    ];
  }

  cambioInputNombres(){
    this.datosPcteFrmGrp.get('nombresFrmCtrl').setValidators([
      Validators.required,
      Validators.minLength(3),
    ]);
    this.pacienteFormMessages.nombres = [
      { type: 'pattern', message: 'mínimo 3 caracteres' },
      { type: 'minlength', message: 'mínimo 3 caracteres' },
    ];
  }


  cambioTipDoc(){
    var tipDoc = this.nroPcteFrmGrp.get('tipoDocFrmCtrl').value;
    switch(tipDoc) {
      case TIPO_DOCUMENTO.DNI:
        this.nroPcteFrmGrp.get('nroDocuFrmCtrl').setValidators([
            Validators.required,
            Validators.pattern(SOLO_NUMEROS),
            Validators.minLength(8),
            Validators.maxLength(8),
        ]);
        this.pacienteFormMessages.numeroDocumento = [
          { type: 'pattern', message: 'Solo números' },
          { type: 'minlength', message: 'Solo 8 números' },
          { type: 'maxlength', message: 'Solo 8 números' },
        ];
        break;
      case TIPO_DOCUMENTO.PAS:
        this.nroPcteFrmGrp.get('nroDocuFrmCtrl').setValidators([
            Validators.required,
            Validators.pattern(SOLO_NUMEROS_LETRAS),
            Validators.maxLength(12),
        ]);
        this.pacienteFormMessages.numeroDocumento = [
            { type: 'pattern', message: 'Solo números y letras' },
            { type: 'maxlength', message: 'Solo 12 caracteres como máximo' },
        ];
        break;
      case TIPO_DOCUMENTO.CE:
        this.nroPcteFrmGrp.get('nroDocuFrmCtrl').setValidators([
            Validators.required,
            Validators.pattern(SOLO_NUMEROS_LETRAS),
            Validators.maxLength(12),
        ]);
        this.pacienteFormMessages.numeroDocumento = [
            { type: 'pattern', message: 'Solo números y letras' },
            { type: 'maxlength', message: 'Solo 12 caracteres como máximo' },
        ];
        break;
      case TIPO_DOCUMENTO.PN:
        this.nroPcteFrmGrp.get('nroDocuFrmCtrl').setValidators([
            Validators.required,
            Validators.pattern(SOLO_NUMEROS_LETRAS),
            Validators.maxLength(15),
        ]);
        this.pacienteFormMessages.numeroDocumento = [
            { type: 'pattern', message: 'Solo números y letras' },
            { type: 'maxlength', message: 'Solo 15 caracteres como máximo' },
        ];
        break;
      default:
        // code block
    }
    this.nroPcteFrmGrp.get('nroDocuFrmCtrl').updateValueAndValidity();
  }

  public inicializarVariables(): void {
    this.listaPacientes = [];
    this.pacienteRequest = new ListaPcteRequest();
    this.cmbTipoDocumento = [];

    this.cmbTipoDocumento = [{
      codigoParametro: null,
      nombreParametro: '-- Seleccionar Tipo Documento --',
      valor1Parametro: null,
      codigoExterno: null
    }, {
      codigoParametro: '01',
      nombreParametro: 'DNI',
      valor1Parametro: null,
      codigoExterno: null
    }, {
      codigoParametro: '02',
      nombreParametro: 'CE',
      valor1Parametro: null,
      codigoExterno: null
    },
    {
      codigoParametro: '03',
      nombreParametro: 'PASAPORTE',
      valor1Parametro: null,
      codigoExterno: null
    },
    {
      codigoParametro: '04',
      nombreParametro: 'PARTIDA DE NACIMIENTO',
      valor1Parametro: null,
      codigoExterno: null
    }];
  }

  public crearTablaPacientes(): void {
    this.dataSource = null;
    this.isLoading = false;
    this.displayedColumns = [];
    this.columnsGrilla.forEach(c => {
      this.displayedColumns.push(c.columnDef);
    });
  }

  public cargarTablaPacientes(): void {
    if (this.listaPacientes.length > 0) {
      this.dataSource = new MatTableDataSource(this.listaPacientes);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
    this.btnBuscarPaciente=false;
  }

  public validarCampos(): boolean {
    this.limpiarControles('all');
    let valido = false;
    let invGrpNro = false;
    let invGrpDatos = false;

    this.pacienteRequest = new ListaPcteRequest();
    this.mensaje = null;
    this.mensaje2 = null;

    
    

    if (this.nroPcteFrmGrp.invalid && this.datosPcteFrmGrp.invalid) {
      this.mensaje = 'Falta ingresar los filtros de búsqueda.';
      this.mensaje2 = 'Tipo Documento y Nro Documento ó Apellidos y Nombres Completos';
      return false;
    }

    this.pacienteRequest.ini = TIPOBUSQUEDA.Afiliado.inicial;
    this.pacienteRequest.fin = TIPOBUSQUEDA.Afiliado.final;

    if (this.nroPcteFrmGrp.valid && this.datosPcteFrmGrp.invalid) {
      this.pacienteRequest.tipdoc = this.tipoDocFrmCtrl.value.trim();
      this.pacienteRequest.numdoc = this.nroDocuFrmCtrl.value.trim();
      return true;
    } else {
      invGrpNro = true;
    }

    
    
    
    
    
    
    

    if(this.nroPcteFrmGrp.invalid && this.datosPcteFrmGrp.valid){
      this.pacienteRequest.apemat = (this.apelMateFrmCtrl.value)?this.apelMateFrmCtrl.value.trim():null;
      this.pacienteRequest.nombr1 = this.nombresFrmCtrl.value.trim();
      this.pacienteRequest.apepat = this.apelPateFrmCtrl.value.trim();
      return true;
    }else {
      invGrpDatos = true;
    }

    
    
    

    // if((this.apelPateFrmCtrl.value && this.nombresFrmCtrl.value && this.apelMateFrmCtrl.value == null) || (this.apelPateFrmCtrl.value && this.nombresFrmCtrl.value && this.apelMateFrmCtrl.value == '')){
    //   this.pacienteRequest.apepat = this.apelPateFrmCtrl.value.trim();
    //   this.pacienteRequest.nombr1 = this.nombresFrmCtrl.value.trim();
    //   return true
    // }else if(this.apelMateFrmCtrl.value && this.nombresFrmCtrl.value && this.apelPateFrmCtrl.value){
    //   this.pacienteRequest.apemat = this.apelMateFrmCtrl.value.trim();
    //   this.pacienteRequest.nombr1 = this.nombresFrmCtrl.value.trim();
    //   this.pacienteRequest.apepat = this.apelPateFrmCtrl.value.trim();
    //   return true
    // }
    // else{
    //   invGrpDatos = true;
    // }






    if (invGrpNro && !invGrpDatos) {
      
      this.mensaje2 = 'TIPO Y NUMERO DE DOCUMENTO';
      this.mensaje = MENSAJES.ERROR_CAMPOS;
      this.nroDocuFrmCtrl.markAsTouched();
      this.tipoDocFrmCtrl.markAsTouched();
      valido = false;
    } 
    else {
      this.mensaje = MENSAJES.ERROR_CAMPOS;
      this.mensaje2 = 'APELLIDO PATERNO Y NOMBRES';
      this.apelPateFrmCtrl.markAsTouched();
      this.apelPateFrmCtrl.markAsTouched();
      this.nombresFrmCtrl.markAsTouched();
      valido = false;
    }

    return valido;


    // this.pacienteRequest.ini = TIPOBUSQUEDA.Afiliado.inicial;
    // this.pacienteRequest.fin = TIPOBUSQUEDA.Afiliado.final;

    // if (this.nroPcteFrmGrp.valid && this.datosPcteFrmGrp.invalid) {
    //   this.pacienteRequest.tipdoc = this.tipoDocFrmCtrl.value.trim();
    //   this.pacienteRequest.numdoc = this.nroDocuFrmCtrl.value.trim();
    //   return true;
    // } else {
    //   invGrpNro = true;
    // }

    // 
    // 
    // 
    // 
    // 

    

    // if((this.apelPateFrmCtrl.value && this.nombresFrmCtrl.value && this.apelMateFrmCtrl.value == null) || (this.apelPateFrmCtrl.value && this.nombresFrmCtrl.value && this.apelMateFrmCtrl.value == '')){
    //   this.pacienteRequest.apepat = this.apelPateFrmCtrl.value.trim();
    //   this.pacienteRequest.nombr1 = this.nombresFrmCtrl.value.trim();
    //   return true
    // }else if(this.apelMateFrmCtrl.value && this.nombresFrmCtrl.value && this.apelPateFrmCtrl.value){
    //   this.pacienteRequest.apemat = this.apelMateFrmCtrl.value.trim();
    //   this.pacienteRequest.nombr1 = this.nombresFrmCtrl.value.trim();
    //   this.pacienteRequest.apepat = this.apelPateFrmCtrl.value.trim();
    //   return true
    // }
    // else{
    //   invGrpDatos = true;
    // }







    // if (invGrpNro && !invGrpDatos) {
    //   
    //   this.mensaje2 = 'APELLIDO PATERNO Y NOMBRES';
    //   this.mensaje = MENSAJES.ERROR_CAMPOS;
    //   this.nroDocuFrmCtrl.markAsTouched();
    //   this.tipoDocFrmCtrl.markAsTouched();
    //   valido = false;
    // } 
    // else {
    //   this.mensaje = MENSAJES.ERROR_CAMPOS;
    //   this.mensaje2 = 'TIPO Y NUMERO DE DOCUMENTO O APELLIDO PATERNO Y NOMBRES';
    //   this.apelPateFrmCtrl.markAsTouched();
    //   this.apelPateFrmCtrl.markAsTouched();
    //   this.nombresFrmCtrl.markAsTouched();
    //   valido = false;
    // }

    // return valido;

    
  }

  public limpiarControles(tipo: string): void {
    switch (tipo) {
      case 'all':
        /*this.nroDocuFrmCtrl.markAsUntouched();
        this.tipoDocFrmCtrl.markAsUntouched();*/
        this.apelPateFrmCtrl.markAsUntouched();
        this.apelPateFrmCtrl.markAsUntouched();
        this.nombresFrmCtrl.markAsUntouched();
        break;
      case 'nroDoc':
        this.nroDocuFrmCtrl.markAsUntouched();
        this.tipoDocFrmCtrl.markAsUntouched();
        break;
      case 'datos':
        this.apelPateFrmCtrl.markAsUntouched();
        this.apelPateFrmCtrl.markAsUntouched();
        this.nombresFrmCtrl.markAsUntouched();
        break;
    }
  }

  public buscarPaciente($event: Event): void {
    this.btnBuscarPaciente=true;
    $event.preventDefault();
    if (this.validarCampos()) {
      this.isLoading = true;
      this.dataSource = null;
      this.listaPacientes = [];
      
      this.pacienteService.listaPaciente(this.pacienteRequest)
        .subscribe((data: WsResponseOnco) => {
          if (data.audiResponse.codigoRespuesta === '0') {
            this.listaPacientes = (data.dataList !== null) ? data.dataList : [];
            this.cargarTablaPacientes();
          } else {
            this.mensaje = data.audiResponse.mensajeRespuesta;
            this.openDialogMensaje(this.mensaje, null, true, false, null);
            this.btnBuscarPaciente=false;
          }
          this.isLoading = false;
        },
          error => {
            console.error(error);
            this.mensaje = MENSAJES.ERROR_SERVICIO + '. Buscar Paciente';
            this.openDialogMensaje(this.mensaje, null, true, false, null);
            this.isLoading = false;
          }
        );
    } else {
      this.isLoading = false;
      this.openDialogMensaje(this.mensaje, this.mensaje2, true, false, null);
      this.btnBuscarPaciente=false;
    }
  }

  public seleccionarFila(row: Paciente): void {
    this.dialogRef.close(row);
  }

  public opcionSalir(): void {
    this.dialogRef.close(null);
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
        title: 'BUSCAR PACIENTE',
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

}
