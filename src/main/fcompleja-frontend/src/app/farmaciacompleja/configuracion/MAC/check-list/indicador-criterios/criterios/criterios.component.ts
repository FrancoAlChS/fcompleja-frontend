import { Component, OnInit, Inject } from '@angular/core';
import { ParametroRequest } from 'src/app/dto/ParametroRequest';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Parametro } from 'src/app/dto/Parametro';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ListaParametroservice } from 'src/app/service/lista.parametro.service';
import { ConfiguracionService } from 'src/app/service/configuracion.service';
import { MessageComponent } from 'src/app/core/message/message.component';
import { ParametroResponse } from 'src/app/dto/ParametroResponse';
import { GRUPO_PARAMETRO, CONFIGURACION, MENSAJES } from 'src/app/common';
import { CheckListDTO } from 'src/app/dto/configuracion/CheckListDTO';
import { WsResponse } from 'src/app/dto/WsResponse';
import { CriteriosDTO } from 'src/app/dto/configuracion/CriteriosDTO';

export interface CriterioDialog {
  title: string;
  indicador: CheckListDTO;
  criterioIN: CriteriosDTO;
  criterioEX: CriteriosDTO;
  tipo: number;
  codigo: string;
}

@Component({
  selector: 'app-criterios',
  templateUrl: './criterios.component.html',
  styleUrls: ['./criterios.component.scss']
})
export class CriteriosComponent implements OnInit {

  paramRequest: ParametroRequest;
  inclusionRequest: CriteriosDTO;
  exclusionRequest: CriteriosDTO;

  mensajes: string;
  nuevo: boolean;
  modificado: boolean;

  cmbEstado: Parametro[];

  criterioFrmGrp: FormGroup;

  constructor(public dialog: MatDialog,
    public dialogRef: MatDialogRef<CriteriosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CriterioDialog,
    private parametroService: ListaParametroservice,
    private confService: ConfiguracionService
  ) { }

  ngOnInit() {
    this.criterioFrmGrp = new FormGroup({
      codigoFrmCtrl: new FormControl(this.data.codigo),
      estadoFrmCtrl: new FormControl(null, [Validators.required]),
      descripcionFrmCtrl: new FormControl(null, [Validators.required])
    });
  
    this.inicializarVariables();
    this.setearValores();
  }

  get codigoFrmCtrl() { return this.criterioFrmGrp.get('codigoFrmCtrl'); }
  get estadoFrmCtrl() { return this.criterioFrmGrp.get('estadoFrmCtrl'); }
  get descripcionFrmCtrl() { return this.criterioFrmGrp.get('descripcionFrmCtrl'); }


  public inicializarVariables(): void {
    this.paramRequest = new ParametroRequest();
    this.cmbEstado = [];
    this.modificado = false;
  }

  public setearValores(): void {
    if (this.data.criterioIN !== null || this.data.criterioEX !== null) {
      this.obtenerListaEstado(true);
      switch (this.data.tipo) {
        case 1:
          this.codigoFrmCtrl.setValue(this.data.criterioIN.codCriterio);
          this.descripcionFrmCtrl.setValue(this.data.criterioIN.descripcion);
          this.estadoFrmCtrl.setValue(this.data.criterioIN.estado);
          break;
        case 2:
          this.codigoFrmCtrl.setValue(this.data.criterioEX.codCriterio);
          this.descripcionFrmCtrl.setValue(this.data.criterioEX.descripcion);
          this.estadoFrmCtrl.setValue(this.data.criterioEX.estado);
          break;
      }
    } else {
      this.obtenerListaEstado(false);
    }
  }

