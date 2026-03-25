import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import { useModal } from '../../contexts/ModalContext';
import CustomSelect from '../../shared/CustomSelect';

export default function Signup() {
  const { signupUser } = useAppContext();
  const { showModal } = useModal();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('visitor');
  const formRef = useRef(null);

  function validateForm(data) {
    const errors = {};
    if (!data.userName) errors.userName = 'Full Name is required';
    if (!data.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(data.email)) errors.email = 'Invalid email address';
    
    if (!data.phoneNumber) errors.phoneNumber = 'Phone Number is required';
    if (!data.password) errors.password = 'Password is required';
    else if (data.password.length < 8) errors.password = 'Password must be at least 8 characters';
    
    return errors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setFormErrors({});
    
    const form = formRef.current;
    const userData = {
      userName: form.elements.userName.value.trim(),
      phoneNumber: form.elements.phoneNumber.value.trim(),
      email: form.elements.email.value.trim(),
      password: form.elements.password.value,
      role: role
    };

    const errors = validateForm(userData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);

    try {
      await signupUser(userData);
      
      // Redirect to login FIRST so the modal shows on top of the login page
      navigate('/login');
      
      await showModal({
        type: 'success',
        title: 'Signup Successful!',
        text: 'A verification email has been sent. Please click on that to verify and then login.',
        allowOutsideClick: false // Make it mandatory to see
      });
    } catch (err) {
      if (err.message?.includes('already exists') || err.statusCode === 409) {
        navigate('/login');
        await showModal({
          type: 'error',
          title: 'Account Exists',
          text: 'An account with this email already exists. Please login instead.',
          allowOutsideClick: false
        });
      } else {
        setError(err.message || 'Signup failed. Please try again.');
      }
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

          <form ref={formRef} className="form" onSubmit={handleSubmit} noValidate>
            <div className={`form-field full ${formErrors.userName ? 'error' : ''}`}>
              <label htmlFor="userName">Full Name</label>
              <input id="userName" name="userName" type="text" disabled={loading} />
              {formErrors.userName && <span className="field-error">{formErrors.userName}</span>}
            </div>

            <div className="form-row">
              <div className={`form-field ${formErrors.email ? 'error' : ''}`}>
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" disabled={loading} />
                {formErrors.email && <span className="field-error">{formErrors.email}</span>}
              </div>
              <div className={`form-field ${formErrors.phoneNumber ? 'error' : ''}`}>
                <label htmlFor="phoneNumber">Phone Number</label>
                <input id="phoneNumber" name="phoneNumber" type="tel" disabled={loading} />
                {formErrors.phoneNumber && <span className="field-error">{formErrors.phoneNumber}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className={`form-field ${formErrors.password ? 'error' : ''}`}>
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input id="password" name="password" type={showPassword ? "text" : "password"} disabled={loading} style={{ width: '100%', paddingRight: '54px' }} />
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
                {formErrors.password && <span className="field-error">{formErrors.password}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="role">Role</label>
                <CustomSelect
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  options={[
                    { value: 'visitor', label: 'Visitor' },
                    { value: 'athlete', label: 'Athlete' }
                  ]}
                />
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
