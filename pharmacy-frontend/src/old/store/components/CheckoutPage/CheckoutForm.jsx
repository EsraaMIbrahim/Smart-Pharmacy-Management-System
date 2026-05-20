export default function CheckoutForm({
  deliveryInfo,
  setDeliveryInfo,
  handleCheckout,
}) {
  return (
    <div className="checkout-card">
      <h3>🚚 Delivery Info</h3>

      <textarea
        placeholder="Street Name, Building No, Apartment..."
        value={deliveryInfo.address}
        onChange={(e) =>
          setDeliveryInfo({
            ...deliveryInfo,
            address: e.target.value,
          })
        }
      />

      <h3>💳 Payment Options</h3>

      <select
        value={deliveryInfo.method}
        onChange={(e) =>
          setDeliveryInfo({
            ...deliveryInfo,
            method: e.target.value,
          })
        }
      >
        <option value="Cash">💵 Cash on Delivery</option>
        <option value="Visa">💳 Pay by Visa</option>
      </select>

      <button onClick={handleCheckout}>Confirm Order</button>
    </div>
  );
}
