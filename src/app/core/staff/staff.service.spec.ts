import { describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';

import { getRuntimeConfig } from '../runtime-config';
import { StaffService } from './staff.service';

function serviceWith(http: { get: unknown; patch: unknown }) {
  return new StaffService(http as never);
}

// Comme les autres services core/, les URLs sont préfixées par apiBaseUrl (le
// front appelle l'API cross-origin, cf. deploy/nginx/poker-frontend.conf) — pas
// de chemin relatif nu.
const base = `${getRuntimeConfig().apiBaseUrl}/api/staff/users`;

describe('StaffService', () => {
  it('search passe le terme en parametre q', () => {
    const get = vi.fn().mockReturnValue(of({ results: [] }));
    serviceWith({ get, patch: vi.fn() }).search('mimi').subscribe();
    expect(get).toHaveBeenCalledWith(`${base}/`, { params: { q: 'mimi' } });
  });

  it('setBypass envoie le flag et la note', () => {
    const patch = vi.fn().mockReturnValue(of({}));
    serviceWith({ get: vi.fn(), patch }).setBypass(7, true, 'asso X').subscribe();
    expect(patch).toHaveBeenCalledWith(`${base}/7/`, {
      subscription_bypass: true,
      bypass_note: 'asso X',
    });
  });
});
