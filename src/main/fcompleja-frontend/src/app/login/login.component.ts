import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Ng4LoadingSpinnerService } from 'ng4-loading-spinner';
import { User } from '../dto/Usuario';
import { AutenticacionService } from '../service/autenticacion.service';
import { UsuarioService } from '../dto/service/usuario.service';
import { MessageComponent } from '../core/message/message.component';
import { MatDialog } from '@angular/material';
import {
  MENSAJES,
  CAPCHA_KEY,
  COD_APLICACION,
  NUM_MAX_INTENTOS,
} from '../common';
import { AuthService } from '../auth/auth-service.service';
import { OncoWsResponse } from '../dto/response/OncoWsResponse';
import { ControlGastoService } from '../service/ControlGasto/control-gasto.service';
import { ListaFiltroUsuarioRolservice } from '../service/Lista.usuario.rol.service';
import { ParticipanteRequest } from '../dto/request/BandejaEvaluacion/ParticipanteRequest';
import { WsResponse } from '../dto/WsResponse';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { ReCaptcha2Component } from 'ngx-captcha';
import { LoginRequest } from '../dto/request/login.request';
import { OauthResponse } from '../dto/response/oauthResponse';
import { AppComponent } from '../app.component';
import { AESencryptionService } from '../service/AESencryption.service';
import { GlobalService } from '../service/global.service';
import * as moment from 'moment';
import { CoreService } from '../service/core.service';
import { BandejaEvaluacionService } from 'src/app/service/bandeja.evaluacion.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [AutenticacionService],
})
export class LoginComponent implements OnInit {
  public user: User = new User();

  protected formCaptcha: FormGroup;
  siteKey: string = CAPCHA_KEY;
  successCaptcha: string;
  public showCaptcha: boolean = false;
  public disableLogin: boolean = false;
  public numIntentosLogInMax: number;
  public numIntentos: number = 1;
  login: LoginRequest = new LoginRequest();
  @ViewChild('captchaElem') captchaElem: ReCaptcha2Component;

  valForm: FormGroup = new FormGroup({
    usuarioFrm: new FormControl(null, [Validators.required]),
    contrasFrm: new FormControl(null, [Validators.required]),
  });

  get usuarioFrm() {
    return this.valForm.get('usuarioFrm');
  }
  get contrasFrm() {
    return this.valForm.get('contrasFrm');
  }

  public sumited: boolean;
  mensaje: string;

  constructor(
    private spinnerService: Ng4LoadingSpinnerService,
    private autenticacionService: AutenticacionService,
    private router: Router,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private servicePrueba: ListaFiltroUsuarioRolservice,
    private bandejaEvaluacionService: BandejaEvaluacionService,
    @Inject(AppComponent) private parent: AppComponent,
    @Inject(UsuarioService) private userService: UsuarioService,
    @Inject(AuthService) private authServ: AuthService,
    @Inject(ControlGastoService) private cgService: ControlGastoService,
    private encryptionService: AESencryptionService,
    public globalService: GlobalService,
    public coreService: CoreService
  ) {}

  ngOnInit() {
    let access = Cookie.get('access_token_fc');
    let codUsuario = localStorage.getItem('codUser');
    if (access && codUsuario) {
      this.router.navigate(['./app/home']);
    } else {
      this.successCaptcha = '';
      this.limpiarCache();
      this.validarformCaptcha();
    }
  }

  public obtenerParam(): void {
    this.cgService.obtenerParametro().subscribe((data) => {
      if (data.extra.length > 0) {
        localStorage.setItem('param', data.extra[0].valor1Parametro);
      }
    });
  }

  public loginSesion($ev: Event, value: any): void {
    $ev.preventDefault();
    this.loginSesionBackend();
  }

  public ValidarForm(): boolean {
    if (this.valForm.invalid) {
      if (this.usuarioFrm.invalid && this.contrasFrm.invalid) {
        this.mensaje = 'Ingresar usuario y contraseña.';
      } else if (this.usuarioFrm.invalid) {
        this.mensaje = 'Ingresar el usuario.';
      } else {
        this.mensaje = 'Ingresar la contraseña.';
      }

      this.usuarioFrm.markAsTouched();
      this.contrasFrm.markAsTouched();

      return false;
    }

    if (this.showCaptcha) {
      if (this.formCaptcha.invalid || !(this.successCaptcha.length > 0)) {
        this.mensaje = 'Seleccionar captcha';
        this.successCaptcha = '';
        return false;
      } else {
        this.successCaptcha = '';
      }
    }

    this.user.name = this.usuarioFrm.value;
    this.user.password = this.contrasFrm.value;

    if (this.numIntentos > this.numIntentosLogInMax) {
      this.captchaElem.resetCaptcha();
    }

    return true;
  }

