import React from 'react';
import { generateWhatsAppLink } from '../services/dataService';

export default function ContactSection({ settings }) {
  const waLink = generateWhatsAppLink('', settings);
  const waNumberDisplay = settings.whatsapp_number || '089671830693';
  const igHandle = settings.instagram_handle || '@sekaos.project';
  const igUrl = settings.instagram_url || 'https://instagram.com/sekaos.project';

  return (
    <>
      {/* Closing Statement */}
      <section className="closing-statement">
        <div className="container" style={{ textAlign: 'center' }}>
          <h3
            style={{
              fontSize: '1.75rem',
              color: 'var(--primary-color)',
              fontStyle: 'italic',
              fontWeight: 600,
              maxWidth: '850px',
              margin: '0 auto',
              lineHeight: 1.4
            }}
          >
            "Lebih dari sekadar vendor, kami mitra yang mendampingi keberhasilan setiap kegiatan Anda."
          </h3>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="contact-cta" id="contact">
        <div className="container">
          <div className="cta-buttons">
            <a
              href={waLink}
              className="btn-wa"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-whatsapp"></i> WhatsApp: {waNumberDisplay}
            </a>
            <a
              href={igUrl}
              className="btn-ig"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-instagram"></i> {igHandle}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
