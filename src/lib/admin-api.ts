// Shared admin API helper — attaches auth credentials to all admin API calls

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '';

let _sessionToken: string | null = null;

export function setAdminSession(token: string) {
  _sessionToken = token;
  // Also set as cookie for middleware to read
  if (typeof document !== 'undefined') {
    document.cookie = `admin_session=${token}; path=/; SameSite=Strict; Secure`;
  }
}

export function clearAdminSession() {
  _sessionToken = null;
  if (typeof document !== 'undefined') {
    document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

export function getAdminSession(): string | null {
  return _sessionToken;
}

export async function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);

  // Attach admin API key if available (for server-to-server)
  const apiKey = process.env.NEXT_PUBLIC_ADMIN_API_KEY;
  if (apiKey) {
    headers.set('x-admin-key', apiKey);
  }

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Send cookies (admin_session)
  });
}
