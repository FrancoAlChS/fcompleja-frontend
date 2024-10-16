import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { WsResponseOnco } from 'src/app/dto/WsResponseOnco';
import { Observable } from 'rxjs';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { webServiceEndpoint } from 'src/app/common';
import { ParametroBeanRequest } from 'src/app/dto/ParametroBeanRequest';
import { AplicacionBeanRequest } from 'src/app/dto/AplicacionBeanRequest';

@Injectable({
    providedIn: 'root'
})

export class ParametroService {

    constructor(private http: HttpClient) { }

    public buscarParametro(request: ParametroBeanRequest): Observable<WsResponseOnco> {
        const httpOptions = {
            headers: new HttpHeaders({
              'Content-type': 'application/json; charset=utf-8',
              'authorization': 'Bearer ' + Cookie.get('access_token_fc')
            })
        };
        return this.http.post<WsResponseOnco>(`${webServiceEndpoint}parametro-backend/buscar`, request, httpOptions);
    }

    public buscarAplicacion(request: AplicacionBeanRequest): Observable<WsResponseOnco> {
        const httpOptions = {
            headers: new HttpHeaders({
              'Content-type': 'application/json; charset=utf-8',
              'authorization': 'Bearer ' + Cookie.get('access_token_fc')
            })
        };
        return this.http.post<WsResponseOnco>(`${webServiceEndpoint}api/obtenerAplicacion`, request, httpOptions);
    }
    
}