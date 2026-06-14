import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import VehiculosPage from './pages/vehiculos/VehiculosPage';
import MenoresPage from './pages/menores/MenoresPage';
import SagPage from './pages/sag/SagPage';
import ReportesPage from './pages/reportes/ReportesPage';

// ── Ruta protegida: redirige a /login si no está autenticado ─────────────
function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, tieneRol } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !tieneRol(...roles)) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center p-8 bg-white rounded-xl shadow-card max-w-sm">
          <p className="text-4xl mb-4">🔒</p>
          <h3 className="text-lg font-bold text-aduana-800 mb-2">Acceso Restringido</h3>
          <p className="text-sm text-aduana_gris-medium">
            No tienes los permisos necesarios para acceder a este módulo.
            Contacta al administrador del sistema.
          </p>
        </div>
      </div>
    );
  }

  return children;
}

// ── Ruta pública: redirige al dashboard si ya está autenticado ────────────
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Pública */}
      <Route path="/login" element={
        <PublicRoute><LoginPage /></PublicRoute>
      } />

      {/* Protegidas con layout */}
      <Route path="/" element={
        <ProtectedRoute><MainLayout /></ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="vehiculos" element={
          <ProtectedRoute roles={['ROLE_ADMIN', 'ROLE_SUPERVISOR', 'ROLE_OFICIAL_ADUANA']}>
            <VehiculosPage />
          </ProtectedRoute>
        } />
        <Route path="menores" element={
          <ProtectedRoute roles={['ROLE_ADMIN', 'ROLE_SUPERVISOR', 'ROLE_OFICIAL_PDI']}>
            <MenoresPage />
          </ProtectedRoute>
        } />
        <Route path="sag" element={
          <ProtectedRoute roles={['ROLE_ADMIN', 'ROLE_SUPERVISOR', 'ROLE_OFICIAL_SAG']}>
            <SagPage />
          </ProtectedRoute>
        } />
        <Route path="reportes" element={
          <ProtectedRoute roles={['ROLE_ADMIN', 'ROLE_SUPERVISOR']}>
            <ReportesPage />
          </ProtectedRoute>
        } />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontSize: '13px',
              maxWidth: '380px',
            },
            success: {
              iconTheme: { primary: '#003f8a', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#cc0000', secondary: '#fff' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
