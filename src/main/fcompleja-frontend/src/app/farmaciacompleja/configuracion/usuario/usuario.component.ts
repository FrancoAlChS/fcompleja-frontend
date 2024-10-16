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
  CODIGO_PERFIL,
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
import { FormGroup, FormControl } from "@angular/forms";
import { MatProgressButtonOptions } from "mat-progress-buttons";
import { ConfiguracionService } from "src/app/service/configuracion.service";
import { MessageComponent } from "src/app/core/message/message.component";
//import { RegistrarExamenMedicoComponent } from './registrar/registrar.component';
//import { EditarExamenMedicoComponent } from './editar/editar.component';
import { RegistrarUsuarioComponent } from "./registrar/registrar.component";
import { UsrRolRequest } from "src/app/dto/UsrRolRequest";
import { ListaFiltroUsuarioRolservice } from "src/app/service/Lista.usuario.rol.service";
import { UsrRolResponse } from "src/app/dto/UsrRolResponse";
import { AplicacionBeanRequest } from "src/app/dto/AplicacionBeanRequest";
import { ParametroService } from "src/app/service/cross/parametro.service";
import { WsResponseOnco } from "src/app/dto/WsResponseOnco";
import { BuscarUsuarioRequest } from "src/app/dto/request/BuscarUsuarioRequest";
import { UsuarioMantenimientoService } from "src/app/service/Configuracion/usuario.service";
import { UsuarioRequest } from "src/app/dto/request/UsuarioRequest";
import { EditarUsuarioComponent } from "./editar/editar.component";
import { MomentDateAdapter } from "@angular/material-moment-adapter";
import { MatPaginatorIntlEspanol } from "src/app/directives/matpaginator-translate";

@Component({
  selector: "app-mantenimiento-usuario",
  templateUrl: "./usuario.component.html",
  styleUrls: ["./usuario.component.scss"],
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
export class UsuarioComponent implements AfterViewInit, OnInit {
  // TABLA
  pageSize: number = PAG_SIZ_SMALL;
  pageSizeOptions: number[] = PAG_OBT_SMALL;

  displayedColumns: string[] = [
    "aplicacion",
    "rol",
    "usuario",
    "apePate",
    "nombres",
    "correo",
    "estado",
    "opciones",
  ];
  dataSource = new MatTableDataSource<any>([]);
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

  spinnerAplicacion: boolean = true;
  listaAplicacion: any[] = [];
  spinnerPerfil: boolean = false;
  listaPerfil: any[] = [];
  btnBuscar: boolean;

  buscarUsuarioRequest: BuscarUsuarioRequest = new BuscarUsuarioRequest();

  constructor(
    public dialog: MatDialog,
    private parametroService: ParametroService,
    public confService: ConfiguracionService,
    private rolService: ListaFiltroUsuarioRolservice,
    private usuarioService: UsuarioMantenimientoService
  ) {
    this.marcadorForm = new FormGroup({
      aplicacion: new FormControl(null, []),
      perfil: new FormControl(null, []),
      usuario: new FormControl(null, []),
    });
  }

  ngOnInit() {
    this.cargarParametro();
  }
  ngAfterViewInit(): void {}

  get fc() {
    return this.marcadorForm.controls;
  }

  public cargarParametro(): void {
    this.btnBuscar=true;
    this.spinnerAplicacion = false;
    var aplicacionRequest: AplicacionBeanRequest = new AplicacionBeanRequest();
    this.parametroService.buscarAplicacion(aplicacionRequest).subscribe(
      (respuesta: WsResponseOnco) => {
        this.spinnerAplicacion = false;
        if (respuesta.audiResponse.codigoRespuesta === "0") {
          this.listaAplicacion = respuesta.dataList;
        } else {
          console.error(respuesta.audiResponse.mensajeRespuesta);
        }
        this.btnBuscar=false;
      },
      (error) => {
        this.spinnerAplicacion = false;
        console.error("Error al Buscar Aplicaciones");
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
        title: MENSAJES.CONF.USUARIO,
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
    this.btnBuscar=true;
    if (this.marcadorForm.invalid) {
      return;
    }

    this.isLoadingResults = true;
    this.dataSource.data = [];
    this.resultsLength = 0;

    this.buscarUsuarioRequest.codAplicacion = this.marcadorForm.get(
      "aplicacion"
    ).value
      ? String(this.marcadorForm.get("aplicacion").value)
      : null;
    this.buscarUsuarioRequest.codRol = this.marcadorForm.get("perfil").value
      ? String(this.marcadorForm.get("perfil").value)
      : null;
    this.buscarUsuarioRequest.usuario = this.marcadorForm.get("usuario").value;

    this.usuarioService.buscarUsuario(this.buscarUsuarioRequest).subscribe(
      (response: WsResponseOnco) => {
        this.isLoadingResults = false;
        if (response.audiResponse.codigoRespuesta != "0") {
          this.openDialogMensaje(
            MENSAJES.ERROR_SERVICIO,
            "Error al Buscar Usuario",
            true,
            false,
            null
          );
        } else {
          if (response.dataList) {
            this.dataSource.data = response.dataList;
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.resultsLength = this.dataSource.data.length;
          }
        }
        this.btnBuscar=false;
      },
      (error) => {
        this.isLoadingResults = false;
        console.error(error);
        this.openDialogMensaje(
          MENSAJES.ERROR_SERVICIO,
          "Error al Buscar Usuario",
          true,
          false,
          null
        );
      }
    );
  }

  cambioTipoAplicacion() {
    const codigoAplicacion = this.marcadorForm.get("aplicacion").value;
    this.marcadorForm.get("perfil").setValue(null);
    if (codigoAplicacion) {
      const rolRequest = new UsrRolRequest();
      rolRequest.codAplicacion = codigoAplicacion;
      this.spinnerPerfil = true;
      this.rolService.listarRoles(rolRequest).subscribe(
        (data: UsrRolResponse) => {
          this.spinnerPerfil = false;
          if (data.audiResponse.codigoRespuesta === "0") {
            var auxList: any[] = [];
            data.dataList.map(function (o) {
              if (
                !(
                  o.codRol === CODIGO_PERFIL.LT || o.codRol === CODIGO_PERFIL.MC
                )
              ) {
                auxList.push(o);
              }
            });
            this.listaPerfil = auxList;
          } else {
            this.openDialogMensaje(
              MENSAJES.ERROR_NOFUNCION,
              data.audiResponse.mensajeRespuesta,
              true,
              false,
              null
            );
          }
        },
        (error) => {
          this.spinnerPerfil = false;
          console.error("Error al listar Pefiles");
          this.openDialogMensaje(
            MENSAJES.ERROR_NOFUNCION,
            "Error al listar Pefiles",
            true,
            false,
            null
          );
        }
      );
    }
  }

  openRegistrarMarcador(): void {
    const dialogRef = this.dialog.open(RegistrarUsuarioComponent, {
      width: "800px",
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

  openEditarMarcador(usuario): void {
    const dialogRef = this.dialog.open(EditarUsuarioComponent, {
      width: "640px",
      disableClose: true,
      autoFocus: false,
      data: {
        usuario: usuario,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.accionMarcador();
      }
    });
  }
}
