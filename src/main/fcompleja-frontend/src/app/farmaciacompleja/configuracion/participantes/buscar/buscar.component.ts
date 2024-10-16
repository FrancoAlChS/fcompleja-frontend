import { Component, ViewChild, AfterViewInit, Inject } from '@angular/core';
import { MatDialogRef, MatPaginator, MatDialog, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { PAG_OBT_SMALL, PAG_SIZ_SMALL, SOLO_NUMEROS, SOLO_LETRAS_ESPACIOS, MENSAJES, keyCodeEnter, COD_APLICACION_FC } from 'src/app/common';
import {merge, of as observableOf} from 'rxjs';
import { startWith, switchMap, map, catchError } from 'rxjs/operators';
import { BuscarUsuarioRequest } from 'src/app/dto/request/BuscarUsuarioRequest';
import { UsuarioMantenimientoService } from 'src/app/service/Configuracion/usuario.service';
import { MessageComponent } from 'src/app/core/message/message.component';
import { WsResponse } from 'src/app/dto/WsResponse';
import { WsResponseOnco } from 'src/app/dto/WsResponseOnco';

export interface dataOpenDialog {
  codRol : string
}

@Component({
  selector: 'app-busqueda',
  templateUrl: './buscar.component.html'
})
export class BuscarUsuarioComponent implements AfterViewInit {
  
  pageSize:number = PAG_SIZ_SMALL;
  pageSizeOptions:number[] = PAG_OBT_SMALL;

  titulo: string = "BÚSQUEDA DE USUARIO";

  usuarioForm: FormGroup;
  diagnosticoSubmitted = false;
  usuarioFormMessages = {
    'codigo': [
      { type: 'pattern', message: 'Solo dígitos' },
      { type: 'minlength', message: 'La longitud tiene que ser de 8 dígitos.'},
      { type: 'maxlength', message: 'La longitud tiene que ser de 8 dígitos.'},
    ],
    'paterno': [
        { type: 'pattern', message: 'Solo letras' },
        { type: 'minlength', message: 'La longitud mínima es de 2.'},
        { type: 'maxlength', message: 'La longitud máxima es de 20.'},
    ],
    'materno': [
        { type: 'pattern', message: 'Solo letras' },
        { type: 'minlength', message: 'La longitud mínima es de 2.'},
        { type: 'maxlength', message: 'La longitud máxima es de 20.'},
    ],
    'nombre': [
        { type: 'pattern', message: 'Solo letras' },
        { type: 'minlength', message: 'La longitud mínima es de 2.'},
        { type: 'maxlength', message: 'La longitud máxima es de 20.'},
    ],
  };
  diagnosticoBtnOpts: MatProgressButtonOptions = {
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

  displayedColumns: string[] = ['codigo', 'nombre'];
  dataSource: any[] = [];
  buscarUsuarioRequest: BuscarUsuarioRequest = new BuscarUsuarioRequest();

  resultsLength = 0;
  isLoadingResults = false;
  isRateLimitReached = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
      public dialogRef: MatDialogRef<BuscarUsuarioComponent>,
      private usuarioService: UsuarioMantenimientoService,
      public dialog: MatDialog,
      @Inject(MAT_DIALOG_DATA) public data: dataOpenDialog,
  ) {
      this.usuarioForm = new FormGroup({
          'codigo': new FormControl(null, [Validators.pattern(SOLO_NUMEROS), Validators.minLength(8), Validators.maxLength(8)]),
          'paterno': new FormControl(null, [Validators.pattern(SOLO_LETRAS_ESPACIOS), Validators.minLength(2), Validators.maxLength(20)]),
          'materno': new FormControl(null, [Validators.pattern(SOLO_LETRAS_ESPACIOS), Validators.minLength(2), Validators.maxLength(20)]),
          'nombre': new FormControl(null, [Validators.pattern(SOLO_LETRAS_ESPACIOS), Validators.minLength(2), Validators.maxLength(20)]),
      });
  }

  ngAfterViewInit() {
    
  }

  get fc() { return this.usuarioForm.controls; }

  accionUsuario(){
    if (this.usuarioForm.invalid) {
      return;
    }

    this.isLoadingResults = true;
    this.dataSource = [];
    this.resultsLength = 0;
    
    this.buscarUsuarioRequest.codAplicacion = String(COD_APLICACION_FC);
    this.buscarUsuarioRequest.codRol = this.data.codRol;
    this.buscarUsuarioRequest.usuario = this.usuarioForm.get('codigo').value;
    this.buscarUsuarioRequest.apePate = this.usuarioForm.get('paterno').value;
    this.buscarUsuarioRequest.apeMate = this.usuarioForm.get('materno').value;
    this.buscarUsuarioRequest.nombres = this.usuarioForm.get('nombre').value;
    
    this.usuarioService
    .buscarUsuario(this.buscarUsuarioRequest)
    .subscribe(
      (response: WsResponseOnco) => {
        this.isLoadingResults = false;
        if (response.audiResponse.codigoRespuesta != '0'){
            this.openDialogMensaje(MENSAJES.ERROR_SERVICIO, 'Error al Buscar Usuario', true, false, null);
        }else{
          if ( response.dataList ) {
            this.dataSource = response.dataList;
            this.resultsLength = this.dataSource.length;
          }
        }
      },
      error => {
        this.isLoadingResults = false;
        console.error(error);
        this.openDialogMensaje(MENSAJES.ERROR_SERVICIO, 'Error al Buscar Usuario', true, false, null);
      }
    );
  }

  seleccionarDiagnostico(element){
    this.dialogRef.close(element);
  }

  onDialogClose(): void {
    this.dialogRef.close();
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
        title: MENSAJES.CONF.PARTICIPANTE_SISTEMA,
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
