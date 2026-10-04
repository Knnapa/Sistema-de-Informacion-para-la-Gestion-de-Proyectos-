import { IconPlus, IconTrash } from '../icons/Icons';
import './CronogramaEditor.css';

let contador = 0;
function nuevoId() {
  contador += 1;
  return `hito-${Date.now()}-${contador}`;
}

// Cronograma del proyecto: una lista de hitos (titulo + fecha), en el orden
// en que se agregan. Se edita aqui (en "Editar proyecto") y se muestra como
// linea de tiempo en el detalle (ver ProyectoDetalle).
export default function CronogramaEditor({ hitos, onChange }) {
  function agregar() {
    onChange([...hitos, { id: nuevoId(), titulo: '', fecha: '' }]);
  }

  function actualizar(id, cambios) {
    onChange(hitos.map((h) => (h.id === id ? { ...h, ...cambios } : h)));
  }

  function quitar(id) {
    onChange(hitos.filter((h) => h.id !== id));
  }

  return (
    <div className="cronograma-editor">
      <label className="cronograma-editor-label">Cronograma</label>
      <p className="cronograma-editor-subtitulo">Hitos del proyecto, en el orden en que deben aparecer.</p>

      {hitos.length > 0 && (
        <div className="cronograma-editor-filas">
          {hitos.map((h) => (
            <div className="cronograma-editor-fila" key={h.id}>
              <input
                className="cronograma-editor-titulo"
                placeholder="Nombre del hito"
                value={h.titulo}
                onChange={(e) => actualizar(h.id, { titulo: e.target.value })}
              />
              <input
                className="cronograma-editor-fecha"
                type="date"
                value={h.fecha}
                onChange={(e) => actualizar(h.id, { fecha: e.target.value })}
              />
              <button
                type="button"
                className="icon-btn"
                title="Quitar hito"
                onClick={() => quitar(h.id)}
              >
                <IconTrash size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <button type="button" className="cronograma-editor-agregar" onClick={agregar}>
        <IconPlus size={13} /> Agregar hito
      </button>
    </div>
  );
}
