import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MACResponse } from 'src/app/dto/configuracion/MACResponse';
import { FichaTecnica } from 'src/app/dto/configuracion/FichaTecnica';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { CoreService } from 'src/app/service/core.service';
import { MessageComponent } from 'src/app/core/message/message.component';
import { MENSAJES } from 'src/app/common';

export interface FichaDialog {
  title: string;
  mac: MACResponse;
  ficha: FichaTecnica;
  total: number;
}

@Component({
  selector: 'app-mnto-ficha',
  templateUrl: './mnto-ficha.component.html',
  styleUrls: ['./mnto-ficha.component.scss']
})
export class MntoFichaComponent implements OnInit {

  nuevo: boolean;

  fichaTecFrmGrp: FormGroup = new FormGroup({
    codigoFrmCtrl: new FormControl(null),
    descripcionFrmCtrl: new FormControl(null),
    nameFileFrmCtrl: new FormControl(null, [Validators.required])
  });

  get codigoFrmCtrl() { return this.fichaTecFrmGrp.get('codigoFrmCtrl'); }
  get descripcionFrmCtrl() { return this.fichaTecFrmGrp.get('descripcionFrmCtrl'); }
  get nameFileFrmCtrl() { return this.fichaTecFrmGrp.get('nameFileFrmCtrl'); }

  constructor(public dialog: MatDialog,
    public dialogRef: MatDialogRef<MntoFichaComponent>,
    private coreService: CoreService,
    @Inject(MAT_DIALOG_DATA) public data: FichaDialog) { }

  ngOnInit() {
    this.inicializarVariables();
  }

  public inicializarVariables(): void {
    this.nuevo = true;
    this.generarFichaTecnica();
  }

  public generarFichaTecnica(): void {
    const nroVersion = this.coreService.padLeft(`${this.data.total + 1}`, '0', 2);
    const nombreArchivo = `FICHA_TECNICA_${this.data.mac.descripcion.replace(/ /gi, '_')}_${nroVersion}`;
    this.codigoFrmCtrl.setValue(nroVersion);
    this.descripcionFrmCtrl.setValue(nombreArchivo);
    this.nameFileFrmCtrl.setValue(null);
  }

  public grabarFichaTecnica(): void {
    this.openDialogMensaje('Error al guardar el Archivo FTP', null, true, false, null);
  }

  public onCancelar(): void {
    this.dialogRef.close(null);
  }

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
        title: MENSAJES.CONF.FICHA_TECNICA,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor
      }
    });
    dialogRef.afterClosed().subscribe(result => {

    });
  }

}
