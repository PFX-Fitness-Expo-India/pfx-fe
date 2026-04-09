import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../../shared/Modal';
import { useAppContext } from '../../contexts/AppContext';
import { paymentService } from '../../services/paymentService';
import { registrationService } from '../../services/registrationService';
import { useModal } from '../../contexts/ModalContext';
import logo from '../../assets/logo_2.png';

export default function TicketModal() {
  const { 
    activeTicketType: ticketType, 
    closeTicketModal, 
    user, 
    token,
    logout,
    showRegistrationSuccess
  } = useAppContext();
  
  const { showModal, showLoading, closeModal } = useModal();
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
      const pendingAction = {
        type: 'ticket_purchase',
        ticketType: ticketType,
        from: window.location.pathname
      };
      localStorage.setItem('pendingAction', JSON.stringify(pendingAction));

      showModal({
        title: 'Login Required',
        text: 'Please login to purchase tickets. We will bring you right back here!',
        type: 'info',
        confirmText: 'Go to Login',
        onConfirm: () => {
          navigate('/login');
          closeTicketModal();
        }
      });
      return;
    }

    const { amount, type } = getTicketDetails();
    setLoading(true);

    try {
      // 1. Register Visitor First (Get visitorId)
      console.log(localStorage.getItem("pfx_userId"));
      const visitorRes = await registrationService.registerVisitor({
        userId: localStorage.getItem("pfx_userId"),
        ticketType: type
      }, token);

      const visitorId = visitorRes.data._id;

      // 2. Create Payment Order (Pass visitorId)
      const orderRes = await paymentService.createOrder({

        userId: localStorage.getItem("pfx_userId"),
        amount: amount,
        visitorId: visitorId,
        // eventId: "" // Mandatory field but empty for visitor pass as per user curl
      }, token);

      const order = orderRes.data;

      // 3. Open Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'PFX Fitness Expo',
        description: `${ticketType} Purchase`,
        image: import.meta.env.VITE_APP_LOGO,
        order_id: order.id,
        config: {
          display: {
            hide: [{ method: 'paylater' }]
          }
        },
        handler: async (response) => {
          const currentTicketType = ticketType;
          const currentAmount = getTicketDetails().amount;
          closeTicketModal();
          showLoading('Verifying Ticket...', 'Please wait while we confirm your ticket. Do not close this window.');

          try {
            // 4. Verify Payment
            await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            }, token);

            closeModal();
            showRegistrationSuccess({ 
              eventName: currentTicketType,
              type: 'ticket',
              price: currentAmount,
              orderId: response.razorpay_order_id,
              paymentMethod: 'online',
              name: user.userName || 'User',
            });
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
    } catch (error) {
      console.error('Payment flow failed:', error);
      if (error.statusCode === 401) {
        showModal('Session Expired', 'Please login again.', 'warning');
        logout();
      } else {
        showModal('Booking Failed', error.message || 'Something went wrong. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal onClose={closeTicketModal} className="athlete-modal-content">
      <div className="sport-modal-hero">
        <div className="sport-modal-badge">{ticketType}</div>
        <h3>Secure Your Entry</h3>
        <p>You are booking a <strong>{ticketType}</strong> for the PFX Fitness Expo 2026.</p>
      </div>

      <div className="sport-modal-body">
        <div className="ticket-summary-box" style={{ 
          background: 'rgba(255, 255, 255, 0.05)', 
          padding: '24px', 
          borderRadius: '12px', 
          marginBottom: '24px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: 'var(--muted)' }}>Ticket Type:</span>
            <span style={{ fontWeight: '600' }}>{ticketType}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: 'var(--muted)' }}>Quantity:</span>
            <span style={{ fontWeight: '600' }}>1 Admit</span>
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: '16px', 
            paddingTop: '16px', 
            borderTop: '1px dashed rgba(255, 255, 255, 0.2)' 
          }}>
            <span style={{ fontWeight: '700', fontSize: '1.1rem' }}>Total Amount:</span>
            <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--accent)' }}>₹{getTicketDetails().amount}</span>
          </div>
        </div>

        <button 
          className="btn primary" 
          style={{ width: '100%', padding: '16px', fontSize: '1rem' }}
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading ? 'Processing...' : `Pay ₹${getTicketDetails().amount} & Confirm`}
        </button>

        <p style={{ 
          textAlign: 'center', 
          fontSize: '0.8rem', 
          color: 'var(--muted)', 
          marginTop: '16px' 
        }}>
          Payment processed securely via Razorpay. <br />
          By proceeding, you agree to our Terms & Conditions.
        </p>
      </div>
    </Modal>
  );
}

