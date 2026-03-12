export default function SportModal({ sport, onClose, onRegister }) {
  if (!sport) return null;

  function handleRegister() {
    onRegister(sport.id);
    onClose();
  }

  return (
    <div className="modal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content sport-modal-content">
        <button className="modal-close" onClick={onClose}>×</button>
        <div className="sport-modal-hero">
          <div className="sport-modal-badge">PFX Sport Event</div>
          <h3>{sport.name}</h3>
          <p>{sport.description}</p>
        </div>
        <div className="sport-modal-body">
          <div className="sport-modal-column">
            <h4>Rules &amp; Eligibility</h4>
            <ul>
              {sport.rules.map((rule, i) => <li key={i}>{rule}</li>)}
            </ul>
          </div>
          <div className="sport-modal-column">
            <h4>Event Details</h4>
            <p><strong>Date:</strong> {sport.date}</p>
            <p><strong>Time:</strong> {sport.time}</p>
            <p><strong>Prize Money:</strong> {sport.prize}</p>
            <p>
              <strong>Registration:</strong>{' '}
              {sport.requiresPayment
                ? 'Online payment required during registration.'
                : 'Submit form, then call event admin to confirm slot.'}
            </p>
            <button className="btn primary" onClick={handleRegister}>
              Register for this Sport
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
