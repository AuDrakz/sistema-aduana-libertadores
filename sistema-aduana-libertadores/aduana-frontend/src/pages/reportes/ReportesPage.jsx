import { useState } from 'react';
import { reportesApi } from '../../api/services';
import { Card, Button, Alert } from '../../components/common';
import toast from 'react-hot-toast';

function descargarArchivo(blob, nombre) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export default function ReportesPage() {
  const [loadingExcel, setLoadingExcel] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [anioReporte, setAnioReporte] = useState(new Date().getFullYear().toString());

  const exportarExcel = async () => {
    if (!fechaDesde || !fechaHasta) {
      toast.error('Seleccione el rango de fechas.');
      return;
    }
    setLoadingExcel(true);
    try {
      const res = await reportesApi.exportarExcel(fechaDesde, fechaHasta);
      descargarArchivo(
        res.data,
        `cruces_${fechaDesde}_${fechaHasta}.xlsx`
      );
      toast.success('Archivo Excel descargado correctamente.');
    } catch {
      toast.error('Error al generar el archivo Excel.');
    } finally {
      setLoadingExcel(false);
    }
  };

  const exportarPdf = async () => {
    if (!anioReporte) {
      toast.error('Ingrese el año del informe.');
      return;
    }
    setLoadingPdf(true);
    try {
      const res = await reportesApi.exportarPdf(anioReporte);
      descargarArchivo(res.data, `informe_estadistico_${anioReporte}.pdf`);
      toast.success('Informe PDF descargado correctamente.');
    } catch {
      toast.error('Error al generar el PDF.');
    } finally {
      setLoadingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-aduana-800">📄 Módulo de Reportes</h2>
        <p className="text-sm text-aduana_gris-medium">
          Generación de informes estadísticos — Acceso restringido a Supervisores y Administradores
        </p>
      </div>

      <Alert tipo="info">
        Los reportes se generan en tiempo real desde la base de datos del sistema. El tiempo de generación
        puede variar según el volumen de datos del período seleccionado.
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Reporte Excel */}
        <Card
          title="📊 Registro de Cruces — Excel"
          subtitle="Detalle completo de entradas y salidas por período"
        >
          <div className="space-y-4">
            <p className="text-sm text-aduana_gris-medium">
              Exporta un listado detallado de todos los cruces fronterizos en el rango de fechas
              seleccionado. Incluye datos del viajero, tipo de cruce, tiempo de procesamiento y
              oficial responsable.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-aduana-800 mb-1">
                  Fecha desde <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={fechaDesde}
                  onChange={e => setFechaDesde(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-aduana_gris-DEFAULT rounded-lg focus:border-aduana-500 focus:ring-1 focus:ring-aduana-200 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-aduana-800 mb-1">
                  Fecha hasta <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={fechaHasta}
                  onChange={e => setFechaHasta(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-aduana_gris-DEFAULT rounded-lg focus:border-aduana-500 focus:ring-1 focus:ring-aduana-200 outline-none"
                />
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs text-aduana_gris-medium mb-2">
                Formato: Excel (.xlsx) · Incluye hoja de resumen y detalle por fila
              </p>
              <Button
                onClick={exportarExcel}
                loading={loadingExcel}
                icon={<span>📥</span>}
                className="w-full justify-center"
              >
                Descargar Excel
              </Button>
            </div>

            <div className="flex gap-2 flex-wrap">
              {[
                { label: 'Hoy', desde: new Date().toISOString().split('T')[0], hasta: new Date().toISOString().split('T')[0] },
                { label: 'Últ. 7 días', desde: new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0], hasta: new Date().toISOString().split('T')[0] },
                { label: 'Últ. 30 días', desde: new Date(Date.now() - 29 * 86400000).toISOString().split('T')[0], hasta: new Date().toISOString().split('T')[0] },
              ].map(p => (
                <button
                  key={p.label}
                  onClick={() => { setFechaDesde(p.desde); setFechaHasta(p.hasta); }}
                  className="text-xs text-aduana-600 hover:text-aduana-800 border border-aduana-200 hover:border-aduana-400 px-2 py-1 rounded transition-all"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Reporte PDF */}
        <Card
          title="📑 Informe Estadístico Anual — PDF"
          subtitle="Resumen ejecutivo de operaciones del año seleccionado"
        >
          <div className="space-y-4">
            <p className="text-sm text-aduana_gris-medium">
              Genera un informe estadístico completo con totales anuales de entradas, salidas,
              vehículos procesados, declaraciones SAG y menores atendidos. Incluye desglose mensual.
            </p>

            <div>
              <label className="block text-sm font-medium text-aduana-800 mb-1">
                Año del informe <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="2020"
                max={new Date().getFullYear()}
                value={anioReporte}
                onChange={e => setAnioReporte(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-aduana_gris-DEFAULT rounded-lg focus:border-aduana-500 focus:ring-1 focus:ring-aduana-200 outline-none"
              />
            </div>

            <div className="pt-2">
              <p className="text-xs text-aduana_gris-medium mb-2">
                Formato: PDF · Incluye logo institucional y colores Aduana Chile
              </p>
              <Button
                onClick={exportarPdf}
                loading={loadingPdf}
                icon={<span>📥</span>}
                className="w-full justify-center"
                variant="secondary"
              >
                Descargar PDF
              </Button>
            </div>

            <div className="p-3 bg-aduana-50 rounded-lg text-xs text-aduana-600 border border-aduana-100">
              <strong>Contenido del informe:</strong>
              <ul className="mt-1 space-y-0.5 list-disc list-inside">
                <li>Total anual de entradas y salidas al país</li>
                <li>Declaraciones de vehículos procesadas</li>
                <li>Declaraciones de menores atendidas</li>
                <li>Declaraciones SAG registradas</li>
                <li>Desglose mensual con gráfico de tendencia</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* Información adicional */}
      <Card title="ℹ️ Información sobre los Reportes">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-aduana_gris-medium">
          <div className="p-3 bg-aduana-50 rounded-lg">
            <p className="font-semibold text-aduana-700 mb-1">🔐 Confidencialidad</p>
            <p>Los reportes contienen información sensible de viajeros. Distribución restringida a personal autorizado.</p>
          </div>
          <div className="p-3 bg-aduana-50 rounded-lg">
            <p className="font-semibold text-aduana-700 mb-1">📅 Actualización</p>
            <p>Los datos se obtienen en tiempo real desde la base de datos. No existe caché intermedia.</p>
          </div>
          <div className="p-3 bg-aduana-50 rounded-lg">
            <p className="font-semibold text-aduana-700 mb-1">🗃️ Retención</p>
            <p>Los archivos descargados son responsabilidad del funcionario. No quedan almacenados en el servidor.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
