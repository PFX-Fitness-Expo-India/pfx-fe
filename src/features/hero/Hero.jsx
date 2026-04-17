import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { SCROLL_OFFSET } from '../../constants/config';
import { useAppContext } from '../../contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo_2.png';

const Counter = ({ target, duration = 2000 }) => {
  const [count, setCount] = useState(1);

  useEffect(() => {
    if (typeof target !== 'number' || target === 1) {
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

export default function Hero() {
  const { user, guestViewMode, setGuestViewMode } = useAppContext();
  const navigate = useNavigate();

  // Fetch events to get the actual count, same as SportsGrid for caching
  const { data: events = [] } = useQuery({
    queryKey: ['events', user?.userId, guestViewMode],
    queryFn: async () => {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/events`);
      const result = response.data;
      if (result.statusCode === 200 && result.data) {
        return result.data.filter(event => event.isActive === true);
      }
      return [];
    }
  });

  function scrollTo(id) {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - SCROLL_OFFSET, behavior: 'smooth' });
  }

  const handleCtaClick = (id, mode) => {
    setGuestViewMode(mode);
    scrollTo(id);
  };

  return (
    <section id="home" className="hero">
      <div className="hero-branding">
        <div className="hero-logo-circle">
          <img src={logo} alt="PFX Fitness Expo" />
        </div>
        {/* <div className="hero-brand-text">
          <div>PFX</div>
          <div>Fitness Expo</div>
        </div> */}
      </div>

      <div className="hero-content container">
        <p className="eyebrow">PFX FITNESS EXPO INDIA</p>
        <h1>India's Biggest Multi-Sport Fitness Expo</h1>
        <p className="subtitle">
          Join elite athletes, fitness enthusiasts, and global brands for a high-energy weekend
          of competitions, showcases, and innovation.
        </p>
        
        {!user && (
          <div className="hero-cta">
            <button className="btn primary" onClick={() => handleCtaClick('sports', 'athlete')}>
              Register as Athlete
            </button>
            <button className="btn outline" onClick={() => handleCtaClick('tickets', 'visitor')}>
              Buy Visitor Tickets
            </button>
          </div>
        )}
        
        <div className="hero-meta">
          <span>3 Days • <Counter target={events.length || 1} /> Sports • Mumbai, India • November 2026</span>
        </div>
      </div>
    </section>
  );
}
