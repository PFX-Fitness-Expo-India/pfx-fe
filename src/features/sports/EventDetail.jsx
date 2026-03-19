import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const { data: event, isLoading: loading, error } = useQuery({
    queryKey: ['events', eventId],
    queryFn: async () => {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/events/${eventId}`);
      if (res.data.statusCode === 200 && res.data.data) {
        return res.data.data;
      }
      throw new Error(res.data.message || 'Failed to fetch event');
    },
    enabled: !!eventId,
  });

  if (loading) {
    return (
      <section className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#888' }}>Loading event details...</p>
      </section>
    );
  }

  if (error || !event) {
    const errorMsg = error?.message || error || 'Event not found';
    return (
      <section className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <p style={{ color: '#ff4444', marginBottom: '1rem' }}>{errorMsg}</p>
        <button className="btn outline" onClick={() => navigate('/')}>Back to Home</button>
      </section>
    );
  }

  const imageUrl = event.eventImage && event.eventImage.startsWith('http')
    ? event.eventImage
    : 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg';

  const dateObj = new Date(event.eventDate);
  const formattedDate = !isNaN(dateObj)
    ? dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : event.eventDate;

  return (
    <section className="section">
      <div className="container medium-container">
        <button 
          className="btn subtle" 
          onClick={() => navigate('/')}
          style={{ marginBottom: '20px' }}
        >
          ← Back to Events
        </button>
        
        <div className="sport-card detail-card">
          <div className="sport-media" style={{ height: '300px', backgroundImage: `url('${imageUrl}')` }} />
          
          <div className="sport-body" style={{ padding: '24px' }}>
            <h1 className="section-title">{event.eventName}</h1>
            <p className="subtitle" style={{ color: 'var(--muted)', marginBottom: '32px' }}>{event.eventDescription}</p>
            
            <div className="info-grid" style={{ marginBottom: '32px' }}>
              <div className="info-item">
                <label>Date</label>
                <span>{formattedDate}</span>
              </div>
              <div className="info-item">
                <label>Time</label>
                <span>{event.eventTime}</span>
              </div>
              <div className="info-item">
                <label>Location</label>
                <span>{event.eventLocation || 'TBD'}</span>
              </div>
              <div className="info-item">
                <label>Capacity</label>
                <span>{event.eventCapacity} Participants</span>
              </div>
              <div className="info-item">
                <label>Entry Fee</label>
                <span>₹{event.eventPrice}</span>
              </div>
              <div className="info-item">
                <label>Payment</label>
                <span style={{ textTransform: 'capitalize' }}>{event.paymentMethod}</span>
              </div>
            </div>

            {event.haveSubcategory && event.subcategories?.length > 0 && (
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Categories</h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {event.subcategories.map(cat => (
                    <span 
                      key={cat._id} 
                      className="sport-modal-badge"
                      style={{ margin: 0 }}
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {event.paymentMethod === 'online' ? (
              <button 
                className="btn primary" 
                style={{ width: '100%', padding: '16px', fontSize: '1rem' }}
                onClick={() => {
                  navigate('/');
                  setTimeout(() => {
                    const latestEl = document.getElementById('athlete-registration');
                    if (latestEl) window.scrollTo({ top: latestEl.offsetTop - 76, behavior: 'smooth' });
                    window.dispatchEvent(new CustomEvent('pfx:selectSport', { detail: event._id || event.eventId }));
                  }, 100);
                }}
              >
                Register for this Event
              </button>
            ) : (
              <a 
                href="tel:+919361614200" 
                className="btn primary" 
                style={{ display: 'block', width: '100%', padding: '16px', fontSize: '1rem', textAlign: 'center', boxSizing: 'border-box' }}
              >
                Call to Register
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
