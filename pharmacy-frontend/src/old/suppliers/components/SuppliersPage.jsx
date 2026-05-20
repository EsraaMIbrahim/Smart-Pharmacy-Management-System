import { useSupplierForm } from "../hooks/useSupplierForm";
import SupplierForm from "./SupplierForm";
import ShipmentForm from "./ShipmentForm";
import SuppliersTable from "./SuppliersTable";
import SupplyHistory from "./SupplyHistory";
import "../styles/suppliers.css";

export default function SuppliersPage(props) {
  const { form, isEditing, handleChange, reset, fillForm } = useSupplierForm();

  const handleSubmit = () => {
    isEditing ? props.updateSupplier(form) : props.addSupplier(form);

    reset();
  };

  return (
    <div className="suppliers-page">
      <h2>🚚 Supplier Management</h2>

      <SupplierForm
        form={form}
        handleChange={handleChange}
        isEditing={isEditing}
        onSubmit={handleSubmit}
        onCancel={reset}
      />

      <ShipmentForm {...props} />

      <SuppliersTable
        suppliers={props.suppliers}
        userRole={props.userRole}
        onEdit={fillForm}
        onDelete={props.deleteSupplier}
      />

      <SupplyHistory history={props.purchaseHistory} />
    </div>
  );
}
