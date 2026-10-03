import React from 'react';

export default function VideoBumper() {
  return (
    <section className="video-bumper-section" id="video-bumper">
      <div className="container">
        <div className="section-title">
          <h2>Teaser & Bumper Resmi</h2>
          <div className="divider" style={{ backgroundColor: '#38bdf8' }}></div>
          <p>
            Saksikan kualitas produksi, profesionalisme tim, dan dedikasi SEKAOS PROJECT dalam mewujudkan setiap produk custom impian Anda.
          </p>
        </div>

        <div className="video-container-wrapper">
          <div className="video-card">
            <video
              id="sekaosBumper"
              className="video-player"
              controls
              autoPlay
              muted
              loop
              playsInline
              poster="/hero_bg.png"
            >
              <source src="/buatkan_vidio_bumper_yang_kere.mp4" type="video/mp4" />
              Browser Anda tidak mendukung tag video.
            </video>
            <div className="video-badge">
              <i className="fas fa-film"></i> Official Bumper Video
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
