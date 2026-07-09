import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';

import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-support',
  standalone: true,
  imports: [TranslocoModule, ButtonModule, PageHeaderComponent],
  template: `
    <section class="page page--narrow">
      <app-page-header [icon]="'pi-heart'" [title]="'support.title' | transloco" />
      <div class="card">
        <p class="lead">{{ 'support.lead' | transloco }}</p>
        <p style="color: var(--muted); margin: var(--s-3) 0 var(--s-4)">{{ 'support.body' | transloco }}</p>
        <a href="mailto:info@foxugly.com?subject=Poker">
          <p-button [label]="'support.cta' | transloco" icon="pi pi-heart" severity="success" />
        </a>
      </div>
    </section>
  `,
})
export class SupportComponent {}
