// This custom hook manages the state and logic for the patients page.
// It provides functions to load patients, add a new patient,
// update an existing patient, and delete a patient.
// The hook maintains the current list of patients,
// the selected patient for viewing or editing,
// and the selected patient's history.

import { useEffect, useState } from "react";

import {
  fetchPatients,
  createPatient,
  updatePatientById,
  deletePatientById,
} from "../../../services/patients.js";

import { fetchOnlineOrders } from "../../../services/orders.js";

export function usePatients() {
  // ============================================
  // STATE
  // ============================================

  const [patients, setPatients] = useState([]);

  const [selectedPatient, setSelectedPatient] = useState(null);

  const [selectedHistory, setSelectedHistory] = useState([]);

  // ============================================
  // LOAD PATIENTS
  // ============================================

  const loadPatients = async () => {
    const data = await fetchPatients();

    setPatients(data);
  };

  useEffect(() => {
    loadPatients();
  }, []);

  // ============================================
  // ADD PATIENT
  // ============================================

  const addPatient = async (payload) => {
    await createPatient(payload);

    await loadPatients();
  };

  // ============================================
  // UPDATE PATIENT
  // ============================================

  const updatePatient = async (id, payload) => {
    await updatePatientById(id, payload);

    await loadPatients();
  };

  // ============================================
  // DELETE PATIENT
  // ============================================

  const deletePatient = async (id) => {
    await deletePatientById(id);

    await loadPatients();
  };

  // ============================================
  // VIEW HISTORY
  // ============================================

  const viewHistory = async (patient) => {
    try {
      setSelectedPatient(patient);

      // ============================================
      // FETCH USER HISTORY
      // ============================================

      const orders = await fetchOnlineOrders(patient.id);

      setSelectedHistory(orders);
    } catch (error) {
      console.error("Failed to load patient history:", error);

      setSelectedHistory([]);
    }
  };

  return {
    patients,

    selectedPatient,
    selectedHistory,

    setSelectedPatient,
    setSelectedHistory,

    addPatient,
    updatePatient,
    deletePatient,

    viewHistory,
  };
}
