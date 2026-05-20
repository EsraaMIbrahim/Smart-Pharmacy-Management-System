import GuardInput from "./GuardInput";
import GuardResult from "./GuardResult";
import { useInteractionGuard } from "../hooks/useInteractionGuard";

export default function InteractionGuard({ checkSafety }) {
  const { med1, med2, setMed1, setMed2, safetyMessage, handleCheck } =
    useInteractionGuard(checkSafety);

  return (
    <div className="guard-container no-print">
      <h3>🛡️ Interaction Guard</h3>

      <div className="guard-inputs">
        <GuardInput
          placeholder="Medicine 1"
          value={med1}
          onChange={(e) => setMed1(e.target.value)}
        />

        <GuardInput
          placeholder="Medicine 2"
          value={med2}
          onChange={(e) => setMed2(e.target.value)}
        />

        <button className="guard-button" onClick={handleCheck}>
          Check Safety
        </button>
      </div>

      <GuardResult message={safetyMessage} />
    </div>
  );
}
