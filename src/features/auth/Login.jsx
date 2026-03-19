import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';

export default function Login() {
  const { loginUser } = useAppContext();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const formRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = formRef.current;
    const credentials = form.elements.credentials.value.trim();
    const password = form.elements.password.value;

    try {
      await loginUser(credentials, password);
      // loginUser will change the view to 'home' on success
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container registration-layout" style={{ justifyContent: 'center' }}>
        <div className="registration-card" style={{ maxWidth: '500px', width: '100%', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <p className="eyebrow">Welcome Back</p>
            <h3>Login to your account</h3>
            {error && <p style={{ color: 'var(--pf-accent)', marginTop: '1rem' }}>{error}</p>}
          </div>

          <form ref={formRef} className="form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-field full">
                <label htmlFor="credentials">Email or Username</label>
                <input id="credentials" name="credentials" type="text" required disabled={loading} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field full">
                <label htmlFor="password">Password</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input id="password" name="password" type={showPassword ? "text" : "password"} required disabled={loading} style={{ width: '100%', paddingRight: '54px' }} />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', color: 'var(--muted)', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: 0 }}
                    tabIndex="-1"
                    title={showPassword ? 'Hide password' : 'Show password'}
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
            </div>
            <div className="form-footer">
              <div className="registration-actions" style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                <button type="button" className="btn subtle" onClick={() => navigate('/signup')} disabled={loading}>
                  Need an account? Sign up
                </button>
                <button type="submit" className="btn primary" disabled={loading}>
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
