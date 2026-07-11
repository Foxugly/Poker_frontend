import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [RouterLink, TranslocoModule],
  styleUrl: './auth.scss',
  template: `
    <section class="auth">
      <i class="pi pi-check-circle auth__icon" aria-hidden="true"></i>
      @switch (state()) {
        @case ('pending') { <h1>{{ 'auth.confirm.pending' | transloco }}</h1> }
        @case ('ok') {
          <h1 class="ok">{{ 'auth.confirm.ok_title' | transloco }}</h1>
          <p class="lead">{{ 'auth.confirm.ok_lead' | transloco }}</p>
        }
        @case ('error') {
          <h1>{{ 'auth.confirm.error_title' | transloco }}</h1>
          <p class="lead err">{{ 'auth.confirm.error_lead' | transloco }}</p>
          <div class="links"><a routerLink="/login">{{ 'auth.back_to_login' | transloco }}</a></div>
        }
      }
    </section>
  `,
})
export class ConfirmEmailComponent implements OnInit {
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly state = signal<'pending' | 'ok' | 'error'>('pending');

  async ngOnInit(): Promise<void> {
    const uid = this.route.snapshot.paramMap.get('uid') ?? '';
    const token = this.route.snapshot.paramMap.get('token') ?? '';
    try {
      await this.auth.confirmEmail(uid, token);
      this.state.set('ok');
      setTimeout(() => this.router.navigateByUrl('/'), 1200);
    } catch {
      this.state.set('error');
    }
  }
}
