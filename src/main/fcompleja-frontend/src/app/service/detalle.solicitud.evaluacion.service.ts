import { Injectable, Pipe } from "@angular/core";

import "rxjs/add/operator/map";
import { Observable } from "rxjs/Observable";
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { ApiResponse } from "../dto/bandeja-preliminar/detalle-preliminar/ApiResponse";
import { ApiOutResponse } from "../dto/response/ApiOutResponse";

import { webServiceEndpoint } from "../common";
import { DocuHistPacienteResponse } from "../dto/response/DocuHistPacienteResponse";
import { ApiListaIndicador } from "../dto/response/ApiListaIndicador";
import { InsertLineaTratamientoResponse } from "../dto/response/insertaLineaTratamientoResponse";
import { WsResponse } from "../dto/WsResponse";
import { DatePipe } from "@angular/common";
import { CheckListRequisitoRequest } from "../dto/request/CheckListRequisitoRequest";
import { Cookie } from "ng2-cookies/ng2-cookies";
import { InformeSolEvaReporteRequest } from "../dto/solicitudEvaluacion/detalle/InformacionScgEvaRequest";
import { CheckListPacPrefeInstiRequest } from "../dto/request/CheckListPacPrefeInstiRequest";
import { SolicitudEvaluacionRequest } from "../dto/request/SolicitudEvaluacionRequest";
import { MonitoreoEvolucionRequest } from "../dto/request/BandejaEvaluacion/MonitoreoEvolucionRequest";
import { ContinuadorRequest } from "../dto/request/ContinuadorRequest";
import { InfoSolben } from '../dto/bandeja-preliminar/detalle-preliminar/InfoSolben';

@Injectable({
  providedIn: "root",
})
export class DetalleSolicitudEvaluacionService {
  httpHeaders: HttpHeaders;
  httpOptions_: any;
  constructor(private http: HttpClient, private datePipe: DatePipe) {}

