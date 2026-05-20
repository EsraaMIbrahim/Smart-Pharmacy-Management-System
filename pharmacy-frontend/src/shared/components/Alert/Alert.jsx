export default function Alert({ type = "success", title, message, onClose }) {
  return (
    <div className={`alert alert-${type}`}>
      {title && <h2 className="alert-title">{title}</h2>}

      {message && <p className="alert-message">{message}</p>}

      {onClose && (
        <button className="alert-close" onClick={onClose}>
          Dismiss
        </button>
      )}
    </div>
  );
}
