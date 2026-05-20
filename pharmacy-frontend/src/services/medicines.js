// This file contains functions to interact with the Medicines API endpoints.
// It uses the Axios instance created in the api.js file to make HTTP requests to the backend server.
// Each function corresponds to a specific API endpoint and HTTP method.
// allowing for operations such as fetching, creating, updating, and deleting medicines
// as well as checking for interactions and finding alternatives.

import api from "./api";

export const fetchMedicines = async () => {
  const response = await api.get("/Medicines");
  return response.data;
};

export const createMedicine = async (payload) => {
  const response = await api.post("/Medicines", payload);
  return response.data;
};

// export const updateMedicineById = async (id, payload) => {
//   const response = await api.put(`/Medicines/${id}`, payload);
//   return response.data;
// };

export const updateMedicineById = async (id, medicine) => {
  const payload = {
    ...medicine,

    id: Number(id),
  };

  const response = await api.put(`/Medicines/${id}`, payload);

  return response.data;
};

export const deleteMedicineById = async (id) => {
  const response = await api.delete(`/Medicines/${id}`);
  return response.data;
};

export const checkInteraction = async (med1, med2) => {
  const response = await api.get(
    `/Medicines/CheckInteractionByMedicine?med1=${med1}&med2=${med2}`,
  );

  return response.data;
};

export const findAlternatives = async (name) => {
  const response = await api.get(
    `/Medicines/FindAlternatives/${encodeURIComponent(name)}`,
  );

  return response.data;
};
