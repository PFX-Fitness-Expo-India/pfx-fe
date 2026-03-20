import { useState } from 'react';
import Modal from '../../shared/Modal';
import { useAppContext } from '../../contexts/AppContext';
import { registrationService } from '../../services/registrationService';
import { paymentService } from '../../services/paymentService';
import Swal from 'sweetalert2';

export default function AthleteRegistrationModal() {
  const { 
    activeRegistrationEvent: event, 
    closeAthleteRegistrationModal, 
    user, 
    token,
    logout 
  } = useAppContext();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    age: '',
    gender: 'male',
    weight: ''
  });

  if (!event) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !token) {
      Swal.fire('Error', 'You must be logged in to register.', 'error');
      return;
    }

    setLoading(true);
    try {
      if (event.paymentMethod === 'online') {
        // 1. Create Razorpay Order
        const orderRes = await paymentService.createOrder({
          userId: user.userId,
          eventId: event._id,
          amount: event.eventPrice
        }, token);

        const order = orderRes.data;

        // 2. Open Razorpay
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: 'PFX Fitness Expo',
          description: `Registration for ${event.eventName}`,
          order_id: order.id,
          handler: async (response) => {
            try {
              setLoading(true);
              
              // New requirement: Skip verifyPayment and createPaymentRecord
              // Just call Register Athlete directly after successful payment
              const athleteData = {
                userId: user.userId,
                eventId: event._id,
                age: parseInt(formData.age),
                gender: formData.gender,
                weight: parseFloat(formData.weight)
              };
              await registrationService.registerAthlete(athleteData, token);

              Swal.fire({
                icon: 'success',
                title: 'Registration Successful!',
                text: 'Your spot has been secured. Get ready to compete!',
                confirmButtonColor: 'var(--primary)'
              });
              closeAthleteRegistrationModal();
            } catch (err) {
              console.error('Athlete registration failed:', err);
              if (err.statusCode === 401) {
                Swal.fire('Session Expired', 'Your session has expired. Please login again.', 'warning');
                logout();
              } else if (err.statusCode === 409) {
                 Swal.fire('Already Registered', 'You have already registered for this event.', 'info');
              } else {
                Swal.fire('Error', err.message || 'Registration failed', 'error');
              }
            } finally {
              setLoading(false);
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
        
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Registration request submitted. Please complete payment at the venue.',
          confirmButtonColor: 'var(--primary)'
        });
        closeAthleteRegistrationModal();
      }
    } catch (error) {
      console.error('Registration failed:', error);
      if (error.statusCode === 401) {
        Swal.fire('Session Expired', 'Please login again to continue.', 'warning');
        logout();
      } else if (error.statusCode === 409) {
        Swal.fire('Already Registered', 'You are already registered for this event.', 'info');
      } else if (error.statusCode === 400) {
        Swal.fire('Invalid Data', error.message || 'Please check your inputs.', 'error');
      } else {
        Swal.fire('Registration Failed', error.message || 'Something went wrong. Please try again.', 'error');
      }
    } finally {
      // For online payment, loading is managed in handler or ondismiss
      if (event.paymentMethod !== 'online') {
        setLoading(false);
      }
    }
  };

  return (
    <Modal onClose={closeAthleteRegistrationModal} className="athlete-modal-content">
      <div className="sport-modal-hero">
        <div className="sport-modal-badge">Athlete Registration</div>
        <h3>{event.eventName}</h3>
        <p>Complete your details to register for this event.</p>
      </div>
      <div className="sport-modal-body">
        <form className="form" onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div className="form-row">
            <div className="form-field">
              <label htmlFor="regAge">Age</label>
              <input 
                id="regAge" 
                name="age" 
                type="number" 
                required 
                value={formData.age}
                onChange={handleChange}
                placeholder="e.g. 25"
              />
            </div>
            <div className="form-field">
              <label htmlFor="regGender">Gender</label>
              <select 
                id="regGender" 
                name="gender" 
                required 
                value={formData.gender}
                onChange={handleChange}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field full">
              <label htmlFor="regWeight">Weight (kg)</label>
              <input 
                id="regWeight" 
                name="weight" 
                type="number" 
                step="0.1" 
                required 
                value={formData.weight}
                onChange={handleChange}
                placeholder="e.g. 75.5"
              />
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
