import { Directive, Input, ElementRef, HostListener } from '@angular/core';

export interface Valores {
  size: number;
  tipo: string;
}

@Directive({
  selector: '[appAlphaNumerico]'
})


export class AlphaNumericoDirective {
  @Input() appAlphaNumerico: Valores;
  private regexPalabra: RegExp = new RegExp(/^[\w]+$/);
  private regexTexto: RegExp = new RegExp(/^[\n\w ]+$/);
  private regexCampo: RegExp = new RegExp(/^[\n\w .-]+$/);
  private regexCampoMas: RegExp = new RegExp(/^[\+\-\n\w ]+$/);
  private regexPalabraEspecial: RegExp = new RegExp(/^[\S]+$/);
  private regex: RegExp;

  private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'Ctrl'];

  constructor(private el: ElementRef) { }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }

    if (typeof (this.appAlphaNumerico) !== 'undefined' &&
      this.appAlphaNumerico.size != null &&
      this.el.nativeElement.value.length >= this.appAlphaNumerico.size) {
      event.preventDefault();
      return;
    }

    if (typeof (this.appAlphaNumerico) !== 'undefined' &&
      this.appAlphaNumerico.tipo != null) {
      switch (this.appAlphaNumerico.tipo) {
        case 'text':
          this.regex = this.regexTexto;
          break;
        case 'camp':
          this.regex = this.regexCampo;
          break;
        case 'palabra':
          this.regex = this.regexPalabra;
          break;
        case 'campMas':
          this.regex = this.regexCampoMas;
          break;
        case 'textEspecial':
          this.regex = this.regexPalabraEspecial;
          break;
      }
    } else {
      this.regex = this.regexTexto;
    }


    const current: string = this.el.nativeElement.value;

    const next: string = current.concat(event.key);
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
      return;
    }
  }
}
