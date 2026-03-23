import Modal from '../../shared/Modal';
import { useAppContext } from '../../contexts/AppContext';
import { SCROLL_OFFSET } from '../../constants/config';

export default function SportModal() {
  const { activeSport: sport, closeSportModal } = useAppContext();
  if (!sport) return null;

  function handleRegister() {
    const el = document.getElementById('contact-us');
    if (el) window.scrollTo({ top: el.offsetTop - SCROLL_OFFSET, behavior: 'smooth' });
    window.dispatchEvent(new CustomEvent('pfx:selectSport', { detail: sport._id || sport.eventId }));
    closeSportModal();
  }

  const dateObj = new Date(sport.eventDate);
  const formattedDate = !isNaN(dateObj) 
    ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : sport.eventDate;

  return (
    <Modal onClose={closeSportModal} className="sport-modal-content">
      <div className="sport-modal-hero">
        <div className="sport-modal-badge">PFX Sport Event</div>
        <h3>{sport.eventName}</h3>
        <p>{sport.eventDescription}</p>
      </div>
      <div className="sport-modal-body">
        <div className="sport-modal-column">
          {sport.subcategories && sport.subcategories.length > 0 ? (
            <>
              <h4>Event Categories</h4>
              <ul>
                {sport.subcategories.map((sub, i) => <li key={sub._id || i}>{sub.name}</li>)}
              </ul>
            </>
          ) : (
            <>
              <h4>Eligibility</h4>
              <p>Open for registration. All participants must agree to terms & conditions upon registering.</p>
            </>
          )}
        </div>
        <div className="sport-modal-column">
          <h4>Event Details</h4>
          <p><strong>Date:</strong> {formattedDate}</p>
          <p><strong>Time:</strong> {sport.eventTime}</p>
          <p><strong>Location:</strong> {sport.eventLocation || 'TBD'}</p>
          <p><strong>Capacity:</strong> {sport.eventCapacity} participants</p>
          <p><strong>Entry Fee:</strong> ₹{sport.eventPrice}</p>
          <p>
            <strong>Registration:</strong>{' '}
            {sport.paymentMethod === 'online'
              ? 'Online payment required during registration.'
              : 'Submit form, then call event admin to confirm slot.'}
          </p>
          <button className="btn primary" onClick={handleRegister}>
            Register for this Event
          </button>
        </div>
      </div>
    </Modal>
  );
}
