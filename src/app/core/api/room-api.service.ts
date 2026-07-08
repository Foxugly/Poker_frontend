import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { getRuntimeConfig } from '../runtime-config';
import { DeckSnapshot, Role } from '../realtime/protocol';

export interface CreateRoomResponse {
  code: string;
  roomTitle: string;
  participantToken: string;
  role: Role;
  deckSnapshot: DeckSnapshot;
}

export interface JoinRoomResponse extends CreateRoomResponse {}

export interface RoomExistsResponse {
  code: string;
  roomTitle: string;
  exists: boolean;
}

/** HTTP boundary that creates/resolves a room before the socket opens (contract §1). */
@Injectable({ providedIn: 'root' })
export class RoomApiService {
  private http = inject(HttpClient);
  private base = getRuntimeConfig().apiBaseUrl;

  createRoom(username: string, title: string): Observable<CreateRoomResponse> {
    return this.http.post<CreateRoomResponse>(`${this.base}/api/rooms`, { username, title });
  }

  joinRoom(code: string, username: string): Observable<JoinRoomResponse> {
    return this.http.post<JoinRoomResponse>(`${this.base}/api/rooms/${code}/join`, { username });
  }

  roomExists(code: string): Observable<RoomExistsResponse> {
    return this.http.get<RoomExistsResponse>(`${this.base}/api/rooms/${code}`);
  }
}
