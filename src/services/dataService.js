/**
 * Sekaos Project - Data Service Layer
 * Terintegrasi langsung dengan Hostinger MySQL REST API (PHP 8 + PDO)
 * dengan Fallback Cache LocalStorage otomatis jika server offline/dev mode.
 */

import { initialCategories, initialProducts, initialSettings } from '../data/initialData';

const LOCAL_STORAGE_KEY_PRODUCTS = 'sekaos_products';
const LOCAL_STORAGE_KEY_CATEGORIES = 'sekaos_categories';
const LOCAL_STORAGE_KEY_SETTINGS = 'sekaos_settings';
const LOCAL_STORAGE_KEY_AUTH = 'sekaos_admin_user';
const LOCAL_STORAGE_KEY_TOKEN = 'sekaos_admin_token';

// URL Base REST API
const API_BASE = '/api';

// Helper LocalStorage
function getLocal(key, defaultVal) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocal(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error('Error saving to LocalStorage', err);
  }
}

// Token Bearer JWT Management
export function getAuthToken() {
  return localStorage.getItem(LOCAL_STORAGE_KEY_TOKEN) || null;
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(LOCAL_STORAGE_KEY_TOKEN, token);
  } else {
    localStorage.removeItem(LOCAL_STORAGE_KEY_TOKEN);
  }
}

/**
 * Universal API Fetcher dengan Auth Header & JSON Parsing
 */
async function fetchApi(endpoint, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getAuthToken();

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Jika body bukan FormData, set default Content-Type JSON
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    throw new Error('API server tidak mengembalikan respon JSON (kemungkinan server belum terpasang atau PHP tidak aktif)');
  }

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'Permintaan gagal diproses oleh server');
  }

  return json;
}

// ----------------- PRODUK -----------------

/**
 * Mengambil daftar produk dari MySQL Hostinger (fallback ke LocalStorage)
 */
export async function getProducts() {
  try {
    const data = await fetchApi('/products.php');
    if (Array.isArray(data) && data.length > 0) {
      setLocal(LOCAL_STORAGE_KEY_PRODUCTS, data);
      return data;
    }
  } catch (err) {
    console.warn('Gagal memuat produk dari Hostinger MySQL API, menggunakan data cadangan:', err.message);
  }
  return getLocal(LOCAL_STORAGE_KEY_PRODUCTS, initialProducts);
}

/**
 * Menyimpan produk baru atau mengedit produk yang sudah ada
 */
export async function saveProduct(productData, imageFile = null) {
  let imageUrl = productData.image_url || '/portfolio/porto-1.jpeg';

  // 1. Jika ada upload foto baru, kirim ke endpoint upload.php
  if (imageFile) {
    try {
      const formData = new FormData();
      formData.append('file', imageFile);

      const uploadRes = await fetchApi('/upload.php', {
        method: 'POST',
        body: formData
      });

      if (uploadRes && uploadRes.image_url) {
        imageUrl = uploadRes.image_url;
      }
    } catch (uploadErr) {
      console.warn('Gagal upload gambar ke Hostinger Storage:', uploadErr.message);
    }
  }

  const payload = {
    ...productData,
    image_url: imageUrl,
    category_id: productData.category_id ? Number(productData.category_id) : null,
    is_featured: Boolean(productData.is_featured),
    is_active: productData.is_active !== undefined ? Boolean(productData.is_active) : true
  };

  // 2. Simpan data produk ke MySQL API
  try {
    const isEdit = Boolean(productData.id && !String(productData.id).startsWith('temp_'));
    const endpoint = isEdit ? `/products.php?id=${productData.id}` : '/products.php';
    const method = isEdit ? 'PUT' : 'POST';

    const saved = await fetchApi(endpoint, {
      method,
      body: JSON.stringify(payload)
    });

    // Perbarui cache lokal
    const current = getLocal(LOCAL_STORAGE_KEY_PRODUCTS, initialProducts);
    const updated = isEdit
      ? current.map(p => (String(p.id) === String(saved.id) ? saved : p))
      : [saved, ...current];
    setLocal(LOCAL_STORAGE_KEY_PRODUCTS, updated);

    return saved;
  } catch (apiErr) {
    console.warn('Gagal menyimpan ke MySQL API, menyimpan ke cadangan LocalStorage:', apiErr.message);

    // Fallback LocalStorage Mode
    const current = getLocal(LOCAL_STORAGE_KEY_PRODUCTS, initialProducts);
    if (productData.id) {
      const updated = current.map(p =>
        String(p.id) === String(productData.id) ? { ...p, ...payload, image_url: imageUrl } : p
      );
      setLocal(LOCAL_STORAGE_KEY_PRODUCTS, updated);
      return { ...payload, image_url: imageUrl };
    } else {
      const newProduct = {
        ...payload,
        id: Date.now(),
        slug: payload.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        image_url: imageUrl,
        created_at: new Date().toISOString()
      };
      const updated = [newProduct, ...current];
      setLocal(LOCAL_STORAGE_KEY_PRODUCTS, updated);
      return newProduct;
    }
  }
}

