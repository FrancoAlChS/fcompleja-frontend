import { Injectable } from '@angular/core';
import { webServiceEndpoint } from '../common';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs/Observable';
import {HttpClient, HttpHeaders,HttpRequest} from '@angular/common/http';
import {RolResponsableResponse} from '../dto/RolResponsableResponse';
import { Cookie } from 'ng2-cookies/ng2-cookies';

@Injectable({
    providedIn: 'root'
})

export class RolResponsableService {

    constructor(private http: HttpClient){}

    /**
     * getListaRolResponsableService
     *
     */
    public getListaRolResponsableService(): Observable<RolResponsableResponse> {
        let httpOptions = {
            headers: new HttpHeaders({ 'Content-type': 'application/json; charset=utf-8', 'authorization': 'Bearer ' + Cookie.get('access_token_fc') })
        };
        return this.http.get<RolResponsableResponse>(`${webServiceEndpoint}api/RolResponsable`,httpOptions);
    }
}
