import { useEffect, useMemo, useState } from 'react';
import { listarParticipantes, desvincularParticipante } from '../api/participantes';
import { listarProyectos } from '../api/proyectos';
import RegistrarParticipanteModal from '../components/participantes/RegistrarParticipanteModal';
import EditarParticipanteModal from '../components/participantes/EditarParticipanteModal';
import VincularModal from '../components/participantes/VincularModal';
import VerParticipanteModal from '../components/participantes/VerParticipanteModal';
import { IconPlus, IconSearch, IconLink, IconEdit, IconX } from '../components/icons/Icons';
import './Participantes.css';

function formatearFecha(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export default function Participantes() {
  const [participantes, setParticipantes] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [modalRegistrar, setModalRegistrar] = useState(false);
  const [participanteEditar, setParticipanteEditar] = useState(null);
  const [participanteVincular, setParticipanteVincular] = useState(null);
  const [participanteVerId, setParticipanteVerId] = useState(null);
  const [desvinculando, setDesvinculando] = useState(null);

  // Se recalcula de la lista ya cargada (en vez de guardar una copia aparte)
  // para que, si se desvincula un proyecto desde el modal de "Ver", la ficha
  // se actualice sola apenas termina de recargar.
  const participanteVer = participantes.find((p) => p.id === participanteVerId) || null;

  async function cargar() {
    setCargando(true);
    setError('');
    try {
      const [p, pr] = await Promise.all([listarParticipantes(), listarProyectos()]);
      setParticipantes(p);
      setProyectos(pr);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudieron cargar los participantes.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return participantes;
    return participantes.filter(
      (p) => p.nombre.toLowerCase().includes(q) || p.identificacion.toLowerCase().includes(q)
    );
  }, [participantes, busqueda]);

  async function handleDesvincular(participante, proyecto) {
    if (!window.confirm(`¿Desvincular a ${participante.nombre} del proyecto "${proyecto.nombre}"?`)) return;
    setDesvinculando(`${participante.id}-${proyecto.id}`);
    try {
      await desvincularParticipante(participante.id, proyecto.id);
      await cargar();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo desvincular al participante.');
    } finally {
      setDesvinculando(null);
    }
  }

  return (
    <div className="participantes-page">
      <div className="participantes-header">
        <div>
          <h1 className="participantes-title">Participantes</h1>
          <p className="participantes-subtitle">Beneficiarios registrados en los proyectos</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setModalRegistrar(true)}
          disabled={proyectos.length === 0}
          title={proyectos.length === 0 ? 'Primero crea un proyecto en el módulo de Proyectos' : undefined}
        >
          <IconPlus size={16} />
          Registrar participante
        </button>
      </div>

      <div className="participantes-buscador">
        <IconSearch size={16} />
        <input
          placeholder="Buscar por nombre o identificación para vincular a un proyecto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="participantes-card">
        {cargando ? (
          <p className="participantes-empty">Cargando...</p>
        ) : filtrados.length === 0 ? (
          <p className="participantes-empty">
            {participantes.length === 0
              ? 'Todavía no hay participantes registrados.'
              : 'Ningún participante coincide con la búsqueda.'}
          </p>
        ) : (
          <table className="participantes-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Documento</th>
                <th>Teléfono</th>
                <th>Proyecto(s)</th>
                <th>Fecha de registro</th>
                <th className="participantes-th-acciones">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => (
                <tr
                  key={p.id}
                  className="participantes-fila-clickeable"
                  onClick={() => setParticipanteVerId(p.id)}
                >
                  <td className="participantes-nombre">{p.nombre}</td>
                  <td>
                    {p.tipoDocumento ? `${p.tipoDocumento} ` : ''}
                    {p.identificacion}
                  </td>
                  <td>{p.telefono || '—'}</td>
                  <td>
                    <div className="participantes-badges">
                      {p.proyectos.map((pr) => (
                        <span className="participantes-badge" key={pr.id}>
                          {pr.nombre}
                          <button
                            type="button"
                            className="participantes-badge-quitar"
                            title={`Desvincular de ${pr.nombre}`}
                            disabled={desvinculando === `${p.id}-${pr.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDesvincular(p, pr);
                            }}
                          >
                            <IconX size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{formatearFecha(p.createdAt)}</td>
                  <td className="participantes-th-acciones">
                    <div className="participantes-acciones">
                      <button
                        type="button"
                        className="btn btn-secondary participantes-vincular-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setParticipanteEditar(p);
                        }}
                      >
                        <IconEdit size={14} /> Editar
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary participantes-vincular-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setParticipanteVincular(p);
                        }}
                      >
                        <IconLink size={14} /> Vincular
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalRegistrar && (
        <RegistrarParticipanteModal
          proyectos={proyectos}
          onClose={() => setModalRegistrar(false)}
          onGuardado={() => {
            setModalRegistrar(false);
            cargar();
          }}
        />
      )}

      {participanteEditar && (
        <EditarParticipanteModal
          participante={participanteEditar}
          onClose={() => setParticipanteEditar(null)}
          onGuardado={() => {
            setParticipanteEditar(null);
            cargar();
          }}
        />
      )}

      {participanteVincular && (
        <VincularModal
          participante={participanteVincular}
          proyectos={proyectos}
          onClose={() => setParticipanteVincular(null)}
          onGuardado={() => {
            setParticipanteVincular(null);
            cargar();
          }}
        />
      )}

      {participanteVer && (
        <VerParticipanteModal
          participante={participanteVer}
          onClose={() => setParticipanteVerId(null)}
          onCambios={cargar}
        />
      )}
    </div>
  );
}
