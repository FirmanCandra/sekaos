import React, { useState, useEffect } from 'react';

export default function Navbar({ activePage, setActivePage, onOpenAdmin }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (anchorId) => {
    setActivePage('home');
    setMobileMenuOpen(false);
    setTimeout(() => {
      const el = document.getElementById(anchorId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container">
        <div className="logo" onClick={() => { setActivePage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
          <img
            src="/logo.jpeg"
            alt="Sekaos Project Logo"
            style={{ height: '40px', width: 'auto', marginRight: '10px', borderRadius: '4px' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            <span className="logo-bold">SEKAOS</span>
            <span className="logo-light">PROJECT</span>
          </div>
        </div>

        <nav>
          <ul className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
            <li>
              <button onClick={() => { setActivePage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                Beranda
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('video-bumper')}>
                Video Bumper
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('konveksi')}>
                Layanan
              </button>
            </li>
            <li>
              <button
                className="nav-btn-katalog"
                onClick={() => handleNavClick('katalog')}
              >
                <i className="fas fa-layer-group"></i> Katalog Produk
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('portofolio')}>
                Portofolio
              </button>
            </li>
            <li>
              <button onClick={() => handleNavClick('contact')}>
                Kontak
              </button>
            </li>
            <li>
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAdmin(); }}
                style={{ color: '#64748b', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                title="Admin Dashboard Portal"
              >
                <i className="fas fa-user-shield"></i> Admin
              </button>
            </li>
          </ul>
        </nav>

        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Navigation"
        >
          <i className={mobileMenuOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
        </button>
      </div>
    </header>
  );
}
