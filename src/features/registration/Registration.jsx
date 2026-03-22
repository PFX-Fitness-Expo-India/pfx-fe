import { useState, useEffect, useRef } from 'react';
import { sports } from '../../services/sportsService';
import { useAppContext } from '../../contexts/AppContext';
import { ADMIN_PHONE, SCROLL_OFFSET } from '../../constants/config';
import CustomSelect from '../../shared/CustomSelect';

export default function Registration() {
  const { addAthlete } = useAppContext();
  const [selectedSportId, setSelectedSportId] = useState('');
  const formRef = useRef(null);

  const selectedSport = sports.find((s) => s.id === selectedSportId) || null;

  // Listen for pre-select events dispatched from SportModal
  useEffect(() => {
    const onSelectSport = (e) => setSelectedSportId(e.detail);
    window.addEventListener('pfx:selectSport', onSelectSport);
    return () => window.removeEventListener('pfx:selectSport', onSelectSport);
  }, []);

  function getRegistrationNote() {
    if (!selectedSport) return 'Select a sport to see registration details.';
    if (selectedSport.requiresPayment)
      return 'Online payment is mandatory for this event. After submitting the form, you will be guided to complete payment.';
    return "Submit the form and then tap 'Call to Register' to confirm your slot with the admin.";
  }

  function handleSubmit(e) {
    e.preventDefault();
    const form = formRef.current;
    if (!selectedSport) {
      alert('Please select a sport category.');
      return;
    }
    const data = {
      name: form.elements.name.value.trim(),
      phone: form.elements.phone.value.trim(),
      email: form.elements.email.value.trim(),
      age: form.elements.age.value.trim(),
      city: form.elements.city.value.trim(),
      sportId: selectedSport.id,
      sportName: selectedSport.name,
      weight: form.elements.weight.value.trim(),
      requiresPayment: selectedSport.requiresPayment,
      createdAt: new Date().toISOString(),
    };
    addAthlete(data);
    form.reset();
    setSelectedSportId('');
    if (selectedSport.requiresPayment) {
      alert('Athrox and Marathon require online payment. In a live system you would now be redirected to a secure payment gateway.');
    } else {
      alert("Registration submitted. Please tap the 'Call to Register' button to confirm with the admin.");
    }
  }

  return (
    <section id="athlete-registration" className="section">
      <div className="container section-header">
        <div>
          <p className="eyebrow">Athlete Registration</p>
          <h2>Step onto India's most electric stage</h2>
        </div>
        <p className="section-intro">
          Register now to secure your slot in your chosen discipline. Limited athlete spots per
          category to ensure premium competition.
        </p>
      </div>
      <div className="container registration-layout">
        <div className="registration-copy">
          <h3>Elite standards. Fair judging. Real spotlight.</h3>
          <p>
            All competitions are judged by experienced panels with clear rulebooks, weight classes,
            and transparent scoring criteria.
          </p>
          <ul className="bullet-list">
            <li>Multiple weight categories across strength sports</li>
            <li>Natural &amp; open bodybuilding divisions</li>
            <li>Anti-doping protocols for select categories</li>
            <li>Cash prizes, trophies, and media coverage</li>
          </ul>
        </div>

        <div className="registration-card">
          <form ref={formRef} className="form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="athleteName">Name</label>
                <input id="athleteName" name="name" required />
              </div>
              <div className="form-field">
                <label htmlFor="athletePhone">Phone number</label>
                <input id="athletePhone" name="phone" type="tel" required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="athleteEmail">Email</label>
                <input id="athleteEmail" name="email" type="email" required />
              </div>
              <div className="form-field">
                <label htmlFor="athleteAge">Age</label>
                <input id="athleteAge" name="age" type="number" min="16" required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label htmlFor="athleteCity">City</label>
                <input id="athleteCity" name="city" required />
              </div>
              <div className="form-field">
                <label htmlFor="sportCategory">Sport category</label>
                <CustomSelect
                  id="sportCategory"
                  name="sport"
                  value={selectedSportId}
                  onChange={(e) => setSelectedSportId(e.target.value)}
                  options={sports.map((s) => ({ value: s.id, label: s.name }))}
                  placeholder="Select a sport"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-field full">
                <label htmlFor="weightCategory">Weight category</label>
                <input id="weightCategory" name="weight" placeholder="e.g. Under 75kg" required />
              </div>
            </div>
            <div className="form-footer">
              <p className="payment-note">{getRegistrationNote()}</p>
              <div className="registration-actions">
                <button type="submit" className="btn primary">Submit Registration</button>
                {selectedSport && !selectedSport.requiresPayment && (
                  <a href={`tel:${ADMIN_PHONE}`} className="btn subtle">Call to Register</a>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* CTA Banner */}
      <div className="container" style={{ marginTop: 'clamp(32px, 5vw, 60px)' }}>
        <div className="cta-inner">
          <div>
            <p className="eyebrow">Final Call</p>
            <h2>Ready to compete at PFX Fitness Expo India?</h2>
            <p>
              Lock in your division today and get ready to perform in front of India's most
              passionate fitness crowd.
            </p>
          </div>
          <button
            className="btn accent"
            onClick={() => {
              const el = document.getElementById('athlete-registration');
              if (el) window.scrollTo({ top: el.offsetTop - SCROLL_OFFSET, behavior: 'smooth' });
            }}
          >
            Register for Competitions
          </button>
        </div>
      </div>
    </section>
  );
}
