import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "../../pages/dashboard/Dashboard";

import InventoryPage from "../../pages/inventory/InventoryPage";

import PatientsPage from "../../pages/patients/PatientsPage";

import SuppliersPage from "../../pages/suppliers/SuppliersPage";

import StorePage from "../../pages/store/StorePage";

import LoginPage from "../../pages/auth/LoginPage";
import RegisterPage from "../../pages/auth/RegisterPage";

import ProtectedRoute from "./ProtectedRoute";

import RoleRoute from "./RoleRoute";
import DashboardLayout from "../layouts/DashboardLayout";
import ShipmentsPage from "../../pages/suppliers/ShipmentsPage";

export default function AppRouter(props) {
  return (
    <BrowserRouter>
      <Routes>
        {/* ============================================
            PUBLIC
        ============================================ */}

        <Route path="/login" element={<LoginPage />} />

        {/* ============================================
            DASHBOARD
        ============================================ */}

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["Pharmacist", "Admin"]}>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* ============================================
            INVENTORY
        ============================================ */}

        <Route
          path="/inventory"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["Pharmacist", "Admin"]}>
                <DashboardLayout>
                  <InventoryPage {...props.inventory} {...props.cart} />
                </DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* ============================================
            PATIENTS
        ============================================ */}

        <Route
          path="/patients"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["Admin", "Pharmacist"]}>
                <DashboardLayout>
                  <PatientsPage {...props.patients} {...props.patientForm} />
                </DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* ============================================
            SUPPLIERS
        ============================================ */}

        <Route
          path="/suppliers"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["Admin", "Pharmacist"]}>
                <DashboardLayout>
                  <SuppliersPage
                    {...props.suppliers}
                    {...props.supplierForm}
                    {...props.shipmentForm}
                    medicines={props.inventory.medicines}
                  />
                </DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* ============================================
            SHIPMENTS
        ============================================ */}

        <Route
          path="/shipments"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["Admin", "Pharmacist"]}>
                <DashboardLayout>
                  <ShipmentsPage
                    {...props.suppliers}
                    {...props.shipmentForm}
                    medicines={props.inventory.medicines}
                  />
                </DashboardLayout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* ============================================
            STORE
        ============================================ */}

        <Route
          path="/store"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <StorePage
                  {...props.inventory}
                  {...props.cart}
                  {...props.analytics}
                />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* ============================================
            DEFAULT
        ============================================ */}

        <Route path="*" element={<Navigate to="/login" />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}
