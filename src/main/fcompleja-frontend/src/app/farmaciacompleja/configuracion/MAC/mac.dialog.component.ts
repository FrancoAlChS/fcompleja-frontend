// @author: ddiazr

import { Component, Inject, OnInit, forwardRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog, MatPaginatorIntl } from '@angular/material';
import { MACResponse } from 'src/app/dto/configuracion/MACResponse';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Parametro } from 'src/app/dto/Parametro';
import { ParametroRequest } from 'src/app/dto/ParametroRequest';
import { GRUPO_PARAMETRO, CONFIGURACION, MENSAJES } from 'src/app/common';
import { ListaParametroservice } from 'src/app/service/lista.parametro.service';
import { ParametroResponse } from 'src/app/dto/ParametroResponse';
import { MessageComponent } from 'src/app/core/message/message.component';
import { MacService } from 'src/app/service/mac.service';
import { WsResponse } from 'src/app/dto/WsResponse';
import { MatPaginatorIntlEspanol } from 'src/app/directives/matpaginator-translate';
import { UsuarioService } from 'src/app/dto/service/usuario.service';
import { getLocaleId } from '@angular/common';

export interface DataDialog {
  title: string;
  mac: MACResponse;
}

@Component({
  selector: 'app-mac-component',
  templateUrl: './mac.dialog.component.html',
  styleUrls: ['./mac.dialog.component.scss'],
  providers: [
    { provide: MatPaginatorIntl, useClass: forwardRef(() => MatPaginatorIntlEspanol) }
  ]
})

export class MacComponent implements OnInit {

  paramRequest: ParametroRequest;
  macRequest: MACResponse;
  mensajes: string;
  nuevo: boolean;
  registro: boolean;

  macFrmGrp: FormGroup = new FormGroup({
    codigoFrmCtrl: new FormControl(null),
    estadoFrmCtrl: new FormControl(null, [Validators.required]),
    descripcionFrmCtrl: new FormControl(null, [Validators.required]),
    tipoMACFrmCtrl: new FormControl(null, [Validators.required])
  });

  cmbEstadoMAC: Parametro[];
  cmbTipoMAC: Parametro[];

  get codigoFrmCtrl() { return this.macFrmGrp.get('codigoFrmCtrl'); }
  get estadoFrmCtrl() { return this.macFrmGrp.get('estadoFrmCtrl'); }
  get descripcionFrmCtrl() { return this.macFrmGrp.get('descripcionFrmCtrl'); }
  get tipoMACFrmCtrl() { return this.macFrmGrp.get('tipoMACFrmCtrl'); }

  constructor(public dialog: MatDialog,
    public dialogRef: MatDialogRef<MacComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DataDialog,
    private parametroService: ListaParametroservice,
    private macService: MacService,
    @Inject(UsuarioService) private userService: UsuarioService,

  ) { }

  ngOnInit() {
    this.inicializarVariables();
  }

  public inicializarVariables(): void {
    this.registro = false;
    this.paramRequest = new ParametroRequest();
    this.cmbEstadoMAC = [];
    this.cmbTipoMAC = [];

    if (this.data.mac === null) {
      this.obtenerListaEstadoMAC(false);
      this.obtenerListaTipoMAC(false);
      this.nuevo = true;
    } else {
      this.nuevo = false;
      this.actualizarMedicamento();
    }
  }

  public obtenerListaEstadoMAC(editar: boolean): void {
    this.paramRequest.codigoGrupo = `${GRUPO_PARAMETRO.estadoMac}`;
    this.parametroService.listaParametro(this.paramRequest).subscribe(
      (data: ParametroResponse) => {
        this.cmbEstadoMAC = (data.filtroParametro !== null) ? data.filtroParametro : null;
        this.cmbEstadoMAC.unshift({
          codigoParametro: null,
          nombreParametro: '-- Seleccione el Estado del Medicamento --',
          valor1Parametro: '',
          codigoExterno: null
        });
        if (editar) {
          this.estadoFrmCtrl.setValue(this.data.mac.estadoMac);
        } else {
          this.estadoFrmCtrl.setValue(CONFIGURACION.macVigencia);
        }
      },
      error => {
        console.error('Error al listar el Estado del Medicamento');
      }
    );
  }

