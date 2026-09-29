import { useEffect, useState } from 'react';
import api from '../api/client';

const ROLES = ['administrador', 'lider', 'colider', 'estudiante'];

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState({ nombre: '', correo: '', password: '', rol: 'estudiante' });
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  async function cargarUsuarios() {
    setCargando(true);
    const { data } = await api.get('/usuarios');
    setUsuarios(data);
    setCargando(false);
  }

  useEffect(() => {
    cargarUsuarios();
  }, []);

  async function handleCrear(e) {
    e.preventDefault();
    setError('');
    try {
      await api.post('/usuarios', form);
      setForm({ nombre: '', correo: '', password: '', rol: 'estudiante' });
      cargarUsuarios();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear el usuario.');
    }
  }

  async function handleDesactivar(id) {
    await api.put(`/usuarios/${id}/desactivar`);
    cargarUsuarios();
  }

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <h1>Administracion de usuarios</h1>

      <form onSubmit={handleCrear} style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          required
        />
        <input
          placeholder="Correo"
          type="email"
          value={form.correo}
          onChange={(e) => setForm({ ...form, correo: e.target.value })}
          required
        />
        <input
          placeholder="Contrasena temporal"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
        />
        <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button type="submit">Crear usuario</button>
      </form>

      {error && <p style={{ color: 'crimson' }}>{error}</p>}

      {cargando ? (
        <p>Cargando...</p>
      ) : (
        <table width="100%" border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Activo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.nombre}</td>
                <td>{u.correo}</td>
                <td>{u.rol}</td>
                <td>{u.activo ? 'Si' : 'No'}</td>
                <td>
                  {u.activo && (
                    <button onClick={() => handleDesactivar(u.id)}>Desactivar</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
