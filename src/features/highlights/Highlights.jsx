import { useEffect, useState } from 'react';
import axios from 'axios';

const Counter = ({ target, duration = 2000 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (typeof target !== 'number') {
      setCount(target);
      return;
    }

    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [target, duration]);

  return <>{count}</>;
};

export default function Highlights() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/stats`);
        // console.log('Stats data:', res.data);
        if (res.data && res.data.data) {
          setStats(res.data.data);
        }
      } catch (e) {
        console.error('Error fetching stats:', e);
      }
    };
    fetchStats();
  }, []);

  const highlightsData = [
    { label: 'Sports Competitions', value: stats?.sportsCompetitions ?? '12' },
    { label: 'Athletes', value: stats?.athletes ?? '999' },
    { label: 'Visitors', value: stats?.visitors ?? '9999' },
    { label: 'Prize Pool', value: stats?.prizePool ?? '₹ Huge' },
  ];

  return (
    <section id="about" className="section section-dark">
      <div className="container section-header">
        <div>
          <p className="eyebrow">Event Highlights</p>
          <h2>Elite competition. World-class production.</h2>
        </div>
        <p className="section-intro">
          PFX Fitness Expo India brings together the most exciting strength, physique, and
          performance sports under one arena with immersive staging, pro-level lighting, and
          high-octane crowds.
        </p>
      </div>
      <div className="container">
        <div className="row g-4">
          {highlightsData.map(({ label, value }) => (
            <div className="col-6 col-md-3" key={label}>
              <div className="stat-card h-100">
                <span className="stat-label">{label}</span>
                <span className="stat-value">
                  {typeof value === 'number' ? (
                    <Counter target={value} />
                  ) : (
                    value
                  )}
                  {label === 'Athletes' && typeof value === 'number' && '+'}
                  {label === 'Visitors' && typeof value === 'number' && '+'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
