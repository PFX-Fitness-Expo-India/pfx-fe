import { schedule } from '../data/schedule';

export default function Schedule() {
  return (
    <section id="schedule" className="section section-dark">
      <div className="container section-header">
        <div>
          <p className="eyebrow">Schedule</p>
          <h2>Three days of non-stop action</h2>
        </div>
        <p className="section-intro">
          A tightly curated schedule ensures every hour is charged with competition, experiences,
          and live showcases.
        </p>
      </div>
      <div className="container schedule-timeline">
        {schedule.map((day) => (
          <div className="schedule-day" key={day.day}>
            <div className="schedule-dot" />
            <div className="schedule-date">
              {day.day} • {day.dateLabel}
            </div>
            <div className="schedule-items">
              {day.items.map((item) => (
                <div className="schedule-item" key={item.title}>
                  <div>
                    <div className="schedule-title">{item.title}</div>
                    <div className="schedule-meta">{item.meta}</div>
                  </div>
                  <div className="schedule-time">{item.time}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
