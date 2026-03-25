import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import { authService } from '../../services/authService';
import { ticketService } from '../../services/ticketService';
import { useModal } from '../../contexts/ModalContext';
import './Account.css';

export default function Account() {
  const navigate = useNavigate();
  const { user, token, handleApiError } = useAppContext();
  const { showModal, showToast } = useModal();
  const [activeTab, setActiveTab] = useState('tickets');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formatDate = (dateString, fallback = Date.now()) => {
    try {
      const d = new Date(dateString || fallback);
      if (isNaN(d.getTime())) return 'Pending';
      return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return 'Pending';
    }
  };

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

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchWithRefresh((t) => ticketService.getMyTickets(t));
      setTickets(res.data || []);
    } catch (err) {
      console.error('Failed to load tickets:', err);
      // Don't show modal if it's just auth failing on reload
      if (err.statusCode !== 401) {
        showModal('Error', 'Failed to load your tickets.', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [fetchWithRefresh, showModal]);

  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (token) loadTickets();
  }, [token, loadTickets]);

  useEffect(() => {
    let timeout;
    if (token && !user) {
      setIsCheckingAuth(true);
      timeout = setTimeout(() => setIsCheckingAuth(false), 2500); // safety fallback
    } else {
      setIsCheckingAuth(false);
    }
    return () => clearTimeout(timeout);
  }, [token, user]);

  // Prevent navigation/refreshing while updating password
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isUpdatingPassword) {
        e.preventDefault();
        e.returnValue = 'Password update in progress. Are you sure you want to leave?';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isUpdatingPassword]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return showModal('Error', 'Passwords do not match.', 'error');
    }

    setIsUpdatingPassword(true);
    try {
      await fetchWithRefresh((t) => authService.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      }, t));
      
      showToast({ title: 'Success', text: 'Password changed successfully!', type: 'success' });
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showModal('Error', err.message || 'Failed to change password.', 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // DEBUG ADDITION
  if (isCheckingAuth) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 0', minHeight: '60vh' }}>
        <h2 style={{ color: 'var(--muted)', animation: 'pulse 2s infinite' }}>Loading Account...</h2>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 0', minHeight: '60vh' }}>
        <h2>Please Login</h2>
        <p>You need to be logged in to view your account.</p>
      </div>
    );
  }

  return (
    <div className="account-page container" style={{ padding: 'var(--section-padding) 0', position: 'relative' }}>
      <div className="account-header">
        <h1>My Account</h1>
        <p className="user-email">{user.userName} ({user.role})</p>
      </div>

      <div className="account-tabs">
        <button 
          className={`tab-btn ${activeTab === 'tickets' ? 'active' : ''}`}
          onClick={() => setActiveTab('tickets')}
        >
          My Tickets
        </button>
        <button 
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Change Password
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'tickets' && (
          <div className="tickets-section">
            {loading ? (
              <div className="ticket-list">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="ticket-item skeleton-item">
                    <div className="ticket-info">
                      <div className="skeleton-line skeleton-title"></div>
                      <div className="skeleton-line skeleton-meta"></div>
                      <div className="skeleton-line skeleton-date"></div>
                    </div>
                    <div className="skeleton-badge"></div>
                  </div>
                ))}
              </div>
            ) : tickets.length > 0 ? (
              <div className="ticket-list">
                {tickets.map((ticket, index) => (
                  <div key={ticket._id || index} className="ticket-item">
                    <div className="ticket-info">
                      <h3>{ticket.eventId?.eventName || 'Event Pass'}</h3>
                      {ticket.eventId?.eventDate && (
                         <p className="ticket-meta" style={{ color: 'var(--text)' }}>
                           Date: {formatDate(ticket.eventId.eventDate)}
                         </p>
                      )}
                      <p className="ticket-meta">
                        ID: {ticket.ticketId || 'Pending'} • Type: {ticket.ticketType ? ticket.ticketType.toUpperCase() : (ticket.role ? ticket.role.toUpperCase() : 'STANDARD')}
                      </p>
                      <p className="ticket-date">
                        Issued on: {ticket.issuedAt ? formatDate(ticket.issuedAt) : formatDate(ticket.createdAt)}
                      </p>
                    </div>
                    <div className="ticket-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
                      <div className={`ticket-status ${ticket.status === 'unused' ? 'success' : 'used'}`}>
                        {ticket.status ? ticket.status.toUpperCase() : 'CONFIRMED'}
                      </div>
                      <button 
                        className="btn primary sm" 
                        onClick={() => navigate(`/ticket/${ticket._id}`)}
                        style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      >
                        View / Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>You haven't booked any tickets yet.</p>
                <button className="btn primary " onClick={() => window.location.href='/#events'}>
                  Browse Events
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="password-section">
            <form className="form registration-card" onSubmit={handlePasswordChange}>
              <div className="form-field">
                <label>Current Password</label>
                <div className="password-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    type={showOldPassword ? "text" : "password"} 
                    required 
                    value={passwordData.oldPassword}
                    onChange={e => setPasswordData({...passwordData, oldPassword: e.target.value})}
                    style={{ width: '100%', paddingRight: '54px' }}
                  />
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', color: 'var(--muted)', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: 0 }}
                  >
                    {showOldPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="form-field">
                <label>New Password</label>
                <div className="password-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    type={showNewPassword ? "text" : "password"} 
                    required 
                    value={passwordData.newPassword}
                    onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                    style={{ width: '100%', paddingRight: '54px' }}
                  />
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', color: 'var(--muted)', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: 0 }}
                  >
                    {showNewPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="form-field">
                <label>Confirm New Password</label>
                <div className="password-input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    required 
                    value={passwordData.confirmPassword}
                    onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    style={{ width: '100%', paddingRight: '54px' }}
                  />
                  <button 
                    type="button" 
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: 'absolute', right: '14px', background: 'none', border: 'none', color: 'var(--muted)', display: 'flex', alignItems: 'center', cursor: 'pointer', padding: 0 }}
                  >
                    {showConfirmPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="registration-actions" style={{ justifyContent: 'center' }}>
                <button type="submit" className="btn primary px-5" disabled={isUpdatingPassword || loading}>
                  {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
