import { useState } from "react";

export function useInteractionGuard(checkSafety) {
  const [med1, setMed1] = useState("");
  const [med2, setMed2] = useState("");
  const [safetyMessage, setSafetyMessage] = useState("");

  const handleCheck = async () => {
    if (!med1 || !med2) {
      setSafetyMessage("Please enter both medicines");
      return;
    }

    const result = await checkSafety(med1, med2);
    setSafetyMessage(result);
  };

  return {
    med1,
    med2,
    setMed1,
    setMed2,
    safetyMessage,
    handleCheck,
  };
}
