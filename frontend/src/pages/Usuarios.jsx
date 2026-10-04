import { useEffect, useState } from 'react';
import {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  desactivarUsuario,
  activarUsuario,
  restablecerPassword,
  listarRegistroActividad,
} from '../api/usuarios';
import Modal from '../components/common/Modal';
import Badge from '../components/common/Badge';
import PermisosProyectosModal from '../components/usuarios/PermisosProyectosModal';
import { ROLES, rolLabel, rolTono } from '../config/roles';
import { IconPlus, IconEdit, IconKey, IconUserX, IconUserCheck, IconBriefcase } from '../components/icons/Icons';
import './Usuarios.css';

const FORM_VACIO = { nombre: '', correo: '', password: '', rol: 'estudiante' };

function formatearFecha(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

export default function Usuarios() {
  const [tab, setTab] = useState('usuarios');

  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [logs, setLogs] = useState([]);
  const [cargandoLogs, setCargandoLogs] = useState(false);
  const [errorLogs, setErrorLogs] = useState('');
  const [logsCargados, setLogsCargados] = useState(false);

  const [modalNuevo, setModalNuevo] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState(null);
  const [usuarioResetPassword, setUsuarioResetPassword] = useState(null);
  const [usuarioPermisos, setUsuarioPermisos] = useState(null);

  async function cargarUsuarios() {
    setCargando(true);
    setError('');
    try {
      setUsuarios(await listarUsuarios());
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudieron cargar los usuarios.');
    } finally {
      setCargando(false);
    }
  }

  async function cargarLogs() {
    setCargandoLogs(true);
    setErrorLogs('');
    try {
      setLogs(await listarRegistroActividad());
      setLogsCargados(true);
    } catch (err) {
      setErrorLogs(err.response?.data?.error || 'No se pudo cargar el registro de actividad.');
    } finally {
      setCargandoLogs(false);
    }
  }

  useEffect(() => {
    cargarUsuarios();
  }, []);

  useEffect(() => {
    if (tab === 'actividad' && !logsCargados) {
      cargarLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function handleToggleActivo(usuario) {
    const verbo = usuario.activo ? 'desactivar' : 'activar';
    if (!window.confirm(`¿Seguro que quieres ${verbo} a ${usuario.nombre}?`)) return;
    try {
      if (usuario.activo) {
        await desactivarUsuario(usuario.id);
      } else {
        await activarUsuario(usuario.id);
      }
      cargarUsuarios();
    } catch (err) {
      window.alert(err.response?.data?.error || `No se pudo ${verbo} el usuario.`);
    }
  }

  return (
    <div className="usuarios-page">
      <div className="usuarios-header">
        <div>
          <h1 className="usuarios-title">Administración</h1>
          <p className="usuarios-subtitle">Usuarios, roles y actividad del sistema</p>
        </div>
        <button type="button" className="btn btn-primary usuarios-nuevo-btn" onClick={() => setModalNuevo(true)}>
          <IconPlus size={16} />
          Nuevo usuario
        </button>
      </div>

      <div className="usuarios-tabs">
        <button
          type="button"
          className={`usuarios-tab${tab === 'usuarios' ? ' usuarios-tab--active' : ''}`}
          onClick={() => setTab('usuarios')}
        >
          Usuarios
        </button>
        <button
          type="button"
          className={`usuarios-tab${tab === 'actividad' ? ' usuarios-tab--active' : ''}`}
          onClick={() => setTab('actividad')}
        >
          Registro de actividad
        </button>
      </div>

      {tab === 'usuarios' ? (
        <div className="usuarios-card">
          {error && <div className="alert-error usuarios-card-alert">{error}</div>}
          {cargando ? (
            <p className="usuarios-empty">Cargando...</p>
          ) : usuarios.length === 0 ? (
            <p className="usuarios-empty">Todavía no hay usuarios registrados.</p>
          ) : (
            <table className="usuarios-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Correo</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Creación</th>
                  <th className="usuarios-th-acciones">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id}>
                    <td>{u.nombre}</td>
                    <td className="usuarios-correo">{u.correo}</td>
                    <td>
                      <Badge tone={rolTono(u.rol)}>{rolLabel(u.rol)}</Badge>
                    </td>
                    <td>
                      <Badge tone={u.activo ? 'green' : 'gray'}>{u.activo ? 'Activo' : 'Inactivo'}</Badge>
                    </td>
                    <td>{formatearFecha(u.createdAt)}</td>
                    <td>
                      <div className="usuarios-acciones">
                        <button type="button" className="icon-btn" title="Editar" onClick={() => setUsuarioEditar(u)}>
                          <IconEdit size={16} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          title={u.activo ? 'Desactivar' : 'Activar'}
                          onClick={() => handleToggleActivo(u)}
                        >
                          {u.activo ? <IconUserX size={16} /> : <IconUserCheck size={16} />}
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          title="Restablecer contraseña"
                          onClick={() => setUsuarioResetPassword(u)}
                        >
                          <IconKey size={16} />
                        </button>
                        <button
                          type="button"
                          className="icon-btn"
                          title="Permisos de proyectos"
                          onClick={() => setUsuarioPermisos(u)}
                        >
                          <IconBriefcase size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="usuarios-card">
          {errorLogs && <div className="alert-error usuarios-card-alert">{errorLogs}</div>}
          {cargandoLogs ? (
            <p className="usuarios-empty">Cargando...</p>
          ) : logs.length === 0 ? (
            <p className="usuarios-empty">Todavía no hay actividad registrada.</p>
          ) : (
            <ul className="usuarios-log-list">
              {logs.map((log) => (
                <li key={log.id}>
                  <span className="usuarios-log-detalle">{log.detalle || log.accion}</span>
                  <span className="usuarios-log-meta">
                    {log.usuario?.nombre || 'Sistema'} · {new Date(log.createdAt).toLocaleString('es-CO')}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {modalNuevo && (
        <ModalNuevoUsuario
          onClose={() => setModalNuevo(false)}
          onCreado={() => {
            setModalNuevo(false);
            cargarUsuarios();
          }}
        />
      )}

      {usuarioEditar && (
        <ModalEditarUsuario
          usuario={usuarioEditar}
          onClose={() => setUsuarioEditar(null)}
          onGuardado={() => {
            setUsuarioEditar(null);
            cargarUsuarios();
          }}
        />
      )}

      {usuarioResetPassword && (
        <ModalResetPassword
          usuario={usuarioResetPassword}
          onClose={() => setUsuarioResetPassword(null)}
          onGuardado={() => setUsuarioResetPassword(null)}
        />
      )}

      {usuarioPermisos && (
        <PermisosProyectosModal
          usuario={usuarioPermisos}
          onClose={() => setUsuarioPermisos(null)}
          onGuardado={() => setUsuarioPermisos(null)}
        />
      )}
    </div>
  );
}

function ModalNuevoUsuario({ onClose, onCreado }) {
  const [form, setForm] = useState(FORM_VACIO);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setGuardando(true);
    try {
      await crearUsuario(form);
      onCreado();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear el usuario.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal title="Nuevo usuario" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="modal-field">
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
          />
        </div>
        <div className="modal-field">
          <label htmlFor="correo">Correo</label>
          <input
            id="correo"
            type="email"
            value={form.correo}
            onChange={(e) => setForm({ ...form, correo: e.target.value })}
            required
          />
        </div>
        <div className="modal-field">
          <label htmlFor="password">Contraseña temporal</label>
          <input
            id="password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            minLength={8}
          />
        </div>
        <div className="modal-field">
          <label htmlFor="rol">Rol</label>
          <select id="rol" value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        {error && <div className="alert-error">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ModalEditarUsuario({ usuario, onClose, onGuardado }) {
  const [form, setForm] = useState({ nombre: usuario.nombre, rol: usuario.rol });
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setGuardando(true);
    try {
      await actualizarUsuario(usuario.id, form);
      onGuardado();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo editar el usuario.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal title="Editar usuario" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="modal-field">
          <label htmlFor="edit-nombre">Nombre</label>
          <input
            id="edit-nombre"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
          />
        </div>
        <div className="modal-field">
          <label htmlFor="edit-correo">Correo</label>
          <input id="edit-correo" value={usuario.correo} disabled />
        </div>
        <div className="modal-field">
          <label htmlFor="edit-rol">Rol</label>
          <select id="edit-rol" value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        {error && <div className="alert-error">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ModalResetPassword({ usuario, onClose, onGuardado }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setGuardando(true);
    try {
      await restablecerPassword(usuario.id, password);
      onGuardado();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo restablecer la contraseña.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal title={`Restablecer contraseña — ${usuario.nombre}`} onClose={onClose} width={380}>
      <form onSubmit={handleSubmit}>
        <div className="modal-field">
          <label htmlFor="nueva-password">Nueva contraseña</label>
          <input
            id="nueva-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoFocus
          />
        </div>
        {error && <div className="alert-error">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
