import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { getRuntimeConfig } from '../runtime-config';

@Injectable({ providedIn: 'root' })
export class BillingService {
  private http = inject(HttpClient);
  private base = getRuntimeConfig().apiBaseUrl + '/api/billing';

  /** Start a subscription: redirects the browser to Stripe Checkout. */
  async subscribe(teamId: number): Promise<void> {
    const { url } = await firstValueFrom(this.http.post<{ url: string }>(`${this.base}/checkout/`, { teamId }));
    window.location.href = url;
  }

  /** Open the Stripe billing portal to manage/cancel the subscription. */
  async manage(teamId: number): Promise<void> {
    const { url } = await firstValueFrom(this.http.post<{ url: string }>(`${this.base}/portal/`, { teamId }));
    window.location.href = url;
  }
}
