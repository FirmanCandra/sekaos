import React, { useEffect } from 'react';
import { generateWhatsAppLink } from '../services/dataService';

export default function ProductModal({ product, isOpen, onClose, settings }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const waLink = generateWhatsAppLink(product.name, settings);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Tutup Detail">
          <i className="fas fa-times"></i>
        </button>

        <div className="modal-grid">
          <div className="modal-img-col">
            <img
              src={product.image_url || '/portfolio/porto-1.jpeg'}
              alt={product.name}
              className="modal-img"
              onError={(e) => {
                e.currentTarget.src = '/portfolio/porto-1.jpeg';
              }}
            />
          </div>

          <div className="modal-content-col">
            <span className="modal-tag">Katalog Custom Konveksi</span>
            <h3 className="modal-title">{product.name}</h3>

            <p className="modal-desc">
              {product.description || 'Pakaian dan perlengkapan custom berkualitas tinggi dengan bahan pilihan, jahitan rapi, dan variasi sablon/bordir sesuai kebutuhan organisasi Anda.'}
            </p>

            <div className="modal-spec-list">
              <div className="modal-spec-item">
                <i className="fas fa-layer-group"></i>
                <span><strong>Bahan:</strong> {product.material_specs || 'Sesuai permintaan'}</span>
              </div>
              <div className="modal-spec-item">
                <i className="fas fa-boxes"></i>
                <span><strong>Min. Order:</strong> {product.min_order || '12 pcs'}</span>
              </div>
              <div className="modal-spec-item">
                <i className="fas fa-tags"></i>
                <span><strong>Estimasi:</strong> {product.price_estimate || 'Konsultasi CS untuk penawaran terbaik'}</span>
              </div>
            </div>

            <div style={{ marginTop: 'auto' }}>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-wa-inquiry"
                style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
              >
                <i className="fab fa-whatsapp" style={{ fontSize: '1.2rem' }}></i>
                Tanya / Pesan Produk Ini via WhatsApp
              </a>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', textAlign: 'center', marginTop: '10px' }}>
                *Konsultasi desain, ukuran, dan negosiasi harga dilayani langsung oleh tim Sekaos tanpa bot.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
