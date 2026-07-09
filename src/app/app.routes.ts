import { Routes } from '@angular/router';

import { PublicLayoutComponent } from './core/layout/public-layout.component';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent) },
      { path: 'features', loadComponent: () => import('./features/features/features.component').then((m) => m.FeaturesComponent) },
      { path: 'support', loadComponent: () => import('./features/support/support.component').then((m) => m.SupportComponent) },
      { path: 'about', loadComponent: () => import('./features/about/about.component').then((m) => m.AboutComponent) },
      { path: 'login', loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent) },
      { path: 'register', loadComponent: () => import('./features/auth/register.component').then((m) => m.RegisterComponent) },
      { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password.component').then((m) => m.ForgotPasswordComponent) },
      { path: 'auth/confirm-email/:uid/:token', loadComponent: () => import('./features/auth/confirm-email.component').then((m) => m.ConfirmEmailComponent) },
      { path: 'auth/reset-password/:uid/:token', loadComponent: () => import('./features/auth/reset-password.component').then((m) => m.ResetPasswordComponent) },
      { path: 'auth/magic-link', loadComponent: () => import('./features/auth/magic-link-request.component').then((m) => m.MagicLinkRequestComponent) },
      { path: 'auth/magic-link/:token', loadComponent: () => import('./features/auth/magic-link-verify.component').then((m) => m.MagicLinkVerifyComponent) },
      { path: 'teams', canActivate: [authGuard], loadComponent: () => import('./features/teams/teams-list.component').then((m) => m.TeamsListComponent) },
      { path: 'teams/join/:token', canActivate: [authGuard], loadComponent: () => import('./features/teams/accept-invite.component').then((m) => m.AcceptInviteComponent) },
      { path: 'teams/:id', canActivate: [authGuard], loadComponent: () => import('./features/teams/team-detail.component').then((m) => m.TeamDetailComponent) },
      { path: 'teams/:id/history', canActivate: [authGuard], loadComponent: () => import('./features/history/history-list.component').then((m) => m.HistoryListComponent) },
      { path: 'teams/:id/history/:date', canActivate: [authGuard], loadComponent: () => import('./features/history/history-detail.component').then((m) => m.HistoryDetailComponent) },
      { path: 'teams/:id/board', canActivate: [authGuard], loadComponent: () => import('./features/board/board.component').then((m) => m.BoardComponent) },
      { path: 'join', loadComponent: () => import('./features/join/join.component').then((m) => m.JoinComponent) },
      { path: 'join/:code', loadComponent: () => import('./features/join/join.component').then((m) => m.JoinComponent) },
      { path: 'room/:code', loadComponent: () => import('./features/room/room.component').then((m) => m.RoomComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];
