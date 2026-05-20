export default function CartSummary({ total, onCheckout }) {
  return (
    <div className="cart-summary">
      <h4>Grand Total: {total} EGP</h4>

      <button className="cart-checkout" onClick={onCheckout}>
        Confirm & Process Purchase
      </button>
    </div>
  );
}
