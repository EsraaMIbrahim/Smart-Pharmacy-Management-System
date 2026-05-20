// This file defines the navigation configuration for different user roles in the pharmacy management system.
// Each role has a list of navigation items, where each item includes a label for display, a view identifier for routing,

export const navigationConfig = {
  Client: [
    { label: "Shop Medicines", view: "client_store" },
    { label: "My Orders", view: "my_orders", action: "fetchHistory" },
  ],
  Staff: [
    { label: "Inventory", view: "inventory" },
    { label: "Patients", view: "patients" },
    { label: "Suppliers", view: "suppliers" },
  ],
  Admin: [
    { label: "Inventory", view: "inventory" },
    { label: "Patients", view: "patients" },
    { label: "Suppliers", view: "suppliers" },
  ],
  Pharmacist: [
    { label: "Inventory", view: "inventory" },
    { label: "Patients", view: "patients" },
    { label: "Suppliers", view: "suppliers" },
  ],
};
