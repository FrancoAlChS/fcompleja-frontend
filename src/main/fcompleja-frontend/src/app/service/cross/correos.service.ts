import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Observable } from 'rxjs/Observable';
import { DatePipe } from '@angular/common';
import { OncoWsResponse } from 'src/app/dto/response/OncoWsResponse';
import { webServiceEndpoint } from 'src/app/common';
import { EmailDTO } from 'src/app/dto/core/EmailDTO';
import { EnvioCorreoRequest } from 'src/app/dto/core/EnvioCorreoRequest';
import { SolicitudEvaluacionRequest } from 'src/app/dto/request/SolicitudEvaluacionRequest';
import { WsResponse } from 'src/app/dto/WsResponse';
import { ListaEvaluaciones } from 'src/app/dto/solicitudEvaluacion/bandeja/ListaEvaluaciones';
import { EmailAlertaCmacRequest } from 'src/app/dto/request/EmailAlertaCmacRequest';
import { GenerarEncrypt } from 'src/app/dto/request/GenerarEncryp';

@Injectable({
  providedIn: 'root'
})
export class CorreosService {

  constructor(private http: HttpClient, private datePipe: DatePipe) { }

  public generarCorreo(request: EmailDTO): Observable<OncoWsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };
    return this.http.post<OncoWsResponse>(`${webServiceEndpoint}api/generarCorreo`, request, httpOptions);
  }

  public enviarCorreoAdmiSistema(request: EmailDTO): Observable<OncoWsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };
    return this.http.post<OncoWsResponse>(`${webServiceEndpoint}api/enviarCorreoAdmiSistema`, request, httpOptions);
  }

  public generarLinkEncypt(request : GenerarEncrypt): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/generarEncryptLink`, request, httpOptions);
  }


  public finalizarEnvioCorreo(request: EmailDTO): Observable<OncoWsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };
    return this.http.post<OncoWsResponse>(`${webServiceEndpoint}api/enviarCorreo`, request, httpOptions);
  }

  public finalizarEnvioCorreoReunionMac(request: EmailDTO): Observable<OncoWsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
        'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
        'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy')
      })
    };
    return this.http.post<OncoWsResponse>(`${webServiceEndpoint}api/enviarCorreoReunionMac`, request, httpOptions);
  }



  public actualizarCodigoEnvio(request: EnvioCorreoRequest): Observable<OncoWsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
        'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
        'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy')
      })
    };
    return this.http.post<OncoWsResponse>(`${webServiceEndpoint}api/actualizarCodigoEnvio`, request, httpOptions);
  }
  public verificarCodigoEnvio(request: EnvioCorreoRequest): Observable<OncoWsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
        'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
        'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy')
      })
    };
    return this.http.post<OncoWsResponse>(`${webServiceEndpoint}api/verificarEnvioCorreo`, request, httpOptions);
  }

  public actParamsCorreoLiderTumor(request: SolicitudEvaluacionRequest): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
        'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
        'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy')
      })
    };
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/actParamsCorreoLiderTumor`, request, httpOptions);
  }

  public reenviarCorreos(request: ListaEvaluaciones[]): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
        'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
        'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy')
      })
    };
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/reenviarCorreos`, request, httpOptions);
  }

  public actualizarCorreosPendientes(request: ListaEvaluaciones[]): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
        'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
        'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy')
      })
    };
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/actualizarCorreosPendientes`, request, httpOptions);
  }

  public actualizarCorreosPendientesV2(request: ListaEvaluaciones[]): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
        'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
        'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy')
      })
    };
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/actualizarCorreosPendientesV2`, request, httpOptions);
  }

  public enviarCorreoGenerico(request: EmailDTO): Observable<OncoWsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };
    return this.http.post<OncoWsResponse>(`${webServiceEndpoint}api/enviarCorreoGenerico`, request, httpOptions);
  }


  public actualizarEstCorreoSolEvaluacion(request: EmailDTO): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
        'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
        'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy')
      })
    };
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/actualizarEstCorreoSolEvaluacion`, request, httpOptions);
  }

  public actualizarEstCorreoLidTumSolEvalucion(request: EmailDTO): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
        'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
        'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy')
      })
    };
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/actualizarEstCorreoLidTumSolEvalucion`, request, httpOptions);
  }

  public obtenerDatosAutorizadorPert(request: any[]): Observable<OncoWsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
        'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
        'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy')
      })
    };
    return this.http.post<OncoWsResponse>(`${webServiceEndpoint}api/obtenerDatosAutorizadorPert`, request, httpOptions);
  }
}