  public obtenerListaTipoMAC(editar: boolean): void {
    this.paramRequest.codigoGrupo = `${GRUPO_PARAMETRO.tipoMac}`;
    this.parametroService.listaParametro(this.paramRequest).subscribe(
      (data: ParametroResponse) => {
        this.cmbTipoMAC = (data.filtroParametro !== null) ? data.filtroParametro : null;
        this.cmbTipoMAC.unshift({
          codigoParametro: null,
          nombreParametro: '-- Seleccione el Tipo de Medicamento --',
          valor1Parametro: '',
          codigoExterno: null
        });
        if (editar) {
          this.tipoMACFrmCtrl.setValue(this.data.mac.tipoMac);
        }
      },
      error => {
        console.error('Error al listar el Tipo de Medicamento');
      }
    );
  }

  public actualizarMedicamento(): void {
    this.codigoFrmCtrl.setValue(this.data.mac.codigoLargo);
    this.descripcionFrmCtrl.setValue(this.data.mac.descripcion);
    this.obtenerListaEstadoMAC(true);
    this.obtenerListaTipoMAC(true);
  }

  public onClose(): void {
    if (this.registro) {
      this.dialogRef.close(null);
    } else {
      this.dialogRef.close(null);
    }
  }

  // POP-UP MENSAJES
  public openDialogMensaje(
    message: string,
    message2: string,
    alerta: boolean,
    confirmacion: boolean,
    valor: any
  ): void {
    const dialogRef = this.dialog.open(MessageComponent, {
      width: '400px',
      disableClose: true,
      data: {
        title: this.data.title,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 1) {
        this.data.mac = this.macRequest;
        this.dialogRef.close(this.data.mac);
      }
    });
  }

  public validarDatos(): boolean {
    if (this.macFrmGrp.invalid) {
      this.estadoFrmCtrl.markAsTouched();
      this.tipoMACFrmCtrl.markAsTouched();
      this.descripcionFrmCtrl.markAsTouched();
      this.mensajes = 'Validar campos requeridos';
      return false;
    }

    return true;
  }

  public guardarParametros(): void {
    const dateNow = new Date();
    this.macRequest = new MACResponse();
    this.macRequest.codigo = (this.nuevo) ? null : this.data.mac.codigo;
    this.macRequest.descripcion = this.descripcionFrmCtrl.value;
    this.macRequest.estadoMac = this.estadoFrmCtrl.value;
    this.macRequest.tipoMac = this.tipoMACFrmCtrl.value;

    if (this.nuevo) {
      this.macRequest.fechaInscripcion = dateNow;
      this.macRequest.codUsuario = this.userService.getCodUsuario;
      this.macRequest.fechaInicioVigencia = dateNow;
      if (this.estadoFrmCtrl.value === CONFIGURACION.macInactivo) {
        this.macRequest.fechaFinVigencia = dateNow;
      } else {
        this.macRequest.fechaInicioVigencia = dateNow;
      }
      this.macRequest.fechaCreacion = dateNow;
    } else {
      this.macRequest.codUsuarioMod = this.userService.getCodUsuario;
      this.macRequest.fechaModificacion = dateNow;
      if (this.estadoFrmCtrl.value !== this.data.mac.estadoMac && this.estadoFrmCtrl.value === CONFIGURACION.macInactivo) {
        this.macRequest.fechaFinVigencia = dateNow;
      }
    }

  }

  public grabarMAC(): void {
    if (this.validarDatos()) {
      this.guardarParametros();
      this.macService.registrarMac(this.macRequest).subscribe(
        (response: WsResponse) => {
          if (response.audiResponse.codigoRespuesta === '0') {
            this.macRequest.codigo = response.data.codigo;
            this.macRequest.codigoLargo = response.data.codigoLargo;
            this.codigoFrmCtrl.setValue(this.macRequest.codigoLargo);
            this.openDialogMensaje(response.audiResponse.mensajeRespuesta, MENSAJES.INFO_SALIR, false, true, null);
            this.registro = true;
          } else {
            this.openDialogMensaje(response.audiResponse.mensajeRespuesta, null, true, false, null);
            this.registro = false;
          }
        },
        error => {
          console.error('Error al listar el Tipo de SCG SOLBEN');
          this.openDialogMensaje(MENSAJES.ERROR_NOFUNCION, MENSAJES.ERROR_SERVICIO, true, false, null);
        }
      );
    } else {
      this.openDialogMensaje(this.mensajes, null, true, false, null);
    }
  }
}
