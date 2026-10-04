import { useState } from 'react';
import { IconListDropdown, IconCheckSquare, IconUpload, IconDownload } from '../icons/Icons';
import { descargarArchivo } from '../../api/archivos';
import './CamposValoresVisual.css';

// Lectura de los campos dinamicos definidos con FormularioBuilder, en modo
// solo lectura -- lo usan tanto ProyectoDetalle (proyecto.formulario) como
// VerParticipanteModal (participante.camposPersonalizados), que comparten
// la misma forma de datos ({ tipo, etiqueta, opciones?, valor? }).
const LABEL_TIPO = {
  texto: 'Texto',
  lista: 'Lista desplegable',
  multiple: 'Selección múltiple',
  archivo: 'Archivo / foto',
};

function IconoTipo({ tipo }) {
  if (tipo === 'lista') return <IconListDropdown size={14} />;
  if (tipo === 'multiple') return <IconCheckSquare size={14} />;
  if (tipo === 'archivo') return <IconUpload size={14} />;
  return <span className="tipo-icon-text">T</span>;
}

// Boton de descarga de un archivo subido. Tiene su propio estado de
// "descargando" (no se puede usar useState directo dentro de un if).
function DescargaArchivo({ archivo, nombreOriginal }) {
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState('');

  async function manejarClick() {
    setError('');
    setDescargando(true);
    try {
      await descargarArchivo(archivo, nombreOriginal);
    } catch (err) {
      setError('No se pudo descargar el archivo.');
    } finally {
      setDescargando(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        className="campos-valores-campo-descarga"
        onClick={manejarClick}
        disabled={descargando}
      >
        <IconDownload size={13} /> {descargando ? 'Descargando...' : `Descargar ${nombreOriginal || 'archivo'}`}
      </button>
      {error && <p className="campos-valores-campo-descarga-error">{error}</p>}
    </div>
  );
}

// Lista y Seleccion multiple no tienen "valor": son solo la lista de
// opciones definida, y se muestran tal cual, una debajo de otra. Texto y
// Archivo/foto si tienen un valor diligenciado.
function ValorCampoVisual({ campo }) {
  if (campo.tipo === 'lista' || campo.tipo === 'multiple') {
    const opciones = campo.opciones || [];
    if (opciones.length === 0) {
      return <span className="campos-valores-campo-valor">Este campo todavía no tiene opciones.</span>;
    }
    return (
      <ul className="campos-valores-campo-lista">
        {opciones.map((o) => (
          <li key={o} className="campos-valores-campo-lista-item">
            {o}
          </li>
        ))}
      </ul>
    );
  }

  if (campo.tipo === 'archivo') {
    if (campo.valor && typeof campo.valor === 'object' && campo.valor.archivo) {
      return <DescargaArchivo archivo={campo.valor.archivo} nombreOriginal={campo.valor.nombreOriginal} />;
    }
    if (typeof campo.valor === 'string' && campo.valor) {
      return <span className="campos-valores-campo-valor">{campo.valor} (no disponible para descargar)</span>;
    }
    return <span className="campos-valores-campo-valor">Sin diligenciar</span>;
  }

  return <span className="campos-valores-campo-valor">{campo.valor || 'Sin diligenciar'}</span>;
}

// `campos` es [{ tipo, etiqueta, opciones?, valor? }] -- el formulario de
// recoleccion de un proyecto, o los campos personalizados de un participante.
export default function CamposValoresVisual({ campos }) {
  if (!campos || campos.length === 0) return null;

  return (
    <div className="campos-valores-lista">
      {campos.map((campo, i) => (
        <div className="campos-valores-campo" key={i}>
          <span className="campos-valores-campo-tipo-icon">
            <IconoTipo tipo={campo.tipo} />
          </span>
          <div className="campos-valores-campo-cuerpo">
            <span className="campos-valores-campo-etiqueta">{campo.etiqueta}</span>
            <span className="campos-valores-campo-tipo-label">{LABEL_TIPO[campo.tipo]}</span>
            <div className="campos-valores-campo-valor-widget">
              <ValorCampoVisual campo={campo} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
