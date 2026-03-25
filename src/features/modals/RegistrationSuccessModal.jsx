import { useNavigate } from 'react-router-dom';
import Modal from '../../shared/Modal';
import { useAppContext } from '../../contexts/AppContext';
import './SuccessModal.css';

export default function RegistrationSuccessModal() {
  const { registrationSuccessData, clearRegistrationSuccess } = useAppContext();
  const navigate = useNavigate();

  if (!registrationSuccessData) return null;

  const { eventName, type, price, date, location, orderId, paymentMethod } = registrationSuccessData;
  const isTicket = type === 'ticket';
  
  const handleViewTickets = () => {
    clearRegistrationSuccess();
    navigate('/account', { state: { activeTab: 'tickets' } });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBD';
    const d = new Date(dateStr);
    return isNaN(d) ? dateStr : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Modal onClose={clearRegistrationSuccess} className="success-modal-content">
      <div className="success-modal-card">
        <div className="success-modal-header">
          <div className="success-modal-icon-circle">✓</div>
          <h3 className="success-headline">
            {isTicket ? 'Ticket Secured!' : 'Booking Confirmed!'}
          </h3>
          <p className="success-subline">Your spot for the event is guaranteed.</p>
        </div>

        <div className="success-ticket-stub">
          <div className={`success-modal-badge ${isTicket ? 'badge-ticket' : 'badge-event'}`}>
            {isTicket ? 'Standard Pass' : 'Athlete Registration'}
          </div>
          <h2 className="success-event-name">{eventName}</h2>
          
          <div className="success-detail-row">
            <div className="success-detail-item">
              <label>Amount Paid</label>
              <span>{price ? `₹${price}` : 'FREE'}</span>
            </div>
            <div className="success-detail-item">
              <label>Payment Mode</label>
              <span style={{ textTransform: 'capitalize' }}>{paymentMethod || 'Online'}</span>
            </div>
          </div>

          {!isTicket && (
            <div className="success-detail-row">
              <div className="success-detail-item">
                <label>Date</label>
                <span>{formatDate(date)}</span>
              </div>
              <div className="success-detail-item">
                <label>Location</label>
                <span>{location || 'PFX Expo Arena'}</span>
              </div>
            </div>
          )}

          {orderId && (
            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '4px' }}>ORDER ID</label>
              <span className="success-order-id">{orderId}</span>
            </div>
          )}

          <div className="success-footer-actions">
            <button className="btn primary glow" onClick={handleViewTickets}>
              View My Tickets
            </button>
            <button className="btn subtle" onClick={clearRegistrationSuccess}>
              Close Window
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
