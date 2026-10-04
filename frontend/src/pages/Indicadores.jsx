import { useEffect, useMemo, useState } from 'react';
import { listarIndicadores, listarCatalogoSistema, eliminarIndicador } from '../api/indicadores';
import IndicadorFormModal from '../components/indicadores/IndicadorFormModal';
import BarChart from '../components/charts/BarChart';
import { tipoLabel, formatearValor, formatearPeriodo } from '../config/indicadores';
import { IconPlus, IconEdit, IconTrash } from '../components/icons/Icons';
import './Indicadores.css';

// Variables de un indicador para la columna de la tabla: si es de sistema,
// el nombre del dato que calcula solo; si es manual, los nombres que la
// persona le puso a cada variable.
function variablesTexto(indicador, catalogoEtiquetas) {
  if (indicador.fuente === 'sistema') {
    return `Dato del sistema: ${catalogoEtiquetas[indicador.campoSistema] || indicador.campoSistema}`;
  }
  return (indicador.variables || []).map((v) => v.nombre).join(', ') || 'Sin variables';
}

export default function Indicadores() {
  const [indicadores, setIndicadores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [modalNuevo, setModalNuevo] = useState(false);
  const [indicadorEditar, setIndicadorEditar] = useState(null);

  // Mapa clave->etiqueta del catalogo de datos del sistema, para mostrar un
  // nombre legible en la columna "Variables" de los indicadores de sistema
  // (el indicador en si solo guarda la clave, ej. "proyectos_activos").
  const [catalogoEtiquetas, setCatalogoEtiquetas] = useState({});

  async function cargar() {
    setCargando(true);
    setError('');
    try {
      setIndicadores(await listarIndicadores());
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudieron cargar los indicadores.');
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
    listarCatalogoSistema()
      .then((lista) => {
        setCatalogoEtiquetas(Object.fromEntries(lista.map((c) => [c.clave, c.etiqueta])));
      })
      .catch(() => {
        // Si falla, la tabla simplemente muestra la clave tal cual (ver
        // variablesTexto) en vez de bloquear toda la pagina por esto.
      });
  }, []);

  const indicadorGrafica = useMemo(
    () => indicadores.find((i) => i.tipo === 'promedio' && (i.historial || []).length > 0),
    [indicadores]
  );

  async function handleEliminar(indicador) {
    if (!window.confirm(`¿Eliminar el indicador "${indicador.nombre}"?`)) return;
    try {
      await eliminarIndicador(indicador.id);
      cargar();
    } catch (err) {
      window.alert(err.response?.data?.error || 'No se pudo eliminar el indicador.');
    }
  }

  return (
    <div className="indicadores-page">
      <div className="indicadores-header">
        <div>
          <h1 className="indicadores-title">Indicadores</h1>
          <p className="indicadores-subtitle">Tablero de control de la gestión de extensión</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setModalNuevo(true)}>
          <IconPlus size={16} /> Nuevo indicador
        </button>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {cargando ? (
        <p className="indicadores-vacio">Cargando...</p>
      ) : indicadores.length === 0 ? (
        <p className="indicadores-vacio">
          Todavía no has creado ningún indicador. Usa "Nuevo indicador" para empezar.
        </p>
      ) : (
        <>
          <div className="indicadores-stats">
            {indicadores.slice(0, 4).map((ind) => (
              <div className="indicadores-stat-card" key={ind.id}>
                <span className="indicadores-stat-label">{ind.nombre}</span>
                <span className="indicadores-stat-value">{formatearValor(ind)}</span>
                {ind.tipo === 'porcentaje' ? (
                  <div className="indicadores-stat-bar">
                    <div
                      className="indicadores-stat-bar-fill"
                      style={{ width: `${Math.max(0, Math.min(100, ind.valor))}%` }}
                    />
                  </div>
                ) : (
                  <span className="indicadores-stat-caption">{tipoLabel(ind.tipo)}</span>
                )}
              </div>
            ))}
          </div>

          <div className="indicadores-grafica-card">
            <h2 className="indicadores-card-title">
              {indicadorGrafica
                ? `${indicadorGrafica.nombre} (histórico mensual)`
                : 'Histórico mensual'}
            </h2>
            {indicadorGrafica ? (
              <BarChart
                data={indicadorGrafica.historial.map((h) => ({
                  label: formatearPeriodo(h.periodo),
                  value: Math.round(h.valor * 10) / 10,
                }))}
                color="#5a218e"
              />
            ) : (
              <p className="indicadores-vacio">
                Crea un indicador de tipo Promedio para ver aquí su histórico mes a mes.
              </p>
            )}
          </div>

          <div className="indicadores-tabla-card">
            <h2 className="indicadores-card-title">Indicadores configurados</h2>
            <div className="indicadores-tabla-wrap">
              <table className="indicadores-tabla">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Variables</th>
                    <th className="indicadores-th-acciones">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {indicadores.map((ind) => (
                    <tr key={ind.id}>
                      <td>{ind.nombre}</td>
                      <td>{tipoLabel(ind.tipo)}</td>
                      <td className="indicadores-td-variables">{variablesTexto(ind, catalogoEtiquetas)}</td>
                      <td>
                        <div className="indicadores-acciones">
                          <button
                            type="button"
                            className="icon-btn"
                            title="Editar"
                            onClick={() => setIndicadorEditar(ind)}
                          >
                            <IconEdit size={16} />
                          </button>
                          <button
                            type="button"
                            className="icon-btn"
                            title="Eliminar"
                            onClick={() => handleEliminar(ind)}
                          >
                            <IconTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {modalNuevo && (
        <IndicadorFormModal
          onClose={() => setModalNuevo(false)}
          onGuardado={() => {
            setModalNuevo(false);
            cargar();
          }}
        />
      )}

      {indicadorEditar && (
        <IndicadorFormModal
          indicador={indicadorEditar}
          onClose={() => setIndicadorEditar(null)}
          onGuardado={() => {
            setIndicadorEditar(null);
            cargar();
          }}
        />
      )}
    </div>
  );
}
