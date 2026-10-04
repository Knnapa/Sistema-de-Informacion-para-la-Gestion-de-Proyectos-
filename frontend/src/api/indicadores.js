// Llamadas a la API del modulo de Indicadores.
import api from './client';

export function listarIndicadores() {
  return api.get('/indicadores').then((r) => r.data);
}

export function listarCatalogoSistema() {
  return api.get('/indicadores/catalogo-sistema').then((r) => r.data);
}

export function crearIndicador(datos) {
  return api.post('/indicadores', datos).then((r) => r.data);
}

export function actualizarIndicador(id, datos) {
  return api.put(`/indicadores/${id}`, datos).then((r) => r.data);
}

export function eliminarIndicador(id) {
  return api.delete(`/indicadores/${id}`).then((r) => r.data);
}
