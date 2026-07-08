import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';

import { FooterComponent } from '../../shared/ui/footer/footer.component';
import { TopmenuComponent } from '../../shared/ui/topmenu/topmenu.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, ToastModule, TopmenuComponent, FooterComponent],
  template: `
    <div class="shell">
      <app-topmenu />
      <main><router-outlet /></main>
      <app-footer />
      <p-toast />
    </div>
  `,
  styles: [
    `
      .shell {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }
      main {
        flex: 1;
      }
    `,
  ],
})
export class PublicLayoutComponent {}
