import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(res.message || 'Your email has been successfully verified! You will be redirected to the login page shortly.');
        
        // Start countdown for redirection
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              navigate('/login');
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'The verification link is invalid or has expired.');
      }
    };

    if (token) {
      const initialTimer = setTimeout(verify, 1500);
      return () => clearTimeout(initialTimer);
    } else {
      setStatus('error');
      setMessage('No verification token provided.');
    }
  }, [token, navigate]);

  return (
    <section className="section section-dark" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="container narrow-container text-center">
        <div className="registration-card p-5" style={{ background: 'rgba(255, 255, 255, 0.02)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px' }}>
          
          {status === 'verifying' && (
            <div className="verifying-state py-4">
              <div className="spinner-glow mb-4">
                <div className="spinner-inner"></div>
              </div>
              <h2 className="mb-3" style={{ fontFamily: 'var(--oswald)', textTransform: 'uppercase', letterSpacing: '1px' }}>Verifying Your Email</h2>
              <p className="text-muted">Please wait while we confirm your account details...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="success-state animate-fade-in shadow-glow">
              <div className="success-icon-wrapper mb-4">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="var(--primary)" strokeWidth="1" fill="rgba(255, 68, 68, 0.1)"/>
                  <path d="M8 12L11 15L16 9" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h2 className="mb-3" style={{ fontFamily: 'var(--oswald)', textTransform: 'uppercase', color: 'var(--primary)', letterSpacing: '1px' }}>Verified Successfully!</h2>
              <p className="mb-2" style={{ color: 'var(--muted)', maxWidth: '400px', marginInline: 'auto' }}>
                {message}
              </p>
              <p className="mb-4 text-primary small animate-pulse" style={{ fontWeight: '600' }}>
                Redirecting to login in {countdown}s...
              </p>
              <button 
                className="btn primary glow w-100 py-3" 
                onClick={() => navigate('/login')}
                style={{ fontSize: '1rem', fontWeight: '600' }}
              >
                Login Now
              </button>
            </div>
          )}

          {status === 'error' && (
            <div className="error-state animate-fade-in">
              <div className="error-icon-wrapper mb-4">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="#ff4444" strokeWidth="1" fill="rgba(255, 68, 68, 0.1)"/>
                  <line x1="15" y1="9" x2="9" y2="15" stroke="#ff4444" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="9" y1="9" x2="15" y2="15" stroke="#ff4444" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h2 className="mb-3" style={{ fontFamily: 'var(--oswald)', textTransform: 'uppercase', color: '#ff4444', letterSpacing: '1px' }}>Verification Failed</h2>
              <p className="mb-5" style={{ color: 'var(--muted)', maxWidth: '400px', marginInline: 'auto' }}>
                {message}
              </p>
              <button 
                className="btn outline w-100 py-3" 
                onClick={() => navigate('/signup')}
                style={{ fontSize: '1rem', fontWeight: '600' }}
              >
                Back to Signup
              </button>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .spinner-glow {
          position: relative;
          width: 60px;
          height: 60px;
          margin: 0 auto;
        }
        .spinner-inner {
          width: 100%;
          height: 100%;
          border: 3px solid rgba(255, 68, 68, 0.1);
          border-top: 3px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .shadow-glow {
          text-shadow: 0 0 20px rgba(255, 68, 68, 0.2);
        }
      `}} />
    </section>
  );
}
