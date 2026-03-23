import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer id="contact" className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <h3>PFX Fitness Expo India</h3>
          <p>
            A premium multi-sport fitness festival celebrating strength,
            endurance, aesthetics, and performance.
          </p>
        </div>

        <div className="footer-section">
          <h4>Contact</h4>
          <p className="contact-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="contact-icon"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            <span>siranjeevi.pro@gmail.com</span>
          </p>
          <p className="contact-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="contact-icon"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            <span>+91 6385908383</span>
          </p>
          <p className="contact-item">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="contact-icon"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>cuddalore, Tamil Nadu - 607303</span>
          </p>
        </div>

        <div className="footer-section">
          <h4>Legal</h4>
          <p className="legal-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <br />
            <Link to="/terms-and-conditions">Terms & Conditions</Link>
            <br />
            <Link to="/refund-policy">Refund & Cancellation Policy</Link>
          </p>
        </div>

        <div className="footer-section">
          <h4>Social</h4>
          <p>
            <a
              href="https://instagram.com/pfxexpo"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
            <br />
            <a
              href="https://facebook.com/pfxexpo"
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook
            </a>
            <br />
            <a
              href="https://youtube.com/@pfxexpo"
              target="_blank"
              rel="noopener noreferrer"
            >
              YouTube
            </a>
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 PFX Fitness Expo India. All rights reserved.</span>
      </div>
    </footer>
  );
}
