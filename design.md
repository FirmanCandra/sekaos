# Design Specification & System Architecture
## Proyek: Rekonstruksi & Pengembangan Website Sekaos Project

---

| Metadata | Rincian |
| :--- | :--- |
| **Proyek** | Sekaos Project (Landing Page, Dynamic Catalog, Admin Panel) |
| **Target Platform** | Hostinger Premium Web Hosting (`public_html` / Static React Export) |
| **Tech Stack** | **Frontend**: React (Vite) + Vanilla/Modern CSS<br>**Backend / BaaS**: Supabase (PostgreSQL, Storage CDN, Auth)<br>**Hosting Server**: LiteSpeed Hostinger (Static CDN Mode, 0% Server Load) |
| **Dokumen Terkait** | [PRD.md](file:///c:/SMT%207/Sekaos/PRD.md) |
| **Status Dokumen** | **Disetujui / Selesai Di-Setup** |
| **Terakhir Diperbarui** | 3 Oktober 2026 |

---

## 1. Analisis Lingkungan Hosting (Hostinger + Supabase Ecosystem)

Berdasarkan analisis kebutuhan akun Hostinger klien (menampung 3 website sekaligus dalam 1 paket Premium Shared Hosting):
- **Beban di Hostinger**: **0% (Zero Server/DB Load)**. Hostinger hanya bertindak sebagai *Static File Server* yang menyajikan bundle `dist/` (`index.html`, file bundle JS, CSS, video bumper, dan aset gambar). Tidak ada proses runtime Node.js atau MySQL yang membebani kuota RAM/disk shared hosting Anda.
- **Supabase Cloud (BaaS)**:
  - **Database PostgreSQL**: 500 MB (katalog pakaian konveksi hanya memerlukan ~2-5 MB).
  - **Storage Bucket (`product-images`)**: 1 GB gratis untuk menyimpan foto produk konveksi dengan CDN global cepat.
  - **Supabase Auth**: Autentikasi email & password bawaan untuk Admin Dashboard.
  - **Row Level Security (RLS)**: Publik hanya dapat membaca (`SELECT`) data aktif, sedangkan penambahan/perubahan/penghapusan (`INSERT`, `UPDATE`, `DELETE`) dan upload foto hanya dapat dilakukan oleh Admin yang terautentikasi.
- **Fallback Mock Storage**: Tersedia mode demo otomatis jika kredensial `.env` Supabase belum diisi, sehingga web dan panel admin tetap dapat langsung dijalankan dan diuji.

---

## 2. Arsitektur Folder Proyek (React + Vite + Supabase)

```text
c:\SMT 7\Sekaos\
├── .env                        # Kredensial Supabase lokal (VITE_SUPABASE_URL, ANON_KEY)
├── .env.example                # Template konfigurasi environment
├── supabase-schema.sql         # Skrip SQL lengkap untuk tabel, RLS, Storage & Seed data
├── vite.config.js              # Konfigurasi bundler Vite
├── package.json                # Dependensi proyek (React, Supabase JS, Lucide)
├── index.html                  # HTML entry point dengan SEO & OpenGraph meta tags
├── public/                     # Aset publik statis
│   ├── .htaccess               # Rule rewrite SPA untuk Apache/LiteSpeed Hostinger
│   ├── logo.jpeg               # Logo resmi Sekaos Project
│   ├── hero_bg.png             # Background hero original
│   ├── buatkan_vidio_bumper_yang_kere.mp4 # Video bumper resmi Sekaos
│   └── portfolio/              # 9 foto portofolio asli (porto-1 s/d porto-9)
├── src/
│   ├── main.jsx                # React root mount
│   ├── App.jsx                 # Komponen utama yang merangkum Landing Page & Admin
│   ├── index.css               # Styling terpadu (Netlify original + catalog + admin)
│   ├── lib/
│   │   └── supabase.js         # Inisialisasi Supabase Client & fallback handler
│   ├── data/
│   │   └── initialData.js      # Mock seed data produk, kategori, dan pengaturan
│   ├── services/
│   │   └── dataService.js      # Abstraksi CRUD produk, upload gambar, dan session auth
│   └── components/
│       ├── Navbar.jsx          # Header navigasi responsif & logo
│       ├── Hero.jsx            # Hero section dengan zoom animasi & WA CTA
│       ├── VideoBumper.jsx     # Video bumper player resmi
│       ├── ServicesSection.jsx # 10 Card layanan spesialis konveksi
│       ├── CatalogSection.jsx  # Etalase katalog produk (filter pill + live search)
│       ├── ProductModal.jsx    # Pop-up detail spesifikasi & pesan via WhatsApp
│       ├── AdvantagesSection.jsx # 6 Keunggulan Sekaos Project
│       ├── PortfolioSection.jsx # Grid 9 foto portofolio + lightbox preview
│       ├── ContactSection.jsx  # Closing statement & CTA tombol WA / Instagram
│       ├── MapSection.jsx      # Google Maps embed & overlay button
│       ├── Footer.jsx          # Footer & link admin portal
│       └── AdminDashboard.jsx  # Panel admin lengkap (stats, CRUD produk, settings)
└── dist/                       # Output build siap di-upload ke public_html Hostinger
```

---

## 3. Skema Basis Data (Database Design & ERD)

### 3.1 Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    ADMINS ||--o{ PRODUCTS : "creates/updates"
    CATEGORIES ||--o{ PRODUCTS : "categorizes"
    PRODUCTS ||--|{ PRODUCT_IMAGES : "has many"
    SETTINGS {
        int id PK
        string setting_key UK
        text setting_value
        datetime updated_at
    }
    ADMINS {
        int id PK
        string username UK
        string email UK
        string password_hash
        string full_name
        datetime last_login
        datetime created_at
    }
    CATEGORIES {
        int id PK
        string name
        string slug UK
        string icon_class
        int sort_order
        boolean is_active
        datetime created_at
    }
    PRODUCTS {
        int id PK
        int category_id FK
        string name
        string slug UK
        text description
        string material_specs
        string min_order
        string price_estimate
        boolean is_featured
        boolean is_active
        int views_count
        datetime created_at
        datetime updated_at
    }
    PRODUCT_IMAGES {
        int id PK
        int product_id FK
        string image_path
        boolean is_primary
        int sort_order
        datetime created_at
    }
```

### 3.2 Data Dictionary (Spesifikasi Tabel)

#### Tabel 1: `admins`
Menyimpan kredensial operator admin dashboard.
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | INT AUTO_INCREMENT PRIMARY KEY | Identitas unik admin |
| `username` | VARCHAR(50) NOT NULL UNIQUE | Username login (misal: `adminsekaos`) |
| `email` | VARCHAR(100) NOT NULL UNIQUE | Email pemulihan |
| `password_hash` | VARCHAR(255) NOT NULL | Hash password menggunakan `PASSWORD_BCRYPT` |
| `full_name` | VARCHAR(100) NOT NULL | Nama lengkap admin / pengelola |
| `last_login` | DATETIME NULL | Waktu login terakhir |
| `created_at` | DATETIME DEFAULT CURRENT_TIMESTAMP | Waktu akun dibuat |

#### Tabel 2: `categories`
Menyimpan kategori pakaian konveksi.
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | INT AUTO_INCREMENT PRIMARY KEY | ID kategori |
| `name` | VARCHAR(100) NOT NULL | Nama kategori (contoh: "Rompi & Vest", "PDH & Kemeja") |
| `slug` | VARCHAR(100) NOT NULL UNIQUE | URL slug SEO (`rompi-vest`, `pdh-kemeja`) |
| `icon_class` | VARCHAR(50) DEFAULT 'fas fa-tshirt' | Icon FontAwesome pendukung |
| `sort_order` | INT DEFAULT 0 | Urutan tampilan pada tab filter |
| `is_active` | TINYINT(1) DEFAULT 1 | 1 = Aktif, 0 = Nonaktif |
| `created_at` | DATETIME DEFAULT CURRENT_TIMESTAMP | Tanggal pembuatan |

#### Tabel 3: `products`
Menyimpan entitas barang/produk display konveksi.
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | INT AUTO_INCREMENT PRIMARY KEY | ID produk |
| `category_id` | INT NOT NULL | Foreign key relasi ke `categories.id` |
| `name` | VARCHAR(200) NOT NULL | Nama produk (misal: "Rompi Tactical Lapangan 4 Saku") |
| `slug` | VARCHAR(220) NOT NULL UNIQUE | Slug URL ramah SEO |
| `description` | TEXT NULL | Deskripsi lengkap, detail jahitan, dan keunggulan |
| `material_specs` | VARCHAR(255) NULL | Ringkasan bahan (misal: "Ripstop Drill / Parasut WP") |
| `min_order` | VARCHAR(50) DEFAULT '12 pcs' | Minimal pemesanan (opsional teks bebas) |
| `price_estimate` | VARCHAR(100) NULL | Estimasi harga / label "Hubungi CS untuk Penawaran" |
| `is_featured` | TINYINT(1) DEFAULT 0 | 1 = Tampil di Landing Page depan, 0 = Hanya di katalog |
| `is_active` | TINYINT(1) DEFAULT 1 | 1 = Dipublikasikan, 0 = Draft |
| `views_count` | INT DEFAULT 0 | Metrik jumlah klik / penayangan produk |
| `created_at` | DATETIME DEFAULT CURRENT_TIMESTAMP | Waktu input produk |
| `updated_at` | DATETIME ON UPDATE CURRENT_TIMESTAMP | Waktu modifikasi terakhir |

#### Tabel 4: `product_images`
Menyimpan galeri foto produk (1 produk bisa memiliki beberapa foto sudut pandang).
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | INT AUTO_INCREMENT PRIMARY KEY | ID foto |
| `product_id` | INT NOT NULL (FK ON DELETE CASCADE) | ID produk pemilik foto |
| `image_path` | VARCHAR(255) NOT NULL | Path relatif file foto (misal: `assets/uploads/rompi-1.webp`) |
| `is_primary` | TINYINT(1) DEFAULT 0 | 1 = Foto utama (thumbnail), 0 = Galeri pelengkap |
| `sort_order` | INT DEFAULT 0 | Urutan tampil foto di galeri |
| `created_at` | DATETIME DEFAULT CURRENT_TIMESTAMP | Tanggal upload |

#### Tabel 5: `settings`
Menyimpan pengaturan konfigurasi dinamis website.
| Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | INT AUTO_INCREMENT PRIMARY KEY | ID konfigurasi |
| `setting_key` | VARCHAR(50) NOT NULL UNIQUE | Kunci identifikasi (contoh: `whatsapp_number`) |
| `setting_value` | TEXT NOT NULL | Nilai konfigurasi |
| `updated_at` | DATETIME ON UPDATE CURRENT_TIMESTAMP | Tanggal update |

*Data Awal `settings`:*
- `whatsapp_number`: `6289671830693`
- `whatsapp_template`: `Halo Admin Sekaos Project, saya ingin konsultasi pemesanan custom produk: {product_name}. Bisa minta detail bahan dan estimasi harganya?`
- `instagram_username`: `sekaos.project`
- `instagram_url`: `https://instagram.com/sekaos.project`
- `address_city`: `Semarang, Jawa Tengah`
- `maps_url`: `https://maps.app.goo.gl/SPYvU4N9ifpcvq6f9`

---

## 4. Alur Kerja Sistem (System Workflows)

### 4.1 Alur Pengunjung: Eksplorasi Katalog & Tanya via WhatsApp

```mermaid
sequenceDiagram
    autonumber
    actor User as Pengunjung Web
    participant FE as Halaman Web / Katalog
    participant API as Backend / Database
    participant WA as WhatsApp Official CS

    User->>FE: Buka website Sekaos (Homepage / Katalog)
    FE->>API: Query Produk Terkini (Filtered / All)
    API-->>FE: Return Data Produk & Foto Thumbnail
    FE-->>User: Tampilkan Grid Card Produk
    User->>FE: Klik Salah Satu Produk (misal: PDH Drill)
    FE-->>User: Tampilkan Modal Detail Produk & Spesifikasi Bahan
    User->>FE: Klik Tombol "Konsultasi via WhatsApp"
    FE->>FE: Format Link WA dengan Parameter Template Pesan
    FE-->>WA: Redirect ke WhatsApp App/Web dengan Pesan Pre-filled
    Note over User,WA: Transaksi konsultasi dilanjutkan via obrolan resmi WhatsApp
```

### 4.2 Alur Admin: Manajemen Produk & Unggah Gambar

```mermaid
flowchart TD
    A[Mulai] --> B[Akses /admin/login]
    B --> C{Kredensial Valid?}
    C -- Tidak --> D[Tampilkan Pesan Error & Catat Attempt]
    D --> B
    C -- Ya --> E[Set Session Admin & Regenerate ID]
    E --> F[Dashboard Utama Admin]
    F --> G[Klik 'Tambah Produk Baru']
    G --> H[Isi Form: Nama, Kategori, Deskripsi, Spesifikasi Bahan]
    H --> I[Pilih File Gambar JPG/PNG]
    I --> J{Validasi Gambar di Server}
    J -- Gagal Format/Ukuran > 5MB --> K[Tolak & Munculkan Notifikasi]
    K --> I
    J -- Berhasil --> L[Konversi ke WebP & Simpan ke /assets/uploads/]
    L --> M[Insert Record ke Database `products` & `product_images`]
    M --> N[Tampilkan Notifikasi Berhasil]
    N --> O[Katalog Publik Terupdate Otomatis!]
```

---

## 5. Desain UI/UX & Design Tokens

### 5.1 Design Tokens (Palet Warna & Tipografi)

```css
:root {
    /* Brand Colors (Presisi dari Web Netlify Asli) */
    --primary-color: #1A365D;        /* Navy Blue Khas Sekaos */
    --primary-dark: #0F2547;         /* Navy Lebih Gelap untuk Hover/Header */
    --primary-light: #2A4E7E;        /* Navy Aksen Terang */
    --secondary-color: #1A1A1A;      /* Charcoal Black untuk Heading & Footer */
    --accent-blue: #38BDF8;          /* Sky Blue (Aksen Divider Bumper) */
    
    /* Functional Colors */
    --whatsapp-color: #25D366;       /* WhatsApp Brand Green */
    --whatsapp-hover: #1EBE5A;
    --instagram-grad: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
    --badge-featured: #f59e0b;       /* Amber Gold untuk Produk Unggulan */
    --status-draft: #ef4444;         /* Red */
    
    /* Neutrals & Surfaces */
    --bg-light: #F8F9FA;             /* Abu-abu terang background */
    --bg-white: #FFFFFF;
    --text-color: #333333;           /* Charcoal Text Body */
    --text-light: #666666;
    --border-color: #E2E8F0;
    
    /* Shadows & Border Radius */
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 20px;
    --radius-pill: 50px;
    --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.06);
    --shadow-hover: 0 12px 30px rgba(26, 54, 93, 0.15);
    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 5.2 Desain Komponen Publik Baru

#### A. Pill Filter Kategori & Search Bar
- **Search Bar**: Input pencarian melayang dengan ikon pencarian `fas fa-search`, debounce 300ms untuk memfilter produk tanpa reload.
- **Kategori Tabs**: Tombol berbentuk pil dengan status `active` bernuansa Navy Blue bergradasi, memudahkan pengunjung smartphone memilih kategori produk dengan satu sentuhan ibu jari.

#### B. Product Card Component
- **Badge Kategori**: Melayang di pojok kiri atas card.
- **Badge "Populer / Unggulan"**: Jika `is_featured = 1`, menampilkan bintang emas.
- **Thumbnail Image**: Rasio 4:3 dengan efek hover zoom halus (`transform: scale(1.05)`).
- **Info Singkat**:
  - Judul Produk (Bold, max 2 baris).
  - Spesifikasi Bahan (misal: `<i class="fas fa-layer-group"></i> Nagata Drill`).
  - Minimum Order (misal: `<i class="fas fa-boxes"></i> Min. 12 pcs`).
- **Tombol WhatsApp**: Tombol lebar hijau khas WhatsApp berbunyi:  
  **`[ <i class="fab fa-whatsapp"></i> Tanya Produk Ini ]`**

#### C. Modal Detail Produk
- Menampilkan galeri foto dengan navigasi thumbnail.
- Deskripsi lengkap mengenai opsi bordir komputer, variasi sablon DTF/Plastisol, jenis kancing, dan ukuran.
- Tombol Aksi Utama: "Konsultasi WhatsApp Sekarang" dengan auto-direct.

### 5.3 Desain Antarmuka Admin Dashboard

Admin Dashboard dirancang dengan estetika modern bergaya SaaS:
- **Sidebar Kiri**:
  - Logo Sekaos Project dengan indikator `Admin Panel`.
  - Menu Navigasi:
    - `Dashboard` (`fas fa-tachometer-alt`)
    - `Katalog Produk` (`fas fa-box-open`)
    - `Kategori` (`fas fa-tags`)
    - `Pengaturan Web` (`fas fa-cog`)
    - `Lihat Website Publik` (`fas fa-external-link-alt`)
    - `Keluar / Logout` (`fas fa-sign-out-alt`)
- **Main Content**:
  - Kartu Ringkasan (Cards): Total Produk Aktif, Total Kategori, Produk Unggulan.
  - Tabel Produk: Dilengkapi thumbnail foto, nama produk, kategori badge, switch toggle aktif/nonaktif, dan tombol aksi (Edit, Hapus dengan konfirmasi modal).
  - Form Input: Dilengkapi fitur **Drag & Drop Image Upload** dan **Live Image Preview**.

---

## 6. Strategi Ekstraksi & Penyelamatan Aset (Scraping Blueprint)

Seluruh aset akan diambil langsung dari URL Netlify asli (`https://sekaosproject.netlify.app/`) dan disimpan di folder lokal:

| Asset Name | Tipe | URL Sumber Netlify | Tujuan Path Lokal |
| :--- | :--- | :--- | :--- |
| **Logo Sekaos** | Gambar JPEG | `https://sekaosproject.netlify.app/WhatsApp Image 2026-06-26 at 22.17.51.jpeg` | `assets/images/logo.jpeg` |
| **Hero Background** | Gambar PNG | `https://sekaosproject.netlify.app/hero_bg.png` | `assets/images/hero_bg.png` |
| **Video Bumper** | Video MP4 | `https://sekaosproject.netlify.app/buatkan_vidio_bumper_yang_kere.mp4` | `assets/videos/bumper.mp4` |
| **Portofolio 1 - 9** | Gambar JPEG | `https://sekaosproject.netlify.app/WhatsApp Image 2026-06-26 at 22.17.59 (1).jpeg` s/d `...01.jpeg` | `assets/images/portfolio/porto-1.jpg` s/d `porto-9.jpg` |
| **CSS Stylesheet** | CSS | `https://sekaosproject.netlify.app/style.css` | `assets/css/style.css` |

---

## 7. Arsitektur Keamanan & Proteksi Hostinger

1. **Proteksi Folder Unggahan (`assets/uploads/.htaccess`)**:
   Mencegah penyerang mengunggah file PHP berbahaya ke dalam folder gambar publik:
   ```apache
   # Matikan eksekusi script PHP di direktori uploads
   <FilesMatch "\.(php|phtml|php3|php4|php5|php7|phps)$">
       Order Deny,Allow
       Deny from all
   </FilesMatch>
   Options -Indexes -ExecCGI
   ```
2. **Session Hardening**:
   ```php
   ini_set('session.cookie_httponly', 1);
   ini_set('session.use_only_cookies', 1);
   ini_set('session.cookie_samesite', 'Strict');
   if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
       ini_set('session.cookie_secure', 1);
   }
   ```
3. **Database Security (PDO Prepared Statements)**:
   Semua query SELECT, INSERT, UPDATE, DELETE menggunakan binding parameter untuk menjamin kekebalan terhadap serangan SQL Injection.
4. **Validasi File Unggah**:
   - Pengecekan ekstensi: Hanya mengizinkan `.jpg`, `.jpeg`, `.png`, `.webp`.
   - Validasi MIME-type riil dengan `finfo_file()`.
   - Re-encode gambar dan konversi otomatis menjadi format `.webp` yang bersih dari metadata EXIF/script berbahaya.

---

## 8. Panduan Siap-Deploy ke Hostinger (Hostinger Deployment Guide)

1. **Konfigurasi Git Deployment di Hostinger hPanel**:
   - Buka menu **Git** di hPanel Hostinger.
   - Sambungkan dengan repositori GitHub/GitLab proyek.
   - Set cabang (Branch): `main` atau `hosting`.
   - Set direktori root instalasi: `/public_html`.
2. **Setup Database**:
   - Buka menu **Database MySQL** di hPanel, buat database baru (misal: `u123456_sekaos`) beserta usernya.
   - Buka **phpMyAdmin**, import file `database/schema.sql` dan `database/seeders.sql`.
   - Sesuaikan kredensial di file `config/database.php`.
3. **Selesai**: Website langsung tayang dan dapat diperbarui secara berkelanjutan via `git push`.
