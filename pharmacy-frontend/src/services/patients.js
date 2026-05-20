// This file contains functions to interact with the Patients API endpoints.
// It uses the Axios instance created in the api.js file to make HTTP requests to the backend server.
import api from "./api";

export const fetchPatients = async () => {
  const response = await api.get("/Patients");
  return response.data;
};

// export const createPatient = async (payload) => {
//   const response = await api.post("/Patients", payload);
//   return response.data;
// };
export const createPatient = async (patient) => {
  try {
    const response = await api.post("/Patients", patient);

    return response.data;
  } catch (error) {
    console.log("PATIENT CREATE ERROR:", error.response?.data);

    throw error;
  }
};

export const updatePatientById = async (id, payload) => {
  const response = await api.put(`/Patients/${id}`, payload);
  return response.data;
};

export const deletePatientById = async (id) => {
  const response = await api.delete(`/Patients/${id}`);
  return response.data;
};

export const fetchSalesHistory = async () => {
  const response = await api.get("/Patients/AllSales");
  return response.data;
};
