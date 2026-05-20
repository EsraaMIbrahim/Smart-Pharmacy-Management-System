import ToolButton from "./ToolButton";

export default function SafetyActions({ disableExpiredMedicines }) {
  const handleCleanup = () => {
    const confirmed = window.confirm(
      "Are you sure you want to disable ALL expired medicines?",
    );

    if (!confirmed) return;

    disableExpiredMedicines();
  };

  return (
    <div className="tools-container no-print">
      <ToolButton
        label="🧹 Auto-Disable All Expired Stock"
        onClick={handleCleanup}
        variant="purple"
      />
    </div>
  );
}
