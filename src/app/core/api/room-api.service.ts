import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { getRuntimeConfig } from '../runtime-config';
import { DeckSnapshot, Role } from '../realtime/protocol';

/** One entry of the public catalogue offered to account-less rooms. */
export interface CatalogueDeck {
  id: number;
  name: string;
  vote_type_code: string;
  vote_type_name: string;
}

export interface CatalogueCardBack {
  id: number;
  name: string;
  image: string;
}

export interface FreeCatalogue {
  decks: CatalogueDeck[];
  card_backs: CatalogueCardBack[];
}

export interface CreateRoomResponse {
  code: string;
  roomTitle: string;
  participantToken: string;
  role: Role;
  deckSnapshot: DeckSnapshot;
  isTeam: boolean;
}

export interface JoinRoomResponse extends CreateRoomResponse {}

export interface RoomExistsResponse {
  code: string;
  roomTitle: string;
  exists: boolean;
  isTeam: boolean;
}

/** HTTP boundary that creates/resolves a room before the socket opens (contract §1).
 * A `teamId` makes it a members-only, non-ephemeral team room (Phase 2). */
@Injectable({ providedIn: 'root' })
export class RoomApiService {
  private http = inject(HttpClient);
  private base = getRuntimeConfig().apiBaseUrl;

  /** The decks and card backs offered to a room created without an account. */
  freeCatalogue(): Observable<FreeCatalogue> {
    return this.http.get<FreeCatalogue>(`${this.base}/api/decks/catalogue/`);
  }

  createRoom(
    username: string,
    title: string,
    teamId?: number,
    free?: { deckIds: number[]; cardBackId: number | null },
  ): Observable<CreateRoomResponse> {
    const body: Record<string, unknown> = { title };
    if (teamId != null) {
      // Team rooms take the team's enabled decks; any free pick is irrelevant.
      body['team'] = teamId;
    } else {
      body['username'] = username;
      if (free?.deckIds.length) body['deck_ids'] = free.deckIds;
      if (free?.cardBackId != null) body['card_back_id'] = free.cardBackId;
    }
    return this.http.post<CreateRoomResponse>(`${this.base}/api/rooms`, body);
  }

  joinRoom(code: string, username: string): Observable<JoinRoomResponse> {
    // Team rooms ignore username (the authed user + interceptor token identify them).
    return this.http.post<JoinRoomResponse>(`${this.base}/api/rooms/${code}/join`, { username });
  }

  roomExists(code: string): Observable<RoomExistsResponse> {
    return this.http.get<RoomExistsResponse>(`${this.base}/api/rooms/${code}`);
  }
}
