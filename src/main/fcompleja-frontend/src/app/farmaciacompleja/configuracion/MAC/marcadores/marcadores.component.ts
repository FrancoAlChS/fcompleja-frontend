import {
  Component,
  AfterViewInit,
  ViewChild,
  Inject,
  forwardRef,
  OnInit,
} from "@angular/core";
import { Marcador } from "src/app/dto/Marcador";
import {
  PAG_SIZ_SMALL,
  PAG_OBT_SMALL,
  MENSAJES,
  MY_FORMATS_AUNA,
} from "src/app/common";
import {
  MatPaginator,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialog,
  MatTableDataSource,
  DateAdapter,
  MatPaginatorIntl,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from "@angular/material";
import { MarcadorService } from "src/app/service/Configuracion/marcador.service";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MatProgressButtonOptions } from "mat-progress-buttons";
import { ConfiguracionService } from "src/app/service/configuracion.service";
import { WsResponseOnco } from "src/app/dto/WsResponseOnco";
import { MessageComponent } from "src/app/core/message/message.component";
import { WsResponse } from "src/app/dto/WsResponse";
import { RegistrarMarcadorComponent } from "./registrar/registrar.component";
import { EditarMarcadorComponent } from "./editar/editar.component";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MatPaginatorIntlEspanol } from "src/app/directives/matpaginator-translate";
import { BuscarGrupoDiagnosticoComponent } from "src/app/modal/buscar-diagnostico/buscar-diagnostico.component";

export interface DialogMarcadoresData {
  title: any;
  mac: any;
}

@Component({
  selector: "app-marcadores",
  templateUrl: "./marcadores.component.html",
  styleUrls: ["./marcadores.component.scss"],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS_AUNA },
    {
      provide: MatPaginatorIntl,
      useClass: forwardRef(() => MatPaginatorIntlEspanol),
    },
  ],
})
export class MarcadoresComponent implements AfterViewInit, OnInit {
  // TABLA
  pageSize: number = PAG_SIZ_SMALL;
  pageSizeOptions: number[] = PAG_OBT_SMALL;

  displayedColumns: string[] = [
    "codigoconfigmarca",
    "descripciongrupodiag",
    "descripcionmarcador",
    "descripcionmarcador2",
    "descripcionPerMinima",
    "descripcionPerMaxima",
    "descripcionEstado",
    "opciones",
  ];
  //dataSource: Marcador[] = [];
  dataSource = new MatTableDataSource<Marcador>([]);

  resultsLength = 0;
  isLoadingResults = false;
  isRateLimitReached = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  // FORMULARIO
  marcadorForm: FormGroup;
  marcadorSubmitted = false;
  marcadorFormMessages = {};
  marcadorBtnOpts: MatProgressButtonOptions = {
    active: false,
    text: "BUSCAR",
    spinnerSize: 19,
    raised: true,
    stroked: false,
    buttonColor: "primary",
    spinnerColor: "accent",
    fullWidth: false,
    disabled: false,
    mode: "indeterminate",
  };

  spinnerGrupo: boolean = true;
  listaGrupo: any[] = [];

  marcadorRequest: Marcador = new Marcador();

  codigoGrupoDiagnostico: string;
  descripcionGrupoDiagnostico: string;

  constructor(
    public dialogRef: MatDialogRef<MarcadoresComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogMarcadoresData,
    public dialog: MatDialog,
    private marcadorService: MarcadorService,
    public confService: ConfiguracionService
  ) {
    this.marcadorForm = new FormGroup({
      codigoMac: new FormControl(
        { value: this.data.mac.codigoLargo, disabled: true },
        [Validators.required]
      ),
      descripcionMac: new FormControl(
        { value: this.data.mac.descripcion, disabled: true },
        [Validators.required]
      ),
      codigoGrupoDiagnostico: new FormControl({ value: null, disabled: true }, [
        Validators.required,
      ]),
    });
  }

  ngOnInit() {
    this.cargarParametro();
  }

  ngAfterViewInit(): void {
    /*merge(this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          this.marcadorRequest.codigoMac = this.data.mac.codigo;
          this.marcadorRequest.codigoGrupoDiag = this.marcadorForm.get('codigoGrupoDiagnostico').value;
          this.marcadorRequest.index = this.paginator.pageIndex.toString();
          this.marcadorRequest.longitud = this.pageSize.toString();
          return this.marcadorService.buscarMarcador(this.marcadorRequest);
        }),
        map(respuesta => {
          this.isLoadingResults = false;
          this.resultsLength = respuesta.data.length;

          return respuesta.data;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          this.openDialogMensaje(MENSAJES.ERROR_SERVICIO, 'Error al listar los Marcador', true, false, null);
          return observableOf([]);
        })
      ).subscribe(data => this.dataSource = data);*/
  }

  get fc() {
    return this.marcadorForm.controls;
  }

  public onClose(): void {
    this.dialogRef.close(null);
  }

