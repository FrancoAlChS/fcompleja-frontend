import {
  Component,
  AfterViewInit,
  ViewChild,
  forwardRef,
  OnInit,
} from "@angular/core";
import {
  PAG_SIZ_SMALL,
  PAG_OBT_SMALL,
  MENSAJES,
  MY_FORMATS_AUNA,
} from "src/app/common";
import {
  MatPaginator,
  MatDialog,
  MatTableDataSource,
  DateAdapter,
  MAT_DATE_FORMATS,
  MatPaginatorIntl,
  MAT_DATE_LOCALE,
  MatSort,
} from "@angular/material";
import { MarcadorService } from "src/app/service/Configuracion/marcador.service";
import { FormGroup, FormControl, Validators, FormArray } from "@angular/forms";
import { MatProgressButtonOptions } from "mat-progress-buttons";
import { ConfiguracionService } from "src/app/service/configuracion.service";
import { MessageComponent } from "src/app/core/message/message.component";
import { WsResponse } from "src/app/dto/WsResponse";
import { ExamenMedico } from "src/app/dto/ExamenMedico";
import { RegistrarParticipanteComponent } from "./registrar/registrar.component";
import { Participante } from "src/app/dto/Participante";
import { EditarParticipanteComponent } from "./editar/editar.component";
import { MatPaginatorIntlEspanol } from "src/app/directives/matpaginator-translate";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { RegistrarComiteComponent } from "./registrar-comite/registrar-comite.component";
// import { RegistrarExamenMedicoComponent } from './registrar/registrar.component';
// import { EditarExamenMedicoComponent } from './editar/editar.component';

