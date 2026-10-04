import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { obtenerProyecto, eliminarProyecto } from '../api/proyectos';
import { categoriaLabel } from '../config/categorias';
import { descargarArchivo } from '../api/archivos';
import Badge from '../components/common/Badge';
import CamposValoresVisual from '../components/common/CamposValoresVisual';
import ProyectoFormModal from '../components/proyectos/ProyectoFormModal';
import { IconArrowLeft, IconEdit, IconTrash, IconUsers, IconFileText } from '../components/icons/Icons';
import './ProyectoDetalle.css';

const PUEDE_EDITAR = ['administrador', 'lider'];

function formatearFecha(iso) {
  if (!iso) return '—';
  return new Date(`${iso}T00:00:00`).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

// Iniciales para el avatar del equipo de trabajo (primeras dos palabras del
// nombre), igual que los avatares de ejemplo del mockup ("Carlos Ramírez" -> "CR").
function iniciales(nombre) {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  return partes
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

// Boton de descarga de un archivo adjunto del proyecto. Tiene su propio
// estado de "descargando" (no se puede usar useState directo dentro de un map).
function ArchivoAdjuntoBoton({ archivo, nombreOriginal }) {
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState('');

  async function manejarClick() {
    setError('');
    setDescargando(true);
    try {
      await descargarArchivo(archivo, nombreOriginal);
    } catch (err) {
      setError('No se pudo descargar.');
    } finally {
      setDescargando(false);
    }
  }

  return (
    <div className="proyecto-detalle-archivo-wrap">
      <button type="button" className="proyecto-detalle-archivo" onClick={manejarClick} disabled={descargando}>
        <IconFileText size={14} />
        <span className="proyecto-detalle-archivo-nombre">
          {descargando ? 'Descargando...' : nombreOriginal || archivo}
        </span>
      </button>
      {error && <p className="proyecto-detalle-archivo-error">{error}</p>}
    </div>
  );
}

export default function ProyectoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const puedeEditar = PUEDE_EDITAR.includes(usuario.rol);

  const [proyecto, setProyecto] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalEditar, setModalEditar] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  async function cargar() {
    setCargando(true);
    setError('');
    try {
      setProyecto(await obtenerProyecto(id));
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo cargar el proyecto.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleEliminar() {
    if (!proyecto) return;
    if (!window.confirm(`¿Eliminar el proyecto "${proyecto.nombre}"? Esta acción no se puede deshacer.`)) return;
    setEliminando(true);
    try {
      await eliminarProyecto(proyecto.id);
      navigate('/proyectos');
    } catch (err) {
      window.alert(err.response?.data?.error || 'No se pudo eliminar el proyecto.');
      setEliminando(false);
    }
  }

  if (cargando) return <p className="proyecto-detalle-empty">Cargando...</p>;
  if (error) return <div className="alert-error">{error}</div>;
  if (!proyecto) return null;

  return (
    <div className="proyecto-detalle">
      <Link to="/proyectos" className="proyecto-detalle-volver">
        <IconArrowLeft size={16} /> Volver a Proyectos
      </Link>

      <div className="proyecto-detalle-header">
        <div>
          <div className="proyecto-detalle-top">
            <span className="proyecto-detalle-categoria">{categoriaLabel(proyecto.categoria)}</span>
            <Badge tone={proyecto.estado === 'activo' ? 'green' : 'gray'}>
              {proyecto.estado === 'activo' ? 'Activo' : 'Finalizado'}
            </Badge>
          </div>
          <h1 className="proyecto-detalle-nombre">{proyecto.nombre}</h1>
        </div>

        {puedeEditar && (
          <div className="proyecto-detalle-acciones">
            <button type="button" className="btn btn-secondary" onClick={() => setModalEditar(true)}>
              <IconEdit size={15} /> Editar
            </button>
            <button type="button" className="btn btn-danger" onClick={handleEliminar} disabled={eliminando}>
              <IconTrash size={15} /> {eliminando ? 'Eliminando...' : 'Eliminar'}
            </button>
          </div>
        )}
      </div>

      <div className="proyecto-detalle-grid">
        <div className="proyecto-detalle-card proyecto-detalle-card-span2">
          <h2 className="proyecto-detalle-card-title">Datos generales</h2>
          <p className="proyecto-detalle-descripcion">{proyecto.descripcion || 'Sin descripción todavía.'}</p>
          <div className="proyecto-detalle-datos-generales">
            <div>
              <span className="proyecto-detalle-dato-label">Inicio</span>
              <span className="proyecto-detalle-dato-valor">{formatearFecha(proyecto.fechaInicio)}</span>
            </div>
            <div>
              <span className="proyecto-detalle-dato-label">Fin</span>
              <span className="proyecto-detalle-dato-valor">{formatearFecha(proyecto.fechaFin)}</span>
            </div>
            <div>
              <span className="proyecto-detalle-dato-label">Participantes</span>
              <span className="proyecto-detalle-dato-valor">{proyecto.totalParticipantes}</span>
            </div>
          </div>
        </div>

        <div className="proyecto-detalle-card">
          <h2 className="proyecto-detalle-card-title">
            <IconUsers size={16} /> Equipo de trabajo ({proyecto.equipo.length})
          </h2>
          {proyecto.equipo.length === 0 ? (
            <p className="proyecto-detalle-vacio">Sin integrantes todavía.</p>
          ) : (
            <ul className="proyecto-detalle-equipo">
              {proyecto.equipo.map((u) => (
                <li key={u.id}>
                  <span className="proyecto-detalle-avatar">{iniciales(u.nombre)}</span>
                  <span className="proyecto-detalle-equipo-datos">
                    <span className="proyecto-detalle-equipo-nombre">{u.nombre}</span>
                    <span className="proyecto-detalle-equipo-correo">{u.correo}</span>
                  </span>
                  {/* El nivel de permiso solo se muestra a Administrador y
                      Lider -- un Co-lider o Estudiante ve el equipo pero no
                      quien puede editar o solo ver cada proyecto. */}
                  {puedeEditar && u.nivel === 'editar' && (
                    <Badge tone="blue">Puede editar</Badge>
                  )}
                  {puedeEditar && u.nivel === 'ver' && (
                    <Badge tone="gray">Puede ver</Badge>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="proyecto-detalle-card">
          <h2 className="proyecto-detalle-card-title">Cronograma</h2>
          {proyecto.cronograma.length === 0 ? (
            <p className="proyecto-detalle-vacio">Este proyecto todavía no tiene cronograma definido.</p>
          ) : (
            <ul className="proyecto-detalle-cronograma">
              {proyecto.cronograma.map((h, i) => (
                <li key={i}>
                  <span className="proyecto-detalle-cronograma-punto" />
                  <div>
                    <span className="proyecto-detalle-cronograma-titulo">{h.titulo}</span>
                    <span className="proyecto-detalle-cronograma-fecha">{formatearFecha(h.fecha)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="proyecto-detalle-card">
          <h2 className="proyecto-detalle-card-title">Participantes vinculados</h2>
          {proyecto.participantes.length === 0 ? (
            <p className="proyecto-detalle-vacio">Todavía no hay participantes vinculados.</p>
          ) : (
            <ul className="proyecto-detalle-participantes">
              {proyecto.participantes.map((p) => (
                <li key={p.id}>
                  <span className="proyecto-detalle-participante-nombre">{p.nombre}</span>
                  <span className="proyecto-detalle-participante-cc">CC {p.identificacion}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="proyecto-detalle-card">
          <h2 className="proyecto-detalle-card-title">Archivos adjuntos</h2>
          {proyecto.archivosAdjuntos.length === 0 ? (
            <p className="proyecto-detalle-vacio">Este proyecto todavía no tiene archivos adjuntos.</p>
          ) : (
            <div className="proyecto-detalle-archivos">
              {proyecto.archivosAdjuntos.map((a, i) => (
                <ArchivoAdjuntoBoton key={`${a.archivo}-${i}`} archivo={a.archivo} nombreOriginal={a.nombreOriginal} />
              ))}
            </div>
          )}
        </div>

        <div className="proyecto-detalle-card proyecto-detalle-card-full">
          <h2 className="proyecto-detalle-card-title">Formulario de recolección</h2>
          {proyecto.formulario.length === 0 ? (
            <p className="proyecto-detalle-vacio">Este proyecto todavía no tiene formulario definido.</p>
          ) : (
            <CamposValoresVisual campos={proyecto.formulario} />
          )}
        </div>
      </div>

      {modalEditar && (
        <ProyectoFormModal
          proyecto={proyecto}
          onClose={() => setModalEditar(false)}
          onGuardado={() => {
            setModalEditar(false);
            cargar();
          }}
        />
      )}
    </div>
  );
}
