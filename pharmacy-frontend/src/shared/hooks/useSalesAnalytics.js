// This custom hook manages the state and logic for sales analytics in the pharmacy management system.
// It provides a clean interface for components to interact with the sales history, sales count map,
// top selling medicines, total sales count, and total revenue without having to manage the individual states and logic directly in the component.

import { useEffect, useMemo, useState } from "react";

import { fetchSalesHistory } from "../../services/patients.service";

export function useSalesAnalytics() {
  const [salesHistory, setSalesHistory] = useState([]);

  // ============================================
  // FETCH SALES
  // ============================================

  const loadSalesHistory = async () => {
    try {
      const data = await fetchSalesHistory();

      setSalesHistory(data);
    } catch (error) {
      console.error("Sales history error:", error);
    }
  };

  useEffect(() => {
    loadSalesHistory();
  }, []);

  // ============================================
  // SALES COUNT MAP
  // ============================================

  const salesCountMap = useMemo(() => {
    const counts = {};

    salesHistory.forEach((sale) => {
      const medicineName = sale.medicineName;

      counts[medicineName] = (counts[medicineName] || 0) + 1;
    });

    return counts;
  }, [salesHistory]);

  // ============================================
  // TOP SELLING MEDICINES
  // ============================================

  const topSellingMedicines = useMemo(() => {
    return Object.entries(salesCountMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [salesCountMap]);

  // ============================================
  // TOTAL SALES COUNT
  // ============================================

  const totalSales = useMemo(() => {
    return salesHistory.length;
  }, [salesHistory]);

  // ============================================
  // TOTAL REVENUE
  // ============================================

  const totalRevenue = useMemo(() => {
    return salesHistory.reduce((sum, sale) => sum + (sale.totalPrice || 0), 0);
  }, [salesHistory]);

  return {
    salesHistory,
    salesCountMap,

    topSellingMedicines,

    totalSales,
    totalRevenue,

    reloadSales: loadSalesHistory,
  };
}
