import { Component, OnInit, Inject, forwardRef } from '@angular/core';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MatPaginatorIntl,
  MAT_DATE_LOCALE,
  MatDialogRef,
  MatDialog,
  MAT_DIALOG_DATA
} from '@angular/material';
import { MatPaginatorIntlEspanol } from 'src/app/directives/matpaginator-translate';
import { MY_FORMATS_AUNA, ACCESO_EVALUACION, ACCESO_MONITOREO } from 'src/app/common';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { MessageComponent } from 'src/app/core/message/message.component';
import { DatePipe } from '@angular/common';
import { WsResponse } from 'src/app/dto/WsResponse';
import { date } from 'ngx-custom-validators/src/app/date/validator';
import { EvolucionResponse } from 'src/app/dto/response/BandejaMonitoreo/EvolucionResponse';
import { BandejaMonitoreoService } from 'src/app/service/BandejaMonitoreo/bandeja.monitoreo.service';
import { ResultadoBasalRequest } from 'src/app/dto/request/ResultadoBasalRequest';
import { EvolucionMarcadorRequest } from 'src/app/dto/request/BandejaMonitoreo/EvolucionMarcadorRequest';
import { EvolucionMarcador } from 'src/app/dto/response/BandejaMonitoreo/EvolucionMarcador';
import { MonitoreoResponse } from 'src/app/dto/response/BandejaMonitoreo/MonitoreoResponse';
import { BOpcionMenuLocalStorage } from 'src/app/dto/core/BOpcionMenuLocalStorage';
import { UsuarioService } from 'src/app/dto/service/usuario.service';

export interface DataDialog {
  title: string;
  monitoreo: MonitoreoResponse;
  listaEvolucion: EvolucionResponse[];
}

@Component({
  selector: 'app-marcadores-modal',
  templateUrl: './marcadores-modal.component.html',
  styleUrls: ['./marcadores-modal.component.scss'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS_AUNA },
    { provide: MatPaginatorIntl, useClass: forwardRef(() => MatPaginatorIntlEspanol) }
  ]
})
export class MarcadoresModalComponent implements OnInit {
  marcadorFrmGrp: FormGroup = new FormGroup({
    descMACFrmCtrl: new FormControl(null),
    lineaTrataFrmCtrl: new FormControl(null),
    fecInicioFrmCtrl: new FormControl(null)
  });
  get descMACFrmCtrl() { return this.marcadorFrmGrp.get('descMACFrmCtrl'); }
  get lineaTrataFrmCtrl() { return this.marcadorFrmGrp.get('lineaTrataFrmCtrl'); }
  get fecInicioFrmCtrl() { return this.marcadorFrmGrp.get('fecInicioFrmCtrl'); }

  listaMarcadores: EvolucionMarcador[] = [];
  isLoading: boolean = false;
  emptyTable: boolean = true;
  opcionMenu: BOpcionMenuLocalStorage;
  valorMostrarOpcion = ACCESO_EVALUACION.mostrarOpcion;

  txtMedicamento: number;
  txtLineaTrat: number;
  txtFechaInicio: number;

  colMarcador: number;
  colPeriodicidadMin: number;
  colPeriodicidadMax: number;
  colEvolucion: number;
  colResultado: number;
  colFecha: number;
  hideLineaTrat: boolean = true;

