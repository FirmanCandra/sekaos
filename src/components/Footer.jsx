import React from 'react';

export default function Footer({ onOpenAdmin, settings }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const waNumber = settings.whatsapp_number || '0896-7183-0693';
  const igHandle = settings.instagram_handle || '@sekaos.project';
  const address = settings.address || 'Semarang, Jawa Tengah';

  return (
    <footer>
      <div className="container">
        <div className="footer-content">
          <div className="footer-logo">
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center', fontSize: '1.6rem', fontWeight: 800 }}>
              <span className="logo-bold" style={{ color: 'white' }}>SEKAOS</span>
              <span className="logo-light" style={{ color: '#94a3b8' }}>PROJECT</span>
            </div>
            <p className="mt-2">
              Vendor Konveksi Terpercaya untuk Event & Organisasi. Mitra solusi lengkap untuk kebutuhan pakaian custom Anda di Semarang & sekitarnya.
            </p>
          </div>

          <div className="footer-links">
            <h3>Menu Cepat</h3>
            <ul>
              <li><button onClick={() => scrollTo('video-bumper')}>Video Bumper</button></li>
              <li><button onClick={() => scrollTo('konveksi')}>Layanan Konveksi</button></li>
              <li><button onClick={() => scrollTo('katalog')}>Katalog Produk</button></li>
              <li><button onClick={() => scrollTo('portofolio')}>Portofolio</button></li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  style={{ color: '#38bdf8', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <i className="fas fa-lock"></i> Portal Admin
                </button>
              </li>
            </ul>
          </div>

          <div className="footer-contact">
            <h3>Hubungi Kami</h3>
            <p><i className="fab fa-whatsapp"></i> {waNumber}</p>
            <p><i className="fab fa-instagram"></i> {igHandle}</p>
            <p><i className="fas fa-map-marker-alt"></i> {address}</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} SEKAOS PROJECT. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
