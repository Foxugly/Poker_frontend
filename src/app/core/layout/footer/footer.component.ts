import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

/**
 * Fleet footer (core/layout, STANDARD-frontend-layout.md): brand + tagline,
 * runtime build version when injected (`window.__POKER_VERSION`), © line.
 * Colours come from the design tokens, so dark mode is handled automatically.
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [TranslocoModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
  /** Build version injected at deploy time; empty in dev. */
  readonly version =
    (globalThis as { __POKER_VERSION?: string }).__POKER_VERSION ?? '';
}
