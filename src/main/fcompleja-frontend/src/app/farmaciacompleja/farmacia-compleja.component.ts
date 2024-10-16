import {
  Component,
  OnInit,
  Output,
  HostListener,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { hideAnimation } from '../animaciones/menu-animado';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { AutenticacionService } from '../service/autenticacion.service';
import { MediaObserver, MediaChange } from '@angular/flex-layout';
import * as CryptoJS from 'crypto-js';
import {
  AES_KEY,
  COD_APLICACION,
  LOGOUT_OAUTH,
  webServiceEndpoint,
  clientId,
  clientSecret,
  oauthServerEndpoint,
} from '../common';
import * as _moment from 'moment';
import { Router, NavigationEnd } from '@angular/router';
import { OncoWsResponse } from '../dto/response/OncoWsResponse';
import { CoreService } from 'src/app/service/core.service';
import { GlobalService } from '../service/global.service';
import { AESencryptionService } from '../service/AESencryption.service';
import { BandejaEvaluacionService } from 'src/app/service/bandeja.evaluacion.service';

@Component({
  selector: 'app-farmacia-compleja',
  templateUrl: './farmacia-compleja.component.html',
  styleUrls: ['./farmacia-compleja.component.scss'],
  animations: [hideAnimation],

})
export class FarmaciaComplejaComponent implements OnInit {
  @Output() loginOutput = new EventEmitter<boolean>();
  observer: any;
  constructor(
    private CoreService: CoreService,
    public serviceMedia: MediaObserver,
    private autenticacionService: AutenticacionService,
    private bandejaEvaluacionService: BandejaEvaluacionService,
    private router: Router,
    public globalService: GlobalService,
    private crypto: AESencryptionService
  ) { }

  ngOnDestroy() {
    this.observer.unsubscribe();
  }

  ngOnInit(){
    this.observer = this.router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.globalService.setVisible(false);
        if (val.url != '/app/home' && val.url != '/app/login') {
          this.validarAccesoMenu(
            Number(localStorage.getItem('codUser')),
            this.router.url
          );
        }
      }
    });

  }


  public validarAccesoMenu(login_id: number, url: string) {
    this.CoreService.ConsultarMenu(login_id, '').subscribe(
      (data: OncoWsResponse) => {
        let obj = data.dataList.find((o) => url.search(o.url) > 0);
        if (obj === undefined) {
          for (var i = 0; i < data.dataList.length; i++) {
            let sitem = data.dataList[i].subMenu;
            obj = sitem.find((o) => url.search(o.url) > 0);
            if (obj != undefined) {
              break;
            }
          }
          let menusPersonalizados = [
            {
              urlParent: '/bandeja-preliminar',
              rolesAcceso: [1, 2, 5, 6, 7, 10, 11],
              subMenusDetalle: ['/detalle-preliminar'],
            },
            {
              urlParent: '/bandeja-evaluacion',
              rolesAcceso: [1, 2, 5, 6, 7, 10, 11],
              subMenusDetalle: [
                '/seguimiento-evaluacion',
                '/registro-linea-tratamiento',
                '/medicamento-continuador',
                '/medicamento-nuevo',
                '/detalle-evaluacion',
              ],
            },
            {
              urlParent: '/bandeja-monitoreo',
              rolesAcceso: [1, 2, 5, 6, 7, 10, 11],
              subMenusDetalle: ['/monitoreo-paciente'],
            },
          ];
          if (obj === undefined) {
            for (var i = 0; i < menusPersonalizados.length; i++) {
              let smd = menusPersonalizados[i].subMenusDetalle;
              obj = smd.find((o) => url.search(o) > 0);
              if (
                obj != undefined &&
                menusPersonalizados[i].rolesAcceso.includes(
                  parseInt(this.crypto.getValue(localStorage.getItem('codRol')))
                )
              ) {
                break;
              }
            }
          }

          if (obj === undefined) {
            this.cerrarSesion();
          } else {
            this.globalService.setVisible(true);
          }
        } else {
          this.globalService.setVisible(true);
        }
      },
      (error) => {
        console.error(error);
      }
    );
  }

  public cerrarSesion() {
    this.autenticacionService.getRevokeToken().subscribe(
      (data: boolean) => {
        this.retirarBanderaSolicitud();
        localStorage.clear();
        sessionStorage.clear();
        Cookie.deleteAll();
        this.loginOutput.emit(true);
        this.router.navigate(['/']);
      },
      (error) => {
        this.retirarBanderaSolicitud();
        localStorage.clear();
        sessionStorage.clear();
        Cookie.deleteAll();
        this.loginOutput.emit(true);
        this.router.navigate(['/']);
      }
    );
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

  /*@HostListener('window:beforeunload', ['$event'])
  beforeUnloadHander(event) {
    let _user = localStorage.getItem('tokUser');
    let c = localStorage.getItem(_user);
    let _pass = get(AES_KEY, c);
    let codUser = localStorage.getItem('codUser');
    let param = localStorage.getItem('param');

    var loginUser = {
      user: _user,
      password: JSON.parse(_pass),
      codUsuario: codUser,
      parametro: param,
      codRol: localStorage.getItem('codRol'),
      rolUsuario: localStorage.getItem('rolUsuario'),
    };
    function set(keys, value): string {
      var json = JSON.stringify(value);
      var key = CryptoJS.enc.Utf8.parse(keys);
      var iv = CryptoJS.enc.Utf8.parse(keys);
      var encrypted = CryptoJS.AES.encrypt(
        CryptoJS.enc.Utf8.parse(json.toString()),
        key,
        {
          keySize: 128 / 8,
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }
      );

      return encrypted.toString();
    }

    function get(keys, value): string {
      var key = CryptoJS.enc.Utf8.parse(keys);
      var iv = CryptoJS.enc.Utf8.parse(keys);
      var decrypted = CryptoJS.AES.decrypt(value, key, {
        keySize: 128 / 8,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      return decrypted.toString(CryptoJS.enc.Utf8);
    }

    function getRevokeToken(callback): void {
      var xmlhttp = new XMLHttpRequest();
      let params = new URLSearchParams();
      var theUrl = LOGOUT_OAUTH(Cookie.get('access_token_fc'));
      xmlhttp.open('POST', theUrl, true);
      xmlhttp.setRequestHeader(
        'Content-Type',
        'application/x-www-form-urlencoded; charset=utf-8'
      );
      xmlhttp.setRequestHeader(
        'Authorization',
        'Basic ' + btoa(clientId + ':' + clientSecret)
      );
      xmlhttp.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
          callback(this.responseText);
        }
      };
      let dat = set(AES_KEY, JSON.stringify({}));
      xmlhttp.send(JSON.stringify({ data: dat }));
    }

    setTimeout(this.cancel, 10, loginUser);
    event.preventDefault();
    event.returnValue = false;
    getRevokeToken(function (data) {
      this.retirarBanderaSolicitud();
      localStorage.clear();
      Cookie.deleteAll();
    });
  }*/

  /*public cancel(loginUser): void {
    function set(keys, value): string {
      var json = JSON.stringify(value);
      var key = CryptoJS.enc.Utf8.parse(keys);
      var iv = CryptoJS.enc.Utf8.parse(keys);
      var encrypted = CryptoJS.AES.encrypt(
        CryptoJS.enc.Utf8.parse(json.toString()),
        key,
        {
          keySize: 128 / 8,
          iv: iv,
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }
      );

      return encrypted.toString();
    }

    function get(keys, value): string {
      var key = CryptoJS.enc.Utf8.parse(keys);
      var iv = CryptoJS.enc.Utf8.parse(keys);
      var decrypted = CryptoJS.AES.decrypt(value, key, {
        keySize: 128 / 8,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      return decrypted.toString(CryptoJS.enc.Utf8);
    }

    function getAccessToken(login, callback): void {
      let passwordHashToken = CryptoJS.SHA256(login.password).toString(
        CryptoJS.enc.Hex
      );
      let params = new URLSearchParams();
      params.append('username', set(AES_KEY, login.usuario.toUpperCase()));
      params.append('password', set(AES_KEY, passwordHashToken));
      params.append('grant_type', 'password');
      params.append('client_id', clientId);
      var xmlhttp = new XMLHttpRequest();
      var theUrl = oauthServerEndpoint;
      xmlhttp.open('POST', theUrl, true);
      xmlhttp.setRequestHeader(
        'Content-Type',
        'application/x-www-form-urlencoded;charset=utf-8'
      );
      xmlhttp.setRequestHeader(
        'Authorization',
        'Basic ' + btoa(clientId + ':' + clientSecret)
      );
      xmlhttp.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
          callback(JSON.parse(this.responseText));
        }
      };
      xmlhttp.send(params.toString());
    }

    function saveToken(data, callback): void {
      var expireDate = data.expires_in / (3600 * 24);
      Cookie.set('access_token_fc', data.access_token, expireDate);
      Cookie.set(
        'sha256',
        CryptoJS.SHA256(data.access_token).toString(CryptoJS.enc.Hex)
      );
      callback(data.access_token);
    }

    function getValidarIntentoLogin(login, callback): void {
      var xmlhttp = new XMLHttpRequest();
      var theUrl = `${webServiceEndpoint}pub/validarIntentoLogin`;
      xmlhttp.open('POST', theUrl, true);
      xmlhttp.setRequestHeader(
        'Content-Type',
        'application/json; charset=utf-8'
      );
      xmlhttp.setRequestHeader('idTransaccion', _moment().unix().toString());
      xmlhttp.setRequestHeader(
        'fechaTransaccion',
        _moment().format('DD/MM/YYYY')
      );
      xmlhttp.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE && this.status === 200) {
          callback(JSON.parse(this.responseText));
        }
      };
      xmlhttp.send(JSON.stringify(login));
    }

    let user = loginUser.user;
    let pass = loginUser.password;

    getAccessToken({ usuario: user, password: pass }, function (data) {
      if (data.audiResponse.codRespuesta == '0') {
        saveToken(data, function (token) {
          let login = {
            usuario: user,
            codAplicacion: COD_APLICACION,
            url: window.location + '',
            acces_token: 'Bearer ' + token,
          };
          let cLogin = set(AES_KEY, login);
          getValidarIntentoLogin({ data: cLogin }, function (_data) {
            let response = JSON.parse(get(AES_KEY, _data.data));

            if (
              response.dataList != null &&
              response.dataList[0].codResultado == 0
            ) {
              var encrypted = set(AES_KEY, pass);

              localStorage.setItem('codUser', loginUser.codUsuario);
              localStorage.setItem('loginEstado', true + '');
              localStorage.setItem('tokUser', user);
              localStorage.setItem(user, encrypted);
              localStorage.setItem('param', loginUser.parametro);
              localStorage.setItem('codRol', loginUser.codRol);
              localStorage.setItem('rolUsuario', loginUser.rolUsuario);
            }
          });
        });
      }
    });
  }*/

  /*ngOnInit() {
    this.inicializarVariables();
  }*/

  /*deleteAllCookies() {
    var cookies = document.cookie.split(';');

    for (var i = 0; i < cookies.length; i++) {
      var cookie = cookies[i];
      var eqPos = cookie.indexOf('=');
      var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  }*/

  /*public inicializarVariables(): void {
    //this.deleteAllCookies();
  }*/
}
