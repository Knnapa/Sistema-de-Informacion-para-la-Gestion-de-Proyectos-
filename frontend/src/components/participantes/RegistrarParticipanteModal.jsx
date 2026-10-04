import { useState } from 'react';
import Modal from '../common/Modal';
import FormularioBuilder from '../common/FormularioBuilder';
import { TIPOS_POBLACION } from '../../config/tiposPoblacion';
import { TIPOS_DOCUMENTO } from '../../config/tiposDocumento';
import { crearParticipante } from '../../api/participantes';
import './participantes-form.css';

// Registra un participante y lo vincula a un proyecto. Nombre, documento,
// tipo de poblacion y telefono son datos fijos del participante (se piden
// siempre). Ademas se le pueden agregar campos propios del participante
// (nombre + contenido, o un archivo) con el mismo constructor que usa
// Proyectos -- son del participante, no del proyecto al que se vincula.
export default function RegistrarParticipanteModal({ proyectos, onClose, onGuardado }) {
  const [proyectoId, setProyectoId] = useState('');
  const [nombre, setNombre] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState(TIPOS_DOCUMENTO[0].value);
  const [identificacion, setIdentificacion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tipoPoblacion, setTipoPoblacion] = useState('');
  const [campos, setCampos] = useState([]);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!proyectoId) {
      setError('Selecciona un proyecto.');
      return;
    }

    setGuardando(true);
    try {
      await crearParticipante({
        proyectoId,
        nombre,
        tipoDocumento,
        identificacion,
        telefono,
        tipoPoblacion: tipoPoblacion || null,
        camposPersonalizados: campos.map(({ id, ...resto }) => resto),
      });
      onGuardado();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo registrar el participante.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal title="Registrar participante" onClose={onClose} width={480}>
      <form onSubmit={handleSubmit}>
        <div className="modal-field">
          <label htmlFor="rp-proyecto">Proyecto</label>
          <select id="rp-proyecto" value={proyectoId} onChange={(e) => setProyectoId(e.target.value)} required>
            <option value="" disabled>
              Seleccionar
            </option>
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-field">
          <label htmlFor="rp-nombre">Nombre completo</label>
          <input id="rp-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>

        <div className="modal-field">
          <label htmlFor="rp-tipo-documento">Tipo de documento</label>
          <select
            id="rp-tipo-documento"
            value={tipoDocumento}
            onChange={(e) => setTipoDocumento(e.target.value)}
            required
          >
            {TIPOS_DOCUMENTO.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-field">
          <label htmlFor="rp-identificacion">Número de documento</label>
          <input
            id="rp-identificacion"
            value={identificacion}
            onChange={(e) => setIdentificacion(e.target.value)}
            required
          />
        </div>

        <div className="modal-field">
          <label htmlFor="rp-tipo">Tipo de población</label>
          <select id="rp-tipo" value={tipoPoblacion} onChange={(e) => setTipoPoblacion(e.target.value)}>
            <option value="">Seleccionar</option>
            {TIPOS_POBLACION.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-field">
          <label htmlFor="rp-telefono">Teléfono</label>
          <input id="rp-telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
        </div>

        <FormularioBuilder
          campos={campos}
          onChange={setCampos}
          titulo="Campos del participante"
          subtitulo="Información adicional de este participante (opcional)."
          tipos={['texto', 'archivo']}
        />

        {error && <div className="alert-error">{error}</div>}

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Registrar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
