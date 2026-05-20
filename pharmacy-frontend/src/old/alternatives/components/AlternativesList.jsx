export default function AlternativesList({ items }) {
  if (!items.length) return null;

  return (
    <ul className="alt-list">
      {items.map((alt) => (
        <li key={alt.id}>
          {alt.name} - {alt.price} EGP (Stock: {alt.stockQuantity})
        </li>
      ))}
    </ul>
  );
}
