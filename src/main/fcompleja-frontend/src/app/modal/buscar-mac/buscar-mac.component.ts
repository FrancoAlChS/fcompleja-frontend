import {
  Component,
  OnInit,
  ViewChild,
  Inject,
  forwardRef,
} from "@angular/core";
import {
  MatTableDataSource,
  MatPaginator,
  MatSort,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
  MatPaginatorIntl,
} from "@angular/material";

import { MacService } from "src/app/service/mac.service";
import { MENSAJES } from "src/app/common";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MACResponse } from "src/app/dto/configuracion/MACResponse";
import { MessageComponent } from "src/app/core/message/message.component";
import { SelectionModel } from "@angular/cdk/collections";
import { MatPaginatorIntlEspanol } from "src/app/directives/matpaginator-translate";
import { WsResponseOnco } from "src/app/dto/WsResponseOnco";

export interface DataModal {
  title: string;
}

export interface BuscarMAC {
  descripcion: string;
  nombreComercial: string;
}

@Component({
  selector: "app-buscar-mac",
  templateUrl: "./buscar-mac.component.html",
  styleUrls: ["./buscar-mac.component.scss"],
  providers: [
    {
      provide: MatPaginatorIntl,
      useClass: forwardRef(() => MatPaginatorIntlEspanol),
    },
  ],
})
export class BuscarMacComponent implements OnInit {
  macFrmGrp: FormGroup = new FormGroup({
    descMacFrmCtrl: new FormControl(null),
    nombComercialFrmCtrl: new FormControl(null),
  });

  get descMacFrmCtrl() {
    return this.macFrmGrp.get("descMacFrmCtrl");
  }
  get nombComercialFrmCtrl() {
    return this.macFrmGrp.get("nombComercialFrmCtrl");
  }

  buscarMac: BuscarMAC;
  macSeleccionada: MACResponse;
  mensajes: string;
  macRequest: MACResponse;

  // Tabla
  dataSource: MatTableDataSource<MACResponse>;
  selection: SelectionModel<MACResponse>;
  listaMAC: MACResponse[];
  isLoading: boolean;
  displayedColumns: string[];
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  columnsGrilla = [
    {
      columnDef: "codigo",
      header: "N°",
      cell: (mac: MACResponse) => `${mac.codigo}`,
    },
    {
      columnDef: "codigoLargo",
      header: "CÓDIGO MAC",
      cell: (mac: MACResponse) => `${mac.codigoLargo}`,
    },
    {
      columnDef: "descripcion",
      header: "MEDICAMENTO MAC",
      cell: (mac: MACResponse) => `${mac.descripcion}`,
    },
  ];

  constructor(
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<BuscarMacComponent>,
    private macService: MacService,
    @Inject(MAT_DIALOG_DATA) public data: DataModal
  ) {}

  ngOnInit() {
    this.inicializarVariables();
    this.crearTablaLineaTratamiento();
    this.buscarListaMAC(null);
    
  }

  public inicializarVariables(): void {
    this.listaMAC = [];
    this.dataSource = null;
    this.isLoading = false;
    this.macSeleccionada = new MACResponse();
    this.macRequest = new MACResponse();
  }

  public crearTablaLineaTratamiento(): void {
    this.displayedColumns = ["select"];
    this.columnsGrilla.forEach((c) => {
      this.displayedColumns.push(c.columnDef);
    });
  }

  public cargarDatosTabla(): void {
    this.dataSource = new MatTableDataSource(this.listaMAC);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.selection = new SelectionModel<MACResponse>(true, []);
  }

  public guardarParametros(): boolean {
    if (this.macFrmGrp.invalid) {
      this.descMacFrmCtrl.markAsTouched();
      this.mensajes = "Debe ingresar el nombre del Medicamento";
      return false;
    }
    this.buscarMac.descripcion = this.descMacFrmCtrl.value;
    this.buscarMac.nombreComercial = this.nombComercialFrmCtrl.value;
  }

  public buscarListaMAC($event: Event): void {
    if ($event !== null) {
      $event.preventDefault();
    }
    this.listaMAC = [];
    this.dataSource = null;
    this.isLoading = true; // Muestra el Spinner;

    this.macRequest.descripcion = this.descMacFrmCtrl.value;
    this.macRequest.nombreComercial = this.nombComercialFrmCtrl.value;
    this.macRequest.busqueda = "1";

    this.macService.getBusquedaMac(this.macRequest).subscribe(
      (response: WsResponseOnco) => {
        if (response.audiResponse.codigoRespuesta === "0") {
          this.listaMAC = response.dataList !== null ? response.dataList : [];
          this.listaMAC.forEach((mac: MACResponse) => {
            mac.seleccionado = false;
          });
          this.cargarDatosTabla();
        } else {
          this.openDialogMensaje(
            MENSAJES.ERROR_NOFUNCION,
            response.audiResponse.mensajeRespuesta,
            true,
            false,
            null
          );
        }
        this.isLoading = false;
      },
      (error) => {
        console.error(error);
        this.openDialogMensaje(
          MENSAJES.ERROR_CARGA_SERVICIO,
          null,
          true,
          false,
          null
        );
        this.isLoading = false;
      }
    );
    this.cargarDatosTabla();
  }

  public guardarSeleccionado($event: Event): void {
    $event.preventDefault();
    if (this.selection.selected.length > 0) {
      this.dialogRef.close(this.selection.selected[0]);
    } else {
      this.openDialogMensaje(
        "Seleccionar una fila de la grilla",
        null,
        true,
        false,
        null
      );
    }
  }

  public opcionSalir(): void {
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
      width: "400px",
      disableClose: true,
      data: {
        title: MENSAJES.PRELIMINAR.DETALLE,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }

  public selectFila(row: MACResponse) {
    this.selection = new SelectionModel<MACResponse>(false, []);
    row.seleccionado = !row.seleccionado;

    this.dataSource.data.forEach((mac: MACResponse) => {
      if (row.codigo !== mac.codigo) {
        mac.seleccionado = false;
      }
    });

    if (row.seleccionado) {
      this.selection.toggle(row);
    } else {
      this.selection.deselect(row);
    }
  }
}