  /**
   * Proposito : Detalle de la Solicitud de Evaluacion Solben
   * @param request
   */
  public consultarInformacionScgEva(
    request: InformeSolEvaReporteRequest
  ): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
      }),
    };
    return this.http.post<WsResponse>(
      `${webServiceEndpoint}api/consultarInformacionScgEva`,
      request,
      httpOptions
    );
  }

  public consultarInformacionScgEvaRest(
    request: InfoSolben
  ): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
      }),
    };
    return this.http.post<WsResponse>(
      `${webServiceEndpoint}api/consultarInformacionScgEvaRest`,
      request,
      httpOptions
    );
  }

  /**
   * @param request
   * Proposito : Guardar Linea de Tratamiento / Preferencia Institucional Paso 1
   */
  public cambiarEstadoTratamiento(request) {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
      }),
    };
    return this.http.post<Object>(
      `${webServiceEndpoint}api/estadoTratamiento`,
      request,
      httpOptions
    );
  }
  public insertarLineaTratamiento(request) {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
      }),
    };
    return this.http.post<Object>(
      `${webServiceEndpoint}api/insertarLineaTratamiento`,
      request,
      httpOptions
    );
  }

  public insActCondicionBasalPac(request) {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.random() + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    return this.http.post<Object>(
      `${webServiceEndpoint}api/insActCondicionBasalPac`,
      request,
      httpOptions
    );
  }

  /**
   * @param request codCondicionCancer
   * codSubcondicionCancer
   * nroLineaTratamiento
   * codGrupoDiagnostico
   * Proposito : Se debe traer las subcondiciones correspondientes a los parametros de entrada Paso 1
   */
  public consultarSubCondicionCancer(request): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.random() + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    return this.http.post<WsResponse>(
      `${webServiceEndpoint}api/consultarSubCondicionCancer`,
      request,
      httpOptions
    );
  }

  /**
   * Proposito : consultar la Preferencia Institucional de la Mac Tratamiento PASO 1
   * @param request
   */
  public consultarPreferenciaInsti(request): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.random() + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    return this.http.post<WsResponse>(
      `${webServiceEndpoint}api/consultarPreferenciaInsti`,
      request,
      httpOptions
    );
  }

  public conInsActPreferenciaInstiPre(request) {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.random() + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    return this.http.post<Object>(
      `${webServiceEndpoint}api/conInsActPreferenciaInstiPre`,
      request,
      httpOptions
    );
  }

  public insertarHistLineaTrat(
    request
  ): Observable<InsertLineaTratamientoResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
      }),
    };
    return this.http.post<InsertLineaTratamientoResponse>(
      `${webServiceEndpoint}api/insertarHistLineaTrat`,
      request,
      httpOptions
    );
  }

  public consultarCheckListRequisito(
    request
  ): Observable<DocuHistPacienteResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
      }),
    };
    return this.http.post<DocuHistPacienteResponse>(
      `${webServiceEndpoint}api/consultarCheckListRequisito`,
      request,
      httpOptions
    );
  }

  public consultarCheckListContinuador(
    request
  ): Observable<DocuHistPacienteResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
      }),
    };
    return this.http.post<DocuHistPacienteResponse>(
      `${webServiceEndpoint}api/consultarCheckListMedNuev`,
      request,
      httpOptions
    );
  }

  public consultarCheckListPaso5(
    request
  ) {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    return this.http.post<Object>(
      `${webServiceEndpoint}api/consultarCheckListPaso5`,
      request,
      httpOptions
    );
  }


  public consultarCheckListMedNue(
    request
  ) {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    return this.http.post<Object>(
      `${webServiceEndpoint}api/consultarCheckListMedNuev`,
      request,
      httpOptions
    );
  }

  public consultarResultadoBasal(request) {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    return this.http.post<Object>(
      `${webServiceEndpoint}api/consultarResultadoBasal`,
      request,
      httpOptions
    );
  }

  /**
   * Proposito : Consultar o Precargar CheckList del Paciente - Paso 4
   * @param request
   */
  public consultarIndicadorCriterio(request): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    return this.http.post<WsResponse>(
      `${webServiceEndpoint}api/consultarIndicadorCriterio`,
      request,
      httpOptions
    );
  }
  /**
   * Proposito : Guardar CheckList del Paciente - Paso 4
   * @param request
   */
  public insertarCheckListPaciente(request): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    return this.http.post<WsResponse>(
      `${webServiceEndpoint}api/insertarCheckListPaciente`,
      request,
      httpOptions
    );
  }
  /**
   * Proposito: Precargar el Paso 5
   * @param request CodSolicitudEvaluacion
   */
  public consultarCheckListPacPrefeInsti(request): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };



    return this.http.post<WsResponse>(
      `${webServiceEndpoint}api/consultarCheckListPacPrefeInsti`,
      request,
      httpOptions
    );
  }

  public insActCheckListPacPrefeInsti(
    request: CheckListPacPrefeInstiRequest
  ): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    return this.http.post<WsResponse>(
      `${webServiceEndpoint}api/insActCheckListPacPrefeInsti`,
      request,
      httpOptions
    );
  }

  public estadoTratamientoApi(
    data
  ){
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    return this.http.post<Object>(
      `${webServiceEndpoint}api/estadoTratamiento`,
      data,
      httpOptions
    );
  }
  /**
   * Proposito: Precargar Medicamento Continuador
   * @param request CodSolicitudEvaluacion
   * api/consultarDocumentoContinuador
   */
  public consultarUltimoMonitoreo(
    request: MonitoreoEvolucionRequest
  ): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    return this.http.post<WsResponse>(
      `${webServiceEndpoint}api/getUltimoMonitoreo`,
      request,
      httpOptions
    );
  }

  public consultarDatosContinuador(
    request: MonitoreoEvolucionRequest
  ): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    return this.http.post<WsResponse>(
      `${webServiceEndpoint}api/getDatosContinuador`,
      request,
      httpOptions
    );
  }

  /**
   * Proposito: Guardar Medicamento Continuador
   * @param request
   */
  public guardarContinuador(request: ContinuadorRequest) {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    return this.http.post<WsResponse>(
      `${webServiceEndpoint}api/insActMedicamentoContinuador`,
      request,
      httpOptions
    );
  }

  /**
   * Proposito: Cargar Documento Medicamento Continuador
   * @param request CodSolicitudEvaluacion
   */
  public insActContinuadorDocumentoCargar(
    request: CheckListRequisitoRequest
  ): Observable<WsResponse> {
    return this.http.post<WsResponse>(
      `${webServiceEndpoint}api/insActContinuadorDocumentoCargar`,
      request,
      {
        headers: new HttpHeaders({
          idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
          fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
        }),
      }
    );
  }
  /**
   * Proposito: Eliminar documento Medicamento Continuador
   * @param request CodSolicitudEvaluacion
   */
  public actContinuadorDocumentoElim(
    request: CheckListRequisitoRequest
  ): Observable<WsResponse> {
    return this.http.post<WsResponse>(
      `${webServiceEndpoint}api/actContinuadorDocumentoElim`,
      request,
      {
        headers: new HttpHeaders({
          idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
          fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
        }),
      }
    );
  }

  public consultarEvaluacionAutorizador(request): Observable<ApiResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
      }),
    };
    return this.http.post<ApiResponse>(
      `${webServiceEndpoint}api/consultarEvaluacionAutorizador`,
      request,
      httpOptions
    );
  }

  public listarIndicadores(request): Observable<ApiListaIndicador> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
      }),
    };
    return this.http.post<ApiListaIndicador>(
      `${webServiceEndpoint}api/consultarIndicadorCriterio`,
      request,
      httpOptions
    );
  }

  public cargarArchivo(request): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
      }),
    };
    return this.http.post<WsResponse>(
      `${webServiceEndpoint}api/insActCheckListReqDocumento`,
      request,
      httpOptions
    );
  }

  public eliminarArchivo(request): Observable<ApiOutResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
      }),
    };
    return this.http.post<ApiOutResponse>(
      `${webServiceEndpoint}api/actualizarEliminacionDocumento`,
      request,
      httpOptions
    );
  }

  public actualizarCheckListGuardarDocumento(request): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.random() + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    return this.http.post<WsResponse>(
      `${webServiceEndpoint}api/actualizarCheckListGuardarDocumento`,
      request,
      httpOptions
    );
  }

  public insertarRptaEva(request): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.random() + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    return this.http.post<WsResponse>(
      `${webServiceEndpoint}api/insertarRptaEva`,
      request,
      httpOptions
    );
  }

  public insertarProgramacionCmac(request): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
      }),
    };
    return this.http.post<WsResponse>(
      `${webServiceEndpoint}api/registrarProgramacionCmac`,
      request,
      httpOptions
    );
  }

  public listarCodDocumentosChecklist(
    request: InformeSolEvaReporteRequest
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
      `${webServiceEndpoint}api/listarCodDocumentosChecklist`,
      request,
      httpOptions
    );
  }

  public actualizarEvaluacionInformeAutorizador(
    request: SolicitudEvaluacionRequest
  ): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
      }),
    };
    return this.http.post<WsResponse>(
      `${webServiceEndpoint}api/actualizarEvaluacionInformeAutorizador`,
      request,
      httpOptions
    );
  }

  public actualizarTipoSolEvaluacion(
    request: SolicitudEvaluacionRequest
  ): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    return this.http.post<WsResponse>(
      `${webServiceEndpoint}api/actualizarTipoSolEvaluacion`,
      request,
      httpOptions
    );
  }

  public registrarAntecedentesPacientes(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    return this.http.post<Object>(
      `${webServiceEndpoint}api/registrarAntecedentes`,
      data,
      httpOptions
    );
  }

  public mostrarAntecedentes(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    return this.http.post<Object>(
      `${webServiceEndpoint}api/mostrarAntecedente`,
      data,
      httpOptions
    );
  }
  public mostrarTratamientos(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    return this.http.post<Object>(
      `${webServiceEndpoint}api/mostrarTratamientos`,
      data,
      httpOptions
    );
  }
  public mostrarTratamientoActual(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    return this.http.post<Object>(
      `${webServiceEndpoint}api/mostrarTratamientosActual`,
      data,
      httpOptions
    );
  }

  public editarAntecedentesPacientes(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    return this.http.post<Object>(
      `${webServiceEndpoint}api/actualizarAntecedentes`,
      data,
      httpOptions
    );
  }

  public editarTratamientosPacientes(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    return this.http.post<Object>(
      `${webServiceEndpoint}api/actualizarTratamientos`,
      data,
      httpOptions
    );
  }

  public registrarTratamientosPacientes(data): Observable<Response> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    try {
      return this.http.post<Response>(
        `${webServiceEndpoint}api/registrarTratamientosPrevios`,
        data,
        httpOptions
      );
    } catch (err) {

    }
  }

  public consultarCondicionBasal(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    return this.http.post<Object>(
      `${webServiceEndpoint}api/consultarCondicionBasal`,
      data,
      httpOptions
    );
  }

  public registrarResumenCrono(data): Observable<Response> {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    try {
      return this.http.post<Response>(
        `${webServiceEndpoint}api/registrarResumenCronologico`,
        data,
        httpOptions
      );
    } catch (err) {

    }
  }

  public mostrarResumenCrono(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    return this.http.post<Object>(
      `${webServiceEndpoint}api/mostrarResumenCronologico`,
      data,
      httpOptions
    );
  }

  public obtenerParticipantesPorComite(data) {
    const httpOptions = {
      headers: new HttpHeaders({
        "Content-type": "application/json; charset=utf-8",
        authorization: "Bearer " + Cookie.get("access_token_fc"),
        idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
        fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
      }),
    };
    return this.http.post<Object>(
      `${webServiceEndpoint}usuarios/api/listarUsuarioFarmacia`,
      data,
      httpOptions
    );
  }

  public generarReportePaso4(request): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/reportePasoCuatro`, request, httpOptions);
  }

  public generarReportePaso1(request): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/reportePasoUno`, request, httpOptions);
  }

  public generarReportePaso2(request): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/reportePasoDos`, request, httpOptions);
  }

  public generarReportePaso3(request): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/reportePasoTres`, request, httpOptions);
  }

  public generarReportePaso5(request): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/reportePasoCinco`, request, httpOptions);
  }

  public generarReportePaso6(request): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/reportePasoSeis`, request, httpOptions);
  }

  public generarAntecedentes(request): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/reporteAntecedentes`, request, httpOptions);
  }
  public generarContinuador(request): Observable<WsResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-type': 'application/json; charset=utf-8',
        'authorization': 'Bearer ' + Cookie.get('access_token_fc')
      })
    };
    return this.http.post<WsResponse>(`${webServiceEndpoint}api/reporteContinuador`, request, httpOptions);
  }
}
