import apiClient from './apiClient';

// ── AUTH ─────────────────────────────────────────────────────────────────
export const authApi = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
};

// ── PERSONAS ──────────────────────────────────────────────────────────────
export const personasApi = {
  registrar:         (data) => apiClient.post('/personas', data),
  buscarPorId:       (id)   => apiClient.get(`/personas/${id}`),
  buscarPorDocumento:(num)  => apiClient.get(`/personas/documento/${num}`),
  buscar:            (q)    => apiClient.get('/personas/buscar', { params: { q } }),
  actualizar:        (id, data) => apiClient.put(`/personas/${id}`, data),
};

// ── VEHÍCULOS ─────────────────────────────────────────────────────────────
export const vehiculosApi = {
  registrar:          (data)        => apiClient.post('/vehiculos', data),
  listar:             ()            => apiClient.get('/vehiculos'),
  obtener:            (id)          => apiClient.get(`/vehiculos/${id}`),
  buscarPorPatente:   (patente)     => apiClient.get(`/vehiculos/patente/${patente}`),
  registrarRetorno:   (id, fecha)   => apiClient.patch(`/vehiculos/${id}/retorno`, null, { params: { fechaRetorno: fecha } }),
  obtenerVencidos:    ()            => apiClient.get('/vehiculos/vencidos'),
  obtenerProximosVencer: ()         => apiClient.get('/vehiculos/proximos-vencer'),
};

// ── MENORES ───────────────────────────────────────────────────────────────
export const menoresApi = {
  registrar:        (data)        => apiClient.post('/menores', data),
  listar:           ()            => apiClient.get('/menores'),
  obtener:          (id)          => apiClient.get(`/menores/${id}`),
  listarPendientes: ()            => apiClient.get('/menores/pendientes'),
  actualizarEstado: (id, estado, motivo) =>
    apiClient.patch(`/menores/${id}/estado`, { estado, motivo }),
};

// ── SAG ───────────────────────────────────────────────────────────────────
export const sagApi = {
  registrar:              (data) => apiClient.post('/sag', data),
  listar:                 ()     => apiClient.get('/sag'),
  obtener:                (id)   => apiClient.get(`/sag/${id}`),
  pendientesInspeccion:   ()     => apiClient.get('/sag/pendientes-inspeccion'),
  aprobar:                (id)   => apiClient.patch(`/sag/${id}/aprobar`),
  rechazar:               (id, motivo) => apiClient.patch(`/sag/${id}/rechazar`, { motivo }),
};

// ── REPORTES ──────────────────────────────────────────────────────────────
export const reportesApi = {
  dashboard:     (fecha)         => apiClient.get('/reportes/dashboard', { params: { fecha } }),
  exportarExcel: (desde, hasta)  =>
    apiClient.get('/reportes/cruces/excel', {
      params: { desde, hasta },
      responseType: 'blob',
    }),
  exportarPdf: (anio) =>
    apiClient.get('/reportes/estadistico/pdf', {
      params: { anio },
      responseType: 'blob',
    }),
};
