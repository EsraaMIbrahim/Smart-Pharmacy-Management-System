import { useState } from "react";

export default function ShipmentForm({
  order,

  setOrder,

  medicines,

  suppliers,

  onSubmit,
}) {
  const [error, setError] = useState("");

  // ============================================
  // VALIDATE
  // ============================================

  const validateForm = () => {
    if (!order.medicineId) {
      return "Please select a medicine";
    }

    if (!order.supplierId) {
      return "Please select a supplier";
    }

    if (!order.quantity || Number(order.quantity) <= 0) {
      return "Quantity must be greater than 0";
    }

    if (!order.costPrice || Number(order.costPrice) <= 0) {
      return "Cost must be greater than 0";
    }

    return null;
  };

  // ============================================
  // HANDLE SUBMIT
  // ============================================

  const handleSubmit = async () => {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);

      return;
    }

    try {
      setError("");

      await onSubmit();
    } catch (err) {
      setError("Failed to record shipment");

      console.error(err);
    }
  };

  return (
    <div className="shipment-form">
      <h3>Record Shipment</h3>

      {/* ============================================
          ERROR
      ============================================ */}

      {error && <div className="form-error">{error}</div>}

      <div className="shipment-grid">
        {/* ============================================
            MEDICINE
        ============================================ */}

        <select
          value={order.medicineId}
          onChange={(e) =>
            setOrder({
              ...order,

              medicineId: e.target.value,
            })
          }
        >
          <option value="">-- Medicine --</option>

          {medicines.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        {/* ============================================
            SUPPLIER
        ============================================ */}

        <select
          value={order.supplierId}
          onChange={(e) =>
            setOrder({
              ...order,

              supplierId: e.target.value,
            })
          }
        >
          <option value="">-- Supplier --</option>

          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {/* ============================================
            QUANTITY
        ============================================ */}

        <input
          type="number"
          placeholder="Quantity"
          value={order.quantity}
          onChange={(e) =>
            setOrder({
              ...order,

              quantity: e.target.value,
            })
          }
        />

        {/* ============================================
            COST
        ============================================ */}

        <input
          type="number"
          placeholder="Cost"
          value={order.costPrice}
          onChange={(e) =>
            setOrder({
              ...order,

              costPrice: e.target.value,
            })
          }
        />
      </div>

      <button onClick={handleSubmit}>Confirm Shipment</button>
    </div>
  );
}
