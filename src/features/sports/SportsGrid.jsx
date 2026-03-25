import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useAppContext } from '../../contexts/AppContext';
import SportCard from './SportCard';

export default function SportsGrid({ onViewEvent }) {
  const { user, guestViewMode, setGuestViewMode } = useAppContext();
  const { data: events = [], isLoading: loading, error } = useQuery({
    queryKey: ['events', user?.userId, guestViewMode],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/events`);
      const result = response.data;
      if (result.statusCode === 200 && result.data) {
        return result.data.filter(event => event.isActive === true);
      }
      throw new Error(result.message || 'Failed to fetch events');
    }
  });
  // If logged in as visitor, or guest explicitly chose visitor view, hide the athlete grid
  if (user?.role === 'visitor' || (guestViewMode === 'visitor' && !user)) return null;


  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' });
  };

  return (
    <section id="sports" className="section">
      <div className="container section-header">
        <div>
          <p className="eyebrow">Sports Line-Up</p>
          <h2>12 electrifying disciplines. One massive stage.</h2>
        </div>
        <p className="section-intro">
          From bodybuilding to combat sports, endurance to strength, compete or witness India's
          most complete fitness festival.
        </p>
      </div>
      <div className="container">
        <div className="row g-4">
          {loading ? (
            <>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="col-12 col-md-6 col-lg-4">
                  <article className="sport-card skeleton-item">
                    <div className="sport-media" style={{ backgroundImage: `url('')`, backgroundColor: 'rgba(255,255,255,0.02)' }}>
                      <div className="skeleton-line" style={{ width: '150px', height: '18px', position: 'absolute', bottom: '16px', left: '16px', margin: 0 }}></div>
                    </div>
                    <div className="sport-body">
                      <div className="skeleton-line" style={{ width: '100%', height: '14px', marginBottom: '8px' }}></div>
                      <div className="skeleton-line" style={{ width: '85%', height: '14px', marginBottom: '8px' }}></div>
                      <div className="skeleton-line" style={{ width: '60%', height: '14px', marginBottom: '24px' }}></div>
                      <div className="sport-footer" style={{ marginTop: 'auto' }}>
                        <div className="sport-meta">
                          <div className="skeleton-line" style={{ width: '130px', height: '12px' }}></div>
                          <div className="skeleton-line" style={{ width: '90px', height: '12px', marginTop: '6px' }}></div>
                        </div>
                        <div className="skeleton-badge" style={{ width: '100px', height: '32px', borderRadius: '999px' }}></div>
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </>
          ) : error ? (
            <div className="col-12 text-center py-5">
               <p style={{ color: '#ff4444' }}>{error.message || 'Failed to load events'}</p>
            </div>
          ) : events.length === 0 ? (
            <div className="col-12 text-center py-5">
              <p style={{ color: '#888' }}>No events scheduled.</p>
            </div>
          ) : (
            events.map((event) => (
              <div key={event._id} className="col-12 col-md-6 col-lg-4">
                <SportCard sport={event} onViewEvent={onViewEvent} />
              </div>
            ))
          )}
        </div>
        
        {!user && guestViewMode === 'athlete' && (
          <div style={{ textAlign: 'center', marginTop: '48px', paddingTop: '24px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>Just looking for visitor passes?</p>
            <button 
              className="btn outline" 
              onClick={() => {
                setGuestViewMode('visitor');
                setTimeout(() => scrollTo('tickets'), 100);
              }}
            >
              View Visitor Tickets
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
