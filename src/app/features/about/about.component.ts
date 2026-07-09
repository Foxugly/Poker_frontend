import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { map } from 'rxjs';
import { TranslocoModule } from '@jsverse/transloco';

import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';

type Tab = 'company' | 'legal' | 'technical';
const TABS: { key: Tab; label: string; body: string }[] = [
  { key: 'company', label: 'about.tab_company', body: 'about.company_body' },
  { key: 'legal', label: 'about.tab_legal', body: 'about.legal_body' },
  { key: 'technical', label: 'about.tab_technical', body: 'about.technical_body' },
];

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslocoModule, PageHeaderComponent],
  template: `
    <section class="page page--narrow">
      <app-page-header [icon]="'pi-info-circle'" [title]="'about.title' | transloco" />

      <div class="tabs">
        @for (t of tabs; track t.key) {
          <a class="tab" [routerLink]="['/about', t.key]" routerLinkActive="active">{{ t.label | transloco }}</a>
        }
      </div>

      @if (active(); as t) {
        <div class="card">
          <p style="color: var(--text); line-height: 1.6; white-space: pre-line">{{ t.body | transloco }}</p>
        </div>
      }
    </section>
  `,
  styles: [
    `
      .tabs {
        display: flex;
        gap: var(--s-2);
        border-bottom: 1px solid var(--border);
        margin-bottom: var(--s-4);
      }
      .tab {
        padding: var(--s-3) var(--s-4);
        color: var(--muted);
        text-decoration: none;
        font-weight: 600;
        border-bottom: 2px solid transparent;
        margin-bottom: -1px;
      }
      .tab:hover {
        color: var(--text-strong);
      }
      .tab.active {
        color: var(--fox-primary);
        border-bottom-color: var(--fox-primary);
      }
    `,
  ],
})
export class AboutComponent {
  private route = inject(ActivatedRoute);
  readonly tabs = TABS;
  private readonly tab = toSignal(
    this.route.paramMap.pipe(map((p) => (p.get('tab') as Tab) || 'company')),
    { initialValue: 'company' as Tab },
  );
  readonly active = computed(() => TABS.find((t) => t.key === this.tab()) ?? TABS[0]);
}
