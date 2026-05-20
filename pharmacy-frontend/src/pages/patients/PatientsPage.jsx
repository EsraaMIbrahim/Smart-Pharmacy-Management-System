import PatientForm from "./components/PatientForm";
import PatientsTable from "./components/PatientsTable";
import PatientHistory from "./components/PatientHistory";

import "./styles/patients.css";

export default function PatientsPage(props) {
  const {
    patients,
    userRole,
    selectedPatient,
    selectedHistory,
    setSelectedPatient,
    form,
    isEditing,
    handleChange,
    handleSubmit,
    reset,
    fillForm,
    deletePatient,
    viewHistory,
  } = props;

  return (
    <>
      <article className="page_header no-print">
        <h1 className="page_title">Patient Management</h1>
      </article>
      <div className="patients-page">
        <PatientForm
          form={form}
          handleChange={handleChange}
          isEditing={isEditing}
          onSubmit={handleSubmit}
          onCancel={reset}
        />

        <PatientsTable
          patients={patients}
          userRole={userRole}
          onEdit={fillForm}
          onDelete={deletePatient}
          onViewHistory={viewHistory}
        />

        {/* stopped here ⚠️🚨*/}

        <PatientHistory
          patient={selectedPatient}
          history={selectedHistory}
          onClose={() => setSelectedPatient(null)}
        />
      </div>
    </>
  );
}
