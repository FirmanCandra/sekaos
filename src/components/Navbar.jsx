import React, { useState, useEffect } from 'react';

export default function Navbar({ activePage, setActivePage }) {
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
        <div
          className="logo"
          onClick={() => { setActivePage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        >
          <img
            src="/logo.png"
            alt="Sekaos Logo"
            style={{ height: '52px', width: 'auto', display: 'block', objectFit: 'contain' }}
            onError={(e) => { e.currentTarget.src = '/logo.jpeg'; }}
          />
          <span className="logo-bold" style={{ fontSize: '1.9rem', letterSpacing: '0.5px' }}>
            SEKAOS
          </span>
        </div>

        <nav>
          <ul className={`nav-links ${mobileMenuOpen ? 'active' : ''}`}>
            <li>
              <button onClick={() => { setActivePage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                Beranda
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
                <i className="fas fa-layer-group"></i> Katalog
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
