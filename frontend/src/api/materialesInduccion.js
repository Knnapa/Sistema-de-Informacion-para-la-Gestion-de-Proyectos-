// Llamadas a la API del modulo de Induccion.
import api from './client';

export function listarMaterialesInduccion() {
  return api.get('/materiales-induccion').then((r) => r.data);
}

export function crearMaterialInduccion(datos) {
  return api.post('/materiales-induccion', datos).then((r) => r.data);
}

export function actualizarMaterialInduccion(id, datos) {
  return api.put(`/materiales-induccion/${id}`, datos).then((r) => r.data);
}

export function eliminarMaterialInduccion(id) {
  return api.delete(`/materiales-induccion/${id}`).then((r) => r.data);
}
