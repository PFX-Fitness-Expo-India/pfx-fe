import { useNavigate } from 'react-router-dom';
import { useRef, useEffect } from 'react';

export default function SportCard({ sport }) {
  const navigate = useNavigate();
  const cardRef = useRef(null);

  useEffect(() => {
    if (window.innerWidth <= 768) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.12 });
    
    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const imageUrl = sport.eventImage && sport.eventImage.startsWith('http')
    ? sport.eventImage
    : 'https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg';

  const dateObj = new Date(sport.eventDate);
  const formattedDate = !isNaN(dateObj)
    ? dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : sport.eventDate;

  return (
    <article
      ref={cardRef}
      className="sport-card"
      onClick={() => navigate(`/events/${sport._id || sport.eventId}`)}
    >
      <div
        className="sport-media"
        style={{ backgroundImage: `url('${imageUrl}')` }}
      >
        <div className="sport-label">{sport.eventName}</div>
      </div>
      <div className="sport-body">
        <p className="sport-desc">{sport.eventDescription}</p>
        <div className="sport-footer">
          <div className="sport-meta-stacked">
            <div className="sport-date-row">
              <span className="sport-date">{formattedDate}</span>
              <span className="sport-time-sep">•</span>
              <span className="sport-time">{sport.eventTime}</span>
            </div>
            <div className="sport-location">{sport.eventLocation || 'Location TBD'}</div>
          </div>
          <button
            className="btn primary sport-register-btn"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/events/${sport._id || sport.eventId}`);
            }}
          >
            View Event
          </button>
        </div>
      </div>
    </article>
  );
}
