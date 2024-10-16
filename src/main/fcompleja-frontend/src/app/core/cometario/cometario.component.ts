import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ListaEvaluaciones } from 'src/app/dto/solicitudEvaluacion/bandeja/ListaEvaluaciones';
import { FormControl, Validators } from '@angular/forms';

export interface DialogData {
  title: string;
  evaluacion: ListaEvaluaciones;
}

@Component({
  selector: 'app-cometario',
  templateUrl: './cometario.component.html',
  styleUrls: ['./cometario.component.scss']
})
export class CometarioComponent implements OnInit {

  comentarioFrmCtrl: FormControl = new FormControl(null, Validators.required);

  constructor(public dialogRef: MatDialogRef<CometarioComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  ngOnInit() {
    this.comentarioFrmCtrl.setValue(this.data.evaluacion.observacion);
  }

  public registrarComentario() {
    if (this.comentarioFrmCtrl.invalid) {
      this.comentarioFrmCtrl.markAsTouched();
      return;
    }

    this.data.evaluacion.observacion = this.comentarioFrmCtrl.value;

    this.dialogRef.close(this.data.evaluacion);
  }

  public cerrarVentana() {
    this.dialogRef.close(null);
  }

}
