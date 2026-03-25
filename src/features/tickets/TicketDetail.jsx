import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { useAppContext } from '../../contexts/AppContext';
import { ticketService } from '../../services/ticketService';
import { useModal } from '../../contexts/ModalContext';
import './TicketDetail.css';

export default function TicketDetail() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { token, handleApiError } = useAppContext();
  const { showModal } = useModal();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrSize, setQrSize] = useState(window.innerWidth < 768 ? 150 : 200);
  const qrRef = useRef(null);

  const fetchWithRefresh = useCallback(async (apiFunc) => {
    try {
      return await apiFunc(token);
    } catch (err) {
      if (err.statusCode === 401) {
        return await handleApiError(err, apiFunc);
      }
      throw err;
    }
  }, [token, handleApiError]);

  useEffect(() => {
    const loadTicket = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await fetchWithRefresh((t) => ticketService.getTicketById(ticketId, t));
        setTicket(res.data);
      } catch (err) {
        console.error('Failed to load ticket:', err);
        showModal('Error', err.message || 'Failed to load ticket details.', 'error');
        // navigate('/account');
      } finally {
        setLoading(false);
      }
    };

    loadTicket();
  }, [ticketId, token, fetchWithRefresh, showModal]);

  useEffect(() => {
    const handleResize = () => {
      setQrSize(window.innerWidth < 768 ? 150 : 200);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const downloadQRCode = () => {
    const canvas = qrRef.current.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = `PFX-Ticket-${ticket.ticketId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Pending';
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      weekday: 'long'
    });
  };

  if (loading) {
    return (
      <div className="ticket-detail-page container">
        <div className="skeleton-ticket">
          <div className="skeleton-line skeleton-title"></div>
          <div className="skeleton-line skeleton-body"></div>
          <div className="skeleton-qr"></div>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="ticket-detail-page container">
        <div className="error-message">
          <h2>Ticket Not Found</h2>
          <p>We couldn't find the ticket you're looking for.</p>
          <button className="btn primary" onClick={() => navigate('/account')}>Back to Account</button>
        </div>
      </div>
    );
  }

  return (
    <div className="ticket-detail-page container">
      <div className="back-link">
        <button onClick={() => navigate('/account')} className="btn-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to My Tickets
        </button>
      </div>

      <div className="ticket-card-detailed">
        <div className="ticket-header-detailed">
          <div className="event-info">
            <p className="event-label">EVENT PASS</p>
            <h1>{ticket.eventId?.eventName || 'Powerlifting Championship 2026'}</h1>
            <p className="event-date">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              {formatDate(ticket.eventId?.eventDate)}
            </p>
          </div>
          <div className={`ticket-status-badge ${ticket.status}`}>
            {ticket.status.toUpperCase()}
          </div>
        </div>

        <div className="ticket-body-detailed">
          <div className="ticket-info-grid">
            <div className="info-item">
              <label>TICKET ID</label>
              <p>{ticket.ticketId}</p>
            </div>
            <div className="info-item">
              <label>TYPE</label>
              <p>{ticket.ticketType ? ticket.ticketType.toUpperCase() : 'ATHLETE'}</p>
            </div>
            <div className="info-item">
              <label>HOLDER</label>
              <p>{ticket.userId?.userName || 'User'}</p>
            </div>
            <div className="info-item">
              <label>ISSUED ON</label>
              <p>{formatDate(ticket.issuedAt)}</p>
            </div>
          </div>

          <div className="ticket-qr-section">
            <div className="qr-container" ref={qrRef}>
              <QRCodeCanvas 
                value={ticket.qrCodeData} 
                size={qrSize}
                level="H"
                includeMargin={true}
                className="qr-code"
              />
            </div>
            <p className="qr-hint">Present this QR code at the entrance</p>
            <button className="btn primary download-btn" onClick={downloadQRCode}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Download Ticket QR
            </button>
          </div>
        </div>
      </div>

      <div className="ticket-footer-detailed">
        <p>IMPORTANT: This ticket is non-transferable. Please bring a valid ID along with this ticket for verification at the venue.</p>
      </div>
    </div>
  );
}
