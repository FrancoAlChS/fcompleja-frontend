import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { Observable } from 'rxjs';
import { webServiceEndpoint } from 'src/app/common';
import { WsResponse } from 'src/app/dto/WsResponse';
import { BandejaMonitoreoRequest } from 'src/app/dto/request/BandejaMonitoreo/BandejaMonitoreoRequest';
import { listaLineaTratamientoRequest } from 'src/app/dto/solicitudEvaluacion/bandeja/ListaHisLineaTratamientoRequest';
import { ResultadoBasalRequest } from 'src/app/dto/request/ResultadoBasalRequest';
import { EvolucionRequest } from 'src/app/dto/request/BandejaMonitoreo/EvolucionRequest';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { EvolucionMarcadorRequest } from 'src/app/dto/request/BandejaMonitoreo/EvolucionMarcadorRequest';
import { SegEjecutivoRequest } from 'src/app/dto/request/BandejaMonitoreo/SegEjecutivoRequest';
import { MonitoreoResponse } from 'src/app/dto/response/BandejaMonitoreo/MonitoreoResponse';
import { ReportEvaluacionRequest } from 'src/app/dto/request/BandejaMonitoreo/ReportEvaluacionRequest';
import { ArchivoFTP } from 'src/app/dto/bandeja-preliminar/detalle-preliminar/ArchivoFTP';
import { EvolucionResponse } from 'src/app/dto/response/BandejaMonitoreo/EvolucionResponse';
import { MarcadorRequest } from 'src/app/dto/request/BandejaMonitoreo/MarcadorRequest';

@Injectable({
  providedIn: 'root'
})
export class BandejaMonitoreoService {
  httpHeaders: HttpHeaders;
  constructor(private http: HttpClient, private datePipe: DatePipe) {

  }

