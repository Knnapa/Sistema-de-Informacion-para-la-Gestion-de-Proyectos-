import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import { listarProyectos } from '../../api/proyectos';
import { listarPermisosUsuario, actualizarPermisosUsuario } from '../../api/usuarios';
import './PermisosProyectosModal.css';

const SIN_ACCESO = 'sin_acceso';

// Permisos de proyectos de un usuario: por cada proyecto, "Sin acceso",
// "Puede ver" o "Puede editar". Esto es ADEMAS de lo que ya le da su rol
// global (Administrador y Lider siguen viendo/editando todo sin importar lo
// que se elija aqui) -- sirve para darle acceso puntual a un proyecto a un
// Estudiante o Co-lider, sin cambiar su rol ni afectar a los demas.
export default function PermisosProyectosModal({ usuario, onClose, onGuardado }) {
  const [proyectos, setProyectos] = useState([]);
  const [seleccion, setSeleccion] = useState({}); // { [proyectoId]: 'ver' | 'editar' | 'sin_acceso' }
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      setError('');
      try {
        const [listaProyectos, permisos] = await Promise.all([
          listarProyectos(),
          listarPermisosUsuario(usuario.id),
        ]);
        setProyectos(listaProyectos);
        const base = {};
        permisos.forEach((p) => {
          base[p.proyectoId] = p.nivel;
        });
        setSeleccion(base);
      } catch (err) {
        setError(err.response?.data?.error || 'No se pudieron cargar los permisos.');
      } finally {
        setCargando(false);
      }
    }
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario.id]);

  function cambiarNivel(proyectoId, nivel) {
    setSeleccion((prev) => ({ ...prev, [proyectoId]: nivel }));
  }

  async function handleGuardar() {
    setError('');
    const permisos = Object.entries(seleccion)
      .filter(([, nivel]) => nivel === 'ver' || nivel === 'editar')
      .map(([proyectoId, nivel]) => ({ proyectoId: Number(proyectoId), nivel }));

    setGuardando(true);
    try {
      await actualizarPermisosUsuario(usuario.id, permisos);
      onGuardado();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudieron guardar los permisos.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal title={`Permisos de proyectos — ${usuario.nombre}`} onClose={onClose} width={520}>
      <p className="permisos-proyectos-hint">
        Esto es además de lo que ya le da su rol ({usuario.rol}): Administrador y Líder siguen viendo y
        editando todos los proyectos sin importar lo que elijas aquí. Úsalo para darle acceso puntual a
        un proyecto específico.
      </p>

      {error && <div className="alert-error">{error}</div>}

      {cargando ? (
        <p className="permisos-proyectos-vacio">Cargando...</p>
      ) : proyectos.length === 0 ? (
        <p className="permisos-proyectos-vacio">Todavía no hay proyectos creados.</p>
      ) : (
        <div className="permisos-proyectos-lista">
          {proyectos.map((p) => (
            <div className="permisos-proyectos-fila" key={p.id}>
              <span className="permisos-proyectos-nombre">{p.nombre}</span>
              <select
                value={seleccion[p.id] || SIN_ACCESO}
                onChange={(e) => cambiarNivel(p.id, e.target.value)}
              >
                <option value={SIN_ACCESO}>Sin acceso</option>
                <option value="ver">Puede ver</option>
                <option value="editar">Puede editar</option>
              </select>
            </div>
          ))}
        </div>
      )}

      <div className="modal-actions">
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Cancelar
        </button>
        <button type="button" className="btn btn-primary" onClick={handleGuardar} disabled={guardando || cargando}>
          {guardando ? 'Guardando...' : 'Guardar permisos'}
        </button>
      </div>
    </Modal>
  );
}
