import React from 'react';

const advantages = [
  { icon: 'fas fa-paint-brush', text: 'Desain gratis & bisa direvisi' },
  { icon: 'fas fa-tags', text: 'Harga terjangkau tanpa kurangi kualitas' },
  { icon: 'fas fa-calendar-check', text: 'Proses transparan & terjadwal' },
  { icon: 'fas fa-comments', text: 'Komunikasi langsung dengan tim (tanpa bot)' },
  { icon: 'fas fa-wallet', text: 'Bisa pembayaran bertahap / dibelakang' },
  { icon: 'fas fa-truck', text: 'Gratis ongkir untuk wilayah tertentu' },
];

export default function AdvantagesSection() {
  return (
    <section className="keunggulan">
      <div className="container">
        <div className="section-title">
          <h2>Keunggulan Kami</h2>
          <div className="divider"></div>
          <p>Mengapa Anda harus memilih SEKAOS PROJECT sebagai mitra Anda?</p>
        </div>

        <div className="keunggulan-grid">
          {advantages.map((item, index) => (
            <div key={index} className="keunggulan-item">
              <div className="keunggulan-icon">
                <i className={item.icon}></i>
              </div>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
