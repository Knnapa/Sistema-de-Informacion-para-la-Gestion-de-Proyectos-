import { IconX } from '../icons/Icons';
import './Modal.css';

// Modal generico (fondo + tarjeta + boton de cerrar). Nuevo usuario, Editar
// usuario y Restablecer contraseña lo reutilizan en vez de repetir el marcado.
export default function Modal({ title, onClose, children, width = 420 }) {
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card" style={{ maxWidth: width }}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Cerrar">
            <IconX size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
