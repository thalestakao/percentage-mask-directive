import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Output,
} from '@angular/core';
import { NgControl, NgModel } from '@angular/forms';

import { PastedValue } from './model/pasted-value.model';

const INVALID_PASTED_VALUE = 'Invalid pasted value.';

@Directive({
  selector: '[appPercentageMask]',
})
export class PercentageMaskDirective {
  @Output('pasted') pastedEmitter = new EventEmitter<PastedValue>();

  private el: HTMLInputElement;

  constructor() {
    this.el = inject(ElementRef, { host: true })?.nativeElement;
  }

  private ngControl = inject(NgControl, {
    optional: true,
    host: true,
  });

  private ngModel = inject(NgModel, {
    optional: true,
    host: true,
  });

  inputValue: string;

  specialKeys: string[] = ['Backspace', 'Tab'];

  @HostListener('click', ['$event'])
  onClick(event: KeyboardEvent) {
    const endPosition = this.el.value.length;
    this.setCursorPosition(endPosition);
  }

  @HostListener('focus', ['$event'])
  onFocus(event: KeyboardEvent) {
    if (this.el.value.endsWith('%')) {
      const valor = this.el.value.split('');
      valor.pop();
      this.el.value = valor.join('');
    }
  }

  @HostListener('blur', ['$event'])
  @HostListener('focusout', ['$event'])
  onFocusOut(event: KeyboardEvent) {
    if (this.isEmpty(this.el.value) || this.el.value.endsWith('%')) {
      return;
    }
    this.el.value += '%';
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    const validRegex: RegExp = /^(0|[1-9][0-9]?)\,[0-9]{2}$|^100\,00$/;
    const pastedValue: string = event.clipboardData.getData('text');

    if (!validRegex.test(pastedValue)) {
      const error: PastedValue = {
        type: 'error',
        value: pastedValue,
        error: {
          message: INVALID_PASTED_VALUE,
          name: 'INVALID_PASTED_VALUE',
        },
      };
      this.pastedEmitter.emit(error);
      event.preventDefault();
      return;
    }

    if (!this.isEmpty(this.el.value)) {
      this.el.value = '';
    }

    this.inputValue = pastedValue;

    setTimeout(() => {
      this.el.value = this.inputValue;
      this.ngControl?.control?.setValue(
        this.removePercentSign(this.inputValue)
      );
      this.ngModel?.control.setValue(this.removePercentSign(this.inputValue));
      this.pastedEmitter.emit({ type: 'success', value: this.inputValue });
    });
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    this.inputValue = (event.target as HTMLInputElement).value ?? '';
    const pressedKey = event.key;

    if (event.ctrlKey && event.code === 'KeyV') {
      console.log('entrou aqui');
      if ('clipboard' in navigator) {
        navigator.clipboard.readText().then((pastedValue) => {
          console.log('valor: ', pastedValue);
          const dt = new DataTransfer();
          dt.setData('text', pastedValue);
          const clipboardEvent = new ClipboardEvent('paste', {
            clipboardData: dt,
          });
          this.onPaste(clipboardEvent);
          return;
        });
      }
    }

    if (
      (this.hasComma(this.inputValue) || this.isEmpty(this.inputValue)) &&
      this.isComma(pressedKey)
    ) {
      event.preventDefault();
      return;
    }

    this.inputValue = this.inputValue.replace(',', '');

    if (
      this.isGreaterThan100(this.inputValue) &&
      !this.specialKeys.includes(pressedKey)
    ) {
      event.preventDefault();
      return;
    }

    if (!/[\d,]|Backspace|Tab/g.test(pressedKey)) {
      event.preventDefault();
      return;
    }

    if (this.isBackspace(pressedKey)) {
      this.inputValue = this.removeCharWhenBackspaceIsPressed(this.inputValue);
    } else if (this.specialKeys.includes(pressedKey)) {
      return;
    } else {
      this.inputValue += pressedKey;
    }

    setTimeout(() => {
      this.inputValue = this.applyMask(this.inputValue);
      this.el.value = this.inputValue;
    });

    setTimeout(() => {
      this.ngControl?.control?.setValue(
        this.removePercentSign(this.inputValue)
      );
      this.ngModel?.control.setValue(this.removePercentSign(this.inputValue));
    });
  }

  private applyMask(value: string): string {
    const splitted = value.split('');

    //adiciona até dois zeros a esquerda do número digitado
    if (value.length < 3) {
      splitted.splice(0, 0, ...new Array(3 - splitted.length).fill('0'));
    }

    //adiciona a vírgula
    splitted.splice(splitted.length - 2, 0, ',');
    while (splitted[0] === '0') {
      splitted.shift();
    }

    // garante que haverá apenas um zero antes da vírgula se valor menor que 1
    if (splitted[0] === ',') splitted.splice(0, 0, '0');
    return splitted.join('');
  }

  private hasComma(value: string): boolean {
    return value.indexOf(',') !== -1;
  }

  private isGreaterThan100(value: string): boolean {
    return Number(value) >= 1001;
  }

  private isBackspace(value: string): boolean {
    return value === 'Backspace';
  }

  private removeCharWhenBackspaceIsPressed(inputValue: string) {
    const array = this.inputValue.split('');
    array.pop();
    return array.join('');
  }

  private isComma(value: string): boolean {
    return value === ',';
  }

  private isEmpty(value: string): boolean {
    return value === '';
  }

  private setCursorPosition(position: number): void {
    this.el.setSelectionRange(position, position);
  }

  private removePercentSign(value: string): string {
    return value.replace('%', '');
  }
}
