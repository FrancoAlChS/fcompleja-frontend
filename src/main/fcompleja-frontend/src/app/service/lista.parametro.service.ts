import { Injectable } from "@angular/core";
import { webServiceEndpoint } from "../common";
import "rxjs/add/operator/map";
import { Observable } from "rxjs/Observable";
import { HttpClient, HttpHeaders, HttpRequest } from "@angular/common/http";
import { ParametroResponse } from "../dto/ParametroResponse";
import { WsResponse } from "../dto/WsResponse";
import { DatePipe } from "@angular/common";
import { Cookie } from "ng2-cookies/ng2-cookies";

@Injectable({
  providedIn: "root",
})
export class ListaParametroservice {
  constructor(private http: HttpClient, private datePipe: DatePipe) {}

  public listaParametro(request): Observable<ParametroResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
      }),
    };
    return this.http.post<ParametroResponse>(
      `${webServiceEndpoint}api/parametro`,
      request,
      httpOptions
    );
  }

  public listaParametroEvaluacionGrilla(): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
      }),
    };
    return this.http.post<WsResponse>(
      `${webServiceEndpoint}api/obtenerParametroBandEval`,
      "",
      httpOptions
    );
  }

  /*public listaComite(): Observable<ParametroResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
      }),
    };
    return this.http.post<ParametroResponse>(
      `${webServiceEndpoint}/api/listarComitte`,{},
      httpOptions
    );
  }*/

  public listaComiteFiltro(request): Observable<ParametroResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
      }),
    };
    return this.http.post<ParametroResponse>(
      `${webServiceEndpoint}api/listarComitte`,request,
      httpOptions
    );
  }

  public parametro(request): Observable<ParametroResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
      }),
    };
    return this.http.post<ParametroResponse>(
      `${webServiceEndpoint}api/ControlParametro`,
      request,
      httpOptions
    );
  }

  public consultarParametro(request): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.random() + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    return this.http.post<WsResponse>(
      `${webServiceEndpoint}api/consultaParam`,
      request,
      httpOptions
    );
  }

  public consultarPValidacionAutorizador(request): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.random() + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    return this.http.post<WsResponse>(
      `${webServiceEndpoint}api/consultaEvaluacionLiderTumor`,
      request,
      httpOptions
    );
  }
}
