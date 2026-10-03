import React from 'react';

export default function MapSection({ settings }) {
  const mapsUrl = settings.maps_url || 'https://maps.app.goo.gl/SPYvU4N9ifpcvq6f9';

  return (
    <section className="map-section" style={{ position: 'relative' }}>
      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126715.79464619726!2d110.33982548232236!3d-7.024724647185265!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e708b4d3f0d024d%3A0x1e0432b9da5cb9f2!2sSemarang%2C%20Kota%20Semarang%2C%20Jawa%20Tengah!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
        width="100%"
        height="450"
        style={{ border: 0, pointerEvents: 'none', display: 'block' }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Peta Lokasi Sekaos Project Semarang"
      ></iframe>

      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 10,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          padding: '20px',
          paddingBottom: '40px',
          boxSizing: 'border-box',
          textDecoration: 'none',
        }}
        title="Buka di Google Maps"
      >
        <div className="map-overlay-btn">
          <span>
            <i className="fas fa-map-marker-alt"></i> Klik untuk Buka di Google Maps
          </span>
        </div>
      </a>
    </section>
  );
}
