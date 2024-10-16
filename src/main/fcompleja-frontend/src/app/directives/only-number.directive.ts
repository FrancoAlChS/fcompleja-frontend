import { Directive, ElementRef, HostListener, Input } from '@angular/core';

export interface OnylNumber {
  size: number;
}

@Directive({
  selector: '[appOnlyNumber]'
})
export class OnlyNumberDirective {
  @Input() appOnlyNumber: OnylNumber;
  private regex: RegExp = new RegExp(/^[0-9]+(\.[0-9]*){0,1}$/g);

  private specialKeys: Array<string> = [ 'Backspace',
  'Delete',
  'Tab',
  'Escape',
  'Enter',
  'Home',
  'End',
  'ArrowLeft',
  'ArrowRight',
  'Clear',
  'Copy',
  'Paste'];

  constructor(private el: ElementRef) {
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Allow Backspace, tab, end, and home keys

    if (
      // Allow: Delete, Backspace, Tab, Escape, Enter, etc
      this.specialKeys.indexOf(event.key) > -1 || 
      (event.key === 'a' && event.ctrlKey === true) || // Allow: Ctrl+A
      (event.key === 'c' && event.ctrlKey === true) || // Allow: Ctrl+C
      (event.key === 'v' && event.ctrlKey === true) || // Allow: Ctrl+V
      (event.key === 'x' && event.ctrlKey === true) || // Allow: Ctrl+X
      (event.key === 'a' && event.metaKey === true) || // Cmd+A (Mac)
      (event.key === 'c' && event.metaKey === true) || // Cmd+C (Mac)
      (event.key === 'v' && event.metaKey === true) || // Cmd+V (Mac)
      (event.key === 'x' && event.metaKey === true) // Cmd+X (Mac)
    ) {
      return;  // let it happen, don't do anything
    }

    if (this.specialKeys.indexOf(event.key) !== -1) {
      return;
    }

    if (typeof (this.appOnlyNumber) !== 'undefined' && this.el.nativeElement.value.length >= this.appOnlyNumber.size) {
      event.preventDefault();
      return;
    }

    const current: string = this.el.nativeElement.value;

    const next: string = current.concat(event.key);
    if (next && !String(next).match(this.regex)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
onPaste(event: ClipboardEvent) {
  event.preventDefault();
  const pastedInput: string = event.clipboardData
    .getData('text/plain')
    .replace(/\D/g, ''); // get a digit-only string
  document.execCommand('insertText', false, pastedInput);
}
// @Ho  stListener('drop', ['$event'])
// onDrop(event: DragEvent) {
//   event.preventDefault();
//   const textData = event.dataTransfer
//     .getData('text').replace(/\D/g, '');
//   this.inputElement.focus();
//   document.execCommand('insertText', false, textData);
// }
}
