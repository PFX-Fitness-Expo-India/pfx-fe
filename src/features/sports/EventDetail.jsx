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
    <section className="section" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
      <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <button 
          className="btn subtle" 
          onClick={() => navigate('/')}
          style={{ marginBottom: '20px', padding: '8px 16px' }}
        >
          ← Back to Events
        </button>
        
        <div style={{ borderRadius: '12px', overflow: 'hidden', backgroundColor: '#111', border: '1px solid #333' }}>
          <div style={{ 
            height: '300px', 
            backgroundImage: `url('${imageUrl}')`, 
            backgroundSize: 'cover', 
            backgroundPosition: 'center' 
          }} />
          
          <div style={{ padding: '30px' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '10px', color: '#fff' }}>{event.eventName}</h1>
            <p style={{ fontSize: '1.2rem', color: '#aaa', marginBottom: '30px' }}>{event.eventDescription}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div>
                <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '4px' }}>Date</p>
                <p style={{ fontWeight: 600, color: '#fff' }}>{formattedDate}</p>
              </div>
              <div>
                <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '4px' }}>Time</p>
                <p style={{ fontWeight: 600, color: '#fff' }}>{event.eventTime}</p>
              </div>
              <div>
                <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '4px' }}>Location</p>
                <p style={{ fontWeight: 600, color: '#fff' }}>{event.eventLocation || 'TBD'}</p>
              </div>
              <div>
                <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '4px' }}>Capacity</p>
                <p style={{ fontWeight: 600, color: '#fff' }}>{event.eventCapacity} Participants</p>
              </div>
              <div>
                <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '4px' }}>Entry Fee</p>
                <p style={{ fontWeight: 600, color: '#fff' }}>₹{event.eventPrice}</p>
              </div>
              <div>
                <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '4px' }}>Payment</p>
                <p style={{ fontWeight: 600, color: '#fff', textTransform: 'capitalize' }}>{event.paymentMethod}</p>
              </div>
            </div>

            {event.haveSubcategory && event.subcategories?.length > 0 && (
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '10px', color: '#fff' }}>Categories</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {event.subcategories.map(cat => (
                    <span 
                      key={cat._id} 
                      style={{ 
                        padding: '6px 12px', 
                        backgroundColor: '#222', 
                        border: '1px solid #444', 
                        borderRadius: '20px', 
                        fontSize: '0.9rem',
                        color: '#ddd'
                      }}
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
                style={{ width: '100%', padding: '15px', fontSize: '1.1rem' }}
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
                style={{ display: 'block', width: '100%', padding: '15px', fontSize: '1.1rem', textAlign: 'center', boxSizing: 'border-box', textDecoration: 'none' }}
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
