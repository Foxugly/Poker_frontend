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
      optionLabel="short"
      optionValue="value"
      [style]="{ minWidth: '4.25rem' }"
      appendTo="body"
    >
      <ng-template #selectedItem let-item>{{ item.short }}</ng-template>
      <ng-template #item let-item>
        <span class="lang-opt"><b>{{ item.short }}</b> · {{ item.label }}</span>
      </ng-template>
    </p-select>
  `,
  styles: [`.lang-opt { font-size: 0.9rem; }`],
})
export class LanguageSwitcherComponent {
  readonly lang = inject(LanguageService);
  // Trigger shows just the 2-letter code; the open list adds the full name for clarity.
  readonly options = AVAILABLE_LANGS.map((code) => ({
    value: code as AppLang,
    short: code.toUpperCase(),
    label: LANG_LABELS[code],
  }));
}
