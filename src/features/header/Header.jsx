import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  NAV_LINKS,
  WHATSAPP_NUMBER,
  SCROLL_OFFSET,
} from "../../constants/config";
import { useAppContext } from "../../contexts/AppContext";
import { useModal } from "../../contexts/ModalContext";

import logo from "../../assets/logo.png";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { user, logout, guestViewMode } = useAppContext();
  const { showModal } = useModal();
  const navigate = useNavigate();
  const location = useLocation();

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollTo(id) {
    if (location.pathname !== "/") {
      navigate("/");
    }

    // Slight delay to allow DOM to render 'home' before scrolling if on a different view
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el)
        window.scrollTo({
          top: el.offsetTop - SCROLL_OFFSET,
          behavior: "smooth",
        });
    }, 100);
    setMenuOpen(false);
  }

  const handleLogout = () => {
    showModal({
      title: "Logout Confirmation",
      text: "Are you sure you want to log out?", // Simple and direct as requested
      type: "warning",
      size: "small",
      confirmText: "Logout",
      onConfirm: async () => {
        await logout();
        setDropdownOpen(false);
        // Using window.location.href to ensure a clean refresh as requested by user
        // to prevent "blank screen" issues with stale state.
        setTimeout(() => {
          window.location.href = "/";
        }, 100); 
      },
    });
  };

  return (
    <header className={`site-header${scrolled ? " scrolled" : ""}`}>
      <div className="logo" onClick={() => navigate("/")}>
        <img src={logo} alt="PFX Logo" className="logo-img" />
      </div>

      <nav className={`main-nav${menuOpen ? " open" : ""}`}>
        <div className="main-nav-list">
          {NAV_LINKS.filter(({ id }) => {
            // Role-based visibility
            if (user?.role === "athlete" && id === "tickets") return false;
            if (user?.role === "visitor" && id === "sports") return false;

            // Guest view mode visibility (for non-logged in users)
            if (!user) {
              if (guestViewMode === "athlete" && id === "tickets") return false;
              if (guestViewMode === "visitor" && id === "sports") return false;
            }

            return true;
          }).map(({ label, id }) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                scrollTo(id);
              }}
            >
              {label}
            </a>
          ))}
        </div>
      </nav>

      <div className="header-right-group" ref={dropdownRef}>
        <div className="header-actions">
          {/* <a
            className="whatsapp-btn"
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
          >
            <svg
              className="wa-svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12.031 6.172c-2.32 0-4.218 1.916-4.218 4.237 0 .743.195 1.488.563 2.138l-.6 2.193 2.24-.588c.618.337 1.306.516 2.016.516 2.31 0 4.213-1.921 4.213-4.237 0-2.321-1.898-4.259-4.214-4.259zm1.906 5.865c-.148.403-.736.726-.736.726-.356.174-1.127.132-2.316-.355-1.189-.487-1.954-1.688-2.013-1.769-.06-.081-.46-.612-.46-1.168 0-.557.291-.83.395-.944.104-.114.227-.143.298-.143.07 0 .142 0 .204.004.067.004.156-.025.244.189.088.216.3.731.326.786.026.054.043.118-.004.222-.047.104-.07.168-.141.25-.07.085-.148.192-.211.258-.07.07-.143.148-.061.291.082.143.364.602.779.972.535.474 1.011.621 1.154.692.143.071.226.058.309-.039.083-.097.355-.41.451-.55.094-.138.193-.116.326-.067.133.048.847.399.992.472.146.073.243.11.278.172.034.062.034.358-.114.761zM12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.981-1.309A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.731 0-3.341-.536-4.664-1.445l-.335-.229-3.072.808.823-3.003-.251-.401A7.94 7.94 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z" />
            </svg>
            <span className="wa-text">WhatsApp</span>
          </a> */}

          {user ? (
            <div className="account-container">
              <button
                className="user-avatar"
                title={user.userName || user.role}
                onClick={() => {
                  setDropdownOpen(!dropdownOpen);
                  if (!dropdownOpen) setMenuOpen(false);
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </button>

              {dropdownOpen && (
                <div className="profile-dropdown">
                  <div
                    className="dropdown-item"
                    onClick={() => {
                      navigate("/account");
                      setDropdownOpen(false);
                    }}
                  >
                    Account
                  </div>
                  <button
                    className="dropdown-item logout-btn"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="btn primary login-btn"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          )}
        </div>

        <button
          className={`nav-toggle${menuOpen ? " open" : ""}`}
          aria-label="Toggle menu"
          onClick={() => {
            setMenuOpen(!menuOpen);
            if (!menuOpen) setDropdownOpen(false);
          }}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
