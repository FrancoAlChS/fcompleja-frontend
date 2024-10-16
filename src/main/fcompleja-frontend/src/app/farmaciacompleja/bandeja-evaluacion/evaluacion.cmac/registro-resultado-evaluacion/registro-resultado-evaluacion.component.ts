import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material';
import { MessageComponent } from 'src/app/core/message/message.component';
import { EvaluacionCmacService } from 'src/app/service/BandejaEvaluacion/evaluacion.cmac.service';

@Component({
  selector: 'app-registro-resultado-evaluacion',
  templateUrl: './registro-resultado-evaluacion.component.html',
  styleUrls: ['./registro-resultado-evaluacion.component.scss']
})
export class RegistroResultadoEvaluacionComponent implements OnInit {
  agregarPartiFrmGrp: FormGroup = new FormGroup({
    nombresFrmCtrl: new FormControl(null, Validators.required),
    apellidosFrmCtrl: new FormControl(null, [Validators.required]),
    correoFrmCtrl: new FormControl(null, [Validators.required]),
  });

  get nombresFrmCtrl() {
    return this.agregarPartiFrmGrp.get("nombresFrmCtrl");
  }
  get apellidosFrmCtrl() {
    return this.agregarPartiFrmGrp.get("apellidosFrmCtrl");
  }
  get correoFrmCtrl() {
    return this.agregarPartiFrmGrp.get("correoFrmCtrl");
  }

  listaParticipantesResponse: [];
  valor: boolean

  constructor(
    public dialogRef: MatDialogRef<RegistroResultadoEvaluacionComponent>,
    public dialog: MatDialog,
    private evaluacionCmacService: EvaluacionCmacService
  ) { }

  ngOnInit() { }

  onNoClick(): void {
    this.dialogRef.close();
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
      width: "400px",
      disableClose: true,
      data: {
        title: "REGISTRAR PARTICIPANTES COMITÉ",
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 0 && this.valor) {
        dialogRef.close();
      } if (result === 0 && !this.valor) {
        this.dialogRef.close(this.listaParticipantesResponse);
      }
    });
  }

  grabarParticipanteCMAC() {
    
    const json = {
      nombres: this.nombresFrmCtrl.value,
      apellidos: this.apellidosFrmCtrl.value,
      correo: this.correoFrmCtrl.value,
      codComite: localStorage.getItem("tipoComite"),
    };
    
    this.evaluacionCmacService.registrarParticipantesFrecuentes(json).subscribe(
      (resp) => {
        
        this.valor = false;
        if (this.nombresFrmCtrl.value !== null && this.correoFrmCtrl.value !== null && this.correoFrmCtrl.value !== null) {
          this.listaParticipantesResponse = resp["response"][0];
          
          //this.listaParticipantes
          //this.cargarListaParticipantes();
          this.openDialogMensaje(
            "REGISTRAR PARTICIPANTES COMITE",
            "Se registró satisfactoriamente.",
            true,
            false,
            null
          );
        } else { 
          this.valor = true;
          this.openDialogMensaje(
            "REGISTRAR PARTICIPANTES COMITE",
            "Ingresar todos los campos requeridos.",
            true,
            false,
            null
          );
        }
      },
      (err) => {
        
      }
    );
  }

}
