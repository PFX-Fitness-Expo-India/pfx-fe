import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../shared/Modal';
import { useAppContext } from '../../contexts/AppContext';
import { paymentService } from '../../services/paymentService';
import { registrationService } from '../../services/registrationService';
import Swal from 'sweetalert2';
import logo from '../../assets/logo.png';

export default function TicketModal() {
  const { 
    activeTicketType: ticketType, 
    closeTicketModal, 
    user, 
    token,
    logout 
  } = useAppContext();
  
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ticketType) {
      setLoading(false);
    }
  }, [ticketType]);

  if (!ticketType) return null;

  const getTicketDetails = () => {
    if (ticketType === 'General Pass') {
      return { amount: 999, type: 'standard' };
    }
    if (ticketType === 'VIP Pass') {
      return { amount: 2999, type: 'gold' };
    }
    return { amount: 999, type: 'standard' };
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!user || !token) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please login to purchase tickets.',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Go to Login',
        confirmButtonColor: 'var(--primary)'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
          closeTicketModal();
        }
      });
      return;
    }

    const { amount, type } = getTicketDetails();
    setLoading(true);

    try {
      // 1. Create Order
      const orderRes = await paymentService.createOrder({
        userId: user.userId,
        eventId: 'visitor_pass', // Placeholder eventId for generic visitor tickets
        amount: amount
      }, token);

      const order = orderRes.data;

      // 2. Open Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'PFX Fitness Expo',
        description: `${ticketType} Purchase`,
        image: import.meta.env.VITE_APP_LOGO,
        // image: 'https://ui-avatars.com/api/?name=PFX+Fitness+Expo&background=ff4444&color=fff&size=512',
        order_id: order.id,
        config: {
          display: {
            hide: [{ method: 'paylater' }]
          }
        },
        handler: async (response) => {
          try {
            setLoading(true);
            
            // New requirement: Skip verifyPayment and createPaymentRecord
            // Register Visitor directly
            await registrationService.registerVisitor({
              userId: user.userId,
              ticketType: type
            }, token);

            Swal.fire({
              icon: 'success',
              title: 'Ticket Booked!',
              text: `Your ${ticketType} has been successfully booked. Check your email for the ticket.`,
              confirmButtonColor: 'var(--primary)'
            });
            closeTicketModal();
          } catch (err) {
            console.error('Visitor registration failed:', err);
            if (err.statusCode === 401) {
              Swal.fire('Session Expired', 'Please login again.', 'warning');
              logout();
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
    } catch (error) {
      console.error('Order creation failed:', error);
      if (error.statusCode === 401) {
        Swal.fire('Session Expired', 'Please login again.', 'warning');
        logout();
      } else {
        Swal.fire('Error', error.message || 'Failed to initiate payment', 'error');
      }
      setLoading(false);
    }
  }

  return (
    <Modal onClose={closeTicketModal}>
      <h3>Book {ticketType}</h3>
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label>Ticket Type</label>
          <input value={ticketType} disabled />
        </div>
        <div className="form-field">
          <label>Price</label>
          <input value={`₹${getTicketDetails().amount}`} disabled />
        </div>
        <p className="payment-note">Secure online payment via Razorpay.</p>
        <button type="submit" className="btn accent" disabled={loading}>
          {loading ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </form>
    </Modal>
  );
}
