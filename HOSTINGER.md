# HOSTINGER.md - Panduan & Konfigurasi Deployment Hostinger

Dokumen ini berisi spesifikasi server, kredensial akses, arsitektur hosting, dan instruksi deployment untuk website **Sekaos Project** di Hostinger.

---

## 1. Informasi Akses Server & Database

| Parameter | Nilai Konfigurasi |
| :--- | :--- |
| **Domain Aktif** | [snow-sparrow-521382.hostingersite.com](https://snow-sparrow-521382.hostingersite.com/) |
| **SSH Host** | `46.202.186.254` |
| **SSH Port** | `65002` |
| **SSH Username** | `u267893077` |
| **SSH Password** | `Sekaos*06` |
| **Target Directory** | `domains/snow-sparrow-521382.hostingersite.com/public_html` |
| **Database Cloud** | Supabase PostgreSQL (`pirxdqvylczwbwvxnlus.supabase.co`) |
| **Database Password** | `Firman*06` |

---

## 2. Mengapa Tampilan Awal Sempat Blank Putih?

### Penjelasan Teknis:
1. **Perbedaan Mode Development vs Production**:
   - Di lingkungan development lokal, Vite menjalankan server internal yang meng-compile file JSX (`/src/main.jsx`) secara *on-the-fly*.
   - Di server Hostinger (Apache/LiteSpeed), server web hanya dapat menyajikan file JavaScript dan HTML standar yang sudah terkompilasi (*vanilla/bundled*).
2. **Penyebab Layar Putih**:
   - Hostinger Git sebelumnya menarik *raw source code* (`src/`, `package.json`, dan root `index.html`).
   - Browser pengunjung tidak memahami file `.jsx` mentah, sehingga layar menampilkan warna putih kosong (*blank screen*).
3. **Solusi yang Diterapkan**:
   - Direktori `public_html` di Hostinger wajib diisi dengan **hasil kompilasi produksi** dari folder `dist/` (meliputi `index.html` ter-bundle, folder `assets/index-xxx.js` & `index-xxx.css`, aset gambar/video, dan file `.htaccess`).

---

## 3. Cara Melakukan Deployment ke Hostinger

### Metode 1: One-Command Deploy (Sangat Direkomendasikan)
Kami telah membuatkan skrip otomatis `scripts/deploy.py` yang terintegrasi langsung dengan npm. Setiap kali ada perubahan dan Anda ingin meng-update website di Hostinger, cukup jalankan perintah:

```bash
npm run deploy
```

**Alur Kerja Skrip Ini:**
1. Otomatis menjalankan `npm run build` untuk mem-bundle aplikasi React.
2. Otomatis menghubungkan ke SSH/SFTP Hostinger (`46.202.186.254:65002`).
3. Mengunggah semua file hasil build ke direktori `public_html` Hostinger.
4. Melakukan verifikasi HTTP status 200 OK di domain live.

---

### Metode 2: Deployment Otomatis via GitHub Actions (CI/CD)
Setiap kali ada commit yang di-push ke branch **`production`**, GitHub Actions akan memicu workflow `.github/workflows/deploy-production.yml`.

Jika Anda ingin GitHub Actions langsung mentransfer file ke Hostinger, tambahkan Secret berikut di GitHub Repository Settings ([Settings -> Secrets -> Actions](https://github.com/FirmanCandra/sekaos/settings/secrets/actions)):
- `HOSTINGER_SSH_HOST`: `46.202.186.254`
- `HOSTINGER_SSH_PORT`: `65002`
- `HOSTINGER_SSH_USER`: `u267893077`
- `HOSTINGER_SSH_PASS`: `Sekaos*06`

---

## 4. Konfigurasi Routing SPA (`public_html/.htaccess`)

Agar routing `/login`, `/admin`, dan refresh halaman di Hostinger tidak menampilkan error 404, file `.htaccess` berikut wajib selalu berada di root `public_html`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]
  RewriteRule ^ index.html [L]
</IfModule>
```
*(File ini sudah otomatis disertakan setiap kali Anda menjalankan `npm run deploy`).*
