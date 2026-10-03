import React, { useState } from 'react';

const portfolioItems = [
  { id: 1, title: 'Hasil Karya 1', img: '/portfolio/porto-1.jpeg' },
  { id: 2, title: 'Hasil Karya 2', img: '/portfolio/porto-2.jpeg' },
  { id: 3, title: 'Hasil Karya 3', img: '/portfolio/porto-3.jpeg' },
  { id: 4, title: 'Hasil Karya 4', img: '/portfolio/porto-4.jpeg' },
  { id: 5, title: 'Hasil Karya 5', img: '/portfolio/porto-5.jpeg' },
  { id: 6, title: 'Hasil Karya 6', img: '/portfolio/porto-6.jpeg' },
  { id: 7, title: 'Hasil Karya 7', img: '/portfolio/porto-7.jpeg' },
  { id: 8, title: 'Hasil Karya 8', img: '/portfolio/porto-8.jpeg' },
  { id: 9, title: 'Hasil Karya 9', img: '/portfolio/porto-9.jpeg' },
];

export default function PortfolioSection() {
  const [activeImage, setActiveImage] = useState(null);

  return (
    <section className="portofolio" id="portofolio">
      <div className="container">
        <div className="section-title">
          <h2>Menu Portofolio</h2>
          <div className="divider"></div>
          <p>Beberapa hasil karya terbaik kami.</p>
        </div>

        <div className="portofolio-grid">
          {portfolioItems.map((item) => (
            <div
              key={item.id}
              className="porto-item"
              onClick={() => setActiveImage(item)}
            >
              <img
                src={item.img}
                alt={item.title}
                className="porto-img"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="porto-overlay">
                <h4>{item.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Preview */}
      {activeImage && (
        <div
          className="modal-overlay"
          onClick={() => setActiveImage(null)}
          style={{ cursor: 'zoom-out' }}
        >
          <div
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '85vh',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              onClick={() => setActiveImage(null)}
              style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}
            >
              <i className="fas fa-times"></i>
            </button>
            <img
              src={activeImage.img}
              alt={activeImage.title}
              style={{
                width: '100%',
                maxHeight: '85vh',
                objectFit: 'contain',
                display: 'block'
              }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
