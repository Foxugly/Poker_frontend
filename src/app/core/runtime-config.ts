// Runtime config: prod values injected by nginx (window.__POKER__ from SSM);
// dev falls back to the local backend. WS base is derived from the API base.
export interface RuntimeConfig {
  apiBaseUrl: string;
  wsBaseUrl: string;
}

declare global {
  interface Window {
    __POKER__?: Partial<RuntimeConfig>;
  }
}

export function getRuntimeConfig(): RuntimeConfig {
  const injected = (typeof window !== 'undefined' && window.__POKER__) || {};
  const apiBaseUrl = (injected.apiBaseUrl ?? 'http://127.0.0.1:8000').replace(/\/$/, '');
  const wsBaseUrl = (injected.wsBaseUrl ?? apiBaseUrl.replace(/^http/, 'ws')).replace(/\/$/, '');
  return { apiBaseUrl, wsBaseUrl };
}
