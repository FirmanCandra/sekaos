import React from 'react';

const services = [
  { icon: 'fas fa-vest', title: 'Rompi / Vest Custom' },
  { icon: 'fas fa-user-tie', title: 'PDH Custom' },
  { icon: 'fas fa-tshirt', title: 'Kaos Custom' },
  { icon: 'fas fa-running', title: 'Jersey Custom' },
  { icon: 'fas fa-user-friends', title: 'Seragam' },
  { icon: 'fas fa-id-card', title: 'Paket ID Card' },
  { icon: 'fas fa-medal', title: 'Medali' },
  { icon: 'fas fa-tag', title: 'Bib Number' },
  { icon: 'fas fa-shopping-bag', title: 'Totebag' },
  { icon: 'fas fa-box-open', title: '& Perlengkapan Lainnya' },
];

export default function ServicesSection() {
  return (
    <section className="spesialis" id="konveksi">
      <div className="container">
        <div className="section-title">
          <h2>Yang Kami Sediakan</h2>
          <div className="divider"></div>
          <p>Berbagai macam produk custom yang dapat kami kerjakan untuk kebutuhan Anda.</p>
        </div>

        <div className="cards-grid">
          {services.map((item, index) => (
            <div key={index} className="card">
              <div className="card-icon">
                <i className={item.icon}></i>
              </div>
              <h3>{item.title}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
