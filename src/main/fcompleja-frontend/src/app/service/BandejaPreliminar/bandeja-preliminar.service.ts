import { Injectable } from '@angular/core';
import { webServiceEndpoint } from '../../common';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { WsResponseOnco } from '../../dto/WsResponseOnco';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Injectable({
  providedIn: 'root'
})

export class BandejaPreliminarService {

  constructor(private http: HttpClient, private datePipe: DatePipe) { }

  public listarDetalleSolicitud(listaSolicitudesRequest): Observable<WsResponseOnco> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };
    return this.http.post<WsResponseOnco>(`${webServiceEndpoint}api/BandejaSolicitudes`, listaSolicitudesRequest, httpOptions);
  }
}
