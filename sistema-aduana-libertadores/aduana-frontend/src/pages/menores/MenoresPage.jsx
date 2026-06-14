import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { menoresApi, personasApi } from '../../api/services';
import { Card, Button, BadgeEstado, Alert, FormField, Input, Select, Spinner } from '../../components/common';
import toast from 'react-hot-toast';

const SITUACIONES = [
  { value: 'SOLO',           label: 'Viaja SOLO (sin acompañante adulto)' },
  { value: 'CON_AMBOS_PADRES', label: 'Viaja con AMBOS padres/tutores' },
  { value: 'CON_UN_PADRE',   label: 'Viaja con UN solo padre/madre' },
  { value: 'CON_TUTOR_LEGAL', label: 'Viaja con TUTOR LEGAL' },
];

// Reglas según situación
const REQUIERE_NOTARIAL = {
  SOLO: true,
  CON_AMBOS_PADRES: false,
  CON_UN_PADRE: true,
  CON_TUTOR_LEGAL: true,
};

function BuscadorPersona({ label, onSeleccionar, requerido = false }) {
  const [doc, setDoc] = useState('');
  const [encontrada, setEncontrada] = useState(null);
  const [buscando, setBuscando] = useState(false);

  const buscar = async () => {
    if (!doc.trim()) return;
    setBuscando(true);
    try {
      const res = await personasApi.buscarPorDocumento(doc.trim());
      setEncontrada(res.data);
      onSeleccionar(res.data);
      toast.success('Persona encontrada');
    } catch {
      setEncontrada(null);
      onSeleccionar(null);
      toast.error('Persona no encontrada. Regístrela en el módulo de Personas.');
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-aduana-800">
        {label} {requerido && <span className="text-red-500">*</span>}
      </p>
      <div className="flex gap-2">
        <Input
          placeholder="N° de documento (RUT / Pasaporte)"
          value={doc}
          onChange={e => setDoc(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), buscar())}
          className="flex-1"
        />
        <Button type="button" onClick={buscar} loading={buscando} variant="secondary">
          🔍
        </Button>
      </div>
      {encontrada && (
        <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg text-sm">
          <p className="font-semibold text-green-800">
            ✅ {encontrada.nombres} {encontrada.apellidos}
          </p>
          <p className="text-green-600 text-xs">
            {encontrada.tipoDocumento}: {encontrada.numeroDocumento} — Edad: {encontrada.edad} años
            {encontrada.esMenorDeEdad !== undefined && (
              <span className={`ml-2 font-bold ${encontrada.esMenorDeEdad ? 'text-orange-600' : 'text-green-700'}`}>
                ({encontrada.esMenorDeEdad ? 'MENOR de edad' : 'MAYOR de edad'})
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

export default function MenoresPage() {
  const [vista, setVista] = useState('lista');
  const [declaraciones, setDeclaraciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [menorSeleccionado, setMenorSeleccionado] = useState(null);
  const [acompanianteSeleccionado, setAcompanianteSeleccionado] = useState(null);

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: { tipoCruce: 'SALIDA', tieneAutorizacionNotarial: false },
  });

  const situacionViaje = watch('situacionViaje');
  const requiereNotarial = REQUIERE_NOTARIAL[situacionViaje] ?? false;
  const tieneNotarial = watch('tieneAutorizacionNotarial');

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const res = await menoresApi.listar();
      setDeclaraciones(res.data);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (!menorSeleccionado) {
      toast.error('Debe buscar y seleccionar al menor de edad.');
      return;
    }
    if (requiereNotarial && !tieneNotarial) {
      toast.error('Para esta situación de viaje se requiere autorización notarial.');
      return;
    }

    setSubmitLoading(true);
    try {
      await menoresApi.registrar({
        ...data,
        menorId: menorSeleccionado.id,
        acompanianteId: acompanianteSeleccionado?.id ?? null,
        tieneAutorizacionNotarial: data.tieneAutorizacionNotarial === 'true' || data.tieneAutorizacionNotarial === true,
      });
      toast.success('Declaración de menor registrada correctamente.');
      reset();
      setMenorSeleccionado(null);
      setAcompanianteSeleccionado(null);
      setVista('lista');
      cargarDatos();
    } finally {
      setSubmitLoading(false);
    }
  };

  const cambiarEstado = async (id, estado) => {
    try {
      await menoresApi.actualizarEstado(id, estado, null);
      toast.success(`Estado actualizado a ${estado}`);
      cargarDatos();
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-aduana-800">👶 Menores de Edad</h2>
          <p className="text-sm text-aduana_gris-medium">
            Validación de autorizaciones notariales — Art. 49 Ley de Menores
          </p>
        </div>
        <Button
          onClick={() => setVista(vista === 'lista' ? 'nuevo' : 'lista')}
          variant={vista === 'nuevo' ? 'secondary' : 'primary'}
        >
          {vista === 'nuevo' ? '← Volver a lista' : '+ Nueva declaración'}
        </Button>
      </div>

      {vista === 'nuevo' ? (
        <Card
          title="Formulario de Control — Menor de Edad"
          subtitle="Chilenos y extranjeros menores de 18 años. Todos los campos * son obligatorios."
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

            {/* Regla legal */}
            <Alert tipo="warning">
              <strong>Marco legal vigente:</strong> Los menores de 18 años, chilenos o extranjeros, que salgan del
              país sin la compañía de ambos padres <strong>requieren autorización notarial</strong>. Si viaja con
              un solo padre/madre, se requiere la autorización notarial del otro progenitor.
            </Alert>

            {/* Sección 1: Menor */}
            <section>
              <h4 className="text-sm font-bold text-aduana-700 uppercase tracking-wide mb-3 pb-1 border-b border-aduana-100">
                1. Datos del Menor de Edad
              </h4>
              <BuscadorPersona
                label="Buscar menor por número de documento"
                onSeleccionar={setMenorSeleccionado}
                requerido
              />
            </section>

            {/* Sección 2: Situación de viaje */}
            <section>
              <h4 className="text-sm font-bold text-aduana-700 uppercase tracking-wide mb-3 pb-1 border-b border-aduana-100">
                2. Situación de Viaje
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Situación de viaje" required error={errors.situacionViaje?.message}>
                  <Select
                    {...register('situacionViaje', { required: 'Seleccione la situación' })}
                    error={errors.situacionViaje}
                  >
                    <option value="">— Seleccione —</option>
                    {SITUACIONES.map(s => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </Select>
                </FormField>

                <FormField label="Tipo de Cruce" required>
                  <Select {...register('tipoCruce', { required: true })}>
                    <option value="SALIDA">SALIDA (Sale del país)</option>
                    <option value="ENTRADA">ENTRADA (Regresa al país)</option>
                  </Select>
                </FormField>

                <FormField label="Fecha de viaje" required error={errors.fechaViaje?.message}>
                  <Input
                    type="date"
                    {...register('fechaViaje', { required: 'La fecha de viaje es obligatoria' })}
                    error={errors.fechaViaje}
                  />
                </FormField>

                <FormField label="País de destino" required error={errors.paisDestino?.message}>
                  <Input
                    placeholder="ej: Argentina"
                    {...register('paisDestino', { required: 'El país de destino es obligatorio' })}
                    error={errors.paisDestino}
                  />
                </FormField>
              </div>

              {/* Alerta dinámica según situación seleccionada */}
              {situacionViaje && (
                <div className="mt-3">
                  <Alert tipo={requiereNotarial ? 'warning' : 'success'}>
                    {requiereNotarial
                      ? <><strong>⚠️ Esta situación REQUIERE autorización notarial.</strong> Verifique que el documento sea válido y vigente.</>
                      : <><strong>✅ Esta situación NO requiere autorización notarial.</strong> Ambos padres presentes.</>
                    }
                  </Alert>
                </div>
              )}
            </section>

            {/* Sección 3: Acompañante (opcional según situación) */}
            {situacionViaje && situacionViaje !== 'SOLO' && (
              <section>
                <h4 className="text-sm font-bold text-aduana-700 uppercase tracking-wide mb-3 pb-1 border-b border-aduana-100">
                  3. Datos del Acompañante Adulto
                </h4>
                <BuscadorPersona
                  label="Buscar acompañante adulto (padre, madre o tutor)"
                  onSeleccionar={setAcompanianteSeleccionado}
                />
              </section>
            )}

            {/* Sección 4: Si viaja con un padre, datos del padre ausente */}
            {situacionViaje === 'CON_UN_PADRE' && (
              <section>
                <h4 className="text-sm font-bold text-aduana-700 uppercase tracking-wide mb-3 pb-1 border-b border-aduana-100">
                  4. Datos del Padre/Madre que NO Acompaña
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Nombre completo" required error={errors.padreNoAcompaniaNombre?.message}>
                    <Input
                      placeholder="Nombre completo del progenitor ausente"
                      {...register('padreNoAcompaniaNombre', {
                        required: situacionViaje === 'CON_UN_PADRE' ? 'Campo obligatorio' : false,
                      })}
                      error={errors.padreNoAcompaniaNombre}
                    />
                  </FormField>
                  <FormField label="RUT / Documento">
                    <Input
                      placeholder="RUT o número de documento"
                      {...register('padreNoAcompaniaRut')}
                    />
                  </FormField>
                </div>
              </section>
            )}

            {/* Sección 5: Autorización notarial (solo si se requiere) */}
            {requiereNotarial && (
              <section>
                <h4 className="text-sm font-bold text-aduana-700 uppercase tracking-wide mb-3 pb-1 border-b border-aduana-100">
                  {situacionViaje === 'CON_UN_PADRE' ? '5' : '4'}. Autorización Notarial
                </h4>

                <div className="mb-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('tieneAutorizacionNotarial')}
                      className="w-5 h-5 accent-aduana-600"
                    />
                    <span className="text-sm font-medium text-aduana-800">
                      El menor <strong>SÍ presenta</strong> autorización notarial válida
                    </span>
                  </label>
                </div>

                {tieneNotarial && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3 p-4 bg-aduana-50 rounded-lg border border-aduana-100">
                    <FormField label="Nombre de la Notaría" error={errors.notariaNombre?.message}>
                      <Input
                        placeholder="ej: Notaría de Santiago"
                        {...register('notariaNombre', {
                          required: tieneNotarial ? 'Ingrese el nombre de la notaría' : false,
                        })}
                        error={errors.notariaNombre}
                      />
                    </FormField>
                    <FormField label="Ciudad de la Notaría">
                      <Input placeholder="ej: Santiago" {...register('notariaCiudad')} />
                    </FormField>
                    <FormField label="N° de Escritura / Repertorio">
                      <Input placeholder="ej: 4521-2024" {...register('numeroEscritura')} />
                    </FormField>
                    <FormField label="Fecha de la autorización">
                      <Input type="date" {...register('fechaAutorizacion')} />
                    </FormField>
                  </div>
                )}

                {!tieneNotarial && (
                  <Alert tipo="error">
                    <strong>⛔ Impedimento de salida:</strong> Sin la autorización notarial, el menor
                    NO puede salir del país. Esta declaración quedará en estado RECHAZADA.
                  </Alert>
                )}
              </section>
            )}

            {/* Observaciones */}
            <FormField label="Observaciones del oficial">
              <textarea
                className="w-full px-3 py-2 text-sm border border-aduana_gris-DEFAULT rounded-lg focus:border-aduana-500 focus:ring-1 focus:ring-aduana-200 outline-none resize-none"
                rows={2}
                placeholder="Observaciones adicionales..."
                {...register('observaciones')}
              />
            </FormField>

            <div className="flex gap-3 pt-2 border-t border-aduana_gris-DEFAULT">
              <Button type="submit" loading={submitLoading}>
                💾 Registrar Declaración
              </Button>
              <Button type="button" variant="secondary" onClick={() => {
                reset();
                setMenorSeleccionado(null);
                setAcompanianteSeleccionado(null);
              }}>
                Limpiar
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        /* Lista */
        <Card
          title="Declaraciones de Menores"
          subtitle={`${declaraciones.length} registros totales`}
        >
          {loading ? <Spinner className="py-12" /> : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-aduana-600 text-white">
                  <tr>
                    {['ID', 'Menor', 'Edad', 'Situación', 'Notarial', 'Destino', 'Fecha Viaje', 'Estado', 'Acción'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-aduana_gris-DEFAULT">
                  {declaraciones.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-10 text-center text-aduana_gris-medium">
                        Sin declaraciones registradas
                      </td>
                    </tr>
                  ) : declaraciones.map((d, i) => (
                    <tr key={d.id} className={i % 2 === 0 ? 'bg-white' : 'bg-aduana-50'}>
                      <td className="px-4 py-3 font-mono text-xs">{d.id}</td>
                      <td className="px-4 py-3 font-medium">
                        {d.menor?.nombres} {d.menor?.apellidos}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-0.5 rounded-full">
                          {d.menor?.edad} años
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">{d.situacionViaje?.replace(/_/g, ' ')}</td>
                      <td className="px-4 py-3 text-center">
                        {d.requiereAutorizacionNotarial
                          ? (d.tieneAutorizacionNotarial ? '✅' : '❌')
                          : '—'}
                      </td>
                      <td className="px-4 py-3">{d.paisDestino}</td>
                      <td className="px-4 py-3">{d.fechaViaje}</td>
                      <td className="px-4 py-3"><BadgeEstado estado={d.estado} /></td>
                      <td className="px-4 py-3">
                        {d.estado === 'PENDIENTE' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => cambiarEstado(d.id, 'APROBADA')}
                              className="text-xs text-green-600 hover:text-green-800 font-semibold"
                            >
                              ✅ Aprobar
                            </button>
                            <button
                              onClick={() => cambiarEstado(d.id, 'RECHAZADA')}
                              className="text-xs text-red-600 hover:text-red-800 font-semibold"
                            >
                              ❌ Rechazar
                            </button>
                          </div>
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
