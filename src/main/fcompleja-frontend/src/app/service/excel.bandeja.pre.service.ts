import { Injectable } from '@angular/core';
import { webServiceEndpoint } from '../common';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ExcelDownloadResponse } from '../dto/ExcelDownloadResponse';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Injectable({
  providedIn: 'root'
})

export class ExcelExportService {

  headers: HttpHeaders;
  httpOptions: {};

  constructor(private http: HttpClient) {
    /*this.httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };*/
  }

  public ExportExcelBandejaPre(ListaSolicitudesRequest): Observable<ExcelDownloadResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };
    return this.http.post<ExcelDownloadResponse>(`${webServiceEndpoint}downloadPreliminar/`, ListaSolicitudesRequest, httpOptions);
  }

  public ExportExcelBandejaEva(ListaEvaluacionesRequest): Observable<ExcelDownloadResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };
    return this.http.post<ExcelDownloadResponse>(`${webServiceEndpoint}downloadEvaluacion/`, ListaEvaluacionesRequest, httpOptions);
  }

  public ExportExcelBandejaMonitoreo(ListaEvaluacionesRequest): Observable<ExcelDownloadResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };
    return this.http.post<ExcelDownloadResponse>(`${webServiceEndpoint}downloadMonitoreo/`, ListaEvaluacionesRequest, httpOptions);
  }
}
