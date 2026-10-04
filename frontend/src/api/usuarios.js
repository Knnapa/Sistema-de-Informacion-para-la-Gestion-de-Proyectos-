// Llamadas a la API del modulo de Administracion, en un solo lugar para
// que Usuarios.jsx no repita axios/manejo de rutas en cada funcion.
import api from './client';

export function listarUsuarios() {
  return api.get('/usuarios').then((r) => r.data);
}

export function crearUsuario(datos) {
  return api.post('/usuarios', datos).then((r) => r.data);
}

export function actualizarUsuario(id, datos) {
  return api.put(`/usuarios/${id}`, datos).then((r) => r.data);
}

export function desactivarUsuario(id) {
  return api.put(`/usuarios/${id}/desactivar`).then((r) => r.data);
}

export function activarUsuario(id) {
  return api.put(`/usuarios/${id}`, { activo: true }).then((r) => r.data);
}

export function restablecerPassword(id, nuevaPassword) {
  return api.put(`/usuarios/${id}/reset-password`, { nuevaPassword }).then((r) => r.data);
}

export function listarRegistroActividad() {
  return api.get('/usuarios/logs').then((r) => r.data);
}

export function listarPermisosUsuario(id) {
  return api.get(`/usuarios/${id}/permisos`).then((r) => r.data);
}

export function actualizarPermisosUsuario(id, permisos) {
  return api.put(`/usuarios/${id}/permisos`, { permisos }).then((r) => r.data);
}
