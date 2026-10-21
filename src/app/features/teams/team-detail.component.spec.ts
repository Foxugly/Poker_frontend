import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { provideTranslocoScope, TranslocoTestingModule } from '@jsverse/transloco';
import { ConfirmationService, MessageService } from 'primeng/api';
import { describe, expect, it } from 'vitest';

import fr from '../../../../public/i18n/fr.json';
import { RoomApiService } from '../../core/api/room-api.service';
import { AuthService } from '../../core/auth/auth.service';
import { IdentityService } from '../../core/identity/identity.service';
import { LanguageService } from '../../core/i18n/language.service';
import { Membership, TeamRole } from '../../core/teams/teams.models';
import { TeamsService } from '../../core/teams/teams.service';
import { TeamDetailComponent } from './team-detail.component';

/**
 * The server sends a member's email only to the team's owner/managers (and for the
 * viewer's own row); everyone else gets `null`. The members list must show the
 * display name alone in that case — never an empty email line, never a fallback
 * to the address.
 */
// PrimeNG tabs observe their size; jsdom has no ResizeObserver.
globalThis.ResizeObserver ??= class {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
} as unknown as typeof ResizeObserver;

function member(
  id: number,
  name: string,
  email: string | null,
  role: TeamRole = 'member',
): Membership {
  return {
    id,
    role,
    joined_at: '2026-10-01T10:00:00Z',
    user: { id, email, display_name: name, avatar_url: '' },
  };
}

function setup(myRole: TeamRole, members: Membership[]) {
  const team = {
    id: 7,
    name: 'Squad',
    my_role: myRole,
    member_count: members.length,
    felt_color: '#10b981',
    card_back_color: '#143d2f',
    felt_style: 'color',
    card_back_style: 'color',
    background_style: 'theme',
    background_color: '#0f172a',
    result_layout: 'cards',
  };
  TestBed.configureTestingModule({
    imports: [
      TeamDetailComponent,
      TranslocoTestingModule.forRoot({
        langs: { fr },
        translocoConfig: { availableLangs: ['fr'], defaultLang: 'fr' },
      }),
    ],
    providers: [
      provideRouter([]),
      MessageService,
      ConfirmationService,
      provideTranslocoScope({ scope: '' }),
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '7' } } } },
      {
        provide: TeamsService,
        useValue: {
          getTeam: () => Promise.resolve(team),
          getMembers: () => Promise.resolve(members),
          getInvitations: () => Promise.resolve([]),
          getDecks: () => new Promise(() => undefined),
        },
      },
      { provide: AuthService, useValue: { currentUser: () => null } },
      { provide: RoomApiService, useValue: {} },
      { provide: IdentityService, useValue: {} },
      { provide: LanguageService, useValue: { revision: () => 0 } },
    ],
  });
  return TestBed.createComponent(TeamDetailComponent);
}

async function render(fixture: ReturnType<typeof setup>) {
  fixture.detectChanges();
  for (let i = 0; i < 3; i++) {
    await new Promise((r) => setTimeout(r, 0));
    fixture.detectChanges();
  }
  return fixture.nativeElement as HTMLElement;
}

describe('TeamDetailComponent members list', () => {
  it('shows names only to a regular member, plus their own email', async () => {
    const el = await render(
      setup('member', [
        member(1, 'Olive', null, 'owner'),
        member(2, 'Mia', 'mia@example.com'),
        member(3, 'Participant 3', null),
      ]),
    );
    const rows = [...el.querySelectorAll('.member-row')];
    expect(rows.map((r) => r.querySelector('.name')?.textContent?.trim())).toEqual([
      'Olive',
      'Mia',
      'Participant 3',
    ]);
    expect(rows.map((r) => r.querySelector('.email')?.textContent?.trim() ?? null)).toEqual([
      null,
      'mia@example.com',
      null,
    ]);
  });

  it('keeps every email visible for the owner', async () => {
    const el = await render(
      setup('owner', [
        member(1, 'Olive', 'olive@example.com', 'owner'),
        member(2, 'Mia', 'mia@example.com'),
      ]),
    );
    const emails = [...el.querySelectorAll('.member-row .email')].map((e) => e.textContent?.trim());
    expect(emails).toEqual(['olive@example.com', 'mia@example.com']);
  });
});
