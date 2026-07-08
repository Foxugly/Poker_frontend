import { inject, Injectable, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

import { AVAILABLE_LANGS, AppLang, DEFAULT_LANG } from './available-languages';

const LANG_KEY = 'poker.lang';

/** Per-participant UI language (browser detection + manual switch, scope §10). */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private transloco = inject(TranslocoService);
  readonly active = signal<AppLang>(DEFAULT_LANG);

  init(): void {
    const lang = this.resolveInitial();
    this.set(lang);
  }

  set(lang: AppLang): void {
    this.active.set(lang);
    this.transloco.setActiveLang(lang);
    localStorage.setItem(LANG_KEY, lang);
  }

  private resolveInitial(): AppLang {
    const stored = localStorage.getItem(LANG_KEY) as AppLang | null;
    if (stored && AVAILABLE_LANGS.includes(stored)) return stored;
    const nav = (navigator.language || '').slice(0, 2) as AppLang;
    return AVAILABLE_LANGS.includes(nav) ? nav : DEFAULT_LANG;
  }
}
