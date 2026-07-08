import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';

import { ThemeService } from '../../../core/theme/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [ButtonModule],
  template: `
    <p-button
      [icon]="theme.theme() === 'dark' ? 'pi pi-sun' : 'pi pi-moon'"
      [text]="true"
      [rounded]="true"
      severity="secondary"
      (onClick)="theme.toggle()"
      ariaLabel="Toggle theme"
    />
  `,
})
export class ThemeToggleComponent {
  readonly theme = inject(ThemeService);
}
