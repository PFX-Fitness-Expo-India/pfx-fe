import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NAV_LINKS, WHATSAPP_NUMBER, SCROLL_OFFSET } from '../../constants/config';
import { useAppContext } from '../../contexts/AppContext';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollTo(id) {
    if (location.pathname !== '/') {
      navigate('/');
    }
    
    // Slight delay to allow DOM to render 'home' before scrolling if on a different view
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) window.scrollTo({ top: el.offsetTop - SCROLL_OFFSET, behavior: 'smooth' });
    }, 100);
    setMenuOpen(false);
  }

  return (
    <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
      <div className="logo" onClick={() => navigate('/')}>
        PFX <span className="logo-full-text">Fitness Expo India</span>
      </div>

      <nav className={`main-nav${menuOpen ? ' open' : ''}`}>
        <div className="main-nav-list">
          {NAV_LINKS.map(({ label, id }) => (
            <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); scrollTo(id); }}>
              {label}
            </a>
          ))}
        </div>
      </nav>

      <div className="header-actions">
        <a
          className="whatsapp-btn"
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="wa-icon">✆</span> <span className="wa-text">WhatsApp</span>
        </a>
        
        {user ? (
          <div className="account-container">
             <button 
               className="user-avatar" 
               title={user.userName || user.role} 
               onClick={() => setDropdownOpen(!dropdownOpen)}
             >
               <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                 <circle cx="12" cy="7" r="4"></circle>
               </svg>
             </button>
             
             {dropdownOpen && (
               <div className="profile-dropdown">
                 <div 
                   className="dropdown-item" 
                   onClick={() => { navigate('/account'); setDropdownOpen(false); }}
                 >
                   Account
                 </div>
                 <button 
                   className="dropdown-item logout-btn"
                   onClick={() => { logout(); setDropdownOpen(false); }}
                 >
                   Logout
                 </button>
               </div>
             )}
          </div>
        ) : (
          <button 
            className="btn primary login-btn" 
            onClick={() => navigate('/login')}
          >
            Login
          </button>
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
