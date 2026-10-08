import { apiPost } from '../../../services/apiClient';
import {
  clearStoredAuth,
  decodeJwtPayload,
  getStoredToken,
  getTokenExpiration,
  isTokenExpired,
} from '../tokenStorage';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: string;
}

export interface LoginResponse {
  user: AuthUser;
  token: string;
  /** Expiración en milisegundos (epoch), o `null` si el token no la declara. */
  expiracion: number | null;
}

interface TokenResult {
  token: string;
  expiracion: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const result = await apiPost<TokenResult>('/auth/login', {
      Username: credentials.username,
      Password: credentials.password,
    });

    if (!result?.token) {
      throw new Error('El servidor no devolvió un token válido');
    }

    const payload = decodeJwtPayload(result.token) ?? {};
    const user: AuthUser = {
      id: payload.sub ?? '',
      username: payload.unique_name ?? credentials.username,
      name: payload.unique_name ?? credentials.username,
      role: typeof payload.role === 'string' ? payload.role : 'admin',
    };

    // Preferimos el `exp` del propio token; si no viene, la fecha del backend
    const expiracion =
      getTokenExpiration(result.token) ??
      (result.expiracion ? new Date(result.expiracion).getTime() : null);

    return { user, token: result.token, expiracion: Number.isNaN(expiracion) ? null : expiracion };
  },

  logout: () => {
    clearStoredAuth();
  },

  getStoredToken,
  isTokenExpired,
};
