import { Injectable } from '@angular/core';
import { webServiceEndpoint } from '../common';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Observable } from 'rxjs/Observable';
import { OncoWsResponse } from '../dto/response/OncoWsResponse';
import { DatePipe } from '@angular/common';
import { WsResponse } from '../dto/WsResponse';
import { ArchivoRequest } from '../dto/request/ArchivoRequest';
import { ArchivoFTP } from '../dto/bandeja-preliminar/detalle-preliminar/ArchivoFTP';

@Injectable({
  providedIn: 'root'
})
export class CoreService {

  constructor(private http: HttpClient, private datePipe: DatePipe) { }

  /**
   *
   * @param codUsuario
   * Proposito : Listar Menu con las opciones de botonones, menu
   */
  public ConsultarMenu(codUsuario: number,tt: string): Observable<OncoWsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
        'idTransaccion': Math.random() + '',
        'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy')
      })
    };
    return this.http.post<OncoWsResponse>(`${webServiceEndpoint}api/menu`, { codUsuario: codUsuario,tokenTemporal: tt  }, httpOptions);
  }

  public consultarUsuarioRol(codUsuario: number): Observable<OncoWsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc'),
        'idTransaccion': Math.random() + '',
        'fechaTransaccion': this.datePipe.transform(new Date(), 'dd/MM/yyyy')
      })
    };
    return this.http.post<OncoWsResponse>(`${webServiceEndpoint}api/usuarioRolAseg`, { codUsuario: codUsuario }, httpOptions);
  }

  public subirArchivo(request: ArchivoRequest): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };

    const formData = new FormData();
    formData.append('file', request.archivo);
    formData.append('nomArchivo', request.nomArchivo);
    formData.append('ruta', request.ruta);

    return this.http.post<WsResponse>(`${webServiceEndpoint}api/subirArchivo`, formData, httpOptions);
  }

  public descargarArchivoFTP(request: ArchivoFTP): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/descargarArchivo`, request, httpOptions);
  }

  public padLeft(text: string, padChar: string, size: number): string {
    return (String(padChar).repeat(size) + text).substr((size * -1), size);
  }

  public crearBlobFile(data: ArchivoFTP): Blob {
    const byteCharacters = atob(data.archivo);
    const byteNumbers = new Array(byteCharacters.length);
    
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: data.contentType });
    const resultBlob: any = blob;
    resultBlob.lastModifiedDate = new Date();
    resultBlob.name = data.nomArchivo;
    
    return blob;
  }

  public blobToFile = (theBlob: Blob, fileName: string): File => {
    const b: any = theBlob;
    b.lastModifiedDate = new Date();
    b.name = fileName;
    return <File>theBlob;
  }

  public date(value: Date): boolean {
    const dateRegEx = new RegExp(/^\d{2}\.\d{2}\.\d{4}$/);
    return dateRegEx.test(this.datePipe.transform(value, 'dd/MM/yyyy')) ? false : true;
  }
}
