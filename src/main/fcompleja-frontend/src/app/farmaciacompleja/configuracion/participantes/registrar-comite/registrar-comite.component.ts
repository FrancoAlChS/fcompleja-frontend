import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material';
import { MatProgressButtonOptions } from 'mat-progress-buttons';
import { MENSAJES } from 'src/app/common';
import { MessageComponent } from 'src/app/core/message/message.component';
import { MarcadorService } from 'src/app/service/Configuracion/marcador.service';

@Component({
  selector: 'app-registrar-comite',
  templateUrl: './registrar-comite.component.html',
  styleUrls: ['./registrar-comite.component.scss']
})
export class RegistrarComiteComponent implements OnInit {

  comiteRegistrarForm: FormGroup;
  titulo: string;
  flagRegistro:boolean = false;
  
  comiteBtnOpts: MatProgressButtonOptions = {
    active: false,
    text: 'GUARDAR',
    spinnerSize: 19,
    raised: true,
    stroked: false,
    buttonColor: 'primary',
    spinnerColor: 'accent',
    fullWidth: false,
    disabled: false,
    mode: 'indeterminate',
};

  resultAutorizador: any[] = [{
    codigo: 507,
    titulo: 'Activo',
    selected: false
  }, {
    codigo: 508,
    titulo: 'Inactivo',
    selected: false
  }];

  

  constructor(
    public dialogRef: MatDialogRef<RegistrarComiteComponent>,
    public dialog: MatDialog,
    private marcadorService: MarcadorService,
    ) {
    
   }

  ngOnInit() {
    this.titulo = 'REGISTRAR COMITE';

    this.comiteRegistrarForm = new FormGroup({
      'nomComFrmCtrl': new FormControl(''),
    });
  }

  get fc() { return this.comiteRegistrarForm.controls; }

  onDialogClose(flag): void {
        this.dialogRef.close(flag);
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
            title: 'COMITE',
            message: message,
            message2: message2,
            alerta: alerta,
            confirmacion: confirmacion,
            valor: valor
        }
    });
    dialogRef.afterClosed().subscribe(result => {
        if(this.flagRegistro === true){
            this.onDialogClose(true);
        }
    });
}

  accionComite(){
    this.openDialogMensaje2("TIPOS-COMITE", MENSAJES.INFO_COMITE, false, true, null);
  }

   // POP-UP MENSAJES
   public openDialogMensaje2(
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
        title: 'COMITE',
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        if(this.comiteRegistrarForm.get('nomComFrmCtrl').value == ''){
          this.openDialogMensaje('COMITE', 'La información no debe estar vacia.', true, false, null);
          return false;
        }

        const json = {
          'descripcionComite': this.comiteRegistrarForm.get('nomComFrmCtrl').value
        }
    
        this.marcadorService.registarComite(json).subscribe(resp =>{
          
          if(resp["audiResponse"]["codigoRespuesta"] == "0"){
            this.flagRegistro = true;
            this.openDialogMensaje(MENSAJES.INFO_ACEPTAR, '', true, false, null);
          }else if(resp["audiResponse"]["codigoRespuesta"] == "2"){
            this.openDialogMensaje(MENSAJES.ERROR_SERVICIO, resp["audiResponse"]["mensajeRespuesta"], true, false, null);
          }else {
            this.openDialogMensaje(MENSAJES.ERROR_SERVICIO, 'Error al Registrar COMITE', true, false, null);
          }
          
        },err => {
          
        })
      }
    });
  }
}
