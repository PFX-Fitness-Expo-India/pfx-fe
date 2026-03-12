const highlights = [
  { label: 'Sports Competitions', value: '12' },
  { label: 'Athletes', value: '500+' },
  { label: 'Visitors', value: '20,000' },
  { label: 'Prize Pool', value: '₹ Huge' },
];

export default function Highlights() {
  return (
    <section id="about" className="section section-dark">
      <div className="container section-header">
        <div>
          <p className="eyebrow">Event Highlights</p>
          <h2>Elite competition. World-class production.</h2>
        </div>
        <p className="section-intro">
          PFX Fitness Expo India brings together the most exciting strength, physique, and
          performance sports under one arena with immersive staging, pro-level lighting, and
          high-octane crowds.
        </p>
      </div>
      <div className="container highlight-grid">
        {highlights.map(({ label, value }) => (
          <div className="stat-card" key={label}>
            <span className="stat-label">{label}</span>
            <span className="stat-value">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
