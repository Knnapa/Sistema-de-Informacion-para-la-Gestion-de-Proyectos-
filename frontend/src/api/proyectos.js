// Llamadas a la API del modulo de Proyectos, centralizadas aqui como ya se
// hizo en api/usuarios.js.
import api from './client';

export function listarProyectos() {
  return api.get('/proyectos').then((r) => r.data);
}

export function obtenerProyecto(id) {
  return api.get(`/proyectos/${id}`).then((r) => r.data);
}

export function crearProyecto(datos) {
  return api.post('/proyectos', datos).then((r) => r.data);
}

export function actualizarProyecto(id, datos) {
  return api.put(`/proyectos/${id}`, datos).then((r) => r.data);
}

export function eliminarProyecto(id) {
  return api.delete(`/proyectos/${id}`).then((r) => r.data);
}

export function listarUsuariosDisponibles() {
  return api.get('/proyectos/usuarios-disponibles').then((r) => r.data);
}
