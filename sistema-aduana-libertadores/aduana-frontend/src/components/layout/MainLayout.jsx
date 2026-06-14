import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard',  label: 'Dashboard',       icon: '📊', roles: null },
  { to: '/vehiculos',  label: 'Vehículos',        icon: '🚗', roles: null },
  { to: '/menores',    label: 'Menores de Edad',  icon: '👶', roles: null },
  { to: '/sag',        label: 'Declaración SAG',  icon: '🌿', roles: null },
  { to: '/reportes',   label: 'Reportes',         icon: '📄', roles: ['ROLE_ADMIN', 'ROLE_SUPERVISOR'] },
];

export default function MainLayout() {
  const { user, logout, tieneRol } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const rolLabel = {
    ROLE_ADMIN:          'Administrador',
    ROLE_SUPERVISOR:     'Supervisor',
    ROLE_OFICIAL_ADUANA: 'Oficial Aduana',
    ROLE_OFICIAL_PDI:    'Oficial PDI',
    ROLE_OFICIAL_SAG:    'Oficial SAG',
  };

  return (
    <div className="flex h-screen bg-aduana_gris-light overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside
        className={`flex flex-col bg-aduana-700 text-white transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-16'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-aduana-600">
          <div className="flex-shrink-0 w-8 h-8 bg-white rounded flex items-center justify-center">
            <span className="text-aduana-700 font-black text-xs">SNA</span>
          </div>
          {sidebarOpen && (
            <div className="leading-tight">
              <p className="text-xs font-bold uppercase tracking-wide">Aduanas Chile</p>
              <p className="text-[10px] text-aduana-300">Los Libertadores</p>
            </div>
          )}
        </div>

        {/* Navegación */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            if (item.roles && !tieneRol(...item.roles)) return null;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm transition-all
                  ${isActive
                    ? 'bg-aduana-500 text-white font-semibold'
                    : 'text-aduana-200 hover:bg-aduana-600 hover:text-white'}`
                }
              >
                <span className="text-base flex-shrink-0">{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Info usuario */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-t border-aduana-600 text-xs">
            <p className="font-semibold text-white truncate">{user?.nombreCompleto}</p>
            <p className="text-aduana-300">{rolLabel[user?.rol] || user?.rol}</p>
          </div>
        )}
      </aside>

      {/* ── Contenido principal ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between bg-white px-6 py-3 border-b border-aduana_gris-DEFAULT shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-aduana-600 hover:text-aduana-800 p-1 rounded"
            >
              ☰
            </button>
            <div>
              <h1 className="text-sm font-bold text-aduana-800">
                Sistema Integrado de Control Fronterizo
              </h1>
              <p className="text-xs text-aduana_gris-medium">Paso Los Libertadores — Chile / Argentina</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-aduana_gris-medium hidden sm:block">
              {new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-aduana_rojo hover:text-aduana_rojo-dark font-medium px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-all"
            >
              🚪 Cerrar Sesión
            </button>
          </div>
        </header>

        {/* Área de contenido con scroll */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
