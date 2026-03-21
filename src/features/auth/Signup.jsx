import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import Swal from 'sweetalert2';

export default function Signup() {
  const { signupUser } = useAppContext();
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
    
    // Validate matching passwords if you have confirm password, but matching requirements based on payload
    const userData = {
      userName: form.elements.userName.value.trim(),
      phoneNumber: form.elements.phoneNumber.value.trim(),
      email: form.elements.email.value.trim(),
      password: form.elements.password.value,
      role: form.elements.role.value
    };

    try {
      await signupUser(userData);
      
      await Swal.fire({
        icon: 'success',
        title: 'Signup Successful!',
        text: 'Your account has been created. Please login to continue.',
        confirmButtonColor: 'var(--primary)'
      });
      
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section signup-section">
      <div className="container medium-container">
        <div className="registration-card mx-auto" style={{ maxWidth: '480px' }}>
          <div className="section-header-compact text-center mb-4">
            <p className="eyebrow">Join PFX</p>
            <h3>Create an account</h3>
            {error && <p className="error-text mt-3">{error}</p>}
          </div>

          <form ref={formRef} className="form" onSubmit={handleSubmit}>
            <div className="form-field full">
              <label htmlFor="userName">Full Name</label>
              <input id="userName" name="userName" type="text" required disabled={loading} />
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" required disabled={loading} />
              </div>
              <div className="form-field">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input id="phoneNumber" name="phoneNumber" type="tel" required disabled={loading} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-field">
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input id="password" name="password" type={showPassword ? "text" : "password"} required disabled={loading} style={{ width: '100%', paddingRight: '54px' }} />
                  <button 
                    type="button" 
                    className="password-toggle"
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
              <div className="form-field">
                <label htmlFor="role">Role</label>
                <select id="role" name="role" required disabled={loading} defaultValue="visitor">
                  <option value="visitor">Visitor</option>
                  <option value="athlete">Athlete</option>
                </select>
              </div>
            </div>

            <div className="form-footer mt-4">
              <div className="registration-actions" style={{ marginTop: '0' }}>
                <button type="button" className="btn subtle" onClick={() => navigate('/login')} disabled={loading} style={{ border: 'none', background: 'transparent', paddingLeft: '0', fontSize: '0.75rem' }}>
                  Already have an account? Login
                </button>
                <button type="submit" className="btn primary" disabled={loading} style={{ paddingInline: '24px' }}>
                  {loading ? 'Processing...' : 'Sign Up'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
