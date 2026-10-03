import React, { useState, useEffect } from 'react';
import {
  adminLogin,
  getAdminSession,
  adminLogout,
  saveProduct,
  deleteProduct,
  saveSettings
} from '../services/dataService';
import { isSupabaseConfigured } from '../lib/supabase';

export default function AdminDashboard({
  onClose,
  products,
  setProducts,
  categories,
  settings,
  setSettings
}) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products'); // 'overview', 'products', 'settings'

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Product modal state
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category_id: '1',
    description: '',
    material_specs: '',
    min_order: '12 pcs',
    price_estimate: 'Hubungi CS',
    is_featured: false,
    is_active: true,
    image_url: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Settings form state
  const [settingsForm, setSettingsForm] = useState(settings);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Check auth on load
  useEffect(() => {
    async function checkAuth() {
      try {
        const session = await getAdminSession();
        setUser(session);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  useEffect(() => {
    setSettingsForm(settings);
  }, [settings]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setIsSubmitting(true);
    try {
      const loggedUser = await adminLogin(loginEmail, loginPassword);
      setUser(loggedUser);
    } catch (err) {
      setLoginError(err.message || 'Gagal login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await adminLogout();
    setUser(null);
  };

  const openAddProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category_id: categories[0]?.id || '1',
      description: '',
      material_specs: '',
      min_order: '12 pcs',
      price_estimate: 'Hubungi CS',
      is_featured: false,
      is_active: true,
      image_url: '/portfolio/porto-1.jpeg'
    });
    setImageFile(null);
    setImagePreview('');
    setShowProductModal(true);
  };

  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      id: product.id,
      name: product.name,
      category_id: String(product.category_id),
      description: product.description || '',
      material_specs: product.material_specs || '',
      min_order: product.min_order || '12 pcs',
      price_estimate: product.price_estimate || 'Hubungi CS',
      is_featured: Boolean(product.is_featured),
      is_active: Boolean(product.is_active),
      image_url: product.image_url || ''
    });
    setImageFile(null);
    setImagePreview(product.image_url || '');
    setShowProductModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...productForm,
        image_url: imagePreview || productForm.image_url
      };
      const saved = await saveProduct(payload, imageFile);

      if (editingProduct) {
        setProducts((prev) =>
          prev.map((p) => (String(p.id) === String(saved.id) ? { ...p, ...saved } : p))
        );
      } else {
        setProducts((prev) => [saved, ...prev]);
      }

      setShowProductModal(false);
    } catch (err) {
      alert('Gagal menyimpan produk: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (window.confirm(`Yakin ingin menghapus produk "${name}"?`)) {
      try {
        await deleteProduct(id);
        setProducts((prev) => prev.filter((p) => String(p.id) !== String(id)));
      } catch (err) {
        alert('Gagal menghapus produk: ' + err.message);
      }
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const updated = await saveSettings(settingsForm);
      setSettings(updated);
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
    } catch (err) {
      alert('Gagal menyimpan pengaturan: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#fff' }}>
        <p>Memuat sistem...</p>
      </div>
    );
  }

  // =================== LAYAR LOGIN ===================
  if (!user) {
    return (
      <div
        style={{
          minHeight: '100vh',
          backgroundColor: '#09111e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
      >
        <div
          style={{
            maxWidth: '420px',
            width: '100%',
            backgroundColor: '#1e293b',
            borderRadius: '20px',
            padding: '40px 30px',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
            border: '1px solid #334155',
            color: '#fff'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ display: 'inline-flex', gap: '5px', alignItems: 'center', fontSize: '1.8rem', fontWeight: 800 }}>
              <span style={{ color: '#38bdf8' }}>SEKAOS</span>
              <span style={{ color: '#fff' }}>PROJECT</span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '6px' }}>
              Portal Manajemen Katalog & Admin
            </p>
          </div>

          {loginError && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '20px'
              }}
            >
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
                Email Akun Admin
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@sekaos.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '6px' }}>
                Kata Sandi
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  color: '#fff',
                  outline: 'none',
                  fontSize: '0.95rem'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '0.95rem', borderRadius: '10px' }}
            >
              {isSubmitting ? 'Memeriksa...' : 'Masuk ke Dashboard'}
            </button>
          </form>

          {/* Quick Demo Fill Helper */}
          {!isSupabaseConfigured && (
            <div
              style={{
                marginTop: '25px',
                padding: '12px',
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                border: '1px dashed #38bdf8',
                borderRadius: '10px',
                textAlign: 'center'
              }}
            >
              <p style={{ fontSize: '0.8rem', color: '#7dd3fc', marginBottom: '8px' }}>
                Mode Demo Lokal Aktif (Tanpa Supabase)
              </p>
              <button
                type="button"
                onClick={() => {
                  setLoginEmail('admin@sekaos.com');
                  setLoginPassword('admin123');
                }}
                style={{
                  background: '#0284c7',
                  border: 'none',
                  color: '#fff',
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Gunakan Akun Demo
              </button>
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem' }}
            >
              &larr; Kembali ke Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =================== LAYOUT DASHBOARD ADMIN ===================
  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <img src="/logo.jpeg" alt="Logo" style={{ height: '35px', borderRadius: '4px' }} />
          <div>
            <h2>SEKAOS PANEL</h2>
            <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>
              {isSupabaseConfigured ? '● Supabase Cloud' : '● Local Demo Mode'}
            </span>
          </div>
        </div>

        <ul className="admin-sidebar-menu">
          <li>
            <button
              className={`admin-menu-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <i className="fas fa-chart-pie"></i> Ringkasan
            </button>
          </li>
          <li>
            <button
              className={`admin-menu-btn ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <i className="fas fa-boxes"></i> Katalog Produk ({products.length})
            </button>
          </li>
          <li>
            <button
              className={`admin-menu-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <i className="fas fa-cog"></i> Pengaturan Kontak
            </button>
          </li>
          <li style={{ marginTop: 'auto' }}>
            <button className="admin-menu-btn" onClick={onClose}>
              <i className="fas fa-external-link-alt"></i> Lihat Web Publik
            </button>
          </li>
          <li>
            <button
              className="admin-menu-btn"
              onClick={handleLogout}
              style={{ color: '#f87171' }}
            >
              <i className="fas fa-sign-out-alt"></i> Keluar
            </button>
          </li>
        </ul>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Top Header */}
        <div className="admin-header">
          <div>
            <h1>
              {activeTab === 'overview' && 'Ringkasan Dashboard'}
              {activeTab === 'products' && 'Manajemen Katalog Produk'}
              {activeTab === 'settings' && 'Pengaturan Kontak & WhatsApp'}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
              Kelola katalog pakaian dan identitas event Sekaos Project.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {activeTab === 'products' && (
              <button
                className="btn btn-primary"
                onClick={openAddProductModal}
                style={{ padding: '10px 18px', fontSize: '0.88rem' }}
              >
                <i className="fas fa-plus"></i> Tambah Produk Baru
              </button>
            )}
            <button
              className="btn btn-outline"
              onClick={onClose}
              style={{ color: '#fff', borderColor: '#475569', padding: '10px 16px', fontSize: '0.88rem' }}
            >
              <i className="fas fa-globe"></i> Buka Website
            </button>
          </div>
        </div>

        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div>
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8' }}>
                  <i className="fas fa-boxes"></i>
                </div>
                <div>
                  <div className="admin-stat-num">{products.length}</div>
                  <div className="admin-stat-label">Total Produk Display</div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ backgroundColor: 'rgba(37, 211, 102, 0.15)', color: '#25d366' }}>
                  <i className="fas fa-check-circle"></i>
                </div>
                <div>
                  <div className="admin-stat-num">{products.filter((p) => p.is_active).length}</div>
                  <div className="admin-stat-label">Produk Aktif Tayang</div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                  <i className="fas fa-star"></i>
                </div>
                <div>
                  <div className="admin-stat-num">{products.filter((p) => p.is_featured).length}</div>
                  <div className="admin-stat-label">Produk Unggulan</div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon" style={{ backgroundColor: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
                  <i className="fas fa-tags"></i>
                </div>
                <div>
                  <div className="admin-stat-num">{categories.length}</div>
                  <div className="admin-stat-label">Kategori Pakaian</div>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: '#1e293b', borderRadius: '16px', padding: '24px', border: '1px solid #334155' }}>
              <h3 style={{ color: '#fff', marginBottom: '12px' }}>Aksi Cepat</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '20px' }}>
                Tambahkan foto dan spesifikasi pakaian baru untuk langsung ditampilkan pada katalog depan website.
              </p>
              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  className="btn btn-primary"
                  onClick={() => { setActiveTab('products'); openAddProductModal(); }}
                >
                  <i className="fas fa-plus"></i> Tambah Produk Baru
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => setActiveTab('settings')}
                  style={{ color: '#fff', borderColor: '#475569' }}
                >
                  <i className="fas fa-phone-alt"></i> Update Nomor CS WhatsApp
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PRODUCTS TABLE ================= */}
        {activeTab === 'products' && (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>Foto</th>
                  <th>Nama Produk</th>
                  <th>Kategori</th>
                  <th>Spesifikasi Bahan</th>
                  <th>Min Order</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                      Belum ada produk di katalog. Klik "Tambah Produk Baru" untuk menambahkan!
                    </td>
                  </tr>
                ) : (
                  products.map((p) => {
                    const cat = categories.find((c) => String(c.id) === String(p.category_id));
                    return (
                      <tr key={p.id}>
                        <td>
                          <img
                            src={p.image_url || '/portfolio/porto-1.jpeg'}
                            alt={p.name}
                            className="admin-product-thumb"
                            onError={(e) => { e.currentTarget.src = '/portfolio/porto-1.jpeg'; }}
                          />
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#fff' }}>{p.name}</div>
                          {p.is_featured && (
                            <span style={{ fontSize: '0.75rem', color: '#f59e0b', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <i className="fas fa-star"></i> Unggulan
                            </span>
                          )}
                        </td>
                        <td>
                          <span style={{ backgroundColor: 'rgba(255,255,255,0.08)', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem' }}>
                            {cat ? cat.name : 'Umum'}
                          </span>
                        </td>
                        <td style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                          {p.material_specs || '-'}
                        </td>
                        <td style={{ color: '#cbd5e1', fontSize: '0.85rem' }}>
                          {p.min_order || '12 pcs'}
                        </td>
                        <td>
                          {p.is_active ? (
                            <span style={{ color: '#25d366', fontSize: '0.8rem', fontWeight: 600 }}>
                              ● Tayang
                            </span>
                          ) : (
                            <span style={{ color: '#f87171', fontSize: '0.8rem', fontWeight: 600 }}>
                              ● Draft
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => openEditProductModal(p)}
                            style={{
                              background: '#334155',
                              border: 'none',
                              color: '#fff',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              marginRight: '8px'
                            }}
                            title="Edit Produk"
                          >
                            <i className="fas fa-pencil-alt"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.2)',
                              border: '1px solid #ef4444',
                              color: '#f87171',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              cursor: 'pointer'
                            }}
                            title="Hapus Produk"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= TAB 3: SETTINGS ================= */}
        {activeTab === 'settings' && (
          <div style={{ maxWidth: '700px', backgroundColor: '#1e293b', borderRadius: '16px', padding: '30px', border: '1px solid #334155' }}>
            {settingsSaved && (
              <div style={{ backgroundColor: 'rgba(37, 211, 102, 0.2)', border: '1px solid #25d366', color: '#86efac', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
                Pengaturan kontak berhasil disimpan!
              </div>
            )}

            <form onSubmit={handleSaveSettings}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '8px' }}>
                  Nomor WhatsApp CS (Gunakan format 628...)
                </label>
                <input
                  type="text"
                  required
                  value={settingsForm.whatsapp_number}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_number: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '8px' }}>
                  Template Pesan Otomatis WhatsApp (Gunakan tag {'{product_name}'} untuk nama barang)
                </label>
                <textarea
                  rows="3"
                  value={settingsForm.whatsapp_template}
                  onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp_template: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                ></textarea>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '8px' }}>
                  Username Instagram
                </label>
                <input
                  type="text"
                  value={settingsForm.instagram_handle}
                  onChange={(e) => setSettingsForm({ ...settingsForm, instagram_handle: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                />
              </div>

              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '8px' }}>
                  Alamat / Wilayah Operasional
                </label>
                <input
                  type="text"
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
                style={{ padding: '12px 28px', borderRadius: '8px' }}
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* ================= MODAL TAMBAH / EDIT PRODUK ================= */}
      {showProductModal && (
        <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
          <div
            className="modal-card"
            style={{ backgroundColor: '#1e293b', color: '#fff', border: '1px solid #334155', maxWidth: '650px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close-btn"
              onClick={() => setShowProductModal(false)}
              style={{ color: '#fff', background: 'rgba(255,255,255,0.1)' }}
            >
              <i className="fas fa-times"></i>
            </button>

            <div style={{ padding: '30px' }}>
              <h2 style={{ color: '#fff', marginBottom: '20px' }}>
                {editingProduct ? 'Edit Data Produk' : 'Tambah Produk Display Baru'}
              </h2>

              <form onSubmit={handleSaveProduct}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px' }}>
                    Nama Produk / Judul Pakaian *
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="Contoh: Rompi Tactical Lapangan 4 Saku"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px' }}>
                      Kategori Pakaian
                    </label>
                    <select
                      value={productForm.category_id}
                      onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px' }}>
                      Minimal Pemesanan
                    </label>
                    <input
                      type="text"
                      value={productForm.min_order}
                      onChange={(e) => setProductForm({ ...productForm, min_order: e.target.value })}
                      placeholder="12 pcs"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px' }}>
                    Spesifikasi Bahan & Opsi Jahitan
                  </label>
                  <input
                    type="text"
                    value={productForm.material_specs}
                    onChange={(e) => setProductForm({ ...productForm, material_specs: e.target.value })}
                    placeholder="Contoh: Nagata Drill Original / Cotton Combed 24s"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px' }}>
                    Deskripsi Produk & Keunggulan
                  </label>
                  <textarea
                    rows="3"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    placeholder="Jelaskan keunggulan pakaian, opsi bordir komputer, variasi warna..."
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff' }}
                  ></textarea>
                </div>

                {/* Upload Foto */}
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', marginBottom: '6px' }}>
                    Foto Produk (Format JPG/PNG/WEBP)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'block', marginBottom: '10px', color: '#94a3b8' }}
                  />

                  {imagePreview && (
                    <div style={{ marginTop: '10px' }}>
                      <p style={{ fontSize: '0.8rem', color: '#38bdf8', marginBottom: '5px' }}>Preview Foto:</p>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ height: '100px', width: '130px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #334155' }}
                      />
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '20px', marginBottom: '25px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input
                      type="checkbox"
                      checked={productForm.is_featured}
                      onChange={(e) => setProductForm({ ...productForm, is_featured: e.target.checked })}
                    />
                    Tampilkan sebagai Produk Unggulan
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                    <input
                      type="checkbox"
                      checked={productForm.is_active}
                      onChange={(e) => setProductForm({ ...productForm, is_active: e.target.checked })}
                    />
                    Status Aktif (Tayang di Web)
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowProductModal(false)}
                    style={{ color: '#fff', borderColor: '#475569' }}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
