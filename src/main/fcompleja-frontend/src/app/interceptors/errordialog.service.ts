import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material';
import { MessageComponent } from '../core/message/message.component';
import { MENSAJES } from '../common';
import { Router } from '@angular/router';
import { AutenticacionService } from '../service/autenticacion.service';

@Injectable({
  providedIn: 'root',
})
export class ErrorDialogService {
  constructor(
    public dialog: MatDialog,
    private router: Router,
    private autenticacionService: AutenticacionService
  ) {}

  isOpen: Boolean = true;

  public openDialogMensaje(
    message: string,
    message2: string,
    alerta: boolean,
    confirmacion: boolean,
    valor: any
  ): void {
    this.router.navigate(['./login']);

    if (this.isOpen) {
      this.isOpen = false;
      this.autenticacionService.CerrarSesion();
      const dialogRef = this.dialog.open(MessageComponent, {
        width: '500px',
        disableClose: true,
        data: {
          title: MENSAJES.FCOMPLEJA.TITULO,
          message: message ? message : 'Su sesion ha vencido por inactividad!',
          message2: message2,
          alerta: alerta,
          confirmacion: confirmacion,
          valor: valor,
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
        this.isOpen = true;
      });
    }
  }
}
