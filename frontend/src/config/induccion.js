// Categorias del material de Induccion (coinciden con el enum del backend)
// y utilidades para clasificar el archivo subido (PDF/Word/PPT/Video) a
// partir de su nombre, que es lo que decide el icono/color de la tarjeta y
// si la acción es "Descargar" o "Reproducir".
import { IconFileText, IconPresentation, IconPlayCircle } from '../components/icons/Icons';

export const CATEGORIAS_INDUCCION = [
  { value: 'normativa', label: 'Normativa' },
  { value: 'procedimientos', label: 'Procedimientos' },
  { value: 'bienvenida', label: 'Bienvenida' },
  { value: 'formatos', label: 'Formatos' },
];

export function categoriaInduccionLabel(value) {
  return CATEGORIAS_INDUCCION.find((c) => c.value === value)?.label || value;
}

const EXTENSIONES_VIDEO = ['mp4', 'mov', 'webm', 'avi', 'mkv', 'm4v'];
const EXTENSIONES_WORD = ['doc', 'docx'];
const EXTENSIONES_PPT = ['ppt', 'pptx'];

export function tipoArchivo(nombreOriginal = '') {
  const ext = nombreOriginal.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') return 'pdf';
  if (EXTENSIONES_WORD.includes(ext)) return 'word';
  if (EXTENSIONES_PPT.includes(ext)) return 'ppt';
  if (EXTENSIONES_VIDEO.includes(ext)) return 'video';
  return 'otro';
}

export const TIPO_ARCHIVO_INFO = {
  pdf: { label: 'PDF', icon: IconFileText, bg: '#fde9ea', fg: '#d5424f' },
  word: { label: 'Word', icon: IconFileText, bg: '#e7f0fb', fg: '#1d84f3' },
  ppt: { label: 'PPT', icon: IconPresentation, bg: '#fdf3e0', fg: '#d98b1f' },
  video: { label: 'Video', icon: IconPlayCircle, bg: '#fbe7f3', fg: '#c23b95' },
  otro: { label: 'Archivo', icon: IconFileText, bg: '#f1f2f4', fg: '#777777' },
};
