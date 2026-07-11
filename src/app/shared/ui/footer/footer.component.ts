import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [TranslocoModule],
  template: `
    <footer class="footer">
      <span class="brand">{{ 'app.title' | transloco }}</span>
      <span class="tagline">{{ 'app.tagline' | transloco }}</span>
      <span class="spacer"></span>
      <span>© {{ year }} Foxugly</span>
    </footer>
  `,
  styles: [
    `
      .footer {
        display: flex;
        align-items: center;
        gap: var(--s-3);
        padding: var(--s-4);
        border-top: 1px solid var(--border);
        color: var(--muted);
        font-size: 0.85rem;
      }
      .brand {
        font-weight: 600;
        color: var(--ink);
      }
      .spacer {
        flex: 1;
      }
    `,
  ],
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
