import { NavLink } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";

import "./sidebar.css";

export default function Sidebar() {
  const {
    user,

    logout,
  } = useAuth();

  return (
    <aside className="sidebar">
      <div>
        <h2 className="sidebar-logo">💊 Smart Pharmacy</h2>

        <p className="sidebar-role">{user?.role}</p>

        <nav className="sidebar-nav">
          {(user?.role === "Admin" || user?.role === "Pharmacist") && (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>

              <NavLink to="/inventory">Inventory</NavLink>

              <NavLink to="/patients">Patients</NavLink>

              <NavLink to="/suppliers">Suppliers</NavLink>
              <NavLink to="/shipments">Shipments</NavLink>
            </>
          )}

          <NavLink to="/store">Store</NavLink>
        </nav>
      </div>

      <button className="logout-btn" onClick={logout}>
        Logout
      </button>
    </aside>
  );
}
