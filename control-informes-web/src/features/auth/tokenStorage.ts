/**
 * Acceso centralizado al JWT persistido por `useAuthStore` (zustand/persist).
 *
 * Este módulo NO importa nada de la app (ni el store, ni apiClient) para poder
 * usarse desde el interceptor de axios sin crear dependencias circulares.
 * Si se renombra la clave de persistencia, se cambia SÓLO aquí.
 */
export const AUTH_STORAGE_KEY = 'auth-storage';

export interface JwtPayload {
  sub?: string;
  unique_name?: string;
  role?: string;
  /** Expiración en segundos (epoch UNIX) */
  exp?: number;
  [key: string]: unknown;
}

/** Decodifica el payload de un JWT. Devuelve `null` si el token es inválido. */
export function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    // base64url -> base64 + padding (atob falla si la longitud no es múltiplo de 4)
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/').padEnd(
      part.length + ((4 - (part.length % 4)) % 4),
      '=',
    );
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

/** Expiración del token en milisegundos (epoch), o `null` si no la declara. */
export function getTokenExpiration(token: string): number | null {
  const exp = decodeJwtPayload(token)?.exp;
  return typeof exp === 'number' ? exp * 1000 : null;
}

/**
 * ¿El token ya expiró? Un token sin `exp` se considera válido (lo decide el
 * backend). `skewMs` evita enviar tokens que caducan en milisegundos.
 */
export function isTokenExpired(token: string | null | undefined, skewMs = 5000): boolean {
  if (!token) return true;
  const expMs = getTokenExpiration(token);
  if (expMs === null) return false;
  return Date.now() + skewMs >= expMs;
}

/** Lee el token persistido sin pasar por el store. */
export function getStoredToken(): string | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { token?: string } };
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

/** Borra la sesión persistida. */
export function clearStoredAuth(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // ignore
  }
}

/* ── Evento de sesión expirada ───────────────────────────────────────────── */

type SessionExpiredHandler = () => void;
const handlers = new Set<SessionExpiredHandler>();

/** Se suscribe al evento de sesión expirada. Devuelve la función para cancelar. */
export function onSessionExpired(handler: SessionExpiredHandler): () => void {
  handlers.add(handler);
  return () => handlers.delete(handler);
}

let notifying = false;

/** Notifica (una sola vez por ráfaga) que la sesión ya no es válida. */
export function notifySessionExpired(): void {
  if (notifying) return;
  notifying = true;
  handlers.forEach((h) => h());
  // Permite un nuevo aviso tras el ciclo actual de peticiones en paralelo
  setTimeout(() => {
    notifying = false;
  }, 1000);
}
