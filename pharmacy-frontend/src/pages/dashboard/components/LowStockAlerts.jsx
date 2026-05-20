export default function LowStockAlerts({ items = [] }) {
  return (
    <div className="widget-card">
      <h3>⚠️ Low Stock Alerts</h3>

      {!items.length ? (
        <p>Inventory levels look healthy.</p>
      ) : (
        <ul className="widget-list">
          {items.map((med) => (
            <li key={med.id}>
              <span>{med.name}</span>

              <strong>{med.stockQuantity} left</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
