import { useState } from 'react';
import { subirArchivo } from '../../api/archivos';
import { IconUpload, IconFileText, IconTrash } from '../icons/Icons';
import './ArchivosAdjuntosEditor.css';

// Archivos adjuntos generales del proyecto (no ligados a un campo del
// formulario de recoleccion). Se suben de verdad al elegirlos, igual que un
// campo tipo "archivo" (ver FormularioBuilder), y se guardan como
// { archivo, nombreOriginal } para poder descargarlos despues.
export default function ArchivosAdjuntosEditor({ archivos, onChange }) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState('');

  async function manejarArchivo(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite volver a elegir el mismo archivo despues
    if (!file) return;
    setError('');
    setSubiendo(true);
    try {
      const { archivo } = await subirArchivo(file);
      onChange([...archivos, { archivo, nombreOriginal: file.name }]);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo subir el archivo.');
    } finally {
      setSubiendo(false);
    }
  }

  function quitar(i) {
    onChange(archivos.filter((_, idx) => idx !== i));
  }

  return (
    <div className="archivos-adjuntos-editor">
      <label className="archivos-adjuntos-editor-label">Archivos adjuntos</label>
      <p className="archivos-adjuntos-editor-subtitulo">Documentos generales del proyecto (opcional).</p>

      {archivos.length > 0 && (
        <ul className="archivos-adjuntos-editor-lista">
          {archivos.map((a, i) => (
            <li key={`${a.archivo}-${i}`}>
              <span className="archivos-adjuntos-editor-nombre">
                <IconFileText size={14} /> {a.nombreOriginal}
              </span>
              <button
                type="button"
                className="icon-btn"
                title="Quitar archivo"
                onClick={() => quitar(i)}
              >
                <IconTrash size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <label className="archivos-adjuntos-editor-subir">
        <IconUpload size={13} /> {subiendo ? 'Subiendo...' : 'Agregar archivo'}
        <input type="file" onChange={manejarArchivo} disabled={subiendo} hidden />
      </label>
      {error && <p className="archivos-adjuntos-editor-error">{error}</p>}
    </div>
  );
}
