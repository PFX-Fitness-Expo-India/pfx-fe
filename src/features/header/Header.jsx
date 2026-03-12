import { useState, useEffect } from 'react';
import { NAV_LINKS, WHATSAPP_NUMBER, SCROLL_OFFSET } from '../../constants/config';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollTo(id) {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - SCROLL_OFFSET, behavior: 'smooth' });
    setMenuOpen(false);
  }

  return (
    <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
      <div className="logo">PFX <span>Fitness Expo India</span></div>

      <nav className={`main-nav${menuOpen ? ' open' : ''}`}>
        {NAV_LINKS.map(({ label, id }) => (
          <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); scrollTo(id); }}>
            {label}
          </a>
        ))}
      </nav>

      <div className="header-actions">
        <a
          className="whatsapp-btn"
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="wa-icon">✆</span> WhatsApp
        </a>
      </div>

      <button
        className="nav-toggle"
        aria-label="Toggle menu"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span /><span /><span />
      </button>
    </header>
  );
}
