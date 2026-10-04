import { useState } from 'react';
import Modal from '../common/Modal';
import FormularioBuilder from '../common/FormularioBuilder';
import { TIPOS_POBLACION } from '../../config/tiposPoblacion';
import { TIPOS_DOCUMENTO } from '../../config/tiposDocumento';
import { actualizarParticipante } from '../../api/participantes';
import './participantes-form.css';

let contador = 0;
function idExistente() {
  contador += 1;
  return `campo-existente-${contador}`;
}

// Edita los datos fijos de un participante ya existente y sus campos
// personalizados (agregar, quitar o cambiar nombre/contenido/archivo).
export default function EditarParticipanteModal({ participante, onClose, onGuardado }) {
  const [nombre, setNombre] = useState(participante.nombre);
  const [tipoDocumento, setTipoDocumento] = useState(participante.tipoDocumento || TIPOS_DOCUMENTO[0].value);
  const [identificacion, setIdentificacion] = useState(participante.identificacion);
  const [telefono, setTelefono] = useState(participante.telefono || '');
  const [tipoPoblacion, setTipoPoblacion] = useState(participante.tipoPoblacion || '');
  const [campos, setCampos] = useState(() =>
    (participante.camposPersonalizados || []).map((c) => ({ ...c, id: idExistente() }))
  );
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setGuardando(true);
    try {
      await actualizarParticipante(participante.id, {
        nombre,
        tipoDocumento,
        identificacion,
        telefono,
        tipoPoblacion: tipoPoblacion || null,
        camposPersonalizados: campos.map(({ id, ...resto }) => resto),
      });
      onGuardado();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo guardar el participante.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal title="Editar participante" onClose={onClose} width={480}>
      <form onSubmit={handleSubmit}>
        <div className="modal-field">
          <label htmlFor="ep-nombre">Nombre completo</label>
          <input id="ep-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>

        <div className="modal-field">
          <label htmlFor="ep-tipo-documento">Tipo de documento</label>
          <select
            id="ep-tipo-documento"
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
          <label htmlFor="ep-identificacion">Número de documento</label>
          <input
            id="ep-identificacion"
            value={identificacion}
            onChange={(e) => setIdentificacion(e.target.value)}
            required
          />
        </div>

        <div className="modal-field">
          <label htmlFor="ep-tipo">Tipo de población</label>
          <select id="ep-tipo" value={tipoPoblacion} onChange={(e) => setTipoPoblacion(e.target.value)}>
            <option value="">Seleccionar</option>
            {TIPOS_POBLACION.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-field">
          <label htmlFor="ep-telefono">Teléfono</label>
          <input id="ep-telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
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
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
