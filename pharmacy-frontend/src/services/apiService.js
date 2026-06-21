import axios from "axios";

// const BASE_URL = "http://localhost:5192/api";
const BASE_URL = "https://localhost:7168/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const pharmacyApi = {
  // --- Auth Operations ---
  register: (data) => apiClient.post("/Auth/register", data),
  login: (credentials) => apiClient.post("/Auth/login", credentials),

  // --- Medicine/Inventory Operations ---
  getMedicines: () => apiClient.get("/Medicines"),
  addMedicine: (data) => apiClient.post("/Medicines", data),
  updateMedicine: (id, data) => apiClient.put(`/Medicines/${id}`, data),

  // --- Clinical & Safety Operations ---

  checkInteraction: (cartIngredientId, newIngredientId) =>
    apiClient.get(
      `/DrugInteractions/check-safety?cartIngredientIds=${cartIngredientId}&newIngredientId=${newIngredientId}`,
    ),

  findAlternatives: (name) =>
    apiClient.get(`/Medicines/FindAlternatives/${name}`),

  // --- Patient Operations ---
  getPatients: () => apiClient.get("/Patients"),
  addPatient: (data) => apiClient.post("/Patients", data),
  updatePatient: (id, data) => apiClient.put(`/Patients/${id}`, data),
  deletePatient: (id) => apiClient.delete(`/Patients/${id}`),
  getPatientHistory: (id) => apiClient.get(`/Patients/${id}/history`),

  // --- Supplier Operations ---
  getSuppliers: () => apiClient.get("/Suppliers"),
  addSupplier: (data) => apiClient.post("/Suppliers", data),
  updateSupplier: (id, data) => apiClient.put(`/Suppliers/${id}`, data),
  deleteSupplier: (id) => apiClient.delete(`/Suppliers/${id}`),

  recordShipment: (data) => apiClient.post("/Suppliers/RecordShipment", data),
  getPurchaseHistory: () => apiClient.get("/Suppliers/PurchaseHistory"),
  getSalesHistory: () => apiClient.get("/Patients/AllSales"),

  // --- Order & Purchase Operations ---
  createOnlineOrder: (orderData) => apiClient.post("/OnlineOrders", orderData),
  recordPatientPurchase: (purchaseData) =>
    apiClient.post("/Patients/RecordPurchase", purchaseData),
  getMyHistory: (userId) => apiClient.get(`/OnlineOrders/MyHistory/${userId}`),
  createAppointment: (data) =>
    apiClient.post("/ConsultationAppointments", data),
  getMyAppointments: (userId) =>
    apiClient.get(`/ConsultationAppointments/my/${userId}`),
  cancelAppointment: (id, clientUserId) =>
    apiClient.patch(`/ConsultationAppointments/${id}/cancel`, { clientUserId }),
  getAppointmentsForManagement: (actorUserId) =>
    apiClient.get(
      `/ConsultationAppointments/management?actorUserId=${actorUserId}`,
    ),
  getPharmacists: (actorUserId) =>
    apiClient.get(
      `/ConsultationAppointments/pharmacists?actorUserId=${actorUserId}`,
    ),
  updateAppointment: (id, data) =>
    apiClient.patch(`/ConsultationAppointments/${id}`, data),

  // --- Analytics Endpoints ---
  getDashboardMetrics: () => apiClient.get("/Analytics/DashboardMetrics"),
  getSalesTrend: () => apiClient.get("/Analytics/SalesTrend"),
  getTopProducts: () => apiClient.get("/Analytics/TopProducts"),
  getAnalyticsShipments: () => apiClient.get("/Analytics/Shipments"),
  getClientOrders: () => apiClient.get("/Analytics/ClientOrders"),
  getExpiryEngine: () => apiClient.get("/Analytics/ExpiryEngine"),
};

export default pharmacyApi;
