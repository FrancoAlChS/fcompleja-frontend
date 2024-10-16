import { Injectable } from "@angular/core";
import { webServiceEndpoint } from "../common";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import "rxjs/add/operator/map";
import "rxjs/add/operator/publish";
import { Observable } from "rxjs/Observable";
import { EmailSolicInscripResponse } from "../dto/EmailSolicInscripResponse";
import { ApiResponse } from "../dto/bandeja-preliminar/detalle-preliminar/ApiResponse";
import { Cookie } from "ng2-cookies/ng2-cookies";
import { ApiResponseFTP } from "../dto/bandeja-preliminar/detalle-preliminar/ApiResponseFTP";
import { MACResponse } from "../dto/configuracion/MACResponse";
import { WsResponse } from "../dto/WsResponse";
import { WsResponseOnco } from "../dto/WsResponseOnco";

@Injectable({
  providedIn: "root",
})
export class MacService {
  constructor(private http: HttpClient) {}

  public registrarMac(request: MACResponse): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
      }),
    };
    return this.http.post<WsResponse>(
      `${webServiceEndpoint}api/registrarMac`,
      request,
      httpOptions
    );
  }

  public getBusquedaMac(request: MACResponse): Observable<WsResponseOnco> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
      }),
    };
    return this.http.post<WsResponseOnco>(
      `${webServiceEndpoint}api/lstMacMedicamento`,
      request,
      httpOptions
    );
  }
  public getMac() {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
      }),
    };
    return this.http.get<WsResponseOnco>(
      `${webServiceEndpoint}api/lstMacMedicamento`,
      httpOptions
    );
  }

  public enviarSolicitudInscrip(
    file,
    nombreMac,
    medicoTratante,
    nroScgSolben,
    medicoAuditor
  ) {
    const formData = new FormData();
    formData.append("file", file, file.name);
    formData.append("nombreMac", nombreMac);
    formData.append("medicoTratante", medicoTratante);
    formData.append("nroScgSolben", nroScgSolben);
    formData.append("medicoAuditor", medicoAuditor);

    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
      }),
    };

    return this.http.post<EmailSolicInscripResponse[]>(
      `${webServiceEndpoint}pub/solicitudInscrip`,
      formData,
      httpOptions
    );
  }

  public actualizarEstadoPreliminar(request): Observable<ApiResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
      }),
    };

    return this.http.post<ApiResponse>(
      `${webServiceEndpoint}api/actualizarEstado`,
      request,
      httpOptions
    );
  }

  public sendFTP(request): Observable<ApiResponseFTP> {
    const httpOptions = {
      headers: new HttpHeaders({
        authorization: "Bearer " + Cookie.get("access_token_fc"),
      }),
    };

    const formData = new FormData();
    formData.append("nomArchivo", request.nomArchivo);
    formData.append("file", request.archivo);
    formData.append("ruta", request.ruta);

    return this.http.post<ApiResponseFTP>(
      `${webServiceEndpoint}api/subirArchivo`,
      formData,
      httpOptions
    );
  }
}
