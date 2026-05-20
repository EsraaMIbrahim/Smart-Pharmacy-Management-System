// This file contains functions to interact with the Suppliers API endpoints. It uses the Axios instance created in the api.js file to make HTTP requests to the backend server.

import api from "./api";

export const fetchSuppliers = async () => {
  const response = await api.get("/Suppliers");
  return response.data;
};

export const createSupplier = async (payload) => {
  const response = await api.post("/Suppliers", payload);
  return response.data;
};

export const updateSupplierById = async (id, payload) => {
  const response = await api.put(`/Suppliers/${id}`, payload);
  return response.data;
};

export const deleteSupplierById = async (id) => {
  const response = await api.delete(`/Suppliers/${id}`);
  return response.data;
};

export const recordShipment = async (payload) => {
  const response = await api.post("/Suppliers/RecordShipment", payload);

  return response.data;
};

export const fetchPurchaseHistory = async () => {
  const response = await api.get("/Suppliers/PurchaseHistory");

  return response.data;
};

export const createShipment = async (payload) => {
  const response = await api.post("/Suppliers/RecordShipment", payload);

  return response.data;
};
