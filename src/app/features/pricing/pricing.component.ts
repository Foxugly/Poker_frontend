import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';

import { PageHeaderComponent } from '../../shared/ui/page-header/page-header.component';

/** Public pricing page: free anonymous rooms vs the two paid team plans (1 / 5 teams,
 * monthly or yearly). States the 20-people-per-room and 20-members-per-team caps. */
@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [RouterLink, TranslocoModule, PageHeaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page page--narrow pricing-page">
      <app-page-header [icon]="'pi-tag'" [title]="'pricing.title' | transloco" />
      <p class="lead">{{ 'pricing.intro' | transloco }}</p>

      <div class="tiers">
        <!-- Free -->
        <article class="tier">
          <h3>{{ 'pricing.free_title' | transloco }}</h3>
          <div class="price">0 €</div>
          <ul>
            <li><i class="pi pi-check"></i>{{ 'pricing.free_f1' | transloco }}</li>
            <li><i class="pi pi-check"></i>{{ 'pricing.free_f2' | transloco }}</li>
            <li><i class="pi pi-check"></i>{{ 'pricing.free_f3' | transloco }}</li>
          </ul>
          <a class="tier-cta ghost" routerLink="/">{{ 'pricing.cta_free' | transloco }}</a>
        </article>

        <!-- 1 team -->
        <article class="tier featured">
          <h3>{{ 'pricing.team1_title' | transloco }}</h3>
          <div class="price">5 €<span>{{ 'pricing.per_month' | transloco }}</span></div>
          <div class="price-alt">{{ 'pricing.or' | transloco }} 50 €{{ 'pricing.per_year' | transloco }}</div>
          <ul>
            <li><i class="pi pi-check"></i>{{ 'pricing.paid_f1' | transloco }}</li>
            <li><i class="pi pi-check"></i>{{ 'pricing.paid_f2' | transloco }}</li>
            <li><i class="pi pi-check"></i>{{ 'pricing.paid_f3' | transloco }}</li>
            <li><i class="pi pi-check"></i>{{ 'pricing.paid_f4' | transloco }}</li>
          </ul>
          <a class="tier-cta" routerLink="/teams">{{ 'pricing.cta_paid' | transloco }}</a>
        </article>

        <!-- 5 teams -->
        <article class="tier">
          <h3>{{ 'pricing.team5_title' | transloco }}</h3>
          <div class="price">20 €<span>{{ 'pricing.per_month' | transloco }}</span></div>
          <div class="price-alt">{{ 'pricing.or' | transloco }} 200 €{{ 'pricing.per_year' | transloco }}</div>
          <ul>
            <li><i class="pi pi-check"></i>{{ 'pricing.team5_f1' | transloco }}</li>
            <li><i class="pi pi-check"></i>{{ 'pricing.paid_f1' | transloco }}</li>
            <li><i class="pi pi-check"></i>{{ 'pricing.paid_f2' | transloco }}</li>
            <li><i class="pi pi-check"></i>{{ 'pricing.paid_f3' | transloco }}</li>
          </ul>
          <a class="tier-cta" routerLink="/teams">{{ 'pricing.cta_paid' | transloco }}</a>
        </article>
      </div>

      <p class="cap-note"><i class="pi pi-info-circle"></i>{{ 'pricing.note' | transloco }}</p>
    </section>
  `,
  styles: [
    `
      .pricing-page {
        display: flex;
        flex-direction: column;
        gap: var(--s-4);
      }
      .lead {
        margin: 0;
        color: var(--muted);
      }
      .tiers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: var(--s-4);
        align-items: start;
      }
      .tier {
        border: 1px solid var(--border);
        border-radius: var(--radius);
        background: var(--surface);
        box-shadow: var(--shadow-card);
        padding: var(--s-5) var(--s-4);
        display: grid;
        gap: var(--s-3);
      }
      .tier.featured {
        border-color: var(--fox-primary);
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--fox-primary) 30%, transparent), var(--shadow-card);
      }
      .tier h3 {
        margin: 0;
        color: var(--text-strong);
      }
      .price {
        font-size: 2rem;
        font-weight: 800;
        color: var(--text-strong);
      }
      .price span {
        font-size: 0.9rem;
        font-weight: 500;
        color: var(--muted);
      }
      .price-alt {
        margin-top: -8px;
        font-size: 0.85rem;
        color: var(--muted);
      }
      .tier ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: grid;
        gap: 8px;
      }
      .tier li {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        color: var(--text);
        line-height: 1.45;
      }
      .tier li i {
        color: var(--fox-primary);
        font-size: 0.8rem;
        margin-top: 4px;
      }
      .tier-cta {
        text-align: center;
        text-decoration: none;
        font-weight: 700;
        padding: 0.65rem 1rem;
        border-radius: 999px;
        background: var(--fox-primary);
        color: #05261c;
      }
      .tier-cta.ghost {
        background: transparent;
        color: var(--fox-primary);
        border: 1px solid var(--fox-primary);
      }
      .tier-cta:hover {
        filter: brightness(1.08);
      }
      .cap-note {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--muted);
        font-size: 0.9rem;
      }
      .cap-note i {
        color: var(--fox-primary);
      }
      @media (max-width: 820px) {
        .tiers {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class PricingComponent {}
