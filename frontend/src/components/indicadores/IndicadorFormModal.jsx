import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import { listarCatalogoSistema, crearIndicador, actualizarIndicador } from '../../api/indicadores';
import { TIPOS_INDICADOR } from '../../config/indicadores';
import { IconPlus, IconTrash } from '../icons/Icons';
import './IndicadorFormModal.css';

const VARIABLE_VACIA = { nombre: '', valor: '' };

// Crear/editar un indicador. "Datos del sistema" calcula el valor solo (el
// tipo queda fijo segun lo que se elija del catalogo); "Manual" deja definir
// el tipo y digitar las variables a mano, para conceptos que el sistema
// todavia no registra (ej. asistencia a talleres).
export default function IndicadorFormModal({ indicador, onClose, onGuardado }) {
  const editando = Boolean(indicador);

  const [nombre, setNombre] = useState(indicador?.nombre || '');
  const [fuente, setFuente] = useState(indicador?.fuente || 'sistema');
  const [campoSistema, setCampoSistema] = useState(indicador?.campoSistema || '');
  const [tipo, setTipo] = useState(indicador?.fuente === 'manual' ? indicador.tipo : 'conteo');
  const [variables, setVariables] = useState(
    indicador?.fuente === 'manual' && indicador.variables?.length
      ? indicador.variables.map((v) => ({ nombre: v.nombre, valor: String(v.valor) }))
      : [{ ...VARIABLE_VACIA }]
  );

  const [catalogo, setCatalogo] = useState([]);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    async function cargar() {
      try {
        const lista = await listarCatalogoSistema();
        setCatalogo(lista);
        if (!campoSistema && lista.length > 0) setCampoSistema(lista[0].clave);
      } catch {
        setError('No se pudo cargar el catálogo de datos del sistema.');
      } finally {
        setCargandoCatalogo(false);
      }
    }
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function actualizarVariable(indice, cambios) {
    setVariables((prev) => prev.map((v, i) => (i === indice ? { ...v, ...cambios } : v)));
  }

  function agregarVariable() {
    setVariables((prev) => [...prev, { ...VARIABLE_VACIA }]);
  }

  function quitarVariable(indice) {
    setVariables((prev) => prev.filter((_, i) => i !== indice));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!nombre.trim()) {
      setError('El nombre del indicador es obligatorio.');
      return;
    }

    let payload;
    if (fuente === 'sistema') {
      if (!campoSistema) {
        setError('Selecciona un dato del sistema.');
        return;
      }
      payload = { nombre: nombre.trim(), fuente: 'sistema', campoSistema };
    } else {
      const limpias = variables
        .map((v) => ({ nombre: v.nombre.trim(), valor: v.valor }))
        .filter((v) => v.nombre || v.valor !== '');
      if (limpias.length === 0 || limpias.some((v) => !v.nombre || v.valor === '' || Number.isNaN(Number(v.valor)))) {
        setError('Cada variable necesita un nombre y un valor numérico.');
        return;
      }
      if (tipo === 'porcentaje' && limpias.length < 2) {
        setError('Un indicador de porcentaje necesita al menos dos variables (numerador y denominador).');
        return;
      }
      payload = {
        nombre: nombre.trim(),
        fuente: 'manual',
        tipo,
        variables: limpias.map((v) => ({ nombre: v.nombre, valor: Number(v.valor) })),
      };
    }

    setGuardando(true);
    try {
      if (editando) {
        await actualizarIndicador(indicador.id, payload);
      } else {
        await crearIndicador(payload);
      }
      onGuardado();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo guardar el indicador.');
    } finally {
      setGuardando(false);
    }
  }

  return (
    <Modal title={editando ? 'Editar indicador' : 'Nuevo indicador'} onClose={onClose} width={480}>
      <form onSubmit={handleSubmit}>
        <div className="modal-field">
          <label htmlFor="ind-nombre">Nombre</label>
          <input
            id="ind-nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. % de cobertura"
            required
            autoFocus
          />
        </div>

        <div className="modal-field">
          <label htmlFor="ind-fuente">Origen del dato</label>
          <select id="ind-fuente" value={fuente} onChange={(e) => setFuente(e.target.value)}>
            <option value="sistema">Datos del sistema (se calcula solo)</option>
            <option value="manual">Manual (tú digitas las variables)</option>
          </select>
        </div>

        {fuente === 'sistema' ? (
          <div className="modal-field">
            <label htmlFor="ind-campo-sistema">Dato del sistema</label>
            <select
              id="ind-campo-sistema"
              value={campoSistema}
              onChange={(e) => setCampoSistema(e.target.value)}
              disabled={cargandoCatalogo}
            >
              {catalogo.map((c) => (
                <option key={c.clave} value={c.clave}>
                  {c.etiqueta}
                </option>
              ))}
            </select>
            <p className="indicador-form-hint">
              El valor se calcula automáticamente a partir de los proyectos y participantes que ya
              tiene el sistema.
            </p>
          </div>
        ) : (
          <>
            <div className="modal-field">
              <label htmlFor="ind-tipo">Tipo</label>
              <select id="ind-tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
                {TIPOS_INDICADOR.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              {tipo === 'porcentaje' && (
                <p className="indicador-form-hint">
                  Se calcula con las primeras dos variables: la primera como numerador y la segunda
                  como denominador (numerador ÷ denominador × 100).
                </p>
              )}
            </div>

            <div className="modal-field">
              <label>Variables</label>
              <div className="indicador-form-variables">
                {variables.map((v, i) => (
                  <div className="indicador-form-variable-fila" key={i}>
                    <input
                      placeholder="Nombre (ej. Asistentes)"
                      value={v.nombre}
                      onChange={(e) => actualizarVariable(i, { nombre: e.target.value })}
                    />
                    <input
                      type="number"
                      placeholder="Valor"
                      value={v.valor}
                      onChange={(e) => actualizarVariable(i, { valor: e.target.value })}
                    />
                    <button
                      type="button"
                      className="icon-btn"
                      title="Quitar variable"
                      onClick={() => quitarVariable(i)}
                      disabled={variables.length === 1}
                    >
                      <IconTrash size={15} />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" className="indicador-form-agregar-btn" onClick={agregarVariable}>
                <IconPlus size={14} /> Agregar variable
              </button>
            </div>
          </>
        )}

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
