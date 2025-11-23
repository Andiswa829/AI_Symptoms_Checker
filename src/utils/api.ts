export class ApiService {
  private static baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:7125';
  private static token: string | null = null;
  

  static setToken(token: string | null) {
    this.token = token;
    try { if (token) localStorage.setItem('auth_token', token); else localStorage.removeItem('auth_token'); } catch {}
  }

  static getToken(): string | null {
    if (!this.token) {
      try { this.token = localStorage.getItem('auth_token'); } catch {}
    }
    return this.token;
  }

  static clearToken() {
    this.setToken(null);
  }

  private static async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      this.clearToken();
      throw new Error(res.statusText);
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.message || `HTTP ${res.status}`);
    }
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) return res.json();
    return res;
  }

  static get(endpoint: string) { return this.request(endpoint, { method: 'GET' }); }
  static post(endpoint: string, data?: any) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(data) }); }
  static put(endpoint: string, data?: any) { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(data) }); }
  static delete(endpoint: string) { return this.request(endpoint, { method: 'DELETE' }); }
}