  public consultarMonitoreo(request: BandejaMonitoreoRequest): Observable<WsResponse> {
    this.httpHeaders = new HttpHeaders({
      'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
      'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy'),
      'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
      'Content-type': 'application/json; charset=utf-8'
    });
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/bandejaMonitoreo`, request, { headers: this.httpHeaders });
  }

  public pruebaFecha(): Observable<WsResponse> {
    this.httpHeaders = new HttpHeaders({
      'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
      'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy'),
      'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
      'Content-type': 'application/json; charset=utf-8'
    });

    const fecha = new Date()
    
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/insActCheckListPacPrefeInsti`, {fechaEstado:fecha.toDateString()}, { headers: this.httpHeaders });
  }
  public listarLineaTratamiento(request: listaLineaTratamientoRequest): Observable<WsResponse> {
    this.httpHeaders = new HttpHeaders({
      'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
      'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy'),
      'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
      'Content-type': 'application/json; charset=utf-8'
    });
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/listlineatratamiento`, request, { headers: this.httpHeaders });
  }

  public getUltLineaTratamiento(request: listaLineaTratamientoRequest): Observable<WsResponse> {
    this.httpHeaders = new HttpHeaders({
      'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
      'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy'),
      'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
      'Content-type': 'application/json; charset=utf-8'
    });
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/getultlineatratamiento`, request, { headers: this.httpHeaders });
  }

  public listarMarcadores(request: MarcadorRequest): Observable<WsResponse> {
    this.httpHeaders = new HttpHeaders({
      'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
      'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy'),
      'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
      'Content-type': 'application/json; charset=utf-8'
    });
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/listarmarcadores`, request, { headers: this.httpHeaders });
  }

  public registrarDatosEvolucion(request: EvolucionRequest): Observable<WsResponse> {
    
    this.httpHeaders = new HttpHeaders({
      'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
      'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy'),
      'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
      'Content-type': 'application/json'
    });
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/regdatosevolucion`, request, { headers: this.httpHeaders });
  }


  public actualizarDatosEvolucion(request: EvolucionRequest): Observable<WsResponse> {
    this.httpHeaders = new HttpHeaders({
      'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
      'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy'),
      'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
      'Content-type': 'application/json; charset=utf-8'
    });
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/actdatosevolucion`, request, { headers: this.httpHeaders });
  }

  public actualizarMonitoreoPendInfo(request: EvolucionRequest): Observable<WsResponse> {
    this.httpHeaders = new HttpHeaders({
      'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
      'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy'),
      'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
      'Content-type': 'application/json; charset=utf-8'
    });
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/actualizarMonitoreoPendInfo`, request, { headers: this.httpHeaders });
  }

  public listarEvoluciones(request: EvolucionRequest): Observable<WsResponse> {
    this.httpHeaders = new HttpHeaders({
      'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
      'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy'),
      'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
      'Content-type': 'application/json; charset=utf-8'
    });
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/listarevolucion`, request, { headers: this.httpHeaders });
  }

  public regResultadoEvolucion(request: EvolucionRequest): Observable<WsResponse> {
    this.httpHeaders = new HttpHeaders({
      'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
      'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy'),
      'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
      'Content-type': 'application/json; charset=utf-8'
    });
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/regresultadoevolucion`, request, { headers: this.httpHeaders });
  }

  public listarDetalleEvolucion(request: EvolucionMarcadorRequest): Observable<WsResponse> {
    this.httpHeaders = new HttpHeaders({
      'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
      'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy'),
      'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
      'Content-type': 'application/json; charset=utf-8'
    });
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/listardetalleevolucion`, request, { headers: this.httpHeaders });
  }

  public listarHistorialMarcadores(request: ResultadoBasalRequest): Observable<WsResponse> {
    this.httpHeaders = new HttpHeaders({
      'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
      'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy'),
      'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
      'Content-type': 'application/json; charset=utf-8'
    });
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/listarhistorialmarcadores`, request, { headers: this.httpHeaders });
  }

  public regSeguimientoEjecutivo(request: SegEjecutivoRequest): Observable<WsResponse> {
    this.httpHeaders = new HttpHeaders({
      'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
      'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy'),
      'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
      'Content-type': 'application/json; charset=utf-8'
    });
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/regsegejecutivo`, request, { headers: this.httpHeaders });
  }

  public listarSeguimientoEjecutivo(request: SegEjecutivoRequest): Observable<WsResponse> {
    this.httpHeaders = new HttpHeaders({
      'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
      'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy'),
      'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
      'Content-type': 'application/json; charset=utf-8'
    });
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/listarsegejecutivo`, request, { headers: this.httpHeaders });
  }

  public getSeguimientosPendientes(request: SegEjecutivoRequest): Observable<WsResponse> {
    this.httpHeaders = new HttpHeaders({
      'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
      'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy'),
      'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
      'Content-type': 'application/json; charset=utf-8'
    });
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/getseguimientospendientes`, request, { headers: this.httpHeaders });
  }

  public actEstadoSegPendientes(request: SegEjecutivoRequest): Observable<WsResponse> {
    this.httpHeaders = new HttpHeaders({
      'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
      'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy'),
      'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
      'Content-type': 'application/json; charset=utf-8'
    });
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/actestsegpendientes`, request, { headers: this.httpHeaders });
  }

  public getUltRegistroMarcador(request: EvolucionMarcadorRequest): Observable<WsResponse> {
    this.httpHeaders = new HttpHeaders({
      'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
      'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy'),
      'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
      'Content-type': 'application/json; charset=utf-8'
    });
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/getultregistromarcador`, request, { headers: this.httpHeaders });
  }


  public consDatosGrpDiagnostico(request: MonitoreoResponse): Observable<WsResponse> {
    this.httpHeaders = new HttpHeaders({
      'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
      'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy'),
      'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
      'Content-type': 'application/json; charset=utf-8'
    });
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/consdatosgrpdiag`, request, { headers: this.httpHeaders });
  }

  public getPdfEvaluacionMAC(request: ReportEvaluacionRequest): Observable<WsResponse> {
    this.httpHeaders = new HttpHeaders({
      'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
      'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy'),
      'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
      'Content-type': 'application/json; charset=utf-8'
    });
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/reporteEvaluacionPdf`, request, { headers: this.httpHeaders });
  }

  public getPdfEvaluacionMACXCodigo(request: ArchivoFTP): Observable<WsResponse> {
    this.httpHeaders = new HttpHeaders({
      'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
      'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy'),
      'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
      'Content-type': 'application/json; charset=utf-8'
    });
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/descargarArchivo`, request, { headers: this.httpHeaders });
  }
  
  public listarEvoToxiGrado(request: EvolucionRequest): Observable<WsResponse> {
    this.httpHeaders = new HttpHeaders({
      'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
      'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy'),
      'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
      'Content-type': 'application/json; charset=utf-8'
    });
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/listarevoToxiGrado`, request, { headers: this.httpHeaders });
  }
}
