import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import CustomModal from '../shared/CustomModal';

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: '',
    text: '',
    type: 'info', // 'success', 'error', 'warning', 'info', 'loading'
    confirmText: 'OK',
    onConfirm: null,
    isToast: false,
    duration: 3000,
    allowOutsideClick: true
  });

  const hideModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  /**
   * Supports either an options object OR (title, text, type)
   */
  const showModal = useCallback((...args) => {
    return new Promise((resolve) => {
      let options = {};
      
      if (args.length === 1 && typeof args[0] === 'object') {
        options = args[0];
      } else {
        options = {
          title: args[0],
          text: args[1],
          type: args[2] || 'info'
        };
      }

      // If it's a sweetalert toast
      if (options.toast) {
        showToast(options);
        resolve(true);
        return;
      }

      setModalState({
        isOpen: true,
        title: options.title || '',
        text: options.text || '',
        type: options.type || options.icon || 'info', // support swal 'icon'
        confirmText: options.confirmButtonText || options.confirmText || 'OK',
        isToast: false,
        allowOutsideClick: options.allowOutsideClick !== false,
        onConfirm: () => {
          hideModal();
          if (options.onConfirm) options.onConfirm();
          resolve({ isConfirmed: true }); // Mocking Swal result
        }
      });
    });
  }, [hideModal]);

  const showToast = useCallback((options) => {
    setModalState({
      isOpen: true,
      title: options.title || '',
      text: options.text || '',
      type: options.type || options.icon || 'success',
      isToast: true,
      duration: options.timer || 3000,
      allowOutsideClick: false
    });
    // Auto clear toast handled inside CustomModal itself
  }, []);

  const showLoading = useCallback((title = 'Loading', text = 'Please wait...') => {
    setModalState({
      isOpen: true,
      title,
      text,
      type: 'loading',
      isToast: false,
      allowOutsideClick: false
    });
  }, []);

  const closeModal = hideModal;

  return (
    <ModalContext.Provider value={{ showModal, showToast, showLoading, closeModal, hideModal }}>
      {children}
      <CustomModal state={modalState} onClose={hideModal} />
    </ModalContext.Provider>
  );
}

export const useModal = () => {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error('useModal must be used inside <ModalProvider>');
  return ctx;
};
