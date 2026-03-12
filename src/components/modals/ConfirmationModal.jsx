export default function ConfirmationModal({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="modal">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content confirmation-content">
        <button className="modal-close" onClick={onClose}>×</button>
        <h3>Booking Confirmed</h3>
        <p>{message}</p>
      </div>
    </div>
  );
}
