import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { obtenerParticipante, desvincularParticipante } from '../api/participantes';
import { listarProyectos } from '../api/proyectos';
import { tipoPoblacionLabel } from '../config/tiposPoblacion';
import CamposValoresVisual from '../components/common/CamposValoresVisual';
import EditarParticipanteModal from '../components/participantes/EditarParticipanteModal';
import VincularModal from '../components/participantes/VincularModal';
import { IconArrowLeft, IconEdit, IconLink, IconX, IconBriefcase } from '../components/icons/Icons';
import './ParticipanteDetalle.css';

function formatearFecha(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Pagina de detalle de un participante: ficha completa (datos personales,
// fecha de registro, proyectos a los que esta vinculado y sus campos
// personalizados). Calcada de ProyectoDetalle.jsx -- mismo layout de
// tarjetas, mismo boton de "Volver a..." y reutiliza los mismos modales que
// ya usa el listado de Participantes (Editar/Vincular).
export default function ParticipanteDetalle() {
  const { id } = useParams();

  const [participante, setParticipante] = useState(null);
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalEditar, setModalEditar] = useState(false);
  const [modalVincular, setModalVincular] = useState(false);
  const [desvinculando, setDesvinculando] = useState(null);

  async function cargar() {
    setCargando(true);
    setError('');
    try {
      const [p, pr] = await Promise.all([obtenerParticipante(id), listarProyectos()]);
      setParticipante(p);
      setProyectos(pr);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cargar el participante.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleDesvincular(proyecto) {
    if (!participante) return;
    if (!window.confirm(`¿Desvincular a ${participante.nombre} del proyecto "${proyecto.nombre}"?`)) return;
    setDesvinculando(proyecto.id);
    try {
      await desvincularParticipante(participante.id, proyecto.id);
      await cargar();
    } catch (err) {
      window.alert(err.response?.data?.error || 'No se pudo desvincular al participante.');
    } finally {
      setDesvinculando(null);
    }
  }

  if (cargando) return <p className="participante-detalle-empty">Cargando...</p>;
  if (error) return <div className="alert-error">{error}</div>;
  if (!participante) return null;

  return (
    <div className="participante-detalle">
      <Link to="/participantes" className="participante-detalle-volver">
        <IconArrowLeft size={16} /> Volver a Participantes
      </Link>

      <div className="participante-detalle-header">
        <div>
          <h1 className="participante-detalle-nombre">{participante.nombre}</h1>
          <p className="participante-detalle-subtitulo">
            Documento: {participante.identificacion}
            {participante.tipoPoblacion && ` · ${tipoPoblacionLabel(participante.tipoPoblacion)}`}
          </p>
        </div>

        <div className="participante-detalle-acciones">
          <button type="button" className="btn btn-secondary" onClick={() => setModalEditar(true)}>
            <IconEdit size={15} /> Editar
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => setModalVincular(true)}>
            <IconLink size={15} /> Vincular
          </button>
        </div>
      </div>

      <div className="participante-detalle-grid">
        <div className="participante-detalle-card">
          <h2 className="participante-detalle-card-title">Información personal</h2>
          <dl className="participante-detalle-datos">
            <div>
              <dt>Nombre completo</dt>
              <dd>{participante.nombre}</dd>
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

        <div className="participante-detalle-card">
          <h2 className="participante-detalle-card-title">Información de registro</h2>
          <dl className="participante-detalle-datos">
            <div>
              <dt>Fecha de registro</dt>
              <dd>{formatearFecha(participante.createdAt)}</dd>
            </div>
          </dl>
        </div>

        <div className="participante-detalle-card participante-detalle-card-full">
          <h2 className="participante-detalle-card-title">
            <IconBriefcase size={16} /> Proyectos ({participante.proyectos.length})
          </h2>
          {participante.proyectos.length === 0 ? (
            <p className="participante-detalle-vacio">Todavía no está vinculado a ningún proyecto.</p>
          ) : (
            <ul className="participante-detalle-proyectos">
              {participante.proyectos.map((pr) => (
                <li key={pr.id}>
                  <span className="participante-detalle-proyecto-nombre">{pr.nombre}</span>
                  <button
                    type="button"
                    className="participante-detalle-proyecto-quitar"
                    disabled={desvinculando === pr.id}
                    onClick={() => handleDesvincular(pr)}
                  >
                    <IconX size={12} /> Desvincular
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="participante-detalle-card participante-detalle-card-full">
          <h2 className="participante-detalle-card-title">Información adicional</h2>
          {participante.camposPersonalizados.length === 0 ? (
            <p className="participante-detalle-vacio">Este participante todavía no tiene campos adicionales.</p>
          ) : (
            <CamposValoresVisual campos={participante.camposPersonalizados} />
          )}
        </div>
      </div>

      {modalEditar && (
        <EditarParticipanteModal
          participante={participante}
          onClose={() => setModalEditar(false)}
          onGuardado={() => {
            setModalEditar(false);
            cargar();
          }}
        />
      )}

      {modalVincular && (
        <VincularModal
          participante={participante}
          proyectos={proyectos}
          onClose={() => setModalVincular(false)}
          onGuardado={() => {
            setModalVincular(false);
            cargar();
          }}
        />
      )}
    </div>
  );
}
