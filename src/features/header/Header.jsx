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
    <header className={`site-header${scrolled ? ' scrolled' : ''}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'nowrap', width: '100%' }}>
      <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer', flexShrink: 0 }}>
        PFX <span style={{ display: 'none', marginLeft: '6px' }}>Fitness Expo India</span>
      </div>

      <nav className={`main-nav${menuOpen ? ' open' : ''}`} style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', gap: 'min(1.5vw, 18px)', overflowX: 'auto', padding: '0 10px', scrollbarWidth: 'none' }}>
        {NAV_LINKS.map(({ label, id }) => (
          <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); scrollTo(id); }} style={{ whiteSpace: 'nowrap' }}>
            {label}
          </a>
        ))}
      </nav>

      <div className="header-actions" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <a
          className="whatsapp-btn"
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="wa-icon">✆</span> <span className="wa-text">WhatsApp</span>
        </a>
        
        {user ? (
          <div className="account-menu" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
             <button 
               className="user-icon" 
               title={user.userName || user.role} 
               onClick={() => setDropdownOpen(!dropdownOpen)}
               style={{ 
                 background: '#fe0000', 
                 color: '#fff', 
                 width: '32px', 
                 height: '32px', 
                 borderRadius: '50%', 
                 border: 'none',
                 display: 'grid', 
                 placeItems: 'center', 
                 fontWeight: 'bold',
                 cursor: 'pointer'
             }}>
               {(user.userName?.[0] || user.role?.[0])?.toUpperCase()}
             </button>
             
             {dropdownOpen && (
               <div className="profile-dropdown" style={{
                 position: 'absolute', top: '130%', right: '0', backgroundColor: '#111',
                 border: '1px solid #333', borderRadius: '8px', zIndex: 100, minWidth: '150px',
                 boxShadow: '0 4px 6px rgba(0,0,0,0.5)', overflow: 'hidden', display: 'flex', flexDirection: 'column'
               }}>
                 <div 
                   className="dropdown-item" 
                   onClick={() => { navigate('/account'); setDropdownOpen(false); }}
                   style={{ padding: '12px 16px', color: '#fff', textDecoration: 'none', borderBottom: '1px solid #333', cursor: 'pointer', textAlign: 'left' }}
                 >
                   Account
                 </div>
                 <button 
                   className="dropdown-item"
                   onClick={() => { logout(); setDropdownOpen(false); }}
                   style={{ width: '100%', textAlign: 'left', padding: '12px 16px', backgroundColor: 'transparent', color: '#fff', border: 'none', cursor: 'pointer', borderRadius: '0', fontSize: '1rem', fontFamily: 'inherit' }}
                 >
                   Logout
                 </button>
               </div>
             )}
          </div>
        ) : (
          <button 
            className="btn primary" 
            onClick={() => navigate('/login')}
            style={{ padding: '0.4em 1em', fontSize: '0.9rem', whiteSpace: 'nowrap' }}
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
