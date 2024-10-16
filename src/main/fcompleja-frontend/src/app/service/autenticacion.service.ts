import { Injectable, Inject } from '@angular/core';
import {
  webServiceEndpoint,
  clientId,
  clientSecret,
  oauthServerEndpoint,
  LOGOUT_OAUTH,
} from '../common';
import { URLSearchParams } from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Router } from '@angular/router';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/publish';
import { User } from '../dto/Usuario';
import { Observable } from 'rxjs/Observable';
import * as CryptoJS from 'crypto-js';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { OncoWsResponse } from '../dto/response/OncoWsResponse';
import { DatePipe } from '@angular/common';
import { UsuarioService } from '../dto/service/usuario.service';
import { AESencryptionService } from './AESencryption.service';
import { LoginRequest } from '../dto/request/login.request';
import { OauthResponse } from '../dto/response/oauthResponse';
import { BandejaEvaluacionService } from 'src/app/service/bandeja.evaluacion.service';

@Injectable()
export class AutenticacionService {
  url: string;
  httpHeaders: HttpHeaders;
  creds: String;

  constructor(
    private http: HttpClient,
    public _router: Router,
    private datePipe: DatePipe,
    private bandejaEvaluacionService: BandejaEvaluacionService,
    @Inject(UsuarioService) private userService: UsuarioService,
    private aeSencryptionService: AESencryptionService
  ) {}

  getAccessToken(user: User): Observable<OauthResponse> {
    const passwordHashToken = CryptoJS.SHA256(user.password).toString(
      CryptoJS.enc.Hex
    );
    const params = new URLSearchParams();
    params.append(
      'username',
      this.aeSencryptionService.set(user.name.toUpperCase())
    );
    params.append('password', this.aeSencryptionService.set(passwordHashToken));
    params.append('grant_type', 'password');
    params.append('client_id', clientId);
    const headers = new HttpHeaders({
      'Content-type': 'application/x-www-form-urlencoded; charset=utf-8',
      Authorization: 'Basic ' + btoa(clientId + ':' + clientSecret),
    });

    return this.http.post<OauthResponse>(
      oauthServerEndpoint,
      params.toString(),
      { headers: headers }
    );
  }
  saveToken(tokenString: any) {
    const token = tokenString;
    const expireDate = token.expires_in / (3600 * 24);;
    Cookie.set('access_token_fc', token.access_token, expireDate);
  }

  consultarUsuarioPersona(usuario: string): Observable<OncoWsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        authorization: 'Bearer ' + Cookie.get('access_token_fc'),
        idTransaccion: Math.random() + '',
        fechaTransaccion: this.datePipe.transform(new Date(), 'dd/MM/yyyy'),
      }),
    };
    return this.http.post<OncoWsResponse>(
      `${webServiceEndpoint}api/usuario`,
      { usuario: usuario },
      httpOptions
    );
  }

  public CerrarSesion() {
    this.retirarBanderaSolicitud();
    localStorage.clear();
    Cookie.delete('access_token');
    Cookie.delete('refresh_token');
    this.userService.limpiarRegistro();
    this._router.navigate(['./login']);
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

  getRevokeToken(): Observable<boolean> {
    let access_token = Cookie.get('access_token_fc');
    let headers = new HttpHeaders({
      'Content-type': 'application/x-www-form-urlencoded; charset=utf-8',
      Authorization: 'Basic ' + btoa(clientId + ':' + clientSecret),
    });

    return this.http.post<boolean>(
      LOGOUT_OAUTH(access_token),
      {},
      { headers: headers }
    );
  }

  getValidarIntentoLogin(login: LoginRequest): Observable<OncoWsResponse> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        idTransaccion: Math.random() + '',
        fechaTransaccion: this.datePipe.transform(new Date(), 'dd/MM/yyyy'),
      }),
    };

    return this.http.post<OncoWsResponse>(
      `${webServiceEndpoint}pub/validarIntentoLogin`,
      login,
      httpOptions
    );
  }

  getResetearReintentosLogin(login: LoginRequest): Observable<OncoWsResponse> {
    let httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        authorization: 'Bearer ' + Cookie.get('access_token_fc'),
        idTransaccion: Math.random() + '',
        fechaTransaccion: this.datePipe.transform(new Date(), 'dd/MM/yyyy'),
      }),
    };

    return this.http.post<OncoWsResponse>(
      `${webServiceEndpoint}api/resetearReintentosLogin`,
      login,
      httpOptions
    );
  }
}
