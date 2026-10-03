import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { initialCategories, initialProducts, initialSettings } from '../data/initialData';

const LOCAL_STORAGE_KEY_PRODUCTS = 'sekaos_products';
const LOCAL_STORAGE_KEY_CATEGORIES = 'sekaos_categories';
const LOCAL_STORAGE_KEY_SETTINGS = 'sekaos_settings';
const LOCAL_STORAGE_KEY_AUTH = 'sekaos_mock_auth';

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

// ----------------- PRODUK -----------------
export async function getProducts() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name, slug)')
      .order('id', { ascending: false });

    if (!error && data && data.length > 0) {
      return data;
    }
  }
  return getLocal(LOCAL_STORAGE_KEY_PRODUCTS, initialProducts);
}

export async function saveProduct(productData, imageFile = null) {
  let imageUrl = productData.image_url || '/portfolio/porto-1.jpeg';

  if (isSupabaseConfigured && supabase) {
    // Jika ada file upload baru ke Supabase Storage
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile, { upsert: true });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);
        imageUrl = publicUrlData.publicUrl;
      } else {
        console.error('Upload image error:', uploadError);
      }
    }

    const payload = {
      category_id: productData.category_id,
      name: productData.name,
      slug: productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      description: productData.description,
      material_specs: productData.material_specs,
      min_order: productData.min_order,
      price_estimate: productData.price_estimate || 'Hubungi CS',
      is_featured: Boolean(productData.is_featured),
      is_active: productData.is_active !== undefined ? Boolean(productData.is_active) : true
    };

    if (productData.id && typeof productData.id === 'number') {
      const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', productData.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('products')
        .insert([payload])
        .select()
        .single();
      if (error) throw error;

      if (imageUrl) {
        await supabase.from('product_images').insert([{
          product_id: data.id,
          image_url: imageUrl,
          is_primary: true
        }]);
      }
      return data;
    }
  }

  // Fallback LocalStorage Mode
  const current = getLocal(LOCAL_STORAGE_KEY_PRODUCTS, initialProducts);
  if (productData.id) {
    const updated = current.map(p => (String(p.id) === String(productData.id) ? { ...p, ...productData, image_url: imageUrl } : p));
    setLocal(LOCAL_STORAGE_KEY_PRODUCTS, updated);
    return productData;
  } else {
    const newProduct = {
      ...productData,
      id: String(Date.now()),
      slug: productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      image_url: imageUrl,
      created_at: new Date().toISOString()
    };
    const updated = [newProduct, ...current];
    setLocal(LOCAL_STORAGE_KEY_PRODUCTS, updated);
    return newProduct;
  }
}

export async function deleteProduct(productId) {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
    if (error) throw error;
    return true;
  }

  const current = getLocal(LOCAL_STORAGE_KEY_PRODUCTS, initialProducts);
  const updated = current.filter(p => String(p.id) !== String(productId));
  setLocal(LOCAL_STORAGE_KEY_PRODUCTS, updated);
  return true;
}

// ----------------- KATEGORI -----------------
export async function getCategories() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (!error && data && data.length > 0) {
      return data;
    }
  }
  return getLocal(LOCAL_STORAGE_KEY_CATEGORIES, initialCategories);
}

// ----------------- PENGATURAN & KONTAK -----------------
export async function getSettings() {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('settings')
      .select('*');

    if (!error && data && data.length > 0) {
      const map = {};
      data.forEach(item => {
        map[item.setting_key] = item.setting_value;
      });
      return { ...initialSettings, ...map };
    }
  }
  return getLocal(LOCAL_STORAGE_KEY_SETTINGS, initialSettings);
}

export async function saveSettings(settingsData) {
  if (isSupabaseConfigured && supabase) {
    for (const [key, value] of Object.entries(settingsData)) {
      await supabase
        .from('settings')
        .upsert({ setting_key: key, setting_value: value }, { onConflict: 'setting_key' });
    }
    return settingsData;
  }

  setLocal(LOCAL_STORAGE_KEY_SETTINGS, settingsData);
  return settingsData;
}

// ----------------- AUTH ADMIN -----------------
export async function adminLogin(email, password) {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data.user;
  }

  // Mock Login Mode untuk demonstrasi langsung sebelum mengisi Supabase credentials
  if (email === 'admin@sekaos.com' && password === 'admin123') {
    const mockUser = { email, role: 'admin', full_name: 'Administrator Sekaos' };
    setLocal(LOCAL_STORAGE_KEY_AUTH, mockUser);
    return mockUser;
  }
  throw new Error('Email atau password admin salah (Demo: admin@sekaos.com / admin123)');
}

export async function getAdminSession() {
  if (isSupabaseConfigured && supabase) {
    const { data } = await supabase.auth.getSession();
    return data?.session?.user || null;
  }
  return getLocal(LOCAL_STORAGE_KEY_AUTH, null);
}

export async function adminLogout() {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  }
  localStorage.removeItem(LOCAL_STORAGE_KEY_AUTH);
}

// ----------------- GENERATOR LINK WHATSAPP -----------------
export function generateWhatsAppLink(productName = '', settings = initialSettings) {
  const number = (settings.whatsapp_number || '6289671830693').replace(/[^0-9]/g, '');
  let message = settings.whatsapp_template || 'Halo Admin Sekaos Project, saya tertarik dengan produk {product_name}. Bisa konsultasi bahan dan harganya?';
  
  if (productName) {
    message = message.replace('{product_name}', productName);
  } else {
    message = 'Halo Admin Sekaos Project, saya ingin konsultasi pembuatan pakaian custom untuk event/organisasi kami.';
  }

  return `https://api.whatsapp.com/send?phone=${number}&text=${encodeURIComponent(message)}`;
}
