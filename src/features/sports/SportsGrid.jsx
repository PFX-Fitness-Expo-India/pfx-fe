import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import SportCard from './SportCard';

export default function SportsGrid({ onViewEvent }) {
  const { data: events = [], isLoading: loading, error } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/events`);
      const result = response.data;
      if (result.statusCode === 200 && result.data) {
        return result.data.filter(event => event.isActive === true);
      }
      throw new Error(result.message || 'Failed to fetch events');
    }
  });

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
      <div className="container sports-grid">
        {loading ? (
          <p style={{ textAlign: 'center', color: '#888', gridColumn: '1 / -1', padding: '2rem 0' }}>Loading events...</p>
        ) : error ? (
          <p style={{ textAlign: 'center', color: '#ff4444', gridColumn: '1 / -1', padding: '2rem 0' }}>{error.message || 'Failed to load events'}</p>
        ) : events.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#888', gridColumn: '1 / -1', padding: '2rem 0' }}>No events scheduled.</p>
        ) : (
          events.map((event) => (
            <SportCard key={event._id} sport={event} onViewEvent={onViewEvent} />
          ))
        )}
      </div>
    </section>
  );
}
