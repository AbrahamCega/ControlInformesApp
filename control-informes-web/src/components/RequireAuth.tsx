import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../features/auth/hooks/useAuthStore';
import { isTokenExpired, notifySessionExpired } from '../features/auth/tokenStorage';
import Loader from './Loader';

export default function RequireAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const expiracion = useAuthStore((s) => s.expiracion);
  const token = useAuthStore((s) => s.token);
  const location = useLocation();

  // Cierra la sesión automáticamente en cuanto el token caduca, sin esperar
  // a que el usuario haga una petición
  useEffect(() => {
    if (!isAuthenticated || !expiracion) return;
    const restante = expiracion - Date.now();
    if (restante <= 0) {
      notifySessionExpired();
      return;
    }
    const id = window.setTimeout(notifySessionExpired, restante);
    return () => window.clearTimeout(id);
  }, [isAuthenticated, expiracion]);

  // Evita redirigir a /login antes de leer la sesión de localStorage
  if (!isHydrated) return <Loader fullScreen message="Cargando sesión..." />;

  if (!isAuthenticated || isTokenExpired(token)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
