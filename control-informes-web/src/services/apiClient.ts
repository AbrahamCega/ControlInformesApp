import axios, { AxiosError } from 'axios';
import type { ApiResponse } from '../types';
import { useNotificationStore } from '../stores/notificationStore';
import {
  getStoredToken,
  isTokenExpired,
  notifySessionExpired,
} from '../features/auth/tokenStorage';

const API_BASE_URL = 'https://localhost:7144/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Endpoints que no llevan token y que muestran su propio error en pantalla. */
const isAuthEndpoint = (url?: string) => !!url && url.includes('/auth/login');

// Adjunta el JWT almacenado a cada petición
apiClient.interceptors.request.use((config) => {
  if (isAuthEndpoint(config.url)) return config;

  const token = getStoredToken();
  if (!token) return config;

  if (isTokenExpired(token)) {
    // No tiene sentido llamar al backend con un token caducado: cerramos sesión
    notifySessionExpired();
    return Promise.reject(new axios.Cancel('Sesión expirada'));
  }

  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Extrae el `mensaje` de un cuerpo de error, incluso si vino como Blob. */
async function extraerMensaje(data: unknown): Promise<string | null> {
  if (!data) return null;
  if (data instanceof Blob) {
    try {
      const texto = await data.text();
      const parsed = JSON.parse(texto) as ApiResponse<unknown>;
      return parsed?.mensaje ?? null;
    } catch {
      return null;
    }
  }
  const api = data as ApiResponse<unknown>;
  return typeof api?.mensaje === 'string' ? api.mensaje : null;
}

apiClient.interceptors.response.use(
  (response) => {
    // Las descargas (blob) no traen el sobre ApiResponse
    if (response.config.responseType === 'blob') return response;

    const data = response.data as ApiResponse<unknown>;
    if (data?.hasError) {
      if (!isAuthEndpoint(response.config.url)) {
        useNotificationStore.getState().showNotification(
          data.mensaje || 'Error en la operación',
          'error',
        );
      }
      return Promise.reject(new Error(data.mensaje || 'Error en la operación'));
    }
    return response;
  },
  async (error: AxiosError<ApiResponse<unknown>>) => {
    // Peticiones canceladas por token expirado: ya se avisó, no duplicar snackbar
    if (axios.isCancel(error)) return Promise.reject(error);

    const status = error.response?.status;
    const mensajeServidor = await extraerMensaje(error.response?.data);

    if (status === 401 || status === 403) {
      useNotificationStore.getState().showNotification(
        mensajeServidor || 'Tu sesión expiró. Inicia sesión nuevamente.',
        'warning',
      );
      notifySessionExpired();
      return Promise.reject(error);
    }

    if (!isAuthEndpoint(error.config?.url)) {
      useNotificationStore.getState().showNotification(
        mensajeServidor || 'Error de conexión con el servidor',
        'error',
      );
    }

    // Normaliza el mensaje para quien lo muestre (p. ej. el formulario de login)
    if (mensajeServidor) error.message = mensajeServidor;
    return Promise.reject(error);
  },
);

export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const response = await apiClient.get<ApiResponse<T>>(url, { params });
  return response.data.result as T;
}

export async function apiPost<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiClient.post<ApiResponse<T>>(url, data);
  return response.data.result as T;
}

export async function apiPut<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiClient.put<ApiResponse<T>>(url, data);
  return response.data.result as T;
}

export async function apiDelete<T>(url: string): Promise<T> {
  const response = await apiClient.delete<ApiResponse<T>>(url);
  return response.data.result as T;
}

export async function apiPostFormData<T>(url: string, formData: FormData): Promise<T> {
  const response = await apiClient.post<ApiResponse<T>>(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.result as T;
}

export async function apiGetBlob(url: string): Promise<Blob> {
  const response = await apiClient.get(url, { responseType: 'blob' });
  const blob = response.data as Blob;

  // El backend puede responder 200 con un ApiResponse de error en vez del archivo
  if (blob.type.includes('application/json')) {
    const mensaje = (await extraerMensaje(blob)) || 'No se pudo generar el archivo';
    useNotificationStore.getState().showNotification(mensaje, 'error');
    throw new Error(mensaje);
  }

  return blob;
}

export default apiClient;
