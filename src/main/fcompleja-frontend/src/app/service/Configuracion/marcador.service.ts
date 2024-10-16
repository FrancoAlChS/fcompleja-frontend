import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Marcador } from 'src/app/dto/Marcador';
import { webServiceEndpoint } from 'src/app/common';
import { Observable } from 'rxjs';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { WsResponse } from 'src/app/dto/WsResponse';
import { ProductoAsociado } from 'src/app/dto/ProductoAsociado';
import { ComplicacionMedica } from 'src/app/dto/ComplicacionMedica';
import { WsResponseOnco } from 'src/app/dto/WsResponseOnco';
import { FichaTecnica } from 'src/app/dto/configuracion/FichaTecnica';
import { ExamenMedico } from 'src/app/dto/ExamenMedico';
import { Participante } from 'src/app/dto/Participante';
import { Indicador } from 'src/app/dto/Indicador';
import { ValidarParticipanteRequest } from 'src/app/dto/request/ValidarParticipanteRequest';
import { DatePipe } from '@angular/common';


@Injectable({
    providedIn: 'root'
})

export class MarcadorService {

    constructor(private http: HttpClient, private datePipe: DatePipe) { }

    public buscarMarcador(marcadorRequest: Marcador): Observable<WsResponse> {
        const httpOptions = {
            headers: new HttpHeaders({
              'Content-type': 'application/json; charset=utf-8',
              'authorization': 'Bearer ' + Cookie.get('access_token_fc')
            })
        };
        return this.http.post<WsResponse>(`${webServiceEndpoint}api/listarMarcadores`, marcadorRequest, httpOptions);
    }

    // LISTAR MARCADORES
    public listarExamenMedico(examenRequest: ExamenMedico): Observable<WsResponse> {
        const httpOptions = {
            headers: new HttpHeaders({
              'Content-type': 'application/json; charset=utf-8',
              'authorization': 'Bearer ' + Cookie.get('access_token_fc')
            })
        };
        return this.http.post<WsResponse>(`${webServiceEndpoint}api/listarExamenMedico`, examenRequest, httpOptions);
    }

    public registrarMarcador(marcadorRequest: Marcador): Observable<WsResponse> {
        const httpOptions = {
            headers: new HttpHeaders({
              'Content-type': 'application/json; charset=utf-8',
              'authorization': 'Bearer ' + Cookie.get('access_token_fc')
            })
        };
        return this.http.post<WsResponse>(`${webServiceEndpoint}api/registroMarcador`, marcadorRequest, httpOptions);
    }

    public buscarProductoAsociado(productoAsociadoRequest: ProductoAsociado): Observable<WsResponse> {
        const httpOptions = {
            headers: new HttpHeaders({
              'Content-type': 'application/json; charset=utf-8',
              'authorization': 'Bearer ' + Cookie.get('access_token_fc')
            })
        };
        return this.http.post<WsResponse>(`${webServiceEndpoint}api/listarProductoAsociado`, productoAsociadoRequest, httpOptions);
    }

    public registrarProductoAsociado(productoAsociadoRequest: ProductoAsociado): Observable<WsResponse> {
        const httpOptions = {
            headers: new HttpHeaders({
              'Content-type': 'application/json; charset=utf-8',
              'authorization': 'Bearer ' + Cookie.get('access_token_fc')
            })
        };
        return this.http.post<WsResponse>(`${webServiceEndpoint}api/registroProductoAsociado`, productoAsociadoRequest, httpOptions);
    }

    public buscarComplicacionesMedicas(complicacionMedicaRequest: ComplicacionMedica): Observable<WsResponseOnco> {
        const httpOptions = {
            headers: new HttpHeaders({
              'Content-type': 'application/json; charset=utf-8',
              'authorization': 'Bearer ' + Cookie.get('access_token_fc')
            })
        };
        return this.http.post<WsResponseOnco>(`${webServiceEndpoint}api/listarComplicacionesMedicas`, complicacionMedicaRequest, httpOptions);
    }

    public registrarComplicacionesMedicas(complicacionMedicaRequest: ComplicacionMedica): Observable<WsResponse> {
        const httpOptions = {
            headers: new HttpHeaders({
              'Content-type': 'application/json; charset=utf-8',
              'authorization': 'Bearer ' + Cookie.get('access_token_fc')
            })
        };
        return this.http.post<WsResponse>(`${webServiceEndpoint}api/registroComplicacionesMedicas`, complicacionMedicaRequest, httpOptions);
    }

