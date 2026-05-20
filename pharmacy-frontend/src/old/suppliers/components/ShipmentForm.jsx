export default function ShipmentForm({
  order,
  setOrder,
  medicines,
  suppliers,
  onSubmit,
}) {
  return (
    <div className="shipment-form">
      <h3>📥 Record Shipment</h3>

      <div className="shipment-grid">
        <select
          value={order.medicineId}
          onChange={(e) => setOrder({ ...order, medicineId: e.target.value })}
        >
          <option value="">-- Medicine --</option>
          {medicines.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        <select
          value={order.supplierId}
          onChange={(e) => setOrder({ ...order, supplierId: e.target.value })}
        >
          <option value="">-- Supplier --</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Quantity"
          value={order.quantity}
          onChange={(e) => setOrder({ ...order, quantity: e.target.value })}
        />

        <input
          type="number"
          placeholder="Cost"
          value={order.costPrice}
          onChange={(e) => setOrder({ ...order, costPrice: e.target.value })}
        />
      </div>

      <button onClick={onSubmit}>Confirm Shipment</button>
    </div>
  );
}
