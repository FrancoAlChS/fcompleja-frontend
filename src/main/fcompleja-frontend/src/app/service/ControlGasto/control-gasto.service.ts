import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Cookie} from 'ng2-cookies/ng2-cookies';
import {Observable} from 'rxjs';
import {webServiceEndpoint} from '../../common';
import {DatePipe} from '@angular/common';
import {ListaConsumosRequest} from '../../dto/controlGasto/ListaConsumosRequest';
import {WsResponseGasto} from '../../dto/WsResponseGasto';
import {ArchivoFTP} from '../../dto/bandeja-preliminar/detalle-preliminar/ArchivoFTP';
import {WsResponse} from '../../dto/WsResponse';

@Injectable({
  providedIn: 'root'
})
export class ControlGastoService {
  constructor(private http: HttpClient, private datePipe: DatePipe) {
  }

  importarArchivo(codUsuario, nombres, request): Observable<WsResponseGasto> {

    const httpOptions = {
      headers: new HttpHeaders({
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };

    const formData = new FormData();
    formData.append('file', request);
    formData.append('codUsuario', codUsuario);
    formData.append('nombres', nombres);

    return this.http.post<WsResponseGasto>(`${webServiceEndpoint}api/importarArchivo`, formData, httpOptions);
  }

  listarArchivos(request: ListaConsumosRequest): Observable<WsResponseGasto> {
    return this.http.post<WsResponseGasto>(`${webServiceEndpoint}api/ListarHistorialCarga`, request,
      {
          headers: new HttpHeaders({
            'Content-type': 'application/json; charset=utf-8',
            'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
            'idTransaccion': Math.random() + '',
            'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy')
          })
        });
  }

  obtenerParametro(): Observable<any> {
    return this.http.post<any>(`${webServiceEndpoint}api/listaParametros`, null,
      {
        headers: new HttpHeaders({
          'Content-type': 'application/json; charset=utf-8',
          'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
          'idTransaccion': Math.random() + '',
          'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy')
        })
      });
  }

  getArchivoLog(request: ArchivoFTP): Observable<WsResponse> {
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/obtieneArchivoLog`, request,
      // return this.http.post<WsResponse>(`${webServiceEndpoint}api/descargarArchivo`, request,
      {
        headers: new HttpHeaders({
          'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
          'Content-type': 'application/json; charset=utf-8',
          'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy'),
          'authorization': 'Bearer ' + Cookie.get('access_token_fc')
        })
      });
  }

  getArchivoXls(request: ArchivoFTP): Observable<WsResponse> {
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/obtieneArchivoXls`, request,
    // return this.http.post<WsResponse>(`${webServiceEndpoint}api/descargarArchivo`, request,
      {
        headers: new HttpHeaders({
          'Content-type': 'application/json; charset=utf-8',
          'idTransaccion': Math.floor(Math.random() * (9999 - 1)) + 1 + '',
          'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy'),
          'authorization': 'Bearer ' + Cookie.get('access_token_fc')
        })
      });
  }

}
