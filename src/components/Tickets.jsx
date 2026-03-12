export default function Tickets({ onBuyTicket }) {
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
      <div className="container ticket-grid">
        <div className="ticket-card">
          <p className="ticket-label">General Pass</p>
          <p className="ticket-price">₹999</p>
          <ul className="ticket-benefits">
            <li>Expo floor access</li>
            <li>All open seating arenas</li>
            <li>Brand experiences &amp; demos</li>
          </ul>
          <button className="btn primary ticket-buy-btn" onClick={() => onBuyTicket('General Pass')}>
            Buy Ticket
          </button>
        </div>
        <div className="ticket-card featured">
          <p className="ticket-label">VIP Pass</p>
          <p className="ticket-price">₹2,999</p>
          <ul className="ticket-benefits">
            <li>Priority entry lanes</li>
            <li>Premium stage seating</li>
            <li>VIP lounge access</li>
            <li>Exclusive meet &amp; greet zones</li>
          </ul>
          <button className="btn accent ticket-buy-btn" onClick={() => onBuyTicket('VIP Pass')}>
            Buy VIP Ticket
          </button>
        </div>
      </div>
    </section>
  );
}
