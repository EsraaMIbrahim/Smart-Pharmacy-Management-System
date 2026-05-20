import CartTable from "./CartTable";
import CartSummary from "./CartSummary";
import { useCart } from "./useCart";
import "./cart.css";
export default function Cart({ cart, removeFromCart, handleCheckout }) {
  const total = cart.reduce((sum, item) => sum + item.totalPrice, 0);

  if (!cart.length) return null;

  return (
    <div className="cart-container">
      <h2>Pending Prescription</h2>

      <CartTable cart={cart} removeFromCart={removeFromCart} />

      <CartSummary total={total} onCheckout={handleCheckout} />
    </div>
  );
}
