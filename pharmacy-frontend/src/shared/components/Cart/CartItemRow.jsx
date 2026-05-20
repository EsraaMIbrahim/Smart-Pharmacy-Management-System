export default function CartItemRow({ item, onRemove }) {
  return (
    <tr>
      <td>{item.name}</td>
      <td>{item.quantity}</td>
      <td>{item.totalPrice} EGP</td>
      <td>
        <button className="cart-delete" onClick={() => onRemove(item.cartId)}>
          Delete
        </button>
      </td>
    </tr>
  );
}
