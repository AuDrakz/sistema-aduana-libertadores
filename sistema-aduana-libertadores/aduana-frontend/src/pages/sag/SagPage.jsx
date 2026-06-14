import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { sagApi, personasApi } from '../../api/services';
import { Card, Button, BadgeEstado, Alert, FormField, Input, Select, Spinner } from '../../components/common';
import toast from 'react-hot-toast';

function BuscadorPersona({ label, onSeleccionar }) {
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
    } catch {
      setEncontrada(null);
      onSeleccionar(null);
      toast.error('Persona no encontrada.');
    } finally {
      setBuscando(false);
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-aduana-800">{label} <span className="text-red-500">*</span></p>
      <div className="flex gap-2">
        <Input
          placeholder="N° de documento"
          value={doc}
          onChange={e => setDoc(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), buscar())}
          className="flex-1"
        />
        <Button type="button" onClick={buscar} loading={buscando} variant="secondary">🔍</Button>
      </div>
      {encontrada && (
        <div className="p-2.5 bg-green-50 border border-green-200 rounded-lg text-sm">
          <p className="font-semibold text-green-800">✅ {encontrada.nombres} {encontrada.apellidos}</p>
          <p className="text-xs text-green-600">
            {encontrada.tipoDocumento}: {encontrada.numeroDocumento}
            {encontrada.esMenorDeEdad && (
              <strong className="ml-2 text-orange-600">⚠️ MENOR DE EDAD — Se requiere representante</strong>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

export default function SagPage() {
  const [vista, setVista] = useState('lista');
  const [declaraciones, setDeclaraciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [personaSeleccionada, setPersonaSeleccionada] = useState(null);
  const [representanteSeleccionado, setRepresentanteSeleccionado] = useState(null);

  const { register, handleSubmit, watch, reset, control, formState: { errors } } = useForm({
    defaultValues: {
      tipoCruce: 'ENTRADA',
      declaraProductosAnimales: false,
      declaraProductosVegetales: false,
      declaraMascotas: false,
      mascotas: [],
    },
  });

  const { fields: mascotaFields, append: addMascota, remove: removeMascota } = useFieldArray({
    control,
    name: 'mascotas',
  });

  const declaraAnimales = watch('declaraProductosAnimales');
  const declaraVegetales = watch('declaraProductosVegetales');
  const declaraMascotas = watch('declaraMascotas');
  const esPersonaMenor = personaSeleccionada?.esMenorDeEdad;

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const res = await sagApi.listar();
      setDeclaraciones(res.data);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    if (!personaSeleccionada) {
      toast.error('Debe buscar y seleccionar al viajero.');
      return;
    }
    if (esPersonaMenor && !representanteSeleccionado) {
      toast.error('El viajero es menor de edad. Debe ingresar un representante mayor de 18 años.');
      return;
    }

    setSubmitLoading(true);
    try {
      await sagApi.registrar({
        ...data,
        personaId: personaSeleccionada.id,
        representanteId: representanteSeleccionado?.id ?? null,
        declaraProductosAnimales: Boolean(data.declaraProductosAnimales),
        declaraProductosVegetales: Boolean(data.declaraProductosVegetales),
        declaraMascotas: Boolean(data.declaraMascotas),
      });
      toast.success('Declaración SAG registrada correctamente.');
      reset();
      setPersonaSeleccionada(null);
      setRepresentanteSeleccionado(null);
      setVista('lista');
      cargarDatos();
    } finally {
      setSubmitLoading(false);
    }
  };

  const aprobar = async (id) => {
    try {
      await sagApi.aprobar(id);
      toast.success('Declaración aprobada.');
      cargarDatos();
    } catch {}
  };

  const rechazar = async (id) => {
    const motivo = window.prompt('Ingrese el motivo del rechazo:');
    if (!motivo) return;
    try {
      await sagApi.rechazar(id, motivo);
      toast.success('Declaración rechazada.');
      cargarDatos();
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-aduana-800">🌿 SAG — Declaración Jurada</h2>
          <p className="text-sm text-aduana_gris-medium">
            Servicio Agrícola y Ganadero — Ingreso de alimentos, productos y mascotas
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
          title="Declaración Jurada SAG"
          subtitle="Debe ser firmada por mayores de 18 años o su representante legal"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

            <Alert tipo="info">
              <strong>Obligatoriedad:</strong> Todo viajero que ingrese al país con productos de origen animal,
              vegetal o con mascotas <strong>DEBE completar esta declaración jurada</strong>, independiente
              de la cantidad. El incumplimiento puede derivar en sanciones y decomiso de los productos.
            </Alert>

            {/* Sección 1: Viajero */}
            <section>
              <h4 className="text-sm font-bold text-aduana-700 uppercase tracking-wide mb-3 pb-1 border-b border-aduana-100">
                1. Datos del Declarante
              </h4>
              <BuscadorPersona
                label="Buscar viajero declarante"
                onSeleccionar={setPersonaSeleccionada}
              />

              {esPersonaMenor && (
                <div className="mt-4">
                  <Alert tipo="warning">
                    ⚠️ El viajero es <strong>menor de edad</strong>. Un representante mayor de 18 años
                    debe firmar la declaración.
                  </Alert>
                  <div className="mt-3">
                    <BuscadorPersona
                      label="Representante (mayor de 18 años que firma)"
                      onSeleccionar={setRepresentanteSeleccionado}
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Sección 2: Tipo cruce y fecha */}
            <section>
              <h4 className="text-sm font-bold text-aduana-700 uppercase tracking-wide mb-3 pb-1 border-b border-aduana-100">
                2. Datos del Cruce
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Tipo de Cruce" required>
                  <Select {...register('tipoCruce', { required: true })}>
                    <option value="ENTRADA">ENTRADA (Ingresa a Chile)</option>
                    <option value="SALIDA">SALIDA (Sale de Chile)</option>
                  </Select>
                </FormField>
                <FormField label="Fecha de Declaración" required error={errors.fechaDeclaracion?.message}>
                  <Input
                    type="date"
                    {...register('fechaDeclaracion', { required: 'La fecha es obligatoria' })}
                    error={errors.fechaDeclaracion}
                  />
                </FormField>
              </div>
            </section>

            {/* Sección 3: Declaración de productos */}
            <section>
              <h4 className="text-sm font-bold text-aduana-700 uppercase tracking-wide mb-3 pb-1 border-b border-aduana-100">
                3. ¿Qué transporta? (marque todo lo que aplique)
              </h4>

              <div className="space-y-4">
                {/* Productos animales */}
                <div className="p-4 border border-aduana_gris-DEFAULT rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('declaraProductosAnimales')}
                      className="w-5 h-5 accent-aduana-600"
                    />
                    <div>
                      <span className="font-medium text-aduana-800">🥩 Productos de Origen Animal</span>
                      <p className="text-xs text-aduana_gris-medium">
                        Carnes, embutidos, lácteos, huevos, miel, lana, cueros, etc.
                      </p>
                    </div>
                  </label>
                  {declaraAnimales && (
                    <div className="mt-3 ml-8">
                      <FormField
                        label="Descripción detallada"
                        required
                        error={errors.descripcionProductosAnimales?.message}
                      >
                        <textarea
                          className="w-full px-3 py-2 text-sm border border-aduana_gris-DEFAULT rounded-lg focus:border-aduana-500 focus:ring-1 focus:ring-aduana-200 outline-none resize-none"
                          rows={2}
                          placeholder="Ej: 2 kg de queso, 500g de jamón cocido..."
                          {...register('descripcionProductosAnimales', {
                            required: declaraAnimales ? 'Debe describir los productos' : false,
                          })}
                        />
                        {errors.descripcionProductosAnimales && (
                          <p className="text-xs text-red-500 mt-1">
                            {errors.descripcionProductosAnimales.message}
                          </p>
                        )}
                      </FormField>
                    </div>
                  )}
                </div>

                {/* Productos vegetales */}
                <div className="p-4 border border-aduana_gris-DEFAULT rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('declaraProductosVegetales')}
                      className="w-5 h-5 accent-aduana-600"
                    />
                    <div>
                      <span className="font-medium text-aduana-800">🥦 Productos de Origen Vegetal</span>
                      <p className="text-xs text-aduana_gris-medium">
                        Frutas, verduras, semillas, plantas, flores, granos, etc.
                      </p>
                    </div>
                  </label>
                  {declaraVegetales && (
                    <div className="mt-3 ml-8">
                      <FormField label="Descripción detallada">
                        <textarea
                          className="w-full px-3 py-2 text-sm border border-aduana_gris-DEFAULT rounded-lg focus:border-aduana-500 outline-none resize-none"
                          rows={2}
                          placeholder="Ej: 3 manzanas, 1 atado de cilantro..."
                          {...register('descripcionProductosVegetales')}
                        />
                      </FormField>
                    </div>
                  )}
                </div>

                {/* Mascotas */}
                <div className="p-4 border border-aduana_gris-DEFAULT rounded-lg">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('declaraMascotas')}
                      className="w-5 h-5 accent-aduana-600"
                    />
                    <div>
                      <span className="font-medium text-aduana-800">🐾 Mascotas / Animales Vivos</span>
                      <p className="text-xs text-aduana_gris-medium">
                        Perros, gatos, aves, roedores u otros animales de compañía.
                      </p>
                    </div>
                  </label>

                  {declaraMascotas && (
                    <div className="mt-4 ml-4 space-y-4">
                      {mascotaFields.map((field, index) => (
                        <div key={field.id} className="p-3 bg-aduana-50 border border-aduana-100 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-semibold text-aduana-700">
                              Mascota #{index + 1}
                            </p>
                            <button
                              type="button"
                              onClick={() => removeMascota(index)}
                              className="text-xs text-red-500 hover:text-red-700"
                            >
                              ✕ Eliminar
                            </button>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <FormField label="Especie" required>
                              <Input
                                placeholder="ej: Perro"
                                {...register(`mascotas.${index}.especie`, { required: true })}
                              />
                            </FormField>
                            <FormField label="Raza">
                              <Input placeholder="ej: Labrador" {...register(`mascotas.${index}.raza`)} />
                            </FormField>
                            <FormField label="Nombre de la mascota" required>
                              <Input
                                placeholder="ej: Max"
                                {...register(`mascotas.${index}.nombreMascota`, { required: true })}
                              />
                            </FormField>
                            <FormField label="Microchip (N°)">
                              <Input placeholder="Opcional" {...register(`mascotas.${index}.microchip`)} />
                            </FormField>
                            <FormField label="N° Certificado Sanitario">
                              <Input {...register(`mascotas.${index}.numeroCertificado`)} />
                            </FormField>
                          </div>
                          <div className="flex gap-6 mt-3">
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                {...register(`mascotas.${index}.tieneVacunaAntirabica`)}
                                className="accent-aduana-600"
                              />
                              Vacuna antirrábica vigente
                            </label>
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                {...register(`mascotas.${index}.tieneCertificadoSalud`)}
                                className="accent-aduana-600"
                              />
                              Certificado de salud
                            </label>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addMascota({
                          especie: '', raza: '', nombreMascota: '',
                          microchip: '', tieneVacunaAntirabica: false,
                          tieneCertificadoSalud: false, numeroCertificado: '',
                        })}
                        className="flex items-center gap-2 text-sm text-aduana-600 hover:text-aduana-800 font-medium border border-dashed border-aduana-300 rounded-lg px-4 py-2 w-full justify-center hover:bg-aduana-50 transition-all"
                      >
                        + Agregar mascota
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* No declara nada */}
              {!declaraAnimales && !declaraVegetales && !declaraMascotas && (
                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
                  ℹ️ Si no transporta ninguno de los productos anteriores, marque esta declaración como
                  <strong> SIN PRODUCTOS A DECLARAR</strong>.
                </div>
              )}
            </section>

            <FormField label="Observaciones del oficial SAG">
              <textarea
                className="w-full px-3 py-2 text-sm border border-aduana_gris-DEFAULT rounded-lg focus:border-aduana-500 outline-none resize-none"
                rows={2}
                placeholder="Observaciones..."
                {...register('observaciones')}
              />
            </FormField>

            <div className="flex gap-3 pt-2 border-t border-aduana_gris-DEFAULT">
              <Button type="submit" loading={submitLoading}>💾 Registrar Declaración</Button>
              <Button type="button" variant="secondary" onClick={() => {
                reset();
                setPersonaSeleccionada(null);
                setRepresentanteSeleccionado(null);
              }}>
                Limpiar
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Card title="Declaraciones SAG" subtitle={`${declaraciones.length} registros`}>
          {loading ? <Spinner className="py-12" /> : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-aduana-600 text-white">
                  <tr>
                    {['N° Declaración', 'Declarante', 'Cruce', 'Fecha', 'Productos', 'Inspección', 'Estado', 'Acciones'].map(h => (
                      <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-aduana_gris-DEFAULT">
                  {declaraciones.length === 0 ? (
                    <tr><td colSpan={8} className="py-10 text-center text-aduana_gris-medium">Sin declaraciones</td></tr>
                  ) : declaraciones.map((d, i) => (
                    <tr key={d.id} className={i % 2 === 0 ? 'bg-white' : 'bg-aduana-50'}>
                      <td className="px-4 py-3 font-mono text-xs">{d.numeroDeclaracion}</td>
                      <td className="px-4 py-3 font-medium">
                        {d.persona?.nombres} {d.persona?.apellidos}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          d.tipoCruce === 'ENTRADA'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {d.tipoCruce}
                        </span>
                      </td>
                      <td className="px-4 py-3">{d.fechaDeclaracion}</td>
                      <td className="px-4 py-3 text-xs space-x-1">
                        {d.declaraProductosAnimales && <span title="Animales">🥩</span>}
                        {d.declaraProductosVegetales && <span title="Vegetales">🥦</span>}
                        {d.declaraMascotas && <span title="Mascotas">🐾</span>}
                        {!d.declaraProductosAnimales && !d.declaraProductosVegetales && !d.declaraMascotas && (
                          <span className="text-aduana_gris-medium">Sin productos</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {d.requiereInspeccion
                          ? <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-0.5 rounded-full">⚠️ Sí</span>
                          : <span className="text-aduana_gris-medium text-xs">No</span>}
                      </td>
                      <td className="px-4 py-3"><BadgeEstado estado={d.estado} /></td>
                      <td className="px-4 py-3">
                        {d.estado === 'PENDIENTE' && (
                          <div className="flex gap-2">
                            <button onClick={() => aprobar(d.id)} className="text-xs text-green-600 hover:text-green-800 font-semibold">✅</button>
                            <button onClick={() => rechazar(d.id)} className="text-xs text-red-600 hover:text-red-800 font-semibold">❌</button>
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
