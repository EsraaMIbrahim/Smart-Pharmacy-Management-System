// This custom hook manages the state and logic related to suppliers, including fetching suppliers, managing purchase history, and handling CRUD operations for suppliers.
// It provides a clean interface for components to interact with supplier-related data and actions without having to manage
// the individual states and API calls directly in the component.
// This separation of concerns helps keep components focused on presentation while the hook handles the business logic and data management.

import { useEffect, useState } from "react";

import {
  fetchSuppliers,
  createSupplier,
  updateSupplierById,
  deleteSupplierById,
  fetchPurchaseHistory,
  createShipment,
} from "../../../services/suppliers";

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState([]);

  const [purchaseHistory, setPurchaseHistory] = useState([]);

  const [order, setOrder] = useState({
    medicineId: "",
    supplierId: "",
    quantity: 0,
    costPrice: 0,
  });

  const loadSuppliers = async () => {
    const data = await fetchSuppliers();
    setSuppliers(data);
  };

  const loadPurchaseHistory = async () => {
    const data = await fetchPurchaseHistory();
    setPurchaseHistory(data);
  };

  useEffect(() => {
    loadSuppliers();
    loadPurchaseHistory();
  }, []);

  const addSupplier = async (payload) => {
    await createSupplier(payload);
    await loadSuppliers();
  };

  const updateSupplier = async (id, payload) => {
    await updateSupplierById(id, payload);
    await loadSuppliers();
  };

  const deleteSupplier = async (id) => {
    await deleteSupplierById(id);
    await loadSuppliers();
  };
  // ============================================
  // RECORD SHIPMENT
  // ============================================

  const recordShipment = async (payload) => {
    await createShipment(payload);
  };

  return {
    suppliers,
    purchaseHistory,
    order,
    recordShipment,
    setOrder,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    loadPurchaseHistory,
  };
}
