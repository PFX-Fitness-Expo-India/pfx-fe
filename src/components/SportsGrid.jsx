import { sports } from '../data/sports';
import SportCard from './SportCard';

export default function SportsGrid({ onViewEvent }) {
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
        {sports.map((sport) => (
          <SportCard key={sport.id} sport={sport} onViewEvent={onViewEvent} />
        ))}
      </div>
    </section>
  );
}
