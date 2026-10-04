import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listarProyectos } from '../api/proyectos';
import { categoriaLabel } from '../config/categorias';
import Badge from '../components/common/Badge';
import ProyectoFormModal from '../components/proyectos/ProyectoFormModal';
import { IconPlus, IconUsers, IconBriefcase } from '../components/icons/Icons';
import './Proyectos.css';

const PUEDE_EDITAR = ['administrador', 'lider'];

function formatearFecha(iso) {
  if (!iso) return '—';
  return new Date(`${iso}T00:00:00`).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export default function Proyectos() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const puedeCrear = PUEDE_EDITAR.includes(usuario.rol);

  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalNuevo, setModalNuevo] = useState(false);

  async function cargar() {
    setCargando(true);
    setError('');
    try {
      setProyectos(await listarProyectos());
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudieron cargar los proyectos.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div className="proyectos-page">
      <div className="proyectos-header">
        <div>
          <h1 className="proyectos-title">Proyectos</h1>
          <p className="proyectos-subtitle">Gestiona los proyectos de extensión</p>
        </div>
        {puedeCrear && (
          <button type="button" className="btn btn-primary" onClick={() => setModalNuevo(true)}>
            <IconPlus size={16} />
            Nuevo proyecto
          </button>
        )}
      </div>

      {error && <div className="alert-error">{error}</div>}

      {cargando ? (
        <p className="proyectos-empty">Cargando...</p>
      ) : proyectos.length === 0 ? (
        <div className="proyectos-empty-card">
          <IconBriefcase size={28} />
          <p>Todavía no hay proyectos registrados.</p>
          {puedeCrear && (
            <button type="button" className="btn btn-primary" onClick={() => setModalNuevo(true)}>
              Crear el primero
            </button>
          )}
        </div>
      ) : (
        <div className="proyectos-grid">
          {proyectos.map((p) => (
            <button type="button" key={p.id} className="proyecto-card" onClick={() => navigate(`/proyectos/${p.id}`)}>
              <div className="proyecto-card-top">
                <span className="proyecto-card-categoria">{categoriaLabel(p.categoria)}</span>
                <Badge tone={p.estado === 'activo' ? 'green' : 'gray'}>
                  {p.estado === 'activo' ? 'Activo' : 'Finalizado'}
                </Badge>
              </div>
              <h2 className="proyecto-card-nombre">{p.nombre}</h2>
              <p className="proyecto-card-fechas">
                {formatearFecha(p.fechaInicio)} → {formatearFecha(p.fechaFin)}
              </p>
              <p className="proyecto-card-meta">
                <IconUsers size={14} /> {p.equipo.length} en equipo · {p.totalParticipantes} participantes
              </p>
            </button>
          ))}
        </div>
      )}

      {modalNuevo && (
        <ProyectoFormModal
          onClose={() => setModalNuevo(false)}
          onGuardado={() => {
            setModalNuevo(false);
            cargar();
          }}
        />
      )}
    </div>
  );
}