  constructor(
    public dialogRef: MatDialogRef<MarcadoresModalComponent>,
    private datePipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) public data: DataDialog,
    @Inject(UsuarioService) private userService: UsuarioService,
    private bandejaMonitoreoService: BandejaMonitoreoService
  ) { }

  ngOnInit() {
    this.descMACFrmCtrl.setValue(this.data.monitoreo.nomMedicamento);
    this.lineaTrataFrmCtrl.setValue(this.data.monitoreo.numeroLineaTratamiento);
    this.fecInicioFrmCtrl.setValue(this.datePipe.transform(this.data.monitoreo.fecIniLineaTratamiento, 'dd/MM/yyyy'));
    this.listarHistorialMarcadores(this.data.monitoreo.codSolEvaluacion);
    this.accesoOpcionMenu();

    if(this.userService.getCodRol == 6 || this.userService.getCodRol == 5) {
      this.hideLineaTrat = false
    }
  }

  public onClose(): void {
    this.dialogRef.close(null);
  }

  public listarHistorialMarcadores(codSolEva: number): void {
    this.isLoading = true;
    let request = new ResultadoBasalRequest();
    request.codSolEva = codSolEva;

    this.bandejaMonitoreoService.listarHistorialMarcadores(request).subscribe(
      (data: WsResponse) => {
        if (data.audiResponse.codigoRespuesta === '0') {
          // ARMAR DATA
          this.filtrarMarcadoresPorTipo(data.data);
        } else {
          console.error('RESPUESTA LINEA DE TRATAMIENTO:' + data.audiResponse.mensajeRespuesta);
        }
        this.isLoading = false;
      },
      error => {
        console.error('Error al listar monitoreo');
        this.isLoading = false;
      }
    );
  }

  public filtrarMarcadoresPorTipo(data: EvolucionMarcadorRequest[]): void {
    if (data && data.length > 0) {
      this.emptyTable = false;
      data.forEach(evoMar => {
        let grupoMarc = this.listaMarcadores.filter(element => element.codMarcador == evoMar.codMarcador)[0];

        if (!grupoMarc) {//NO EXISTE EN LA LISTA
          let marc = new EvolucionMarcador();
          marc.codMarcador = evoMar.codMarcador;
          marc.codEvolucion = evoMar.codEvolucion;
          marc.descPerMaxima = evoMar.descPerMaxima;
          marc.descPerMinima = evoMar.descPerMinima;
          marc.descripcion = evoMar.descripcion;
          marc.pTipoIngresoRes = evoMar.pTipoIngresoRes;
          marc.listaEvolucionMarcador = [evoMar];

          this.listaMarcadores.push(marc);
        } else {// SI EXISTE EN LA LISTA SOLO SE AGREGA
          grupoMarc.listaEvolucionMarcador.push(evoMar);
        }
      });

      // VERIFICACION DE NO EXISTENCIA DE REGISTROS
      this.listaMarcadores.forEach(grupoMarc => {
        this.data.listaEvolucion.forEach(evo => {
          let found = grupoMarc.listaEvolucionMarcador.filter(marcDet => marcDet.codEvolucion == evo.codEvolucion)[0];

          if (!found) {// NO HAY REGISTRO DE DICHO MARCADOR
            let evomar = new EvolucionMarcadorRequest();
            evomar.codMarcador = grupoMarc.codMarcador;
            evomar.codEvolucion = evo.codEvolucion;
            evomar.descripcion = grupoMarc.descripcion;
            evomar.descPerMinima = grupoMarc.descPerMinima;
            evomar.descPerMaxima = grupoMarc.descPerMaxima;
            evomar.codResultado = null;
            evomar.resultado = null;
            evomar.fecResultado = null;
            evomar.tieneRegHc = '1';
            evomar.pTipoIngresoRes = grupoMarc.pTipoIngresoRes;

            grupoMarc.listaEvolucionMarcador.push(evomar);//ADICION DE REGISTROS VACIOS
          }
        });
      });
    }
    else {
      this.emptyTable = true;
    }
  }

  public accesoOpcionMenu() {
    const data = require('src/assets/data/permisosRecursos.json');
    const marcadores = data.bandejaMonitoreo.marcadores;
    this.opcionMenu = JSON.parse(localStorage.getItem('opcionMenu'));

    if (this.opcionMenu.opcion.length > 0) {
      this.opcionMenu.opcion.forEach(element => {
        const codOpcion = element.codOpcion;
        switch (codOpcion) {
          case marcadores.txtMedicamento:
            this.txtMedicamento = Number(element.flagAsignacion);
            break;
          case marcadores.txtLineaTrat:
            this.txtLineaTrat = Number(element.flagAsignacion);
            break;
          case marcadores.txtFechaInicio:
            this.txtFechaInicio = Number(element.flagAsignacion);
            break;
          case ACCESO_MONITOREO.tablaVerMarcadores.marcador:
            this.colMarcador = Number(element.flagAsignacion);
            break;
          case ACCESO_MONITOREO.tablaVerMarcadores.periodicidadMin:
            this.colPeriodicidadMin = Number(element.flagAsignacion);
            break;
          case ACCESO_MONITOREO.tablaVerMarcadores.periodicidadMax:
            this.colPeriodicidadMax = Number(element.flagAsignacion);
            break;
          case ACCESO_MONITOREO.tablaVerMarcadores.evolucion:
            this.colEvolucion = Number(element.flagAsignacion);
            break;
          case ACCESO_MONITOREO.tablaVerMarcadores.resultado:
            this.colResultado = Number(element.flagAsignacion);
            break;
          case ACCESO_MONITOREO.tablaVerMarcadores.fecha:
            this.colFecha = Number(element.flagAsignacion);
            break;
        }
      });
    }
  }

}
