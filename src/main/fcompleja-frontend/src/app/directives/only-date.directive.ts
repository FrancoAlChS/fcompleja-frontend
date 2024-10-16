import { Directive, ElementRef, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

export interface Parametros {
  type: String;
}

@Directive({
  selector: '[appOnlyDate]'
})
export class OnlyDateDirective {

  @Input('appOnlyDate') params: Parametros;

  constructor(private dateElement: ElementRef) { }

  @HostListener('keypress', ['$event'])
  public onkeypress(event: KeyboardEvent) {
    const lengthInputDate = this.dateElement.nativeElement.value.length;
    if (this.params.type === 'date') {
      if (lengthInputDate > 0 && lengthInputDate < 10) {
        if (lengthInputDate === 2 || lengthInputDate === 5) {
          this.dateElement.nativeElement.value = this.dateElement.nativeElement.value + '/';
        }
      } else if (lengthInputDate === 10) {
        event.preventDefault();
      }
    } else if (this.params.type === 'hour') {
      if (lengthInputDate > 0 && lengthInputDate < 4) {
        if (lengthInputDate === 2) {
          this.dateElement.nativeElement.value = this.dateElement.nativeElement.value + ':';
        }
      } else if (lengthInputDate === 5) {
        event.preventDefault();
      }
    }

    if (event.charCode > 47 && event.charCode < 58) {

    } else {
      event.preventDefault();
    }
  }
}
