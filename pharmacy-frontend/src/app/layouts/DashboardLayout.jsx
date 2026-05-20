import Sidebar from "../../shared/components/Sidebar/Sidebar";

import "./layouts.css";

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">{children}</main>
    </div>
  );
}
