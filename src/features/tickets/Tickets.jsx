import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import { useModal } from '../../contexts/ModalContext';

export default function Tickets() {
  const { openTicketModal, user, token, guestViewMode, setGuestViewMode } = useAppContext();
  const { showModal } = useModal();
  const navigate = useNavigate();

  // Strict Condition: Hide Visitor Tickets ONLY if logged in as an athlete.
  // Guests (no user) and Visitors should see this section.
  if (user?.role === 'athlete') return null;


  const handleBuyClick = (type) => {
    if (!user || !token) {
      const pendingAction = {
        type: 'ticket_purchase',
        ticketType: type,
        from: window.location.pathname
      };
      localStorage.setItem('pendingAction', JSON.stringify(pendingAction));

      showModal({
        title: 'Login Required',
        text: 'Please login to purchase tickets. We will bring you right back here!',
        type: 'info',
        confirmText: 'Go to Login',
        onConfirm: () => {
          navigate('/login');
        }
      });
      return;
    }
    openTicketModal(type);
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
  };

  return (
    <section id="tickets" className="section section-dark">
      <div className="container section-header">
        <div>
          <p className="eyebrow">Visitor Tickets</p>
          <h2>Secure your access to the arena</h2>
        </div>
        <p className="section-intro">
          Choose from General or VIP access and immerse yourself in the full PFX experience.
        </p>
      </div>
      <div className="container">
        <div className="row g-4">
          <div className="col-12 col-md-6">
            <div className="ticket-card h-100">
              <p className="ticket-label">General Pass</p>
              <p className="ticket-price">₹999</p>
              <ul className="ticket-benefits">
                <li>Expo floor access</li>
                <li>All open seating arenas</li>
                <li>Brand experiences &amp; demos</li>
              </ul>
              <button className="btn primary ticket-buy-btn" onClick={() => handleBuyClick('General Pass')}>
                Buy Ticket
              </button>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="ticket-card featured h-100">
              <p className="ticket-label">VIP Pass</p>
              <p className="ticket-price">₹2,999</p>
              <ul className="ticket-benefits">
                <li>Priority entry lanes</li>
                <li>Premium stage seating</li>
                <li>VIP lounge access</li>
                <li>Exclusive meet &amp; greet zones</li>
              </ul>
              <button className="btn accent ticket-buy-btn" onClick={() => handleBuyClick('VIP Pass')}>
                Buy VIP Ticket
              </button>
            </div>
          </div>
        </div>
        
        {!user && guestViewMode === 'visitor' && (
          <div style={{ textAlign: 'center', marginTop: '48px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>Want to compete as an athlete?</p>
            <button 
              className="btn outline" 
              onClick={() => {
                scrollTo('sports');
              }}
            >
              View Athlete Registration
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
