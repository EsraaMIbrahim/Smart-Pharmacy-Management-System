export default function StatusBadge({ status }) {
  const isDelivered = status === "Delivered";

  return (
    <span className={`status-badge ${isDelivered ? "delivered" : "pending"}`}>
      {isDelivered ? "✅ Delivered" : `🚚 ${status}`}
    </span>
  );
}
