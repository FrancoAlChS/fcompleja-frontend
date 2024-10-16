import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  Inject,
} from "@angular/core";
import {
  MatDialog,
  MatSort,
  MatTableDataSource,
  MatPaginator,
  DateAdapter,
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
  MatPaginatorIntl,
  MatIconRegistry,
} from "@angular/material";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { ConfiguracionService } from "src/app/service/configuracion.service";
import { DiagnosticoDTO } from "src/app/dto/configuracion/DiagnosticoDTO";
import { FiltroDIAGNOSTICOResponse } from "src/app/dto/configuracion/FiltroDIAGNOSTICOResponse";
import { MessageComponent } from "src/app/core/message/message.component";
import { MENSAJES, MY_FORMATS_AUNA } from "src/app/common";
import { ControlGastoService } from "src/app/service/ControlGasto/control-gasto.service";
import { UsuarioService } from "src/app/dto/service/usuario.service";
import { Ng4LoadingSpinnerService } from "ng4-loading-spinner";
import { DiagnosticoService } from "src/app/dto/service/diagnostico.service";
import { DiagnosticoModuleService } from "src/app/service/diagnostico/diagnostico.module.service";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
  selector: "app-diagnostico",
  templateUrl: "./diagnostico.component.html",
  styleUrls: ["./diagnostico.component.scss"],
})
export class DiagnosticoComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild("archivoCargado") archivoCargado: ElementRef;

  listaDiagnostico: DiagnosticoDTO[];
  dataSource: MatTableDataSource<DiagnosticoDTO> = new MatTableDataSource([]);
  filtroDiagnostico: DiagnosticoDTO = new DiagnosticoDTO();

  isLoading: boolean;
  loadFile: boolean;
  bloqInscripcion: boolean;
  mensajes: string;

  diagnosticoFrmGrp: FormGroup = new FormGroup({
    filtroCodMACFrmCtrl: new FormControl(null),
    filtroDescMACFrmCtrl: new FormControl(null),
  });

  get filtroCodMACFrmCtrl() {
    return this.diagnosticoFrmGrp.get("filtroCodMACFrmCtrl");
  }
  get filtroDescMACFrmCtrl() {
    return this.diagnosticoFrmGrp.get("filtroDescMACFrmCtrl");
  }

  mac2FrmGrp: FormGroup = new FormGroup({
    nameFileFrmCtrl: new FormControl(null, [Validators.required]),
  });

  get nameFileFrmCtrl() {
    return this.mac2FrmGrp.get("nameFileFrmCtrl");
  }

  displayedColumns: string[];
  columnsGrilla = [
    {
      columnDef: "codigoLargo",
      header: "CÓDIGO",
      cell: (diagnosticoResponse: DiagnosticoDTO) =>
        `${diagnosticoResponse.codigo}`,
    },
    {
      columnDef: "descripcion",
      header: "DESCRIPCIÓN",
      cell: (diagnosticoResponse: DiagnosticoDTO) =>
        `${diagnosticoResponse.descripcion}`,
    },
  ];

  constructor(
    private _ctrlGastoService: ControlGastoService,
    private diagnosticoService: DiagnosticoModuleService,
    public dialog: MatDialog,
    private spinnerService: Ng4LoadingSpinnerService,
    private configuracionService: ConfiguracionService,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    @Inject(UsuarioService) private usuarioService: UsuarioService
  ) {}

  ngOnInit() {
    this.inicializarVariables();
    this.createTablaDiagnostico();
    this.eventoFiltrarDiagnostico();
    this.iconRegistry.addSvgIcon(
      "excel-icon",
      this.sanitizer.bypassSecurityTrustResourceUrl(
        "./assets/img/icon-excel-2.svg"
      )
    );
  }

  public inicializarVariables(): void {
    this.isLoading = false;
    this.nameFileFrmCtrl.disable();
    this.listaDiagnostico = [];
    this.filtroDiagnostico = new DiagnosticoDTO();
  }

  public createTablaDiagnostico(): void {
    this.displayedColumns = [];
    this.columnsGrilla.forEach((column) => {
      this.displayedColumns.push(column.columnDef);
    });
  }

  public cargarTablaDiagnosticos(): void {
    if (this.listaDiagnostico.length > 0) {
      this.dataSource = new MatTableDataSource(this.listaDiagnostico);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  public guardarFiltros(): void {
    this.filtroDiagnostico = new DiagnosticoDTO();
    this.filtroDiagnostico.codigo =
      this.filtroCodMACFrmCtrl.value == ""
        ? null
        : this.filtroCodMACFrmCtrl.value;
    this.filtroDiagnostico.descripcion =
      this.filtroDescMACFrmCtrl.value == ""
        ? null
        : this.filtroDescMACFrmCtrl.value;
    
  }

  ///////////////////////////////////// Servicios
  public eventoFiltrarDiagnostico(): void {
    this.isLoading = true;
    this.dataSource = null;
    this.guardarFiltros();
    this.configuracionService
      .filtrarDIAGNOSTICO(this.filtroDiagnostico)
      .subscribe(
        (response: FiltroDIAGNOSTICOResponse) => {
          
          if (response.audiResponse.codigoRespuesta === "0") {
            this.listaDiagnostico =
              response.dataList != null ? response.dataList : [];
            this.cargarTablaDiagnosticos();
          } else {
            this.mensajes = response.audiResponse.mensajeRespuesta;
            this.openDialogMensaje(
              MENSAJES.ERROR_NOFUNCION,
              this.mensajes,
              true,
              false,
              null
            );
          }

          this.isLoading = false;
        },
        (error) => {
          this.mensajes = MENSAJES.ERROR_SERVICIO;
          console.error("Error al filtrar DIAGNOSTICO");
          this.openDialogMensaje(
            this.mensajes,
            "Error al filtrar DIAGNOSTICO",
            true,
            false,
            null
          );
          this.isLoading = false;
        }
      );
  }

  //////////////////////////////////////
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
        title: "CONFIGURACIÓN DEL SISTEMA",
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {});
  }
  /////////////////////////////////////

  openDialogMensaje2(
    message: string,
    message2: string,
    alerta: boolean,
    confirmacion: boolean,
    valor: any
  ) {
    const dialogRef = this.dialog.open(MessageComponent, {
      width: "400px",
      disableClose: true,
      data: {
        title: MENSAJES.CONSUMO.TITLE,
        message: message,
        message2: message2,
        alerta: alerta,
        confirmacion: confirmacion,
        valor: valor,
      },
    });
    return dialogRef.afterClosed();
  }

  openInput(): void {
    // if (this.today < this.endDate && this.startDate <= this.today) {
    document.getElementById("fileInput").click();
    // }
    // else {
    //   this.openDialogMensaje(MENSAJES.CONSUMO.VALIDA_MES, null, true, false, null);
    // }
  }

  cargarArchivo() {
    if (this.archivoCargado.nativeElement.files.length === 0) {
      this.nameFileFrmCtrl.setValue(null);
      this.bloqInscripcion = true;
    } else {
      this.nameFileFrmCtrl.setValue(
        this.archivoCargado.nativeElement.files[0].name
      );
      this.bloqInscripcion = false;
    }
  }

  descargarDiagnostico() {
    this.diagnosticoService.descargarDiagnostico().subscribe(
      (data) => {
        const elem = window.document.createElement("a");
        elem.id = "RepEvento1";
        elem.href = window.URL.createObjectURL(data);
        elem.download = "reporte_evento.xlsx";
        document.body.appendChild(elem);
        elem.click();
        this.spinnerService.hide();
      },
      (err) => {
        console.error(err);
        this.spinnerService.hide();
        this.cleanAttached();
        this.openDialogMensaje2(
          MENSAJES.RecAccount.error404,
          null,
          true,
          false,
          null
        );
      }
    );
  }

  importarArchivoGrpDiag() {
    this.openDialogMensaje2(
      MENSAJES.CONSUMO.CONFIRMACION_MARCADORES,
      null,
      false,
      true,
      null
    ).subscribe((result) => {
      if (result === 0) {
        this.cleanAttached();
        return 0;
      } else {
        // Valida que el archivo sea un excel
        if (
          !this.archivoCargado.nativeElement.files[0].name
            .toLowerCase()
            .match(/(\.xlsx|\.xls)$/)
        ) {
          // if (!this.archivoCargado.nativeElement.files[0].name.toLowerCase().match(/(\.xlsx|\.xls|\.csv)$/)) {
          this.openDialogMensaje2(
            MENSAJES.CONSUMO.VALIDA_EXCEL,
            null,
            true,
            false,
            null
          );
          this.cleanAttached();
          this.diagnosticoService.importarArchivo(
            this.usuarioService.getCodUsuario,
            this.usuarioService.getNombres,
            null
          );
          return 0;
        }

        // Valida que el archivo no sea mayor de 50mb
        if (this.archivoCargado.nativeElement.files[0].size > 52428800) {
          this.openDialogMensaje2(
            MENSAJES.CONSUMO.VALIDA_50MB,
            null,
            true,
            false,
            null
          );
          this.cleanAttached();
          this.diagnosticoService.importarArchivo(
            this.usuarioService.getCodUsuario,
            this.usuarioService.getNombres,
            null
          );
          return 0;
        }

        this.loadFile = true;
        this.spinnerService.show();

        let usuario = `${this.usuarioService.getNombres} ${this.usuarioService.getApelPaterno}`;
        
        this.diagnosticoService
          .importarArchivo(
            this.usuarioService.getCodUsuario,
            usuario,
            this.archivoCargado.nativeElement.files[0]
          )
          .subscribe(
            (data) => {
              
              
              //this.spinnerService.show();
              
              if (data["codResultado"] === 0) {
                this.spinnerService.hide();
                this.loadFile = false;
                this.eventoFiltrarDiagnostico();
                this.openDialogMensaje(
                  MENSAJES.CONSUMO.SUBTITULO_OK,
                  null,
                  true,
                  false,
                  null
                );
                this.cleanAttached();
                return 0;
              } else {
                this.mensajes = data["msgResultado"];
                this.spinnerService.hide();
                this.loadFile = false;
                this.openDialogMensaje(
                  MENSAJES.ERROR_NOFUNCION,
                  this.mensajes,
                  true,
                  false,
                  null
                );
                this.cleanAttached();
                return 0;
              }

              // // if (data.codResultado > 0 && data.msgResultado !== null) {
              // if (data.codResultado === 0) {
              //   this.spinnerService.hide();
              //   this.loadFile = false;
              //   //this.listarTabla();
              //   this.openDialogMensaje2(MENSAJES.CONSUMO.SUBTITULO_OK, null, true, false, null);
              //   this.cleanAttached();
              //   return 0;
              // } else {

              //   if (data.listResponse.length > 0) {

              //     data.listResponse.forEach(l => {
              //       contador = contador + 1;
              //       validacion.push(`${contador}. ${l.msgResultado}.`);
              //     });
              //   }

              //   let errores = validacion.filter(value => typeof value !== 'undefined').join('\n').toString();

              //   if (contador > 0) {
              //     this.spinnerService.hide();
              //     this.loadFile = false;
              //     this.openDialogMensaje2(MENSAJES.CONSUMO.SUBTITULO_ERROR, errores, true, false, null);
              //     this.cleanAttached();
              //     return 0;
              //   }
              // }
            },
            (error) => {
              
              this.spinnerService.hide();
              this.cleanAttached();
              this.openDialogMensaje2(
                MENSAJES.RecAccount.error404,
                null,
                true,
                false,
                null
              );
            }
          );
      }
    });
  }

  cleanAttached() {
    this.archivoCargado.nativeElement.value = "";
    this.nameFileFrmCtrl.setValue(null);
    this.bloqInscripcion = true;
  }
}
