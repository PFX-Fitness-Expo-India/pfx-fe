import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import { authService } from '../../services/authService';
import { ticketService } from '../../services/ticketService';
import { useModal } from '../../contexts/ModalContext';
import AccountSkeleton from './AccountSkeleton';
import './Account.css';

export default function Account() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token, handleApiError } = useAppContext();
  const { showModal, showToast } = useModal();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'profile');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
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

  // Sync activeTab with location state (e.g., when navigating from success modal)
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      // Optional: clear state to prevent sticking on that tab on manual refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const loadTickets = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await ticketService.getMyTickets(token);
      setTickets(response.data || (Array.isArray(response) ? response : []));
    } catch (err) {
      handleApiError(err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [token, handleApiError]);

  const loadUserInfo = useCallback(async () => {
    if (!token || !user?._id) return;
    try {
      const response = await authService.getUser(user._id, token);
      if (response.data) {
        setUserInfo(response.data);
      } else if (response.userName) {
        setUserInfo(response); // Fallback if data is not nested
      }
    } catch (err) {
      console.error('Failed to load user info:', err);
    }
  }, [token, user?._id]);

  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (token) {
      loadTickets();
      loadUserInfo();
    }
  }, [token, loadTickets, loadUserInfo]);

  useEffect(() => {
    if (token) {
      // If we have a token, we stop checking auth once data starts loading or after a short delay
      const timer = setTimeout(() => setIsCheckingAuth(false), 800);
      return () => clearTimeout(timer);
    } else {
      setIsCheckingAuth(false);
    }
  }, [token]);

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

  const validateField = (name, value) => {
    let newErrors = { ...errors };
    if (name === 'newPassword') {
      if (value && value.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters';
      } else {
        delete newErrors.newPassword;
      }
    }
    if (name === 'confirmPassword') {
      if (value && value !== passwordData.newPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      } else {
        delete newErrors.confirmPassword;
      }
    }
    setErrors(newErrors);
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    // Final validation before submission
    if (passwordData.newPassword.length < 8) {
      return showModal('Error', 'Password must be at least 8 characters.', 'error');
    }
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
      setErrors({});
    } catch (err) {
      showModal('Error', err.message || 'Failed to change password.', 'error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (isCheckingAuth) {
    return <AccountSkeleton />;
  }

  if (!user) return null;

  return (
    <div className="account-page container">
      <div className="account-header-wrapper">
        <div className="account-header">
          <h1>My Account</h1>
          <div className="user-profile-badge">
            <div className="user-avatar">
              {user.userName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="user-info-text">
              <span className="user-name">{user.userName}</span>
              <span className="user-role-tag">{user.role}</span>
            </div>
          </div>
        </div>

        <div className="account-tabs">
          <button 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            Profile
          </button>
          <button 
            className={`tab-btn ${activeTab === 'tickets' ? 'active' : ''}`}
            onClick={() => setActiveTab('tickets')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 9V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.69.9H20a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.69.9H20"/><path d="M2 9h20"/><path d="M2 15h20"/></svg>
            My Tickets
          </button>
          <button 
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            Security
          </button>
        </div>
      </div>

      <div className="tab-content-container">
        {activeTab === 'profile' && (
          <div className="account-profile-section">
            <div className="account-section-header centered">
              <h2>User Profile</h2>
              <p className="account-section-subtitle">Manage your personal information</p>
            </div>

            <div className="account-profile-card">
              {(userInfo || user) ? (
                <>
                  <div className="account-profile-header">
                    <div className="account-profile-avatar-large">
                      {(userInfo?.userName || user?.userName)?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="account-profile-title">
                      <h3>{userInfo?.userName || user?.userName}</h3>
                      <div className="account-profile-badges">
                        <span className="account-role-badge">{userInfo?.role || user?.role || 'Visitor'}</span>
                        {(userInfo?.isVerified || user?.isVerified) && (
                          <span className="account-verified-badge">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
                            Verified
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="account-profile-grid">
                    <div className="account-profile-item">
                      <div className="account-profile-item-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                      </div>
                      <div className="account-profile-item-text">
                        <span className="label">Email Address</span>
                        <span className="value">{userInfo?.email || user?.email}</span>
                      </div>
                    </div>

                    <div className="account-profile-item">
                      <div className="account-profile-item-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      </div>
                      <div className="account-profile-item-text">
                        <span className="label">Phone Number</span>
                        <span className="value">{userInfo?.phoneNumber || user?.phoneNumber || 'Not provided'}</span>
                      </div>
                    </div>

                    <div className="account-profile-item">
                      <div className="account-profile-item-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                      </div>
                      <div className="account-profile-item-text">
                        <span className="label">Member Since</span>
                        <span className="value">March 2026</span>
                      </div>
                    </div>

                    <div className="account-profile-item">
                      <div className="account-profile-item-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                      </div>
                      <div className="account-profile-item-text">
                        <span className="label">Account Status</span>
                        <span className="value">{(userInfo?.isVerified || user?.isVerified) ? 'Active & Verified' : 'Active'}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <p className="account-section-subtitle">Loading profile data...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="tickets-section">
            <div className="account-section-header">
              <h2>Your Bookings</h2>
              <p className="account-section-subtitle">Manage and download your event passes</p>
            </div>
            
            {loading ? (
              <div className="account-ticket-grid">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="account-skeleton-card">
                    <div className="account-skeleton-header"></div>
                    <div className="account-skeleton-body">
                      <div className="account-skeleton-line"></div>
                      <div className="account-skeleton-line short"></div>
                    </div>
                    <div className="account-skeleton-footer"></div>
                  </div>
                ))}
              </div>
            ) : tickets.length > 0 ? (
              <div className="account-ticket-grid">
                {tickets.map((ticket, index) => (
                  <div key={ticket._id || index} className="account-ticket-card">
                    <div className="account-ticket-card-header">
                      <div className="account-event-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><line x1="10" y1="9" x2="8" y2="9"></line></svg>
                      </div>
                      <div className={`account-ticket-status-badge ${ticket.status === 'unused' ? 'account-status-active' : 'account-status-used'}`}>
                        {ticket.status ? ticket.status.toUpperCase() : 'CONFIRMED'}
                      </div>
                    </div>
                    
                    <div className="account-ticket-card-content">
                      <h3 className="account-event-name">{ticket.eventId?.eventName || 'Event Pass'}</h3>
                      
                      <div className="account-ticket-details-grid">
                        <div className="account-detail-item">
                          <span className="account-detail-label">Date</span>
                          <span className="account-detail-value">{ticket.eventId?.eventDate ? formatDate(ticket.eventId.eventDate) : 'TBD'}</span>
                        </div>
                        <div className="account-detail-item">
                          <span className="account-detail-label">Type</span>
                          <span className="account-detail-value">{ticket.ticketType ? ticket.ticketType.toUpperCase() : (ticket.role ? ticket.role.toUpperCase() : 'STANDARD')}</span>
                        </div>
                        <div className="account-detail-item full-width">
                          <span className="account-detail-label">Ticket ID</span>
                          <span className="account-detail-value mono">{ticket.ticketId || 'Pending'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="account-ticket-card-footer">
                      <span className="account-issued-date">Issued: {ticket.issuedAt ? formatDate(ticket.issuedAt) : formatDate(ticket.createdAt)}</span>
                      <button 
                        className="account-btn-view-ticket" 
                        onClick={() => navigate(`/ticket/${ticket._id}`)}
                      >
                        View Ticket
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><polyline points="12 5 19 12 12 19"></polyline></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="account-empty-state-card">
                <div className="account-empty-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                </div>
                <h3>You have not booked any ticket</h3>
                <p>Explore our upcoming events and secure your spot today!</p>
                <button className="btn primary glow" onClick={() => navigate('/')}>
                  Browse Events
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="account-password-section">
            <div className="account-section-header centered">
              <h2>Security Settings</h2>
              <p className="account-section-subtitle">Update your account password to stay secure</p>
            </div>

            <div className="account-password-card">
              <form className="account-password-form" onSubmit={handlePasswordChange}>
                <div className={`account-form-group ${errors.oldPassword ? 'has-error' : ''}`}>
                  <label htmlFor="oldPassword">Current Password</label>
                  <div className="account-input-wrapper">
                    <input 
                      id="oldPassword"
                      type={showOldPassword ? "text" : "password"} 
                      required 
                      placeholder="Enter current password"
                      value={passwordData.oldPassword}
                      onChange={e => setPasswordData({...passwordData, oldPassword: e.target.value})}
                    />
                    <button 
                      type="button" 
                      className="account-input-icon-btn"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      aria-label="Toggle password visibility"
                    >
                      {showOldPassword ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="account-form-row">
                  <div className={`account-form-group ${errors.newPassword ? 'has-error' : ''}`}>
                    <label htmlFor="newPassword">New Password</label>
                    <div className="account-input-wrapper">
                      <input 
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"} 
                        required 
                        placeholder="Min 8 characters"
                        value={passwordData.newPassword}
                        onChange={e => {
                          const val = e.target.value;
                          setPasswordData({...passwordData, newPassword: val});
                          validateField('newPassword', val);
                        }}
                      />
                      <button 
                        type="button" 
                        className="account-input-icon-btn"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        aria-label="Toggle password visibility"
                      >
                        {showNewPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        )}
                      </button>
                    </div>
                    {errors.newPassword && <span className="account-error-msg">{errors.newPassword}</span>}
                  </div>

                  <div className={`account-form-group ${errors.confirmPassword ? 'has-error' : ''}`}>
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className="account-input-wrapper">
                      <input 
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"} 
                        required 
                        placeholder="Repeat new password"
                        value={passwordData.confirmPassword}
                        onChange={e => {
                          const val = e.target.value;
                          setPasswordData({...passwordData, confirmPassword: val});
                          validateField('confirmPassword', val);
                        }}
                      />
                      <button 
                        type="button" 
                        className="account-input-icon-btn"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label="Toggle password visibility"
                      >
                        {showConfirmPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && <span className="account-error-msg">{errors.confirmPassword}</span>}
                  </div>
                </div>

                <div className="account-password-actions">
                  <button type="submit" className="account-btn-update-password" disabled={isUpdatingPassword || loading || Object.keys(errors).length > 0}>
                    {isUpdatingPassword ? (
                      <>
                        <span className="spinner-sm"></span>
                        Updating...
                      </>
                    ) : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
