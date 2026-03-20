const sponsors = [
  'BrandOne Nutrition',
  'IronForce Equipment',
  'Enduro Wear',
  'HydraFuel',
  'Titan Labs',
  'MetaFit Tech',
  'Pulse Active',
  'Velocity Bikes',
];

export default function Sponsors() {
  return (
    <section id="sponsors" className="section">
      <div className="container section-header">
        <div>
          <p className="eyebrow">Sponsors &amp; Exhibitors</p>
          <h2>Powered by leading global brands</h2>
        </div>
        <p className="section-intro">
          Showcase your brand to a highly engaged audience of athletes, coaches, and fitness
          consumers from across India.
        </p>
      </div>
      <div className="container">
        <div className="row g-3">
          {sponsors.map((name) => (
            <div className="col-6 col-md-4 col-lg-3" key={name}>
              <div className="sponsor-card h-100">{name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
