import { Injectable } from '@angular/core';



import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';

import { ApiResponse } from '../../dto/bandeja-preliminar/detalle-preliminar/ApiResponse';
import { webServiceEndpoint } from '../../common';
import { InfoSCGSolbenApi } from '../../dto/bandeja-preliminar/detalle-preliminar/InfoSCGSolbenApi';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { InformacionScgRequest } from 'src/app/dto/bandeja-preliminar/detalle-preliminar/InformacionScgRequest';

@Injectable({
  providedIn: 'root'
})
export class DetalleSolicitudPreliminarService {

  constructor(private http: HttpClient) { }

  public getInfoScg(request: InformacionScgRequest): Observable<InfoSCGSolbenApi> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };
    return this.http.post<InfoSCGSolbenApi>(`${webServiceEndpoint}api/informacionScgPre`, request, httpOptions);
  }

  public updateEstadoSolicitudPreliminar(request: InformacionScgRequest): Observable<ApiResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };
    return this.http.post<ApiResponse>(`${webServiceEndpoint}api/updateEstadoSolicitudPreliminar`, request, httpOptions);
  }

  public updateEstadoPendInscripcionMAC(request: InformacionScgRequest): Observable<ApiResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };
    return this.http.post<ApiResponse>(`${webServiceEndpoint}api/updateEstadoPendInscriptionMAC`, request, httpOptions);
  }
}
