import { useState, useEffect } from 'react';
import { reportesApi, vehiculosApi, menoresApi, sagApi } from '../../api/services';
import { Card, Spinner, BadgeEstado } from '../../components/common';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, ResponsiveContainer
} from 'recharts';
import { useAuth } from '../../context/AuthContext';

function StatCard({ label, value, icon, sub, color = 'aduana' }) {
  const colors = {
    aduana:  'bg-aduana-600',
    green:   'bg-green-600',
    yellow:  'bg-yellow-500',
    red:     'bg-red-600',
  };
  return (
    <div className="bg-white rounded-xl shadow-card border border-aduana_gris-DEFAULT p-5 flex items-start gap-4">
      <div className={`${colors[color]} text-white text-2xl w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-aduana-800">{value ?? '—'}</p>
        <p className="text-sm text-aduana_gris-medium">{label}</p>
        {sub && <p className="text-xs text-aduana-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [vencidos, setVencidos] = useState([]);
  const [menoresPendientes, setMenoresPendientes] = useState([]);
  const [sagPendientes, setSagPendientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const hoy = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [statsRes, vencidosRes, menoresRes, sagRes] = await Promise.all([
          reportesApi.dashboard(hoy).catch(() => ({ data: null })),
          vehiculosApi.obtenerVencidos(),
          menoresApi.listarPendientes(),
          sagApi.pendientesInspeccion(),
        ]);
        setStats(statsRes.data);
        setVencidos(vencidosRes.data);
        setMenoresPendientes(menoresRes.data);
        setSagPendientes(sagRes.data);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  // Datos de ejemplo para el gráfico (se reemplaza con datos reales del backend)
  const chartData = stats?.crucesPorHora
    ? stats.crucesPorHora.map(([hora, cantidad]) => ({ hora: `${hora}:00`, cantidad }))
    : Array.from({ length: 12 }, (_, i) => ({
        hora: `${i * 2}:00`,
        cantidad: Math.floor(Math.random() * 120) + 20,
      }));

  if (loading) return <Spinner className="mt-20" size="lg" />;

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-xl font-bold text-aduana-800">
          Panel de Control — {new Date().toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </h2>
        <p className="text-sm text-aduana_gris-medium">
          Bienvenido, {user?.nombreCompleto}. Vista general de operaciones del paso fronterizo.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="🔼" label="Entradas hoy" color="green"
          value={stats?.totalEntradas ?? 0}
          sub="Ingresos al país"
        />
        <StatCard
          icon="🔽" label="Salidas hoy" color="aduana"
          value={stats?.totalSalidas ?? 0}
          sub="Salidas del país"
        />
        <StatCard
          icon="⏱️" label="Tiempo promedio" color="yellow"
          value={stats?.promedioTiempoMinutos ? `${stats.promedioTiempoMinutos} min` : 'N/A'}
          sub="Por cruce"
        />
        <StatCard
          icon="🚨" label="Vehículos vencidos" color="red"
          value={vencidos.length}
          sub="Superan el plazo"
        />
      </div>

      {/* Gráfico + alertas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Flujo de cruces por hora — Hoy" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8eaed" />
              <XAxis dataKey="hora" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="cantidad" fill="#003f8a" radius={[4, 4, 0, 0]} name="Cruces" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <div className="space-y-4">
          {/* Alertas pendientes */}
          <Card title="⚠️ Alertas pendientes">
            <div className="space-y-3">
              {vencidos.length > 0 && (
                <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg border border-red-100">
                  <span className="text-sm text-red-700 font-medium">Vehículos vencidos</span>
                  <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{vencidos.length}</span>
                </div>
              )}
              {menoresPendientes.length > 0 && (
                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg border border-yellow-100">
                  <span className="text-sm text-yellow-700 font-medium">Menores pendientes</span>
                  <span className="bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{menoresPendientes.length}</span>
                </div>
              )}
              {sagPendientes.length > 0 && (
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-100">
                  <span className="text-sm text-green-700 font-medium">SAG por inspeccionar</span>
                  <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{sagPendientes.length}</span>
                </div>
              )}
              {!vencidos.length && !menoresPendientes.length && !sagPendientes.length && (
                <p className="text-sm text-aduana_gris-medium text-center py-4">✅ Sin alertas activas</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Tablas de alertas detalladas */}
      {vencidos.length > 0 && (
        <Card title="🚨 Vehículos con plazo vencido" subtitle="Requieren acción inmediata">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-red-600 text-white">
                  {['Patente', 'Titular', 'Fecha Salida', 'Límite Retorno', 'Estado'].map(h => (
                    <th key={h} className="px-4 py-2 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100">
                {vencidos.map((v) => (
                  <tr key={v.id} className="bg-red-50 hover:bg-red-100">
                    <td className="px-4 py-2 font-mono font-bold">{v.patente}</td>
                    <td className="px-4 py-2">{v.persona?.nombres} {v.persona?.apellidos}</td>
                    <td className="px-4 py-2">{v.fechaSalida}</td>
                    <td className="px-4 py-2 text-red-700 font-semibold">{v.fechaLimiteRetorno}</td>
                    <td className="px-4 py-2"><BadgeEstado estado="EXPIRADA" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
