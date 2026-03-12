import Modal from '../../shared/Modal';
import { useAppContext } from '../../contexts/AppContext';

export default function ConfirmationModal() {
  const { confirmationMessage: message, closeConfirmation } = useAppContext();
  if (!message) return null;

  return (
    <Modal onClose={closeConfirmation} className="confirmation-content">
      <h3>Booking Confirmed</h3>
      <p>{message}</p>
    </Modal>
  );
}
