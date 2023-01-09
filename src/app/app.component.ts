import { Component, VERSION } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PastedValue } from './model/pasted-value.model';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  name = 'Angular ' + VERSION.major;
  _porcentagemNgModel;

  formPorcentagem: FormGroup;
  constructor(private fb: FormBuilder) {
    this.formPorcentagem = this.fb.group({
      porcentagem: [],
    });
  }

  imprime(): void {
    console.log('imprime:', this._porcentagemNgModel);
  }

  imprimePasted(event: PastedValue) {
    console.log('pasted: ', event);
  }

  set porcentagemNgModel(value: string) {
    // console.log('[(ngModel)]: ', value);
    this._porcentagemNgModel = value;
  }
}
