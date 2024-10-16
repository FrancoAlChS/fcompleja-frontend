import { Component, OnInit, ViewChild, forwardRef } from '@angular/core';
import { ClinicaRequest } from 'src/app/dto/ClinicaRequest';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource, MatSort, MatPaginator, MatDialogRef, MatPaginatorIntl, MatDialog } from '@angular/material';
import { Clinica } from 'src/app/dto/Clinica';
import { Clinicaservice } from 'src/app/service/clinica.service';
import { WsResponseOnco } from 'src/app/dto/WsResponseOnco';
import { TIPOBUSQUEDA, MENSAJES } from '../../common';
import { MatPaginatorIntlEspanol } from 'src/app/directives/matpaginator-translate';
import { MessageComponent } from 'src/app/core/message/message.component';

@Component({
  selector: 'app-buscar-clinica',
  templateUrl: './buscar-clinica.component.html',
  styleUrls: ['./buscar-clinica.component.scss'],
  providers: [{
    provide: MatPaginatorIntl, useClass: forwardRef(() => MatPaginatorIntlEspanol)
  }]
})
export class BuscarClinicaComponent implements OnInit {

  mensaje: string;
  btnBuscarClinica: boolean;

  clinicaRequest: ClinicaRequest;
  buscarClinicaFrmGrp: FormGroup = new FormGroup({
    clinicaFrmCtrl: new FormControl(null)
  });

  get clinicaFrmCtrl() { return this.buscarClinicaFrmGrp.get('clinicaFrmCtrl'); }

  // Tabla
  dataSource: MatTableDataSource<Clinica>;
  listaClinica: Clinica[];
  isLoading: boolean;
  displayedColumns: string[];
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  columnsGrilla = [{
    columnDef: 'rn',
    header: 'ITEM',
    cell: (clinica: Clinica) => `${clinica.rn}`
  }, {
    columnDef: 'codcli',
    header: 'CÓDIGO',
    cell: (clinica: Clinica) => `${clinica.codcli}`
  }, {
    columnDef: 'nomcli',
    header: 'CLINICA',
    cell: (clinica: Clinica) => `${clinica.nomcli}`
  }];

  constructor(private dialog: MatDialog,
    private dialogRef: MatDialogRef<BuscarClinicaComponent>,
    private clinicaService: Clinicaservice) { }

  ngOnInit() {
    this.inicializarVariables();
    this.crearTablaClinica();
    this.setearClinicaRequest();
  }

  public inicializarVariables(): void {
    this.listaClinica = [];
    this.clinicaRequest = new ClinicaRequest();
    this.dataSource = null;
    this.isLoading = false;
  }

  public crearTablaClinica(): void {
    this.displayedColumns = [];
    this.columnsGrilla.forEach(c => {
      this.displayedColumns.push(c.columnDef);
    });
  }

  public cargarTablaClinicas(): void {
    if (this.listaClinica.length > 0) {
      this.dataSource = new MatTableDataSource(this.listaClinica);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
    this.btnBuscarClinica=false;
  }

  public setearClinicaRequest(): void {
    this.clinicaRequest.nomcli = (this.clinicaFrmCtrl.valid) ? this.clinicaFrmCtrl.value : '\'\'';
    this.clinicaRequest.ini = 1;
    this.clinicaRequest.fin = 100;
    this.clinicaRequest.tipoBus = (this.clinicaFrmCtrl.valid) ? TIPOBUSQUEDA.Clinica.descripcion : TIPOBUSQUEDA.Clinica.Todos;
    this.clinicaRequest.codcli = '\'\'';
  }

  public buscarClinica(): void {
    this.btnBuscarClinica=true;
    this.isLoading = true;
    this.dataSource = null;
    this.listaClinica = [];
    this.setearClinicaRequest();
    this.clinicaService.listaClinica(this.clinicaRequest)
      .subscribe((data: WsResponseOnco) => {
        if (data.audiResponse.codigoRespuesta === '0') {
          this.listaClinica = (data.dataList !== null) ? data.dataList : null;
          this.cargarTablaClinicas();
        } else {
          this.mensaje = data.audiResponse.mensajeRespuesta;
          this.openDialogMensaje(this.mensaje, null, true, false, null);
        }
        this.isLoading = false;
      }, error => {
        console.error(error);
        this.mensaje = MENSAJES.ERROR_SERVICIO;
        this.isLoading = false;
        this.openDialogMensaje(this.mensaje, 'Error al buscar Clinica', true, false, null);
      });

      this.clinicaFrmCtrl.markAsUntouched();
  }

  public seleccionarFila(row: Clinica): void {
    this.dialogRef.close(row);
  }

  public opcionSalir(): void {
    this.dialogRef.close(null);
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
        title: 'BUSCAR CLINICA',
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
