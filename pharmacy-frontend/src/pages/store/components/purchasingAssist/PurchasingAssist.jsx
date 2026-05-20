import AlternativeMatcher from "../../alternatives/components/AlternativeMatcher";
import InteractionGuard from "../../safety/components/InteractionGuard";

export default function PurchasingAssist({ findAlternatives, checkSafety }) {
  return (
    <div>
      <h2>🧠 Smart Purchasing Assistant</h2>
      <div className="purchasing-assist">
        <AlternativeMatcher findAlternatives={findAlternatives} />
        <InteractionGuard checkSafety={checkSafety} />
      </div>
    </div>
  );
}
