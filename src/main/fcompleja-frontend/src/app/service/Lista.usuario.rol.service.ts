import { Injectable } from "@angular/core";
import { webServiceEndpoint } from "../common";
import "rxjs/add/operator/map";
import { Observable } from "rxjs/Observable";
import { HttpClient, HttpHeaders, HttpRequest } from "@angular/common/http";
import { UsrRolResponse } from "../dto/UsrRolResponse";
import { UsrRolRequest } from "../dto/UsrRolRequest";
import { Cookie } from "ng2-cookies/ng2-cookies";
import { DatePipe } from "@angular/common";
import { ParticipanteResponse } from "../dto/response/BandejaEvaluacion/MedicamentoNuevo/ParticipanteResponse";
import { ParticipanteRequest } from "../dto/request/BandejaEvaluacion/ParticipanteRequest";
import { WsResponse } from "../dto/WsResponse";
import { OncoWsResponse } from "../dto/response/OncoWsResponse";

@Injectable({
  providedIn: "root",
})
export class ListaFiltroUsuarioRolservice {
  constructor(private http: HttpClient, private datePipe: DatePipe) {}

  public listarRoles(usrRolRequest: UsrRolRequest): Observable<UsrRolResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
      }),
    };
    return this.http.post<UsrRolResponse>(
      `${webServiceEndpoint}usuarios/portalComun/getListarRoles`,
      usrRolRequest,
      httpOptions
    );
  }

  public listaFilUsrRol(
    usrRolRequest: UsrRolRequest
  ): Observable<UsrRolResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
      }),
    };
    return this.http.post<UsrRolResponse>(
      `${webServiceEndpoint}usuarios/portalComun/getListarUsuariosPorRol`,
      usrRolRequest,
      httpOptions
    );
  }

  public listaUsuarioPorRol(
    usrRolRequest: UsrRolRequest
  ): Observable<UsrRolResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.random() + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    return this.http.post<UsrRolResponse>(
      `${webServiceEndpoint}seguridad/usuario/listarPorRol`,
      usrRolRequest,
      httpOptions
    );
  }

  public listarUsuarioFarmacia(
    request: ParticipanteRequest
  ): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.random() + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    return this.http.post<WsResponse>(
      `${webServiceEndpoint}usuarios/api/listarUsuarioFarmacia`,
      request,
      httpOptions
    );
  }

  public consultarUsuarioRolFarmacia(
    request: UsrRolRequest
  ): Observable<OncoWsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
      }),
    };
    return this.http.post<OncoWsResponse>(
      `${webServiceEndpoint}api/usuario/rol`,
      request,
      httpOptions
    );
  }

  public consultarParticipantesFrecuentes(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.random() + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    return this.http.post<Object>(
      `${webServiceEndpoint}api/listarPartFrecr`,
      data,
      httpOptions
    );
  }

  public listarUsuarioFarmaciaDetallado(
    request: ParticipanteRequest
  ): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.random() + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    return this.http.post<WsResponse>(
      `${webServiceEndpoint}usuarios/api/listarUsuarioFarmaciaDet`,
      request,
      httpOptions
    );
  }

  public listarUsuarioFarmaciaPrueba(
    request: ParticipanteRequest
  ): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        idTransaccion: Math.random() + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    return this.http.post<WsResponse>(
      `${webServiceEndpoint}usuarios/pub/listarUsuarioFarmaciaPrueba`,
      request,
      httpOptions
    );
  }
}
