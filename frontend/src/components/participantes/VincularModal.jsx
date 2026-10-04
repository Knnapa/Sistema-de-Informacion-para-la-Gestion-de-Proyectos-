import { useState } from 'react';
import Modal from '../common/Modal';
import { vincularParticipante } from '../../api/participantes';
import './participantes-form.css';

// Vincula un participante YA EXISTENTE (encontrado con el buscador de la
// tabla) a otro proyecto. Solo pide el proyecto -- los datos fijos (nombre,
// documento...) ya existen, y el formulario de recoleccion del proyecto es
// informacion propia de ese proyecto, no algo que se vuelva a pedir aqui.
export default function VincularModal({ participante, proyectos, onClose, onGuardado }) {
  const [proyectoId, setProyectoId] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const yaVinculados = new Set(participante.proyectos.map((p) => p.id));
  const disponibles = proyectos.filter((p) => !yaVinculados.has(p.id));

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!proyectoId) {
      setError('Selecciona un proyecto.');
      return;
    }

    setGuardando(true);
    try {
      await vincularParticipante(participante.id, { proyectoId });
      onGuardado();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo vincular el participante.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal title={`Vincular a ${participante.nombre}`} onClose={onClose} width={420}>
      <form onSubmit={handleSubmit}>
        <div className="modal-field">
          <label htmlFor="v-proyecto">Proyecto</label>
          <select id="v-proyecto" value={proyectoId} onChange={(e) => setProyectoId(e.target.value)} required>
            <option value="" disabled>
              Seleccionar
            </option>
            {disponibles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        {disponibles.length === 0 && (
          <p className="participantes-form-subtitulo">Ya está vinculado a todos los proyectos existentes.</p>
        )}

        {error && <div className="alert-error">{error}</div>}

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={guardando || disponibles.length === 0}>
            {guardando ? 'Vinculando...' : 'Vincular'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
