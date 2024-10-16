import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { SolbenRequest } from 'src/app/dto/request/SolbenRequest';

export interface DialogData {
  codMacEvaluacion: any;
  codAfiliado: any;
}

@Component({
  selector: 'app-pregunta-linea-trata',
  templateUrl: './registro.historico.dialog.component.html',
  styleUrls: ['./registro.historico.dialog.component.scss']
})

export class PreguntaLineaTratComponent implements OnInit {

  request: SolbenRequest = new SolbenRequest();
  constructor(public dialogRef: MatDialogRef<PreguntaLineaTratComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

  ngOnInit() {
  }

  public registrarLineaTratamiento() {
    this.dialogRef.close(1);
  }

  public registrarMedicamento() {  
    this.dialogRef.close(2);
  }


  onDialogClose(): void {
    this.dialogRef.close();
  }
}
