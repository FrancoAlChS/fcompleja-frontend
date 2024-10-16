import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/publish';
import { ReporteIndicadoresRequest } from 'src/app/dto/configuracion/ReporteIndicadoresRequest';
import { WsResponse } from 'src/app/dto/WsResponse';
import { Observable } from 'rxjs';
import { webServiceEndpoint } from 'src/app/common';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Injectable({
  providedIn: 'root'
})
export class ReportesIndicadoresService {
  constructor(private http: HttpClient) { }

  public generarIndicador(request: ReporteIndicadoresRequest): Observable<WsResponse> {
    return this.http.post<WsResponse>(`${webServiceEndpoint}pub/generarIndicador`, request, {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    });
  }

  public descargarIndicadorExcel(request: ReporteIndicadoresRequest): Observable<WsResponse> {
    return this.http.post<WsResponse>(`${webServiceEndpoint}pub/descargarIndicadorExcel`, request, {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    });
  }
}
