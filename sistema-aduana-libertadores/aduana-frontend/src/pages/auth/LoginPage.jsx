import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../../components/common';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');

    try {
      await login(data);
      navigate('/dashboard');
    } catch (err) {
      setServerError(
        'Credenciales incorrectas. Verifique su usuario y contraseña.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-aduana_gris-light">
      {/* Panel izquierdo institucional */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-aduana-700 p-12 text-white">
        <div>
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center">
              <span className="text-aduana-700 font-black">SNA</span>
            </div>

            <div>
              <p className="font-bold text-lg">Aduanas Chile</p>
              <p className="text-aduana-300 text-xs">
                Servicio Nacional de Aduanas
              </p>
            </div>
          </div>

          <h1 className="text-5xl font-extrabold leading-tight mb-4">
            Sistema Integrado de
            <br />
            Control Fronterizo
          </h1>

          <p className="text-aduana-200 text-xl leading-relaxed mb-8">
            Paso Los Libertadores
            <br />
            Chile — Argentina
          </p>

          <img
            src="/images/libertadores.jpg"
            alt="Paso Los Libertadores"
            className="w-full h-64 object-cover rounded-2xl shadow-lg border border-white/20"
          />
        </div>

        <div className="space-y-4">
          {[
            {
              icon: '🚗',
              text: 'Control de vehículos con validación de 180 días'
            },
            {
              icon: '👶',
              text: 'Verificación automática de autorizaciones de menores'
            },
            {
              icon: '🌿',
              text: 'Declaraciones SAG integradas con inspección'
            },
            {
              icon: '📊',
              text: 'Reportes estadísticos en tiempo real'
            }
          ].map((item) => (
            <div key={item.text} className="flex items-start gap-3">
              <span className="text-xl mt-0.5">{item.icon}</span>
              <p className="text-aduana-200 text-sm">{item.text}</p>
            </div>
          ))}
        </div>

        <p className="text-aduana-400 text-xs">
          © {new Date().getFullYear()} Gobierno de Chile — Uso exclusivo de
          funcionarios autorizados
        </p>
      </div>

      {/* Panel derecho */}
      <div className="flex-1 flex items-center justify-center p-12">
        <div className="w-full max-w-xl">
          {/* Logo móvil */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-aduana-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-xs">SNA</span>
            </div>

            <p className="font-bold text-aduana-800">Aduanas Chile</p>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-8">
            <h2 className="text-2xl font-bold text-aduana-800 mb-1">
              Iniciar Sesión
            </h2>

            <p className="text-sm text-aduana_gris-medium mb-8">
              Ingrese sus credenciales institucionales
            </p>

            {serverError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                ⚠️ {serverError}
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              {/* Usuario */}
              <div>
                <label className="block text-sm font-medium text-aduana-800 mb-1.5">
                  Usuario institucional{' '}
                  <span className="text-aduana_rojo">*</span>
                </label>

                <input
                  type="text"
                  autoComplete="username"
                  placeholder="ej: oficial.aduana"
                  className={`w-full px-4 py-2.5 text-sm border rounded-lg outline-none transition-all ${
                    errors.username
                      ? 'border-aduana_rojo focus:ring-1 focus:ring-red-300'
                      : 'border-aduana_gris-DEFAULT focus:border-aduana-500 focus:ring-1 focus:ring-aduana-200'
                  }`}
                  {...register('username', {
                    required: 'El usuario es obligatorio',
                    minLength: {
                      value: 4,
                      message: 'Mínimo 4 caracteres'
                    }
                  })}
                />

                {errors.username && (
                  <p className="text-xs text-aduana_rojo mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Contraseña */}
              <div>
                <label className="block text-sm font-medium text-aduana-800 mb-1.5">
                  Contraseña{' '}
                  <span className="text-aduana_rojo">*</span>
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className={`w-full px-4 py-2.5 pr-12 text-sm border rounded-lg outline-none transition-all ${
                      errors.password
                        ? 'border-aduana_rojo focus:ring-1 focus:ring-red-300'
                        : 'border-aduana_gris-DEFAULT focus:border-aduana-500 focus:ring-1 focus:ring-aduana-200'
                    }`}
                    {...register('password', {
                      required: 'La contraseña es obligatoria'
                    })}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>

                {errors.password && (
                  <p className="text-xs text-aduana_rojo mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Botón */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-aduana-600 hover:bg-aduana-700 text-white font-semibold rounded-xl transition-all hover:shadow-lg disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    Verificando...
                  </>
                ) : (
                  '🔐 Ingresar al Sistema'
                )}
              </button>
            </form>

            {/* Usuarios de desarrollo */}
            {import.meta.env.DEV && (
              <div className="mt-6 p-4 bg-aduana-50 rounded-lg border border-aduana-100">
                <p className="text-xs font-semibold text-aduana-700 mb-2">
                  👤 Usuarios de desarrollo
                </p>

                <div className="space-y-1 text-xs text-aduana-600 font-mono">
                  <p>admin / Admin2024!</p>
                  <p>oficial.aduana / Aduana2024!</p>
                  <p>oficial.pdi / Pdi2024!</p>
                  <p>oficial.sag / Sag2024!</p>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-aduana_gris-DEFAULT text-center text-xs text-aduana_gris-medium">
              Sistema Integrado de Control Fronterizo v1.0
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}