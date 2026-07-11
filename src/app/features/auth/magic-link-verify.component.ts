import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-magic-link-verify',
  standalone: true,
  imports: [RouterLink, TranslocoModule],
  styleUrl: './auth.scss',
  template: `
    <section class="auth">
      <i class="pi pi-link auth__icon" aria-hidden="true"></i>
      @switch (state()) {
        @case ('pending') { <h1>{{ 'auth.magic.verifying' | transloco }}</h1> }
        @case ('error') {
          <h1>{{ 'auth.magic.error_title' | transloco }}</h1>
          <p class="lead err">{{ 'auth.magic.error_lead' | transloco }}</p>
          <div class="links"><a routerLink="/auth/magic-link">{{ 'auth.magic.request_new' | transloco }}</a></div>
        }
      }
    </section>
  `,
})
export class MagicLinkVerifyComponent implements OnInit {
  private auth = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly state = signal<'pending' | 'error'>('pending');

  async ngOnInit(): Promise<void> {
    const token = this.route.snapshot.paramMap.get('token') ?? '';
    try {
      await this.auth.verifyMagicLink(token);
      this.router.navigateByUrl('/');
    } catch {
      this.state.set('error');
    }
  }
}
