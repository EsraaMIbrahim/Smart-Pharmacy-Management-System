import CartTable from "./CartTable";
import CartSummary from "./CartSummary";
import { useCart } from "../hooks/useCart";

export default function Cart({ cart, removeFromCart, handleCheckout }) {
  const { total } = useCart(cart);

  if (!cart.length) return null;

  return (
    <div className="cart-container">
      <h3>🛒 Pending Prescription (Basket)</h3>

      <CartTable cart={cart} removeFromCart={removeFromCart} />

      <CartSummary total={total} onCheckout={handleCheckout} />
    </div>
  );
}
