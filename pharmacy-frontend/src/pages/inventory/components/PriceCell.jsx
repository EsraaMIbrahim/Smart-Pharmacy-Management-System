export default function PriceCell({
  med,
  discount,
  userRole,
  onApplyDiscount,
}) {
  const suggested = med.price * (1 - discount);

  if (discount > 0 && med.price > suggested) {
    return (
      <div className="price-alert">
        <input
          type="number"
          value={med.price}
          disabled={userRole === "Staff"}
          readOnly={userRole === "Staff"}
        />

        <div className="price-suggestion">
          Suggest: {suggested.toFixed(2)} EGP
        </div>

        {userRole !== "Staff" ? (
          <div className="price-actions">
            <button onClick={() => onApplyDiscount(med)}>Accept</button>
          </div>
        ) : (
          <div className="pending">Pending Approval...</div>
        )}
      </div>
    );
  }

  return <span>{med.price.toFixed(2)} EGP</span>;
}
