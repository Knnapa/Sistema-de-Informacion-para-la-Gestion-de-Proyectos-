// Donut de varias categorias (tipo de poblacion): aqui el color si es la
// identidad de cada segmento, por eso usa la paleta categorica validada
// (orden fijo, separacion segura para daltonismo) y va siempre con leyenda.
import './charts.css';

const PALETTE = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#4a3aa7'];
const GAP_PX = 3; // separador entre segmentos (equivalente al "surface gap" del spec)

export default function DonutChart({ data, size = 168, thickness = 26 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  let acc = 0;
  const segments = data.map((d, i) => {
    const frac = d.value / total;
    const segLen = frac * circumference;
    const dash = `${Math.max(segLen - GAP_PX, 0)} ${circumference - Math.max(segLen - GAP_PX, 0)}`;
    const offset = -acc;
    acc += segLen;
    return { ...d, color: PALETTE[i % PALETTE.length], dash, offset };
  });

  return (
    <div className="donut-chart">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        role="img"
        aria-label="Participantes por tipo de poblacion"
      >
        <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
          {segments.map((s) => (
            <circle
              key={s.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeDasharray={s.dash}
              strokeDashoffset={s.offset}
            />
          ))}
        </g>
      </svg>

      <ul className="donut-legend">
        {segments.map((s) => (
          <li key={s.label}>
            <span className="donut-swatch" style={{ background: s.color }} />
            <span className="donut-legend-label">{s.label}</span>
            <span className="donut-legend-value">{Math.round((s.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
