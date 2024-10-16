import { Injectable } from "@angular/core";
import { CanDeactivate,ActivatedRouteSnapshot,RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable()
export class CanDeactivateGuard
  implements CanDeactivate<CanComponentDeactivate> {
  canDeactivate(component: CanComponentDeactivate,
                route: ActivatedRouteSnapshot, 
                state: RouterStateSnapshot,
                nextState:RouterStateSnapshot
    ) {
      //return window.confirm("¿estas seguro que quiere salir?");
      let url: string = nextState.url;
      // localStorage.removeItem("codigoPaciente");
      if(url == '/app/registro-linea-tratamiento'){
        return true
      }else if(url == '/login'){
        return true
      }else if(url == '/app/medicamento-nuevo'){
        return true
      }else if(url == '/app/medicamento-continuador'){
        return true
      }else if(url == '/app/monitoreo-paciente'){
        return true
      }
      
    return component.canDeactivate ? component.canDeactivate() : true;
  }
}
