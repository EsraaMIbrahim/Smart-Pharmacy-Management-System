import OrderRow from "./OrderRow";

import EmptyState from "./EmptyState";

export default function OrdersTable({ orders = [] }) {
  return (
    <div className="orders-card">
      <table className="orders-table">
        <thead>
          <tr>
            <th>Date</th>

            <th>Medicine Items</th>

            <th>Delivery Address</th>

            <th>Total Paid</th>

            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {orders.length > 0 ? (
            orders.map((order) => <OrderRow key={order.id} order={order} />)
          ) : (
            <EmptyState />
          )}
        </tbody>
      </table>
    </div>
  );
}
