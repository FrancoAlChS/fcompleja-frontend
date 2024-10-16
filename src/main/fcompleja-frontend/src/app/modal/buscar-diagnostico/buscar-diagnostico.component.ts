import { Component, Inject, ViewChild } from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA, MatTableDataSource, MatSort} from '@angular/material';
import { HttpClient } from '@angular/common/http';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import { BuscarGrupoDiagnosticoRequest } from 'src/app/dto/request/BuscarGrupoDiagnosticoRequest';
import { ConfiguracionService } from 'src/app/service/configuracion.service';
import { WsResponseOnco } from 'src/app/dto/WsResponseOnco';


export interface MedicoData {
    title: string;
}

@Component({
    selector: 'app-buscar-diagnostico',
    templateUrl: 'buscar-diagnostico.component.html',
})
export class BuscarGrupoDiagnosticoComponent {
    public rowDataMedico: any;
    public rowSelection;

    diagnosticoAfilRequest: BuscarGrupoDiagnosticoRequest = new BuscarGrupoDiagnosticoRequest();
    dataSourceDiag: MatTableDataSource<any>;
    @ViewChild(MatSort) sort: MatSort;
    listaDiagnosticoAfi: any[];
    isLoading = true;

    constructor(public dialogRef: MatDialogRef<BuscarGrupoDiagnosticoComponent>, @Inject(MAT_DIALOG_DATA) public data: MedicoData, private http: HttpClient,
    private formBuilder: FormBuilder, private confService: ConfiguracionService) {
        this.rowSelection = 'single';
    }
    formDiagnostico: FormGroup;

    displayedColumns: string[] = ['coddia', 'nomdia'];

   ngOnInit() {
      this.isLoading = false;
      this.formDiagnostico = this.formBuilder.group({
        'diagnostico': this.formBuilder.control(null, [Validators.minLength(4)]),
      });
    }
    get diagnostico() {
      return this.formDiagnostico.get('diagnostico');
    }

    filtrarDiagnostico(): void {
        const parametro = this.formDiagnostico.get('diagnostico').value;
        if (parametro && parametro.length >= 4) {
            this.listarDiagnostico(parametro);
        }
    }

    listarDiagnostico(parametro: any): void {
      this.dataSourceDiag = null;
      if (parametro.length >= 4) {
        this.isLoading = true;
        this.diagnosticoAfilRequest.registroInicio = 1;
        this.diagnosticoAfilRequest.registroFin = 300;
        this.diagnosticoAfilRequest.tipoBusqueda = 3;
        this.diagnosticoAfilRequest.codigoGrupoDiagnostico = '';
        this.diagnosticoAfilRequest.nombreGrupoDiagnostico = parametro.toUpperCase();
        this.confService.buscarGrupoDiagnostico(this.diagnosticoAfilRequest).
        subscribe(
            (dataResponse: WsResponseOnco) => {
            if (dataResponse.audiResponse.codigoRespuesta === '0') {
                this.listaDiagnosticoAfi = dataResponse.dataList;
                this.dataSourceDiag = new MatTableDataSource(this.listaDiagnosticoAfi);
                this.dataSourceDiag.sort = this.sort;
                this.isLoading = false;
            } else {
                this.isLoading = false;
                this.dataSourceDiag = null;
                return;
            }
        },
        error => {
            // 
            this.isLoading = false;
        }
      );
    }
    }

    grabarDiagnostico(param: any): void {
      if (this.formDiagnostico.invalid) {
        this.diagnostico.markAsTouched();
      }
      this.dialogRef.close({
        codDiagnostico: param.codigo,
        nomDiagnostico: param.descripcion
      });
    }
    onDialogClose(data): void {
      this.dialogRef.close(data);
    }
}