  public cargarParametro(): void {
    this.confService.listarGrupoDiagnostico().subscribe(
      (dataResponse: WsResponseOnco) => {
        this.spinnerGrupo = false;
        if (dataResponse.audiResponse.codigoRespuesta === "0") {
          this.listaGrupo = dataResponse.dataList;
        } else {
          this.openDialogMensaje(
            MENSAJES.ERROR_NOFUNCION,
            dataResponse.audiResponse.mensajeRespuesta,
            true,
            false,
            null
          );
        }
      },
      (error) => {
        this.spinnerGrupo = false;
        console.error("Error al listar el grupo diagnostico");
        this.openDialogMensaje(
          MENSAJES.ERROR_SERVICIO,
          "Error al listar el grupo diagnostico",
          true,
          false,
          null
        );
      }
    );
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
        title: MENSAJES.CONF.MARCADORES,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }

  accionMarcador() {
    this.marcadorSubmitted = true;

    if (this.marcadorForm.invalid) {
      return;
    }

    this.marcadorBtnOpts.active = true;

    this.marcadorRequest.codigoMac = this.data.mac.codigo;
    // this.marcadorRequest.codigoGrupoDiag = this.marcadorForm.get('codigoGrupoDiagnostico').value;
    this.marcadorRequest.codigoGrupoDiag = Number(this.codigoGrupoDiagnostico);
    this.marcadorRequest.index = this.paginator.pageIndex.toString();
    this.marcadorRequest.longitud = this.pageSize.toString();

    this.isLoadingResults = true;

    this.dataSource.data = [];

    this.marcadorService.buscarMarcador(this.marcadorRequest).subscribe(
      (respuesta: WsResponse) => {
        this.marcadorBtnOpts.active = false;
        this.isLoadingResults = false;
        if (respuesta.audiResponse.codigoRespuesta != "0") {
          console.error("Error al listar marcadores");
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            "Error al listar marcadores",
            true,
            false,
            null
          );
        } else {
          // const codG = this.marcadorForm.get('codigoGrupoDiagnostico').value;
          // const objG = this.listaGrupo.find(function(o) { return o.codigo === codG; });
          const desG = this.descripcionGrupoDiagnostico;
          this.dataSource.data = respuesta.data.map(function (o) {
            o.descripcionGrupoDiag = desG;
            return o;
          });
          // this.dataSource.data = respuesta.data;
          this.dataSource.paginator = this.paginator;
          this.resultsLength = respuesta.data.length;
        }
      },
      (error) => {
        this.marcadorBtnOpts.active = false;
        this.isLoadingResults = false;
        console.error(error);
        this.openDialogMensaje(
          MENSAJES.ERROR_SERVICIO,
          "Error al listar marcadores",
          true,
          false,
          null
        );
      }
    );
  }

  openRegistrarMarcador(): void {
    const auxGrupo = this.codigoGrupoDiagnostico;

    if (auxGrupo) {
      const grupo = this.listaGrupo.filter(
        (grupo) => grupo.codigo === auxGrupo
      );

      const dialogRef = this.dialog.open(RegistrarMarcadorComponent, {
        width: "640px",
        disableClose: true,
        autoFocus: false,
        data: {
          mac: this.data.mac,
          grupo: grupo[0],
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result === true) {
          this.accionMarcador();
        }
      });
    } else {
      this.openDialogMensaje(
        MENSAJES.ERROR_CAMPOS,
        "Debe seleccionar un Grupo Diagnostico",
        true,
        false,
        null
      );
    }
  }

  openEditarMarcador(marcador): void {
    const auxGrupo = this.codigoGrupoDiagnostico;

    if (auxGrupo) {
      const grupo = this.listaGrupo.filter(
        (grupo) => grupo.codigo === auxGrupo
      );

      const dialogRef = this.dialog.open(EditarMarcadorComponent, {
        width: "640px",
        disableClose: true,
        autoFocus: false,
        data: {
          marcador: marcador,
          grupo: grupo[0],
          mac: this.data.mac,
        },
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result === true) {
          this.accionMarcador();
        }
      });
    } else {
      this.openDialogMensaje(
        MENSAJES.ERROR_CAMPOS,
        "Debe seleccionar un Grupo Diagnostico",
        true,
        false,
        null
      );
    }
  }

  openBuscarGrupoDiagnostico(): void {
    const dialogRef = this.dialog.open(BuscarGrupoDiagnosticoComponent, {
      width: "640px",
      disableClose: true,
      autoFocus: false,
      data: {
        title: "BÚSQUEDA GRUPO DIAGNOSTICO",
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.marcadorForm
          .get("codigoGrupoDiagnostico")
          .setValue(result.nomDiagnostico);
        this.codigoGrupoDiagnostico = result.codDiagnostico;
        this.descripcionGrupoDiagnostico = result.nomDiagnostico;
        /*this.marcadorRequest.codUsuario = result.codUsuario;
            this.marcadorForm.get('codigoUsuario').setValue(result.usuario);
            this.marcadorForm.get('nombreUsuario').setValue(`${result.apePate} ${result.apeMate}, ${result.nombres}`);
            this.marcadorForm.get('correoUsuario').setValue(result.correo);*/
      }
    });
  }
}
