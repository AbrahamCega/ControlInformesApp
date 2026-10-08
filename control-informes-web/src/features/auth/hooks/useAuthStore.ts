import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser, LoginCredentials } from '../services/authService';
import { authService } from '../services/authService';
import { AUTH_STORAGE_KEY, isTokenExpired, onSessionExpired } from '../tokenStorage';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  /** Expiración del token en milisegundos (epoch). */
  expiracion: number | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** `false` hasta que zustand/persist termina de leer localStorage. */
  isHydrated: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const sesionVacia = {
  user: null,
  token: null,
  expiracion: null,
  isAuthenticated: false,
} as const;

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...sesionVacia,
      isLoading: false,
      isHydrated: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(credentials);
          set({
            user: response.user,
            token: response.token,
            expiracion: response.expiracion,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error al iniciar sesión';
          set({ ...sesionVacia, error: message, isLoading: false });
          throw err;
        }
      },

      logout: () => {
        authService.logout();
        set({ ...sesionVacia, error: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        expiracion: state.expiracion,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Al arrancar: un token caducado no debe dejar la app en estado "logueado"
        if (state && isTokenExpired(state.token)) {
          authService.logout();
          state.user = null;
          state.token = null;
          state.expiracion = null;
          state.isAuthenticated = false;
        }
      },
    },
  ),
);

// Marca el fin de la hidratación (la API de persist evita usar el store
// antes de que esté inicializado)
const marcarHidratado = () => useAuthStore.setState({ isHydrated: true });
if (useAuthStore.persist.hasHydrated()) {
  marcarHidratado();
} else {
  useAuthStore.persist.onFinishHydration(marcarHidratado);
}

// Cierra la sesión cuando el interceptor detecta 401/403 o un token caducado
onSessionExpired(() => {
  if (useAuthStore.getState().isAuthenticated) {
    useAuthStore.getState().logout();
  }
});

// Mantiene sincronizadas las pestañas abiertas (logout en una = logout en todas)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === AUTH_STORAGE_KEY && e.newValue === null) {
      useAuthStore.setState({ ...sesionVacia });
    }
  });
}
