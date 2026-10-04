import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { listarProyectos, obtenerProyecto } from '../api/proyectos';
import { CATEGORIAS, categoriaLabel } from '../config/categorias';
import { IconEye, IconFileText, IconGraduationCap } from '../components/icons/Icons';
import './Reportes.css';

const LABEL_TIPO_CAMPO = {
  texto: 'Texto',
  lista: 'Lista desplegable',
  multiple: 'Selección múltiple',
  archivo: 'Archivo / foto',
};

// Representacion en texto del valor de un campo del formulario de
// recoleccion, para la hoja "Formulario" del reporte de un proyecto.
function valorCampoTexto(campo) {
  if (campo.tipo === 'lista' || campo.tipo === 'multiple') {
    return (campo.opciones || []).join(', ') || 'Sin opciones';
  }
  if (campo.tipo === 'archivo') {
    if (campo.valor && typeof campo.valor === 'object' && campo.valor.nombreOriginal) {
      return campo.valor.nombreOriginal;
    }
    if (typeof campo.valor === 'string' && campo.valor) return campo.valor;
    return 'Sin diligenciar';
  }
  return campo.valor || 'Sin diligenciar';
}

function nombreArchivoSeguro(texto) {
  return (
    texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'proyecto'
  );
}

// Campos que se pueden incluir en el reporte personalizado. El valor de
// cada uno sale directo de lo que ya devuelve GET /api/proyectos -- no hace
// falta pedirle nada nuevo al backend para este constructor.
const CAMPOS_DISPONIBLES = [
  { value: 'nombre', label: 'Nombre' },
  { value: 'categoria', label: 'Categoría' },
  { value: 'estado', label: 'Estado' },
  { value: 'fechaInicio', label: 'Fecha inicio' },
  { value: 'fechaFin', label: 'Fecha fin' },
  { value: 'totalParticipantes', label: 'Participantes' },
];

const ESTADOS = [
  { value: 'activo', label: 'Activo' },
  { value: 'finalizado', label: 'Finalizado' },
];

function valorCampo(campo, proyecto) {
  if (campo === 'categoria') return categoriaLabel(proyecto.categoria);
  if (campo === 'estado') return proyecto.estado === 'activo' ? 'Activo' : 'Finalizado';
  if (campo === 'fechaFin') return proyecto.fechaFin || 'Sin definir';
  return proyecto[campo];
}

function fechaHoyArchivo() {
  return new Date().toISOString().slice(0, 10);
}

function descargarLibro(hojas, nombreArchivo) {
  const libro = XLSX.utils.book_new();
  hojas.forEach(({ nombre, filas }) => {
    const hoja = XLSX.utils.json_to_sheet(filas);
    XLSX.utils.book_append_sheet(libro, hoja, nombre);
  });
  XLSX.writeFile(libro, nombreArchivo);
}