@Component({
  selector: "app-participantes",
  templateUrl: "./participantes.component.html",
  styleUrls: ["./participantes.component.scss"],
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
export class ParticipantesComponent implements OnInit, AfterViewInit {
  // TABLA
  pageSize: number = PAG_SIZ_SMALL;
  pageSizeOptions: number[] = PAG_OBT_SMALL;

  resultAutorizador: any[] = [
    {
      codigo: 507,
      titulo: "Activo",
      selected: false,
    },
    {
      codigo: 508,
      titulo: "Inactivo",
      selected: false,
    },
  ];

  manComFrmArray = new FormArray([]);

  dataListComite: [];

  EditFrmGrp: FormGroup = new FormGroup({
    editFrm: new FormControl(false),
  });

  get editFrm() {
    return this.EditFrmGrp.get("editFrm");
  }

  displayedColumns: string[] = [
    "codParticipanteLargo",
    "apellidos",
    "descripcionRol",
    "correoElectronico",
    "estadoParticipante",
    "opciones",
  ];
  //dataSource: Marcador[] = [];
  dataSource: MatTableDataSource<Participante> = new MatTableDataSource([]);

  resultsLength = 0;
  isLoadingResults = false;
  isRateLimitReached = false;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

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
  btnBuscar: boolean;

  marcadorRequest: ExamenMedico = new ExamenMedico();

  constructor(
    //public dialogRef: MatDialogRef<ExamenesMedicosComponent>,
    //@Inject(MAT_DIALOG_DATA) public data: DialogMarcadoresData,
    public dialog: MatDialog,
    private marcadorService: MarcadorService,
    public confService: ConfiguracionService
  ) {
    this.marcadorForm = new FormGroup({
      nombre: new FormControl(null, []),
    });
  }

  ngOnInit() {
    this.cargarParametro();
    this.cargarComites();
  }

  ngAfterViewInit(): void {}

  get fc() {
    return this.marcadorForm.controls;
  }

  /*public onClose(): void {
    this.dialogRef.close(null);
  }*/

  public cargarComites(): void {
    this.marcadorService.listarComitte({}).subscribe(
      (resp) => {
        this.dataListComite = resp["data"];

        for (let index = 0; index < this.dataListComite.length; index++) {
          this.manComFrmArray.push(
            new FormGroup({
              nomComFrmCtrl: new FormControl(
                this.dataListComite[index]["descripcionComite"]
              ),
              resultFrmCtrl: new FormControl(
                this.dataListComite[index]["codigoEstado"]
              ),
              codigoComite: new FormControl(
                this.dataListComite[index]["codigoComite"]
              ),
            })
          );
        }
        this.manComFrmArray.controls.forEach((e) => {
          e.disable();
        });
      },
      (err) => {}
    );
  }

  public cargarParametro(): void {
    this.btnBuscar=true;
    this.marcadorBtnOpts.active = true;

    this.isLoadingResults = true;

    this.dataSource = null;

    var participanteRequest: Participante = new Participante();
    participanteRequest.apellidos = this.marcadorForm.get("nombre").value;

    this.marcadorService.buscarParticipantes(participanteRequest).subscribe(
      (respuesta: WsResponse) => {
        this.marcadorBtnOpts.active = false;
        this.isLoadingResults = false;
        if (respuesta.audiResponse.codigoRespuesta != "0") {
          console.error("Error al listar Participante");
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            "Error al listar Participante",
            true,
            false,
            null
          );
        } else {
          //this.dataSource.data = respuesta.data;
          this.dataSource = new MatTableDataSource(respuesta.data);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.resultsLength = respuesta.data.length;
        }
        this.btnBuscar=false;
      },
      (error) => {
        this.marcadorBtnOpts.active = false;
        this.isLoadingResults = false;
        console.error(error);
        this.openDialogMensaje(
          MENSAJES.ERROR_SERVICIO,
          "Error al listar Participante",
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
        title: MENSAJES.CONF.PARTICIPANTE_SISTEMA,
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

    this.cargarParametro();
  }

  accionComite() {
    this.marcadorSubmitted = true;

    if (this.manComFrmArray.invalid) {
      return;
    }

    this.cargarComites();
  }

  openRegistrarMarcador(): void {
    const dialogRef = this.dialog.open(RegistrarParticipanteComponent, {
      width: "640px",
      disableClose: true,
      autoFocus: false,
      data: {},
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.accionMarcador();
      }
    });
  }

  openRegistrarComites(): void {
    //this.openDialogMensaje2("hola", MENSAJES.INFO_SALIR, false, true, null);

    const dialogRef = this.dialog.open(RegistrarComiteComponent, {
      width: "640px",
      disableClose: true,
      autoFocus: false,
      data: {},
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.accionComite();
      }
    });
  }

  // POP-UP MENSAJES
  public openDialogMensaje2(
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
        title: "COMITE",
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
        var comite_actualizar = this.manComFrmArray.value.map((el) => {
          return {
            descripcionComite: el.nomComFrmCtrl,
            codigoEstado: el.resultFrmCtrl,
            codigoComite: el.codigoComite,
          };
        });

        const json = {
          datosComite: comite_actualizar,
        };

        this.marcadorService.actualizarComitte(json).subscribe(
          (resp) => {
            if (resp["audiResponse"]["codigoRespuesta"] == "0") {
              this.openDialogMensaje(
                "COMITE",
                resp["audiResponse"]["mensajeRespuesta"],
                true,
                false,
                null
              );
            }
          },
          (err) => {}
        );
      }
    });
  }

  public openDialogMensaje3(
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
        title: "COMITE",
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 1) {
      }
    });
  }

  openEditarMarcador(marcador): void {
    const dialogRef = this.dialog.open(EditarParticipanteComponent, {
      width: "640px",
      disableClose: true,
      autoFocus: false,
      data: {
        participante: marcador,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.accionMarcador();
      }
    });
  }

  editarFormComite() {
    if (this.editFrm.value == true) {
      this.manComFrmArray.controls.forEach((e) => {
        e.disable();
      });
    } else {
      this.manComFrmArray.controls.forEach((e) => {
        e.enable();
      });
    }
  }

  verificarResult(e) {
    // if (e.value == 508) {
    //   this.openDialogMensaje3(
    //     "TIPOS - COMITÉ",
    //     "¿Desea cambiar de estado?",
    //     false,
    //     true,
    //     null
    //   );
    // }
  }

  agregarComites() {
    this.manComFrmArray.push(
      new FormGroup({
        nomComFrmCtrl: new FormControl(null),
        resultFrmCtrl: new FormControl(1),
      })
    );
  }

  onSubmit() {
    this.openDialogMensaje2(
      "TIPOS - COMITÉ",
      MENSAJES.INFO_ACTUALIZAR_COMITE,
      false,
      true,
      null
    );
  }
}
