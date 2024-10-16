import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/publish';
import { webServiceEndpoint } from 'src/app/common';
import { WsResponse } from 'src/app/dto/WsResponse';
import { GenerarReportesGeneralesMoniRequests } from 'src/app/dto/configuracion/GenerarReportesGeneralesMoniRequets';
import { ReporteIndicadoresRequest } from 'src/app/dto/configuracion/ReporteIndicadoresRequest';
// import { reserveSlots } from '@angular/core/src/render3/instructions';
import { generarReportesGeneralesAutRequest } from 'src/app/dto/configuracion/generarReportesGeneralesAutRequest';

@Injectable({
  providedIn: 'root'
})
export class ReportesGeneralesService {

  constructor(private http: HttpClient) { }

  public generarReporteSolicitudAutorizaciones(request: generarReportesGeneralesAutRequest): Observable<Blob> {
    return this.http.get(`${webServiceEndpoint}pub/downloadFile/autorizaciones`, { 
      "responseType": 'blob',
      headers: new HttpHeaders({
         'authorization': 'Bearer ' + Cookie.get('access_token_fc')
       }) 
    });

    // return this.http.get<WsResponse>(`${webServiceEndpoint}pub/downloadFile/autorizaciones`, {
    //   headers: new HttpHeaders({
    //     'authorization': 'Bearer ' + Cookie.get('access_token_fc')
    //   })
    // });
  }
  /**
   * Proposito: Reportes Generales Autorizador
   * @param request
   */
  public generarReportesGenerales(request: ReporteIndicadoresRequest): Observable<WsResponse> {
    return this.http.post<WsResponse>(`${webServiceEndpoint}pub/generarReportesGenerales`, request, {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    });
  }

  /**
   * Proposito: Reportes Generales Monitoreo
   
   */
  public generarReporteMonitoreo(request: GenerarReportesGeneralesMoniRequests): Observable<Blob> {
    return this.http.get(`${webServiceEndpoint}pub/downloadFile/monitoreo`, {
      "responseType": 'blob',
      headers: new HttpHeaders({
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    });
  }


  public generarReportesGeneralesAut(request: GenerarReportesGeneralesMoniRequests): Observable<WsResponse> {
    return this.http.post<WsResponse>(`${webServiceEndpoint}pub/reporteAutorizaciones`, request, {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    });
  }

  // Verificar estado de archivo
  /*
    FechaIni: "",
    FechaFin: "",
    Status: "completed" | "in progress" | "pending" | "download" | "error"
    Type: "Autorizaciones"
    FechaCreacion: ""
    verificarEstadoArchivo/"autorizaciones" | "monitoreo" | "paciente"
  */
  public verificarEstadoArchivo():Observable<WsResponse>{
    return this.http.get<WsResponse>(`${webServiceEndpoint}pub/estadoSolicitudReportes`, {
      headers: new HttpHeaders({
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    })
  }

  

  // public generarReporteMonitoreo(request: GenerarReportesGeneralesMoniRequests) {
  //   return this.http.post(`${webServiceEndpoint}pub/generarReporteMonitoreo`, request, {
  //     headers: new HttpHeaders({
  //       'Content-type': 'application/json; charset=utf-8',
  //       'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
  //     }),
  //     responseType: 'blob'
  //   })
  //   .map(
  //     (res) => {
  //       
  //         return new Blob([res], { type: 'application/vnd.ms-excel' });
  //     }
  //   );
  // }


  public generarReportesGeneralesMoni(request: GenerarReportesGeneralesMoniRequests): Observable<WsResponse> {
    return this.http.post<WsResponse>(`${webServiceEndpoint}pub/reporteMonitoreo`, request, {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    });
  }

  public downloadLogAuthorizationActivities(): Observable<Blob> {
    return this.http.get(`${webServiceEndpoint}pub/downloadFile/activityLog/autorizaciones`, { 
      "responseType": 'blob',
      headers: new HttpHeaders({
         'authorization': 'Bearer ' + Cookie.get('access_token_fc')
       }) 
    });  
  }

  public downloadLogMonitoringActivities(): Observable<Blob> {
    return this.http.get(`${webServiceEndpoint}pub/downloadFile/activityLog/monitoreo`, { 
      "responseType": 'blob',
      headers: new HttpHeaders({
         'authorization': 'Bearer ' + Cookie.get('access_token_fc')
       }) 
    });  
  }

}
