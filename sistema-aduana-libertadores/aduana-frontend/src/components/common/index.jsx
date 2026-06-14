// ── Spinner ──────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div className={`${sizes[size]} border-4 border-aduana-200 border-t-aduana-600 rounded-full animate-spin`} />
    </div>
  );
}

// ── Badge de estado ───────────────────────────────────────────────────────
const badgeColors = {
  APROBADA:    'bg-green-100 text-green-800 border-green-200',
  PENDIENTE:   'bg-yellow-100 text-yellow-800 border-yellow-200',
  RECHAZADA:   'bg-red-100 text-red-800 border-red-200',
  EN_REVISION: 'bg-blue-100 text-blue-800 border-blue-200',
  EXPIRADA:    'bg-gray-100 text-gray-700 border-gray-200',
};

export function BadgeEstado({ estado }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeColors[estado] || 'bg-gray-100 text-gray-700'}`}>
      {estado}
    </span>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────
export function Card({ children, className = '', title, subtitle, actions }) {
  return (
    <div className={`bg-white rounded-xl shadow-card border border-aduana_gris-DEFAULT ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-aduana_gris-DEFAULT">
          <div>
            {title && <h3 className="text-base font-semibold text-aduana-800">{title}</h3>}
            {subtitle && <p className="text-xs text-aduana_gris-medium mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

// ── Botón ─────────────────────────────────────────────────────────────────
const btnVariants = {
  primary:   'bg-aduana-600 hover:bg-aduana-700 text-white shadow-sm',
  secondary: 'bg-white hover:bg-aduana-50 text-aduana-700 border border-aduana-300',
  danger:    'bg-aduana_rojo hover:bg-aduana_rojo-dark text-white shadow-sm',
  ghost:     'bg-transparent hover:bg-aduana-50 text-aduana-600',
};

export function Button({ children, variant = 'primary', loading = false, className = '', icon, ...props }) {
  return (
    <button
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-aduana-500 focus:ring-offset-1 ${btnVariants[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : icon}
      {children}
    </button>
  );
}

// ── Input ─────────────────────────────────────────────────────────────────
export function FormField({ label, error, required, children, help }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-aduana-800">
          {label}{required && <span className="text-aduana_rojo ml-1">*</span>}
        </label>
      )}
      {children}
      {help && !error && <p className="text-xs text-aduana_gris-medium">{help}</p>}
      {error && <p className="text-xs text-aduana_rojo">{error}</p>}
    </div>
  );
}

import React from 'react';

export const Input = React.forwardRef(
  ({ error, className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition-all
          ${error
            ? 'border-aduana_rojo focus:ring-1 focus:ring-aduana_rojo'
            : 'border-aduana_gris-DEFAULT focus:border-aduana-500 focus:ring-1 focus:ring-aduana-200'}
          disabled:bg-aduana_gris-light disabled:text-aduana_gris-medium ${className}`}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export const Select = React.forwardRef(
  ({ error, className = '', children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition-all bg-white
          ${error
            ? 'border-aduana_rojo focus:ring-1 focus:ring-aduana_rojo'
            : 'border-aduana_gris-DEFAULT focus:border-aduana-500 focus:ring-1 focus:ring-aduana-200'}
          ${className}`}
        {...props}
      >
        {children}
      </select>
    );
  }
);

Select.displayName = 'Select';

// ── Alerta informativa ────────────────────────────────────────────────────
export function Alert({ tipo = 'info', children }) {
  const estilos = {
    info:    'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error:   'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  };
  const icons = { info: 'ℹ️', warning: '⚠️', error: '❌', success: '✅' };
  return (
    <div className={`flex gap-2 p-3 rounded-lg border text-sm ${estilos[tipo]}`}>
      <span>{icons[tipo]}</span>
      <div>{children}</div>
    </div>
  );
}

// ── Tabla reutilizable ────────────────────────────────────────────────────
export function Table({ columns, data, loading, emptyMessage = 'Sin registros' }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-aduana_gris-DEFAULT">
      <table className="min-w-full text-sm">
        <thead className="bg-aduana-600 text-white">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left font-semibold whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-aduana_gris-DEFAULT">
          {loading ? (
            <tr><td colSpan={columns.length} className="py-12"><Spinner className="my-4" /></td></tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-10 text-center text-aduana_gris-medium">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.id || i} className={i % 2 === 0 ? 'bg-white' : 'bg-aduana-50'}>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3 whitespace-nowrap">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
