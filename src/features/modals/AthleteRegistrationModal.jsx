import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../shared/Modal';
import CustomSelect from '../../shared/CustomSelect';
import { useAppContext } from '../../contexts/AppContext';
import { registrationService } from '../../services/registrationService';
import { paymentService } from '../../services/paymentService';
import { useModal } from '../../contexts/ModalContext';
import logo from "../../assets/logo.png";
export default function AthleteRegistrationModal() {
  const { 
    activeRegistrationEvent: event, 
    closeAthleteRegistrationModal, 
    user, 
    token,
    logout,
    showRegistrationSuccess
  } = useAppContext();

  const { showModal, showLoading, closeModal } = useModal();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(() => {
    // Attempt to restore from pendingAction immediately on mount
    const pendingActionStr = localStorage.getItem('pendingAction');
    if (pendingActionStr) {
      try {
        const action = JSON.parse(pendingActionStr);
        if (action.type === 'athlete_registration' && action.data) {
          return action.data;
        }
      } catch (e) {
        console.error('Failed to pre-initialize formData:', e);
      }
    }
    return {
      age: '0',
      gender: 'male',
      weight: '0'
    };
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!event) {
      setLoading(false);
      // Only reset to defaults if there's NO pending action
      // This prevents the "reset flash" on reload
      if (!localStorage.getItem('pendingAction')) {
        setFormData({
          age: '0',
          gender: 'male',
          weight: '0'
        });
      }
      setErrors({});
    }
  }, [event]);

  if (!event) return null;

  const handleCloseModal = () => {
    if (loading) {
      showModal({
        title: 'Processing',
        text: 'Payment is currently processing. Please wait.',
        type: 'warning',
        confirmText: 'OK'
      });
      return;
    }
    closeAthleteRegistrationModal();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'age' || name === 'weight') {
      let newValue = value;
      
      if (name === 'age') {
        newValue = newValue.replace(/[^0-9]/g, '');
      } else if (name === 'weight') {
        newValue = newValue.replace(/[^0-9.]/g, '');
        const parts = newValue.split('.');
        if (parts.length > 2) {
          newValue = parts[0] + '.' + parts.slice(1).join('');
        }
      }

      if (newValue.length > 1 && newValue.startsWith('0') && !newValue.startsWith('0.')) {
        newValue = newValue.replace(/^0+/, '');
      }
      
      if (newValue === '') {
        newValue = '0';
      }

      setFormData(prev => ({ ...prev, [name]: newValue }));
      if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: null }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.age || formData.age === '0') {
      newErrors.age = "Please enter a valid age.";
    }
    if (!formData.weight || formData.weight === '0' || formData.weight === '0.') {
      newErrors.weight = "Please enter a valid weight.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!user || !token) {
      // Store pending action for redirect back
      const pendingAction = {
        type: 'athlete_registration',
        event: event,
        from: window.location.pathname,
        data: formData
      };
      localStorage.setItem('pendingAction', JSON.stringify(pendingAction));

      showModal({
        title: 'Login Required',
        text: 'Please login to register for this event. We will bring you right back here!',
        type: 'info',
        confirmText: 'Go to Login',
        onConfirm: () => {
          navigate('/login');
          closeAthleteRegistrationModal();
        }
      });
      return;
    }
    
    localStorage.removeItem('pendingAction');
    setLoading(true);
    try {
      if (event.paymentMethod === 'online') {
        // 1. Register Athlete First
        const athleteData = {
          userId: user.userId,
          eventId: event._id,
          age: parseInt(formData.age),
          gender: formData.gender,
          weight: parseFloat(formData.weight),
          paymentMethod: "online"
        };
        const registrationRes = await registrationService.registerAthlete(athleteData, token);
        const registrationId = registrationRes.data?._id || "";

        // 2. Create Razorpay Order
        const orderRes = await paymentService.createOrder({
          userId: user.userId,
          eventId: event._id,
          amount: event.eventPrice,
          registrationId: registrationId,
          visitorId: ""
        }, token);

        const order = orderRes.data;

        // 3. Open Razorpay
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          image: import.meta.env.VITE_APP_LOGO,
          // image: 'https://ui-avatars.com/api/?name=PFX+Fitness+Expo&background=ff4444&color=fff&size=512',
          name: 'PFX Fitness Expo',
          description: `Registration for ${event.eventName}`,
          order_id: order.id,
          config: {
            display: {
              hide: [{ method: 'paylater' }]
            }
          },
          handler: async (response) => {
            const currentEventName = event.eventName;
            closeAthleteRegistrationModal();
            
            showLoading('Verifying Payment...', 'Please wait while we confirm your registration. Do not close this window.');

            try {
              // 4. Verify Payment
              await paymentService.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              }, token);

              closeModal();
              showRegistrationSuccess({ eventName: currentEventName });
            } catch (err) {
              closeModal();
              console.error('Payment verification failed:', err);
              showModal('Error', err.message || 'Payment verification failed', 'error');
            }
          },
          prefill: {
            name: user.userName || '',
            email: user.email || '',
          },
          theme: {
            color: "#ff4444"
          },
          modal: {
            ondismiss: () => setLoading(false)
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Offline flow
        const athleteData = {
          userId: user.userId,
          eventId: event._id,
          age: parseInt(formData.age),
          gender: formData.gender,
          weight: parseFloat(formData.weight)
        };
        await registrationService.registerAthlete(athleteData, token);
        
        const currentEventName = event.eventName;
        closeAthleteRegistrationModal();
        showRegistrationSuccess({ eventName: currentEventName });
      }
    } catch (error) {
      console.error('Registration failed:', error);
      if (error.statusCode === 401) {
        showModal('Session Expired', 'Please login again to continue.', 'warning');
        logout();
      } else if (error.statusCode === 409) {
        showModal('Already Registered', 'You are already registered for this event.', 'info');
      } else if (error.statusCode === 400) {
        showModal('Invalid Data', error.message || 'Please check your inputs.', 'error');
      } else {
        showModal('Registration Failed', error.message || 'Something went wrong. Please try again.', 'error');
      }
    } finally {
      if (event && event.paymentMethod !== 'online') {
        setLoading(false);
      }
    }
  };

  return (
    <Modal onClose={handleCloseModal} className="athlete-modal-content">
      <div className="sport-modal-hero">
        <div className="sport-modal-badge">Athlete Registration</div>
        <h3>{event.eventName}</h3>
        <p>Complete your details to register for this event.</p>
      </div>
      <div className="sport-modal-body">
        <form className="form" onSubmit={handleSubmit} style={{ width: '100%' }} noValidate>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="regAge">Age</label>
              <input 
                id="regAge" 
                name="age" 
                type="text" 
                inputMode="numeric"
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g. 25"
                style={errors.age ? { borderColor: '#ff4444' } : {}}
              />
              {errors.age && <span style={{ color: '#ff4444', fontSize: '0.85rem', marginTop: '4px' }}>{errors.age}</span>}
            </div>
            <div className="form-field">
              <label htmlFor="regGender">Gender</label>
              <CustomSelect
                id="regGender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                options={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' }
                ]}
                placeholder="Select Gender"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-field full">
              <label htmlFor="regWeight">Weight (kg)</label>
              <input 
                id="regWeight" 
                name="weight" 
                type="text" 
                inputMode="decimal"
                value={formData.weight}
                onChange={handleChange}
                placeholder="e.g. 75.5"
                style={errors.weight ? { borderColor: '#ff4444' } : {}}
              />
              {errors.weight && <span style={{ color: '#ff4444', fontSize: '0.85rem', marginTop: '4px' }}>{errors.weight}</span>}
            </div>
          </div>
          <div style={{ marginTop: '24px' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginBottom: '16px' }}>
              Registration Fee: <strong>₹{event.eventPrice}</strong>
            </p>
            <button 
              type="submit" 
              className="btn primary" 
              style={{ width: '100%', padding: '14px' }}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Pay & Register Now'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );

}
