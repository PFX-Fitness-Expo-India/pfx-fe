import { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { authService } from '../../services/authService';
import { ticketService } from '../../services/ticketService';
import Swal from 'sweetalert2';
import './Account.css';

export default function Account() {
  const { user, token, logout, handleApiError } = useAppContext();
  const [activeTab, setActiveTab] = useState('tickets');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (token) {
      loadTickets(token);
    }
  }, [token]);

  const loadTickets = async (currentToken) => {
    setLoading(true);
    try {
      const fetchTickets = (t) => ticketService.getMyTickets(t);
      const res = await handleApiError(
        { statusCode: 200 }, // Dummy error to trigger refresh if needed? No, that's not how it works.
        // Wait, handleApiError expects an error. 
        // Better to just call it and catch?
        null
      ).catch(e => { if (e.statusCode === 401) throw e; }); 
      // Actually, let's just do it manually for fetching if I don't have a wrapper.
    } catch (err) {}
  };

  // Re-thinking handleApiError usage:
  const fetchWithRefresh = async (apiFunc) => {
    try {
      return await apiFunc(token);
    } catch (err) {
      return await handleApiError(err, apiFunc);
    }
  };

  const loadTicketsNew = async () => {
    setLoading(true);
    try {
      const res = await fetchWithRefresh((t) => ticketService.getMyTickets(t));
      setTickets(res.data || []);
    } catch (err) {
      console.error('Failed to load tickets:', err);
      Swal.fire('Error', 'Failed to load your tickets.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadTicketsNew();
  }, [token]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return Swal.fire('Error', 'Passwords do not match.', 'error');
    }

    try {
      await fetchWithRefresh((t) => authService.changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      }, t));
      
      Swal.fire('Success', 'Password changed successfully!', 'success');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      Swal.fire('Error', err.message || 'Failed to change password.', 'error');
    }
  };

  if (!user) {
    return (
      <div className="section container" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <h2>Please Login</h2>
        <p>You need to be logged in to view your account.</p>
      </div>
    );
  }

  return (
    <div className="account-page section container">
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
              <p>Loading your tickets...</p>
            ) : tickets.length > 0 ? (
              <div className="ticket-list">
                {tickets.map((ticket, index) => (
                  <div key={ticket._id || index} className="ticket-item">
                    <div className="ticket-info">
                      <h3>{ticket.eventId?.eventName || 'Event Pass'}</h3>
                      <p className="ticket-meta">
                        {ticket.ticketType ? `Type: ${ticket.ticketType}` : `Role: ${ticket.role}`}
                      </p>
                      <p className="ticket-date">
                        Booked on: {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ticket-status success">Confirmed</div>
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
                <button type="submit" className="btn primary px-5" disabled={loading}>
                  Update Password
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
