import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';

import { HistoryService } from '../../core/history/history.service';
import { HistoryDay } from '../../core/history/history.models';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-history-list',
  standalone: true,
  imports: [RouterLink, TranslocoModule, ButtonModule, PageHeaderComponent],
  styleUrl: '../teams/teams.scss',
  template: `
    <section class="page">
      <app-page-header [icon]="'pi-history'" [title]="'history.title' | transloco">
        <p-button [label]="'action.back' | transloco" icon="pi pi-arrow-left" [text]="true" severity="secondary" (onClick)="back()" />
      </app-page-header>

      @if (loading()) {
        <p class="meta">…</p>
      } @else if (days().length === 0) {
        <p style="color: var(--muted)">{{ 'history.empty' | transloco }}</p>
      } @else {
        <div class="grid">
          @for (d of days(); track d.date) {
            <a class="team-card" [routerLink]="['/teams', teamId(), 'history', d.date]">
              <h3>{{ d.date }}</h3>
              <div class="meta">
                <span>{{ d.count }} {{ 'history.results' | transloco }}</span>
              </div>
            </a>
          }
        </div>
      }
    </section>
  `,
})
export class HistoryListComponent implements OnInit {
  private history = inject(HistoryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly teamId = signal(0);
  readonly days = signal<HistoryDay[]>([]);
  readonly loading = signal(true);

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.teamId.set(id);
    try {
      this.days.set((await this.history.listDays(id)).days);
    } finally {
      this.loading.set(false);
    }
  }

  back(): void {
    this.router.navigate(['/teams', this.teamId()]);
  }
}