/**
 * Menghapus produk berdasarkan ID
 */
export async function deleteProduct(productId) {
  try {
    await fetchApi(`/products.php?id=${productId}`, {
      method: 'DELETE'
    });
  } catch (err) {
    console.warn('Gagal menghapus via API:', err.message);
  }

  // Hapus dari cache lokal
  const current = getLocal(LOCAL_STORAGE_KEY_PRODUCTS, initialProducts);
  const updated = current.filter(p => String(p.id) !== String(productId));
  setLocal(LOCAL_STORAGE_KEY_PRODUCTS, updated);
  return true;
}

// ----------------- KATEGORI -----------------

/**
 * Mengambil daftar kategori
 */
export async function getCategories() {
  try {
    const data = await fetchApi('/categories.php');
    if (Array.isArray(data) && data.length > 0) {
      setLocal(LOCAL_STORAGE_KEY_CATEGORIES, data);
      return data;
    }
  } catch (err) {
    console.warn('Gagal memuat kategori dari API, menggunakan data cadangan:', err.message);
  }
  return getLocal(LOCAL_STORAGE_KEY_CATEGORIES, initialCategories);
}

// ----------------- PENGATURAN & KONTAK -----------------

/**
 * Mengambil konfigurasi nomor WhatsApp dan profil web
 */
export async function getSettings() {
  try {
    const data = await fetchApi('/settings.php');
    if (data && typeof data === 'object') {
      const merged = { ...initialSettings, ...data };
      setLocal(LOCAL_STORAGE_KEY_SETTINGS, merged);
      return merged;
    }
  } catch (err) {
    console.warn('Gagal memuat pengaturan dari API, menggunakan data cadangan:', err.message);
  }
  return getLocal(LOCAL_STORAGE_KEY_SETTINGS, initialSettings);
}

/**
 * Memperbarui pengaturan web
 */
export async function saveSettings(settingsData) {
  try {
    await fetchApi('/settings.php', {
      method: 'POST',
      body: JSON.stringify(settingsData)
    });
  } catch (err) {
    console.warn('Gagal menyimpan pengaturan ke API:', err.message);
  }

  setLocal(LOCAL_STORAGE_KEY_SETTINGS, settingsData);
  return settingsData;
}

// ----------------- AUTH ADMIN -----------------

/**
 * Login admin menggunakan email & password
 */
export async function adminLogin(email, password) {
  try {
    const res = await fetchApi('/auth.php?action=login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (res.token) {
      setAuthToken(res.token);
      setLocal(LOCAL_STORAGE_KEY_AUTH, res.user);
      return res.user;
    }
  } catch (err) {
    // Jika server offline / mode demo lokal
    if (email === 'admin@sekaos.com' && password === 'admin123') {
      const mockUser = { email, role: 'admin', full_name: 'Administrator Sekaos (Offline Mode)' };
      setAuthToken('demo_mock_token_local');
      setLocal(LOCAL_STORAGE_KEY_AUTH, mockUser);
      return mockUser;
    }
    throw new Error(err.message || 'Email atau password salah');
  }

  throw new Error('Gagal melakukan autentikasi admin');
}

/**
 * Memeriksa status sesi login admin yang aktif
 */
export async function getAdminSession() {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetchApi('/auth.php?action=session');
    if (res && res.authenticated) {
      setLocal(LOCAL_STORAGE_KEY_AUTH, res.user);
      return res.user;
    }
  } catch {
    // Jika offline tapi ada token tersimpan
    const localUser = getLocal(LOCAL_STORAGE_KEY_AUTH, null);
    if (localUser) return localUser;
  }

  return null;
}

/**
 * Logout admin
 */
export async function adminLogout() {
  try {
    await fetchApi('/auth.php?action=logout', { method: 'POST' });
  } catch {
    // Abaikan jika offline
  }
  setAuthToken(null);
  localStorage.removeItem(LOCAL_STORAGE_KEY_AUTH);
}

// ----------------- GENERATOR LINK WHATSAPP -----------------

/**
 * Membuat link klik chat WhatsApp langsung ke Admin dengan pesan template
 */
export function generateWhatsAppLink(productName = '', settings = initialSettings) {
  const number = (settings.whatsapp_number || '6289671830693').replace(/[^0-9]/g, '');
  let message =
    settings.whatsapp_template ||
    'Halo Admin Sekaos Project, saya tertarik dengan produk {product_name}. Bisa konsultasi bahan dan harganya?';

  if (productName) {
    message = message.replace('{product_name}', productName);
  } else {
    message = 'Halo Admin Sekaos Project, saya ingin konsultasi pembuatan pakaian custom untuk event/organisasi kami.';
  }

  return `https://api.whatsapp.com/send?phone=${number}&text=${encodeURIComponent(message)}`;
}
