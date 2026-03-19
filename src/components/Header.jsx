import { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAppContext();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollTo(id) {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 76, behavior: 'smooth' });
    setMenuOpen(false);
  }

  const navLinks = [
    { label: 'Home', id: 'home' },
    { label: 'About Expo', id: 'about' },
    { label: 'Sports Events', id: 'sports' },
    { label: 'Athlete Registration', id: 'athlete-registration' },
    { label: 'Visitor Tickets', id: 'tickets' },
    { label: 'Sponsors', id: 'sponsors' },
    { label: 'Schedule', id: 'schedule' },
    { label: 'Contact', id: 'contact' },
  ];

  return (
    <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
      <div className="logo">PFX <span>Fitness Expo India</span></div>

      <nav className={`main-nav${menuOpen ? ' open' : ''}`}>
        {navLinks.map(({ label, id }) => (
          <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); scrollTo(id); }}>
            {label}
          </a>
        ))}
      </nav>

      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <a className="whatsapp-btn" href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer">
          <span className="wa-icon">✆</span> WhatsApp
        </a>

        {user && (
          <div className="profile-menu" style={{ position: 'relative' }}>
            <button 
              className="profile-avatar" 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              title={user.userName || 'Profile'}
              style={{
                width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#fe0000',
                color: '#fff', border: 'none', fontSize: '1.2rem', fontWeight: 'bold',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >
              {user.userName ? user.userName.charAt(0).toUpperCase() : 'U'}
            </button>
            
            {dropdownOpen && (
              <div className="profile-dropdown" style={{
                position: 'absolute', top: '50px', right: '0', backgroundColor: '#1a1a1a',
                border: '1px solid #333', borderRadius: '8px', zIndex: 100, minWidth: '150px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)', overflow: 'hidden'
              }}>
                <a 
                  href="#account" 
                  className="dropdown-item" 
                  onClick={() => setDropdownOpen(false)}
                  style={{ display: 'block', padding: '10px 15px', color: '#fff', textDecoration: 'none', borderBottom: '1px solid #333' }}
                >
                  Account
                </a>
                <button 
                  className="dropdown-item"
                  onClick={() => { logout(); setDropdownOpen(false); }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 15px', backgroundColor: 'transparent', color: '#fff', border: 'none', cursor: 'pointer' }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
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
