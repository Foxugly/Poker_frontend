import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { getRuntimeConfig } from '../runtime-config';
import { Invitation, Membership, Team, TeamDecks, TeamRole } from './teams.models';

@Injectable({ providedIn: 'root' })
export class TeamsService {
  private http = inject(HttpClient);
  private base = getRuntimeConfig().apiBaseUrl + '/api/teams';

  listTeams() {
    return firstValueFrom(this.http.get<Team[]>(`${this.base}/`));
  }
  createTeam(name: string) {
    return firstValueFrom(this.http.post<Team>(`${this.base}/`, { name }));
  }
  getTeam(id: number) {
    return firstValueFrom(this.http.get<Team>(`${this.base}/${id}/`));
  }
  renameTeam(id: number, name: string) {
    return firstValueFrom(this.http.patch<Team>(`${this.base}/${id}/`, { name }));
  }
  setAppearance(id: number, colors: { card_back_color: string; felt_color: string }) {
    return firstValueFrom(this.http.patch<Team>(`${this.base}/${id}/`, colors));
  }
  deleteTeam(id: number) {
    return firstValueFrom(this.http.delete(`${this.base}/${id}/`));
  }

  getDecks(id: number) {
    return firstValueFrom(this.http.get<TeamDecks>(`${this.base}/${id}/decks/`));
  }
  setDeck(id: number, deckId: number | null) {
    return firstValueFrom(this.http.patch<Team>(`${this.base}/${id}/`, { deck_id: deckId }));
  }
  setCardBack(id: number, cardBackId: number | null) {
    return firstValueFrom(this.http.patch<Team>(`${this.base}/${id}/`, { card_back_id: cardBackId }));
  }

  getMembers(id: number) {
    return firstValueFrom(this.http.get<Membership[]>(`${this.base}/${id}/members/`));
  }
  changeRole(teamId: number, userId: number, role: TeamRole) {
    return firstValueFrom(this.http.patch<Membership>(`${this.base}/${teamId}/members/${userId}/`, { role }));
  }
  removeMember(teamId: number, userId: number) {
    return firstValueFrom(this.http.delete(`${this.base}/${teamId}/members/${userId}/`));
  }

  getInvitations(id: number) {
    return firstValueFrom(this.http.get<Invitation[]>(`${this.base}/${id}/invitations/`));
  }
  invite(teamId: number, email: string, role: TeamRole) {
    return firstValueFrom(this.http.post<Invitation>(`${this.base}/${teamId}/invitations/`, { email, role }));
  }
  revokeInvite(teamId: number, invId: number) {
    return firstValueFrom(this.http.delete(`${this.base}/${teamId}/invitations/${invId}/`));
  }

  acceptInvite(token: string) {
    return firstValueFrom(this.http.post<Team>(`${this.base}/invitations/accept/`, { token }));
  }
}
