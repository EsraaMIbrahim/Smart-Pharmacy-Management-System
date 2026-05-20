import DashboardHeader from "./components/DashboardHeader";
import KPIGrid from "./components/KPIGrid";
import PatientsOverTime from "./components/PatientsOverTime";
import ExpiryRiskChart from "./components/ExpiryRiskChart";
import DashboardLayout from "./components/DashboardLayout";
import TopMedicines from "./components/TopMedicines";
import LowStockAlerts from "./components/LowStockAlerts";
import VIPPatients from "./components/VIPPatients";
import { useDashboardAnalytics } from "./hooks/useDashboardAnalytics";
import "./styles/dashboard.css";

export default function Dashboard() {
  const {
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
  } = useDashboardAnalytics();

  if (loading) {
    return (
      <div className="dashboard-page">
        <h2>Loading dashboard...</h2>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <DashboardHeader />

      <KPIGrid
        dailySales={dailySales}
        monthlySales={monthlySales}
        suppliersNum={suppliersNum}
        patientsNumb={patientsNumb}
        medicinesCount={medicinesCount}
        averageOrderValue={averageOrderValue}
        wasteRevenue={wasteRevenue}
      />

      <DashboardLayout>
        <PatientsOverTime data={monthlyPatientsData} />

        <ExpiryRiskChart data={expiryData} />
      </DashboardLayout>

      <div className="dashboard-widgets">
        <TopMedicines items={topMedicines} />

        <LowStockAlerts items={lowStockMedicines} />

        <VIPPatients items={vipPatients} />
      </div>
    </div>
  );
}
