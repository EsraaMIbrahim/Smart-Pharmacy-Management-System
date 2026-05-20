import Alert from "../../../shared/components/Alert/Alert";

export default function SuccessMessage({ isVisible, deliveryInfo, onClose }) {
  if (!isVisible) return null;

  return (
    <Alert
      type="success"
      title="🎉 Thank you for your order!"
      message={
        <>
          Your medicines are being prepared and will be sent to:{" "}
          <strong>{deliveryInfo.address}</strong>
        </>
      }
      onClose={onClose}
    />
  );
}
