// Llamadas a la API del modulo de Participantes.
import api from './client';

export function listarParticipantes() {
  return api.get('/participantes').then((r) => r.data);
}

export function obtenerParticipante(id) {
  return api.get(`/participantes/${id}`).then((r) => r.data);
}

export function crearParticipante(datos) {
  return api.post('/participantes', datos).then((r) => r.data);
}

export function actualizarParticipante(id, datos) {
  return api.put(`/participantes/${id}`, datos).then((r) => r.data);
}

export function vincularParticipante(id, datos) {
  return api.post(`/participantes/${id}/vincular`, datos).then((r) => r.data);
}

export function desvincularParticipante(participanteId, proyectoId) {
  return api.delete(`/participantes/${participanteId}/proyectos/${proyectoId}`).then((r) => r.data);
}
