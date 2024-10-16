import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';
import {OncoWsResponse} from '../dto/response/OncoWsResponse';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Cookie} from 'ng2-cookies/ng2-cookies';
import {webServiceEndpoint} from '../common';
import {DatePipe} from '@angular/common';
import {RecoverAccountRequest} from '../dto/RecoverAccountRequest';

@Injectable({
  providedIn: 'root'
})
export class RecuperarCuentaService {

  constructor(private http: HttpClient,
              private datePipe: DatePipe) { }

  sendEmail(account: RecoverAccountRequest ): Observable<OncoWsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        //'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
        'idTransaccion': Math.random() + '',
        'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy')
      })
    };
    return this.http.post<OncoWsResponse>(`${webServiceEndpoint}credencial/recuperar`, account,httpOptions);
  }

  cambiarCredenciales(account: RecoverAccountRequest ): Observable<OncoWsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
        'idTransaccion': Math.random() + '',
        'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy')
      })
    };
    return this.http.post<OncoWsResponse>(`${webServiceEndpoint}credencial/cambiar`, account,
      httpOptions);
  }
}
