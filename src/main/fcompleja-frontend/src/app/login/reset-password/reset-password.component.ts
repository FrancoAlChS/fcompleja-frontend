import { Component, OnInit } from '@angular/core';
import { RecoverAccountRequest } from '../../dto/RecoverAccountRequest';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RecuperarCuentaService } from '../../service/recuperar-cuenta.service';
import { MatDialog } from '@angular/material';
import { MENSAJES } from '../../common';
import { MessageComponent } from '../../core/message/message.component';
import { ActivatedRoute, Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { OncoWsResponse } from 'src/app/dto/response/OncoWsResponse';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent implements OnInit {
  public recoverAccountRequest: RecoverAccountRequest =
    new RecoverAccountRequest();

  valForm: FormGroup = new FormGroup({
    nuevaContraFrm: new FormControl(null, [
      Validators.required,
      Validators.pattern(
        '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-zd$@$!%*?&].{8,}'
      ),
    ]),
    confirContraFrm: new FormControl(null, [Validators.required]),
  });

  get nuevaContraFrm() {
    return this.valForm.get('nuevaContraFrm');
  }
  get confirContraFrm() {
    return this.valForm.get('confirContraFrm');
  }

  mensaje: string;
  token: string;
  id: string;
  pass: string;
  tx_correcto: boolean = false;

  constructor(
    private rcService: RecuperarCuentaService,
    private dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.token = this.activatedRoute.snapshot.paramMap.get('token');
    this.id = this.activatedRoute.snapshot.paramMap.get('id');
    Cookie.set('access_token_fc', this.token, 0.08333333333);
  }

  public ValidarForm(): boolean {
    if (this.valForm.invalid) {
      if (this.nuevaContraFrm.invalid && this.confirContraFrm.invalid) {
        this.mensaje = 'Ingresa y confirma la nueva contraseña';
      } else if (this.nuevaContraFrm.invalid) {
        this.mensaje = 'Ingresa tu nueva contraseña.';
      } else {
        this.mensaje = 'Confirma tu nueva contraseña.';
      }

      this.nuevaContraFrm.markAsTouched();
      this.confirContraFrm.markAsTouched();

      return false;
    }

    if (this.nuevaContraFrm.value !== this.confirContraFrm.value) {
      this.mensaje = 'Las contraseñas deben ser iguales';
      return false;
    }

    this.recoverAccountRequest.codAplicacion = 1;
    this.recoverAccountRequest.codUsuario = this.id;
    this.recoverAccountRequest.nuevaContrasena = CryptoJS.SHA256(
      this.confirContraFrm.value
    ).toString(CryptoJS.enc.Hex);

    return true;
  }

  public resetPassword($ev: Event): void {
    $ev.preventDefault();
    if (this.ValidarForm()) {
      this.rcService.cambiarCredenciales(this.recoverAccountRequest).subscribe(
        (data: OncoWsResponse) => {
          if (data) {
            if (data.audiResponse.codigoRespuesta === '0') {
              this.tx_correcto = true;
              this.openDialogMensaje(
                data.audiResponse.mensajeRespuesta,
                null,
                true,
                false,
                null
              );
            } else {
              this.openDialogMensaje(
                data.audiResponse.mensajeRespuesta,
                null,
                true,
                false,
                null
              );
            }
          }
        },
        (error) => {
          this.openDialogMensaje(
            MENSAJES.RecAccount.error404,
            null,
            true,
            false,
            null
          );
        }
      );
    } else {
      this.openDialogMensaje(
        MENSAJES.RecAccount.validate,
        this.mensaje,
        true,
        false,
        null
      );
    }
  }

  openDialogMensaje(
    message: string,
    message2: string,
    alerta: boolean,
    confirmacion: boolean,
    valor: any
  ) {
    const dialogRef = this.dialog.open(MessageComponent, {
      width: '400px',
      disableClose: true,
      data: {
        title: MENSAJES.RecAccount.title,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    return dialogRef.afterClosed().subscribe((res) => {
      if (this.tx_correcto) {
        this.router.navigate(['./login']);
      }
    });
  }

  public hasError = (controlName: string, errorName: string) => {
    return this.valForm.controls[controlName].hasError(errorName);
  };
}
