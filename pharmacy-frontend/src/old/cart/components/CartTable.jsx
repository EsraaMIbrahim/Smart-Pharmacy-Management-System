import CartItemRow from "./CartItemRow";

export default function CartTable({ cart, removeFromCart }) {
  return (
    <table className="cart-table">
      <thead>
        <tr>
          <th>Medicine</th>
          <th>Qty</th>
          <th>Subtotal</th>
          <th>Action</th>
        </tr>
      </thead>

      <tbody>
        {cart.map((item) => (
          <CartItemRow
            key={item.cartId}
            item={item}
            onRemove={removeFromCart}
          />
        ))}
      </tbody>
    </table>
  );
}