  public loginSesionBackend() {
    if (this.ValidarForm()) {
      this.spinnerService.hide();
      //this.retirarBanderaSolicitud();
      localStorage.clear();
      this.spinnerService.show();
      this.autenticacionService.getAccessToken(this.user).subscribe(
        (response: OauthResponse) => {
          if (response.audiResponse.codRespuesta === '0') {
            if (
              this.validaUser(
                this.user.name,
                response.audiResponse.user,
                MENSAJES.LOGIN.ACCESO_DENEGADO
              )
            ) {
              this.autenticacionService.saveToken(response);

              this.login.usuario = this.user.name.toUpperCase();
              this.login.codAplicacion = COD_APLICACION;
              this.login.url = window.location + '';
              this.login.acces_token =
                'Bearer ' + Cookie.get('access_token_fc');

              this.autenticacionService
                .getValidarIntentoLogin(this.login)
                .subscribe(
                  (data: OncoWsResponse) => {
                    if (
                      data.dataList != null &&
                      data.dataList[0].estado === 0
                    ) {
                      if (
                        this.validaUser(
                          this.login.usuario,
                          data.audiResponse.user,
                          MENSAJES.LOGIN.ACCESO_DENEGADO
                        )
                      ) {
                        this.autenticacionService
                          .consultarUsuarioPersona(this.user.name)
                          .subscribe(
                            (responseUser: OncoWsResponse) => {
                              if (responseUser !== null) {
                                if (
                                  responseUser.dataList != null &&
                                  responseUser.dataList.length > 0
                                ) {
                                  if (
                                    this.validaUser(
                                      this.user.name,
                                      responseUser.audiResponse.user,
                                      MENSAJES.LOGIN.ACCESO_DENEGADO
                                    )
                                  ) {
                                    this.obtenerParam();
                                    localStorage.setItem(
                                      'codUser',
                                      responseUser.dataList[0].codUsuario
                                    );
                                    this.authServ.setLoginEstado(
                                      true,
                                      this.user.name
                                    );

                                    /*this.coreService.consultarUsuarioRol(responseUser.dataList[0].codUsuario).subscribe(
                                  (responseUser: OncoWsResponse) => {
                                    
                                  }
                                );*/

                                    let currentKey =
                                      this.encryptionService.sha256(
                                        this.user.name +
                                          '@' +
                                          moment().unix() +
                                          '@'
                                      );
                                    //
                                    let cryp =
                                      this.encryptionService.set(currentKey);

                                    this.globalService.setToken(cryp);

                                    var encrypted = this.encryptionService.set(
                                      this.user.password
                                    );
                                    localStorage.setItem(
                                      this.user.name.toUpperCase(),
                                      encrypted
                                    );

                                    this.userService.setCodUsuario =
                                      responseUser.dataList[0].codUsuario;
                                    this.getResetearReintentosLoginPortalComun();
                                    
                                  }
                                } else {
                                  this.openDialogMensaje(
                                    MENSAJES.ERROR_NOFUNCION,
                                    responseUser.audiResponse.mensajeRespuesta,
                                    true,
                                    false,
                                    null
                                  );
                                  this.getValidaNumIntentosLogIn();
                                  this.router.navigate(['./login']);
                                }
                              } else {
                                this.openDialogMensaje(
                                  MENSAJES.ERROR_SERVICIO,
                                  'Error interno del Servidor.',
                                  true,
                                  false,
                                  null
                                );
                                this.getValidaNumIntentosLogIn();
                                this.router.navigate(['./login']);
                              }
                              this.spinnerService.hide();
                            },
                            (error) => {
                              console.error(error);
                              this.mensaje = 'Error al consultar el usuario.';
                              this.openDialogMensaje(
                                MENSAJES.ERROR_SERVICIO,
                                this.mensaje,
                                true,
                                false,
                                null
                              );
                              this.spinnerService.hide();
                              this.getValidaNumIntentosLogIn();
                            }
                          );
                      }
                    } else {
                      this.spinnerService.hide();
                      let mensaje: string;

                      if (
                        data.dataList != null &&
                        data.dataList[0].estado === 1
                      ) {
                        mensaje = MENSAJES.LOGIN.BLOQUEO_TEMPORAL_DETALLE;
                        this.getValidaNumIntentosLogIn();
                        this.openDialogMensaje(
                          MENSAJES.LOGIN.BLOQUEO_TEMPORAL,
                          mensaje,
                          true,
                          false,
                          null
                        );
                      } else if (
                        data.dataList != null &&
                        data.dataList[0].estado === 2
                      ) {
                        mensaje = MENSAJES.LOGIN.BLOQUEO_DEFINITIVO_DETALLE;
                        this.getValidaNumIntentosLogIn();
                        this.openDialogMensaje(
                          MENSAJES.LOGIN.BLOQUEO_DEFINITIVO,
                          mensaje,
                          true,
                          false,
                          null
                        );
                      }
                    }
                  },
                  (error) => {
                    this.getValidaNumIntentosLogIn();
                  }
                );
            }
          } else {
            this.spinnerService.hide();
            this.getValidaNumIntentosLogIn();
            if (response.audiResponse.codRespuesta !== '-1') {
              this.openDialogMensaje(
                response.audiResponse.mensajeRespuesta,
                null,
                true,
                false,
                null
              );
              if (response.audiResponse.codRespuesta === '8') {
                this.getValidarIntentoLoginPortalComun();
              }
            } else {
              this.openDialogMensaje(
                'Error inesperado',
                null,
                true,
                false,
                null
              );
            }
          }
        },
        (error) => {
          this.spinnerService.hide();
          console.error(error);
          this.getValidaNumIntentosLogIn();
          let mensaje: string;
          mensaje = MENSAJES.LOGIN.ERROR_INESPERADO;
          this.openDialogMensaje(mensaje, null, true, false, null);
        }
      );
    } else {
      this.openDialogMensaje(
        MENSAJES.ERROR_CAMPOS,
        this.mensaje,
        true,
        false,
        null
      );
    }
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
        title: MENSAJES.LOGIN.INICIO_SESION,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }

