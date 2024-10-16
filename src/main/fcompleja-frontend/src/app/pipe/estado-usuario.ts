import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estadoUsuario'
})
export class EstadoUsuarioPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    switch(value) {
      case 'A':
        return 'ACTIVO';
        break;
      case 'I':
        return 'INACTIVO';
        break;
      default:
      return value;
    }
  }

}