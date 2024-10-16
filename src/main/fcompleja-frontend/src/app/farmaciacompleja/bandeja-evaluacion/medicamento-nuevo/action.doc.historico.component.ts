import { Component } from '@angular/core';
import {ICellRendererAngularComp} from "ag-grid-angular";

// buttons action grid
@Component({
    selector: 'child-cell',
    templateUrl: './action.doc.historico.component.html'
})
export class ActionDocHistoricoComponent implements ICellRendererAngularComp {
    public params: any;
    agInit(params: any): void {
        this.params = params;
    }
    refresh(): boolean {
        return false;
    }

    public descargarArchivo(){
    }
}
