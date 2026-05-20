export default function TopMedicines({ items = [] }) {
  return (
    <div className="widget-card">
      <h3>🔥 Top Selling Medicines</h3>

      {!items.length ? (
        <p>No sales data available.</p>
      ) : (
        <ul className="widget-list">
          {items.map((item, index) => (
            <li key={index}>
              <span>{item.name}</span>

              <strong>{item.sales} sold</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
