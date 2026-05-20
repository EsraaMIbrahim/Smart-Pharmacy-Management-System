import StatusBadge from "./StatusBadge";

export default function OrderRow({ order }) {
  return (
    <tr className="order-row">
      <td>{new Date(order.orderDate).toLocaleDateString()}</td>
      <td>{order.medicineName}</td>
      <td>{order.shippingAddress}</td>
      <td className="order-price">{order.totalPrice.toFixed(2)} EGP</td>
      <td>
        <StatusBadge status={order.status} />
      </td>
    </tr>
  );
}
