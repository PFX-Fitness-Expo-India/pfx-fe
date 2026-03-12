import { getSportImage } from '../data/sports';

export default function SportCard({ sport, onViewEvent }) {
  return (
    <article className="sport-card">
      <div
        className="sport-media"
        style={{ backgroundImage: `url('${getSportImage(sport.id)}')` }}
      >
        <div className="sport-label">{sport.name}</div>
      </div>
      <div className="sport-body">
        <p className="sport-desc">{sport.description}</p>
        <div className="sport-footer">
          <div className="sport-meta">
            {sport.intensity} • {sport.requiresPayment ? 'Online Payment' : 'Call to Register'}
          </div>
          <button
            className="btn subtle sport-register-btn"
            onClick={() => onViewEvent(sport)}
          >
            View Event
          </button>
        </div>
      </div>
    </article>
  );
}
