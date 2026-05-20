import OrdersTable from "./OrdersTable";
import "./orders.css";
export default function OrdersPage({ myOrders, onBack }) {
  return (
    <div className="orders-page">
      <h2>📦 My Online Orders</h2>
      <p>Track your recent pharmacy purchases and delivery status.</p>

      <OrdersTable orders={myOrders} />

      <button className="back-btn" onClick={onBack}>
        ⬅ Back to Shopping
      </button>
    </div>
  );
}
