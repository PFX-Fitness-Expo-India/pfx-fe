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
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [termsRead, setTermsRead] = useState(true); // Default to true as per athlete flow default settings if requirement flag is absent

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
  };
  
  const handleOpenTerms = () => {
    setTermsModalOpen(true);
  };

  const handleCloseTerms = () => {
    setTermsModalOpen(false);
  };

  const handleMarkTermsAsRead = () => {
    setTermsRead(true);
    setTermsModalOpen(false);
  };

  const handleCheckboxChange = (e) => {
    setAgreedToTerms(e.target.checked);
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

        <div className="form-row" style={{ marginTop: "16px", marginBottom: "20px" }}>
          <div className="form-field full" style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "10px" }}>
            <input
              id="agreedToTerms"
              name="agreedToTerms"
              type="checkbox"
              checked={agreedToTerms}
              onChange={handleCheckboxChange}
              className="styled-checkbox"
              style={{ cursor: "pointer" }}
            />
            <label htmlFor="agreedToTerms" style={{ 
              cursor: "pointer", 
              textTransform: "none", 
              letterSpacing: "normal", 
              color: "var(--text)", 
              fontSize: "0.85rem" 
            }}>
              I agree to the{" "}
              <button
                type="button"
                onClick={handleOpenTerms}
                style={{
                  background: "none",
                  border: "none",
                  color: "#ff3040",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: "0.85rem",
                  padding: 0,
                  font: "inherit"
                }}
              >
                terms and conditions
              </button>
            </label>
          </div>
        </div>

        <button 
          className="btn primary" 
          style={{ width: '100%', padding: '16px', fontSize: '1rem' }}
          disabled={loading || !agreedToTerms}
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
          Payment processed securely via Razorpay.
        </p>
      </div>

      {/* Terms and Conditions Modal */}
      {termsModalOpen && (
        <Modal onClose={handleCloseTerms} className="terms-modal-content">
          <div className="terms-modal-header">
            <h3>Terms and Conditions</h3>
          </div>
          <div className="terms-modal-body">
            <div style={{ color: "var(--text)", fontSize: "0.9rem", lineHeight: "1.6" }}>
              <h4>1. Registration and Participation</h4>
              <p>By registering for this event, you confirm that you are eligible to participate and have read all event details and requirements.</p>

              <h4>2. Health and Safety</h4>
              <p>You confirm that you are in good physical health and capable of participating in this fitness event. You agree to compete at your own risk and assume full responsibility for any injuries or damages.</p>

              <h4>3. Code of Conduct</h4>
              <p>All participants must maintain the highest level of sportsmanship and conduct themselves respectfully. Any abusive, offensive, or inappropriate behavior will result in immediate disqualification.</p>

              <h4>4. Payment Terms</h4>
              <p>The registration fee must be paid in full at the time of registration. Payments are non-refundable except as per our refund policy.</p>

              <h4>5. Event Rules</h4>
              <p>You agree to abide by all event rules and decisions made by event officials. Any violations may result in disqualification without refund.</p>

              <h4>6. Photography and Media</h4>
              <p>You consent to being photographed and/or filmed during the event and agree that such media may be used for promotional purposes by PFX Fitness Expo.</p>

              <h4>7. Liability Waiver</h4>
              <p>PFX Fitness Expo India and its organizers are not liable for any injuries, loss, or damages incurred during participation in the event.</p>

              <h4>8. Cancellation Policy</h4>
              <p>Event dates and venues are subject to change at the organizer's discretion. In case of cancellation, registered fees will be refunded or credited for future events.</p>

              <h4>9. Privacy</h4>
              <p>Your personal information will be used for event management purposes only and will be kept confidential as per our privacy policy.</p>

              <h4>10. Acceptance</h4>
              <p>By checking the agreement box, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions.</p>
            </div>
          </div>
          <div className="terms-modal-footer">
            <button
              onClick={handleMarkTermsAsRead}
              className="btn primary"
              style={{ width: "100%", padding: "12px" }}
            >
              I Have Read & Agree to Terms
            </button>
          </div>
        </Modal>
      )}
    </Modal>
  );
}

