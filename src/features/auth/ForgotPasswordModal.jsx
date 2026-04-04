import { useState } from "react";
import { authService } from "../../services/authService";

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await authService.forgotPassword(email);
      setStatus("success");
      setMessage(res.message || "A password reset link has been sent to your email.");
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Something went wrong. Please try again.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="registration-card" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '500px', width: '95%', position: 'relative' }}
      >
        <button 
          className="modal-close-btn" 
          onClick={onClose}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '15px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--muted)',
            fontSize: '1.5rem',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          &times;
        </button>

          <div className="section-header-compact text-center mb-4">
            <p className="eyebrow" style={{ color: 'var(--primary)', fontWeight: '700' }}>Password Recovery</p>
            <h3>Forgot Password?</h3>
            <p className="small mt-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {status === "success" ? (
            <div className="text-center">
              <div className="success-icon mb-4" style={{ color: "var(--primary)", fontSize: "3rem" }}>
                <i className="fas fa-check-circle"></i>
              </div>
              <p className="mb-4 text-white">{message}</p>
              <button 
                className="btn primary px-4 w-100" 
                onClick={onClose}
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="form">
              <div className="form-field full mb-4">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={status === "loading"}
                />
              </div>

              {status === "error" && (
                <div className="error-text mb-4 text-center text-danger">
                  {message}
                </div>
              )}

              <div className="form-footer">
                <div className="registration-actions" style={{ justifyContent: 'center' }}>
                  <button 
                    type="submit" 
                    className="btn primary px-5" 
                    disabled={status === "loading"}
                    style={{ minWidth: '200px' }}
                  >
                    {status === "loading" ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>
              </div>
            </form>
          )}

          <div className="text-center mt-4">
            <button 
              className="btn-link" 
              onClick={onClose}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#fff', 
                fontSize: '0.85rem', 
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Back to Login
            </button>
          </div>
        </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(8px);
          padding: 20px;
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
