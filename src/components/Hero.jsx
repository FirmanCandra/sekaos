import React from 'react';
import { generateWhatsAppLink } from '../services/dataService';

export default function Hero({ settings }) {
  const waLink = generateWhatsAppLink('', settings);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="hero" id="home">
      <div
        className="hero-bg"
        style={{ backgroundImage: `url('/hero_bg.png')` }}
      ></div>
      <div className="hero-overlay"></div>
      <div className="container hero-content">
        <h1 className="fade-in-up">
          Vendor Konveksi<br /><span>Terpercaya</span>
        </h1>
        <h3
          className="fade-in-up delay-1"
          style={{ color: '#1a365d', fontWeight: 600, marginBottom: '20px', fontSize: '1.4rem' }}
        >
          Untuk Event & Organisasi
        </h3>
        <p className="fade-in-up delay-1">
          Kami hadir sebagai mitra solusi lengkap untuk segala kebutuhan pakaian dan perlengkapan identitas Anda. Melayani pembuatan dengan sistem custom sesuai keinginan, mulai dari desain, bahan, hingga ukuran disesuaikan khusus untuk kebutuhan acara, instansi, komunitas, maupun kegiatan organisasi.
        </p>
        <div className="hero-buttons fade-in-up delay-2">
          <a
            href={waLink}
            className="btn btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-whatsapp"></i> Konsultasi Sekarang
          </a>
          <button
            onClick={() => scrollToSection('katalog')}
            className="btn btn-primary"
            style={{ backgroundColor: '#0f2547' }}
          >
            <i className="fas fa-boxes"></i> Lihat Katalog
          </button>
          <button
            onClick={() => scrollToSection('video-bumper')}
            className="btn btn-outline"
          >
            <i className="fas fa-play-circle"></i> Tonton Bumper
          </button>
        </div>
      </div>
    </section>
  );
}
