import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';

import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../core/auth/auth.service';
import { RoomApiService } from '../../core/api/room-api.service';
import { IdentityService } from '../../core/identity/identity.service';
import { TeamsService } from '../../core/teams/teams.service';
import { CardBack, Deck, Invitation, Membership, Team, TeamRole } from '../../core/teams/teams.models';
import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';

const AVATAR_COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#14b8a6', '#6366f1'];

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [FormsModule, TranslocoModule, ButtonModule, InputTextModule, SelectModule, TabsModule, TagModule, PageHeaderComponent],
  styleUrl: './teams.scss',
  template: `
    @if (team(); as team) {
      <section class="page">
        <app-page-header [icon]="'pi-users'" [title]="team.name">
          <p-button slot="left" [label]="'action.back' | transloco" icon="pi pi-arrow-left" [text]="true" severity="secondary" (onClick)="back()" />
          <p-button slot="right" [label]="'board.title' | transloco" icon="pi pi-th-large" [outlined]="true" severity="secondary" (onClick)="openBoard()" />
          <p-button slot="right" [label]="'history.title' | transloco" icon="pi pi-history" [outlined]="true" severity="secondary" (onClick)="openHistory()" />
          <p-button slot="right" [label]="'teams.new_session' | transloco" icon="pi pi-play" severity="success" [loading]="starting()" (onClick)="startSession()" />
        </app-page-header>

        <p-tabs [(value)]="activeTab">
          <p-tablist>
            <p-tab value="members"><span class="pi pi-users tab-icon"></span><span>{{ 'teams.tab_members' | transloco }}</span></p-tab>
            @if (isAdmin()) {
              <p-tab value="appearance"><span class="pi pi-palette tab-icon"></span><span>{{ 'teams.appearance' | transloco }}</span></p-tab>
              <p-tab value="deck"><span class="pi pi-clone tab-icon"></span><span>{{ 'teams.deck.tab' | transloco }}</span></p-tab>
            }
            @if (isOwner()) {
              <p-tab value="manage"><span class="pi pi-pencil tab-icon"></span><span>{{ 'teams.manage' | transloco }}</span></p-tab>
            }
          </p-tablist>

          <p-tabpanels>
            <p-tabpanel value="members">
              <!-- Members -->
              <div class="section">
                <h3>{{ 'teams.members' | transloco }}</h3>
                @for (m of members(); track m.id) {
                  <div class="member-row">
                    <div class="avatar" [style.background]="color(m.user.email)">{{ initials(m.user.display_name || m.user.email) }}</div>
                    <div class="who">
                      <div class="name">{{ m.user.display_name || m.user.email }}</div>
                      <div class="email">{{ m.user.email }}</div>
                    </div>
                    @if (m.role === 'owner') {
                      <p-tag [value]="'teams.role.owner' | transloco" />
                    } @else if (isAdmin()) {
                      <p-select [options]="roleOptions" optionLabel="label" optionValue="value" [ngModel]="m.role" (ngModelChange)="setRole(m, $event)" appendTo="body" />
                      <p-button icon="pi pi-times" [text]="true" severity="danger" [ariaLabel]="'teams.remove' | transloco" (onClick)="remove(m)" />
                    } @else {
                      <p-tag [value]="'teams.role.' + m.role | transloco" severity="secondary" />
                    }
                  </div>
                }
              </div>

              <!-- Invitations (admin only) -->
              @if (isAdmin()) {
                <div class="section">
                  <h3>{{ 'teams.invitations' | transloco }}</h3>
                  <div class="invite-row">
                    <input pInputText [placeholder]="'auth.email' | transloco" [(ngModel)]="inviteEmail" style="min-width:220px" />
                    <p-select [options]="roleOptions" optionLabel="label" optionValue="value" [(ngModel)]="inviteRole" appendTo="body" />
                    <p-button [label]="'teams.invite' | transloco" icon="pi pi-send" [loading]="inviting()" (onClick)="invite()" />
                  </div>
                  @for (inv of invitations(); track inv.id) {
                    <div class="pending">
                      <span>{{ inv.email }} · {{ 'teams.role.' + inv.role | transloco }}</span>
                      <p-button icon="pi pi-times" [text]="true" severity="secondary" [ariaLabel]="'teams.revoke' | transloco" (onClick)="revoke(inv)" />
                    </div>
                  }
                </div>
              }
            </p-tabpanel>

            <!-- Appearance (admin) — P2.6 -->
            @if (isAdmin()) {
              <p-tabpanel value="appearance">
                <div class="section">
                  <h3>{{ 'teams.appearance' | transloco }}</h3>
                  <div class="appearance-row">
                    <label>
                      <span>{{ 'teams.felt_color' | transloco }}</span>
                      <input type="color" [value]="feltColor()" (input)="feltColor.set($any($event.target).value)" />
                    </label>
                    <label>
                      <span>{{ 'teams.back_color' | transloco }}</span>
                      <input type="color" [value]="backColor()" (input)="backColor.set($any($event.target).value)" />
                    </label>
                    <span class="table-preview" [style.background]="feltColor()">
                      <span class="card-preview" [style.background]="backColor()"></span>
                    </span>
                    <p-button [label]="'action.save' | transloco" icon="pi pi-save" [loading]="savingAppearance()" (onClick)="saveAppearance()" />
                  </div>
                </div>

                <!-- Card backs live with the rest of the room's look -->
                <div class="section">
                  <h3>{{ 'teams.deck.backs_title' | transloco }}</h3>
                  <p class="deck-intro">{{ 'teams.deck.backs_intro' | transloco }}</p>
                  @if (decksLoading()) {
                    <p class="muted">{{ 'teams.deck.loading' | transloco }}</p>
                  } @else {
                    <div class="deck-grid">
                      @for (back of cardBacks(); track back.id) {
                        <button
                          type="button"
                          class="deck-card"
                          [class.deck-card--selected]="back.id === selectedCardBackId()"
                          [disabled]="savingBack()"
                          (click)="selectCardBack(back)"
                        >
                          <span class="deck-card__cards">
                            <span
                              class="deck-card__mini deck-card__mini--back"
                              [style.background-image]="back.image ? 'url(' + back.image + ')' : null"
                            ></span>
                          </span>
                          <span class="deck-card__name">{{ back.name }}</span>
                          @if (back.is_custom) {
                            <span class="deck-card__meta">{{ 'teams.deck.custom' | transloco }}</span>
                          }
                          @if (back.id === selectedCardBackId()) {
                            <span class="deck-card__badge"><i class="pi pi-check"></i> {{ 'teams.deck.in_use' | transloco }}</span>
                          }
                        </button>
                      }
                    </div>
                  }
                </div>
              </p-tabpanel>
            }

            <!-- Poker type / deck (admin) -->
            @if (isAdmin()) {
              <p-tabpanel value="deck">
                <div class="section">
                  <h3>{{ 'teams.deck.title' | transloco }}</h3>

                  <p class="deck-intro">{{ 'teams.deck.intro' | transloco }}</p>

                  @if (decksLoading()) {
                    <p class="muted">{{ 'teams.deck.loading' | transloco }}</p>
                  } @else {
                    <div class="deck-grid">
                      @for (deck of decks(); track deck.id) {
                        <button
                          type="button"
                          class="deck-card"
                          [class.deck-card--selected]="isEnabled(deck.id)"
                          [attr.aria-pressed]="isEnabled(deck.id)"
                          [disabled]="savingDeck()"
                          (click)="toggleDeck(deck)"
                        >
                          <span class="deck-card__cards">
                            @for (card of deck.cards.slice(0, 5); track card.slug) {
                              <span class="deck-card__mini" [style.background-image]="card.image ? 'url(' + card.image + ')' : null">
                                {{ card.value }}
                              </span>
                            }
                          </span>
                          <span class="deck-card__name">{{ deck.name }}</span>
                          <span class="deck-card__meta">
                            {{ deck.vote_type_name }}
                            @if (deck.is_custom) {
                              · {{ 'teams.deck.custom' | transloco }}
                            }
                          </span>
                          @if (isEnabled(deck.id)) {
                            <span class="deck-card__badge"><i class="pi pi-check"></i> {{ 'teams.deck.enabled' | transloco }}</span>
                          }
                        </button>
                      }
                    </div>

                    @if (!enabledDeckIds().length) {
                      <p class="muted">{{ 'teams.deck.none_enabled' | transloco }}</p>
                    }

                    <div class="deck-create">
                      <p-button
                        [label]="'teams.deck.create' | transloco"
                        icon="pi pi-plus"
                        [outlined]="true"
                        [disabled]="true"
                      />
                      <span class="muted">
                        {{ (canCustomize() ? 'teams.deck.create_soon' : 'teams.deck.create_paid') | transloco }}
                      </span>
                    </div>
                  }
                </div>
              </p-tabpanel>
            }

            <!-- Rename / delete (owner) -->
            @if (isOwner()) {
              <p-tabpanel value="manage">
                <div class="section">
                  <h3>{{ 'teams.manage' | transloco }}</h3>
                  <div class="invite-row">
                    <label class="field">
                      <span>{{ 'teams.rename_label' | transloco }}</span>
                      <input pInputText [(ngModel)]="renameValue" style="min-width:220px" />
                    </label>
                    <p-button [label]="'action.save' | transloco" icon="pi pi-save" (onClick)="rename()" />
                    <p-button [label]="'teams.delete' | transloco" icon="pi pi-trash" severity="danger" [outlined]="true" (onClick)="remove_team()" />
                  </div>
                </div>
              </p-tabpanel>
            }
          </p-tabpanels>
        </p-tabs>
      </section>
    }
  `,
})
export class TeamDetailComponent implements OnInit {
  private teamsService = inject(TeamsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messages = inject(MessageService);
  private transloco = inject(TranslocoService);
  private auth = inject(AuthService);
  private roomApi = inject(RoomApiService);
  private identity = inject(IdentityService);

  private id = 0;
  activeTab = 'members';
  readonly starting = signal(false);
  readonly team = signal<Team | null>(null);
  readonly members = signal<Membership[]>([]);
  readonly invitations = signal<Invitation[]>([]);
  readonly isAdmin = computed(() => ['owner', 'admin'].includes(this.team()?.my_role ?? ''));
  readonly isOwner = computed(() => this.team()?.my_role === 'owner');
  readonly inviting = signal(false);
  inviteEmail = '';
  inviteRole: TeamRole = 'member';
  renameValue = '';

  // Appearance (P2.6)
  readonly feltColor = signal('#10b981');
  readonly backColor = signal('#143d2f');
  readonly savingAppearance = signal(false);

  // Poker type / deck (P2.8)
  readonly decks = signal<Deck[]>([]);
  readonly enabledDeckIds = signal<number[]>([]);
  readonly cardBacks = signal<CardBack[]>([]);
  readonly selectedCardBackId = signal<number | null>(null);
  readonly canCustomize = signal(false);
  readonly decksLoading = signal(true);
  readonly savingDeck = signal(false);
  readonly savingBack = signal(false);


  readonly roleOptions = [
    { value: 'member', label: this.transloco.translate('teams.role.member') },
    { value: 'admin', label: this.transloco.translate('teams.role.admin') },
  ];

  async ngOnInit(): Promise<void> {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    try {
      const team = await this.teamsService.getTeam(this.id);
      this.team.set(team);
      this.renameValue = team.name;
      this.feltColor.set(team.felt_color);
      this.backColor.set(team.card_back_color);
      this.members.set(await this.teamsService.getMembers(this.id));
      if (this.isAdmin()) {
        this.invitations.set(await this.teamsService.getInvitations(this.id));
        await this.loadDecks();
      }
    } catch {
      this.router.navigate(['/teams']);
    }
  }

  private async loadDecks(): Promise<void> {
    this.decksLoading.set(true);
    try {
      const res = await this.teamsService.getDecks(this.id);
      this.decks.set(res.decks);
      this.cardBacks.set(res.card_backs);
      this.canCustomize.set(res.can_customize);
      // A team that never picked plays the standard deck/back — show those as in use.
      this.enabledDeckIds.set(res.selected_deck_ids);
      this.selectedCardBackId.set(
        res.selected_card_back_id ?? res.card_backs.find((b) => b.is_standard)?.id ?? null,
      );
    } finally {
      this.decksLoading.set(false);
    }
  }

  async selectCardBack(back: CardBack): Promise<void> {
    if (back.id === this.selectedCardBackId()) return;
    const previous = this.selectedCardBackId();
    this.selectedCardBackId.set(back.id);
    this.savingBack.set(true);
    try {
      const team = await this.teamsService.setCardBack(this.id, back.id);
      this.team.set(team);
      this.messages.add({ severity: 'success', summary: this.transloco.translate('teams.deck.back_saved') });
    } catch {
      this.selectedCardBackId.set(previous);
      this.messages.add({ severity: 'error', summary: this.transloco.translate('auth.errors.generic') });
    } finally {
      this.savingBack.set(false);
    }
  }

  isEnabled(deckId: number): boolean {
    return this.enabledDeckIds().includes(deckId);
  }

  async toggleDeck(deck: Deck): Promise<void> {
    const previous = this.enabledDeckIds();
    const next = this.isEnabled(deck.id)
      ? previous.filter((id) => id !== deck.id)
      : [...previous, deck.id];
    this.enabledDeckIds.set(next);
    this.savingDeck.set(true);
    try {
      const team = await this.teamsService.setDecks(this.id, next);
      this.team.set(team);
      this.messages.add({ severity: 'success', summary: this.transloco.translate('teams.deck.saved') });
    } catch {
      this.enabledDeckIds.set(previous);
      this.messages.add({ severity: 'error', summary: this.transloco.translate('auth.errors.generic') });
    } finally {
      this.savingDeck.set(false);
    }
  }

  back(): void {
    this.router.navigate(['/teams']);
  }

  openHistory(): void {
    this.router.navigate(['/teams', this.team()?.id, 'history']);
  }

  openBoard(): void {
    this.router.navigate(['/teams', this.team()?.id, 'board']);
  }

  async saveAppearance(): Promise<void> {
    this.savingAppearance.set(true);
    try {
      const team = await this.teamsService.setAppearance(this.id, {
        felt_color: this.feltColor(),
        card_back_color: this.backColor(),
      });
      this.team.set(team);
      this.messages.add({ severity: 'success', summary: this.transloco.translate('teams.appearance_saved') });
    } catch {
      this.messages.add({ severity: 'error', summary: this.transloco.translate('auth.errors.generic') });
    } finally {
      this.savingAppearance.set(false);
    }
  }

  async startSession(): Promise<void> {
    this.starting.set(true);
    try {
      const res = await firstValueFrom(this.roomApi.createRoom('', '', this.id));
      this.identity.saveSession({ code: res.code, token: res.participantToken, role: res.role });
      this.router.navigate(['/room', res.code]);
    } finally {
      this.starting.set(false);
    }
  }

  async setRole(m: Membership, role: TeamRole): Promise<void> {
    await this.teamsService.changeRole(this.id, m.user.id, role);
    this.members.update((list) => list.map((x) => (x.id === m.id ? { ...x, role } : x)));
  }

  async remove(m: Membership): Promise<void> {
    await this.teamsService.removeMember(this.id, m.user.id);
    this.members.update((list) => list.filter((x) => x.id !== m.id));
  }

  async invite(): Promise<void> {
    const email = this.inviteEmail.trim().toLowerCase();
    if (!email) return;
    this.inviting.set(true);
    try {
      const inv = await this.teamsService.invite(this.id, email, this.inviteRole);
      this.invitations.update((list) => [...list, inv]);
      this.inviteEmail = '';
      this.messages.add({ severity: 'success', summary: this.transloco.translate('teams.invited') });
    } catch (e: unknown) {
      const code = (e as { error?: { code?: string } }).error?.code;
      this.messages.add({ severity: 'warn', summary: this.transloco.translate(code === 'already_member' ? 'teams.already_member' : 'auth.errors.generic') });
    } finally {
      this.inviting.set(false);
    }
  }

  async revoke(inv: Invitation): Promise<void> {
    await this.teamsService.revokeInvite(this.id, inv.id);
    this.invitations.update((list) => list.filter((x) => x.id !== inv.id));
  }

  async rename(): Promise<void> {
    const name = this.renameValue.trim();
    if (!name) return;
    const team = await this.teamsService.renameTeam(this.id, name);
    this.team.set(team);
  }

  async remove_team(): Promise<void> {
    if (!confirm(this.transloco.translate('teams.delete_confirm'))) return;
    await this.teamsService.deleteTeam(this.id);
    this.router.navigate(['/teams']);
  }

  initials(name: string): string {
    const p = (name || '?').trim().split(/\s+/);
    return ((p[0]?.[0] ?? '?') + (p.length > 1 ? p[1][0] : p[0]?.[1] ?? '')).toUpperCase();
  }
  color(seed: string): string {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
    return AVATAR_COLORS[h % AVATAR_COLORS.length];
  }
}