    public registrarFichaTecnica(fichaTecnicaRequest: FichaTecnica): Observable<WsResponse> {
        const httpOptions = {
            headers: new HttpHeaders({
              'Content-type': 'application/json; charset=utf-8',
              'authorization': 'Bearer ' + Cookie.get('access_token_fc')
            })
        };
        return this.http.post<WsResponse>(`${webServiceEndpoint}api/registroFichaTecnica`, fichaTecnicaRequest, httpOptions);
    }

    public registrarExamenMedico(examenMedicoRequest: ExamenMedico): Observable<WsResponse> {
        const httpOptions = {
            headers: new HttpHeaders({
              'Content-type': 'application/json; charset=utf-8',
              'authorization': 'Bearer ' + Cookie.get('access_token_fc')
            })
        };
        return this.http.post<WsResponse>(`${webServiceEndpoint}api/registroExamenMedico`, examenMedicoRequest, httpOptions);
    }

    public listarComitte(data) {
        const httpOptions = {
            headers: new HttpHeaders({
                "Content-type": "application/json; charset=utf-8",
                authorization: "Bearer " + Cookie.get("access_token_fc"),
                idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
                fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
            })
        };
        return this.http.post<Object>(`${webServiceEndpoint}api/listarComitte`,data ,httpOptions);
    }

    public actualizarComitte(data) {
        const httpOptions = {
            headers: new HttpHeaders({
                "Content-type": "application/json; charset=utf-8",
                authorization: "Bearer " + Cookie.get("access_token_fc"),
                idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
                fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
            })
        };
        return this.http.post<Object>(`${webServiceEndpoint}api/actualizarComitte`, data ,httpOptions);
    }

    public registarComite(data) {
        const httpOptions = {
            headers: new HttpHeaders({
                "Content-type": "application/json; charset=utf-8",
                authorization: "Bearer " + Cookie.get("access_token_fc"),
                idTransaccion: Math.floor(Math.random() * (9999 - 1)) + 1 + "",
                fechaTransaccion: this.datePipe.transform(new Date(), "dd/MM/yyyy"),
            })
        };
        return this.http.post<Object>(`${webServiceEndpoint}api/registrarComitte`, data ,httpOptions);
    }

    public buscarParticipantes(participanteRequest: Participante): Observable<WsResponse> {
        const httpOptions = {
            headers: new HttpHeaders({
              'Content-type': 'application/json; charset=utf-8',
              'authorization': 'Bearer ' + Cookie.get('access_token_fc')
            })
        };
        return this.http.post<WsResponse>(`${webServiceEndpoint}usuarios/portalComun/listarParticipantes`, participanteRequest, httpOptions);
    }

    public registrarParticipante(participanteRequest: Participante): Observable<WsResponse> {
        const httpOptions = {
            headers: new HttpHeaders({
              'Content-type': 'application/json; charset=utf-8',
              'authorization': 'Bearer ' + Cookie.get('access_token_fc')
            })
        };
        return this.http.post<WsResponse>(`${webServiceEndpoint}usuarios/portalComun/registrarParticipantes`, participanteRequest, httpOptions);
    }

    public registrarIndicador(inidicador: Indicador): Observable<WsResponse> {
        const httpOptions = {
            headers: new HttpHeaders({
              'Content-type': 'application/json; charset=utf-8',
              'authorization': 'Bearer ' + Cookie.get('access_token_fc')
            })
        };
        return this.http.post<WsResponse>(`${webServiceEndpoint}api/registrarIndicacionCriterios`, inidicador, httpOptions);
    }

    public validarRegistroParticipante(participanteRequest: ValidarParticipanteRequest): Observable<WsResponse> {
        const httpOptions = {
            headers: new HttpHeaders({
              'Content-type': 'application/json; charset=utf-8',
              'authorization': 'Bearer ' + Cookie.get('access_token_fc')
            })
        };
        return this.http.post<WsResponse>(`${webServiceEndpoint}usuarios/validarRegistroGrupo`, participanteRequest, httpOptions);
    }
}