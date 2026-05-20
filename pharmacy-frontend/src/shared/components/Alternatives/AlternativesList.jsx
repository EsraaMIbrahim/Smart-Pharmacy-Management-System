export default function AlternativesList({ items }) {
  if (!items.length) {
    return <div className="alt-empty">No alternatives found.</div>;
  }

  return (
    <ul className="alt-list">
      {items.map((alt) => (
        <li key={alt.id}>
          <div>
            <strong>💊 {alt.name}</strong>
          </div>

          <div>{alt.price} EGP</div>

          <div>Stock: {alt.stockQuantity}</div>
        </li>
      ))}
    </ul>
  );
}
