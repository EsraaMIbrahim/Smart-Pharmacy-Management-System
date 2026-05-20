import OrderItem from "./OrderItem";
import { useCheckout } from "./useCheckout";

export default function OrderSummary({ cart, removeFromCart }) {
  const { total } = useCheckout(cart);

  return (
    <div className="checkout-card">
      <h2>🛒 Finalize Your Order</h2>

      {cart.map((item) => (
        <OrderItem key={item.cartId} item={item} onRemove={removeFromCart} />
      ))}

      <div className="checkout-total">Total Cost: {total.toFixed(2)} EGP</div>
    </div>
  );
}
