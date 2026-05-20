// This hook manages the state and logic for the inventory page, including fetching medicines
// handling form data for adding/updating medicines, and providing functions to add, update, and delete medicines.
// It also handles the editing state and pre-fills the form when editing an existing medicine.

import { useEffect, useState } from "react";

import {
  fetchMedicines,
  createMedicine,
  updateMedicineById,
  deleteMedicineById,
} from "../../../services/medicines";

export function useInventory() {
  const [medicines, setMedicines] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    activeIngredient: "",
    price: 0,
    basePrice: 0,
    stockQuantity: 0,
    expiryDate: "",
    category: "",
    barcode: "",
    isActive: true,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);

  const loadMedicines = async () => {
    const data = await fetchMedicines();
    setMedicines(data);
  };
  const filteredMedicines = medicines.filter((med) => {
    const query = searchTerm.toLowerCase();

    return (
      med.name?.toLowerCase().includes(query) ||
      med.category?.toLowerCase().includes(query)
    );
  });

  useEffect(() => {
    loadMedicines();
  }, []);

  const addMedicine = async () => {
    await createMedicine(formData);
    await loadMedicines();
    clearForm();
  };

  const updateMedicine = async () => {
    await updateMedicineById(Number(editId), {
      ...formData,
    });
    await loadMedicines();
    console.log("EDIT ID:", editId);
    console.log({
      ...formData,
      id: editId,
    });
    clearForm();
  };

  const deleteMedicine = async (id) => {
    await deleteMedicineById(id);
    await loadMedicines();
  };

  const clearForm = () => {
    setFormData({
      name: "",
      activeIngredient: "",
      price: 0,
      stockQuantity: 0,
      expiryDate: "",
      category: "",
      barcode: "",
      isActive: true,
      basePrice: 0,
    });

    setIsEditing(false);
    setEditId(null);
  };
  const handleEditClick = (med) => {
    setFormData({
      name: med.name,

      activeIngredient: med.activeIngredient,

      price: med.price,

      basePrice: med.basePrice || 0,

      stockQuantity: med.stockQuantity,

      expiryDate: med.expiryDate?.split("T")[0],

      category: med.category || "",

      barcode: med.barcode || "",

      isActive: med.isActive ?? true,
    });

    setEditId(med.id);

    setIsEditing(true);
  };

  // ============================================
  // INTERACTION SAFETY
  // ============================================

  const checkSafety = async (med1, med2) => {
    const first = med1.toLowerCase();

    const second = med2.toLowerCase();

    // Mock interaction rules

    if (
      (first.includes("aspirin") && second.includes("warfarin")) ||
      (first.includes("warfarin") && second.includes("aspirin"))
    ) {
      return "🚨 DANGER: Serious interaction detected!";
    }

    if (first === second) {
      return "⚠️ Duplicate medicine warning.";
    }

    return "✅ No known interaction detected.";
  };

  // ============================================
  // FIND ALTERNATIVES
  // ============================================

  const findAlternatives = async (medicineName) => {
    const medicine = medicines.find((m) =>
      m.name?.toLowerCase().includes(medicineName.toLowerCase()),
    );

    if (!medicine) {
      return [];
    }

    // Find medicines in same category
    // excluding the searched medicine

    const alternatives = medicines.filter(
      (m) =>
        m.category === medicine.category &&
        m.id !== medicine.id &&
        m.stockQuantity > 0,
    );

    return alternatives;
  };
  // ============================================
  // PRINT REPORT
  // ============================================

  const handlePrint = () => {
    window.print();
  };

  return {
    medicines,
    filteredMedicines,
    handlePrint,

    searchTerm,
    setSearchTerm,

    formData,
    setFormData,

    isEditing,

    addMedicine,
    updateMedicine,
    deleteMedicine,
    checkSafety,
    findAlternatives,

    handleEditClick,
  };
}
