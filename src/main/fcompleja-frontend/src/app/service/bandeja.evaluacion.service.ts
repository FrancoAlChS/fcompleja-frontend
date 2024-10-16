import { Injectable } from '@angular/core';
import { webServiceEndpoint } from '../common';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { ListaEvaluacionesResponse } from '../dto/solicitudEvaluacion/bandeja/listaEvaluacionesResponse';
import { ApiLineaTrataresponse } from '../dto/solicitudEvaluacion/bandeja/ApiLineaTrataresponse';
import { DatePipe } from '@angular/common';
import { WsResponse } from '../dto/WsResponse';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { ListaEvaluacionesRequest } from '../dto/solicitudEvaluacion/bandeja/ListaEvaluacionesRequest';
import { WsResponseOnco } from '../dto/WsResponseOnco';
import { EmailRequest } from '../dto/request/BandejaEvaluacion/EmailRequest';

@Injectable({
  providedIn: 'root'
})

export class BandejaEvaluacionService {

  constructor(private http: HttpClient, private datePipe: DatePipe) { }

  public listarDetalleSolicitud(requestFiltro: ListaEvaluacionesRequest): Observable<WsResponseOnco> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };
    return this.http.post<WsResponseOnco>(`${webServiceEndpoint}api/BandejaEvaluacion`, requestFiltro, httpOptions);
  }

  public listarHistorialLinea(listaLineaTratamientoRequest): Observable<ApiLineaTrataresponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };
    return this.http.post<ApiLineaTrataresponse>(
      `${webServiceEndpoint}api/informacionHistLineaTrat`,
      listaLineaTratamientoRequest,
      httpOptions);
  }

  /**
   * Propósito: Se busca solicitudes de evaluacion CMAC por Fecha en el Registro de Solicitud CMAC
   * @param request
   */
  public listaEvaluacionCmacXFecha(request): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/consultarEvaluacionXFecha`, request, httpOptions);
  }

  public registrarEvaluacionCmac(request): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
        'idTransaccion': Math.random() + '',
        'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy')
      })
    };
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/registrarEvaluacionCmac`, request, httpOptions);
  }

  public consultarXCodigo(request): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/evaluacionXCodigo`, request, httpOptions);
  }

  /**
   * Proposito: Se agrega la solicitud por codigo de evaluacion en Registro de la
   *            programacion CMAC
   * @param request
   */
  public listaEvaluacionXCodigoCmac(request): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/consultaEvaluacionCmacXCodigo`, request, httpOptions);
  }

  public actualizarEstadoSolEvaluacion(request: EmailRequest): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
        'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
        'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy')
      })
    };
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/actualizarEstSolicitudEvaluacion`, request, httpOptions);
  }

  public consultarBanderaEvaluacion(request) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
        'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
        'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy')
      })
    };
    return this.http.post<Object>(`${webServiceEndpoint}api/consultarrBanderaEvaluacion`, request, httpOptions);
  }

  public reportePasoUno(request) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
        'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
        'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy')
      })
    };
    return this.http.post<Object>(`${webServiceEndpoint}api/reportePasoUno`, request, httpOptions);
  }
}
