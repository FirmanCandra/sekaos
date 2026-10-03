# AGENTS.md - Aturan & Panduan AI Agent untuk Sekaos Project

Dokumen ini berisi instruksi wajib dan pedoman perilaku untuk seluruh AI Coding Assistant / Agent yang bekerja pada repositori **Sekaos Project** (`https://github.com/FirmanCandra/sekaos.git`).

---

## 1. Aturan Wajib: Push ke GitHub pada Setiap Pembaruan (Mandatory Push Policy)

> [!IMPORTANT]
> **Setiap kali melakukan pembaruan kode, penambahan fitur, perbaikan bug, atau refactoring, AI Agent WAJIB secara otomatis melakukan commit dan push ke GitHub.**

### Alur Kerja Git yang Wajib Dilakukan:
1. **Verifikasi Build Sebelum Commit**:
   Pastikan kode tidak merusak aplikasi dengan menjalankan:
   ```bash
   npm run build
   ```
2. **Staging & Commit**:
   Gunakan format *Conventional Commits*:
   - `feat(scope): deskripsi fitur baru`
   - `fix(scope): deskripsi perbaikan bug`
   - `refactor(scope): deskripsi pembersihan atau restrukturisasi kode`
   - `docs(scope): pembaruan dokumentasi`
   - `chore(scope): pembaruan dependensi atau konfigurasi`
3. **Push Otomatis**:
   Lakukan push ke remote branch yang aktif (`main` atau `production`):
   ```bash
   git push origin <nama-branch>
   ```

---

## 2. Struktur & Strategi Branch (Branching Strategy)

Repositori ini memiliki 2 cabang utama:

```
[Fitur Baru / Pembaruan] 
         │
         ▼
   ┌───────────┐
   │   main    │ ───► CI Workflow (Build & Quality Check)
   └───────────┘
         │ (Merge / Release)
         ▼
   ┌───────────┐
   │production │ ───► CI/CD Workflow (Build Artifacts & Deploy ke Hostinger)
   └───────────┘
```

1. **Branch `main` (Default / Development Branch)**:
   - Tempat seluruh pengembangan harian dan penambahan fitur dilakukan.
   - Setiap push ke `main` wajib lolos GitHub Actions CI (`ci.yml`).
2. **Branch `production` (Production Release Branch)**:
   - Branch stabil yang siap disajikan ke publik di Hostinger (`public_html`).
   - Kode di-merge dari `main` ke `production`.
   - Setiap push ke `production` wajib memicu pipeline CI/CD lengkap (`deploy-production.yml` / `ci.yml`).

---

## 3. Standar Kualitas & CI/CD Pipeline

- **Zero-Error Build**: Dilarang melakukan push jika `npm run build` menghasilkan error.
- **Sensitivitas Kredensial**: File `.env` TIDAK BOLEH di-push ke GitHub. Hanya template `.env.example` yang boleh di-commit.
- **Aset & Hostinger Optimization**: Seluruh aset di folder `public/` (video, logo, gambar) dan file `public/.htaccess` harus terjaga agar routing SPA di LiteSpeed Hostinger tidak rusak.

---

## 4. Aturan Wajib Deployment Hostinger (Hostinger Deployment Rule)

> [!CAUTION]
> **DILARANG meletakkan raw source code JSX (`src/`, `package.json`, root `index.html`) langsung ke `public_html` Hostinger.** Web server Apache/LiteSpeed di shared hosting Hostinger tidak menjalankan Node.js dev server, sehingga raw JSX akan menyebabkan tampilan *blank putih* bagi pengunjung.

### Prosedur Deployment:
1. Pastikan seluruh perubahan kode telah di-build: `npm run build`.
2. Untuk men-deploy pembaruan ke server live Hostinger, jalankan perintah otomatis:
   ```bash
   npm run deploy
   ```
3. Skrip ini secara otomatis mem-build bundle teroptimasi dan mengunggah isi folder `dist/` ke direktori target: `domains/snow-sparrow-521382.hostingersite.com/public_html` via SFTP SSH (`46.202.186.254:65002`).
4. Verifikasi selalu status HTTP 200 pada domain [snow-sparrow-521382.hostingersite.com](https://snow-sparrow-521382.hostingersite.com/).

