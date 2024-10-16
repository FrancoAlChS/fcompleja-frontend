import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { webServiceEndpoint } from 'src/app/common';
import { Observable } from 'rxjs';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { WsResponseOnco } from 'src/app/dto/WsResponseOnco';
import { BuscarUsuarioRequest } from 'src/app/dto/request/BuscarUsuarioRequest';
import { UsuarioRequest } from 'src/app/dto/request/UsuarioRequest';


@Injectable({
    providedIn: 'root'
})

export class UsuarioMantenimientoService {

    constructor(private http: HttpClient) { }

    public buscarUsuario(request: BuscarUsuarioRequest): Observable<WsResponseOnco> {
        const httpOptions = {
            headers: new HttpHeaders({
              'Content-type': 'application/json; charset=utf-8',
              'authorization': 'Bearer ' + Cookie.get('access_token_fc')
            })
        };
        return this.http.post<WsResponseOnco>(`${webServiceEndpoint}usuarios/portalComun/listarUsuariosSeguridad`, request, httpOptions);
    }

    public registrarUsuario(request: UsuarioRequest): Observable<WsResponseOnco> {
        const httpOptions = {
            headers: new HttpHeaders({
              'Content-type': 'application/json; charset=utf-8',
              'authorization': 'Bearer ' + Cookie.get('access_token_fc')
            })
        };
        return this.http.post<WsResponseOnco>(`${webServiceEndpoint}usuarios/registrar`, request, httpOptions);
    }

    public editarUsuario(request: UsuarioRequest): Observable<WsResponseOnco> {
        const httpOptions = {
            headers: new HttpHeaders({
              'Content-type': 'application/json; charset=utf-8',
              'authorization': 'Bearer ' + Cookie.get('access_token_fc')
            })
        };
        return this.http.post<WsResponseOnco>(`${webServiceEndpoint}usuarios/actualizar`, request, httpOptions);
    }
    
}