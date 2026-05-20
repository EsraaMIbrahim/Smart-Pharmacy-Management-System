import SupplierForm from "./components/SupplierForm";

import SuppliersTable from "./components/SuppliersTable";

import "./styles/suppliers.css";

export default function SuppliersPage(props) {
  const {
    suppliers,

    userRole,

    form,

    isEditing,

    handleChange,

    handleSubmit,

    reset,

    fillForm,

    deleteSupplier,
  } = props;

  return (
    <>
      <article className="page_header no-print">
        <h1 className="page_title">Supplier Management</h1>
      </article>

      <div className="suppliers-page">
        <SupplierForm
          form={form}
          handleChange={handleChange}
          isEditing={isEditing}
          onSubmit={handleSubmit}
          onCancel={reset}
        />

        <SuppliersTable
          suppliers={suppliers}
          userRole={userRole}
          onEdit={fillForm}
          onDelete={deleteSupplier}
        />
      </div>
    </>
  );
}
