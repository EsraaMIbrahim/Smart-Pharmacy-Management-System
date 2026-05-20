import { useState } from "react";

export function useShipmentForm(recordShipment) {
  // ============================================
  // INITIAL STATE
  // ============================================

  const initialState = {
    medicineId: "",

    supplierId: "",

    quantity: "",

    costPrice: "",
  };

  // ============================================
  // STATE
  // ============================================

  const [order, setOrder] = useState(initialState);

  // ============================================
  // RESET
  // ============================================

  const reset = () => {
    setOrder(initialState);
  };

  // ============================================
  // SUBMIT SHIPMENT
  // ============================================

  const submitShipment = async () => {
    if (
      !order.medicineId ||
      !order.supplierId ||
      !order.quantity ||
      !order.costPrice
    ) {
      alert("Please fill all shipment fields.");

      return;
    }

    try {
      const payload = {
        medicineId: Number(order.medicineId),

        supplierId: Number(order.supplierId),

        quantity: Number(order.quantity),

        costPrice: Number(order.costPrice),
      };

      console.log("SHIPMENT PAYLOAD:", payload);

      await recordShipment(payload);

      reset();
    } catch (error) {
      console.error("Shipment failed:", error);
    }
  };

  return {
    order,

    setOrder,

    submitShipment,

    reset,
  };
}
