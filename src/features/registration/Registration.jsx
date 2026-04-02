import { useState } from 'react';
import { useModal } from '../../contexts/ModalContext';

export default function Registration() {
  const { showModal, closeModal } = useModal();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === 'name' || name === 'email') {
      newValue = value.replace(/[^a-zA-Z0-9@. ]/g, '');
    }
    setFormData(prev => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.message.trim()) newErrors.message = 'Message is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Direct call to Vercel API Route
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setFormData({ name: '', email: '', message: '' });
        showModal('Thank You!', 'Your message has been sent. We will get back to you shortly.', 'success');
      } else {
        throw new Error(data.message || 'Failed to send message.');
      }
    } catch (error) {
      console.error('Contact error:', error);
      showModal('Error', error.message || 'Something went wrong. In local Dev (npm run dev), Vercel API routes cannot be tested natively unless using Vercel CLI.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact-us" className="section contact-section">
      <div className="container section-header">
        <div>
          <p className="eyebrow">Get In Touch</p>
          <h2>Contact PFX Fitness Expo</h2>
        </div>
        <p className="section-intro">
          Have a question about the expo, sponsorships, or athlete registration? Send us a message and our team will get back to you as soon as possible.
        </p>
      </div>
      
      <div className="container registration-layout contact-layout">
        <div className="registration-copy">
          <h3>We're here to help you shine.</h3>
          <p>
            Whether you are an aspiring athlete looking to compete, a brand wanting to sponsor India's biggest electric stage, or an enthusiastic fan, we are here to answer your queries.
          </p>
          <ul className="bullet-list">
            <li>Sponsorship opportunities</li>
            <li>Athlete participation inquiries</li>
            <li>Expo & ticketing questions</li>
            <li>Media & PR coverage</li>
          </ul>
        </div>

        <div className="registration-card">
          <form className="form" onSubmit={handleSubmit} noValidate>
            <div className="form-row">
              <div className="form-field full">
                <label htmlFor="contactName">Full Name</label>
                <input 
                  id="contactName" 
                  name="name" 
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  style={errors.name ? { borderColor: '#ff4444' } : {}}
                />
                {errors.name && <span style={{ color: '#ff4444', fontSize: '0.85rem', marginTop: '4px' }}>{errors.name}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-field full">
                <label htmlFor="contactEmail">Email Address</label>
                <input 
                  id="contactEmail" 
                  name="email" 
                  type="email" 
                  placeholder="johndoe@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  style={errors.email ? { borderColor: '#ff4444' } : {}}
                />
                {errors.email && <span style={{ color: '#ff4444', fontSize: '0.85rem', marginTop: '4px' }}>{errors.email}</span>}
              </div>
            </div>
            <div className="form-row">
              <div className="form-field full">
                <label htmlFor="contactMessage">Message</label>
                <textarea 
                  id="contactMessage" 
                  name="message" 
                  rows="5"
                  placeholder="How can we help you?"
                  value={formData.message}
                  onChange={handleChange}
                  style={{ resize: 'vertical', ...(errors.message ? { borderColor: '#ff4444' } : {}) }}
                />
                {errors.message && <span style={{ color: '#ff4444', fontSize: '0.85rem', marginTop: '4px' }}>{errors.message}</span>}
              </div>
            </div>
            <div className="form-footer contact-footer">
              <div className="registration-actions">
                <button type="submit" className="btn primary" disabled={isSubmitting} style={{ width: '100%', justifySelf: 'stretch', opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>
                  {isSubmitting ? 'SENDING...' : 'SEND MESSAGE'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
