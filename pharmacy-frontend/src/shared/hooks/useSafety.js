// This custom hook manages the state and logic for checking the safety of drug interactions.
// It allows users to input two medications and checks for potential interactions between them.
// The hook maintains the state of the medication names and the resulting safety message.

import { useState } from "react";
import { checkInteraction } from "../../services/medicines.service";

export function useSafety() {
  const [med1, setMed1] = useState("");
  const [med2, setMed2] = useState("");
  const [safetyMessage, setSafetyMessage] = useState("");

  const handleCheckSafety = async () => {
    try {
      const data = await checkInteraction(med1, med2);
      setSafetyMessage(data);
    } catch (error) {
      setSafetyMessage(error.response?.data || "⚠️ Connection Error");
    }
  };

  return {
    med1,
    med2,
    setMed1,
    setMed2,
    safetyMessage,
    handleCheckSafety,
  };
}
