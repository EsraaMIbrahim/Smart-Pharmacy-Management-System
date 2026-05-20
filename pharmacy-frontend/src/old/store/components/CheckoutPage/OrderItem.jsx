export default function OrderItem({ item, onRemove }) {
  return (
    <div className="order-item">
      <div className="order-info">
        <strong>{item.name}</strong>
        <p>Quantity: {item.quantity}</p>
      </div>

      <strong>{item.totalPrice.toFixed(2)} EGP</strong>

      <button onClick={() => onRemove(item.cartId)}>🗑️ Remove</button>
    </div>
  );
}
