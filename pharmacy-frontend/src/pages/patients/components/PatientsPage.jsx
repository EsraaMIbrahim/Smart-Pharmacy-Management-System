import { usePatientForm } from "../hooks/usePatientForm";
import PatientForm from "./PatientForm";
import PatientsTable from "./PatientsTable";
import PatientHistory from "./PatientHistory";

export default function PatientsPage({
  patients,
  userRole,
  selectedPatient,
  selectedHistory,
  setSelectedPatient,
  addPatient,
  updatePatient,
  deletePatient,
  viewHistory,
}) {
  const { form, isEditing, handleChange, reset, fillForm } = usePatientForm();

  const handleSubmit = () => {
    if (!form.phoneNumber) {
      alert("Phone is required");
      return;
    }

    isEditing ? updatePatient(form) : addPatient(form);
    reset();
  };

  return (
    <div className="patients-page">
      <h2>👥 Patient Management</h2>

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

      <PatientHistory
        patient={selectedPatient}
        history={selectedHistory}
        onClose={() => setSelectedPatient(null)}
      />
    </div>
  );
}
