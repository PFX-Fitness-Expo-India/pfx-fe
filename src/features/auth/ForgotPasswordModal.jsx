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
        className="modal-content auth-modal p-4 p-md-5" 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "rgba(10, 10, 10, 0.95)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "24px",
          maxWidth: "500px",
          width: "90%",
          position: "relative"
        }}
      >
        <button 
          className="modal-close" 
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "none",
            border: "none",
            color: "rgba(255, 255, 255, 0.5)",
            fontSize: "1.5rem",
            cursor: "pointer"
          }}
        >
          &times;
        </button>

        <div className="text-center mb-4">
          <h2 className="mb-2" style={{ fontFamily: "var(--oswald)", textTransform: "uppercase", letterSpacing: "1px", color: "var(--primary)" }}>
            Forgot Password?
          </h2>
          <p className="text-muted small">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {status === "success" ? (
          <div className="text-center animate-fade-in">
            <div className="success-icon mb-4" style={{ color: "#4BB543", fontSize: "3rem" }}>
              <i className="fas fa-check-circle"></i>
            </div>
            <p className="mb-4" style={{ color: "var(--muted)" }}>{message}</p>
            <button className="btn primary glow w-100 py-3" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="mb-4">
              <label className="form-label text-muted small mb-2" style={{ textTransform: "uppercase", fontWeight: "600" }}>
                Email Address
              </label>
              <input
                type="email"
                className="form-control bg-dark-transparent text-white border-0 py-3 px-4"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={status === "loading"}
                style={{
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.05)"
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
              {status === "loading" ? "Sending Link..." : "Send Reset Link"}
            </button>
          </form>
        )}

        <div className="text-center mt-4">
          <button 
            className="btn btn-link text-muted small p-0" 
            onClick={onClose}
            style={{ textDecoration: "none" }}
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
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          backdrop-filter: blur(5px);
        }
        .bg-dark-transparent:focus {
          background: rgba(255, 255, 255, 0.08) !important;
          box-shadow: 0 0 0 2px rgba(255, 68, 68, 0.2);
          outline: none;
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
