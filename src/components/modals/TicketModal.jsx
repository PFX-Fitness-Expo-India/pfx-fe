import { useState, useRef } from 'react';

export default function TicketModal({ ticketType, onClose, onConfirm }) {
  const formRef = useRef(null);
  const [submitting, setSubmitting] = useState(false);

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
    onConfirm(data);
    onClose();
  }

  return (
    <div className="modal">
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>
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
      </div>
    </div>
  );
}
