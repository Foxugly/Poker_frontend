import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';

import { TeamsService } from '../../core/teams/teams.service';
import { Team } from '../../core/teams/teams.models';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';

@Component({
  selector: 'app-teams-list',
  standalone: true,
  imports: [FormsModule, RouterLink, TranslocoModule, ButtonModule, InputTextModule, TagModule, PageHeaderComponent],
  styleUrl: './teams.scss',
  template: `
    <section class="page">
      <app-page-header [icon]="'pi-users'" [title]="'teams.title' | transloco">
        <p-button [label]="'teams.create' | transloco" icon="pi pi-plus" severity="success" (onClick)="toggleCreate()" />
      </app-page-header>

      @if (showCreate()) {
        <div class="create-row">
          <input pInputText [placeholder]="'teams.name' | transloco" [(ngModel)]="name" (keyup.enter)="create()" />
          <p-button [label]="'teams.create' | transloco" [loading]="busy()" (onClick)="create()" />
        </div>
      }

      @if (loading()) {
        <p class="meta">…</p>
      } @else if (teams().length === 0) {
        <p style="color: var(--muted)">{{ 'teams.empty' | transloco }}</p>
      } @else {
        <div class="grid">
          @for (team of teams(); track team.id) {
            <a class="team-card" [routerLink]="['/teams', team.id]">
              <h3>{{ team.name }}</h3>
              <div class="meta">
                <p-tag [value]="'teams.role.' + team.my_role | transloco" severity="secondary" />
                <span>{{ team.member_count }} {{ 'teams.members' | transloco }}</span>
              </div>
            </a>
          }
        </div>
      }
    </section>
  `,
})
export class TeamsListComponent implements OnInit {
  private teamsService = inject(TeamsService);
  readonly teams = signal<Team[]>([]);
  readonly loading = signal(true);
  readonly showCreate = signal(false);
  readonly busy = signal(false);
  name = '';

  async ngOnInit(): Promise<void> {
    this.teams.set(await this.teamsService.listTeams());
    this.loading.set(false);
  }

  toggleCreate(): void {
    this.showCreate.update((v) => !v);
  }

  async create(): Promise<void> {
    const name = this.name.trim();
    if (!name) return;
    this.busy.set(true);
    try {
      const team = await this.teamsService.createTeam(name);
      this.teams.update((list) => [...list, team]);
      this.name = '';
      this.showCreate.set(false);
    } finally {
      this.busy.set(false);
    }
  }
}
