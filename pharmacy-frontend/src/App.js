import "./App.css";
import AppRouter from "./app/router/AppRouter";
import { AuthProvider } from "./context/AuthContext";
import { useInventory } from "./pages/inventory/hooks/useInventory";
import { useCart } from "./shared/components/Cart/useCart";
import { usePatients } from "./pages/patients/hooks/usePatients";
import { usePatientForm } from "./pages/patients/hooks/usePatientForm";
import { useSuppliers } from "./pages/suppliers/hooks/useSuppliers";
import { useSupplierForm } from "./pages/suppliers/hooks/useSupplierForm";
import { useShipmentForm } from "./pages/suppliers/hooks/useShipmentForm";
import { useSalesAnalytics } from "./pages/store/hooks/useSalesAnalytics";

function App() {
  const inventory = useInventory();
  const cart = useCart();
  const patients = usePatients();
  const patientForm = usePatientForm(
    patients.addPatient,
    patients.updatePatient,
  );
  const suppliers = useSuppliers();
  const supplierForm = useSupplierForm(
    suppliers.addSupplier,
    suppliers.updateSupplier,
  );
  const shipmentForm = useShipmentForm(suppliers.recordShipment);
  const analytics = useSalesAnalytics(cart.cart);

  return (
    <AuthProvider>
      <AppRouter
        inventory={inventory}
        cart={cart}
        patients={patients}
        patientForm={patientForm}
        suppliers={suppliers}
        supplierForm={supplierForm}
        shipmentForm={shipmentForm}
        analytics={analytics}
      />
    </AuthProvider>
  );
}

export default App;
