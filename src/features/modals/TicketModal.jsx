import { useRef } from 'react';
import Modal from '../../shared/Modal';
import { useAppContext } from '../../contexts/AppContext';

export default function TicketModal() {
  const { activeTicketType: ticketType, closeTicketModal, addTicket, showConfirmation } = useAppContext();
  const formRef = useRef(null);

  if (!ticketType) return null;

  function handleSubmit(e) {
    e.preventDefault();
    const form = formRef.current;
    const data = {
      name: form.elements.name.value.trim(),
      phone: form.elements.phone.value.trim(),
      email: form.elements.email.value.trim(),
      quantity: parseInt(form.elements.quantity.value || '1', 10),
      type: ticketType,
      createdAt: new Date().toISOString(),
    };
    addTicket(data);
    closeTicketModal();
    showConfirmation(
      `Your ${data.type} booking for ${data.quantity} ticket(s) has been recorded. A confirmation email will be sent to ${data.email}. (Demo only)`
    );
  }

  return (
    <Modal onClose={closeTicketModal}>
      <h3>Book {ticketType}</h3>
      <form ref={formRef} className="form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="visitorName">Name</label>
          <input id="visitorName" name="name" required />
        </div>
        <div className="form-field">
          <label htmlFor="visitorPhone">Phone number</label>
          <input id="visitorPhone" name="phone" type="tel" required />
        </div>
        <div className="form-field">
          <label htmlFor="visitorEmail">Email</label>
          <input id="visitorEmail" name="email" type="email" required />
        </div>
        <div className="form-field">
          <label htmlFor="ticketQuantity">Number of tickets</label>
          <input id="ticketQuantity" name="quantity" type="number" min="1" defaultValue="1" required />
        </div>
        <p className="payment-note">Secure online payment (test mode) – no real charges.</p>
        <button type="submit" className="btn accent">Proceed to Payment</button>
      </form>
    </Modal>
  );
}
