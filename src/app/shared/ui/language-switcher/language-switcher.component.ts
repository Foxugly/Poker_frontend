import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';

import { LanguageService } from '../../../core/i18n/language.service';
import { AVAILABLE_LANGS, AppLang, LANG_LABELS } from '../../../core/i18n/available-languages';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [FormsModule, SelectModule],
  template: `
    <p-select
      [options]="options"
      [ngModel]="lang.active()"
      (ngModelChange)="lang.set($event)"
      optionLabel="label"
      optionValue="value"
      [style]="{ minWidth: '9rem' }"
      appendTo="body"
    />
  `,
})
export class LanguageSwitcherComponent {
  readonly lang = inject(LanguageService);
  readonly options = AVAILABLE_LANGS.map((code) => ({ value: code as AppLang, label: LANG_LABELS[code] }));
}
