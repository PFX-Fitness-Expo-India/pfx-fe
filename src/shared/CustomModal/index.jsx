import React, { useEffect, useState } from 'react';
import './CustomModal.css';

export default function CustomModal({ state, onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (state.isOpen) {
      setIsVisible(true);
      if (state.isToast) {
        const timer = setTimeout(() => {
          onClose();
        }, state.duration || 3000);
        return () => clearTimeout(timer);
      }
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [state.isOpen, state.isToast, state.duration, onClose]);

  if (!state.isOpen && !isVisible) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && state.allowOutsideClick && state.type !== 'loading' && !state.isToast) {
      onClose();
    }
  };

  const getIcon = () => {
    switch(state.type) {
      case 'success':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        );
      case 'error':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        );
      case 'warning':
        return (
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        );
      case 'info':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        );
      case 'loading':
        return <div className="c-modal-spinner"></div>;
      default:
        return null;
    }
  };

  if (state.isToast) {
    return (
      <div className="neo-toast-container">
        <div className={`neo-toast neo-toast-${state.type} ${state.isOpen ? 'neo-toast-enter' : 'neo-toast-exit'}`}>
          <div className="neo-toast-indicator"></div>
          <div className="neo-toast-icon-box">{getIcon()}</div>
          <div className="neo-toast-body">
            {state.title && <h4 className="neo-toast-title">{state.title}</h4>}
            {state.text && <p className="neo-toast-desc">{state.text}</p>}
          </div>
          <button className="neo-toast-dismiss" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`c-modal-overlay ${state.isOpen ? 'c-modal-enter' : 'c-modal-exit'}`} onClick={handleBackdropClick}>
      <div className={`c-modal-box ${state.isOpen ? 'c-modal-scale-in' : 'c-modal-scale-out'} ${state.size || 'medium'}`}>
        {state.type !== 'loading' && state.allowOutsideClick !== false && (
          <button className="c-modal-close" onClick={onClose} aria-label="Close modal">&times;</button>
        )}
        
        <div className="c-modal-header">
          <div className={`c-modal-icon-container ${state.type}`}>
            {getIcon()}
          </div>
        </div>
        
        <div className="c-modal-body">
          {state.title && <h3 className="c-modal-title">{state.title}</h3>}
          {state.text && <p className="c-modal-text" dangerouslySetInnerHTML={{ __html: state.text }}></p>}
        </div>
        
        {state.type !== 'loading' && (
          <div className="c-modal-footer">
            <button className={`btn ${state.type === 'error' ? 'primary' : 'accent'} c-modal-btn`} onClick={state.onConfirm || onClose}>
              {state.confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
