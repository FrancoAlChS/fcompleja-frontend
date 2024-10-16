import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RecoverAccountRequest } from '../../dto/RecoverAccountRequest';
import { RecuperarCuentaService } from '../../service/recuperar-cuenta.service';
import { MENSAJES } from '../../common';
import { MessageComponent } from '../../core/message/message.component';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  public recoverAccountRequest: RecoverAccountRequest = new RecoverAccountRequest();

  valForm: FormGroup = new FormGroup({
    correoFrm: new FormControl(null, [Validators.required, Validators.email]),
  });



  mensaje: string;
  tx_correcto: boolean = false;

  constructor(private rcService: RecuperarCuentaService,
    private dialog: MatDialog,
    private router: Router) { }


  ngOnInit() {
  }

  get correoFrm() { return this.valForm.get('correoFrm'); }

  public ValidarForm(): boolean {
    if (this.valForm.invalid) {
      if (this.correoFrm.invalid) {
        this.mensaje = 'Ingresa un correo.';
      }

      this.correoFrm.markAsTouched();

      return false;
    }

    this.recoverAccountRequest.codAplicacion = 1;
    this.recoverAccountRequest.correo = this.correoFrm.value;

    return true;
  }

  public forgotPassword($ev: Event): void {
    $ev.preventDefault();
    if (this.ValidarForm()) {
      this.rcService.sendEmail(this.recoverAccountRequest)
        .subscribe(data => {
          if (data) {
            if (data.audiResponse.codigoRespuesta === '0') {
              this.tx_correcto = true;
              this.openDialogMensaje(data.audiResponse.mensajeRespuesta, null, true, false, null);
            } else {
              this.openDialogMensaje(MENSAJES.RecAccount.notSend, null, true, false, null);
            }
          }
        }, error => {
          console.error(error);
          this.openDialogMensaje(MENSAJES.RecAccount.notSend, null, true, false, null);
        });
    } else {
      this.openDialogMensaje(MENSAJES.RecAccount.validate, this.mensaje, true, false, null);
    }
  }

  openDialogMensaje(message: string, message2: string, alerta: boolean, confirmacion: boolean, valor: any) {
    const dialogRef = this.dialog.open(MessageComponent, {
      width: '400px',
      disableClose: true,
      data: {
        title: MENSAJES.RecAccount.title,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor
      }
    });
    return dialogRef.afterClosed();
  }


  goToLogin() {

    this.router.navigate(['./login']);

  }

}
