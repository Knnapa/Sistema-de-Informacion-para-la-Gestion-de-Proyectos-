import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import { obtenerArchivoBlobUrl } from '../../api/archivos';
import './VideoPlayerModal.css';

// Reproduce un video de Induccion dentro de un modal. El archivo se trae
// con el token de sesion (igual que una descarga) y se muestra como una URL
// temporal de tipo blob, que se revoca al cerrar para no dejar memoria
// reservada en el navegador.
export default function VideoPlayerModal({ material, onClose }) {
  const [url, setUrl] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelado = false;
    let urlCreada = null;

    obtenerArchivoBlobUrl(material.archivo)
      .then((u) => {
        if (cancelado) {
          window.URL.revokeObjectURL(u);
          return;
        }
        urlCreada = u;
        setUrl(u);
      })
      .catch((err) => {
        if (!cancelado) setError(err.response?.data?.error || 'No se pudo cargar el video.');
      });

    return () => {
      cancelado = true;
      if (urlCreada) window.URL.revokeObjectURL(urlCreada);
    };
  }, [material.archivo]);

  return (
    <Modal title={material.titulo} onClose={onClose} width={720}>
      <div className="video-player-modal">
        {error && <div className="alert-error">{error}</div>}
        {!error && !url && <p className="video-player-cargando">Cargando video...</p>}
        {url && (
          // eslint-disable-next-line jsx-a11y/media-has-caption
          <video className="video-player-elemento" src={url} controls autoPlay />
        )}
      </div>
    </Modal>
  );
}
