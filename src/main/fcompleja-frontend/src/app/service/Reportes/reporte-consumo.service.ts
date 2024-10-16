import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/publish';
import { webServiceEndpoint } from 'src/app/common';
import { WsResponse } from 'src/app/dto/WsResponse';
import { ReporteAntecTrat } from 'src/app/dto/configuracion/ReporteAntecTrat';
import { ReporteIndicadoresRequest } from 'src/app/dto/configuracion/ReporteIndicadoresRequest';
import { ReportePacienteRequest } from 'src/app/dto/configuracion/ReportePacienteRequest';

@Injectable({
  providedIn: 'root',
})
export class ReporteConsumoService {
  constructor(private http: HttpClient) {}

  /*public generarReporteConsumoPorMac(request: ReporteIndicadoresRequest): Observable<WsResponse> {
    return this.http.post<WsResponse>(`${webServiceEndpoint}pub/generarIndicadorPorMedicamentoMAC`, request, {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    });
  }*/

  public generarReporteAntecTrat(request: ReporteAntecTrat) {
    return this.http
      .post(`${webServiceEndpoint}pub/reportePacientes`, request, {
        headers: new HttpHeaders({
          'Content-type': 'application/json; charset=utf-8',
          authorization: 'Bearer ' + Cookie.get('access_token_fc'),
        }),
        responseType: 'blob',
      })
      .map((res) => {
        return new Blob([res], { type: 'application/vnd.ms-excel' });
      });
  }

  public generarReporteConsumoPorMac(request: ReporteIndicadoresRequest) {
    return this.http
      .post(
        `${webServiceEndpoint}pub/generarIndicadorPorMedicamentoMAC`,
        request,
        {
          headers: new HttpHeaders({
            'Content-type': 'application/json; charset=utf-8',
            authorization: 'Bearer ' + Cookie.get('access_token_fc'),
          }),
          responseType: 'blob',
        }
      )
      .map((res) => {
        return new Blob([res], { type: 'application/vnd.ms-excel' });
      });
  }

  /*public generarReporteConsumoPorGrpDiagMac(request: ReporteIndicadoresRequest): Observable<WsResponse> {
    return this.http.post<WsResponse>(`${webServiceEndpoint}pub/generarIndicadorPorMedicamentoGrupoMAC`, request, {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    });
  }*/

  public generarReporteConsumoPorGrpDiagMac(
    request: ReporteIndicadoresRequest
  ) {
    return this.http
      .post(
        `${webServiceEndpoint}pub/generarIndicadorPorMedicamentoGrupoMAC`,
        request,
        {
          headers: new HttpHeaders({
            'Content-type': 'application/json; charset=utf-8',
            authorization: 'Bearer ' + Cookie.get('access_token_fc'),
          }),
          responseType: 'blob',
        }
      )
      .map((res) => {
        return new Blob([res], { type: 'application/vnd.ms-excel' });
      });
  }

  /*public generarReporteConsumoPorGrpDiagMacLT(request: ReporteIndicadoresRequest): Observable<WsResponse> {
    return this.http.post<WsResponse>(`${webServiceEndpoint}pub/generarIndicadorPorMedicamentoGrupoMACLinea`, request, {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    });
  }*/

  public generarReporteConsumoPorGrpDiagMacLT(
    request: ReporteIndicadoresRequest
  ) {
    return this.http
      .post(
        `${webServiceEndpoint}pub/generarIndicadorPorMedicamentoGrupoMACLinea`,
        request,
        {
          headers: new HttpHeaders({
            'Content-type': 'application/json; charset=utf-8',
            authorization: 'Bearer ' + Cookie.get('access_token_fc'),
          }),
          responseType: 'blob',
        }
      )
      .map((res) => {
        return new Blob([res], { type: 'application/vnd.ms-excel' });
      });
  }

  /*public generarReporteConsumoPorGrpDiagMacLTTUso(request: ReporteIndicadoresRequest): Observable<WsResponse> {
    return this.http.post<WsResponse>(`${webServiceEndpoint}pub/generarIndicadorPorMedicamentoGrupoMACLineaTiempo`, request, {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    });
  }*/

  public generarReporteConsumoPorGrpDiagMacLTTUso(
    request: ReporteIndicadoresRequest
  ) {
    return this.http
      .post(
        `${webServiceEndpoint}pub/generarIndicadorPorMedicamentoGrupoMACLineaTiempo`,
        request,
        {
          headers: new HttpHeaders({
            'Content-type': 'application/json; charset=utf-8',
            authorization: 'Bearer ' + Cookie.get('access_token_fc'),
          }),
          responseType: 'blob',
        }
      )
      .map((res) => {
        return new Blob([res], { type: 'application/vnd.ms-excel' });
      });
  }

  public generarReportePaciente(
    request: ReportePacienteRequest
  ): Observable<WsResponse> {
    return this.http.post<WsResponse>(
      `${webServiceEndpoint}pub/reportePacientes`,
      request,
      {
        headers: new HttpHeaders({
          'Content-type': 'application/json; charset=utf-8',
          authorization: 'Bearer ' + Cookie.get('access_token_fc'),
        }),
      }
    );
  }

  public descargarReportePacientes(): Observable<Blob> {
    return this.http.get(`${webServiceEndpoint}pub/downloadFile/pacientes`, { 
      "responseType": 'blob',
      headers: new HttpHeaders({
         'authorization': 'Bearer ' + Cookie.get('access_token_fc')
       }) 
    });
  }

  public downloadPatientActivityLog(): Observable<Blob> {
    return this.http.get(`${webServiceEndpoint}pub/downloadFile/activityLog/pacientes`, { 
      "responseType": 'blob',
      headers: new HttpHeaders({
         'authorization': 'Bearer ' + Cookie.get('access_token_fc')
       }) 
    });
  }

  
}