  public opcionCancelar(): void {
    if (this.modificado) {
      const criterios = this.enviarResultados();
      this.dialogRef.close(criterios);
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
        const criterios = this.enviarResultados();
        this.dialogRef.close(criterios);
      }
    });
  }

  public enviarResultados() {
    let criterios: any;
    switch (this.data.tipo) {
      case 1:
        this.data.criterioIN = new CriteriosDTO();
        this.data.criterioIN.codChkListIndi = Number(this.data.indicador.codChkListIndi);
        this.data.criterioIN.codCriterio = this.codigoFrmCtrl.value;
        this.data.criterioIN.descripcion = this.descripcionFrmCtrl.value;
        this.data.criterioIN.estado = this.estadoFrmCtrl.value;
        criterios = this.data.criterioIN;
        break;
      case 2:
        this.data.criterioEX = new CriteriosDTO();
        this.data.criterioEX.codChkListIndi = Number(this.data.indicador.codChkListIndi);
        this.data.criterioEX.codCriterio = this.codigoFrmCtrl.value;
        this.data.criterioEX.descripcion = this.descripcionFrmCtrl.value;
        this.data.criterioEX.estado = this.estadoFrmCtrl.value;
        criterios = this.data.criterioEX;
        break;
    }
    return criterios;
  }

  public grabarCriterio(): void {
    switch (this.data.tipo) {
      case 1:
        this.grabarCriterioInclusion();
        break;
      case 2:
        this.grabarCriterioExclusion();
        break;
    }
  }

  public validarForm(): boolean {
    if (this.criterioFrmGrp.invalid) {
      this.descripcionFrmCtrl.markAsTouched();
      this.estadoFrmCtrl.markAsTouched();
      this.mensajes = MENSAJES.ERROR_CAMPOS;
      return false;
    }
    return true;
  }

  public guardarRequestIN(): void {
    this.inclusionRequest = new CriteriosDTO();
    this.inclusionRequest.codMac = this.data.indicador.codMac;
    this.inclusionRequest.codGrpDiag = this.data.indicador.codGrpDiag;
    this.inclusionRequest.codChkListIndi = this.data.indicador.codChkListIndi;
    this.inclusionRequest.codCriterio = this.codigoFrmCtrl.value;
    this.inclusionRequest.descripcion = this.descripcionFrmCtrl.value;
    this.inclusionRequest.estado = this.estadoFrmCtrl.value;
  }

  public grabarCriterioInclusion(): void {
    if (this.validarForm()) {
      this.guardarRequestIN();
      this.confService.registroCriterioInclusion(this.inclusionRequest).subscribe(
        (response: WsResponse) => {
          if (response.audiResponse.codigoRespuesta === '0') {
            const codInclusion = (response.data !== null) ? response.data.codInclusion : null;
            this.codigoFrmCtrl.setValue(codInclusion);
            this.openDialogMensaje(response.audiResponse.mensajeRespuesta, MENSAJES.INFO_SALIR, false, true, null);
            this.modificado = true;
          } else {
            this.openDialogMensaje(response.audiResponse.mensajeRespuesta, null, true, false, null);
          }
        }, (error) => {
          this.mensajes = 'Error al registrar el criterio de inclusión.';
          this.openDialogMensaje(MENSAJES.ERROR_SERVICIO, this.mensajes, true, false, null);
          console.error(error);
        });
    } else {
      this.openDialogMensaje(this.mensajes, null, true, false, null);
    }
  }

  public guardarRequestEX(): void {
    this.exclusionRequest = new CriteriosDTO();
    this.exclusionRequest.codMac = this.data.indicador.codMac;
    this.exclusionRequest.codGrpDiag = this.data.indicador.codGrpDiag;
    this.exclusionRequest.codChkListIndi = this.data.indicador.codChkListIndi;
    this.exclusionRequest.codCriterio = this.codigoFrmCtrl.value;
    this.exclusionRequest.descripcion = this.descripcionFrmCtrl.value;
    this.exclusionRequest.estado = this.estadoFrmCtrl.value;
  }

  public grabarCriterioExclusion(): void {
    if (this.validarForm()) {
      this.guardarRequestEX();
      this.confService.registroCriterioExclusion(this.exclusionRequest).subscribe(
        (response: WsResponse) => {
          if (response.audiResponse.codigoRespuesta === '0') {
            const codExclusion = (response.data !== null) ? response.data.codExclusion : null;
            this.codigoFrmCtrl.setValue(codExclusion);
            this.openDialogMensaje(response.audiResponse.mensajeRespuesta, MENSAJES.INFO_SALIR, false, true, null);
            this.modificado = true;
          } else {
            this.openDialogMensaje(response.audiResponse.descripcionRespuesta, null, true, false, null);
          }
        }, (error) => {
          this.mensajes = 'Error al registrar el criterio de exclusión.';
          this.openDialogMensaje(MENSAJES.ERROR_SERVICIO, this.mensajes, true, false, null);
          console.error(error);
        });
    } else {
      this.openDialogMensaje(this.mensajes, null, true, false, null);
    }
  }

  public obtenerListaEstado(editar: boolean): void {
    this.paramRequest.codigoGrupo = `${GRUPO_PARAMETRO.estadoMac}`;
    this.parametroService.listaParametro(this.paramRequest).subscribe(
      (data: ParametroResponse) => {
        this.cmbEstado = (data.filtroParametro !== null) ? data.filtroParametro : null;
        this.cmbEstado.unshift({
          codigoParametro: null,
          nombreParametro: '-- Seleccione el Estado del Indicador --',
          valor1Parametro: '',
          codigoExterno: null
        });
        if (!editar) {
          this.estadoFrmCtrl.setValue(CONFIGURACION.macVigencia);
        }
      },
      error => {
        this.mensajes = 'Error al listar el tipo de estado.';
        this.openDialogMensaje(MENSAJES.ERROR_SERVICIO, this.mensajes, true, false, null);
        console.error(error);
      }
    );
  }

}
