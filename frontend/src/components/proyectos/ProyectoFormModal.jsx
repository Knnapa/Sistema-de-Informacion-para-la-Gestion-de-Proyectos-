import { useState } from 'react';
import Modal from '../common/Modal';
import FormularioBuilder from '../common/FormularioBuilder';
import CronogramaEditor from './CronogramaEditor';
import ArchivosAdjuntosEditor from './ArchivosAdjuntosEditor';
import { CATEGORIAS } from '../../config/categorias';
import { crearProyecto, actualizarProyecto } from '../../api/proyectos';
import './ProyectoFormModal.css';

let contador = 0;
function idExistente() {
  contador += 1;
  return `campo-existente-${contador}`;
}

function camposIniciales(proyecto) {
  if (proyecto?.formulario?.length) {
    return proyecto.formulario.map((c) => ({ ...c, id: idExistente() }));
  }
  // El formulario de recoleccion es informacion propia del proyecto: se
  // define el campo y se diligencia su valor aqui mismo (ver FormularioBuilder).
  return [];
}

function cronogramaInicial(proyecto) {
  if (proyecto?.cronograma?.length) {
    return proyecto.cronograma.map((h) => ({ ...h, id: idExistente() }));
  }
  return [];
}

// Un solo modal para "Nuevo proyecto" y "Editar proyecto": misma forma,
// cambia el titulo/boton y si hay datos precargados.
export default function ProyectoFormModal({ proyecto, onClose, onGuardado }) {
  const esEdicion = Boolean(proyecto);

  const [nombre, setNombre] = useState(proyecto?.nombre || '');
  const [categoria, setCategoria] = useState(proyecto?.categoria || '');
  const [fechaInicio, setFechaInicio] = useState(proyecto?.fechaInicio || '');
  const [fechaFin, setFechaFin] = useState(proyecto?.fechaFin || '');
  const [descripcion, setDescripcion] = useState(proyecto?.descripcion || '');
  const [estado, setEstado] = useState(proyecto?.estado || 'activo');
  const [estadoManual, setEstadoManual] = useState(proyecto?.estadoManual || false);
  const [campos, setCampos] = useState(() => camposIniciales(proyecto));
  const [cronograma, setCronograma] = useState(() => cronogramaInicial(proyecto));
  const [archivosAdjuntos, setArchivosAdjuntos] = useState(() => proyecto?.archivosAdjuntos || []);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!categoria) {
      setError('Selecciona una categoría.');
      return;
    }

    setGuardando(true);
    const datos = {
      nombre,
      categoria,
      fechaInicio,
      fechaFin: fechaFin || null,
      descripcion,
      formulario: campos.map(({ id, ...resto }) => resto),
      cronograma: cronograma.map(({ id, ...resto }) => resto),
      archivosAdjuntos,
    };
    // El estado solo se manda al editar: un proyecto nuevo siempre arranca
    // en modo automatico (activo, y se recalcula solo segun la fecha de
    // fin -- ver calcularEstadoAutomatico en el backend).
    if (esEdicion) {
      datos.estado = estado;
      datos.estadoManual = estadoManual;
    }

    try {
      if (esEdicion) {
        await actualizarProyecto(proyecto.id, datos);
      } else {
        await crearProyecto(datos);
      }
      onGuardado();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo guardar el proyecto.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal title={esEdicion ? 'Editar proyecto' : 'Nuevo proyecto'} onClose={onClose} width={540}>
      <form onSubmit={handleSubmit} className="proyecto-form">
        <div className="modal-field">
          <label htmlFor="p-nombre">Nombre del proyecto</label>
          <input id="p-nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>

        <div className="proyecto-form-row">
          <div className="modal-field">
            <label htmlFor="p-categoria">Categoría</label>
            <select id="p-categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)} required>
              <option value="" disabled>
                Seleccionar
              </option>
              {CATEGORIAS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="modal-field">
            <label htmlFor="p-fecha-inicio">Fecha de inicio</label>
            <input
              id="p-fecha-inicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="modal-field">
          <label htmlFor="p-fecha-fin">Fecha de fin (opcional)</label>
          <input id="p-fecha-fin" type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
        </div>

        <div className="modal-field">
          <label htmlFor="p-descripcion">Descripción</label>
          <textarea
            id="p-descripcion"
            rows={3}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>

        {esEdicion && (
          <div className="modal-field">
            <label htmlFor="p-estado">Estado</label>
            <select
              id="p-estado"
              value={estadoManual ? estado : 'automatico'}
              onChange={(e) => {
                const valor = e.target.value;
                if (valor === 'automatico') {
                  setEstadoManual(false);
                } else {
                  setEstadoManual(true);
                  setEstado(valor);
                }
              }}
            >
              <option value="automatico">Automático (según fecha de fin)</option>
              <option value="activo">Forzar: Activo</option>
              <option value="finalizado">Forzar: Finalizado</option>
            </select>
            <span className="proyecto-form-estado-ayuda">
              {estadoManual
                ? 'Quedará fijo en este estado hasta que vuelvas a elegir "Automático".'
                : 'Se calcula solo: "Finalizado" cuando ya pasó la fecha de fin, "Activo" en caso contrario.'}
            </span>
          </div>
        )}

        <CronogramaEditor hitos={cronograma} onChange={setCronograma} />

        <ArchivosAdjuntosEditor archivos={archivosAdjuntos} onChange={setArchivosAdjuntos} />

        {/* "Archivo / foto" no se ofrece aqui: Proyectos ya tiene su propia
            seccion de Archivos adjuntos (arriba) para subir archivos, asi
            que el formulario de recoleccion solo deja Texto y Lista
            desplegable (ver tipos en FormularioBuilder). */}
        <FormularioBuilder campos={campos} onChange={setCampos} tipos={['texto', 'lista']} />

        {error && <div className="alert-error proyecto-form-error">{error}</div>}

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={guardando}>
            {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear proyecto'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
