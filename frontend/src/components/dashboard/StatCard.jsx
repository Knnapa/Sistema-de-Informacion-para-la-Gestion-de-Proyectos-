import './StatCard.css';

export default function StatCard({ icon: Icon, value, label, tint }) {
  return (
    <div className="stat-card">
      <div className="stat-card-icon" style={{ background: tint.bg, color: tint.fg }}>
        <Icon size={20} />
      </div>
      <div className="stat-card-body">
        <span className="stat-card-value">{value}</span>
        <span className="stat-card-label">{label}</span>
      </div>
    </div>
  );
}
