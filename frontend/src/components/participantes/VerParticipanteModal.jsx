import { useState } from 'react';
import Modal from '../common/Modal';
import CamposValoresVisual from '../common/CamposValoresVisual';
import { tipoPoblacionLabel } from '../../config/tiposPoblacion';
import { tipoDocumentoLabel } from '../../config/tiposDocumento';
import { desvincularParticipante } from '../../api/participantes';
import { IconX, IconBriefcase } from '../icons/Icons';
import './VerParticipanteModal.css';

function formatearFecha(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Ficha completa de un participante, de solo lectura, en una ventana
// emergente (igual que Editar/Vincular -- no navega a otra pagina). Usa el
// mismo participante que ya viene cargado en la tabla de Participantes (con
// sus proyectos y camposPersonalizados incluidos), asi que no hace falta
// pedirlo de nuevo al backend.
export default function VerParticipanteModal({ participante, onClose, onCambios }) {
  const [desvinculando, setDesvinculando] = useState(null);
  const [error, setError] = useState('');

  async function handleDesvincular(proyecto) {
    if (!window.confirm(`¿Desvincular a ${participante.nombre} del proyecto "${proyecto.nombre}"?`)) return;
    setError('');
    setDesvinculando(proyecto.id);
    try {
      await desvincularParticipante(participante.id, proyecto.id);
      onCambios();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo desvincular al participante.');
    } finally {
      setDesvinculando(null);
    }
  }

  return (
    <Modal title="Información del participante" onClose={onClose} width={560}>
      <div className="ver-participante-seccion">
        <h3 className="ver-participante-titulo">Información personal</h3>
        <dl className="ver-participante-datos">
          <div>
            <dt>Nombre completo</dt>
            <dd>{participante.nombre}</dd>
          </div>
          <div>
            <dt>Tipo de documento</dt>
            <dd>{participante.tipoDocumento ? tipoDocumentoLabel(participante.tipoDocumento) : '—'}</dd>
          </div>
          <div>
            <dt>Documento</dt>
            <dd>{participante.identificacion}</dd>
          </div>
          <div>
            <dt>Teléfono</dt>
            <dd>{participante.telefono || '—'}</dd>
          </div>
          <div>
            <dt>Tipo de población</dt>
            <dd>{participante.tipoPoblacion ? tipoPoblacionLabel(participante.tipoPoblacion) : '—'}</dd>
          </div>
        </dl>
      </div>

      <div className="ver-participante-seccion">
        <h3 className="ver-participante-titulo">Información de registro</h3>
        <dl className="ver-participante-datos">
          <div>
            <dt>Fecha de registro</dt>
            <dd>{formatearFecha(participante.createdAt)}</dd>
          </div>
        </dl>
      </div>

      <div className="ver-participante-seccion">
        <h3 className="ver-participante-titulo">
          <IconBriefcase size={15} /> Proyectos ({participante.proyectos.length})
        </h3>
        {participante.proyectos.length === 0 ? (
          <p className="ver-participante-vacio">Todavía no está vinculado a ningún proyecto.</p>
        ) : (
          <ul className="ver-participante-proyectos">
            {participante.proyectos.map((pr) => (
              <li key={pr.id}>
                <span>{pr.nombre}</span>
                <button
                  type="button"
                  className="ver-participante-proyecto-quitar"
                  disabled={desvinculando === pr.id}
                  onClick={() => handleDesvincular(pr)}
                >
                  <IconX size={11} /> Desvincular
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="ver-participante-seccion ver-participante-seccion-ultima">
        <h3 className="ver-participante-titulo">Información adicional</h3>
        {participante.camposPersonalizados.length === 0 ? (
          <p className="ver-participante-vacio">Este participante todavía no tiene campos adicionales.</p>
        ) : (
          <CamposValoresVisual campos={participante.camposPersonalizados} />
        )}
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="modal-actions">
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </Modal>
  );
}
