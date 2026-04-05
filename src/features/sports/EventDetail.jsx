import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';
import { useAppContext } from '../../contexts/AppContext';

export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, openAthleteRegistrationModal } = useAppContext();
  useScrollAnimation();

  const { data: event, isLoading: loading, error } = useQuery({
    queryKey: ['events', eventId],
    queryFn: async () => {
      // Basic validation for MongoDB ObjectID (24 hex characters)
      if (!/^[0-9a-fA-F]{24}$/.test(eventId)) {
        throw new Error('Invalid Event ID format');
      }

      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/events/${eventId}`);
      
      if (res.data.statusCode === 200) {
        // console.log(res.data.data);
        return res.data.data;
      }
      throw new Error(res.data.message || 'Failed to fetch event');
    },
    enabled: !!eventId,
  });

  if (loading) {
    return (
      <section className="section in-view placeholder-glow">
        <div className="container medium-container">
          <div className="placeholder col-3 mb-4 rounded-pill py-3" />
          
          <div className="sport-card detail-card in-view overflow-hidden">
            <div className="placeholder col-12 event-detail-media" />
            
            <div className="event-detail-body">
              <h1 className="placeholder col-8 py-4 mb-3 rounded" />
              <p className="placeholder col-10 py-2 mb-2 rounded" />
              <p className="placeholder col-6 py-2 mb-5 rounded" />
              
              <div className="row g-4 mb-5">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="col-6 col-md-4">
                    <div className="placeholder col-4 py-1 mb-2 rounded" />
                    <div className="placeholder col-10 py-2 rounded" />
                  </div>
                ))}
              </div>
              
              <div className="placeholder col-12 py-5 rounded-pill" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !event) {
    const errorMsg = error?.message || (typeof error === 'string' ? error : 'Event not found');
    return (
      <section className="section section-dark" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '2rem', opacity: 0.5 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', fontFamily: 'var(--oswald)', textTransform: 'uppercase' }}>Event Not Found</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '2.5rem', maxWidth: '400px', marginInline: 'auto' }}>
            {errorMsg.includes('Invalid') ? 'The link you followed might be broken or the ID is incorrect.' : 'This event might have been cancelled or is no longer available.'}
          </p>
          <button className="btn primary glow" onClick={() => navigate('/')}>Return to Events</button>
        </div>
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
    <section className="section in-view detail-section">
      <div className="container medium-container">
        <button 
          className="btn subtle back-btn mt-2" 
          onClick={() => navigate('/')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Events
        </button>
        
        <div className="sport-card detail-card in-view">
          <div className="sport-media event-detail-media" style={{ backgroundImage: `url('${imageUrl}')` }} />
          
          <div className="sport-body event-detail-body">
            <h1 className="section-title event-detail-title">
              {event.eventName || 'Event Pass'}
            </h1>

            {event.eventDescription &&
            <p className="subtitle event-detail-desc">{event.eventDescription}</p>
            }
            
            <div className="info-grid event-detail-grid">
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
              <div className="event-detail-subcategories">
                <h3>Categories</h3>
                <div className="subcategory-list">
                  {event.subcategories.map(cat => (
                    <span 
                      key={cat} 
                      className="sport-modal-badge subcategory-badge"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {( (event.eligibility && event.eligibility.length > 0) || (event.eventRules && event.eventRules.length > 0) ) && (
              <div className="event-detail-extra-grid">
                {event.eligibility && event.eligibility.length > 0 && (
                  <div className="event-detail-info-section">
                    <h3>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                        <polyline points="22 4 12 14.01 9 11.01"></polyline>
                      </svg>
                      Eligibility
                    </h3>
                    <ul className="detail-list">
                      {event.eligibility.map((item, idx) => (
                        <li key={idx} className="detail-list-item">
                          <span className="detail-list-icon">•</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {event.eventRules && event.eventRules.length > 0 && (
                  <div className="event-detail-info-section">
                    <h3>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                      Event Rules
                    </h3>
                    <ul className="detail-list">
                      {event.eventRules.map((rule, idx) => (
                        <li key={idx} className="detail-list-item">
                          <span className="detail-list-icon">•</span>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            <div className="event-detail-actions">
              {event.paymentMethod === 'online' ? (
                <button 
                  className="btn primary event-register-btn" 
                  onClick={() => {
                    if (!user) {
                      const pendingAction = {
                        type: 'athlete_registration',
                        event: event,
                        from: location.pathname
                      };
                      localStorage.setItem('pendingAction', JSON.stringify(pendingAction));
                      navigate('/login');
                    } else {
                      openAthleteRegistrationModal(event);
                    }
                  }}
                >
                  Register for this Event
                </button>
              ) : (
                <button 
                  className="btn primary event-register-btn"
                  onClick={() => {
                    if (!user) {
                      const pendingAction = {
                        type: 'call_to_register',
                        event: event,
                        from: location.pathname
                      };
                      localStorage.setItem('pendingAction', JSON.stringify(pendingAction));
                      navigate('/login');
                    } else {
                      const phoneNumber = import.meta.env.VITE_REGISTRATION_PHONE || "+919786543210";
                      window.location.href = `tel:${phoneNumber}`;
                    }
                  }}
                >
                  Call to Register
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
