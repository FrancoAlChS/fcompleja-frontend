import { Injectable } from '@angular/core';
import { webServiceEndpoint } from '../../common';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { WsResponse } from '../../dto/WsResponse';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { ListaEvaluacionesRequest } from 'src/app/dto/solicitudEvaluacion/bandeja/ListaEvaluacionesRequest';

@Injectable({
  providedIn: 'root'
})

export class SeguimientoEvaluacionService {

  constructor(private http: HttpClient, private datePipe: DatePipe) { }
  /**
   * Listar Seguimiento de Medicamento Nuevo
   * @param request
   */
  public listaSeguimiento(request): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'idTransaccion': Math.random() + '',
        'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy'),
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/consultarSeguimiento`, request, httpOptions);
  }

  public consultarInformAutorizYCmac(request:ListaEvaluacionesRequest): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'idTransaccion': Math.random() + '',
        'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy'),
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/consultarInformAutorizYCmac`, request, httpOptions);
  }
}
