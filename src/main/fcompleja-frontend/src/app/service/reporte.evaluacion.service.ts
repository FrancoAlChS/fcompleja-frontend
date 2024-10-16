
import { Injectable } from '@angular/core';

import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { SolicitudEvaluacion } from '../dto/solicitudEvaluacion/bandeja/SolicitudEvaluacion';
import { ListaCasosEvaluacion } from '../dto/solicitudEvaluacion/bandeja/ListaCasosEvaluacion';

import { webServiceEndpoint } from '../common';
import { ListaActasCMAC } from '../dto/solicitudEvaluacion/bandeja/ListaActasCMAC';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { DatePipe } from '@angular/common';
import { ArchivoOpen } from '../dto/solicitudEvaluacion/ArchivoOpen';
import { ApiOutResponse } from '../dto/response/ApiOutResponse';
import { WsResponse } from '../dto/WsResponse';

@Injectable({
  providedIn: 'root'
})
export class ReporteEvaluacion {

  constructor(private http: HttpClient, private datePipe: DatePipe) { }

  public getListaEvaluacion(solicitudEvaluacion: SolicitudEvaluacion): Observable<Blob> {
    const headers = new HttpHeaders({
      'Content-type': 'application/json; charset=utf-8',
      'authorization': 'Bearer ' + Cookie.get('access_token_fc')
    });
    return this.http.post<Blob>(
      `${webServiceEndpoint}api/reporteEvaluacionPdf`,
      solicitudEvaluacion,
      { headers: headers, responseType: 'blob' as 'json' });
  }

  public getListaActasMac(listaActasCMAC: ListaActasCMAC): Observable<ApiOutResponse> {
    const headers = new HttpHeaders({
      'Content-type': 'application/json; charset=utf-8',
      'authorization': 'Bearer ' + Cookie.get('access_token_fc')
    });
    return this.http.post<ApiOutResponse>(`${webServiceEndpoint}api/listaActasMACPdf`, listaActasCMAC, { headers: headers });
  }

  public obtenerArchivoFTP(archivoOpen: ArchivoOpen): Observable<Blob> {
    return this.http.post(`${webServiceEndpoint}api/obtenerArchivo`, archivoOpen, { responseType: 'blob' });
  }
}
