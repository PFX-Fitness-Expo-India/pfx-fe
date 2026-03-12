import { SCROLL_OFFSET } from '../../constants/config';

export default function Hero() {
  function scrollTo(id) {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - SCROLL_OFFSET, behavior: 'smooth' });
  }

  return (
    <section id="home" className="hero section">
      <div className="hero-media">
        <div className="hero-overlay" />
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          poster="https://images.pexels.com/photos/3837781/pexels-photo-3837781.jpeg"
        >
          <source
            src="https://videos.pexels.com/video-files/4761656/4761656-uhd_2560_1440_25fps.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      <div className="hero-content container">
        <p className="eyebrow">PFX FITNESS EXPO INDIA</p>
        <h1>India's Biggest Multi-Sport Fitness Expo</h1>
        <p className="subtitle">
          Join elite athletes, fitness enthusiasts, and global brands for a high-energy weekend
          of competitions, showcases, and innovation.
        </p>
        <div className="hero-cta">
          <button className="btn primary" onClick={() => scrollTo('athlete-registration')}>
            Register as Athlete
          </button>
          <button className="btn outline" onClick={() => scrollTo('tickets')}>
            Buy Visitor Tickets
          </button>
        </div>
        <div className="hero-meta">
          <span>3 Days • 12 Sports • Mumbai, India</span>
          <span className="dot">•</span>
          <span>November 2026</span>
        </div>
      </div>
    </section>
  );
}
