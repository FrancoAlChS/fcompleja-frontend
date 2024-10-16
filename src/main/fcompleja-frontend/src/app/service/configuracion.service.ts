import { Injectable } from '@angular/core';
import { webServiceEndpoint } from '../common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/publish';
import { Observable } from 'rxjs/Observable';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { FiltroMACResponse } from '../dto/configuracion/FiltroMACResponse';
import { WsResponse } from '../dto/WsResponse';
import { WsResponseOnco } from '../dto/WsResponseOnco';
import { CodigoCheckList } from '../dto/configuracion/CodigoCheckList';
import { CheckListDTO } from '../dto/configuracion/CheckListDTO';
import { CriteriosDTO } from '../dto/configuracion/CriteriosDTO';
import { MACResponse } from '../dto/configuracion/MACResponse';
import { FichaTecnica } from '../dto/configuracion/FichaTecnica';
import { BuscarGrupoDiagnosticoRequest } from '../dto/request/BuscarGrupoDiagnosticoRequest';
import { DiagnosticoDTO } from '../dto/configuracion/DiagnosticoDTO';
import { FiltroDIAGNOSTICOResponse } from '../dto/configuracion/FiltroDIAGNOSTICOResponse';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracionService {

  httpOptions: any;

  constructor(private http: HttpClient) {}

  private handleError(error: any): Observable<string> {
    return Observable.throw(error.json() || 'Server error');
  }

  public filtrarMAC(request: MACResponse): Observable<FiltroMACResponse> {
    return this.http.post<FiltroMACResponse>(`${webServiceEndpoint}api/filtrarMac`, request, this.httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    });
  }

  public filtrarDIAGNOSTICO(request: DiagnosticoDTO): Observable<FiltroDIAGNOSTICOResponse> {
    return this.http.post<FiltroDIAGNOSTICOResponse>(`${webServiceEndpoint}api/filtrarGrpDiag`, request, this.httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    });
  }

  public listarGrupoDiagnostico(): Observable<WsResponseOnco> {
    return this.http.get<WsResponseOnco>(`${webServiceEndpoint}api/listarGrupoDiagnostico`, this.httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    });
  }

  public buscarGrupoDiagnostico(request: BuscarGrupoDiagnosticoRequest): Observable<WsResponseOnco> {
    return this.http.post<WsResponseOnco>(`${webServiceEndpoint}api/buscarGrupoDiagnostico`, request, this.httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    });
  }

  public listCheckListConfig(request: CodigoCheckList): Observable<WsResponseOnco> {
    return this.http.post<WsResponseOnco>(`${webServiceEndpoint}api/listCheckListConfig`, request, this.httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    });
  }

  public registroCheckListConfig(request: CheckListDTO): Observable<WsResponse> {
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/registroCheckListConfig`, request, this.httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    });
  }

  public listarCriterioInclusion(request: CheckListDTO): Observable<WsResponseOnco> {
    return this.http.post<WsResponseOnco>(`${webServiceEndpoint}api/listarCriterioInclusion`, request, this.httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    });
  }

  public listarCriterioExclusion(request: CheckListDTO): Observable<WsResponseOnco> {
    return this.http.post<WsResponseOnco>(`${webServiceEndpoint}api/listarCriterioExclusion`, request, this.httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    });
  }

  public registroCriterioInclusion(request: CriteriosDTO): Observable<WsResponse> {
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/registroCriterioInclusion`, request, this.httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    });
  }

  public registroCriterioExclusion(request: CriteriosDTO): Observable<WsResponse> {
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/registroCriterioExclusion`, request, this.httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    });
  }

  public listarFichasTecnicas(request: FichaTecnica): Observable<WsResponse> {
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/listaVersionFichaTecnica`, request, this.httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    });
  }

  importarArchivo(codUsuario, nombres, request) {
    const httpOptions = {
      headers: new HttpHeaders({
        authorization: "Bearer " + Cookie.get("access_token_fc"),
      }),
    };

    const formData = new FormData();
    formData.append("file", request);
    formData.append("codUsuario", codUsuario);
    formData.append("nombres", nombres);

    return this.http.post<Object>(
      `${webServiceEndpoint}api/importarArchivoMarcadores`,
      formData,
      httpOptions
    );
  }
}
