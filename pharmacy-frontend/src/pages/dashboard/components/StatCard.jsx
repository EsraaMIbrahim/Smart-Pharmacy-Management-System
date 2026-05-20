export default function StatCard({ value, label, className }) {
  return (
    <div className={`stat-card ${className}`}>
      <h2>{value}</h2>
      <p>{label}</p>
    </div>
  );
}
