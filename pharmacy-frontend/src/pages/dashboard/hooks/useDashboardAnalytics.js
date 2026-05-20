import { useEffect, useState } from "react";

import {
  fetchOrders,
  fetchSuppliers,
  fetchPatients,
  fetchMedicines,
} from "../../../services/dashboard";

export function useDashboardAnalytics() {
  // ============================================
  // STATE
  // ============================================

  const [salesVelocityData, setSalesVelocityData] = useState([]);

  const [monthlyPatientsData, setMonthlyPatientsData] = useState([]);

  const [expiryData, setExpiryData] = useState([]);

  const [topMedicines, setTopMedicines] = useState([]);

  const [lowStockMedicines, setLowStockMedicines] = useState([]);

  const [vipPatients, setVipPatients] = useState([]);

  const [dailySales, setDailySales] = useState(0);

  const [monthlySales, setMonthlySales] = useState(0);

  const [averageOrderValue, setAverageOrderValue] = useState(0);

  const [wasteRevenue, setWasteRevenue] = useState(0);

  const [suppliersNum, setSuppliersNum] = useState(0);

  const [patientsNumb, setPatientsNumb] = useState(0);

  const [medicinesCount, setMedicinesCount] = useState(0);

  const [loading, setLoading] = useState(true);

  // ============================================
  // LOAD DASHBOARD DATA
  // ============================================

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // ============================================
      // FETCH ALL DATA
      // ============================================

      const results = await Promise.allSettled([
        fetchMedicines(),

        fetchOrders(),

        fetchSuppliers(),

        fetchPatients(),
      ]);

      const medicines =
        results[0].status === "fulfilled" ? results[0].value : [];

      const orders = results[1].status === "fulfilled" ? results[1].value : [];

      const suppliers =
        results[2].status === "fulfilled" ? results[2].value : [];

      const patients =
        results[3].status === "fulfilled" ? results[3].value : [];

      // ============================================
      // COUNTS
      // ============================================

      setSuppliersNum(suppliers.length);

      setPatientsNumb(patients.length);

      setMedicinesCount(medicines.length);

      // ============================================
      // SALES VELOCITY
      // ============================================

      const salesMap = {};

      orders.forEach((order) => {
        const key = order.medicineName;

        if (!key) return;

        salesMap[key] = (salesMap[key] || 0) + order.quantity;
      });

      const velocity = Object.entries(salesMap).map(([name, sales]) => ({
        name,

        sales,
      }));

      setSalesVelocityData(velocity);

      // ============================================
      // TOP MEDICINES
      // ============================================

      const topSelling = [...velocity]
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

      setTopMedicines(topSelling);

      // ============================================
      // MONTHLY PATIENTS
      // ============================================

      const monthlyPatientsMap = {
        Jan: 0,
        Feb: 0,
        Mar: 0,
        Apr: 0,
        May: 0,
        Jun: 0,
        Jul: 0,
        Aug: 0,
        Sep: 0,
        Oct: 0,
        Nov: 0,
        Dec: 0,
      };

      patients.forEach((patient) => {
        if (!patient.createdAt) return;

        const date = new Date(patient.createdAt);

        const month = date.toLocaleString("default", {
          month: "short",
        });

        monthlyPatientsMap[month]++;
      });

      const monthlyPatients = Object.entries(monthlyPatientsMap).map(
        ([month, patients]) => ({
          month,

          patients,
        }),
      );

      setMonthlyPatientsData(monthlyPatients);

      // ============================================
      // EXPIRY ANALYTICS
      // ============================================

      const now = new Date();

      let safe = 0;

      let warning = 0;

      let critical = 0;

      let waste = 0;

      medicines.forEach((med) => {
        const expiry = new Date(med.expiryDate);

        const diffDays = (expiry - now) / (1000 * 60 * 60 * 24);

        // SAFE
        if (diffDays > 90) {
          safe++;
        }

        // WARNING
        else if (diffDays > 30) {
          warning++;
        }

        // CRITICAL
        else {
          critical++;

          waste += med.price * med.stockQuantity;
        }
      });

      setWasteRevenue(waste);

      setExpiryData([
        {
          name: "Safe",

          value: safe,
        },

        {
          name: "Warning",

          value: warning,
        },

        {
          name: "Critical",

          value: critical,
        },
      ]);

      // ============================================
      // LOW STOCK
      // ============================================

      const lowStock = medicines.filter((m) => m.stockQuantity < 10);

      setLowStockMedicines(lowStock);

      // ============================================
      // DAILY SALES
      // ============================================

      const today = new Date().toISOString().split("T")[0];

      const todayOrders = orders.filter(
        (o) => o.orderDate?.split("T")[0] === today,
      );

      const daily = todayOrders.reduce(
        (sum, order) => sum + order.totalPrice,
        0,
      );

      setDailySales(daily);

      // ============================================
      // MONTHLY SALES
      // ============================================

      const currentMonth = new Date().getMonth();

      const monthly = orders
        .filter((o) => new Date(o.orderDate).getMonth() === currentMonth)
        .reduce((sum, order) => sum + order.totalPrice, 0);

      setMonthlySales(monthly);

      // ============================================
      // AVERAGE ORDER VALUE
      // ============================================

      const avg = orders.length > 0 ? monthly / orders.length : 0;

      setAverageOrderValue(avg);

      // ============================================
      // VIP PATIENTS
      // ============================================

      const topPatients = [...patients]
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5);

      setVipPatients(topPatients);

      console.log("Dashboard Loaded");
    } catch (error) {
      console.error("Dashboard analytics failed:", error);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // EFFECT
  // ============================================

  useEffect(() => {
    loadDashboardData();
  }, []);

  return {
    salesVelocityData,

    monthlyPatientsData,

    expiryData,

    topMedicines,

    lowStockMedicines,

    vipPatients,

    dailySales,

    monthlySales,

    averageOrderValue,

    wasteRevenue,

    suppliersNum,

    patientsNumb,

    medicinesCount,

    loading,
  };
}
