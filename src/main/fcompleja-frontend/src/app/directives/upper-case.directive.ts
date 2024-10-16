import { Directive, HostListener, ElementRef, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appUpperCase]'
})

export class UpperCaseDirective {
  @Input() appUpperCase;

  constructor(private ref: ElementRef, private control: NgControl) { }

  @HostListener('input', ['$event']) onEvent($event) {
    const str: string = this.control.value;
    this.control.control.setValue(str.toUpperCase());
  }
}
