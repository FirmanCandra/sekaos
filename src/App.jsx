import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import VideoBumper from './components/VideoBumper';
import ServicesSection from './components/ServicesSection';
import CatalogSection from './components/CatalogSection';
import AdvantagesSection from './components/AdvantagesSection';
import PortfolioSection from './components/PortfolioSection';
import ContactSection from './components/ContactSection';
import MapSection from './components/MapSection';
import Footer from './components/Footer';
import ProductModal from './components/ProductModal';
import AdminDashboard from './components/AdminDashboard';
import { getProducts, getCategories, getSettings } from './services/dataService';

export default function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState({});
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activePage, setActivePage] = useState('home');
  const [loading, setLoading] = useState(true);

  // Helper untuk cek apakah URL saat ini adalah /login atau /admin
  const checkIsAdminPath = () => {
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return (
      path === '/login' ||
      path === '/admin' ||
      path === '/login/' ||
      path === '/admin/' ||
      hash === '#login' ||
      hash === '#admin'
    );
  };

  const [showAdmin, setShowAdmin] = useState(checkIsAdminPath());

  useEffect(() => {
    // Dengarkan perubahan URL / tombol back-forward browser
    const handleLocationChange = () => {
      setShowAdmin(checkIsAdminPath());
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodData, catData, settData] = await Promise.all([
          getProducts(),
          getCategories(),
          getSettings()
        ]);
        setProducts(prodData || []);
        setCategories(catData || []);
        setSettings(settData || {});
      } catch (err) {
        console.error('Error loading initial data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Navigasi keluar dari Admin Dashboard kembali ke landing page /
  const handleCloseAdmin = () => {
    setShowAdmin(false);
    window.history.pushState({}, '', '/');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0f172a',
        color: '#fff'
      }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '2.5rem', fontWeight: 800, marginBottom: '15px' }}>
          <span style={{ color: '#1a365d', background: '#fff', padding: '4px 12px', borderRadius: '8px' }}>SEKAOS</span>
        </div>
        <p style={{ color: '#94a3b8' }}>Memuat katalog konveksi...</p>
      </div>
    );
  }

  // Jika URL diketik /login atau /admin, tampilkan Admin Dashboard
  if (showAdmin) {
    return (
      <AdminDashboard
        onClose={handleCloseAdmin}
        products={products}
        setProducts={setProducts}
        categories={categories}
        settings={settings}
        setSettings={setSettings}
      />
    );
  }

  // Tampilan Landing Page Publik
  return (
    <div className="sekaos-app">
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <Hero settings={settings} />

      <VideoBumper />

      <ServicesSection />

      <CatalogSection
        products={products}
        settings={settings}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      <AdvantagesSection />

      <PortfolioSection />

      <ContactSection settings={settings} />

      <MapSection settings={settings} />

      <Footer settings={settings} />

      <ProductModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        settings={settings}
      />
    </div>
  );
}
