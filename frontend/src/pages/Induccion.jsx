import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { listarMaterialesInduccion, eliminarMaterialInduccion } from '../api/materialesInduccion';
import { descargarArchivo } from '../api/archivos';
import { CATEGORIAS_INDUCCION, categoriaInduccionLabel, tipoArchivo, TIPO_ARCHIVO_INFO } from '../config/induccion';
import MaterialFormModal from '../components/induccion/MaterialFormModal';
import VideoPlayerModal from '../components/induccion/VideoPlayerModal';
import { IconUpload, IconEdit, IconTrash, IconDownload, IconPlayCircle } from '../components/icons/Icons';
import './Induccion.css';

const PUEDE_EDITAR = ['administrador'];
const TODAS = 'todas';

function MaterialCard({ material, puedeEditar, onEditar, onEliminar, onReproducir }) {
  const tipo = tipoArchivo(material.nombreOriginal);
  const info = TIPO_ARCHIVO_INFO[tipo];
  const Icon = info.icon;
  const esVideo = tipo === 'video';

  return (
    <div className="material-card">
      <div className="material-card-icono" style={{ background: info.bg, color: info.fg }}>
        <Icon size={20} />
      </div>
      <h3 className="material-card-titulo">{material.titulo}</h3>
      <p className="material-card-meta">
        {categoriaInduccionLabel(material.categoria)} · {info.label}
      </p>
      <div className="material-card-acciones">
        {esVideo ? (
          <button type="button" className="material-card-accion" onClick={() => onReproducir(material)}>
            <IconPlayCircle size={14} /> Reproducir
          </button>
        ) : (
          <button
            type="button"
            className="material-card-accion"
            onClick={() => descargarArchivo(material.archivo, material.nombreOriginal)}
          >
            <IconDownload size={14} /> Descargar
          </button>
        )}
        {puedeEditar && (
          <>
            <button type="button" className="icon-btn" title="Editar" onClick={() => onEditar(material)}>
              <IconEdit size={15} />
            </button>
            <button type="button" className="icon-btn" title="Eliminar" onClick={() => onEliminar(material)}>
              <IconTrash size={15} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function Induccion() {
  const { usuario } = useAuth();
  const puedeEditar = PUEDE_EDITAR.includes(usuario.rol);

  const [materiales, setMateriales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [categoria, setCategoria] = useState(TODAS);

  const [modalNuevo, setModalNuevo] = useState(false);
  const [materialEditar, setMaterialEditar] = useState(null);
  const [materialReproducir, setMaterialReproducir] = useState(null);

  async function cargar() {
    setCargando(true);
    setError('');
    try {
      setMateriales(await listarMaterialesInduccion());
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudieron cargar los materiales.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  const filtrados = useMemo(() => {
    if (categoria === TODAS) return materiales;
    return materiales.filter((m) => m.categoria === categoria);
  }, [materiales, categoria]);

  async function handleEliminar(material) {
    if (!window.confirm(`¿Eliminar el material "${material.titulo}"?`)) return;
    try {
      await eliminarMaterialInduccion(material.id);
      cargar();
    } catch (err) {
      window.alert(err.response?.data?.error || 'No se pudo eliminar el material.');
    }
  }

  return (
    <div className="induccion-page">
      <div className="induccion-header">
        <div>
          <h1 className="induccion-title">Inducción</h1>
          <p className="induccion-subtitle">Materiales de bienvenida y formación del equipo</p>
        </div>
        {puedeEditar && (
          <button type="button" className="btn btn-primary" onClick={() => setModalNuevo(true)}>
            <IconUpload size={16} /> Subir material
          </button>
        )}
      </div>

      <div className="induccion-tabs">
        <button
          type="button"
          className={`induccion-tab${categoria === TODAS ? ' induccion-tab--active' : ''}`}
          onClick={() => setCategoria(TODAS)}
        >
          Todas
        </button>
        {CATEGORIAS_INDUCCION.map((c) => (
          <button
            type="button"
            key={c.value}
            className={`induccion-tab${categoria === c.value ? ' induccion-tab--active' : ''}`}
            onClick={() => setCategoria(c.value)}
          >
            {c.label}
          </button>
        ))}
      </div>

      {error && <div className="alert-error">{error}</div>}

      {cargando ? (
        <p className="induccion-vacio">Cargando...</p>
      ) : filtrados.length === 0 ? (
        <p className="induccion-vacio">
          {materiales.length === 0
            ? 'Todavía no hay materiales de inducción.'
            : 'Ningún material coincide con esta categoría.'}
        </p>
      ) : (
        <div className="induccion-grid">
          {filtrados.map((m) => (
            <MaterialCard
              key={m.id}
              material={m}
              puedeEditar={puedeEditar}
              onEditar={setMaterialEditar}
              onEliminar={handleEliminar}
              onReproducir={setMaterialReproducir}
            />
          ))}
        </div>
      )}

      {modalNuevo && (
        <MaterialFormModal
          onClose={() => setModalNuevo(false)}
          onGuardado={() => {
            setModalNuevo(false);
            cargar();
          }}
        />
      )}

      {materialEditar && (
        <MaterialFormModal
          material={materialEditar}
          onClose={() => setMaterialEditar(null)}
          onGuardado={() => {
            setMaterialEditar(null);
            cargar();
          }}
        />
      )}

      {materialReproducir && (
        <VideoPlayerModal material={materialReproducir} onClose={() => setMaterialReproducir(null)} />
      )}
    </div>
  );
}
