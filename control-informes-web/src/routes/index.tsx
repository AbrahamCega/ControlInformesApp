import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardPage from '../pages/DashboardPage';
import PublicadoresPage from '../pages/PublicadoresPage';
import TarjetaPage from '../pages/TarjetaPage';
import InformesPage from '../pages/InformesPage';
import AsistenciaPage from '../pages/AsistenciaPage';
import GruposPage from '../pages/GruposPage';
import LoginPage from '../features/auth/pages/LoginPage';
import RequireAuth from '../components/RequireAuth';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <RequireAuth />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <DashboardPage /> },
          { path: 'publicadores', element: <PublicadoresPage /> },
          { path: 'publicadores/:id/tarjeta', element: <TarjetaPage /> },
          { path: 'grupos', element: <GruposPage /> },
          { path: 'informes', element: <InformesPage /> },
          { path: 'asistencia', element: <AsistenciaPage /> },
          //{ path: 'reportes', element: <ReportesPage /> },
          //{ path: 'excel', element: <ExcelPage /> },
        ],
      },
    ],
  },
]);

export default router;
