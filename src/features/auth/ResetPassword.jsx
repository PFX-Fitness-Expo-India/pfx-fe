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
    <section className="section section-dark" style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="container narrow-container">
        <div 
          className="registration-card p-4 p-md-5" 
          style={{ 
            background: "rgba(255, 255, 255, 0.02)", 
            backdropFilter: "blur(20px)", 
            border: "1px solid rgba(255, 255, 255, 0.05)", 
            borderRadius: "24px" 
          }}
        >
          <div className="text-center mb-5">
            <h2 className="mb-3" style={{ fontFamily: "var(--oswald)", textTransform: "uppercase", letterSpacing: "1px", color: "var(--primary)" }}>
              Reset Password
            </h2>
            <p className="text-muted">Enter your new password below to regain access to your account.</p>
          </div>

          {status === "success" ? (
            <div className="text-center animate-fade-in">
              <div className="success-icon mb-4" style={{ color: "var(--primary)", fontSize: "4rem" }}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="var(--primary)" strokeWidth="1" fill="rgba(255, 68, 68, 0.1)"/>
                  <path d="M8 12L11 15L16 9" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="mb-3" style={{ color: "var(--primary)" }}>Success!</h3>
              <p className="mb-4 text-muted">{message}</p>
              <p className="small text-primary animate-pulse">Redirecting to login in 3s...</p>
              <button 
                className="btn primary glow w-100 py-3 mt-2" 
                onClick={() => navigate("/login")}
                style={{ fontWeight: "600" }}
              >
                Go to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="mb-4">
                <label className="form-label text-muted small mb-2" style={{ textTransform: "uppercase", fontWeight: "600" }}>
                  New Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control bg-dark-transparent text-white border-0 py-3 px-4"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      borderRadius: "12px",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.05)",
                      width: "100%",
                      paddingRight: "50px"
                    }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "15px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "rgba(255, 255, 255, 0.3)",
                      cursor: "pointer"
                    }}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <div className="mb-5">
                <label className="form-label text-muted small mb-2" style={{ textTransform: "uppercase", fontWeight: "600" }}>
                  Confirm Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control bg-dark-transparent text-white border-0 py-3 px-4"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{
                    borderRadius: "12px",
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    width: "100%"
                  }}
                />
              </div>

              {status === "error" && (
                <div className="alert alert-danger py-2 px-3 small border-0 mb-4" style={{ background: "rgba(255, 68, 68, 0.1)", color: "#ff4444", borderRadius: "8px" }}>
                  {message}
                </div>
              )}

              <button 
                type="submit" 
                className={`btn primary glow w-100 py-3 ${status === "loading" ? "disabled" : ""}`}
                disabled={status === "loading"}
                style={{ fontSize: "1rem", fontWeight: "600" }}
              >
                {status === "loading" ? "Resetting Password..." : "Reset Password"}
              </button>
              
              <div className="text-center mt-4">
                <button 
                  type="button" 
                  className="btn btn-link text-muted small p-0" 
                  onClick={() => navigate("/login")}
                  style={{ textDecoration: "none" }}
                >
                  Return to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .bg-dark-transparent:focus {
          background: rgba(255, 255, 255, 0.08) !important;
          box-shadow: 0 0 0 2px rgba(255, 68, 68, 0.2);
          outline: none;
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </section>
  );
}
