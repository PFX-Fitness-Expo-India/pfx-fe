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
  const [extraFields, setExtraFields] = useState({
  gender: 'male',
  age: 0,
  weight: 0,
  height: 0
});
  const formRef = useRef(null);

  const handleInput = (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-Z0-9@. ]/g, '');
  };

  const handleNumberInputKeyDown = (e) => {
    if (['e', 'E', '+', '-', '.'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleNumberChange = (e) => {
    let { name, value } = e.target;
    value = value.replace(/^0+/, '');
    setExtraFields({ ...extraFields, [name]: value });
  };

  function validateForm(data, currentRole) {
    const errors = {};
    if (!data.userName) errors.userName = 'Full Name is required';
    if (!data.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(data.email)) errors.email = 'Invalid email address';
    
    if (!data.phoneNumber) errors.phoneNumber = 'Phone Number is required';
    if (!data.password) errors.password = 'Password is required';
    else if (data.password.length < 8) errors.password = 'Password must be at least 8 characters';
    
    if (currentRole === 'athlete') {
      if (!data.gender) errors.gender = 'Gender is required';
      if (!data.age) errors.age = 'Age is required';
      else if (isNaN(data.age) || data.age <= 18) errors.age = 'Age must be strictly greater than 18';
      
      if (!data.weight) errors.weight = 'Weight is required';
      else if (isNaN(data.weight) || data.weight <= 0) errors.weight = 'Invalid weight';
      
      if (!data.height) errors.height = 'Height is required';
      else if (isNaN(data.height) || data.height <= 0) errors.height = 'Invalid height';
    }
    
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

    if (role === 'athlete') {
      userData.gender = extraFields.gender;
      userData.age = extraFields.age ? Number(extraFields.age) : '';
      userData.weight = extraFields.weight ? Number(extraFields.weight) : '';
      userData.height = extraFields.height ? Number(extraFields.height) : '';
    }

    const errors = validateForm(userData, role);
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
        // navigate('/login');
        await showModal({
          type: 'error',
          title: 'Account Exists',
          text: err.message,
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
              <input id="userName" name="userName" type="text" disabled={loading} onInput={handleInput} />
              {formErrors.userName && <span className="field-error">{formErrors.userName}</span>}
            </div>

            <div className="form-row">
              <div className={`form-field ${formErrors.email ? 'error' : ''}`}>
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" disabled={loading} onInput={handleInput} />
                {formErrors.email && <span className="field-error">{formErrors.email}</span>}
              </div>
              <div className={`form-field ${formErrors.phoneNumber ? 'error' : ''}`}>
                <label htmlFor="phoneNumber">Phone Number</label>
                <input id="phoneNumber" name="phoneNumber" type="tel" disabled={loading} onInput={handleInput} />
                {formErrors.phoneNumber && <span className="field-error">{formErrors.phoneNumber}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className={`form-field ${formErrors.password ? 'error' : ''}`}>
                <label htmlFor="password">Password</label>
                <div className="password-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input id="password" name="password" type={showPassword ? "text" : "password"} disabled={loading} style={{ width: '100%', paddingRight: '54px' }} onInput={handleInput} />
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

            {role === 'athlete' && (
              <>
                <div className="form-row">
                  <div className={`form-field ${formErrors.gender ? 'error' : ''}`}>
                    <label htmlFor="gender">Gender</label>
                    <CustomSelect
                      id="gender"
                      name="gender"
                      value={extraFields.gender}
                      onChange={(e) => setExtraFields({...extraFields, gender: e.target.value})}
                      options={[
                        { value: 'male', label: 'Male' },
                        { value: 'female', label: 'Female' },
                        { value: 'other', label: 'Other' }
                      ]}
                    />
                    {formErrors.gender && <span className="field-error">{formErrors.gender}</span>}
                  </div>
                  <div className={`form-field ${formErrors.age ? 'error' : ''}`}>
                    <label htmlFor="age">Age</label>
                    <input id="age" name="age" type="number" min="19" disabled={loading} value={extraFields.age} onChange={handleNumberChange} onKeyDown={handleNumberInputKeyDown} />
                    {formErrors.age && <span className="field-error">{formErrors.age}</span>}
                  </div>
                </div>
                <div className="form-row">
                  <div className={`form-field ${formErrors.weight ? 'error' : ''}`}>
                    <label htmlFor="weight">Weight (kg)</label>
                    <input id="weight" name="weight" type="number" min="1" disabled={loading} value={extraFields.weight} onChange={handleNumberChange} onKeyDown={handleNumberInputKeyDown} />
                    {formErrors.weight && <span className="field-error">{formErrors.weight}</span>}
                  </div>
                  <div className={`form-field ${formErrors.height ? 'error' : ''}`}>
                    <label htmlFor="height">Height (cm)</label>
                    <input id="height" name="height" type="number" min="1" disabled={loading} value={extraFields.height} onChange={handleNumberChange} onKeyDown={handleNumberInputKeyDown} />
                    {formErrors.height && <span className="field-error">{formErrors.height}</span>}
                  </div>
                </div>
              </>
            )}

            <div className="auth-footer">
              <button type="submit" className="btn primary" disabled={loading}>
                {loading ? 'Processing...' : 'Sign Up'}
              </button>
              <button type="button" className="auth-link" onClick={() => navigate('/login')} disabled={loading}>
                Already have an account? Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
