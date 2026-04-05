import { useNavigate } from 'react-router-dom';
import Modal from '../../shared/Modal';
import { useAppContext } from '../../contexts/AppContext';
import './SuccessModal.css';

export default function RegistrationSuccessModal() {
  const { registrationSuccessData, clearRegistrationSuccess } = useAppContext();
  const navigate = useNavigate();

  if (!registrationSuccessData) return null;

  const { eventName, type, price, date, location, orderId, paymentMethod } =
    registrationSuccessData;
  const isTicket = type === "ticket";

  const handleViewTickets = () => {
    clearRegistrationSuccess();
    navigate("/account", { state: { activeTab: "tickets" } });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "TBD";
    const d = new Date(dateStr);
    return isNaN(d)
      ? dateStr
      : d.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
  };

  return (
    <Modal onClose={clearRegistrationSuccess} className="success-modal-compact">
      <div className="success-modal-header">
        <div className="success-modal-icon-circle">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: "24px", height: "24px" }}
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <h2 className="success-headline">
          {isTicket ? "Ticket Secured!" : "Registration Success!"}
        </h2>
        <p className="success-subline">Success! Your spot is guaranteed.</p>
      </div>

      <div className="success-details-container">
        <div className="success-info-list">
          <div className="success-badge-wrapper">
            <div
              className={`success-modal-badge ${isTicket ? "badge-ticket" : ""}`}
            >
              {isTicket ? "Visitor Ticket" : "Athlete Registration"}
            </div>
          </div>
          <div className="success-event-title">{eventName}</div>

          <div className="success-detail-grid">
            <div className="success-detail-item">
              <label>Amount</label>
              <span>{price ? `₹${price}` : "0"}</span>
            </div>
            <div className="success-detail-item">
              <label>Mode</label>
              <span style={{ textTransform: "capitalize" }}>
                {paymentMethod || "Online"}
              </span>
            </div>
            <div className="success-detail-item">
              <label>Date</label>
              <span>{formatDate(date)}</span>
            </div>
            <div className="success-detail-item">
              <label>Location</label>
              <span>{location || "PFX Arena"}</span>
            </div>
          </div>

          {orderId && (
            <div className="success-order-footer">
              <label className="order-id-label">Order ID</label>
              <div className="success-order-id">{orderId}</div>
            </div>
          )}
        </div>

        <div className="success-footer-actions">
          <button className="btn btn-sm primary" onClick={handleViewTickets}>
            Go to My Account
          </button>
          <button className="btn btn-sm subtle" onClick={clearRegistrationSuccess}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
