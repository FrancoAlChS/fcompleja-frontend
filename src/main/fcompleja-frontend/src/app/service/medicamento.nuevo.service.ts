import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

import { webServiceEndpoint } from '../common';
import { ApiOutResponse } from '../dto/response/ApiOutResponse';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})

export class MedicamentoNuevoService {

  constructor(private http: HttpClient) { }

  public cargarArchivo(request): Observable<ApiOutResponse> {
    return this.http.post<ApiOutResponse>(`${webServiceEndpoint}api/insActCheckListReqDocumento`, request);
  }

  public eliminarArchivo(request): Observable<ApiOutResponse> {
    return this.http.post<ApiOutResponse>(`${webServiceEndpoint}api/actualizarEliminacionDocumento`, request);
  }

}
