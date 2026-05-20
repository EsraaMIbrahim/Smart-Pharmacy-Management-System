import KPICard from "./KPICard";

export default function KPIGrid({
  dailySales = 0,

  monthlySales = 0,

  suppliersNum = 0,

  patientsNumb = 0,

  medicinesCount = 0,

  employeesCount = 0,
}) {
  return (
    <div className="kpi-grid">
      <KPICard
        title="Daily Sales"
        value={`${dailySales.toLocaleString()} EGP`}
        subtitle="Today's pharmacy revenue"
      />

      <KPICard
        title="Monthly Sales"
        value={`${monthlySales.toLocaleString()} EGP`}
        subtitle="Current month revenue"
      />

      <KPICard
        title="Suppliers"
        value={suppliersNum}
        subtitle="Connected vendors"
      />

      <KPICard
        title="Patients"
        value={patientsNumb}
        subtitle="Registered customers"
      />

      <KPICard
        title="Medicines"
        value={medicinesCount}
        subtitle="Inventory items"
      />
      <KPICard
        title="Employees"
        value={employeesCount}
        subtitle="Number of staff members"
      />
    </div>
  );
}
