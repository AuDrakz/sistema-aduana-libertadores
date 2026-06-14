import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { vehiculosApi, personasApi } from '../../api/services';
import { Card, Button, BadgeEstado, Alert, FormField, Input, Select, Spinner } from '../../components/common';
import toast from 'react-hot-toast';

const TIPOS_VEHICULO = ['AUTOMOVIL', 'CAMIONETA', 'MOTOCICLETA', 'CAMION', 'BUS', 'FURGON', 'DIPLOMÁTICO'];

export default function VehiculosPage() {
  const [vista, setVista] = useState('lista'); // 'lista' | 'nuevo'
  const [declaraciones, setDeclaraciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [busquedaPersona, setBusquedaPersona] = useState('');
  const [personaEncontrada, setPersonaEncontrada] = useState(null);
  const [buscandoPersona, setBuscandoPersona] = useState(false);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: { esDiplomatico: false, tipoCruce: 'SALIDA' },
  });

  const esDiplomatico = watch('esDiplomatico');

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const res = await vehiculosApi.listar();
      setDeclaraciones(res.data);
    } finally {
      setLoading(false);
    }
  };

  const buscarPersona = async () => {
    if (!busquedaPersona.trim()) return;
    setBuscandoPersona(true);
    try {
      const res = await personasApi.buscarPorDocumento(busquedaPersona.trim());
      setPersonaEncontrada(res.data);
      toast.success('Persona encontrada');
    } catch {
      setPersonaEncontrada(null);
      toast.error('Persona no encontrada. Regístrela primero.');
    } finally {
      setBuscandoPersona(false);
    }
  };

  const onSubmit = async (data) => {
  console.log('DATOS FORMULARIO:', data);
  console.log('PERSONA:', personaEncontrada);

    if (!personaEncontrada) {
      toast.error('Debe buscar y seleccionar una persona primero.');
      return;
    }
    setSubmitLoading(true);
    try {
      await vehiculosApi.registrar({ ...data, personaId: personaEncontrada.id });
      toast.success('Declaración de vehículo registrada correctamente.');
      reset();
      setPersonaEncontrada(null);
      setVista('lista');
      cargarDatos();
    } finally {
      setSubmitLoading(false);
    }
  };

  const registrarRetorno = async (id) => {
    const hoy = new Date().toISOString().split('T')[0];
    try {
      await vehiculosApi.registrarRetorno(id, hoy);
      toast.success('Retorno registrado correctamente.');
      cargarDatos();
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-aduana-800">🚗 Vehículos — Salida/Admisión Temporal</h2>
          <p className="text-sm text-aduana_gris-medium">Plazo máximo: 180 días corridos (90 para diplomáticos)</p>
        </div>
        <Button onClick={() => setVista(vista === 'lista' ? 'nuevo' : 'lista')}
          variant={vista === 'nuevo' ? 'secondary' : 'primary'}>
          {vista === 'nuevo' ? '← Volver a lista' : '+ Nueva declaración'}
        </Button>
      </div>

      {vista === 'nuevo' ? (
        <Card title="Formulario de Salida/Admisión Temporal de Vehículo"
              subtitle="Formulario oficial Aduana Chile — Todos los campos marcados con * son obligatorios">
          <form
            onSubmit={handleSubmit(
              onSubmit,
              (errors) => {
                console.log('ERRORES VALIDACION:', errors);
              }
            )}
            className="space-y-8"
          >

            {/* Regla informativa */}
            <Alert tipo="info">
              <strong>Regla vigente:</strong> El plazo máximo de permanencia en el extranjero es de{' '}
              <strong>{esDiplomatico ? '90' : '180'} días corridos</strong>
              {esDiplomatico ? ' (vehículo diplomático)' : ''}. Superado este plazo sin retornar, el vehículo
              puede quedar sujeto a sanciones aduaneras.
            </Alert>

            {/* Sección 1: Titular */}
            <section>
              <h4 className="text-sm font-bold text-aduana-700 uppercase tracking-wide mb-3 pb-1 border-b border-aduana-100">
                1. Datos del Titular / Conductor
              </h4>
              <div className="flex gap-3">
                <Input
                  placeholder="Buscar por N° de documento (RUT / Pasaporte)"
                  value={busquedaPersona}
                  onChange={e => setBusquedaPersona(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), buscarPersona())}
                  className="flex-1"
                />
                <Button type="button" onClick={buscarPersona} loading={buscandoPersona} variant="secondary">
                  🔍 Buscar
                </Button>
              </div>
              {personaEncontrada && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
                  <p className="font-semibold text-green-800">
                    ✅ {personaEncontrada.nombres} {personaEncontrada.apellidos}
                  </p>
                  <p className="text-green-600 text-xs">
                    {personaEncontrada.tipoDocumento}: {personaEncontrada.numeroDocumento} — {personaEncontrada.nacionalidad}
                  </p>
                </div>
              )}
            </section>

            {/* Sección 2: Vehículo */}
            <section>
              <h4 className="text-sm font-bold text-aduana-700 uppercase tracking-wide mb-3 pb-1 border-b border-aduana-100">
                2. Datos del Vehículo
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField label="Patente" required error={errors.patente?.message}>
                  <Input
                    placeholder="ej: ABCD12"
                    {...register('patente', { required: 'La patente es obligatoria' })}
                    error={errors.patente}
                  />
                </FormField>

                <FormField label="Marca" required error={errors.marca?.message}>
                  <Input placeholder="ej: Toyota" {...register('marca', { required: 'Obligatorio' })} error={errors.marca} />
                </FormField>

                <FormField label="Modelo" required error={errors.modelo?.message}>
                  <Input placeholder="ej: Hilux" {...register('modelo', { required: 'Obligatorio' })} error={errors.modelo} />
                </FormField>

                <FormField label="Año" error={errors.anio?.message}>
                  <Input placeholder="ej: 2022" {...register('anio')} />
                </FormField>

                <FormField label="Tipo de Vehículo" required error={errors.tipoVehiculo?.message}>
                  <Select {...register('tipoVehiculo', { required: 'Obligatorio' })} error={errors.tipoVehiculo}>
                    <option value="">— Seleccione —</option>
                    {TIPOS_VEHICULO.map(t => <option key={t} value={t}>{t}</option>)}
                  </Select>
                </FormField>

                <FormField label="País de Matrícula" required error={errors.paisMatricula?.message}>
                  <Input
                    placeholder="ej: Chile"
                    {...register('paisMatricula', { required: 'Obligatorio' })}
                    error={errors.paisMatricula}
                  />
                </FormField>

                <FormField label="N° de Chasis">
                  <Input placeholder="Opcional" {...register('numeroChasis')} />
                </FormField>

                <FormField label="N° de Motor">
                  <Input placeholder="Opcional" {...register('numeroMotor')} />
                </FormField>
              </div>
            </section>

            {/* Sección 3: Cruce */}
            <section>
              <h4 className="text-sm font-bold text-aduana-700 uppercase tracking-wide mb-3 pb-1 border-b border-aduana-100">
                3. Datos del Cruce
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <FormField label="Tipo de Cruce" required>
                  <Select {...register('tipoCruce', { required: 'Obligatorio' })}>
                    <option value="SALIDA">SALIDA (Hacia Argentina)</option>
                    <option value="ENTRADA">ENTRADA (Retorno a Chile)</option>
                  </Select>
                </FormField>

                <FormField label="Fecha de Salida" required error={errors.fechaSalida?.message}>
                  <Input
                    type="date"
                    {...register('fechaSalida', { required: 'Obligatorio' })}
                    error={errors.fechaSalida}
                  />
                </FormField>

                <FormField
                  label="Fecha de Retorno Estimado"
                  help={`Máximo ${esDiplomatico ? '90' : '180'} días desde la salida`}>
                  <Input type="date" {...register('fechaRetornoEstimado')} />
                </FormField>

                <FormField label="¿Vehículo Diplomático?">
                  <label className="flex items-center gap-2 cursor-pointer mt-1">
                    <input type="checkbox" {...register('esDiplomatico')} className="w-4 h-4 accent-aduana-600" />
                    <span className="text-sm">Sí — Aplica plazo de 90 días</span>
                  </label>
                </FormField>
              </div>
            </section>

            <FormField label="Observaciones">
              <textarea
                className="w-full px-3 py-2 text-sm border border-aduana_gris-DEFAULT rounded-lg focus:border-aduana-500 focus:ring-1 focus:ring-aduana-200 outline-none resize-none"
                rows={3}
                placeholder="Observaciones adicionales..."
                {...register('observaciones')}
              />
            </FormField>

            <div className="flex gap-3 pt-2">
              <Button type="submit" loading={submitLoading}>
                💾 Registrar Declaración
              </Button>
              <Button type="button" variant="secondary" onClick={() => { reset(); setPersonaEncontrada(null); }}>
                Limpiar formulario
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        /* Lista */
        <Card title="Declaraciones de Vehículos" subtitle={`${declaraciones.length} registros`}>
          {loading ? <Spinner className="py-12" /> : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-aduana-600 text-white">
                  <tr>
                    {['Formulario', 'Patente', 'Titular', 'Fecha Salida', 'Límite Retorno', 'Estado', 'Acción'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-aduana_gris-DEFAULT">
                  {declaraciones.length === 0 ? (
                    <tr><td colSpan={7} className="py-10 text-center text-aduana_gris-medium">Sin declaraciones registradas</td></tr>
                  ) : declaraciones.map((d, i) => (
                    <tr key={d.id} className={i % 2 === 0 ? 'bg-white' : 'bg-aduana-50'}>
                      <td className="px-4 py-3 font-mono text-xs">{d.numeroFormulario}</td>
                      <td className="px-4 py-3 font-bold">{d.patente}</td>
                      <td className="px-4 py-3">{d.persona?.nombres} {d.persona?.apellidos}</td>
                      <td className="px-4 py-3">{d.fechaSalida}</td>
                      <td className={`px-4 py-3 font-medium ${d.estaVencido ? 'text-red-600' : d.estaProximoAVencer ? 'text-yellow-600' : ''}`}>
                        {d.fechaLimiteRetorno}
                        {d.estaVencido && ' ⚠️'}
                      </td>
                      <td className="px-4 py-3"><BadgeEstado estado={d.estado} /></td>
                      <td className="px-4 py-3">
                        {!d.fechaRetornoReal && d.estado === 'APROBADA' && (
                          <button
                            onClick={() => registrarRetorno(d.id)}
                            className="text-xs text-aduana-600 hover:text-aduana-800 underline font-medium"
                          >
                            Registrar retorno
                          </button>
                        )}
                        {d.fechaRetornoReal && (
                          <span className="text-xs text-green-600">✅ Retornó {d.fechaRetornoReal}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
