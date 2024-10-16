import { Injectable } from "@angular/core";
import { webServiceEndpoint } from "../../common";
import "rxjs/add/operator/map";
import { Observable } from "rxjs/Observable";
import { HttpClient, HttpHeaders, HttpRequest } from "@angular/common/http";
import { DatePipe } from "@angular/common";
import { WsResponse } from "../../dto/WsResponse";
import { Cookie } from "ng2-cookies/ng2-cookies";
import { ArchivoFTP } from "src/app/dto/bandeja-preliminar/detalle-preliminar/ArchivoFTP";
import { ProgramacionCmacRequest } from "src/app/dto/request/ProgramacionCmacRequest";

@Injectable({
  providedIn: "root",
})
export class EvaluacionCmacService {
  codCmacPDF: number;
  constructor(private http: HttpClient, private datePipe: DatePipe) {}
  /**
   * Elimican evaluacion cmac
   * @param request
   */
  public eliminarEvaluacionCmac(request): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        idTransaccion: Math.random() + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
      }),
    };
    return this.http.post<WsResponse>(
      `${webServiceEndpoint}api/eliminarRegEvaluacionCmac`,
      request,
      httpOptions
    );
  }

  public getPdfEvaluacionCmac(request: ArchivoFTP): Observable<WsResponse> {
    return this.http.post<WsResponse>(
      `${webServiceEndpoint}api/descargarArchivo`,
      request,
      {
        headers: new HttpHeaders({
          idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
          fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
          "Content-type": "application/json; charset=utf-8",
          authorization: "Bearer " + Cookie.get("access_token_fc"),
        }),
      }
    );
  }

  public actualizarActaEscanProgramacionCmac(
    request: ProgramacionCmacRequest
  ): Observable<WsResponse> {
    return this.http.post<WsResponse>(
      `${webServiceEndpoint}api/actualizarActaEscanProgramacionCmac`,
      request,
      {
        headers: new HttpHeaders({
          idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
          fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
          "Content-type": "application/json; charset=utf-8",
          authorization: "Bearer " + Cookie.get("access_token_fc"),
        }),
      }
    );
  }

  public consultarLevantaObser(data) {
    return this.http.post<Object>(
      `${webServiceEndpoint}api/consultarLevantaObser`,
      data,
      {
        headers: new HttpHeaders({
          idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
          fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
          "Content-type": "application/json; charset=utf-8",
          authorization: "Bearer " + Cookie.get("access_token_fc"),
        }),
      }
    );
  }

  public registrarLevantaObser(data) {
    return this.http.post<Object>(
      `${webServiceEndpoint}api/registrarLevantaObser`,
      data,
      {
        headers: new HttpHeaders({
          idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
          fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
          "Content-type": "application/json; charset=utf-8",
          authorization: "Bearer " + Cookie.get("access_token_fc"),
        }),
      }
    );
  }

  public validarExistenciaParticipante(data) {
    return this.http.post<Object>(
      `${webServiceEndpoint}usuarios/api/validarExistenciaParticipante`,
      data,
      {
        headers: new HttpHeaders({
          idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
          fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
          "Content-type": "application/json; charset=utf-8",
          authorization: "Bearer " + Cookie.get("access_token_fc"),
        }),
      }
    );
  }

  public registrarParticipantesFrecuentes(data) {
    return this.http.post<Object>(
      `${webServiceEndpoint}api/registrarPartFrecr`,
      data,
      {
        headers: new HttpHeaders({
          idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
          fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
          "Content-type": "application/json; charset=utf-8",
          authorization: "Bearer " + Cookie.get("access_token_fc"),
        }),
      }
    );
  }

  public agregarRegEvaluacionCmac(data) {
    return this.http.post<Object>(
      `${webServiceEndpoint}api/agregarRegEvaluacionCmac`,
      data,
      {
        headers: new HttpHeaders({
          idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
          fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
          "Content-type": "application/json; charset=utf-8",
          authorization: "Bearer " + Cookie.get("access_token_fc"),
        }),
      }
    );
  }
}
