import Modal from '../../shared/Modal';
import { useAppContext } from '../../contexts/AppContext';

export default function RegistrationSuccessModal() {
  const { registrationSuccessData, clearRegistrationSuccess } = useAppContext();

  if (!registrationSuccessData) return null;

  return (
    <Modal onClose={clearRegistrationSuccess} className="success-modal-content">
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <div style={{ 
          width: '80px', 
          height: '80px', 
          background: 'rgba(76, 175, 80, 0.1)', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 24px',
          color: '#4CAF50',
          fontSize: '40px'
        }}>
          ✓
        </div>
        <h3 style={{ fontSize: '1.8rem', marginBottom: '12px', color: 'var(--text)' }}>Registration Successful!</h3>
        <p style={{ color: 'var(--muted)', marginBottom: '32px', lineHeight: '1.6' }}>
          Your spot for <strong>{registrationSuccessData.eventName}</strong> has been secured. <br />
          Check your account for details.
        </p>
        <button 
          className="btn primary" 
          onClick={clearRegistrationSuccess}
          style={{ width: '100%', padding: '14px' }}
        >
          Great, Thanks!
        </button>
      </div>
    </Modal>
  );
}
