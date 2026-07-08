import { Component, input } from '@angular/core';

/**
 * The single shared in-page header (§3.15): [icon] emerald + <h1> left, actions
 * projected right via <ng-content>. There is NO separate detail-header component.
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  template: `
    <div class="page-header">
      <div class="title">
        <i class="pi {{ icon() }}"></i>
        <h1>{{ title() }}</h1>
      </div>
      <div class="actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      .page-header {
        display: flex;
        align-items: center;
        gap: var(--s-4);
        margin-bottom: var(--s-6);
      }
      .title {
        display: flex;
        align-items: center;
        gap: var(--s-2);
      }
      .title i {
        color: var(--fox-primary);
        font-size: 1.25rem;
      }
      h1 {
        margin: 0;
        font-size: 1.4rem;
        color: var(--text-strong);
      }
      .actions {
        display: flex;
        align-items: center;
        gap: var(--s-2);
        margin-left: auto;
        flex-wrap: wrap;
      }
    `,
  ],
})
export class PageHeaderComponent {
  readonly icon = input('pi-th-large');
  readonly title = input('');
}
