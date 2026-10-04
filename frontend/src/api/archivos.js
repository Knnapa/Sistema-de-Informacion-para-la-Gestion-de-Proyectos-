// Subida/descarga de archivos para los campos tipo "archivo" del
// formulario de recoleccion de un proyecto.
import api from './client';

export function subirArchivo(file) {
  const formData = new FormData();
  formData.append('archivo', file);
  return api
    .post('/archivos', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((r) => r.data); // { archivo: nombreGuardado }
}

// Descarga el archivo y lo guarda con su nombre original (pasa por axios
// para que vaya con el token de sesion, luego se dispara la descarga en
// el navegador con un link temporal).
export async function descargarArchivo(archivo, nombreOriginal) {
  const response = await api.get(`/archivos/${encodeURIComponent(archivo)}`, {
    params: { nombre: nombreOriginal },
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = nombreOriginal || archivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

// Trae el archivo como una URL temporal de tipo blob, para reproducirlo
// (ej. <video src="...">) en vez de descargarlo. Pasa por axios igual que
// descargarArchivo para ir con el token de sesion; quien la use debe
// revocarla (window.URL.revokeObjectURL) cuando ya no la necesite.
export async function obtenerArchivoBlobUrl(archivo) {
  const response = await api.get(`/archivos/${encodeURIComponent(archivo)}`, {
    responseType: 'blob',
  });
  return window.URL.createObjectURL(new Blob([response.data]));
}
