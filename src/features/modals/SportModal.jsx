import Modal from '../../shared/Modal';
import { useAppContext } from '../../contexts/AppContext';
import { SCROLL_OFFSET } from '../../constants/config';

export default function SportModal() {
  const { activeSport: sport, closeSportModal } = useAppContext();
  if (!sport) return null;

  function handleRegister() {
    const el = document.getElementById('athlete-registration');
    if (el) window.scrollTo({ top: el.offsetTop - SCROLL_OFFSET, behavior: 'smooth' });
    window.dispatchEvent(new CustomEvent('pfx:selectSport', { detail: sport.id }));
    closeSportModal();
  }

  return (
    <Modal onClose={closeSportModal} className="sport-modal-content">
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
    </Modal>
  );
}
