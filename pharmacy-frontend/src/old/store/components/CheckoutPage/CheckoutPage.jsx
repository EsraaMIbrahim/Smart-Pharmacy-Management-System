import OrderSummary from "./OrderSummary";
import CheckoutForm from "./CheckoutForm";
import "../styles/checkout.css";

export default function CheckoutPage({
  cart,
  removeFromCart,
  deliveryInfo,
  setDeliveryInfo,
  handleCheckout,
  onBack,
}) {
  return (
    <div className="checkout-page">
      <button className="back-btn" onClick={onBack}>
        ⬅ Back to Medicines
      </button>

      <div className="checkout-grid">
        <OrderSummary cart={cart} removeFromCart={removeFromCart} />

        <CheckoutForm
          deliveryInfo={deliveryInfo}
          setDeliveryInfo={setDeliveryInfo}
          handleCheckout={handleCheckout}
        />
      </div>
    </div>
  );
}
