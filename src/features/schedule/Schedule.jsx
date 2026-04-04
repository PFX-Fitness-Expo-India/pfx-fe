import { useQuery } from '@tanstack/react-query';
import { getSchedule } from '../../services/eventService';

export default function Schedule() {
  const { data: scheduleData, isLoading: loading, error } = useQuery({
    queryKey: ['schedule'],
    queryFn: async () => {
      const response = await getSchedule();
      if (response.statusCode === 200 && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to fetch schedule');
    }
  });

  const title = scheduleData?.title || "Three days of non-stop action";
  const days = scheduleData?.days || [];

  return (
    <section id="schedule" className="section section-dark">
      <div className="container section-header">
        <div>
          <p className="eyebrow">Schedule</p>
          <h2>{title}</h2>
        </div>
        <p className="section-intro">
          A tightly curated schedule ensures every hour is charged with competition, experiences,
          and live showcases.
        </p>
      </div>

      <div className="container">
        {loading ? (
          <div className="schedule-loading">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="schedule-day skeleton-item" style={{ marginBottom: '40px' }}>
                <div className="skeleton-line" style={{ width: '200px', height: '24px', marginBottom: '20px' }}></div>
                <div className="schedule-items">
                  {[...Array(2)].map((_, j) => (
                    <div key={j} className="schedule-item" style={{ height: '100px', opacity: 0.1 }}></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-5">
            <p style={{ color: 'var(--primary)' }}>{error.message || 'Failed to load schedule'}</p>
          </div>
        ) : (
          <div className="schedule-timeline">
            {days.map((day) => (
              <div className="schedule-day" key={day.dayNumber}>
                <div className="schedule-dot" />
                <div className="schedule-date">
                  Day {day.dayNumber} — {day.dayName} {day.date && `• ${new Date(day.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}`}
                </div>
                {day.subtitle && <p className="schedule-day-subtitle">{day.subtitle}</p>}
                
                <div className="schedule-items">
                  {day.events.map((event) => (
                    <div className="schedule-item card-style" key={event.eventId}>
                      <div className="schedule-item-body">
                        <div className="schedule-item-info">
                          <div className="schedule-item-header">
                            <div className="schedule-title">{event.eventName}</div>
                            <div className="schedule-time">{event.eventTime}</div>
                          </div>
                          
                          <div className="schedule-meta">
                            <span>{event.eventLocation}</span>
                            {event.eventPrice > 0 && (
                              <span className="schedule-price-tag">
                                ₹{event.eventPrice.toLocaleString()}
                              </span>
                            )}
                          </div>
                          
                          {event.eventDescription && (
                            <p className="schedule-item-desc">{event.eventDescription}</p>
                          )}

                          {event.haveSubcategory && event.subcategories?.length > 0 && (
                            <div className="schedule-subcategories">
                              {event.subcategories.map(sub => (
                                <span key={sub} className="badge-sub">{sub}</span>
                              ))}
                            </div>
                          )}
                        </div>

                        {event.eventImage && (
                          <div className="schedule-item-media">
                            <img src={event.eventImage} alt={event.eventName} loading="lazy" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
