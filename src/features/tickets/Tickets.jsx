import { useAppContext } from '../../contexts/AppContext';

export default function Tickets() {
  const { openTicketModal, user } = useAppContext();

  if (user?.role === 'athlete') return null;

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
              <button className="btn primary ticket-buy-btn" onClick={() => openTicketModal('General Pass')}>
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
              <button className="btn accent ticket-buy-btn" onClick={() => openTicketModal('VIP Pass')}>
                Buy VIP Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
