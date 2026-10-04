import { useState } from 'react';
import Modal from '../common/Modal';
import { subirArchivo } from '../../api/archivos';
import { crearMaterialInduccion, actualizarMaterialInduccion } from '../../api/materialesInduccion';
import { CATEGORIAS_INDUCCION } from '../../config/induccion';
import { IconUpload } from '../icons/Icons';
import './MaterialFormModal.css';

// Subir/editar un material de Induccion. El archivo se sube de verdad al
// elegirlo (igual que un campo tipo "archivo" del formulario de
// recoleccion, ver FormularioBuilder) y despues se guarda la referencia
// junto con el titulo y la categoria.
export default function MaterialFormModal({ material, onClose, onGuardado }) {
  const editando = Boolean(material);

  const [titulo, setTitulo] = useState(material?.titulo || '');
  const [categoria, setCategoria] = useState(material?.categoria || CATEGORIAS_INDUCCION[0].value);
  const [archivoNuevo, setArchivoNuevo] = useState(null); // { archivo, nombreOriginal }
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function manejarArchivo(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setSubiendo(true);
    try {
      const { archivo } = await subirArchivo(file);
      setArchivoNuevo({ archivo, nombreOriginal: file.name });
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo subir el archivo.');
    } finally {
      setSubiendo(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!titulo.trim()) {
      setError('El título es obligatorio.');
      return;
    }
    if (!editando && !archivoNuevo) {
      setError('Debes subir un archivo.');
      return;
    }

    const payload = { titulo: titulo.trim(), categoria };
    if (archivoNuevo) {
      payload.archivo = archivoNuevo.archivo;
      payload.nombreOriginal = archivoNuevo.nombreOriginal;
    }

    setGuardando(true);
    try {
      if (editando) {
        await actualizarMaterialInduccion(material.id, payload);
      } else {
        await crearMaterialInduccion(payload);
      }
      onGuardado();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo guardar el material.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal title={editando ? 'Editar material' : 'Subir material'} onClose={onClose} width={440}>
      <form onSubmit={handleSubmit}>
        <div className="modal-field">
          <label htmlFor="mat-titulo">Título</label>
          <input
            id="mat-titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej. Reglamento de extensión 2026"
            required
            autoFocus
          />
        </div>

        <div className="modal-field">
          <label htmlFor="mat-categoria">Categoría</label>
          <select id="mat-categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            {CATEGORIAS_INDUCCION.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-field">
          <label>Archivo</label>
          <label className="material-form-subir">
            <IconUpload size={13} />
            {subiendo ? 'Subiendo...' : archivoNuevo ? 'Cambiar archivo' : 'Elegir archivo'}
            <input type="file" onChange={manejarArchivo} disabled={subiendo} hidden />
          </label>
          {archivoNuevo && <p className="material-form-hint">Archivo listo: {archivoNuevo.nombreOriginal}</p>}
          {!archivoNuevo && editando && (
            <p className="material-form-hint">Archivo actual: {material.nombreOriginal} (elige uno nuevo para reemplazarlo).</p>
          )}
        </div>

        {error && <div className="alert-error">{error}</div>}

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={guardando || subiendo}>
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
