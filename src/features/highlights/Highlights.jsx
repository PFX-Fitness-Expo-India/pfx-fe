const highlights = [
  { label: 'Sports Competitions', value: '12' },
  { label: 'Athletes', value: '500+' },
  { label: 'Visitors', value: '20,000' },
  { label: 'Prize Pool', value: '₹ Huge' },
];

export default function Highlights() {
  // const [data,setData]=useState();
  // try{
  //   const res=await axios.get(`${import.meta.env.VITE_API_URL}/api/v1/event/highlights`)
  //   setData(res.data);
  // }
  // catch(e){
  //   console.log(e);
  // }
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
      <div className="container">
        <div className="row g-4">
          {highlights.map(({ label, value }) => (
            <div className="col-6 col-md-3" key={label}>
              <div className="stat-card h-100">
                <span className="stat-label">{label}</span>
                <span className="stat-value">{value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
