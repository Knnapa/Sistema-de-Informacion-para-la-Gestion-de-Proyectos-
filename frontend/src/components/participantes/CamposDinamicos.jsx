import './CamposDinamicos.css';

// Renderiza los campos EXTRA que un proyecto en particular haya definido en
// su "Formulario de recoleccion" (ver FormularioBuilder). Lo reutilizan el
// modal de Registrar y el de Vincular para no duplicar esta logica.
// `valores` es { [etiqueta]: valor }.
export default function CamposDinamicos({ campos, valores, onChange }) {
  if (!campos || campos.length === 0) return null;

  function set(etiqueta, valor) {
    onChange({ ...valores, [etiqueta]: valor });
  }

  function toggleMultiple(etiqueta, opcion) {
    const actuales = Array.isArray(valores[etiqueta]) ? valores[etiqueta] : [];
    const nuevo = actuales.includes(opcion) ? actuales.filter((o) => o !== opcion) : [...actuales, opcion];
    set(etiqueta, nuevo);
  }

  const tieneArchivo = campos.some((c) => c.tipo === 'archivo');

  return (
    <div className="campos-dinamicos">
      {campos.map((campo) => (
        <div className="modal-field" key={campo.etiqueta}>
          <label>{campo.etiqueta}</label>

          {campo.tipo === 'texto' && (
            <input value={valores[campo.etiqueta] || ''} onChange={(e) => set(campo.etiqueta, e.target.value)} />
          )}

          {campo.tipo === 'lista' && (
            <select value={valores[campo.etiqueta] || ''} onChange={(e) => set(campo.etiqueta, e.target.value)}>
              <option value="">Seleccionar</option>
              {(campo.opciones || []).map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          )}

          {campo.tipo === 'multiple' && (
            <div className="campos-dinamicos-checks">
              {(campo.opciones || []).map((o) => (
                <label key={o} className="campos-dinamicos-check">
                  <input
                    type="checkbox"
                    checked={Array.isArray(valores[campo.etiqueta]) && valores[campo.etiqueta].includes(o)}
                    onChange={() => toggleMultiple(campo.etiqueta, o)}
                  />
                  {o}
                </label>
              ))}
            </div>
          )}

          {campo.tipo === 'archivo' && (
            <input type="file" onChange={(e) => set(campo.etiqueta, e.target.files?.[0]?.name || '')} />
          )}
        </div>
      ))}

      {tieneArchivo && (
        <p className="campos-dinamicos-nota">
          Por ahora el archivo no se sube de verdad, solo se guarda el nombre.
        </p>
      )}
    </div>
  );
}