  public peticion() {
    const participanteRequest = new ParticipanteRequest();
    participanteRequest.codRol = 5;
    this.servicePrueba
      .listarUsuarioFarmaciaPrueba(participanteRequest)
      .subscribe(
        (response: WsResponse) => {},
        (error) => {
          console.error(error);
        }
      );
  }

  public limpiarCache() {
    this.retirarBanderaSolicitud();
    localStorage.clear();

    Cookie.deleteAll();
  }

  retirarBanderaSolicitud() {
    let codSolEva = localStorage.getItem('codSolEva');
    let evaluacion = JSON.parse(localStorage.getItem('evaluacion'));
    var json = {
      codSolEva: codSolEva,
      tipo: 'SALIENDO',
    };

    if (codSolEva == null) {
    } else {
      this.bandejaEvaluacionService.consultarBanderaEvaluacion(json).subscribe(
        (data) => {
          //return false
        },
        (error) => {
          console.error(error);
        }
      );
    }
  }

  validarformCaptcha() {
    this.formCaptcha = this.fb.group({
      recaptcha: ['', Validators.required],
    });

    if ('mx' in sessionStorage) {
      this.numIntentos = JSON.parse(sessionStorage.getItem('mx'));
    }

    this.numIntentosLogInMax = NUM_MAX_INTENTOS;
    this.showCaptcha =
      this.numIntentos > this.numIntentosLogInMax ? true : false;
    this.disableLogin =
      this.numIntentos > this.numIntentosLogInMax ? true : false;
  }

  getValidaNumIntentosLogIn() {
    this.numIntentos++;
    this.showCaptcha =
      this.numIntentos > this.numIntentosLogInMax ? true : false;
    this.disableLogin =
      this.numIntentos > this.numIntentosLogInMax ? true : false;
    sessionStorage.setItem('mx', JSON.stringify(this.numIntentos));
  }

  handleSuccess(captchaResponse: string): void {
    this.disableLogin = false;
    this.successCaptcha = captchaResponse;
  }

  getResetearReintentosLoginPortalComun() {
    this.login.usuario = this.user.name.toUpperCase();
    this.login.codAplicacion = COD_APLICACION;

    this.autenticacionService.getResetearReintentosLogin(this.login).subscribe(
      (data: OncoWsResponse) => {
        if (data.dataList) {
        }
      },
      (error) => {}
    );
    this.router.navigate(['./app/home']);
  }

  getValidarIntentoLoginPortalComun() {
    this.login.usuario = this.user.name.toUpperCase();
    this.login.codAplicacion = COD_APLICACION;
    this.login.url = window.location + '';

    this.autenticacionService.getValidarIntentoLogin(this.login).subscribe(
      (data: OncoWsResponse) => {
        if (data.dataList) {
          let mensaje: string;

          if (data.dataList != null && data.dataList[0].estado === 1) {
            mensaje = MENSAJES.LOGIN.BLOQUEO_TEMPORAL_DETALLE;
            this.openDialogMensaje(
              MENSAJES.LOGIN.BLOQUEO_TEMPORAL,
              mensaje,
              true,
              false,
              null
            );
          } else if (data.dataList != null && data.dataList[0].estado === 2) {
            mensaje = MENSAJES.LOGIN.BLOQUEO_DEFINITIVO_DETALLE;
            this.openDialogMensaje(
              MENSAJES.LOGIN.BLOQUEO_DEFINITIVO,
              mensaje,
              true,
              false,
              null
            );
          }
        }
      },
      (error) => {
        console.error('Error - ws validar reintentos de Login');
        console.error(error);
      }
    );
  }

  validaUser(userRequest: string, userResponse: string, mensaje: string) {
    if (userRequest && userResponse) {
      if (userRequest.toUpperCase() == userResponse.toUpperCase()) {
        return true;
      } else {
        this.spinnerService.hide();
        this.openDialogMensaje(mensaje, null, true, false, null);
        return false;
      }
    } else {
      this.spinnerService.hide();
      this.openDialogMensaje(mensaje, null, true, false, null);
      return false;
    }
  }
}
