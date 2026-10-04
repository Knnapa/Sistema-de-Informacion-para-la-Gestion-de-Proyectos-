import { useMemo, useState } from 'react';
import StatCard from '../components/dashboard/StatCard';
import BarChart from '../components/charts/BarChart';
import DonutChart from '../components/charts/DonutChart';
import { IconBriefcase, IconUsers, IconActivity } from '../components/icons/Icons';
import { resumenStats, proyectosPorCategoria, participantesPorTipo } from '../data/mockDashboardData';
import './Dashboard.css';

const TODAS = 'Todas las categorías';

export default function Dashboard() {
  const [categoria, setCategoria] = useState(TODAS);

  const opcionesCategoria = useMemo(
    () => [TODAS, ...proyectosPorCategoria.map((d) => d.label.join(' '))],
    [],
  );

  const datosBarras = useMemo(() => {
    if (categoria === TODAS) return proyectosPorCategoria;
    return proyectosPorCategoria.filter((d) => d.label.join(' ') === categoria);
  }, [categoria]);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Resumen de proyectos de extensión</p>
        </div>
        <select
          className="dashboard-filter"
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
        >
          {opcionesCategoria.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="dashboard-stats">
        <StatCard
          icon={IconBriefcase}
          value={resumenStats.totalProyectos}
          label="Total Proyectos"
          tint={{ bg: '#e7f0fb', fg: '#1d84f3' }}
        />
        <StatCard
          icon={IconUsers}
          value={resumenStats.totalParticipantes}
          label="Total Participantes"
          tint={{ bg: '#f1e9f7', fg: '#5a218e' }}
        />
        <StatCard
          icon={IconActivity}
          value={resumenStats.proyectosActivos}
          label="Proyectos Activos"
          tint={{ bg: '#e6f6ec', fg: '#0ca30c' }}
        />
      </div>

      <div className="dashboard-charts">
        <div className="dashboard-card">
          <h2 className="dashboard-card-title">Proyectos por Categoría</h2>
          <BarChart data={datosBarras} />
        </div>
        <div className="dashboard-card">
          <h2 className="dashboard-card-title">Participantes por Tipo de Población</h2>
          <DonutChart data={participantesPorTipo} />
        </div>
      </div>

      <p className="dashboard-note">
        Los datos de este tablero son de ejemplo. Se conectan a la API real cuando quede listo el
        módulo de Proyectos/Participantes.
      </p>
    </div>
  );
}
