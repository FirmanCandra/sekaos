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
  const [showAdmin, setShowAdmin] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [loading, setLoading] = useState(true);

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
        <div style={{ display: 'flex', gap: '5px', alignItems: 'center', fontSize: '2rem', fontWeight: 800, marginBottom: '20px' }}>
          <span style={{ color: '#38bdf8' }}>SEKAOS</span>
          <span style={{ color: '#fff' }}>PROJECT</span>
        </div>
        <p style={{ color: '#94a3b8' }}>Memuat katalog konveksi...</p>
      </div>
    );
  }

  // Jika sedang membuka Admin Dashboard Portal
  if (showAdmin) {
    return (
      <AdminDashboard
        onClose={() => setShowAdmin(false)}
        products={products}
        setProducts={setProducts}
        categories={categories}
        settings={settings}
        setSettings={setSettings}
      />
    );
  }

  // Tampilan Publik: Landing Page Asli + Fitur Showcase Katalog Dinamis
  return (
    <div className="sekaos-app">
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        onOpenAdmin={() => setShowAdmin(true)}
      />

      <Hero settings={settings} />

      <VideoBumper />

      <ServicesSection />

      <CatalogSection
        products={products}
        categories={categories}
        settings={settings}
        onSelectProduct={(p) => setSelectedProduct(p)}
      />

      <AdvantagesSection />

      <PortfolioSection />

      <ContactSection settings={settings} />

      <MapSection settings={settings} />

      <Footer
        onOpenAdmin={() => setShowAdmin(true)}
        settings={settings}
      />

      <ProductModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        settings={settings}
      />
    </div>
  );
}
