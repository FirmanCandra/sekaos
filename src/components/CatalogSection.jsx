import React, { useState, useMemo } from 'react';
import { generateWhatsAppLink } from '../services/dataService';

export default function CatalogSection({ products, settings, onSelectProduct }) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      if (!item.is_active) return false;

      // Filter pencarian
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;

      return (
        item.name.toLowerCase().includes(query) ||
        (item.material_specs && item.material_specs.toLowerCase().includes(query)) ||
        (item.description && item.description.toLowerCase().includes(query))
      );
    });
  }, [products, searchQuery]);

  return (
    <section className="catalog-section" id="katalog">
      <div className="container">
        <div className="section-title">
          <h2>Katalog Produk Pilihan</h2>
          <div className="divider"></div>
          <p>
            Eksplorasi produk konveksi custom siap produksi kami. Pilih item favorit Anda dan hubungi kami langsung untuk penawaran terbaik!
          </p>
        </div>

        {/* Search Box Saja (Kategori dihapus sesuai permintaan) */}
        <div className="catalog-header-actions" style={{ marginBottom: '35px' }}>
          <div className="catalog-search-box">
            <i className="fas fa-search catalog-search-icon"></i>
            <input
              type="text"
              className="catalog-search-input"
              placeholder="Cari produk (misal: Rompi, Nagata Drill, Kaos Combed, Jersey)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8'
                }}
                aria-label="Bersihkan pencarian"
              >
                <i className="fas fa-times-circle"></i>
              </button>
            )}
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: '#fff',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <i className="fas fa-box-open" style={{ fontSize: '3.5rem', color: '#cbd5e1', marginBottom: '15px' }}></i>
            <h3 style={{ color: '#475569', marginBottom: '8px' }}>Tidak Ada Produk Ditemukan</h3>
            <p style={{ color: '#94a3b8', marginBottom: '20px' }}>
              Coba gunakan kata kunci pencarian pakaian atau bahan lainnya.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => setSearchQuery('')}
            >
              Tampilkan Semua Produk
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((prod) => {
              const waLink = generateWhatsAppLink(prod.name, settings);

              return (
                <div key={prod.id} className="product-card">
                  {/* Badge Unggulan telah dihapus sesuai permintaan */}

                  <div
                    className="product-card-img-wrapper"
                    onClick={() => onSelectProduct(prod)}
                    title="Klik untuk lihat detail"
                  >
                    <img
                      src={prod.image_url || '/portfolio/porto-1.jpeg'}
                      alt={prod.name}
                      className="product-card-img"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = '/portfolio/porto-1.jpeg';
                      }}
                    />
                  </div>

                  <div className="product-card-body">
                    <h3
                      className="product-card-title"
                      onClick={() => onSelectProduct(prod)}
                    >
                      {prod.name}
                    </h3>

                    {prod.material_specs && (
                      <div className="product-card-specs">
                        <i className="fas fa-layer-group"></i>
                        <span>{prod.material_specs}</span>
                      </div>
                    )}

                    {prod.min_order && (
                      <div className="product-card-specs">
                        <i className="fas fa-boxes"></i>
                        <span>Min. Order: <strong>{prod.min_order}</strong></span>
                      </div>
                    )}

                    <div className="product-card-actions">
                      <button
                        className="btn-detail-quick"
                        onClick={() => onSelectProduct(prod)}
                        title="Lihat Spesifikasi Lengkap"
                      >
                        <i className="fas fa-eye"></i> Detail
                      </button>

                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-wa-inquiry"
                        title="Tanya ke WhatsApp CS"
                      >
                        <i className="fab fa-whatsapp"></i> Tanya Produk
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
