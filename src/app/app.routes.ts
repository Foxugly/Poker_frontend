import { Routes } from '@angular/router';

import { PublicLayoutComponent } from './core/layout/public-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent) },
      { path: 'join', loadComponent: () => import('./features/join/join.component').then((m) => m.JoinComponent) },
      { path: 'join/:code', loadComponent: () => import('./features/join/join.component').then((m) => m.JoinComponent) },
      { path: 'room/:code', loadComponent: () => import('./features/room/room.component').then((m) => m.RoomComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];