// Reportes: constructor personalizado (elige campos + filtros, vista
// previa y exportar a Excel) mas el Reporte SNIES de formato fijo. Todo se
// arma a partir de los proyectos que ya devuelve la API -- no se inventa
// ningun dato.
export default function Reportes() {
  const [proyectos, setProyectos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const [campos, setCampos] = useState(() =>
    CAMPOS_DISPONIBLES.reduce((acc, c) => ({ ...acc, [c.value]: true }), {})
  );
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [tipoProyecto, setTipoProyecto] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [mostrarVistaPrevia, setMostrarVistaPrevia] = useState(false);
  const [generandoSnies, setGenerandoSnies] = useState(false);

  const [proyectoSeleccionadoId, setProyectoSeleccionadoId] = useState('');
  const [generandoProyecto, setGenerandoProyecto] = useState(false);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      setError('');
      try {
        setProyectos(await listarProyectos());
      } catch (err) {
        setError(err.response?.data?.error || 'No se pudieron cargar los proyectos.');
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  const camposElegidos = CAMPOS_DISPONIBLES.filter((c) => campos[c.value]);

  const filtrados = useMemo(() => {
    return proyectos.filter((p) => {
      if (desde && p.fechaInicio < desde) return false;
      if (hasta && p.fechaInicio > hasta) return false;
      if (tipoProyecto && p.categoria !== tipoProyecto) return false;
      if (estadoFiltro && p.estado !== estadoFiltro) return false;
      return true;
    });
  }, [proyectos, desde, hasta, tipoProyecto, estadoFiltro]);

  function toggleCampo(value) {
    setCampos((prev) => ({ ...prev, [value]: !prev[value] }));
  }

  function filasReporte() {
    return filtrados.map((p) => {
      const fila = {};
      camposElegidos.forEach((c) => {
        fila[c.label] = valorCampo(c.value, p);
      });
      return fila;
    });
  }

  function handleVistaPrevia() {
    setError('');
    if (camposElegidos.length === 0) {
      setError('Selecciona al menos un campo para incluir.');
      return;
    }
    setMostrarVistaPrevia(true);
  }

  function handleExportar() {
    setError('');
    if (camposElegidos.length === 0) {
      setError('Selecciona al menos un campo para incluir.');
      return;
    }
    if (filtrados.length === 0) {
      setError('No hay proyectos que coincidan con los filtros elegidos.');
      return;
    }
    descargarLibro([{ nombre: 'Proyectos', filas: filasReporte() }], `reporte-proyectos-${fechaHoyArchivo()}.xlsx`);
  }

  // El Reporte SNIES usa un formato fijo de columnas (no el constructor de
  // arriba) y siempre incluye todos los proyectos, sin aplicarles los
  // filtros del reporte personalizado -- es el reporte institucional
  // completo. Nota: como el sistema no tiene el formato oficial exacto que
  // exige el SNIES, esta exportacion usa los campos disponibles del
  // sistema con nombres de columna claros; si tienes la plantilla oficial,
  // decime que columnas pide y la ajusto.
  async function handleGenerarSnies() {
    setError('');
    setGenerandoSnies(true);
    try {
      const filas = proyectos.map((p) => ({
        Nombre: p.nombre,
        Categoría: categoriaLabel(p.categoria),
        Estado: p.estado === 'activo' ? 'Activo' : 'Finalizado',
        'Fecha inicio': p.fechaInicio,
        'Fecha fin': p.fechaFin || 'Sin definir',
        Descripción: p.descripcion || '',
        'Total participantes': p.totalParticipantes,
        'Integrantes del equipo': p.equipo.map((u) => u.nombre).join(', '),
      }));
      descargarLibro([{ nombre: 'Reporte SNIES', filas }], `reporte-snies-${fechaHoyArchivo()}.xlsx`);
    } finally {
      setGenerandoSnies(false);
    }
  }

  // Reporte de un solo proyecto existente: a diferencia del constructor de
  // arriba (que usa los proyectos ya cargados en la lista), aqui se vuelve a
  // pedir el proyecto por GET /api/proyectos/:id porque ese es el unico
  // endpoint que trae la lista real de participantes vinculados (el listado
  // general solo trae el conteo, ver INCLUDE_COMPLETO en el backend).
  async function handleGenerarReporteProyecto() {
    setError('');
    if (!proyectoSeleccionadoId) {
      setError('Selecciona un proyecto para generar su reporte.');
      return;
    }
    setGenerandoProyecto(true);
    try {
      const proyecto = await obtenerProyecto(proyectoSeleccionadoId);
      const hojas = [
        {
          nombre: 'Datos generales',
          filas: [
            { Campo: 'Nombre', Valor: proyecto.nombre },
            { Campo: 'Categoría', Valor: categoriaLabel(proyecto.categoria) },
            { Campo: 'Estado', Valor: proyecto.estado === 'activo' ? 'Activo' : 'Finalizado' },
            { Campo: 'Fecha inicio', Valor: proyecto.fechaInicio },
            { Campo: 'Fecha fin', Valor: proyecto.fechaFin || 'Sin definir' },
            { Campo: 'Descripción', Valor: proyecto.descripcion || '' },
            { Campo: 'Total participantes', Valor: proyecto.totalParticipantes },
          ],
        },
      ];

      if (proyecto.equipo.length > 0) {
        hojas.push({
          nombre: 'Equipo',
          filas: proyecto.equipo.map((u) => ({ Nombre: u.nombre, Correo: u.correo, Rol: u.rol })),
        });
      }

      if (proyecto.cronograma.length > 0) {
        hojas.push({
          nombre: 'Cronograma',
          filas: proyecto.cronograma.map((h) => ({ Hito: h.titulo, Fecha: h.fecha })),
        });
      }

      if (proyecto.participantes.length > 0) {
        hojas.push({
          nombre: 'Participantes',
          filas: proyecto.participantes.map((p) => ({ Nombre: p.nombre, Documento: p.identificacion })),
        });
      }

      if (proyecto.formulario.length > 0) {
        hojas.push({
          nombre: 'Formulario',
          filas: proyecto.formulario.map((c) => ({
            Campo: c.etiqueta,
            Tipo: LABEL_TIPO_CAMPO[c.tipo] || c.tipo,
            'Valor / Opciones': valorCampoTexto(c),
          })),
        });
      }

      if (proyecto.archivosAdjuntos.length > 0) {
        hojas.push({
          nombre: 'Archivos adjuntos',
          filas: proyecto.archivosAdjuntos.map((a) => ({ Archivo: a.nombreOriginal || a.archivo })),
        });
      }

      descargarLibro(hojas, `reporte-${nombreArchivoSeguro(proyecto.nombre)}-${fechaHoyArchivo()}.xlsx`);
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo generar el reporte del proyecto.');
    } finally {
      setGenerandoProyecto(false);
    }
  }

  return (
    <div className="reportes-page">
      <h1 className="reportes-title">Reportes</h1>
      <p className="reportes-subtitle">Construye reportes personalizados y exporta datos</p>

      {error && <div className="alert-error">{error}</div>}

      <div className="reportes-layout">
        <div className="reportes-card">
          <h2 className="reportes-card-title">Campos a incluir</h2>
          <div className="reportes-campos-grid">
            {CAMPOS_DISPONIBLES.map((c) => (
              <label className="reportes-check" key={c.value}>
                <input
                  type="checkbox"
                  className="reportes-check-input"
                  checked={Boolean(campos[c.value])}
                  onChange={() => toggleCampo(c.value)}
                />
                <span className="reportes-check-circulo" />
                <span>{c.label}</span>
              </label>
            ))}
          </div>

          <h2 className="reportes-card-title reportes-card-title-filtros">Filtros</h2>
          <div className="reportes-filtros-grid">
            <div className="reportes-filtro">
              <label htmlFor="r-desde">Desde</label>
              <input id="r-desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
            </div>
            <div className="reportes-filtro">
              <label htmlFor="r-hasta">Hasta</label>
              <input id="r-hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
            </div>
            <div className="reportes-filtro">
              <label htmlFor="r-tipo">Tipo de proyecto</label>
              <select id="r-tipo" value={tipoProyecto} onChange={(e) => setTipoProyecto(e.target.value)}>
                <option value="">Todos</option>
                {CATEGORIAS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="reportes-filtro">
              <label htmlFor="r-estado">Estado</label>
              <select id="r-estado" value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}>
                <option value="">Todos</option>
                {ESTADOS.map((e) => (
                  <option key={e.value} value={e.value}>
                    {e.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="reportes-acciones">
            <button type="button" className="btn btn-secondary" onClick={handleVistaPrevia} disabled={cargando}>
              <IconEye size={15} /> Vista previa
            </button>
            <button type="button" className="btn btn-primary" onClick={handleExportar} disabled={cargando}>
              <IconFileText size={15} /> Exportar a Excel
            </button>
          </div>
        </div>

        <div className="reportes-snies-card">
          <div className="reportes-snies-icono">
            <IconGraduationCap size={22} />
          </div>
          <h2 className="reportes-snies-title">Reporte SNIES</h2>
          <p className="reportes-snies-texto">
            Reporte institucional con formato fijo para el Sistema Nacional de Información de la Educación
            Superior.
          </p>
          <button type="button" className="reportes-snies-btn" onClick={handleGenerarSnies} disabled={generandoSnies || cargando}>
            {generandoSnies ? 'Generando...' : 'Generar Reporte SNIES'}
          </button>
        </div>
      </div>

      <div className="reportes-card reportes-proyecto-card">
        <h2 className="reportes-card-title">Reporte de un proyecto</h2>
        <p className="reportes-proyecto-texto">
          Elige un proyecto existente para generar un reporte detallado con sus datos generales, equipo,
          cronograma, participantes vinculados, formulario de recolección y archivos adjuntos.
        </p>
        <div className="reportes-proyecto-fila">
          <select
            className="reportes-proyecto-select"
            value={proyectoSeleccionadoId}
            onChange={(e) => setProyectoSeleccionadoId(e.target.value)}
            disabled={cargando || proyectos.length === 0}
          >
            <option value="">Selecciona un proyecto...</option>
            {proyectos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleGenerarReporteProyecto}
            disabled={generandoProyecto || cargando || !proyectoSeleccionadoId}
          >
            <IconFileText size={15} /> {generandoProyecto ? 'Generando...' : 'Generar reporte'}
          </button>
        </div>
        {proyectos.length === 0 && !cargando && (
          <p className="reportes-vacio">Todavía no hay proyectos registrados.</p>
        )}
      </div>

      {mostrarVistaPrevia && (
        <div className="reportes-preview-card">
          <h2 className="reportes-card-title">
            Vista previa ({filtrados.length} {filtrados.length === 1 ? 'proyecto' : 'proyectos'})
          </h2>
          {cargando ? (
            <p className="reportes-vacio">Cargando...</p>
          ) : filtrados.length === 0 ? (
            <p className="reportes-vacio">Ningún proyecto coincide con los filtros elegidos.</p>
          ) : (
            <div className="reportes-preview-tabla-wrap">
              <table className="reportes-preview-tabla">
                <thead>
                  <tr>
                    {camposElegidos.map((c) => (
                      <th key={c.value}>{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((p) => (
                    <tr key={p.id}>
                      {camposElegidos.map((c) => (
                        <td key={c.value}>{valorCampo(c.value, p)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
