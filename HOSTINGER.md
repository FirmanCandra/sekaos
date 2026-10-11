# HOSTINGER.md - Panduan & Konfigurasi Deployment Hostinger

Dokumen ini berisi spesifikasi server, kredensial akses, arsitektur hosting, panduan database MySQL, dan instruksi deployment untuk website **Sekaos Project** di Hostinger.

---

## 1. Informasi Akses Server & Database

| Parameter | Nilai Konfigurasi |
| :--- | :--- |
| **Domain Aktif** | [snow-sparrow-521382.hostingersite.com](https://snow-sparrow-521382.hostingersite.com/) |
| **SSH Host** | `46.202.186.254` |
| **SSH Port** | `65002` |
| **SSH Username** | `u267893077` |
| **SSH Password** | `Setiket*06` |
| **Target Directory** | `domains/snow-sparrow-521382.hostingersite.com/public_html` |
| **Backend & API** | Native PHP 8.x REST API (`public/api/`) |
| **Database Server** | MySQL / MariaDB Hostinger (`localhost:3306`) |
| **Database Name & User** | `u267893077_sekaos` |
| **Database Password** | `Sekaos*06` |
| **Storage Uploads** | Hostinger Storage (`public_html/uploads/`) |
| **Schema SQL** | [mysql-schema.sql](file:///c:/SMT%207/Sekaos/mysql-schema.sql) |

---

## 2. Arsitektur Baru: Native PHP + MySQL Hostinger (Tanpa Supabase)

Untuk mengatasi masalah Supabase Free Tier yang sering *mati/auto-pause* setelah 7 hari tidak ada traffic, website ini telah dimigrasikan menggunakan database **MySQL bawaan Hostinger**:

1. **Frontend**: React 19 + Vite (dikompilasi ke file HTML/JS/CSS statis di folder `dist/`).
2. **Backend API**: Folder `api/` (PHP 8 + PDO) yang langsung dijalankan oleh web server LiteSpeed/Apache Hostinger:
   - `api/products.php` (CRUD Produk & Katalog)
   - `api/categories.php` (CRUD Kategori)
   - `api/settings.php` (Kontak WhatsApp, Instagram, Alamat)
   - `api/auth.php` (Login Admin dengan Token JWT)
   - `api/upload.php` (Upload foto produk langsung ke folder `uploads/` di hosting)
3. **Database**: MySQL/MariaDB yang aktif 24/7 tanpa batas waktu dan tanpa sistem auto-pause.

---

## 3. Panduan Setup Database MySQL di Hostinger hPanel

Ikuti 3 langkah mudah berikut di dashboard hPanel Hostinger:

### Langkah 1: Buat Database MySQL di hPanel
1. Masuk ke [hPanel Hostinger](https://hpanel.hostinger.com/).
2. Pada menu samping kiri, klik **Database** &rarr; **Kelola database**.
3. Buat database baru:
   - **Nama Database**: misal `u267893077_sekaos`
   - **Username**: misal `u267893077_admin`
   - **Password**: masukkan password yang kuat (misal `Sekaos*06`)
4. Klik **Buat**.

### Langkah 2: Impor Tabel & Data Awal via phpMyAdmin
1. Di halaman daftar database hPanel, klik tombol **phpMyAdmin** di sebelah database yang baru dibuat.
2. Di dalam phpMyAdmin, klik tab **Import** di menu atas.
3. Klik **Choose File** / **Pilih File**, lalu pilih file [mysql-schema.sql](file:///c:/SMT%207/Sekaos/mysql-schema.sql) dari komputer Anda.
4. Gulir ke bawah dan klik tombol **Go** / **Kirim**.
5. *Selesai! Seluruh tabel (`products`, `categories`, `settings`, `admin_users`) beserta data katalog awal otomatis terisi.*

### Langkah 3: Konfigurasi Kredensial di `public/api/config.php`
Buka file `public/api/config.php` dan sesuaikan nama DB, user, dan password:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'u267893077_sekaos'); // nama database di hPanel
define('DB_USER', 'u267893077_sekaos'); // user database di hPanel
define('DB_PASS', 'Sekaos*06');          // password database Hostinger
```

> **Akun Login Admin Default:**
> - **Email**: `admin@sekaos.com`
> - **Password**: `admin123`

---

## 4. Cara Melakukan Deployment ke Hostinger

### Metode 1: One-Command Deploy (via SFTP Deployer)
Cukup jalankan satu perintah:

```bash
npm run deploy
```

**Alur Kerja Skrip Ini:**
1. Otomatis menjalankan `npm run build` untuk mem-bundle aplikasi React + API PHP ke folder `dist/`.
2. Menghubungkan ke SSH/SFTP Hostinger (`46.202.186.254:65002`).
3. Mengunggah semua file hasil build (termasuk folder `api/`, `uploads/`, dan `.htaccess`) ke `public_html` Hostinger.
4. Melakukan verifikasi HTTP status 200 OK di domain live.

### Metode 2: Deployment via Git / hPanel File Manager
Jika Anda mengunggah manual atau via Git di hPanel:
- Pastikan isi dari folder **`dist/`** diletakkan di dalam folder `public_html`.
- Jangan meletakkan raw code JSX (`src/`, `package.json`) langsung di `public_html`.

---

## 5. Konfigurasi Routing SPA & Proteksi API (`.htaccess`)

File `public_html/.htaccess` telah dikonfigurasi otomatis untuk:
1. Menangani routing SPA (`/admin`, `/login`, `/katalog`).
2. Mengizinkan eksekusi skrip PHP di `/api/`.
3. Memproteksi file sensitif seperti `config.php` dan file `.sql` agar tidak dapat diunduh publik.
4. Mengamankan folder `uploads/` agar tidak mengeksekusi file PHP berbahaya.
