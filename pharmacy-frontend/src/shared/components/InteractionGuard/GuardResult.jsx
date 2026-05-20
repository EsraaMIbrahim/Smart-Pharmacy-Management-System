export default function GuardResult({ message }) {
  if (!message) return null;

  const isDanger = message.toLowerCase().includes("danger");

  return (
    <div className={`guard-result ${isDanger ? "danger" : "safe"}`}>
      {message}
    </div>
  );
}
