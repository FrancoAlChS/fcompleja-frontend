import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Cookie } from "ng2-cookies/ng2-cookies";
import { Observable } from "rxjs";
import { webServiceEndpoint } from "../../common";
import { DatePipe } from "@angular/common";
import { ListaConsumosRequest } from "../../dto/controlGasto/ListaConsumosRequest";
import { WsResponseGasto } from "../../dto/WsResponseGasto";
import { ArchivoFTP } from "../../dto/bandeja-preliminar/detalle-preliminar/ArchivoFTP";
import { WsResponse } from "../../dto/WsResponse";
import moment from "moment";

@Injectable({
  providedIn: "root",
})
export class DiagnosticoModuleService {
  constructor(private http: HttpClient, private datePipe: DatePipe) {}

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
      `${webServiceEndpoint}api/importarArchivoGrpDiag`,
      formData,
      httpOptions
    );
  }

  descargarDiagnostico() {
    // const formData = new FormData();
    // formData.append('file', request);
    // formData.append('codUsuario', codUsuario);
    // formData.append('nombres', nombres);

    return this.http
      .post(
        `${webServiceEndpoint}pub/descargaReporteGrpDiag`,
        {},
        {
          headers: new HttpHeaders({
            idTransaccion: moment().unix().toString(),
            fechaTransaccion: moment().format("DD/MM/YYYY HH:mm:ss"),
            "Content-type": "application/json; charset=utf-8",
            authorization: "Bearer " + Cookie.get("access_token_fc"),
          }),
          responseType: "blob",
        }
      )
      .map((res) => {
        return new Blob([res], { type: "application/vnd.ms-excel" });
      });
  }
}
