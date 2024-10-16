import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { WsResponse } from 'src/app/dto/WsResponse';
import { Observable } from 'rxjs';
import { PdfEvaluacion } from 'src/app/dto/reporte/PdfEvaluacion';
import { webServiceEndpoint } from 'src/app/common';
import { ListaCasosEvaluacion } from 'src/app/dto/solicitudEvaluacion/bandeja/ListaCasosEvaluacion';
import { MonitoreoResponse } from 'src/app/dto/response/BandejaMonitoreo/MonitoreoResponse';
import { EvolucionResponse } from 'src/app/dto/response/BandejaMonitoreo/EvolucionResponse';

@Injectable({
  providedIn: 'root'
})
export class ReporteEvaluacionService {

  constructor(private http: HttpClient) { }

  // public generarReporteAutorizador(request: PdfEvaluacion): Observable<WsResponse> {
  //   const httpOptions = {
  //     headers: new HttpHeaders({
  //       'Content-type': 'application/json; charset=utf-8',
  //       'authorization': 'Bearer ' + Cookie.get('access_token_fc')
  //     })
  //   };
  //   return this.http.post<WsResponse>(`${webServiceEndpoint}api/reporteEvaluacionPdf`, request, httpOptions);
  // }

  public generarReporteMonitoreo(request: MonitoreoResponse): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/generarReportMonitoreo`, request, httpOptions);
  }


  public generarReporteEvolucion(request: EvolucionResponse): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/generarReporteEvolucion`, request, httpOptions);
  }

  public generarReporteAutorizador(request: PdfEvaluacion): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/reporteEvaluacionPdfPrueba`, request, httpOptions);
  }
  public generarReporteGeneral(request: any): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/reporteGeneral`, request, httpOptions);
  }

  public getListaCasosEvaluacion(listaCasosEvaluacion: ListaCasosEvaluacion): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/listaDeCasosPdf`, listaCasosEvaluacion, httpOptions);
  }
}
