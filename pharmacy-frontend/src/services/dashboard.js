import api from "./api";

// ============================================
// FETCH MEDICINES
// ============================================

export const fetchMedicines = async () => {
  const response = await api.get("/Medicines");

  return response.data.map((m) => ({
    id: m.id,

    name: m.name || m.Name,

    category: m.category || m.Category,

    expiryDate: m.expiryDate || m.ExpiryDate,

    stockQuantity: m.stockQuantity || m.StockQuantity,

    price: m.price || m.Price,

    basePrice: m.basePrice || m.BasePrice,
  }));
};

// ============================================
// FETCH ONLINE ORDERS
// ============================================

export const fetchOrders = async () => {
  const response = await api.get("/OnlineOrders");

  return response.data;
};

// ============================================
// FETCH SUPPLIERS
// ============================================

export const fetchSuppliers = async () => {
  const response = await api.get("/Suppliers");

  return response.data;
};

// ============================================
// FETCH PATIENTS
// ============================================

export const fetchPatients = async () => {
  const response = await api.get("/Patients");

  return response.data;
};
