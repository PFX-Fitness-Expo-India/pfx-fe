import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer id="contact" className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <h3>PFX Fitness Expo India</h3>
          <p>
            A premium multi-sport fitness festival celebrating strength, endurance, aesthetics,
            and performance.
          </p>
        </div>
        
        <div className="footer-section">
          <h4>Contact</h4>
          <p>Email: info@pfxexpo.in</p>
          <p>Phone: +91 98765 43210</p>
          <p>Address: [Physical Address, City, State, ZIP]</p>
          <p className="note">Note: Please update with your real address for Razorpay compliance.</p>
        </div>

        <div className="footer-section">
          <h4>Legal</h4>
          <p className="legal-links">
            <Link to="/privacy-policy">Privacy Policy</Link><br />
            <Link to="/terms-and-conditions">Terms & Conditions</Link><br />
            <Link to="/refund-policy">Refund & Cancellation Policy</Link>
          </p>
        </div>

        <div className="footer-section">
          <h4>Social</h4>
          <p>
            <a href="https://instagram.com/pfxexpo" target="_blank" rel="noopener noreferrer">Instagram</a><br />
            <a href="https://facebook.com/pfxexpo" target="_blank" rel="noopener noreferrer">Facebook</a><br />
            <a href="https://youtube.com/@pfxexpo" target="_blank" rel="noopener noreferrer">YouTube</a>
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 PFX Fitness Expo India. All rights reserved.</span>
      </div>
    </footer>
  );
}
