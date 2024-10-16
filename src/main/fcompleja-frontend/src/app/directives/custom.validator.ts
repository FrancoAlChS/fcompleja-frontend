import { AbstractControl, ValidatorFn } from '@angular/forms';
import { HistPacienteResponse } from '../dto/response/HistPacienteResponse';
import { DatePipe } from '@angular/common';


export class CustomValidator {
  static descripcionInvalida(todosDocumentos: HistPacienteResponse[]) {
    return (control: AbstractControl) => {
      let activar: boolean;

      activar = false;

      control.markAsUntouched();

      if (control.pristine) {
        return null;
      }

      if (control.value === undefined || control.value === '') {
        return null;
      }

      todosDocumentos.forEach(docu => {
        if (docu.descripcionDocumento.toUpperCase().trim() === control.value.toUpperCase().trim()) {
          activar = true;
          return;
        }
      });

      if (activar) {
        control.markAsTouched();
        return { invalidDescription: true };
      }

      return null;
    };
  }

  static checkLimit(min: number, max: number): ValidatorFn {
    return (c: AbstractControl): { [key: string]: boolean } | null => {
      if (c.value && (isNaN(c.value) || c.value < min || c.value > max)) {
        return { 'range': true };
      }
      return null;
    };
  }

  static validDate(control: AbstractControl) {
    const regex: RegExp = new RegExp(/^([0-2][0-9]|(3)[0-1])(\/)(((0)[0-9])|((1)[0-2]))(\/)\d{4}$/i);
    const date = (control.value !== null) ? control.value.format('DD/MM/YYYY') : null;

    control.markAsUntouched();

    if (date !== null) {
      if (typeof date === 'string') {
        if (date && !String(date).match(regex)) {
          control.markAsTouched();
          return { 'dateValid': true };
        } else {
          return null;
        }
      }
    }

    return null;
  }
}
