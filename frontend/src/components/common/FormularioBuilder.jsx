import { useState } from 'react';
import { IconUpload, IconListDropdown, IconCheckSquare, IconTrash, IconX } from '../icons/Icons';
import { subirArchivo } from '../../api/archivos';
import './FormularioBuilder.css';

// "multiple" (Selección múltiple) ya no se ofrece para campos nuevos: con
// el cambio anterior (lista y multiple sin "valor", solo mostrando las
// opciones) quedó igual a "lista", así que ya no hace falta como opción
// aparte. Los campos tipo "multiple" que ya existan se siguen mostrando y
// editando igual que antes (no se rompen).
const TIPOS_CAMPO = [
  { value: 'texto', label: 'Texto' },
  { value: 'lista', label: 'Lista desplegable' },
  { value: 'archivo', label: 'Archivo / foto' },
];

function TipoIcon({ tipo, size = 14 }) {
  if (tipo === 'texto') return <span className="tipo-icon-text">T</span>;
  if (tipo === 'lista') return <IconListDropdown size={size} />;
  if (tipo === 'multiple') return <IconCheckSquare size={size} />;
  return <IconUpload size={size} />;
}

let contador = 0;
function nuevoId() {
  contador += 1;
  return `campo-${Date.now()}-${contador}`;
}

// Opciones como "chips": se escribe una opcion y se presiona Enter para
// agregarla (nunca separadas por coma, para poder escribir opciones con
// coma o varias palabras sin problema). Cada chip se quita con su "x".
// Lista y Seleccion multiple son SOLO esto -- una lista de opciones que se
// define aqui y se muestra tal cual; no se escoge ningun valor.
function OpcionesChips({ campo, onCambiar }) {
  const [texto, setTexto] = useState('');
  const opciones = campo.opciones || [];

  function agregar() {
    const valor = texto.trim();
    setTexto('');
    if (!valor || opciones.includes(valor)) return;
    onCambiar({ opciones: [...opciones, valor] });
  }

  function quitar(opcion) {
    onCambiar({ opciones: opciones.filter((o) => o !== opcion) });
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault(); // no enviar el formulario que lo contiene
      agregar();
    }
  }

  return (
    <div className="formulario-campo-opciones-wrap">
      {opciones.length > 0 && (
        <div className="formulario-campo-opciones-chips">
          {opciones.map((o) => (
            <span className="formulario-campo-opciones-chip" key={o}>
              {o}
              <button type="button" onClick={() => quitar(o)} aria-label={`Quitar opción ${o}`}>
                <IconX size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        className="formulario-campo-opciones"
        placeholder="Escribe una opción y presiona Enter"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}

// El input del VALOR: solo existe para Texto y Archivo/foto (lista y
// seleccion multiple ya no tienen valor, son solo la lista de opciones).
function ValorCampo({ campo, onChange }) {
  if (campo.tipo === 'texto') {
    return (
      <input
        className="formulario-campo-valor-input"
        placeholder="Escribe el valor..."
        value={campo.valor || ''}
        onChange={(e) => onChange({ valor: e.target.value })}
      />
    );
  }

  // archivo: se sube de verdad al elegirlo (ver /api/archivos); el valor
  // guardado es { archivo, nombreOriginal } para poder descargarlo despues.
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState('');
  const valorActual = campo.valor && typeof campo.valor === 'object' ? campo.valor : null;
  const valorAntiguo = !valorActual && typeof campo.valor === 'string' ? campo.valor : '';

  async function manejarArchivo(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite volver a elegir el mismo archivo despues
    if (!file) return;
    setError('');
    setSubiendo(true);
    try {
      const { archivo } = await subirArchivo(file);
      onChange({ valor: { archivo, nombreOriginal: file.name } });
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo subir el archivo.');
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <>
      <input
        type="file"
        className="formulario-campo-valor-input"
        onChange={manejarArchivo}
        disabled={subiendo}
      />
      {subiendo && <p className="formulario-campo-valor-hint">Subiendo archivo...</p>}
      {error && <p className="formulario-campo-valor-hint formulario-campo-valor-hint-error">{error}</p>}
      {!subiendo && valorActual && (
        <p className="formulario-campo-valor-hint">Archivo actual: {valorActual.nombreOriginal}</p>
      )}
      {!subiendo && valorAntiguo && (
        <p className="formulario-campo-valor-hint">
          Archivo anterior: {valorAntiguo} (vuelve a subirlo para poder descargarlo).
        </p>
      )}
    </>
  );
}

// Constructor de campos dinamicos, compartido por Proyectos (RF-08, campos
// propios del proyecto) y Participantes (campos propios de cada
// participante). `campos` es [{ id, tipo, etiqueta, opciones? (lista/
// multiple), valor? (texto/archivo) }]; el id es solo para el key de React
// y se descarta antes de mandarlo al API.
export default function FormularioBuilder({
  campos,
  onChange,
  titulo = 'Formulario de recolección',
  subtitulo = 'Agrega la información adicional que quieras guardar.',
  tipos = TIPOS_CAMPO.map((t) => t.value),
}) {
  const tiposDisponibles = TIPOS_CAMPO.filter((t) => tipos.includes(t.value));

  function agregarCampo(tipo) {
    const base = { id: nuevoId(), tipo, etiqueta: '' };
    if (tipo === 'lista' || tipo === 'multiple') {
      base.opciones = [];
    } else {
      base.valor = '';
    }
    onChange([...campos, base]);
  }

  function actualizarCampo(id, cambios) {
    onChange(campos.map((c) => (c.id === id ? { ...c, ...cambios } : c)));
  }

  function eliminarCampo(id) {
    onChange(campos.filter((c) => c.id !== id));
  }

  return (
    <div className="formulario-builder">
      <h3 className="formulario-builder-title">{titulo}</h3>
      <p className="formulario-builder-subtitle">{subtitulo}</p>

      {campos.length === 0 ? (
        <p className="formulario-builder-empty">Todavía no agregaste ningún campo.</p>
      ) : (
        <div className="formulario-builder-campos">
          {campos.map((campo) => (
            <div className="formulario-campo" key={campo.id}>
              <div className="formulario-campo-header">
                <span
                  className="formulario-campo-tipo"
                  title={TIPOS_CAMPO.find((t) => t.value === campo.tipo)?.label}
                >
                  <TipoIcon tipo={campo.tipo} />
                </span>
                <input
                  className="formulario-campo-etiqueta"
                  placeholder="Nombre del campo"
                  value={campo.etiqueta}
                  onChange={(e) => actualizarCampo(campo.id, { etiqueta: e.target.value })}
                />
                <button
                  type="button"
                  className="icon-btn"
                  title="Quitar campo"
                  onClick={() => eliminarCampo(campo.id)}
                >
                  <IconTrash size={15} />
                </button>
              </div>

              {(campo.tipo === 'lista' || campo.tipo === 'multiple') && (
                <OpcionesChips campo={campo} onCambiar={(cambios) => actualizarCampo(campo.id, cambios)} />
              )}

              {(campo.tipo === 'texto' || campo.tipo === 'archivo') && (
                <div className="formulario-campo-valor">
                  <label className="formulario-campo-valor-label">Valor</label>
                  <ValorCampo campo={campo} onChange={(cambios) => actualizarCampo(campo.id, cambios)} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="formulario-builder-tipos">
        {tiposDisponibles.map((t) => (
          <button
            type="button"
            key={t.value}
            className="formulario-tipo-btn"
            onClick={() => agregarCampo(t.value)}
          >
            <TipoIcon tipo={t.value} />
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
