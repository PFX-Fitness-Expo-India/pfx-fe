import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle, loading, success, error
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setStatus("error");
      setMessage("Password must be at least 6 characters long.");
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      await authService.resetPassword(token, password);
      setStatus("success");
      setMessage("Your password has been reset successfully! You can now login with your new password.");
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      setStatus("error");
      setMessage(err.message || "Failed to reset password. The link may be invalid or expired.");
    }
  };

  return (
    <section className="section login-section">
      <div className="container narrow-container">
        <div className="registration-card">
          <div className="section-header-compact text-center mb-4">
            <p className="eyebrow" style={{ color: 'var(--primary)', fontWeight: '700' }}>Secure Access</p>
            <h3>Reset your password</h3>
            <p className="small mt-2" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Enter your new password below to regain access to your account.
            </p>
            {status === "error" && <p className="error-text mt-3 text-danger">{message}</p>}
          </div>

          {status === "success" ? (
            <div className="text-center">
              <div className="success-icon mb-4" style={{ color: "var(--primary)", fontSize: "3.5rem" }}>
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="mb-4 text-white">{message}</p>
              <p className="small text-primary animate-pulse">Redirecting to login in 3s...</p>
              <button 
                className="btn primary px-4 w-100" 
                onClick={() => navigate("/login")}
              >
                Go to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="form">
              <div className="form-field full mb-4">
                <label style={{ color: '#fff' }}>New Password</label>
                <div className="password-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ width: '100%', paddingRight: '54px', color: '#fff' }}
                  />
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', color: 'rgba(255, 255, 255, 0.5)', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: 0 }}
                    tabIndex="-1"
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="form-field full mb-4">
                <label style={{ color: '#fff' }}>Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Repeat account password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ color: '#fff' }}
                />
              </div>

              <div className="form-footer">
                <div className="registration-actions">
                  <button 
                    type="button" 
                    className="btn subtle btn-sm" 
                    onClick={() => navigate("/login")}
                    style={{ color: '#fff' }}
                  >
                    Return to Login
                  </button>
                  <button 
                    type="submit" 
                    className="btn primary px-4" 
                    disabled={status === "loading"}
                  >
                    {status === "loading" ? "Processing..." : "Reset Password"}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
