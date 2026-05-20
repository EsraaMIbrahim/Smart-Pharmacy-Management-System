import OrdersTable from "./OrdersTable";

export default function OrdersPage({ myOrders, onBack }) {
  return (
    <div className="orders-page">
      <h2>📦 My Online Orders</h2>
      <p>Track your recent pharmacy purchases and delivery status.</p>

      <hr />

      <OrdersTable orders={myOrders} />

      <button className="back-btn" onClick={onBack}>
        ⬅ Back to Shopping
      </button>
    </div>
  );
}
