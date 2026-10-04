// Grafico de barras de una sola serie (conteo de proyectos por categoria).
// Como las categorias ya estan identificadas por su etiqueta en el eje X,
// todas las barras usan el mismo color (no "arcoiris" por barra) -- el color
// no esta codificando informacion extra, asi que no hace falta leyenda.
const BAR_WIDTH = 26;
const GAP = 34;
const CHART_HEIGHT = 170;
const AXIS_PAD = 36;

export default function BarChart({ data, color = '#1D84F3' }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const niceMax = Math.max(Math.ceil(max / 2) * 2, 2);
  const steps = 4;
  const width = data.length * (BAR_WIDTH + GAP) + GAP;
  const totalHeight = CHART_HEIGHT + AXIS_PAD;

  return (
    <svg
      className="bar-chart"
      viewBox={`0 0 ${width} ${totalHeight}`}
      width="100%"
      height={totalHeight}
      role="img"
      aria-label="Proyectos por categoria"
    >
      {Array.from({ length: steps + 1 }).map((_, i) => {
        const y = CHART_HEIGHT - (i / steps) * CHART_HEIGHT;
        const val = Math.round((i / steps) * niceMax);
        return (
          <g key={i}>
            <line x1={0} x2={width} y1={y} y2={y} stroke="#e1e0d9" strokeWidth="1" />
            <text x={2} y={y - 4} fontSize="9.5" fill="#898781">
              {val}
            </text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const x = GAP + i * (BAR_WIDTH + GAP);
        const barHeight = (d.value / niceMax) * CHART_HEIGHT;
        const y = CHART_HEIGHT - barHeight;
        const lines = Array.isArray(d.label) ? d.label : [d.label];

        return (
          <g key={lines.join(' ')}>
            <rect x={x} y={y} width={BAR_WIDTH} height={Math.max(barHeight, 2)} rx="4" fill={color} />
            <text x={x + BAR_WIDTH / 2} y={y - 7} fontSize="11" fontWeight="600" fill="#333333" textAnchor="middle">
              {d.value}
            </text>
            {lines.map((line, li) => (
              <text
                key={line}
                x={x + BAR_WIDTH / 2}
                y={CHART_HEIGHT + 15 + li * 11}
                fontSize="9.5"
                fill="#777777"
                textAnchor="middle"
              >
                {line}
              </text>
            ))}
          </g>
        );
      })}

      <line x1={0} x2={width} y1={CHART_HEIGHT} y2={CHART_HEIGHT} stroke="#c3c2b7" strokeWidth="1" />
    </svg>
  );
}
